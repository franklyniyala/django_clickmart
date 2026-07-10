#!/bin/sh
#!/bin/sh

set -e

echo "========================================"
echo "Waiting for PostgreSQL..."
echo "========================================"

until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER"; do
    sleep 2
done

echo "========================================"
echo "PostgreSQL is ready!"
echo "========================================"

echo "Running database migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting Gunicorn..."

exec gunicorn \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    clickmart_main.wsgi:application