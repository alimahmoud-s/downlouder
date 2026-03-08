from fastapi import FastAPI
import socketio
import uvicorn

app = FastAPI()
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    print("Starting minimal worker...")
    uvicorn.run(socket_app, host="127.0.0.1", port=8000)
