from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.parking import parking_bp
from app.models import User, City, Area, ParkingFacility, ParkingFloor, ParkingSlot, UserRole, SlotStatus, Booking, BookingStatus
from app import db
from functools import wraps
from datetime import datetime

def admin_required(f):
    @wraps(f)
    @jwt_required()
    def decorated(*args, **kwargs):
        user_id = get_jwt_identity()
        from app.models import User
        user = User.query.get(int(user_id))
        if not user or user.role.value not in ['admin', 'super_admin']:
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated

def super_admin_required(f):
    @wraps(f)
    @jwt_required()
    def decorated(*args, **kwargs):
        user_id = get_jwt_identity()
        from app.models import User
        user = User.query.get(int(user_id))
        if not user or user.role.value != 'super_admin':
            return jsonify({'error': 'Super Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated

# ======== Cities ========
@parking_bp.route('/cities', methods=['POST'])
@admin_required
def create_city():
    data = request.get_json()
    if not data.get('name'):
        return jsonify({'error': 'City name is required'}), 400
    
    slug = data.get('slug') or data['name'].lower().replace(' ', '-')
    city = City(name=data['name'], slug=slug)
    db.session.add(city)
    db.session.commit()
    return jsonify({'city': city.to_dict()}), 201

# ======== Areas ========
@parking_bp.route('/cities/<int:city_id>/areas', methods=['POST'])
@admin_required
def create_area(city_id):
    data = request.get_json()
    if not data.get('name'):
        return jsonify({'error': 'Area name is required'}), 400
    
    area = Area(city_id=city_id, name=data['name'])
    db.session.add(area)
    db.session.commit()
    return jsonify({'area': area.to_dict()}), 201

# ======== Facilities ========
@parking_bp.route('/facilities', methods=['POST'])
@admin_required
def create_facility():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    required = ['area_id', 'name', 'address']
    for field in required:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    facility = ParkingFacility(
        area_id=data['area_id'],
        owner_id=user_id,
        name=data['name'],
        address=data['address'],
        description=data.get('description')
    )
    db.session.add(facility)
    db.session.commit()
    return jsonify({'facility': facility.to_dict()}), 201

@parking_bp.route('/my-facilities', methods=['GET'])
@admin_required
def get_my_facilities():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    # Super admins see all facilities; regular admins see only their own
    if user and user.role.value == 'super_admin':
        facilities = ParkingFacility.query.all()
    else:
        facilities = ParkingFacility.query.filter_by(owner_id=user_id).all()
    
    result = []
    for facility in facilities:
        f_data = facility.to_dict()
        # Add some summary stats
        total_slots = 0
        occupied_slots = 0
        for floor in facility.floors:
            total_slots += ParkingSlot.query.filter_by(floor_id=floor.id).count()
            occupied_slots += ParkingSlot.query.filter_by(floor_id=floor.id, status=SlotStatus.occupied).count()
        
        f_data['total_slots'] = total_slots
        f_data['occupied_slots'] = occupied_slots
        result.append(f_data)
        
    return jsonify({'facilities': result}), 200

@parking_bp.route('/all-facilities', methods=['GET'])
@super_admin_required
def get_all_facilities():
    facilities = ParkingFacility.query.all()
    
    result = []
    for facility in facilities:
        f_data = facility.to_dict()
        # Add stats
        total_slots = 0
        occupied_slots = 0
        for floor in facility.floors:
            total_slots += ParkingSlot.query.filter_by(floor_id=floor.id).count()
            occupied_slots += ParkingSlot.query.filter_by(floor_id=floor.id, status=SlotStatus.occupied).count()
        
        f_data['total_slots'] = total_slots
        f_data['occupied_slots'] = occupied_slots
        # Add owner info
        if facility.owner:
            f_data['owner_name'] = f"{facility.owner.first_name} {facility.owner.last_name}"
            f_data['owner_email'] = facility.owner.email
            
        result.append(f_data)
        
    return jsonify({'facilities': result}), 200

@parking_bp.route('/facilities/<int:facility_id>/analytics', methods=['GET'])
@admin_required
def get_facility_analytics(facility_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    facility = ParkingFacility.query.get_or_404(facility_id)
    
    if facility.owner_id != user_id and user.role.value != 'super_admin':
        return jsonify({'error': 'Permission denied'}), 403
        
    from sqlalchemy import func
    
    # Basic stats
    total_bookings = Booking.query.join(ParkingSlot).join(ParkingFloor).filter(ParkingFloor.facility_id == facility_id).count()
    active_bookings = Booking.query.join(ParkingSlot).join(ParkingFloor).filter(ParkingFloor.facility_id == facility_id, Booking.status == BookingStatus.active).count()
    
    # Today's local date start
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Revenue today (completed bookings finished today)
    # Using coalesce to handle None and casting to float for JSON compatibility
    today_revenue_res = db.session.query(func.coalesce(func.sum(Booking.total_amount), 0)).join(ParkingSlot).join(ParkingFloor)\
        .filter(ParkingFloor.facility_id == facility_id, Booking.end_time >= today_start).scalar()
    
    today_revenue = float(today_revenue_res) if today_revenue_res else 0.0
        
    # Occupancy rate
    total_slots = 0
    for floor in facility.floors:
        total_slots += ParkingSlot.query.filter_by(floor_id=floor.id).count()
        
    occupancy_rate = (active_bookings / total_slots * 100) if total_slots > 0 else 0
    
    return jsonify({
        'analytics': {
            'total_bookings': total_bookings,
            'active_bookings': active_bookings,
            'today_revenue': float(today_revenue),
            'occupancy_rate': round(occupancy_rate, 2),
            'total_slots': total_slots
        }
    }), 200

@parking_bp.route('/facilities/<int:facility_id>', methods=['PUT'])
@admin_required
def update_facility(facility_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    facility = ParkingFacility.query.get_or_404(facility_id)
    
    # Only owner or super_admin can update
    if facility.owner_id != user_id and user.role.value != 'super_admin':
        return jsonify({'error': 'Permission denied'}), 403
    
    data = request.get_json()
    if 'name' in data:
        facility.name = data['name']
    if 'address' in data:
        facility.address = data['address']
    if 'description' in data:
        facility.description = data['description']
    if 'is_active' in data:
        facility.is_active = data['is_active']
    
    db.session.commit()
    return jsonify({'facility': facility.to_dict()}), 200

# ======== Floors ========
@parking_bp.route('/facilities/<int:facility_id>/floors', methods=['POST'])
@admin_required
def create_floor(facility_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    facility = ParkingFacility.query.get_or_404(facility_id)
    
    if facility.owner_id != user_id and user.role.value != 'super_admin':
        return jsonify({'error': 'Permission denied'}), 403
    
    data = request.get_json()
    required = ['floor_number', 'floor_name', 'price_per_hour']
    for field in required:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    floor = ParkingFloor(
        facility_id=facility_id,
        floor_number=data['floor_number'],
        floor_name=data['floor_name'],
        price_per_hour=data['price_per_hour']
    )
    db.session.add(floor)
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        # Handle duplicate floor number gracefully
        if 'UniqueViolation' in str(e) or 'IntegrityError' in str(type(e).__name__):
            return jsonify({'error': 'A floor with this number already exists in this facility.'}), 400
        return jsonify({'error': 'Failed to create floor: ' + str(e)}), 500
        
    return jsonify({'floor': floor.to_dict()}), 201

@parking_bp.route('/floors/<int:floor_id>', methods=['PUT'])
@admin_required
def update_floor(floor_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    floor = ParkingFloor.query.get_or_404(floor_id)
    
    if floor.facility.owner_id != user_id and user.role.value != 'super_admin':
        return jsonify({'error': 'Permission denied'}), 403
    
    data = request.get_json()
    if 'floor_name' in data:
        floor.floor_name = data['floor_name']
    if 'price_per_hour' in data:
        floor.price_per_hour = data['price_per_hour']
    
    db.session.commit()
    return jsonify({'floor': floor.to_dict()}), 200

@parking_bp.route('/floors/<int:floor_id>', methods=['DELETE'])
@admin_required
def delete_floor(floor_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    floor = ParkingFloor.query.get_or_404(floor_id)
    
    if floor.facility.owner_id != user_id and user.role.value != 'super_admin':
        return jsonify({'error': 'Permission denied'}), 403
    
    db.session.delete(floor)
    db.session.commit()
    return jsonify({'message': 'Floor deleted successfully'}), 200

# ======== Slots ========
@parking_bp.route('/floors/<int:floor_id>/slots', methods=['GET'])
@admin_required
def get_floor_slots_admin(floor_id):
    """Retrieve all slots for a floor (Admin version)"""
    floor = ParkingFloor.query.get_or_404(floor_id)
    slots = ParkingSlot.query.filter_by(floor_id=floor_id).order_by(ParkingSlot.slot_number).all()
    return jsonify({'slots': [s.to_dict() for s in slots]}), 200

@parking_bp.route('/floors/<int:floor_id>/slots', methods=['POST'])
@admin_required
def create_slot(floor_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    floor = ParkingFloor.query.get_or_404(floor_id)
    
    if floor.facility.owner_id != user_id and user.role.value != 'super_admin':
        return jsonify({'error': 'Permission denied'}), 403
    
    data = request.get_json()
    if not data.get('slot_number'):
        return jsonify({'error': 'slot_number is required'}), 400
    
    slot = ParkingSlot(
        floor_id=floor_id,
        slot_number=data['slot_number'],
        slot_price_override=data.get('slot_price_override')
    )
    db.session.add(slot)
    db.session.commit()
    return jsonify({'slot': slot.to_dict()}), 201

@parking_bp.route('/floors/<int:floor_id>/slots/bulk', methods=['POST'])
@admin_required
def create_slots_bulk(floor_id):
    """Create multiple slots at once"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    floor = ParkingFloor.query.get_or_404(floor_id)
    
    if floor.facility.owner_id != user_id and user.role.value != 'super_admin':
        return jsonify({'error': 'Permission denied'}), 403
    
    data = request.get_json()
    prefix = data.get('prefix', 'S')
    try:
        count = int(data.get('count', 10))
    except (ValueError, TypeError):
        count = 10
    
    # Find existing slots with the same prefix
    existing_slots = ParkingSlot.query.filter(ParkingSlot.floor_id == floor_id, ParkingSlot.slot_number.like(f'{prefix}-%')).all()
    
    existing_numbers = []
    slot_map = {}
    for slot in existing_slots:
        try:
            parts = slot.slot_number.split('-')
            if len(parts) >= 2:
                num = int(parts[1])
                existing_numbers.append(num)
                slot_map[num] = slot
        except (IndexError, ValueError):
            pass
            
    # Add missing slots up to count
    new_slots = []
    for idx in range(1, count + 1):
        if idx not in existing_numbers:
            slot_number = f'{prefix}-{str(idx).zfill(3)}'
            slot = ParkingSlot(
                floor_id=floor_id,
                slot_number=slot_number
            )
            db.session.add(slot)
            new_slots.append(slot)
            
    # Delete slots above count
    for num in existing_numbers:
        if num > count:
            db.session.delete(slot_map[num])
            
    try:
        db.session.commit()
        all_slots = ParkingSlot.query.filter_by(floor_id=floor_id).all()
        return jsonify({'slots': [s.to_dict() for s in all_slots]}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to resize slots. Some may be in use.'}), 500

@parking_bp.route('/slots/<int:slot_id>', methods=['PUT'])
@admin_required
def update_slot(slot_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    slot = ParkingSlot.query.get_or_404(slot_id)
    
    if slot.floor.facility.owner_id != user_id and user.role.value != 'super_admin':
        return jsonify({'error': 'Permission denied'}), 403
    
    data = request.get_json()
    if 'slot_price_override' in data:
        slot.slot_price_override = data['slot_price_override']
    if 'status' in data:
        from app.models import SlotStatus
        slot.status = SlotStatus(data['status'])
    
    db.session.commit()
    return jsonify({'slot': slot.to_dict()}), 200
