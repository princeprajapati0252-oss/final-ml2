from flask import Blueprint

booking_bp = Blueprint('booking', __name__)

from app.booking import routes
