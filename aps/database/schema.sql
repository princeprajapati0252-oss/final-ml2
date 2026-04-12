-- =====================================================
-- AUTOMATED PARKING SYSTEM - REDESIGNED DATABASE SCHEMA
-- Hierarchy: City -> Area -> Facility -> Floor -> Slot
-- Database: PostgreSQL
-- =====================================================

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS parking_slots CASCADE;
DROP TABLE IF EXISTS parking_floors CASCADE;
DROP TABLE IF EXISTS parking_facilities CASCADE;
DROP TABLE IF EXISTS areas CASCADE;
DROP TABLE IF EXISTS cities CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing types if they exist
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS slot_status CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;

-- =====================================================
-- ENUMS (Custom Types)
-- =====================================================

CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'end_user');
CREATE TYPE slot_status AS ENUM ('available', 'occupied', 'maintenance');
CREATE TYPE booking_status AS ENUM ('active', 'completed', 'cancelled');

-- =====================================================
-- TABLES
-- =====================================================

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role user_role NOT NULL DEFAULT 'end_user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Cities Table
CREATE TABLE cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Areas Table
CREATE TABLE areas (
    id SERIAL PRIMARY KEY,
    city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(city_id, name)
);

-- Parking Facilities Table
CREATE TABLE parking_facilities (
    id SERIAL PRIMARY KEY,
    area_id INTEGER NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Parking Floors Table
CREATE TABLE parking_floors (
    id SERIAL PRIMARY KEY,
    facility_id INTEGER NOT NULL REFERENCES parking_facilities(id) ON DELETE CASCADE,
    floor_number INTEGER NOT NULL,
    floor_name VARCHAR(100) NOT NULL,
    price_per_hour DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(facility_id, floor_number)
);

-- Parking Slots Table
CREATE TABLE parking_slots (
    id SERIAL PRIMARY KEY,
    floor_id INTEGER NOT NULL REFERENCES parking_floors(id) ON DELETE CASCADE,
    slot_number VARCHAR(20) NOT NULL,
    status slot_status DEFAULT 'available',
    slot_price_override DECIMAL(10, 2), -- Optional override for slot-specific pricing
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(floor_id, slot_number)
);

-- Bookings Table
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    slot_id INTEGER NOT NULL REFERENCES parking_slots(id) ON DELETE CASCADE,
    vehicle_number VARCHAR(50) NOT NULL,
    start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    duration_hours DECIMAL(10, 2),
    actual_price_per_hour DECIMAL(10, 2) NOT NULL, -- Captured at time of booking
    total_amount DECIMAL(10, 2),
    status booking_status DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices Table
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_number VARCHAR(50) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    duration_hours DECIMAL(10, 2) NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid BOOLEAN DEFAULT FALSE,
    payment_method VARCHAR(50),
    payment_date TIMESTAMP
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_cities_name ON cities(name);
CREATE INDEX idx_areas_city ON areas(city_id);
CREATE INDEX idx_facilities_area ON parking_facilities(area_id);
CREATE INDEX idx_floors_facility ON parking_floors(facility_id);
CREATE INDEX idx_slots_floor ON parking_slots(floor_id);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_slot ON bookings(slot_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- =====================================================
-- TRIGGERS (Auto-update timestamps)
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON parking_facilities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_floors_updated_at BEFORE UPDATE ON parking_floors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_slots_updated_at BEFORE UPDATE ON parking_slots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INITIAL DATA (Sample Data)
-- =====================================================

-- Users
INSERT INTO users (email, password_hash, first_name, last_name, role)
VALUES 
    ('superadmin@parking.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqNVwfBFdG', 'Super', 'Admin', 'super_admin'),
    ('admin@parking.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqNVwfBFdG', 'John', 'Doe', 'admin'),
    ('user@parking.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqNVwfBFdG', 'Jane', 'Smith', 'end_user');

-- Cities
INSERT INTO cities (name, slug) VALUES ('New York', 'new-york'), ('Los Angeles', 'los-angeles');

-- Areas
INSERT INTO areas (city_id, name) VALUES (1, 'Manhattan'), (1, 'Brooklyn'), (2, 'Santa Monica'), (2, 'Hollywood');

-- Facilities
INSERT INTO parking_facilities (area_id, owner_id, name, address) 
VALUES 
    (1, 2, 'Manhattan Central Park Parking', '123 Central Park S, NY'),
    (1, 2, 'Times Square Secure Parking', '456 Broadway, NY');

-- Floors for Manhattan Central Park
INSERT INTO parking_floors (facility_id, floor_number, floor_name, price_per_hour)
VALUES 
    (1, 1, 'Ground Floor', 10.00),
    (1, 2, 'Level 1', 8.00);

-- Slots for Ground Floor
INSERT INTO parking_slots (floor_id, slot_number, slot_price_override)
SELECT 1, 'G-' || LPAD(s::TEXT, 3, '0'), CASE WHEN s <= 5 THEN 12.00 ELSE NULL END
FROM generate_series(1, 10) AS s;

-- =====================================================
-- VIEWS
-- =====================================================

-- Search view
CREATE OR REPLACE VIEW search_parking_view AS
SELECT 
    c.name AS city_name,
    a.name AS area_name,
    f.id AS facility_id,
    f.name AS facility_name,
    f.address,
    fl.id AS floor_id,
    fl.floor_name,
    fl.price_per_hour AS base_floor_price,
    ps.id AS slot_id,
    ps.slot_number,
    COALESCE(ps.slot_price_override, fl.price_per_hour) AS current_slot_price,
    ps.status
FROM cities c
JOIN areas a ON c.id = a.city_id
JOIN parking_facilities f ON a.id = f.area_id
JOIN parking_floors fl ON f.id = fl.facility_id
JOIN parking_slots ps ON fl.id = ps.floor_id
WHERE f.is_active = TRUE;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- End booking and generate invoice
CREATE OR REPLACE FUNCTION conclude_booking(
    p_booking_id INTEGER
)
RETURNS INTEGER AS $$
DECLARE
    v_total_amount DECIMAL(10, 2);
    v_duration_hours DECIMAL(10, 2);
    v_invoice_id INTEGER;
    v_booking RECORD;
BEGIN
    SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id AND status = 'active';
    IF NOT FOUND THEN RAISE EXCEPTION 'Active booking not found'; END IF;

    -- Update end time
    UPDATE bookings SET end_time = CURRENT_TIMESTAMP, status = 'completed' WHERE id = p_booking_id;
    
    -- Recalculate duration and amount
    SELECT 
        CEIL(EXTRACT(EPOCH FROM (end_time - start_time)) / 3600) INTO v_duration_hours
    FROM bookings WHERE id = p_booking_id;
    
    v_total_amount := v_duration_hours * v_booking.actual_price_per_hour;
    
    UPDATE bookings SET duration_hours = v_duration_hours, total_amount = v_total_amount WHERE id = p_booking_id;
    
    -- Free the slot
    UPDATE parking_slots SET status = 'available' WHERE id = v_booking.slot_id;
    
    -- Generate Invoice
    INSERT INTO invoices (booking_id, invoice_number, vehicle_number, total_amount, duration_hours)
    VALUES (
        p_booking_id, 
        'INV-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(p_booking_id::TEXT, 6, '0'),
        v_booking.vehicle_number,
        v_total_amount,
        v_duration_hours
    ) RETURNING id INTO v_invoice_id;
    
    RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql;
