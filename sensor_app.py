from flask import Flask, render_template, request
from flask_socketio import SocketIO
from random import uniform
from threading import Lock
from datetime import datetime
import time

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
def background_thread():
    print("Generating random sensor values")
    while True:
        humidity = round(uniform(30, 90), 2)  # Simulating humidity values between 30% and 90%
        temperature = round(uniform(15, 35), 2)  # Simulating temperature values between 15°C and 35°C
        salinity = round(uniform(50, 800), 2)  # Simulating TDS Meter values for salinity
        soil_moisture = round(uniform(0, 10), 2)  # Simulating soil moisture values

        socketio.emit('updateSensorData', {'values': {'humidity': humidity, 'temperature': temperature, 'salinity': salinity, 'moisture': soil_moisture}, "date": get_current_datetime()})
        socketio.sleep(1)

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
    socketio.run(app, host='0.0.0.0', port=5000)
