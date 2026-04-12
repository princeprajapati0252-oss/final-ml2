from flask import request, jsonify
from app.search import search_bp
from app.models import City, Area, ParkingFacility, ParkingFloor, ParkingSlot, SlotStatus

@search_bp.route('/cities', methods=['GET'])
def get_cities():
    """Get all cities, optionally filter by name"""
    query = request.args.get('q', '')
    cities = City.query.filter(City.name.ilike(f'%{query}%')).all()
    return jsonify({'cities': [c.to_dict() for c in cities]}), 200

@search_bp.route('/cities/<int:city_id>/areas', methods=['GET'])
def get_areas(city_id):
    """Get areas for a specific city"""
    areas = Area.query.filter_by(city_id=city_id).all()
    return jsonify({'areas': [a.to_dict() for a in areas]}), 200

@search_bp.route('/areas/<int:area_id>/facilities', methods=['GET'])
def get_facilities(area_id):
    """Get parking facilities for a specific area"""
    facilities = ParkingFacility.query.filter_by(area_id=area_id, is_active=True).all()
    return jsonify({'facilities': [f.to_dict() for f in facilities]}), 200

@search_bp.route('/facilities/<int:facility_id>/floors', methods=['GET'])
def get_floors(facility_id):
    """Get floors for a specific facility"""
    floors = ParkingFloor.query.filter_by(facility_id=facility_id).order_by(ParkingFloor.floor_number).all()
    
    result = []
    for floor in floors:
        floor_data = floor.to_dict()
        # Get slot counts
        available = ParkingSlot.query.filter_by(floor_id=floor.id, status=SlotStatus.available).count()
        total = ParkingSlot.query.filter_by(floor_id=floor.id).count()
        floor_data['available_slots'] = available
        floor_data['total_slots'] = total
        result.append(floor_data)
    
    return jsonify({'floors': result}), 200

@search_bp.route('/floors/<int:floor_id>/slots', methods=['GET'])
def get_slots(floor_id):
    """Get all slots for a specific floor"""
    status_filter = request.args.get('status')
    
    query = ParkingSlot.query.filter_by(floor_id=floor_id)
    if status_filter:
        query = query.filter_by(status=SlotStatus(status_filter))
    
    slots = query.order_by(ParkingSlot.slot_number).all()
    return jsonify({'slots': [s.to_dict() for s in slots]}), 200

@search_bp.route('/slots/<int:slot_id>', methods=['GET'])
def get_slot_details(slot_id):
    """Get detailed info about a specific slot"""
    slot = ParkingSlot.query.get_or_404(slot_id)
    floor = slot.floor
    facility = floor.facility
    area = facility.area
    city = area.city
    
    return jsonify({
        'slot': slot.to_dict(),
        'floor': floor.to_dict(),
        'facility': facility.to_dict(),
        'area': area.to_dict(),
        'city': city.to_dict()
    }), 200
