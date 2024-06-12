FROM python as compiler

WORKDIR /app
COPY . /app
# Install Python3.10
RUN apt update
RUN apt install -y python3
RUN python3 --version

# Install virtualenv
RUN apt install -y python3-venv

RUN python3 -m venv .venv
RUN #! .venv/bin/activate 
RUN pip install -r requirements.txt 

EXPOSE 5000
CMD python ./sensor_app.py