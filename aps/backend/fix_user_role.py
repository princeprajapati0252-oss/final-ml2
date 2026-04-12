from app import create_app, db
from app.models import User, UserRole

def fix_role():
    app = create_app()
    with app.app_context():
        email = 'prince.prajapati4111@gmail.com'
        user = User.query.filter_by(email=email).first()
        if user:
            user.role = UserRole.end_user
            db.session.commit()
            print(f"Role for {email} updated to end_user.")
        else:
            print(f"User {email} not found.")

if __name__ == "__main__":
    fix_role()
