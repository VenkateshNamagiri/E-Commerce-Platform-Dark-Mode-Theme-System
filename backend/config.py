import mysql.connector

DB_CONFIG = {
    "host": "localhost",
    "user": "root",       # <-- change to your MySQL username
    "password": "happy@1991",       # <-- change to your MySQL password
    "database": "ecommerce",
}


def get_db():
    """Returns a new connection with dict-style cursors."""
    return mysql.connector.connect(**DB_CONFIG)
