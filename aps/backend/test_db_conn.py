import psycopg2

def test_connections():
    combos = [
        {"user": "postgres", "password": "", "dbname": "postgres"},
        {"user": "postgres", "password": "password", "dbname": "postgres"},
        {"user": "postgres", "password": "postgres", "dbname": "postgres"},
        {"user": "parking_admin", "password": "password", "dbname": "parking_system"},
        {"user": "parking_admin", "password": "admin", "dbname": "parking_system"},
    ]
    
    for combo in combos:
        try:
            conn = psycopg2.connect(
                host="localhost",
                port=5432,
                user=combo["user"],
                password=combo["password"],
                dbname=combo["dbname"]
            )
            print(f"SUCCESS: Connected with user={combo['user']} password='{combo['password']}' dbname={combo['dbname']}")
            conn.close()
            return combo
        except Exception as e:
            print(f"FAILED: user={combo['user']} pass='{combo['password']}' - {str(e).splitlines()[0]}")
    
    return None

if __name__ == "__main__":
    test_connections()
