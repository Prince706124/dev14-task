#!/bin/bash

# Wait for database to be ready
sleep 5

# Run seed data if database is empty
python -c "
import sqlite3
import os

# Check if database exists and has data
db_path = 'comments.db'
if not os.path.exists(db_path) or os.path.getsize(db_path) == 0:
    print('Database is empty, running seed data...')
    import subprocess
    subprocess.run(['python', 'seed_data.py'])
else:
    print('Database already has data, skipping seed.')
"

# Start the application
exec uvicorn main:app --host 0.0.0.0 --port 8000
