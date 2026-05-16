# Use a lightweight base image
FROM python:3.11-slim

# Install system dependencies (FFmpeg is required by yt-dlp to merge audio/video)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp via pip (so it's easily updatable)
RUN pip install --no-cache-dir yt-dlp

# Set up your app directory
WORKDIR /app
COPY . .

# Install your website's backend dependencies (e.g., if using Python/FastAPI)
RUN pip install -r requirements.txt

EXPOSE 8080
CMD ["python", "main.py"]