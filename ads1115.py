import board
import busio
import adafruit_ads1x15.ads1115 as ADS
from adafruit_ads1x15.analog_in import AnalogIn

class ADSConverter:
    V_dry = 2.23  # Voltage at dry soil
    V_wet = 1.03  # Voltage at saturated soil

    # Constants for the TDS calculation
    VREF = 3.3  # Reference voltage
    TDS_FACTOR = 0.5  # TDS factor (depends on your sensor and calibration)

    def __init__(self, soil_moisture_sensor=ADS.P0, salinity_sensor=ADS.P1, soil_moisture_sensor_c2=ADS.P2, salinity_sensor_c2=ADS.P3):
        self.i2c = busio.I2C(board.SCL, board.SDA)
        self.ads = ADS.ADS1115(self.i2c)
        self.soil_moisture_sensor = AnalogIn(self.ads, soil_moisture_sensor)
        self.salinity_sensor = AnalogIn(self.ads, salinity_sensor)
        self.soil_moisture_sensor_c2 = AnalogIn(self.ads, soil_moisture_sensor_c2)
        self.salinity_sensor_c2 = AnalogIn(self.ads, salinity_sensor_c2)

    def convert_to_moisture(self, voltage):
        if voltage > self.V_dry:
            voltage = self.V_dry
        elif voltage < self.V_wet:
            voltage = self.V_wet
        moisture = 100 * (self.V_dry - voltage) / (self.V_dry - self.V_wet)
        return moisture / 10
    
    def read_moisture(self):
        voltage = self.soil_moisture_sensor.voltage
        return self.convert_to_moisture(voltage)
    
    def read_moisture_c2(self):
        voltage = self.soil_moisture_sensor_c2.voltage
        return self.convert_to_moisture(voltage)

    def read_salinity(self):
        voltage = self.salinity_sensor.voltage
        # Convert voltage to TDS value
        salinity_value = (133.42 * voltage ** 3 - 255.86 * voltage ** 2 + 857.39 * voltage) * self.TDS_FACTOR
        return salinity_value
    
    def read_salinity_c2(self):
        voltage = self.salinity_sensor_c2.voltage
        # Convert voltage to TDS value
        salinity_value = (133.42 * voltage ** 3 - 255.86 * voltage ** 2 + 857.39 * voltage) * self.TDS_FACTOR
        return salinity_value
