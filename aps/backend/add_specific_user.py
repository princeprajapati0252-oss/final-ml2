import bcrypt
from app import create_app, db
from app.models import User, UserRole

def add_user():
    app = create_app()
    with app.app_context():
        email = 'prince.prajapati4111@gmail.com'
        password = 'prince@123'
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            print(f"User {email} already exists!")
            return

        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        user = User(
            email=email,
            password_hash=password_hash,
            first_name='Prince',
            last_name='Prajapati',
            role=UserRole.super_admin
        )
        db.session.add(user)
        db.session.commit()
        print(f"User {email} added successfully as Super Admin.")

if __name__ == "__main__":
    add_user()
