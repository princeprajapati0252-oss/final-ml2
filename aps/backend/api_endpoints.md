# Automated Parking System - API Endpoints Guide

This file contains all the API endpoints, methods, and dummy JSON data for manual testing.

## 1. Authentication

### **User Registration**
*   **URL:** `http://localhost:5000/api/auth/register`
*   **Method:** `POST`
*   **JSON Data:**
```json
{
  "email": "testuser1@example.com",
  "password": "Test@1234",
  "first_name": "Ghanshyam",
  "last_name": "Test",
  "phone": "9876543210"
}
```

### **User Login**
*   **URL:** `http://localhost:5000/api/auth/login`
*   **Method:** `POST`
*   **JSON Data:**
```json
{
  "email": "testuser1@example.com",
  "password": "Test@1234"
}
```
*(Copy the `access_token` from the response to use in protected requests)*

### **Get Current User Profile**
*   **URL:** `http://localhost:5000/api/auth/me`
*   **Method:** `GET`
*   **Headers:** `Authorization: Bearer <your_access_token>`

### **Create Admin Account (Super Admin Only)**
*   **URL:** `http://localhost:5000/api/auth/admin`
*   **Method:** `POST`
*   **Headers:** `Authorization: Bearer <super_admin_access_token>`
*   **JSON Data:**
```json
{
  "email": "newadmin@example.com",
  "password": "Password@123",
  "first_name": "New",
  "last_name": "Admin",
  "phone": "1234567890"
}
```

---

## 2. Search & Discovery (Hierarchical)

### **Get All Cities**
*   **URL:** `http://localhost:5000/api/search/cities`
*   **Method:** `GET`

### **Get Areas in a City**
*   **URL:** `http://localhost:5000/api/search/cities/1/areas`
*   **Method:** `GET`
*(Replace `1` with the actual City ID)*

### **Get Facilities in an Area**
*   **URL:** `http://localhost:5000/api/search/areas/1/facilities`
*   **Method:** `GET`
*(Replace `1` with the actual Area ID)*

### **Get Floors in a Facility**
*   **URL:** `http://localhost:5000/api/search/facilities/1/floors`
*   **Method:** `GET`
*(Replace `1` with the actual Facility ID)*

### **Get Available Slots on a Floor**
*   **URL:** `http://localhost:5000/api/search/floors/1/slots?status=available`
*   **Method:** `GET`
*(Replace `1` with the actual Floor ID)*

### **Get Specific Slot Details**
*   **URL:** `http://localhost:5000/api/search/slots/1`
*   **Method:** `GET`

---

## 3. Booking & Invoicing

### **Book a Parking Slot**
*   **URL:** `http://localhost:5000/api/booking/book`
*   **Method:** `POST`
*   **Headers:** `Authorization: Bearer <your_access_token>`
*   **JSON Data:**
```json
{
  "slot_id": 1,
  "vehicle_number": "MH-12-AB-1234"
}
```

### **End Booking & Generate Invoice**
*   **URL:** `http://localhost:5000/api/booking/1/end`
*   **Method:** `POST`
*   **Headers:** `Authorization: Bearer <your_access_token>`
*(Replace `1` with your Booking ID)*

### **Get My Bookings**
*   **URL:** `http://localhost:5000/api/booking/my-bookings`
*   **Method:** `GET`
*   **Headers:** `Authorization: Bearer <your_access_token>`

### **Pay for an Invoice**
*   **URL:** `http://localhost:5000/api/booking/invoices/1/pay`
*   **Method:** `POST`
*   **Headers:** `Authorization: Bearer <your_access_token>`
*   **JSON Data:**
```json
{
  "payment_method": "UPI"
}
```

---

## 4. Admin Management (Requires Admin Role)

### **Admin Login**
*   **URL:** `http://localhost:5000/api/auth/login`
*   **Method:** `POST`
*   **JSON Data:**
```json
{
  "email": "admin@parking.com",
  "password": "Admin@123"
}
```
 
### **Create a New Parking Facility**
*   **URL:** `http://localhost:5000/api/parking/facilities`
*   **Method:** `POST`
*   **Headers:** `Authorization: Bearer <admin_access_token>`
*   **JSON Data:**
```json
{
  "area_id": 1,
  "name": "Super Plaza Parking",
  "address": "45 Market St, Downtown",
  "description": "Premium multi-story parking"
}
```

### **Bulk Create Slots for a Floor**
*   **URL:** `http://localhost:5000/api/parking/floors/1/slots/bulk`
*   **Method:** `POST`
*   **Headers:** `Authorization: Bearer <admin_access_token>`
*   **JSON Data:**
```json
{
  "prefix": "L1",
  "count": 20
}
```
