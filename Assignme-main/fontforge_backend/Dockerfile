# Use a basic Linux image
FROM ubuntu:20.04

# Set environment non-interactively
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies and Python 3.9
RUN apt-get update && \
    apt-get install -y python3 python3-fontforge python3-pip libgl1 libjpeg-dev libtiff5-dev libpng-dev libfreetype6-dev libgif-dev libgtk-3-dev libxml2-dev libpango1.0-dev libcairo2-dev libspiro-dev libwoff-dev python3-dev ninja-build cmake build-essential gettext

# Install Python dependencies
RUN pip install opencv-python fastapi pillow potracer uvicorn numpy python-multipart

# Copy the application code
COPY . app.py

# Set the working directory
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Expose the application port
EXPOSE 8000

# Command to run the FastAPI application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
