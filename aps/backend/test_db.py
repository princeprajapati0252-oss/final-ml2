from app import create_app, db
app = create_app()
app.app_context().push()
r = db.session.execute(db.text("SELECT confdeltype FROM pg_constraint WHERE conrelid = 'invoices'::regclass AND confrelid = 'bookings'::regclass;")).fetchall()
print("INVOICES CONSTRAINT:", r)
