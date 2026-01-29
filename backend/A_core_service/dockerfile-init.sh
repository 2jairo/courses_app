./wait-for-it.sh rabbitmq:5672 --timeout=60 --strict
./wait-for-it.sh pg_timescaledb:5432 --timeout=60 --strict
./wait-for-it.sh clickhouse:9000 --timeout=60 --strict

/app/app