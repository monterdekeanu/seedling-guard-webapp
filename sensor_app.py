from flask import Flask, render_template, request
from flask_socketio import SocketIO
from random import uniform
from threading import Lock
from datetime import datetime

from ads1115 import ADSConverter
from motor import Motor

import adafruit_dht
import time
import os
import RPi.GPIO as GPIO

import board
import busio


"""
Background Thread
"""
mode = None
humidity = 0
temperature_c = 0
tds = 0
soil_moisture = 0

"""
relay pin
"""
relay1Pin = 26
relay2Pin = 19
GPIO.setmode(GPIO.BCM)
GPIO.setup(relay1Pin, GPIO.OUT)
GPIO.setup(relay2Pin, GPIO.OUT)


thread = None
thread_lock = Lock()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'seedlingGuard!'
socketio = SocketIO(app, cors_allowed_origins='*')

"""
Get current date time
"""
def get_current_datetime():
    now = datetime.now()
    #return now.strftime("%m/%d/%Y %H:%M:%S")
    return now.strftime("%H:%M:%S")

dht_device = adafruit_dht.DHT11(board.D17)
ads_sensor = ADSConverter()

in1 = 24
in2 = 23
en1 = 25
motor = Motor(in1,in2,en1)

def background_thread():
    global humidity, temperature_c, tds, soil_moisture, is_forward, relay1_triggered
    is_forward = False
    relay1_triggered = False
    while True:
        if mode == '2':
            print("Generating random sensor values")
            humidity = round(uniform(30, 90), 2)  # Simulating humidity values between 30% and 90%
            temperature_c = round(uniform(15, 35), 2)  # Simulating temperature values between 15°C and 35°C
            tds = round(uniform(50, 800), 2)  # Simulating TDS Meter values for salinity
            soil_moisture = round(uniform(0, 10), 2)  # Simulating soil moisture values
        elif mode == '1':
            print("Generating live sensor values")
            tds = ads_sensor.read_salinity()
            soil_moisture = ads_sensor.read_moisture()
            
            if tds < 0.00:
                tds = 0
            try:
                temperature_c = dht_device.temperature
                humidity = dht_device.humidity
                
                if temperature_c > 30 and not is_forward:
                    motor.forward(50)
                    is_forward = True
                    time.sleep(2)
                    motor.stop()
                elif temperature_c < 30 and is_forward:
                    motor.backward(50)
                    is_forward = False
                    time.sleep(2)   
                    motor.stop()
    
                    
                if tds < 300 or tds > 800:
                    GPIO.output(relay1Pin, GPIO.LOW)
                else: 
                    GPIO.output(relay1Pin, GPIO.HIGH)
                
                # Check if soil moisture is below a threshold to trigger the relay
                if soil_moisture < 5:
                    GPIO.output(relay2Pin, GPIO.LOW)
                # Check if relay is triggered and soil moisture becomes moist again
                else:
                    GPIO.output(relay2Pin, GPIO.HIGH)
            except RuntimeError as err:
                print(err.args[0])
        humidity = round(humidity,2)
        temperature_c = round(temperature_c,2)
        tds = round(tds,2)
        soil_moisture = round(soil_moisture,2)
        socketio.emit('updateSensorData', {'values': {'humidity': humidity, 'temperature': temperature_c, 'salinity': tds, 'moisture': soil_moisture}, "date": get_current_datetime()})
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
    try:
        while True:
            os.system('cls' if os.name == 'nt' else 'clear')
            print("\033[92mWelcome to Seedling Guard!\n\033[0m")

            print("\033[93mPlease be guided!\n")
            print("ADS1115 Pin Orientation:")
            print(" - A0: Capacitive Soil Moisture Sensor v1.2")
            print(" - A1: KS0429 keyestudio TDS Meter V1.0\n")
            print("DHT11 Pin Orientation:")
            print(" - GPIO17\n\033[0m")

            print("\033[94mDesigners:")
            print(" - Keanu Anthony Monterde")
            print(" - Allen Joseph Lozada")
            print(" - Norwen Peñas\n\033[0m")

            print("\033[92mMode Choices:")
            print("[1] Run Production (Live Sensors)")
            print("[2] Run Test Mode (Generate Random Sensor Values)\n\033[0m")
            mode = input("\033[92mSelect Mode: \033[0m")


            if mode in['1','2']:
                break
            else:
                print("\033[91mInvalid mode selection. Try Again..\033[0m")
                time.sleep(3)

        socketio.run(app, host='0.0.0.0', port=5000)
    finally:
        # Cleanup code
        print("Cleaning up GPIOs and motors...")
        GPIO.output(relay1Pin, GPIO.HIGH)  # Turn off relay 1
        GPIO.output(relay2Pin, GPIO.HIGH)  # Turn off relay 2
        motor.stop()  # Stop the motor
        GPIO.cleanup()  # Cleanup GPIO pins
