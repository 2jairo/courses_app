./wait-for-it.sh rabbitmq:5672 --timeout=60 --strict
./wait-for-it.sh pg_timescaledb:5432 --timeout=60 --strict
./wait-for-it.sh redis:6379 --timeout=60 --strict

/app/app