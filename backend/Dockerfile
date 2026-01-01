FROM tensorflow/tensorflow:1.15.5-py3

WORKDIR /workspace

COPY . /workspace

RUN pip install --upgrade pip && \
    pip install pillow keras==2.2.5 scikit-image flask flask-cors

CMD ["python", "application.py"]
