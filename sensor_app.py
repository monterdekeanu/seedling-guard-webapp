from flask import Flask, render_template, request
from flask_socketio import SocketIO
from threading import Lock
from datetime import datetime, timedelta
from random import uniform
import time
import os
import adafruit_dht
import board
import psycopg2
from ads1115 import ADSConverter
from motor import Motor
from relay import Relay

"""
Background Thread
"""
# Database configuration
DB_NAME = "sensor_data"
DB_USER = "sensor_user"
DB_PASS = "123"
DB_HOST = "localhost"

# Create a connection to the PostgreSQL database
def create_db_connection():
    return psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
        host=DB_HOST
    )

# Function to insert sensor data into the database
def insert_sensor_data(timestamp, temperature, tds, soil_moisture):
    conn = create_db_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO sensor_readings (timestamp, temperature, tds, soil_moisture) VALUES (%s, %s, %s, %s)",
        (timestamp, temperature, tds, soil_moisture)
    )
    print("INSERTING DATA TO DATABASE")
    conn.commit()
    cur.close()
    conn.close()


mode = None
thread = None
thread_lock = Lock()

# Constants and Global Variables
RELAY_1_PIN = 17
RELAY_2_PIN = 27

EN1_PIN = 14
IN1_PIN = 15
IN2_PIN = 18
EN2_PIN = 11
IN3_PIN = 10
IN4_PIN = 9


MOTOR_SPEED = 15
FORWARD_TIME = 1.8
BACKWARD_TIME = 1.5
PUMP_DURATION = 5  # Duration to run the pump in seconds
PUMP_INTERVAL = 30  # Interval to wait before pumping again in seconds

TEMP_TRIGGER = 30
CONSECUTIVE_READINGS_THRESHOLD = 5  # Number of consecutive readings required to trigger motors

# Global variables to store sensor data
temperature_c = 0.0
temperature_c_2 = 0.0
tds = 0
soil_moisture = 0
soil_moisture_c2 = 0
is_forward = False
is_forward_c2 = False
last_pump_time = 0
countdown_time = 0
toggle_temp_flag = True  # Flag to alternate temperature
consecutive_readings = 0
consecutive_readings_c2 = 0

# Sensors and Motor
try:
    dht_device = adafruit_dht.DHT11(board.D4)
except RuntimeError as e:
    dht_device = None
    print("Failed to initialize right container DHT11 sensor:", e)
try:
    dht_device_c2 = adafruit_dht.DHT11(board.D22)
except RuntimeError as e:
    dht_device_c2 = None
    print("Failed to initialize left container DHT11 sensor:", e)
    
ads_sensor = ADSConverter()
motor1 = Motor(IN1_PIN, IN2_PIN, EN1_PIN)
motor2 = Motor(IN3_PIN, IN4_PIN, EN2_PIN)
relay1 = Relay(RELAY_1_PIN)
relay2 = Relay(RELAY_2_PIN)

# Flask App and SocketIO
app = Flask(__name__)
app.config['SECRET_KEY'] = 'seedlingGuard!'
socketio = SocketIO(app, cors_allowed_origins='*')

"""
Get current date time
"""
def get_current_datetime():
    now = datetime.now()
    return now.strftime("%H:%M:%S")

INIT_RUN = datetime.now() + timedelta(seconds=20)

# This function modifies global variables, so we use the `global` keyword to refer to them.
def generate_random_sensor_values():
    global temperature_c, tds, soil_moisture
    print("Generating random sensor values")
    temperature_c = round(uniform(15, 35), 2)  # Simulating temperature values between 15°C and 35°C
    tds = round(uniform(50, 800), 2)  # Simulating TDS Meter values for salinity
    soil_moisture = round(uniform(0, 10), 2)  # Simulating soil moisture values

# This function modifies global variables, so we use the `global` keyword to refer to them.
def read_live_sensor_values():
    global temperature_c, tds, tds_c2, soil_moisture, soil_moisture_c2, is_forward, last_pump_time, toggle_temp_flag, consecutive_readings, INIT_RUN
    global temperature_c2, is_forward_c2, consecutive_readings_c2
    runtime = datetime.now() + timedelta(seconds=0)

    tds = ads_sensor.read_salinity()
    tds_c2= ads_sensor.read_salinity_c2()
    soil_moisture = ads_sensor.read_moisture()
    soil_moisture_c2 = ads_sensor.read_moisture_c2()
    tds = max(0, tds)
    tds_c2 = max(0, tds_c2)

    try:
        if dht_device:
            temperature_c = dht_device.temperature
            if temperature_c is None:
                temperature_c = 0.0
        else:
            temperature_c = 0.0
    except RuntimeError as err:
        temperature_c = 0.0
        print("DHT11 reading error (right container):", err)

    try:
        if dht_device_c2:
            temperature_c2 = dht_device_c2.temperature
            if temperature_c2 is None:
                temperature_c2 = 0.0
        else:
            temperature_c2 = 0.0
    except RuntimeError as err:
        temperature_c2 = 0.0
        print("DHT11 reading error (left container):", err)

    print("Generating live sensor values")

    # Alternate temperature between 31°C and 29°C for testing motor control
    if temperature_c > TEMP_TRIGGER:
        if is_forward:
            consecutive_readings = 0  # Reset counter if already in forward state
        else:
            consecutive_readings += 1
    else:
        if not is_forward:
            consecutive_readings = 0  # Reset counter if already in backward state
        else:
            consecutive_readings += 1
    
    if temperature_c2 > TEMP_TRIGGER:
        if is_forward_c2:
            consecutive_readings_c2 = 0  # Reset counter if already in forward state
        else:
            consecutive_readings_c2 += 1
    else:
        if not is_forward_c2:
            consecutive_readings_c2 = 0  # Reset counter if already in backward state
        else:
            consecutive_readings_c2 += 1
            
    socketio.emit('updateSensorData', {
        'values': {
            'temperature': round(temperature_c, 2),
            'temperature_c2': round(temperature_c2, 2),
            'salinity': round(tds, 2),
            'salinity_c2': round(tds_c2, 2),
            'moisture': round(soil_moisture, 2),
            'moisture_c2': round(soil_moisture_c2, 2)
        },
        "date": get_current_datetime()
    })
    
    print(f"Consecutive readings: {consecutive_readings}")
    print(f"Consecutive readings c2: {consecutive_readings_c2}")
    print()
    if runtime < INIT_RUN:
        return
    if consecutive_readings >= CONSECUTIVE_READINGS_THRESHOLD:
        if temperature_c > TEMP_TRIGGER and not is_forward:
            motor2.forward(MOTOR_SPEED)
            print("motor forward")
            is_forward = True
            motor2.stop()
            consecutive_readings = 0  # Reset counter after action
        elif temperature_c < TEMP_TRIGGER and is_forward:
            motor2.backward(MOTOR_SPEED)
            is_forward = False
            print("motor backward")
            motor2.stop()
            consecutive_readings = 0  # Reset counter after action
    
    if consecutive_readings_c2 >= CONSECUTIVE_READINGS_THRESHOLD:
        if temperature_c2 > TEMP_TRIGGER and not is_forward_c2:
            motor1.forward(MOTOR_SPEED, FORWARD_TIME)
            print("motor forward")
            is_forward_c2 = True
            motor1.stop()
            consecutive_readings_c2 = 0  # Reset counter after action
        elif temperature_c2 < TEMP_TRIGGER and is_forward_c2:
            motor1.backward(MOTOR_SPEED, BACKWARD_TIME)
            is_forward_c2 = False
            print("motor backward")
            motor1.stop()
            consecutive_readings_c2 = 0  # Reset counter after action

    # Check if TDS is outside acceptable range to trigger the relay
    current_time = time.time()
    socketio.emit('updateTimer', {
        'values': {
            'counter': round(current_time - last_pump_time, 0)
        },
        "date": get_current_datetime()
    })
    if (tds+tds_c2)/2 < 300:
        print(f"{current_time - last_pump_time} seconds has passed.")
        if current_time - last_pump_time > PUMP_INTERVAL:
            print("Activating fertilizer pump due to low TDS level")
            relay1.activate()  # Turn on the pump
            time.sleep(PUMP_DURATION)
            relay1.deactivate()  # Turn off the pump
            last_pump_time = current_time
            print(f"Pump activated at {get_current_datetime()}. Next check in {format_elapsed_time(PUMP_INTERVAL)} minutes.")
    else:
        relay1.deactivate()

    # Check if soil moisture is below a threshold to trigger the relay
    if (soil_moisture + soil_moisture_c2)/2 < 5:
        relay2.activate()
        time.sleep(2)
        relay2.deactivate()
        time.sleep(1)
    # Check if relay is triggered and soil moisture becomes moist again
    else:
        relay2.deactivate()
    

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

        elapsed_time = time.time() - last_pump_time
        formatted_time = format_elapsed_time(elapsed_time)

        if countdown_time > 0:
            countdown_time -= 1
        formatted_countdown = format_elapsed_time(countdown_time)

        socketio.sleep(0.5)

def cleanup():
    print("Cleaning up GPIOs and motors...")
    relay1.cleanup()
    relay2.cleanup()
    motor1.stop()  # Stop the motor
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

            if mode in ['1', '2']:
                break
            else:
                print("\033[91mInvalid mode selection. Try Again..\033[0m")
                time.sleep(3)
        socketio.run(app, host='0.0.0.0', port=5000)
    finally:
        cleanup()
