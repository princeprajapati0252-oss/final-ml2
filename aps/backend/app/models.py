from app import db
from datetime import datetime
import enum

# Enums
class UserRole(enum.Enum):
    super_admin = 'super_admin'
    admin = 'admin'
    end_user = 'end_user'

class SlotStatus(enum.Enum):
    available = 'available'
    occupied = 'occupied'
    maintenance = 'maintenance'

class BookingStatus(enum.Enum):
    active = 'active'
    completed = 'completed'
    cancelled = 'cancelled'

# Models
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    role = db.Column(db.Enum(UserRole, name='user_role'), nullable=False, default=UserRole.end_user)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    facilities = db.relationship('ParkingFacility', backref='owner', lazy='dynamic')
    bookings = db.relationship('Booking', backref='user', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'phone': self.phone,
            'role': self.role.value,
            'is_active': self.is_active
        }

class City(db.Model):
    __tablename__ = 'cities'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    areas = db.relationship('Area', backref='city', lazy='dynamic', cascade='all, delete-orphan', passive_deletes=True)
    
    def to_dict(self):
        return {'id': self.id, 'name': self.name, 'slug': self.slug}

class Area(db.Model):
    __tablename__ = 'areas'
    
    id = db.Column(db.Integer, primary_key=True)
    city_id = db.Column(db.Integer, db.ForeignKey('cities.id', ondelete='CASCADE'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    facilities = db.relationship('ParkingFacility', backref='area', lazy='dynamic', cascade='all, delete-orphan', passive_deletes=True)
    
    __table_args__ = (db.UniqueConstraint('city_id', 'name'),)
    
    def to_dict(self):
        return {'id': self.id, 'city_id': self.city_id, 'name': self.name}

class ParkingFacility(db.Model):
    __tablename__ = 'parking_facilities'
    
    id = db.Column(db.Integer, primary_key=True)
    area_id = db.Column(db.Integer, db.ForeignKey('areas.id', ondelete='CASCADE'), nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'))
    name = db.Column(db.String(255), nullable=False)
    address = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    floors = db.relationship('ParkingFloor', backref='facility', lazy='dynamic', cascade='all, delete-orphan', passive_deletes=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'area_id': self.area_id,
            'owner_id': self.owner_id,
            'name': self.name,
            'address': self.address,
            'description': self.description,
            'is_active': self.is_active
        }

class ParkingFloor(db.Model):
    __tablename__ = 'parking_floors'
    
    id = db.Column(db.Integer, primary_key=True)
    facility_id = db.Column(db.Integer, db.ForeignKey('parking_facilities.id', ondelete='CASCADE'), nullable=False)
    floor_number = db.Column(db.Integer, nullable=False)
    floor_name = db.Column(db.String(100), nullable=False)
    price_per_hour = db.Column(db.Numeric(10, 2), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    slots = db.relationship('ParkingSlot', backref='floor', lazy='dynamic', cascade='all, delete-orphan', passive_deletes=True)
    
    __table_args__ = (db.UniqueConstraint('facility_id', 'floor_number'),)
    
    def to_dict(self):
        return {
            'id': self.id,
            'facility_id': self.facility_id,
            'floor_number': self.floor_number,
            'floor_name': self.floor_name,
            'price_per_hour': float(self.price_per_hour)
        }

class ParkingSlot(db.Model):
    __tablename__ = 'parking_slots'
    
    id = db.Column(db.Integer, primary_key=True)
    floor_id = db.Column(db.Integer, db.ForeignKey('parking_floors.id', ondelete='CASCADE'), nullable=False)
    slot_number = db.Column(db.String(20), nullable=False)
    status = db.Column(db.Enum(SlotStatus, name='slot_status'), default=SlotStatus.available)
    slot_price_override = db.Column(db.Numeric(10, 2))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    bookings = db.relationship('Booking', backref='slot', lazy='dynamic', cascade='all, delete-orphan', passive_deletes=True)
    
    __table_args__ = (db.UniqueConstraint('floor_id', 'slot_number'),)
    
    def get_effective_price(self):
        if self.slot_price_override:
            return float(self.slot_price_override)
        return float(self.floor.price_per_hour)
    
    def to_dict(self):
        return {
            'id': self.id,
            'floor_id': self.floor_id,
            'slot_number': self.slot_number,
            'status': self.status.value,
            'price_per_hour': self.get_effective_price()
        }

class Booking(db.Model):
    __tablename__ = 'bookings'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    slot_id = db.Column(db.Integer, db.ForeignKey('parking_slots.id', ondelete='CASCADE'), nullable=False)
    vehicle_number = db.Column(db.String(50), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    end_time = db.Column(db.DateTime)
    duration_hours = db.Column(db.Numeric(10, 2))
    actual_price_per_hour = db.Column(db.Numeric(10, 2), nullable=False)
    total_amount = db.Column(db.Numeric(10, 2))
    status = db.Column(db.Enum(BookingStatus, name='booking_status'), default=BookingStatus.active)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    invoice = db.relationship('Invoice', backref='booking', uselist=False, cascade='all, delete-orphan', passive_deletes=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'slot_id': self.slot_id,
            'vehicle_number': self.vehicle_number,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'duration_hours': float(self.duration_hours) if self.duration_hours else None,
            'actual_price_per_hour': float(self.actual_price_per_hour),
            'total_amount': float(self.total_amount) if self.total_amount else None,
            'status': self.status.value
        }

class Invoice(db.Model):
    __tablename__ = 'invoices'
    
    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id', ondelete='CASCADE'), nullable=False)
    invoice_number = db.Column(db.String(50), unique=True, nullable=False)
    vehicle_number = db.Column(db.String(50), nullable=False)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    duration_hours = db.Column(db.Numeric(10, 2), nullable=False)
    issued_at = db.Column(db.DateTime, default=datetime.utcnow)
    paid = db.Column(db.Boolean, default=False)
    payment_method = db.Column(db.String(50))
    payment_date = db.Column(db.DateTime)
    
    def to_dict(self):
        return {
            'id': self.id,
            'booking_id': self.booking_id,
            'invoice_number': self.invoice_number,
            'vehicle_number': self.vehicle_number,
            'total_amount': float(self.total_amount),
            'duration_hours': float(self.duration_hours),
            'issued_at': self.issued_at.isoformat() if self.issued_at else None,
            'paid': self.paid,
            'payment_method': self.payment_method
        }
#ad@123