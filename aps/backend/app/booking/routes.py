from flask import request, jsonify, current_app
import stripe
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.booking import booking_bp
from app.models import User, ParkingSlot, Booking, Invoice, SlotStatus, BookingStatus
from app import db
from datetime import datetime
import math
from app.auth.routes import super_admin_required

@booking_bp.route('/book', methods=['POST'])
@jwt_required()
def create_booking():
    """Create a new parking booking (End User)"""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    required = ['slot_id', 'vehicle_number']
    for field in required:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    # Get slot and validate
    slot = ParkingSlot.query.get_or_404(data['slot_id'])
    
    if slot.status != SlotStatus.available:
        return jsonify({'error': 'Slot is not available'}), 400
    
    # Get the effective price
    price_per_hour = slot.get_effective_price()
    
    # Create booking
    booking = Booking(
        user_id=user_id,
        slot_id=slot.id,
        vehicle_number=data['vehicle_number'],
        actual_price_per_hour=price_per_hour,
        start_time=datetime.utcnow()
    )
    
    # Mark slot as occupied
    slot.status = SlotStatus.occupied
    
    db.session.add(booking)
    db.session.commit()
    
    # Return booking pass details
    floor = slot.floor
    facility = floor.facility
    
    return jsonify({
        'booking': booking.to_dict(),
        'pass': {
            'booking_id': booking.id,
            'vehicle_number': booking.vehicle_number,
            'slot_number': slot.slot_number,
            'floor_name': floor.floor_name,
            'facility_name': facility.name,
            'facility_address': facility.address,
            'start_time': booking.start_time.isoformat(),
            'price_per_hour': price_per_hour
        }
    }), 201

@booking_bp.route('/<int:booking_id>/end', methods=['POST'])
@jwt_required()
def end_booking(booking_id):
    """End an active booking and generate invoice"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    booking = Booking.query.get_or_404(booking_id)
    
    # Check ownership
    if booking.user_id != user_id and user.role.value not in ['admin', 'super_admin']:
        return jsonify({'error': 'Permission denied'}), 403
    
    if booking.status != BookingStatus.active:
        return jsonify({'error': 'Booking is not active'}), 400
    
    # Set end time and calculate
    booking.end_time = datetime.utcnow()
    duration_seconds = (booking.end_time - booking.start_time).total_seconds()
    duration_hours = math.ceil(duration_seconds / 3600)  # Round up to nearest hour
    
    booking.duration_hours = duration_hours
    booking.total_amount = duration_hours * float(booking.actual_price_per_hour)
    booking.status = BookingStatus.completed
    
    # Free the slot
    slot = booking.slot
    slot.status = SlotStatus.available
    
    # Generate invoice
    invoice_number = f"INV-{datetime.utcnow().strftime('%Y%m%d')}-{str(booking.id).zfill(6)}"
    invoice = Invoice(
        booking_id=booking.id,
        invoice_number=invoice_number,
        vehicle_number=booking.vehicle_number,
        total_amount=booking.total_amount,
        duration_hours=booking.duration_hours
    )
    
    db.session.add(invoice)
    db.session.commit()
    
    return jsonify({
        'booking': booking.to_dict(),
        'invoice': invoice.to_dict()
    }), 200

@booking_bp.route('/my-bookings', methods=['GET'])
@jwt_required()
def get_my_bookings():
    """Get current user's bookings"""
    user_id = int(get_jwt_identity())
    status = request.args.get('status')
    
    query = Booking.query.filter_by(user_id=user_id)
    if status:
        query = query.filter_by(status=BookingStatus(status))
    
    bookings = query.order_by(Booking.created_at.desc()).all()
    
    result = []
    for b in bookings:
        b_dict = b.to_dict()
        slot = b.slot
        floor = slot.floor
        facility = floor.facility
        
        b_dict['slot_number'] = slot.slot_number
        b_dict['floor_name'] = floor.floor_name
        b_dict['facility_name'] = facility.name
        b_dict['facility_address'] = facility.address
        result.append(b_dict)
        
    return jsonify({'bookings': result}), 200

@booking_bp.route('/<int:booking_id>', methods=['GET'])
@jwt_required()
def get_booking(booking_id):
    """Get booking details with pass information"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    booking = Booking.query.get_or_404(booking_id)
    
    if booking.user_id != user_id and user.role.value not in ['admin', 'super_admin']:
        return jsonify({'error': 'Permission denied'}), 403
    
    slot = booking.slot
    floor = slot.floor
    facility = floor.facility
    area = facility.area
    city = area.city
    
    response = {
        'booking': booking.to_dict(),
        'slot': slot.to_dict(),
        'floor': floor.to_dict(),
        'facility': facility.to_dict(),
        'area': area.to_dict(),
        'city': city.to_dict(),
        'pass': {
            'booking_id': booking.id,
            'vehicle_number': booking.vehicle_number,
            'slot_number': slot.slot_number,
            'floor_name': floor.floor_name,
            'facility_name': facility.name,
            'facility_address': facility.address,
            'start_time': booking.start_time.isoformat(),
            'price_per_hour': float(booking.actual_price_per_hour)
        }
    }
    
    if booking.invoice:
        response['invoice'] = booking.invoice.to_dict()
    
    return jsonify(response), 200

@booking_bp.route('/invoices/<int:invoice_id>', methods=['GET'])
@jwt_required()
def get_invoice(invoice_id):
    """Get invoice details"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    invoice = Invoice.query.get_or_404(invoice_id)
    
    if invoice.booking.user_id != user_id and user.role.value not in ['admin', 'super_admin']:
        return jsonify({'error': 'Permission denied'}), 403
    
    return jsonify({'invoice': invoice.to_dict()}), 200

@booking_bp.route('/invoices/<int:invoice_id>/pay', methods=['POST'])
@jwt_required()
def pay_invoice(invoice_id):
    """Mark invoice as paid"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    invoice = Invoice.query.get_or_404(invoice_id)
    
    if invoice.booking.user_id != user_id and user.role.value not in ['admin', 'super_admin']:
        return jsonify({'error': 'Permission denied'}), 403
    
    data = request.get_json()
    invoice.paid = True
    invoice.payment_method = data.get('payment_method', 'cash')
    invoice.payment_date = datetime.utcnow()
    
    db.session.commit()
    return jsonify({'invoice': invoice.to_dict()}), 200

@booking_bp.route('/invoices/<int:invoice_id>/checkout-session', methods=['POST'])
@jwt_required()
def create_checkout_session(invoice_id):
    """Create a Stripe Checkout Session for an invoice"""
    stripe.api_key = current_app.config['STRIPE_SECRET_KEY']
    
    invoice = Invoice.query.get_or_404(invoice_id)
    user_id = int(get_jwt_identity())
    
    if invoice.booking.user_id != user_id:
        return jsonify({'error': 'Permission denied'}), 403
    
    if invoice.paid:
        return jsonify({'error': 'Invoice is already paid'}), 400

    try:
        # Stripe requires a minimum charge amount equivalent to $0.50 USD
        # For INR, we enforce a minimum of ₹50.00 to safely meet this requirement.
        amount_in_inr = float(invoice.total_amount)
        if amount_in_inr < 50.0:
            amount_in_inr = 50.0
            
        unit_amount = int(amount_in_inr * 100) # Amount in paise

        desc = f"Booking ID: {invoice.booking_id} | Duration: {invoice.duration_hours} hrs"
        if amount_in_inr == 50.0 and float(invoice.total_amount) < 50.0:
            desc += " (Includes Stripe min charge)"
            
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price_data': {
                        'currency': 'inr',
                        'product_data': {
                            'name': f"Parking Fee - {invoice.vehicle_number}",
                            'description': desc,
                        },
                        'unit_amount': unit_amount,
                    },
                    'quantity': 1,
                },
            ],
            mode='payment',
            success_url='http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url='http://localhost:5173/payment-cancel',
            metadata={
                'invoice_id': invoice.id,
                'booking_id': invoice.booking_id
            }
        )
        return jsonify({'url': checkout_session.url}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@booking_bp.route('/checkout-session/<session_id>', methods=['GET'])
@jwt_required()
def get_checkout_session(session_id):
    """Retrieve Stripe Checkout Session and associated invoice info"""
    stripe.api_key = current_app.config['STRIPE_SECRET_KEY']
    try:
        session = stripe.checkout.Session.retrieve(session_id)
        # Handle StripeObject which doesn't have a get() method
        invoice_id = getattr(session.metadata, 'invoice_id', None) if session.metadata else None
        
        invoice = Invoice.query.get(invoice_id) if invoice_id else None
        
        if not invoice:
            return jsonify({'error': 'Invoice not found'}), 404
            
        # Synchronously update the invoice status if the payment is complete
        # This handles cases where the webhook might be delayed or unavailable (local testing)
        if session.payment_status == 'paid' and not invoice.paid:
            invoice.paid = True
            invoice.payment_method = 'stripe'
            invoice.payment_date = datetime.utcnow()
            db.session.commit()
            
        return jsonify({
            'status': session.payment_status,
            'amount_total': (session.amount_total / 100) if session.amount_total else 0,
            'duration': float(invoice.duration_hours),
            'invoice_number': invoice.invoice_number,
            'vehicle_number': invoice.vehicle_number,
            'facility_name': invoice.booking.slot.floor.facility.name
        }), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

@booking_bp.route('/webhook', methods=['POST'])
def stripe_webhook():
    """Handle Stripe Webhook events"""
    payload = request.get_data()
    sig_header = request.headers.get('Stripe-Signature')
    endpoint_secret = current_app.config['STRIPE_WEBHOOK_SECRET']

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        # Invalid payload
        return jsonify({'error': 'Invalid payload'}), 400
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        return jsonify({'error': 'Invalid signature'}), 400

    # Handle the checkout.session.completed event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        
        # Fulfill the purchase...
        invoice_id = session.get('metadata', {}).get('invoice_id')
        if invoice_id:
            invoice = Invoice.query.get(invoice_id)
            if invoice:
                invoice.paid = True
                invoice.payment_method = 'stripe'
                invoice.payment_date = datetime.utcnow()
                db.session.commit()
                print(f"Invoice {invoice_id} marked as paid via Stripe.")

    return jsonify({'status': 'success'}), 200

@booking_bp.route('/all', methods=['GET'])
@super_admin_required
def get_all_bookings():
    """Retrieve all bookings across the system (Super Admin)"""
    bookings = Booking.query.order_by(Booking.created_at.desc()).all()
    
    result = []
    for booking in bookings:
        b_data = booking.to_dict()
        # Add some context (facility, floor, slot)
        slot = booking.slot
        floor = slot.floor
        facility = floor.facility
        
        b_data['facility_name'] = facility.name
        b_data['floor_name'] = floor.floor_name
        b_data['slot_number'] = slot.slot_number
        b_data['user_name'] = f"{booking.user.first_name} {booking.user.last_name}"
        b_data['user_email'] = booking.user.email
        
        result.append(b_data)
        
    return jsonify({'bookings': result}), 200
