from flask import Blueprint

parking_bp = Blueprint('parking', __name__)

from app.parking import routes
