import RPi.GPIO as GPIO          
from time import sleep

class Motor:
	def __init__(self, in1, in2, en1):
		self.in1 = in1
		self.in2 = in2
		self.en1 = en1
		
		GPIO.setmode(GPIO.BCM)
		GPIO.setup(self.in1, GPIO.OUT)
		GPIO.setup(self.in2, GPIO.OUT)
		GPIO.setup(self.en1, GPIO.OUT)
        
		self.pwm = GPIO.PWM(self.en1, 1000)  # Create PWM instance with frequency
		self.pwm.start(0)  # Start PWM with 0% duty cycle (motor stopped)
        
	def forward(self, speed=100):
		GPIO.output(self.in1, GPIO.HIGH)
		GPIO.output(self.in2, GPIO.LOW)
		self.pwm.ChangeDutyCycle(speed)
		
	def backward(self, speed=100):
		GPIO.output(self.in1, GPIO.LOW)
		GPIO.output(self.in2, GPIO.HIGH)
		self.pwm.ChangeDutyCycle(speed)
		
	def stop(self):
		self.pwm.ChangeDutyCycle(0)
	
	def cleanup():
		self.pwm.stop()
		GPIO.cleanup()
		
# def main():
    # in1 = 24
    # in2 = 23
    # en1 = 25
    
    # motor = Motor(in1, in2, en1)
    # try:
        # while True:
            # print("Motor forward")
            # motor.forward(50)  # 50% speed
            # sleep(2)
            
            # print("Motor backward")
            # motor.backward(50)  # 50% speed
            # sleep(2)
            
            # print("Motor stop")
            # motor.stop()
            # sleep(1)
            
    # except KeyboardInterrupt:
        # print("Interrupted by user")
    # finally:
        # motor.cleanup()
        # print("GPIO cleanup completed")

# if __name__ == "__main__":
    # main()
