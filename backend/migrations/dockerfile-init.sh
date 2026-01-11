./wait-for-it.sh pg_timescaledb:5432 --timeout=60 --strict

cd /migrations/postgres && sqlx migrate run
