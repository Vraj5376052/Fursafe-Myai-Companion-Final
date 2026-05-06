import socketio

sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")

connected_users = {}

@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")
    

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

@sio.event
async def send_message(sid, data):
    print("Message received:", data)

    await sio.emit("receive_message", data)

