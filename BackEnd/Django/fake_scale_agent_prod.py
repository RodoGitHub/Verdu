import websocket
import time
import json
import random
import argparse
import sys
import serial
import threading

# PROTOCOLO BALANZA (Constantes Hexadecimales)
ENQ = b'\x05'  # Solicitud de peso
ACK = b'\x06'  # Aceptación (Acknowledge)
NACK = b'\x15' # Rechazo (Negative Acknowledge)
STX = b'\x02'  # Inicio de texto
ETX = b'\x03'  # Fin de texto
WACK = b'\x11' # Espera

# CONFIGURACIÓN POR DEFECTO
DEFAULT_DEVICE = "CAJA_2"
DEFAULT_SERVER = "ws://127.0.0.1:8000"
DEFAULT_PORT = "/dev/ttyUSB0"
DEFAULT_BAUD = 9600

# Variable global para argumentos
args = None

def calculate_checksum(frame):
    """
    Calcula el CRC según el manual: STX XOR Dato1 ... XOR Daton XOR ETX
    frame: debe incluir STX y terminar en ETX
    """
    xor = 0
    for byte in frame:
        xor ^= byte
    return xor

def on_message(ws, message):
    print(f"Server response: {message}")

def on_error(ws, error):
    print(f"Error WS: {error}")

def on_close(ws, close_status_code, close_msg):
    print("### Conexión WS Cerrada ###")

def on_open(ws):
    print("### Conectado al Servidor Central (WS) ###")
    
    def run():
        ser = None
        while True:
            try:
                # 1. GESTIÓN DE CONEXIÓN SERIAL
                if ser is None or not ser.is_open:
                    try:
                        print(f"Intentando conectar a {args.port}...")
                        ser = serial.Serial(args.port, args.baud, timeout=0.2)
                        print("Puerto serial abierto exitosamente.")
                        # Limpiar buffers
                        ser.reset_input_buffer()
                        ser.reset_output_buffer()
                    except serial.SerialException as e:
                        print(f"Esperando dispositivo {args.port}... ({e})")
                        time.sleep(2)
                        continue

                # 2. PROTOCOLO DE COMUNICACIÓN
                # Enviar ENQ
                ser.write(ENQ)
                
                # Leer respuesta
                # Leemos suficiente buffer. El frame típico es ~10 bytes.
                lectura = ser.read(32) 

                if not lectura:
                    # Timeout, balanza no responde o está silenciada. Reintentamos bucle.
                    time.sleep(0.2)
                    continue

                # Caso: ESPERA (WACK)
                if lectura.startswith(WACK):
                    # Manual dice: PC reintenta ENQ. El bucle lo hará solo.
                    # Esperamos un poquito más para no saturar si está ocupada
                    time.sleep(0.2)
                    continue

                # Caso: DATOS (debe empezar con STX y contener ETX)
                if STX in lectura and ETX in lectura:
                    try:
                        # Buscamos el índice de STX y ETX para aislar el frame
                        idx_stx = lectura.index(STX)
                        idx_etx = lectura.index(ETX, idx_stx) # Busca ETX después de STX
                        
                        # Extraemos el frame completo: STX + DATOS + ETX
                        frame_completo = lectura[idx_stx : idx_etx + 1]
                        print(frame_completo)
                        
                        # Verificamos CRC (Está justo después del ETX)
                        # El índice del CRC es idx_etx + 1
                        idx_crc = idx_etx + 1
                        
                        if idx_crc < len(lectura):
                            crc_recibido = lectura[idx_crc]
                            crc_calculado = calculate_checksum(frame_completo)
                            
                            if crc_recibido == crc_calculado:
                                # ¡CRC VÁLIDO! -> Enviamos ACK
                                ser.write(ACK)
                                
                                # Procesar los datos (ignorando STX y ETX)
                                # frame_completo[1:-1] elimina STX inicial y ETX final
                                datos_ascii = frame_completo[1:-1].decode(errors='ignore')
                                
                                # Parsear peso (Formato: "000235" -> 0.235 kg)
                                # Buscar secuencia numérica
                                import re
                                match = re.search(r"([\d\.]+)", datos_ascii)
                                if match:
                                    val_str = match.group(1)
                                    peso_kg = 0.0
                                    
                                    if '.' in val_str:
                                        peso_kg = float(val_str)
                                    else:
                                        # Asumimos gramos si es entero
                                        peso_kg = float(val_str) / 1000.0
                                    
                                    # Enviar a WebSocket
                                    payload = {
                                        "weight": peso_kg,
                                        "agent_id": "real_scale_agent"
                                    }
                                    ws.send(json.dumps(payload))
                                    # print(f"Peso enviado: {peso_kg} kg")
                                else:
                                    print(f"Dato numérico no encontrado en: {datos_ascii}")
                            
                            else:
                                print(f"Error de CRC. Recibido: {hex(crc_recibido)}, Calculado: {hex(crc_calculado)}")
                                ser.write(NACK) # Pedir reenvío
                        else:
                            # Frame incompleto (falta CRC)
                            pass

                    except Exception as e:
                        print(f"Error procesando trama: {e}")
                        ser.write(NACK) # Por seguridad
                
                else:
                    # Datos basura o respuesta desconocida
                    ser.reset_input_buffer()

                # Espera breve para no saturar CPU (20-50ms es suficiente para fluidez)
                time.sleep(0.200)

            except Exception as e:
                print(f"Error crítico en bucle: {e}")
                if ser:
                    try:
                        ser.close()
                    except:
                        pass
                ser = None
                time.sleep(1)

    threading.Thread(target=run, daemon=True).start()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Scale Agent - Real Scale Connection')
    parser.add_argument('--server', default=DEFAULT_SERVER, help='Server WS URL')
    parser.add_argument('--device', default=DEFAULT_DEVICE, help='Device ID')
    parser.add_argument('--port', default=DEFAULT_PORT, help='Serial Port')
    parser.add_argument('--baud', type=int, default=DEFAULT_BAUD, help='Baud Rate')
    
    args = parser.parse_args()
    
    server_url = f"{args.server}/ws/scale/{args.device}/?role=agent"
    print(f"AGENTE INICIADO: {args.device}")
    print(f"Servidor: {args.server}")
    print(f"Puerto Serial: {args.port} @ {args.baud}")

    while True:
        try:
            ws = websocket.WebSocketApp(server_url,
                                    on_open=on_open,
                                    on_message=on_message,
                                    on_error=on_error,
                                    on_close=on_close)
            ws.run_forever()
        except Exception as e:
            print(f"Error conexión WS: {e}")
        
        print("Reconectando WS en 3s...")
        time.sleep(3)
