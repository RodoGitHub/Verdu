FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies for mysqlclient and Node.js
RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev \
    build-essential \
    pkg-config \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && corepack enable && corepack prepare pnpm@latest --activate \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY Django/ ./Django/

# Set working directory to where manage.py is
WORKDIR /app/Django/balanza_verdu

# Create static directory
RUN mkdir -p staticfiles

EXPOSE 8000

# We use daphne for production (supports HTTP & WebSockets)
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "balanza_verdu.asgi:application"]
