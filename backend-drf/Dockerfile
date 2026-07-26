FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

RUN useradd --create-home --shell /bin/bash appuser

COPY --chown=appuser:appuser requirements.txt .
COPY --chown=appuser:appuser manage.py .
COPY --chown=appuser:appuser api ./api
COPY --chown=appuser:appuser carts ./carts
COPY --chown=appuser:appuser orders ./orders
COPY --chown=appuser:appuser products ./products
COPY --chown=appuser:appuser users ./users
COPY --chown=appuser:appuser clickmart_main ./clickmart_main
COPY --chown=appuser:appuser entrypoint.sh .

USER appuser

CMD ["./entrypoint.sh"]