from flask import Flask, render_template, request
from flask_socketio import SocketIO
from random import random
from threading import Lock
from datetime import datetime
import time
import adafruit_dht
import board

"""
Background Thread
"""
thread = None
thread_lock = Lock()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'donsky!'
socketio = SocketIO(app, cors_allowed_origins='*')

"""
Get current date time
"""
def get_current_datetime():
    now = datetime.now()
    return now.strftime("%m/%d/%Y %H:%M:%S")

"""
Generate random sequence of dummy sensor values and send it to our clients
"""
dht_device = adafruit_dht.DHT11(board.D4)

def background_thread():
    print("Generating random sensor values")
    while True:
        try:
            humidity = dht_device.humidity
            dummy_sensor_value = round(random() * 100, 3)
            print(humidity)
            socketio.emit('updateSensorData', {'value': humidity, "date": get_current_datetime()})
            socketio.sleep(1)
        except RuntimeError as err:
            print(err.args[0])
        time.sleep(1.0)

"""
Serve root index file
"""
@app.route('/')
def index():
    return render_template('index.html')

"""
Decorator for connect
"""
@socketio.on('connect')
def connect():
    global thread
    print('Client connected')

    with thread_lock:
        if thread is None:
            thread = socketio.start_background_task(background_thread)

"""
Decorator for disconnect
"""
@socketio.on('disconnect')
def disconnect():
    print('Client disconnected', request.sid)

if __name__ == '__main__':
    socketio.run(app)

