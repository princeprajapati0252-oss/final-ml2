# Database Schema Documentation (Hierarchical Design)

## Overview
This document provides detailed information about the PostgreSQL database schema for the Automated Parking System, redesigned for a hierarchical search flow: **City -> Area -> Parking Facility -> Floor -> Slot**.

## Database Setup

### Step-by-Step Setup

#### 1. Create Database
```bash
sudo -u postgres psql
CREATE DATABASE parking_system;
CREATE USER parking_admin WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE parking_system TO parking_admin;
\q
```

#### 2. Run Schema File
```bash
psql -U parking_admin -d parking_system -f schema.sql
```

## Entity Hierarchy

1.  **City**: The top-level location (e.g., New York).
2.  **Area**: Specific neighborhood within a city (e.g., Manhattan).
3.  **Parking Facility**: The actual physical building or lot (e.g., Central Park Parking).
4.  **Floor**: Different levels within a facility, each with its own base price.
5.  **Slot**: Individual parking spots, which can have specific price overrides.

---

## Tables

### 1. cities
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | PK |
| name | VARCHAR | Unique city name |
| slug | VARCHAR | URL-friendly name |

### 2. areas
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | PK |
| city_id | INTEGER | FK to cities |
| name | VARCHAR | Area name |

### 3. parking_facilities
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | PK |
| area_id | INTEGER | FK to areas |
| owner_id | INTEGER | FK to users (Admin/Owner) |
| name | VARCHAR | Name of the parking spot |
| address | TEXT | Full address |

### 4. parking_floors
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | PK |
| facility_id| INTEGER | FK to facilities |
| floor_number| INTEGER | Floor rank |
| price_per_hour| DECIMAL | Base hourly rate for this floor |

### 5. parking_slots
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | PK |
| floor_id | INTEGER | FK to floors |
| slot_number| VARCHAR | e.g., G-001 |
| status | ENUM | available, occupied, maintenance |
| slot_price_override | DECIMAL | Optional custom price for this specific slot |

### 6. bookings
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | PK |
| user_id | INTEGER | FK to users |
| slot_id | INTEGER | FK to slots |
| vehicle_number| VARCHAR | User's vehicle ID |
| start_time | TIMESTAMP| Booking start |
| actual_price_per_hour| DECIMAL | Locked price at time of booking |

---

## Key Features

### Dynamic Pricing
The system calculates price based on:
1.  The floor's `price_per_hour`.
2.  An optional `slot_price_override` if the specific spot is premium.

### Hierarchical Search View
A view `search_parking_view` is provided to easily query the entire hierarchy for the frontend discovery flow.

```sql
SELECT * FROM search_parking_view WHERE city_name = 'New York' AND area_name = 'Manhattan';
```

### Stored Procedures
- `conclude_booking(booking_id)`: Ends a booking, updates slot status to available, calculates final amount, and generates an invoice.

## Sample Data
Includes:
- **Cities**: New York, Los Angeles
- **Areas**: Manhattan, Brooklyn, Santa Monica, Hollywood
- **Sample Facility**: Manhattan Central Park Parking with 2 floors and 10 slots.
