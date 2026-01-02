FROM tensorflow/tensorflow:1.15.5-py3

WORKDIR /workspace

# Copy everything
COPY . /workspace

# Upgrade pip & install all requirements
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Run the application
CMD ["python", "application.py"]
