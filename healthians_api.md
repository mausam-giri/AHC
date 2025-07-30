Healthians B2B API Documentation
This document provides a comprehensive overview of the Healthians B2B APIs for integrating Pathology, Radiology, and VDOC Consultation services.

🔑 Authentication
All APIs (unless specified otherwise) require a two-step authentication process. First, you must obtain a temporary access token, which is then used as a Bearer token for subsequent API calls.

GET /getAccessToken
This endpoint authenticates a partner's session and provides a bearer token.

Endpoint: https://t25crm.healthians.co.in/api/<partner_name>/getAccessToken

Authorization: Basic Auth

Username: Your provided api_key

Password: Your provided api_secret_key

Note: The Access Token has a Time-to-Live (TTL) of 1 hour.

🔬 Pathology Bookings API
This section covers the complete workflow for booking pathology tests, from checking serviceability to retrieving reports.

1. Discovery & Serviceability
   POST /checkServiceabilityByLocation_v2
   Checks if a specific geographic location is serviceable for sample collection.

Endpoint: https://t25crm.healthians.co.in/api/<partner_name>/checkServiceabilityByLocation_v2

Authorization: Bearer Token

Request Body:
| Attribute | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| lat | String | Yes | Latitude of the location. |

| long | String | Yes | Longitude of the location. |

| zipcode | String | No | Zipcode of the provided location. |

Success Response: The response contains a zone_id, which is required for fetching slots.

POST /getPartnerProducts
Fetches all available products (tests, packages, profiles) for a given ZIP code.

Endpoint: https://t25crm.healthians.co.in/api/<partner_name>/getPartnerProducts

Authorization: Bearer Token

Request Body:
| Attribute | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| zipcode | Integer | Yes | 6-digit valid pincode. |

| product_type | String | No | Type of product:

package, profile, parameter, or blank for all. |

| test_type | String | No | Type of test:

pathology or radiology. |

POST /getProductDetails
Returns detailed product information, including fasting hours, reporting time, and constituents for a given test, package, or profile.

Endpoint: https://t25crm.healthians.co.in/api/<partner_name>/getProductDetails

Authorization: Bearer Token

Request Body:
| Attribute | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| deal_type | String | Yes | The unit of the test (e.g., "package"). |

| deal_type_id | Integer | Yes | The ID of the test unit. |

2. Slot Management
   POST /getSlotsByLocation
   Retrieves available sample collection slots for a specific location and date.

Endpoint: https://t25crm.healthians.co.in/api/<partner_name>/getSlotsByLocation

Authorization: Bearer Token

Request Body:
| Attribute | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| slot_date | String | Yes | The date for which slots are needed (YYYY-MM-DD). |

| zone_id | String | Yes | The ID retrieved from the

checkServiceabilityByLocation_v2 API. |

| lat | String | Yes | The latitude of the location. |

| long | String | Yes | The longitude of the location. |

Note: Slots are available for the current day + 7 days.

POST /freezeSlot_v1
Temporarily reserves a booking slot for 15 minutes to ensure availability during the booking process.

Endpoint: https://t25crm.healthians.co.in/api/<partner_name>/freezeSlot_v1

Authorization: Bearer Token

Request Body:
| Attribute | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| slot_id | Integer | Yes | The ID of the slot to be frozen. |

| vendor_billing_user_id | String | Yes | The billing user ID at the vendor's end. |

Note: The returned slot_id might differ from the requested one but will be for the same time. This new

slot_id must be used in the createBooking_v3 API call. If the booking is not completed in 15 minutes, the slot may be released.

3. Booking Management
   POST /createBooking_v3
   Creates a new pathology booking. This is the main booking creation API.

Endpoint: https://t25crm.healthians.co.in/api/<partner_name>/createBooking_v3

Authorization: Bearer Token

Headers:

X-Checksum: A required encrypted value for booking creation. A reference for checksum generation is available.

Key Parameters: Includes nested customer, slot, and package objects, along with billing details and address information.

Notes:

Supports multiple customers and packages in a single booking.

payment_option can be "prepaid" or "cod".

For partial payments, use

payment_option: "prepaid" and send the paid amount in partial_paid_amount.

A common error "This slot has been allocated to another booking" means a new available slot must be fetched via

getSlotsByLocation.

POST /addOnBooking_v1
Adds new tests or new customers to an existing booking.

Endpoint: https://t25crm.healthians.co.in/api/<partner_name>/addOnBooking_v1

Authorization: Bearer Token

Headers:

X-Checksum: Required for adding to a booking.

Request Body:
| Attribute | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| order_id | String | Yes | The Healthians Booking ID to add on to. |

| customer | Array | Yes | Collection of customer details. Can be existing or new customers. |

| package | Array | Yes | Collection of

deal_id arrays for the tests to be added. |

| vendor_billing_user_id | String | Yes | Must be the same ID used in

createBooking_v3. |

| addon_discounted_price | Number | Yes | The final price for the add-on items. |

| addon_order_type | String | Yes |

prepaid or cod. |

POST /cancelBooking
Cancels a booking for one or more customers.

Endpoint: https://t25crm.healthians.co.in/api/<partner_name>/cancelBooking

Authorization: Bearer Token

Request Body:
| Attribute | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| booking_id | Integer | Yes | The Healthians Booking ID. |

| vendor_billing_user_id| String | Yes | The vendor's billing user ID. |

| vendor_customer_id | String | Yes | The specific customer ID to cancel. |

| remarks | String | Yes | Reason for cancellation. |

Notes:

Cancellation is only allowed if the booking status is

Order Booked (BS002) or Sample Collector Assigned (BS005).

To cancel an entire booking with multiple customers, you must send a separate API request for each customer.

POST /rescheduleBookingByCustomer_v1
Updates the scheduled date and time of a booking for all customers.

Endpoint: https://t25crm.healthians.co.in/api/<partner_name>/rescheduleBookingByCustomer_v1

Authorization: Bearer Token

Headers:

X-Checksum: Required for rescheduling.

Request Body:
| Attribute | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| booking_id | Integer | Yes | The existing booking ID. |

| slot_id | Integer | Yes | The new slot ID from

getSlotsByLocation. |

| customers | Array | Yes | An array of all

vendor_customer_id objects in the booking. |

| reschedule_reason| String | Yes | The reason for rescheduling. |

Notes:

Partial reschedules are not allowed; all customers in the booking must be rescheduled together.

The API returns a new

booking_id for the rescheduled appointment.

4. Status & Reports
   POST /getBookingStatus
   Retrieves the current real-time status of a customer's booking and tests.

Endpoint: https://t25crm.healthians.co.in/api/<partner_name>/getBookingStatus

Authorization: Bearer Token

Request Body:
| Attribute | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| booking_id | Integer | Yes | Healthians Booking ID. |

POST /getCustomerReport_v2
Fetches the latest verified test report (full or partial) for a specific customer.

Endpoint: https://t25crm.healthians.co.in/api/<partner_name>/getCustomerReport_v2

Authorization: Bearer Token

Request Body:
| Attribute | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| booking_id | Integer | Yes | Healthians Booking ID. |

| vendor_billing_user_id| String | Yes | The vendor's billing user ID. |

| vendor_customer_id | String | Yes | The specific vendor customer ID. |

| allow_partial_report | Integer | Yes |

1 to allow partial reports, 0 for full reports only. |

POST /getBookingCustomerDigitalValue
Fetches real-time digital test data for each parameter, allowing partners to track results before the final PDF report is generated.

Endpoint: https://t25crm.healthians.co.in/api/<partner_name>/getBookingCustomerDigitalValue

Authorization: Bearer Token

Request Body:
| Attribute | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| booking_id | Integer | Yes | Healthians Booking ID. |

| vendor_billing_user_id| String | Yes | The vendor's billing user ID. |

| vendor_customer_id | String | Yes | The specific vendor customer ID. |

5. Utility APIs
   POST /getPhleboMaskNumber
   Retrieves the masked contact number of the phlebotomist assigned to a booking.

Endpoint: https://t25crm.healthians.co.in/api/<partner_name>/getPhleboMaskNumber

Authorization: Bearer Token

Request Body:
| Attribute | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| booking_id | Integer | Yes | Healthians Booking ID. |

Note: The masked number is only available if a phlebotomist is assigned and the sample has not yet been collected.

GET /getActiveZipcodes
Fetches a list of all active and serviceable zip codes for Healthians.

Endpoint: https://t25crm.healthians.co.in/api/<partner_name>/getActiveZipcodes

Authorization: Bearer Token
