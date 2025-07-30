# Pathology Lab Booking API - Pre-Booking Endpoints

## Overview

This document outlines all API endpoints required before creating a booking, based on RedCliff and Healthians API documentation. The APIs are designed to be provider-agnostic and handle multiple pathology lab providers.

## Base URL

```
https://api.mantracare.com/v1
```

## Authentication

All APIs require Bearer token authentication:

```
Authorization: Bearer <access_token>
```

---

## 1. User Location & Serviceability

### 1.1 Get User Location

**GET** `/location/user`

Get user's current location based on IP address or provided coordinates.

**Query Parameters:**

- `ip_address` (optional): User's IP address
- `latitude` (optional): GPS latitude
- `longitude` (optional): GPS longitude

**Response:**

```json
{
  "status": "success",
  "data": {
    "location": {
      "latitude": 28.6139,
      "longitude": 77.209,
      "city": "Delhi",
      "state": "Delhi",
      "pincode": "110001",
      "address": "Connaught Place, New Delhi"
    },
    "accuracy": "high"
  }
}
```

### 1.2 Search Location

**GET** `/location/search`

Search for locations by query string (similar to RedCliff's elocID API).

**Query Parameters:**

- `query` (required): Location search query
- `provider` (optional): Specific provider filter

**Response:**

```json
{
  "status": "success",
  "data": {
    "locations": [
      {
        "id": "loc_123",
        "name": "Connaught Place, New Delhi",
        "latitude": 28.6139,
        "longitude": 77.209,
        "city": "Delhi",
        "state": "Delhi",
        "pincode": "110001",
        "providers": ["redcliff", "healthians"]
      }
    ]
  }
}
```

### 1.3 Check Serviceability

**POST** `/location/serviceability`

Check if a location is serviceable by all providers.

**Request Body:**

```json
{
  "latitude": 28.6139,
  "longitude": 77.209,
  "pincode": "110001"
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "serviceable": true,
    "providers": [
      {
        "id": "redcliff",
        "name": "RedCliff",
        "serviceable": true,
        "zone_id": "zone_123"
      },
      {
        "id": "healthians",
        "name": "Healthians",
        "serviceable": true,
        "zone_id": "zone_456"
      }
    ]
  }
}
```

---

## 2. Package Discovery & Management

### 2.1 Get Available Packages

**GET** `/packages`

Get all available packages for a location.

**Query Parameters:**

- `latitude` (required): Location latitude
- `longitude` (required): Location longitude
- `pincode` (required): Location pincode
- `provider` (optional): Filter by specific provider
- `category` (optional): Filter by package category
- `price_min` (optional): Minimum price filter
- `price_max` (optional): Maximum price filter
- `fasting_required` (optional): Filter fasting/non-fasting packages

**Response:**

```json
{
  "status": "success",
  "data": {
    "packages": [
      {
        "id": "pkg_123",
        "provider_id": "redcliff",
        "provider_name": "RedCliff",
        "code": "SE046F",
        "name": "Complete Health Checkup",
        "description": "Comprehensive health screening package",
        "package_price": 2500.0,
        "offer_price": 1800.0,
        "discount_percentage": 28,
        "fasting_required": true,
        "fasting_hours": 12,
        "report_time": "24-48 hours",
        "tests_included": 45,
        "is_home_collection": true,
        "is_ppmc_available": false,
        "age_restriction": {
          "min_age": 18,
          "max_age": 65
        },
        "gender_restriction": "any"
      }
    ],
    "total_count": 150,
    "filters_applied": {
      "provider": "all",
      "price_range": "0-5000"
    }
  }
}
```

### 2.2 Get Package Details

**GET** `/packages/{package_id}`

Get detailed information about a specific package.

**Path Parameters:**

- `package_id` (required): Package ID

**Response:**

```json
{
  "status": "success",
  "data": {
    "package": {
      "id": "pkg_123",
      "provider_id": "redcliff",
      "provider_name": "RedCliff",
      "code": "SE046F",
      "name": "Complete Health Checkup",
      "description": "Comprehensive health screening package",
      "package_price": 2500.0,
      "offer_price": 1800.0,
      "discount_percentage": 28,
      "fasting_required": true,
      "fasting_hours": 12,
      "report_time": "24-48 hours",
      "tests_included": 45,
      "is_home_collection": true,
      "is_ppmc_available": false,
      "age_restriction": {
        "min_age": 18,
        "max_age": 65
      },
      "gender_restriction": "any",
      "test_details": [
        {
          "test_name": "Complete Blood Count",
          "test_code": "CBC",
          "description": "Measures various blood components"
        }
      ],
      "preparation_instructions": [
        "Fast for 12 hours before the test",
        "Avoid heavy meals the night before"
      ],
      "sample_requirements": "Blood sample (3-5 ml)"
    }
  }
}
```

### 2.3 Get Package Recommendations

**GET** `/packages/recommendations`

Get personalized package recommendations based on user profile.

**Query Parameters:**

- `age` (required): User age
- `gender` (required): User gender
- `symptoms` (optional): Comma-separated symptoms
- `medical_history` (optional): Comma-separated medical conditions
- `budget` (optional): Maximum budget

**Response:**

```json
{
  "status": "success",
  "data": {
    "recommendations": [
      {
        "package_id": "pkg_123",
        "recommendation_score": 95,
        "reason": "Based on age and common health concerns",
        "priority": "high"
      }
    ]
  }
}
```

---

## 3. Slot Management

### 3.1 Get Available Slots

**POST** `/slots/available`

Get available collection slots for a specific date and location.

**Request Body:**

```json
{
  "collection_date": "2024-01-15",
  "latitude": 28.6139,
  "longitude": 77.209,
  "pincode": "110001",
  "provider_id": "redcliff",
  "package_ids": ["pkg_123", "pkg_456"]
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "slots": [
      {
        "id": "slot_123",
        "provider_id": "redcliff",
        "provider_slot_id": 27,
        "collection_date": "2024-01-15",
        "start_time": "08:00",
        "end_time": "09:00",
        "available_slots": 5,
        "total_slots": 10,
        "slot_type": "morning",
        "is_fasting_slot": true
      },
      {
        "id": "slot_124",
        "provider_id": "redcliff",
        "provider_slot_id": 28,
        "collection_date": "2024-01-15",
        "start_time": "09:00",
        "end_time": "10:00",
        "available_slots": 8,
        "total_slots": 10,
        "slot_type": "morning",
        "is_fasting_slot": true
      }
    ],
    "date_range": {
      "start_date": "2024-01-15",
      "end_date": "2024-01-22"
    }
  }
}
```

### 3.2 Get Slot Details

**GET** `/slots/{slot_id}`

Get detailed information about a specific slot.

**Path Parameters:**

- `slot_id` (required): Slot ID

**Response:**

```json
{
  "status": "success",
  "data": {
    "slot": {
      "id": "slot_123",
      "provider_id": "redcliff",
      "provider_slot_id": 27,
      "collection_date": "2024-01-15",
      "start_time": "08:00",
      "end_time": "09:00",
      "available_slots": 5,
      "total_slots": 10,
      "slot_type": "morning",
      "is_fasting_slot": true,
      "phlebotomist_gender": "any",
      "special_requirements": [],
      "notes": "Early morning slot recommended for fasting tests"
    }
  }
}
```

### 3.3 Freeze Slot

**POST** `/slots/freeze`

Temporarily reserve a slot for booking (30 minutes for RedCliff, 15 minutes for Healthians).

**Request Body:**

```json
{
  "slot_id": "slot_123",
  "user_id": "user_456",
  "package_ids": ["pkg_123"],
  "customer_count": 1
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "frozen_slot": {
      "id": "slot_123",
      "provider_id": "redcliff",
      "provider_slot_id": 27,
      "collection_date": "2024-01-15",
      "start_time": "08:00",
      "end_time": "09:00",
      "frozen_until": "2024-01-14T10:30:00Z",
      "reserved_slots": 1
    },
    "booking_token": "booking_token_123"
  }
}
```

### 3.4 Release Slot

**POST** `/slots/release`

Release a frozen slot if booking is cancelled or expired.

**Request Body:**

```json
{
  "slot_id": "slot_123",
  "booking_token": "booking_token_123"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Slot released successfully"
}
```

---

## 4. Customer Management

### 4.1 Create Customer Profile

**POST** `/customers`

Create a new customer profile.

**Request Body:**

```json
{
  "user_id": "user_456",
  "name": "John Doe",
  "age": 30,
  "gender": "male",
  "email": "john.doe@example.com",
  "phone_number": "9876543210",
  "alt_phone_number": "9876543211",
  "whatsapp_number": "9876543210",
  "aadhar_number": "123456789012"
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "customer": {
      "id": "cust_123",
      "user_id": "user_456",
      "name": "John Doe",
      "age": 30,
      "gender": "male",
      "email": "john.doe@example.com",
      "phone_number": "9876543210",
      "alt_phone_number": "9876543211",
      "whatsapp_number": "9876543210",
      "aadhar_number": "123456789012",
      "created_at": "2024-01-14T10:00:00Z"
    }
  }
}
```

### 4.2 Get Customer Profile

**GET** `/customers/{customer_id}`

Get customer profile details.

**Path Parameters:**

- `customer_id` (required): Customer ID

**Response:**

```json
{
  "status": "success",
  "data": {
    "customer": {
      "id": "cust_123",
      "user_id": "user_456",
      "name": "John Doe",
      "age": 30,
      "gender": "male",
      "email": "john.doe@example.com",
      "phone_number": "9876543210",
      "alt_phone_number": "9876543211",
      "whatsapp_number": "9876543210",
      "aadhar_number": "123456789012",
      "created_at": "2024-01-14T10:00:00Z",
      "updated_at": "2024-01-14T10:00:00Z"
    }
  }
}
```

### 4.3 Update Customer Profile

**PUT** `/customers/{customer_id}`

Update customer profile information.

**Path Parameters:**

- `customer_id` (required): Customer ID

**Request Body:**

```json
{
  "name": "John Smith",
  "age": 31,
  "email": "john.smith@example.com",
  "phone_number": "9876543210"
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "customer": {
      "id": "cust_123",
      "name": "John Smith",
      "age": 31,
      "email": "john.smith@example.com",
      "phone_number": "9876543210",
      "updated_at": "2024-01-14T10:30:00Z"
    }
  }
}
```

---

## 5. Address Management

### 5.1 Create Customer Address

**POST** `/customers/{customer_id}/addresses`

Add a new address for a customer.

**Path Parameters:**

- `customer_id` (required): Customer ID

**Request Body:**

```json
{
  "address_line1": "Flat 101, Building A",
  "address_line2": "Sector 15, Noida",
  "landmark": "Near Metro Station",
  "latitude": 28.6139,
  "longitude": 77.209,
  "pincode": "201301",
  "city": "Noida",
  "state": "Uttar Pradesh",
  "is_default": true
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "address": {
      "id": "addr_123",
      "customer_id": "cust_123",
      "address_line1": "Flat 101, Building A",
      "address_line2": "Sector 15, Noida",
      "landmark": "Near Metro Station",
      "latitude": 28.6139,
      "longitude": 77.209,
      "pincode": "201301",
      "city": "Noida",
      "state": "Uttar Pradesh",
      "is_default": true,
      "created_at": "2024-01-14T10:00:00Z"
    }
  }
}
```

### 5.2 Get Customer Addresses

**GET** `/customers/{customer_id}/addresses`

Get all addresses for a customer.

**Path Parameters:**

- `customer_id` (required): Customer ID

**Response:**

```json
{
  "status": "success",
  "data": {
    "addresses": [
      {
        "id": "addr_123",
        "customer_id": "cust_123",
        "address_line1": "Flat 101, Building A",
        "address_line2": "Sector 15, Noida",
        "landmark": "Near Metro Station",
        "latitude": 28.6139,
        "longitude": 77.209,
        "pincode": "201301",
        "city": "Noida",
        "state": "Uttar Pradesh",
        "is_default": true,
        "created_at": "2024-01-14T10:00:00Z"
      }
    ]
  }
}
```

### 5.3 Update Customer Address

**PUT** `/customers/{customer_id}/addresses/{address_id}`

Update a specific address.

**Path Parameters:**

- `customer_id` (required): Customer ID
- `address_id` (required): Address ID

**Request Body:**

```json
{
  "address_line1": "Flat 102, Building A",
  "landmark": "Near Shopping Mall",
  "is_default": true
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "address": {
      "id": "addr_123",
      "address_line1": "Flat 102, Building A",
      "landmark": "Near Shopping Mall",
      "is_default": true,
      "updated_at": "2024-01-14T10:30:00Z"
    }
  }
}
```

---

## 6. Booking Preparation

### 6.1 Validate Booking Request

**POST** `/bookings/validate`

Validate booking request before creation.

**Request Body:**

```json
{
  "customer_id": "cust_123",
  "address_id": "addr_123",
  "slot_id": "slot_123",
  "package_ids": ["pkg_123"],
  "addon_members": [
    {
      "name": "Jane Doe",
      "age": 28,
      "gender": "female",
      "package_id": "pkg_456"
    }
  ],
  "payment_mode": "prepaid",
  "booking_type": "homedx"
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "valid": true,
    "validation_checks": {
      "customer_valid": true,
      "address_valid": true,
      "slot_available": true,
      "packages_valid": true,
      "age_restrictions": true,
      "gender_restrictions": true,
      "serviceability": true
    },
    "total_amount": 3600.0,
    "discounted_amount": 2800.0,
    "final_amount": 2800.0,
    "breakdown": {
      "primary_customer": 1800.0,
      "addon_members": 1000.0,
      "discount": 800.0
    }
  }
}
```

### 6.2 Get Booking Preview

**POST** `/bookings/preview`

Get a preview of the booking with all details and pricing.

**Request Body:**

```json
{
  "customer_id": "cust_123",
  "address_id": "addr_123",
  "slot_id": "slot_123",
  "package_ids": ["pkg_123"],
  "addon_members": [
    {
      "name": "Jane Doe",
      "age": 28,
      "gender": "female",
      "package_id": "pkg_456"
    }
  ],
  "payment_mode": "prepaid",
  "booking_type": "homedx"
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "booking_preview": {
      "customer": {
        "id": "cust_123",
        "name": "John Doe",
        "age": 30,
        "gender": "male"
      },
      "address": {
        "id": "addr_123",
        "address_line1": "Flat 101, Building A",
        "city": "Noida",
        "pincode": "201301"
      },
      "slot": {
        "id": "slot_123",
        "collection_date": "2024-01-15",
        "start_time": "08:00",
        "end_time": "09:00"
      },
      "packages": [
        {
          "id": "pkg_123",
          "name": "Complete Health Checkup",
          "price": 1800.0,
          "customer": "John Doe"
        }
      ],
      "addon_members": [
        {
          "name": "Jane Doe",
          "age": 28,
          "gender": "female",
          "package": {
            "id": "pkg_456",
            "name": "Diabetes Screening",
            "price": 1000.0
          }
        }
      ],
      "pricing": {
        "subtotal": 2800.0,
        "discount": 800.0,
        "final_amount": 2800.0,
        "payment_mode": "prepaid"
      },
      "special_instructions": [
        "Fasting required for 12 hours",
        "Early morning collection recommended"
      ]
    }
  }
}
```

---

## 7. Provider-Specific APIs

### 7.1 Get Provider Authentication

**POST** `/providers/{provider_id}/auth`

Get authentication token for a specific provider.

**Path Parameters:**

- `provider_id` (required): Provider ID (redcliff, healthians, etc.)

**Request Body:**

```json
{
  "api_key": "your_api_key",
  "api_secret": "your_api_secret"
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "access_token": "provider_access_token_123",
    "expires_at": "2024-01-14T11:00:00Z",
    "provider_id": "redcliff"
  }
}
```

### 7.2 Get Provider Packages

**GET** `/providers/{provider_id}/packages`

Get packages from a specific provider.

**Path Parameters:**

- `provider_id` (required): Provider ID

**Query Parameters:**

- `pincode` (required): Location pincode
- `category` (optional): Package category filter

**Response:**

```json
{
  "status": "success",
  "data": {
    "provider": {
      "id": "redcliff",
      "name": "RedCliff"
    },
    "packages": [
      {
        "id": "pkg_123",
        "provider_package_code": "SE046F",
        "name": "Complete Health Checkup",
        "package_price": 2500.0,
        "offer_price": 1800.0
      }
    ]
  }
}
```

---

## Error Responses

All APIs return consistent error responses:

```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "latitude",
      "issue": "Required field missing"
    }
  }
}
```

### Common Error Codes:

- `VALIDATION_ERROR`: Invalid request parameters
- `AUTHENTICATION_ERROR`: Invalid or expired token
- `SERVICEABILITY_ERROR`: Location not serviceable
- `SLOT_UNAVAILABLE`: Requested slot not available
- `PACKAGE_NOT_FOUND`: Package not found or inactive
- `CUSTOMER_NOT_FOUND`: Customer profile not found
- `PROVIDER_ERROR`: Provider API error
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

---

## Rate Limiting

- **Location APIs**: 100 requests per minute
- **Package APIs**: 200 requests per minute
- **Slot APIs**: 50 requests per minute
- **Customer APIs**: 100 requests per minute
- **Booking APIs**: 20 requests per minute

## Caching

- **Location data**: 24 hours
- **Package data**: 6 hours
- **Slot availability**: 5 minutes
- **Customer profiles**: 1 hour

## Webhooks

The system supports webhooks for real-time updates:

- `booking.created`
- `booking.updated`
- `booking.cancelled`
- `slot.frozen`
- `slot.released`
- `customer.created`
- `customer.updated`
