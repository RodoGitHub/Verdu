import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ScaleConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # 1. Obtener datos de conexión
        self.pos_id = self.scope['url_route']['kwargs']['pos_id']
        self.room_group_name = f'scale_{self.pos_id}'
        
        print(f"WebSocket: Conexión entrante para {self.pos_id}")

        # 2. Validar que el Terminal exista en BD
        from .models import ScaleTerminal
        from channels.db import database_sync_to_async

        @database_sync_to_async
        def terminal_exists(device_id):
            return ScaleTerminal.objects.filter(device_id=device_id, is_active=True).exists()

        exists = await terminal_exists(self.pos_id)

        if exists:
            # Aceptamos la conexión
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            await self.accept()
            print(f"WebSocket: Conectado a {self.pos_id}")

            # --- Lógica de Estado del Agente ---
            from django.core.cache import cache
            query_string = self.scope.get("query_string", b"").decode("utf-8")
            
            # Si el que se conecta es el "AGENTE" (script python)
            if "role=agent" in query_string:
                self.role = 'agent'
                # Marcar en caché que el agente está ONLINE
                cache.set(f'agent_online_{self.pos_id}', True, timeout=None)
                # Avisar a todos (React) que el agente está ONLINE
                await self.channel_layer.group_send(
                    self.room_group_name,
                    { 'type': 'agent_status', 'status': True }
                )
            else:
                self.role = 'client'
                # Si es un cliente (React), verificamos si el agente YA está online
                is_online = cache.get(f'agent_online_{self.pos_id}', False)
                # Enviamos el estado actual SOLO a este cliente
                await self.send(text_data=json.dumps({
                    'type': 'status_check',
                    'active': is_online
                }))

        else:
            print(f"WebSocket: RECHAZADO - Terminal {self.pos_id} no existe o inactivo")
            await self.close()



    async def disconnect(self, close_code):
        print(f"WebSocket: Desconectado de {self.room_group_name}")
        
        # Si se desconecta el AGENTE, avisar y limpiar caché
        if hasattr(self, 'role') and self.role == 'agent':
             from django.core.cache import cache
             cache.delete(f'agent_online_{self.pos_id}')
             await self.channel_layer.group_send(
                self.room_group_name,
                { 'type': 'agent_status', 'status': False }
             )

        # Salir del grupo
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # 3. Recibir mensaje del WebSocket (Del Agente Python en la Raspberry)
    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            weight = text_data_json.get('weight')
            
            # 4. Rebotar el mensaje a todo el grupo
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'scale_update', 
                    'weight': weight
                }
            )
        except Exception as e:
            # print(f"Error procesando mensaje: {e}")
            pass

    # 4. Enviar status del agente (Broadcast)
    async def agent_status(self, event):
        await self.send(text_data=json.dumps({
            'type': 'status_update',
            'active': event['status']
        }))

    # 5. Manejador de evento 'scale_update' (Enviado por group_send)
    async def scale_update(self, event):
        weight = event['weight']

        # Enviar al WebSocket (a React)
        await self.send(text_data=json.dumps({
            'weight': weight
        }))
