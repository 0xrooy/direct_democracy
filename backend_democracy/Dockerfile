# Use the pre-built base image
FROM democracy-base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# Set working directory
WORKDIR /app

# Cache install: only re-run if dependencies change
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache \
    pip install --prefer-binary -r requirements.txt

# Copy the app code
COPY . .

# Expose API port
EXPOSE 8000

# Run the backend
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
