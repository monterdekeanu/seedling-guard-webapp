from flask import Flask, render_template
from flask_socketio import SocketIO
from threading import Lock
from datetime import datetime
from random import uniform
import time
import os
import RPi.GPIO as GPIO
import adafruit_dht
import board
import busio
from ads1115 import ADSConverter
from motor import Motor
from relay import Relay

"""
Background Thread
"""

mode = None
thread = None
thread_lock = Lock()

# Constants and Global Variables
RELAY_1_PIN = 26
RELAY_2_PIN = 19
IN1_PIN = 24
IN2_PIN = 23
EN1_PIN = 25
PUMP_DURATION = 5  # Duration to run the pump in seconds
PUMP_INTERVAL = 10  # Interval to wait before pumping again in seconds

# Global variables to store sensor data
humidity = 0
temperature_c = 0
tds = 0
soil_moisture = 0
is_forward = False
last_pump_time = 0
countdown_time = 0

#Flask App and SocketIO
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

# This function modifies global variables, so we use the `global` keyword to refer to them.
def generate_random_sensor_values():
    global humidity, temperature_c, tds, soil_moisture
    print("Generating random sensor values")
    humidity = round(uniform(30, 90), 2) # Simulating humidity values between 30% and 90%
    temperature_c = round(uniform(15, 35), 2) # Simulating temperature values between 15°C and 35°C
    tds = round(uniform(50, 800), 2) # Simulating TDS Meter values for salinity
    soil_moisture = round(uniform(0, 10), 2) # Simulating soil moisture values

# This function modifies global variables, so we use the `global` keyword to refer to them.
def read_live_sensor_values():
    # Sensors and Motor
    dht_device = adafruit_dht.DHT11(board.D17)
    ads_sensor = ADSConverter()
    motor = Motor(IN1_PIN, IN2_PIN, EN1_PIN)
    relay1 = Relay(RELAY_1_PIN)
    relay2 = Relay(RELAY_2_PIN)
    global humidity, temperature_c, tds, soil_moisture, is_forward, last_pump_time
    print("Generating live sensor values")
    tds = ads_sensor.read_salinity()
    soil_moisture = ads_sensor.read_moisture()
    if tds < 0.00:
        tds = 0
    try:
        temperature_c = dht_device.temperature
        humidity = dht_device.humidity
        
        # if not is_forward:
            # motor.forward(50)
            # is_forward = True
            # time.sleep(2)
        # else:
            # motor.backward()
            # is_forward = False
            # time.sleep(2)
            
        # if temperature_c > 22 and not is_forward:
            # motor.forward(50)
            # is_forward = True
            # time.sleep(2)
            # motor.stop()
        # elif temperature_c < 22 and is_forward:
            # motor.backward(50)
            # is_forward = False
            # time.sleep(2)   
            # motor.stop()
            
        # Check if TDS is outside acceptable range to trigger the relay
        # current_time = time.time()
        # if tds < 300 or tds > 800:
            # print(f"{current_time - last_pump_time} seconds has passed.")
            # if current_time - last_pump_time > PUMP_INTERVAL:
                # print("Activating fertilizer pump due to TDS level")
                # relay1.activate() # Turn on the pump
                # time.sleep(PUMP_DURATION)
                # relay1.deactivate()  # Turn off the pump
                # last_pump_time = current_time
                # print(f"Pump activated at {get_current_datetime()}. Next check in {format_elapsed_time(PUMP_INTERVAL)} minutes.")
                
        # else: 
            # relay1.deactivate()
        
        # # Check if soil moisture is below a threshold to trigger the relay
        # if soil_moisture < 5:
            # relay2.activate()
        # # Check if relay is triggered and soil moisture becomes moist again
        # else:
            # relay2.deactivate()
    except RuntimeError as err:
        print(err.args[0])

def format_elapsed_time(seconds):
    minutes = seconds // 60
    seconds = seconds % 60
    return f"{int(minutes):02}:{int(seconds):02}"

def background_thread():
    global is_forward, last_pump_time, countdown_time
    while True:
        if mode == '2':
            generate_random_sensor_values()
        elif mode == '1':
            read_live_sensor_values()
        
        # elapsed_time = time.time() - last_pump_time
        # formatted_time = format_elapsed_time(elapsed_time)
        
        # if countdown_time > 0:
            # countdown_time -= 1
        # formatted_countdown = format_elapsed_time(countdown_time)
        
        socketio.emit('updateSensorData', {
            'values': {
                'temperature': round(temperature_c, 2),
                'salinity': round(tds, 2),
                'moisture': round(soil_moisture, 2)
            },
            "date": get_current_datetime()
        })
        socketio.sleep(1)

def cleanup():
    print("Cleaning up GPIOs and motors...")
    relay1.cleanup()
    relay2.cleanup()
    motor.stop()  # Stop the motor
    GPIO.cleanup()  # Cleanup GPIO pins
    
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
        cleanup()
