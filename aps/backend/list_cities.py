from app import create_app, db
from app.models import City

def list_cities():
    app = create_app()
    with app.app_context():
        cities = City.query.all()
        if not cities:
            print("No cities found in database.")
        else:
            print("Cities in database:")
            for city in cities:
                print(f"- {city.name} (id: {city.id})")

if __name__ == "__main__":
    list_cities()
