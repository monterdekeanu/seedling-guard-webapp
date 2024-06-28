import RPi.GPIO as GPIO          
from time import sleep

class Motor:
    def __init__(self, in1, in2, en, motor_name):
        self.in1 = in1
        self.in2 = in2
        self.en = en
        self.motor_name = motor_name

        GPIO.setmode(GPIO.BCM)
        GPIO.setup(self.in1, GPIO.OUT)
        GPIO.setup(self.in2, GPIO.OUT)
        GPIO.setup(self.en, GPIO.OUT)

        self.pwm = GPIO.PWM(self.en, 1000)  # Create PWM instance with frequency
        self.pwm.start(0)  # Start PWM with 0% duty cycle (motor stopped)
            
    def forward(self, speed=100):
        GPIO.output(self.in1, GPIO.LOW)    
        GPIO.output(self.in2, GPIO.HIGH)
        self.pwm.ChangeDutyCycle(30)
        sleep(0.1)
        self.pwm.ChangeDutyCycle(speed)
        sleep(0.6)
        print(f"{self.motor_name} moving forward")

    def backward(self, speed=100):
        GPIO.output(self.in1, GPIO.HIGH)
        GPIO.output(self.in2, GPIO.LOW)
        self.pwm.ChangeDutyCycle(30)
        sleep(0.1)
        self.pwm.ChangeDutyCycle(speed)
        sleep(0.6)
        print(f"{self.motor_name} moving backward")

    def stop(self):
        self.pwm.ChangeDutyCycle(0)
        sleep(2)
        print(f"{self.motor_name} stopped")

    def cleanup(self):
        self.pwm.stop()
        GPIO.cleanup()
