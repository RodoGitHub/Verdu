import serial
import time

class ScaleService:
    def get_weight(self):
        # SIMULACIÓN PARA TEST (Si no hay balanza real)
        # Comenta esto en producción y descomenta el bloque try/except de abajo
        import random
        return {"weight": random.randint(100, 5000), "status": "success"}

        """
        try:
            with serial.Serial(
                port="/dev/ttyUSB0",  # Configurable en settings si se desea
                baudrate=9600,        
                bytesize=serial.EIGHTBITS,  
                parity=serial.PARITY_NONE,  
                stopbits=serial.STOPBITS_ONE,  
                timeout=1  
            ) as device:
                device.write(b'\x05')  # Enviar ENQ (0x05)
                time.sleep(1)  # Espera para la respuesta
                response = device.read(100)
                
                if response and response[0] == 0x02:  
                    try:
                        # Extraer datos entre STX (0x02) y ETX (usualmente al final)
                        # El slice [1:-2] asume formato específico que venía en el ejemplo flask
                        data = response[1:-2]  
                        weight = int(data.decode('utf-8'))
                        return {"weight": weight, "status": "success"}
                    except ValueError:
                        return {"weight": None, "status": "error", "message": "Error parsing weight"}
                return {"weight": None, "status": "error", "message": "Invalid response"}
            
        except serial.SerialException as e:
            return {"weight": None, "status": "error", "message": str(e)}
        except Exception as e:
             return {"weight": None, "status": "error", "message": str(e)}
        """
