import RPi.GPIO as GPIO

class Relay:
    def __init__(self, pin):
        self.pin = pin
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(self.pin, GPIO.OUT)
        GPIO.output(self.pin, GPIO.HIGH)  # Initially turn off the relay

    def activate(self):
        GPIO.output(self.pin, GPIO.LOW)  # Turn on the relay

    def deactivate(self):
        GPIO.output(self.pin, GPIO.HIGH)  # Turn off the relay

    def cleanup(self):
        GPIO.output(self.pin, GPIO.HIGH)  # Ensure the relay is turned off
