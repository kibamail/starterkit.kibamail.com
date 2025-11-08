#!/bin/bash
set -e

echo "Creating databases..."

# Create logto database
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE logto;
    GRANT ALL PRIVILEGES ON DATABASE logto TO postgres;
EOSQL

echo "Created database: logto"

# Create dev database
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE dev;
    GRANT ALL PRIVILEGES ON DATABASE dev TO postgres;
EOSQL

echo "Created database: dev"

# Create test database
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE test;
    GRANT ALL PRIVILEGES ON DATABASE test TO postgres;
EOSQL

echo "Created database: test"

# Create test-e2e database
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE "test-e2e";
    GRANT ALL PRIVILEGES ON DATABASE "test-e2e" TO postgres;
EOSQL

echo "Created database: test-e2e"

echo "All databases created successfully!"
