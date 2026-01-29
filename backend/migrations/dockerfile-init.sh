./wait-for-it.sh pg_timescaledb:5432 --timeout=60 --strict
./wait-for-it.sh clickhouse:9000 --timeout=60 --strict

migrate -path /migrations/clickhouse/migrations -database "$CLICKHOUSE_URL" up
migrate -path /migrations/postgres/migrations -database "$POSTGRES_URL" up