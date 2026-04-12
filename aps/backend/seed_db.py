import os
import sys
import bcrypt
from app import create_app, db
from app.models import User, UserRole, City, Area, ParkingFacility, ParkingFloor, ParkingSlot, SlotStatus

def seed_db():
    app = create_app()
    with app.app_context():
        # Clear existing data
        db.drop_all()
        db.create_all()

        print("Seeding users...")
        users = [
            {
                "email": "superadmin@parking.com",
                "password": "Super@123",
                "first_name": "Super",
                "last_name": "Admin",
                "role": UserRole.super_admin
            },
            {
                "email": "admin@parking.com",
                "password": "Admin@123",
                "first_name": "Parking",
                "last_name": "Admin",
                "role": UserRole.admin
            },
            {
                "email": "testuser@example.com",
                "password": "Test@123",
                "first_name": "Test",
                "last_name": "User",
                "role": UserRole.end_user
            }
        ]

        for u in users:
            password_hash = bcrypt.hashpw(u['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            user = User(
                email=u['email'],
                password_hash=password_hash,
                first_name=u['first_name'],
                last_name=u['last_name'],
                role=u['role']
            )
            db.session.add(user)
        
        print("Seeding initial data (Mumbai)...")
        mumbai = City(name="Mumbai", slug="mumbai")
        db.session.add(mumbai)
        db.session.commit()

        andheri = Area(city_id=mumbai.id, name="Andheri")
        db.session.add(andheri)
        db.session.commit()

        facility = ParkingFacility(
            area_id=andheri.id,
            name="Andheri East Plaza",
            address="Near Metro Station, Andheri East",
            description="Premium multi-story parking"
        )
        db.session.add(facility)
        db.session.commit()

        floor = ParkingFloor(
            facility_id=facility.id,
            floor_number=1,
            floor_name="Basement 1",
            price_per_hour=50.00
        )
        db.session.add(floor)
        db.session.commit()

        for i in range(1, 11):
            slot = ParkingSlot(
                floor_id=floor.id,
                slot_number=f"B1-{i:02d}",
                status=SlotStatus.available
            )
            db.session.add(slot)

        db.session.commit()
        print("Seeding complete!")

if __name__ == "__main__":
    seed_db()
