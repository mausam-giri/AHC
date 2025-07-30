# Pathology Lab Booking API

- Mantra Care works as third-party aggregator for pathology labs. It collects various lab and their packages and provides a platform for users to book tests from different providers.
- This api allows user to book pathology lab tests and receive payments on the mantracare platform and provide the providers with the details.
- The API is designed to be efficient and fast, allowing users to quickly find and book pathology tests based on their location and preferences.
- The API supports multiple providers and allows users to select packages, view available slots, and create bookings with ease.
- The API also supports add-on members for bookings, allowing users to book tests for multiple people in one go.
- The API is designed to be user-friendly and provides a seamless experience for users looking to book pathology tests with live tracking of Phalebo and test results on the platform.

- **Note:** Mantra Care core tech stack:
  - **Frontend:** NextJS v13 (Page Router), Tailwind v3
  - **Backend:** ExpressJS, Prisma, (package: zod v3.22.4)
  - **Database:** MySQL

---

## Initial Requirements (For Pathology Lab Booking API)

- All providers packages should be stored in the database. (Provided by the provider in CSV format needs to be parsed and stored)

**Functional Requirement**:

- Get user location based on user input (most preferred) and IP Address.
- Use Map for pipointing the user location (getting long & lat) [quick and fast with minimal size package].
- Show list of health test packages from all labs for the user with location.
  (Package selection, available slots and freezing slot, initiate payment, booking creation, post booking actions)

  - Before Phalebo assigned for collection (Each provider has its own process - will be listed under providers)

    - User can update add-on members for the booking
    - User can update booking details
    - User can cancel booking
    - User can reschedule booking

  - Post booking actions include:
    - Live tracking of Phlebo
    - Some provider: Phalebo mask number for contact
    - Test results on the platform

---

### User Journey for Booking Pathology Lab Tests (General Flow)

- (User opens Mantra Care) => GET user location
- (User selects location) => GET user area/location
- Show list of health test packages from all labs for the user with location
- (User selects a package) => GET available slots for the package
- Show list of lab test providers
- (User selects a provider) =>
  - User exact location fill if not pre-filled and save it to the database as separate user entity
  - Based on the location, check serviceability of the provider
  - GET available slots for the provider
- (User selects a available slot) => Freeze slot for the user
  - Provide option to add-on members for the booking
- (User create booking) => POST temporary booking
- (User initiates payment) => POST payment details
- (User completes payment) => POST payment confirmation
- (User receives booking confirmation) => GET booking details
- (User can track Phlebo) => GET live tracking details
- (User can view test results) => GET test results

### User Journey for Booking Pathology Lab Tests (Fasting with PPBS Package Booking)

- Details: It allows you to create Fasting and PPBS booking together, where two different bookings are going to be created one for fasting and another for PPBS with the difference of two hours or more than that. Also, it’s mandatory to do a book fasting slot prior to the PPBS slot.

### Other Action by User

- Update Lab Test Package
- Update Booking Details
- Cancel Booking
- Reschedule Booking

### Webhook trigger events by Providers

- Booking Created
- Booking Updated
- Booking Cancelled
- Payment Initiated
- Payment Completed
- Phalebo Assigned
- Phalebo Arrived
- Phalebo Completed
- Test Results Available (Digital Value to keep user informed)
- Test Results Updated
- Test Results Completed
- Test Results Download Link available
  - Save the link in the database for the user to download later (Mantra Care will store the test results & PDF/Document, providers will not store the test results, only the link will be provided to download the test results)

### Providers List

- Redcliff
- Healthians
- Orange Health

#### Redcliff

- HOST: `https://redcliffhealth.com`
- API:
  - GET elocID [search area]
  - GET serviceable location [latitude & longitude]
  - GET collection time slot [collection_date, latitude, longitude]
  - POST create booking
  - POST create booking Fasting with PPBS
  - POST booking confirmation
  - POST update booking
  - POST update additional member
  - POST update payment mode
  - POST update package
- Webhook:

  - GET package details
  - GET package data
  - GET booking confirmation
  - POST set webhook
  - POST trigger webhook (Staging)
  - GET webhook details
  - GET digital value
  - GET consolidate report

- Error Response:

  ```json
  {
    "status": "failure",
    "message": "Error message here",
    "data": {}
  }
  ```

- GET elocID

  - This will allow users to fetch eloc based on the location search, eloc will use in next API to fetch Lat and Long.
  - Endpoint: `{{HOST}}/api/partner/v2/get-partner-location-2-eloc/?place_query={:area}`

    - Example: `https://redcliffhealth.com/api/partner/v2/get-partner-location-2-eloc/?place_query=Delhi`
    - Response: (includes elocID)
      ```json
      {
        ...other details,
        "eloc": "1234567890"
      }
      ```

- GET Latitude and Longitude based on eloc

  - This API allows users to fetch latitude and longitude based on eloc.
  - Endpoint: `{{HOST}}/api/partner/v2/get-partner-loc-2-eloc/?eloc={:eloc}`
  - Example: `https://redcliffhealth.com/api/partner/v2/get-partner-location-2-latlong/?eloc_id=1234567890`
  - Response:
    ```json
    {
      "latitude": "28.6139",
      "longitude": "77.2090"
    }
    ```
  - Invalid:
    **If invalid value passed against eloc parameter**
    {
    "latitude": "",
    "longitude": ""
    }
  - Error Response:
    ```json
    {
      "status": "failure",
      "message": "eloc is not valid",
      "data": {}
    }
    ```

- GET collection time slot [collection_date, latitude, longitude]

  - The list of active collection slots based on Collection-Date and Area Lat Long.
  - Endpoint: `{{HOST}}/api/booking/v2/get-time-slot-list/?collection_date={:collection_date}&latitude={:latitude}&longitude={:longitude}`
  - Params: lat & long, collection_date -> YYYY-MM-DD (Current Date + Future Date (within next 4 days))
  - Example: `https://redcliffhealth.com/api/partner/v2/get-partner-location-2-latlong/?eloc_id=1234567890`
  - Response:

    ```json
    A) Slots on given Collection Date and Lat-Long coordinates are available
      {
      "status" : "success",
      "message" : "10 Slots are available on 2022-07-31",
      "results" : [
        {
          "id" : 27,
          "available_slot" : 2,
          "format_24_hrs" : {
            "start_time" : "15:30",
            "end_time" : "16:30"
            },
          "format_12_hrs" : {
            "start_time" : "03:30 PM",
            "end_time" : "04:30 PM"
            }
        },
        {
          "id" : 28,
          "available_slot" : 10,
          "format_24_hrs" : {
            "start_time" : "16:00",
            "end_time" : "17:00"
            },
          "format_12_hrs" : {
            "start_time" : "04:00 PM",
            "end_time" : "05:00 PM"
           }
        }
        ]
      }
    B) If Collection Date is beyond 4 days from current date (date of booking)-
      {
        "status" : "failure",
        "message" : "No Slots are available on 2022-07-31",
      }

    C) No Slots are available for given valid Collection Date and Lat-Long coordinates
      {
        "status" : "success",
        "message" : "No Slots are available on 2022-07-31",
        "data" : []
      }
    D) Collection Date is of Past
      {
        "status" : "failure",
        "message" : "collection_date must be future date from Current date",
        "data" : []
      }
    E) Incorrect Date-Format for Collection Date
      {
        "status" : "failure",
        "message" : "collection_date must be in format of YYYY-MM-DD",
      }
    F) Lat-Long are incorrect OR Area is non-serviceable
      {
        "status" : "failure",
        "message" : "Location is non-serviceable."
      }
    ```

  - Invalid:
    **If invalid value passed against eloc parameter**
    {
    "latitude": "",
    "longitude": ""
    }
  - Error Response:
    ```json
    {
      "status": "failure",
      "message": "eloc is not valid",
      "data": {}
    }
    ```

- POST create booking

  - This API allows users to create a booking for a center.
  - Endpoint: `{{HOST}}/api/external/v2/center-create-booking/`
  - Request & Response:

  ```json

      Example Request 1: Without add-on member

    {
        "booking_date": "2025-05-31",
        "collection_date": "2025-06-10",
        "collection_slot": 9,
        "customer_name": "dummy",
        "customer_age": 26,
        "customer_gender": "male",
        "package_code": [
            "SE046F"
        ],
        "customer_email": "akash.paulmurugan@redcliffe.com",
        "customer_phonenumber": "9289708244",
        "customer_altphonenumber": "9289708244",
        "customer_whatsapppnumber": "9289708244",
        "customer_address": "Flat Number: 1, 58 NS Palya, Stage 2, BTM Layout, Bengaluru, Bengaluru Urban, Bangalore Division, Karnataka, India, 560076",
        "address_line2":"BTM Layout, Bengaluru, Bengaluru Urban, Bangalore",
        "customer_landmark": "Flat Number: 1, 58 NS Palya, Stage 2, BTM Layout, Bengaluru, Bengaluru Urban, Bangalore Division, Karnataka, India, 560076",
        "pincode": "560076",
        "is_credit": true,
        "center_discount":750,
        "additional_member": [],
        "customer_longitude": 77.60813601507671,
        "customer_latitude": 12.91092286017229,
      “client_refid”:”na”
    }


    Example Request 2: With add-on member

    {
        "booking_date": "2023-02-09",
        "collection_date": "2023-02-10",
        "collection_slot": 46,
        "customer_name": "Sachin Sharma",
        "customer_age": "30",
        "customer_gender": "male",
        "email": "customer.reports@redcliffelabs.com",
        "customer_phonenumber": "9654677563",
        "customer_altphonenumber": "9654677563",
        "customer_whatsapppnumber": "9654677563",
        "customer_address": "House/Flat/Floor No:11,Road/Apt./Area:10,",
        "customer_landmark": "PMO Apartment, Block C, Sector 62, Noida, Uttar Pradesh, 201309",
        "address_line2":"BTM Layout, Bengaluru, Bengaluru Urban, Bangalore",
        "pincode": "201309",
        "package_code": ["MD028"],
        "is_credit": true,
        "additional_member": [
            {
                "customerName": "Sachin Sharma",

                "customerAge": "30",
                "customerGender": "male",
                "packageCode": ["PL183"],

            }
        ],
        "customer_longitude": "77.3689",
        "customer_latitude": "28.6111",
        "reference_data": "iframe2"
    }

    Example Request 4: PPMC Booking

    {
        "booking_date": "2023-02-09",
        "collection_date": "2023-02-10",
        "booking_type": "PPMC",
        "collection_slot": 46,
        "customer_name": "Sachin Sharma",
        "customer_age": "30",
        "customer_gender": "male",
        "customer_email": "customer.reports@redcliffelabs.com",
        "customer_phonenumber": "9654677563",
        "customer_altphonenumber": "9654677563",
        "customer_whatsapppnumber": "9654677563",
        "customer_address": "House/Flat/Floor No:11,Road/Apt./Area:10,",
        "address_line2":"BTM Layout, Bengaluru, Bengaluru Urban, Bangalore",
        "customer_landmark": "PMO Apartment, Block C, Sector 62, Noida, Uttar Pradesh, 201309",
        "pincode": "201309",
        "package_code": ["MD028"],
        "is_credit": true,
        "additional_member": [],
        "customer_longitude": "77.3689",
        "customer_latitude": "28.6111",
        "reference_data": "ClientOrder1234",
        "is_ecg": true,
        "is_mer": true,
        "video_mer": true
    }

    Example Response

    **Case 1**:  **If all parameters are valid, for home collection**

    {
        "status": "success",
        "message": "Booking have been created temporary. The slot will be locked for next 30 mins.",
        "pk": 1354195,
        "booking_id": 1354195,
        "booking_type":"Homedx",
        "booking_date": "2023-02-09",
        "collection_date": "2023-02-26",
        "collection_slot": 46,
        "customer_name": "Sachin Sharma",
        "customer_age": 10.0,
        "customer_gender": "male",
        "customer_email": "customer.reports@redcliffelabs.com",
        "customer_phonenumber": "9654677563",
        "customer_altphonenumber": "9654677563",
        "customer_whatsapppnumber": "9654677563",
        "customer_aadhar": null,
        "customer_address": "House/Flat/Floor No:10,Road/Apt./Area:11",
        "address_line2":"BTM Layout, Bengaluru, Bengaluru Urban, Bangalore",
        "customer_landmark": "PMO Apartment, Block C, Sector 62, Noida, Uttar Pradesh, 201309",
        "customer_areapincode": 724,
        "packages": [
            {
                "id": 15718,
                "name": "Glucose Fasting & PP, Plasma & Urine",
                "code": "PL183",
                "discount": null,
                "package_price": 320.0,
                "offer_price": 200.0,
                "is_addon": false,
                "description": "dummy test",
            }
        ],
        "discounted_price": {
            "total_price_package": 200,
            "counpon_discount": 0,
            "final_total_price": 200,
            "phlebo_cost": 0,
            "subscription_amount": 0,
            "subscription_discount_amount": 0,
            "referral_coupon_discount": 0,
            "coupon_type": "",
            "hard_copy_cost": 0
        },
        "phlebo": {},
        "booking_status": "order booked",
        "pickup_date": null,
        "pickup_time": null,
        "pickup_receive_amount": null,
        "payment_source": null,
        "created_at": "2023-02-09T12:22:55.734166+05:30",
        "booking_source": null,
        "pickup_status": "pending",
        "city": "Noida",
        "state": "Uttar Pradesh",
        "additional_members": [],
        "report": null,
        "report_status": "none",
        "slot_time": {
            "id": 46,
            "slot": "05:00:00-05:30:00"
        },
        "is_credit": true,
        "client_refid": null,
        "pincode": "201309",
        "reference_data": "iframe",
        "phlebo_details": {}
    }

    **Case 2**:  **If all parameters are valid, for PPMC collection**
    {
        "status": "success",
        "message": "Booking have been created temporary. The slot will be locked for next 30 mins.",
        "pk": 1354195,
        "booking_id": 1354195,
        "booking_type":"PPMC",
        "is_ecg": true,
        "is_mer": true,
        "is_video_mer": true,
        "booking_date": "2023-02-09",
        "collection_date": "2023-02-26",
        "collection_slot": 46,
        "customer_name": "Sachin Sharma",
        "customer_age": 10.0,
        "customer_gender": "male",
        "customer_email": "customer.reports@redcliffelabs.com",
        "customer_phonenumber": "9654677563",
        "customer_altphonenumber": "9654677563",
        "customer_whatsapppnumber": "9654677563",
        "customer_aadhar": null,
        "customer_address": "House/Flat/Floor No:10,Road/Apt./Area:11",
        "address_line2":"BTM Layout, Bengaluru, Bengaluru Urban, Bangalore",
        "customer_landmark": "PMO Apartment, Block C, Sector 62, Noida, Uttar Pradesh, 201309",
        "customer_areapincode": 724,
        "packages": [
            {
                "id": 15718,
                "name": "Glucose Fasting & PP, Plasma & Urine",
                "code": "PL183",
                "discount": null,
                "package_price": 320.0,
                "offer_price": 200.0,
                "is_addon": false,
                "description": "dummy test",
            }
        ],
        "discounted_price": {
            "total_price_package": 200,
            "counpon_discount": 0,
            "final_total_price": 200,
            "phlebo_cost": 0,
            "subscription_amount": 0,
            "subscription_discount_amount": 0,
            "referral_coupon_discount": 0,
            "coupon_type": "",
            "hard_copy_cost": 0
        },
        "phlebo": {},
        "booking_status": "order booked",
        "pickup_date": null,
        "pickup_time": null,
        "pickup_receive_amount": null,
        "payment_source": null,
        "created_at": "2023-02-09T12:22:55.734166+05:30",
        "booking_source": null,
        "pickup_status": "pending",
        "city": "Noida",
        "state": "Uttar Pradesh",
        "additional_members": [],
        "report": null,
        "report_status": "none",
        "slot_time": {
            "id": 46,
            "slot": "05:00:00-05:30:00"
        },
        "is_credit": true,
        "client_refid": null,
        "pincode": "201309",
        "reference_data": "iframe",
        "phlebo_details": {}
    }
    Case 3: **Incase PPMC booking, customer_gender = female & is_ecg = true and slot id passed will have no female phlebo then in that scenario**
    {
        "status" : "Sucess",
        "message" : "No female slots are available",
    }

    Case 4: **If slots are not available**
    {
        "status" : "Sucess",
        "message" : "No Slots are available on 2022-07-31. Try with another slot ID",
    }

    Case 4: **If latitude and longitude is non-servicable**

    {
    "status" : "Failed"
    "message" : "Location is non-serviceable."
    }

    Case 5: **If package code is invalid**
    {
        "status": "failure",
        "message": "Package not valid"
    }

    Case 6: **If test is not recommended to that age**

    {
        "status" : "Failed",
        "message" : "Anand Verma's age is not recommended for this package",
    }
    Case 7: **If test is not recommended for mentioned gender**

    {
        "status" : "Failed",
        "message" : "PL98 test is only for female. Please take relevant package",
    }
    Case 8: if phone number is not valid ( wrong digit entered)-
    {
        "status": "failure",
        "message": "Please enter a valid phone number"
    }
    Case 9 : if Past date enter in collection date -
    {
        "status": "failure",
        "message": "Past date entered"
    }
    Case 10 : If package is not available at home collection-
    {
        "status": "failure",
        "message": "Cannot book PL142; HM003; HM022; HM006A; PL130 for Home-Collection."
    }
    Case 11: If more then one booking is created for same date against that Number-

    {
        "status": "failure",
        "message": "Can't create more bookings today."

    }


  ```

- POST create booking Fasting with PPBS

  - It allows you to create Fasting and PPBS booking together, where two different bookings are going to be created one for fasting and another for PPBS with the difference of two hours or more than that. Also, it’s mandatory to do a book fasting slot prior to the PPBS slot.
  - Endpoint: `{{HOST}}/api/external/v2/center-create-booking-pp/`
  - Request & Response:

  ```json

    Example Request 1: Without add-on member
    {
        "booking_date": "2024-09-13",
        "collection_date": "2024-09-13",
        "customer_name": "Sachin Sharma A",
        "customer_age": "22",
        "customer_gender": "male",
        "customer_email": "customer.r-eports@redcli-ffelabs.com",
        "customer_phonenumber": "9999299091",
        "customer_altphonenumber": "9999299091",
        "customer_whatsapppnumber": "9999299091",
        "customer_address": "House/Flat/Floor No:11,Road/Apt./Area:10,",
        "customer_landmark": "PMO Apartment, Block C, Sector 62, Noida, Uttar Pradesh, 201309",
        "pincode": "201309",
        "is_credit": true,
      "customer_longitude": "91.5644578",
        "customer_latitude": "26.1215892",
        "reference_data": "",
      "fasting_detail": {
            "package_code": ["BC023"],
            "collection_slot": "14",
            "additional_member":[]
        },
        "ppbs_detail": {
            "package_code": ["BC033"],
            "collection_slot": "3",
            "additional_member":[]
        }
    }
    Example Request 2: With add-on member
    {
        "booking_date": "2024-08-31",
        "collection_date": "2024-09-12",
        "customer_name": "Sachin Sharma A",
        "customer_age": "22",
        "customer_gender": "male",
        "customer_email": "customer.r-eports@redcli-ffelabs.com",
        "customer_phonenumber": "9999299099",
        "customer_altphonenumber": "9999299099",
        "customer_whatsapppnumber": "9999299099",
        "customer_address": "House/Flat/Floor No:11,Road/Apt./Area:10,",
        "customer_landmark": "PMO Apartment, Block C, Sector 62, Noida, Uttar Pradesh, 201309",
        "pincode": "201309",
        "is_credit": true,
        "customer_longitude": "91.5644578",
        "customer_latitude": "26.1215892",
        "reference_data": "",
        "fasting_detail": {
            "package_code": ["BC023"],
            "collection_slot": "14",
            "additional_member":[{
                "customerDesignation":"Mr",
                "customerName":"Additional booking",
                "customerAge":"21",
                "customerGender":"male",
                "packageCode":["BC023"]
            }]
        },
        "ppbs_detail": {
            "package_code": ["BC033"],
            "collection_slot": "3",
            "additional_member":[{
                "customerDesignation":"Mr",
                "customerName":"Additional booking",
                "customerAge":"21",
                "customerGender":"male",
                "packageCode":["BC033"]
            }]
        }
    }

    Example Response

    **If all parameters are valid, for home collection
    {
        "fasting_detail": {
            "booking_id": 9694382,
            "primary_member": "Sachin Sharma A",
            "additional_member": []
        },
        "ppbs_detail": {
            "booking_id": 9694383,
            "primary_member": "Sachin Sharma A",
            "additional_member": []
        }
    }

    **If all parameters are valid, with additional members

    {
        "fasting_detail": {
            "booking_id": 9694096,
            "primary_member": "Sachin Sharma A",
            "additional_member": [
                {
                    "booking_id": 9694097
                }
            ]
        },
        "ppbs_detail": {
            "booking_id": 9694098,
            "primary_member": "Sachin Sharma A",
            "additional_member": [
                {
                    "booking_id": 9694099
                }
            ]
        }
    }

    **If time difference is less than 2 hours**

    {
        "status": "failure",
        "message": "The difference between fasting and PPBS slots should be at least 2 hours."
    }
    **If latitude and longitude is non-servicable**
    {
    "status" : "Failed"
    "message" : "Location is non-serviceable."
    }
    **If package code is invalid**

    {
        "status" : "Failed",
        "message" : "PL98 is invalid package code"
    }

    **If test is not recommended to that age**

    {
        "status" : "Failed",
        "message" : "Anand Verma's age is not recommended for this package",
    }
    **If test is not recommended for mentioned gender**

    {
        "status" : "Failed",
        "message" : "PL98 test is only for female. Please take relevant package",
    }

  ```

- POST booking confirmation

  - It allows us to update the final status of Temporary Booking Creation API at Partner’s end. Once the client gets confirmation at its customer end after creating temporary booking, the client needs to hit this API for final booking status at its end.
  - Endpoint: `{{HOST}}/api/external/v2/center-confirm-booking/`
  - Request & Response:

  ```json

    Example Request :

    **If status is confirmed, and payment is prepaid**
    {
        "booking_id" : "20009",
        "is_confirmed" : "true",
    }
    **If status is cancelled**
    {
        "booking_id" : "20009",
        "is_confirmed" : "false",
    }

    Example Response

    **Valid Temporary Booking ID with Prepaid Payment Mode**

    {
        "status" : "Success",
        "message" : "Booking has been created successfully",

    }

    **Valid Temporary Booking ID with Postpaid Payment Mode**


    {
        "status" : "Success",
        "message" : "Booking has been created successfully",
        "booking_id" : 200091,
        "booking_status" : "confirmed",
        "payment_detail" : {
            "is_credit" : true,
            "amount_collected" : 1500.00
        }
    }

    ** Valid Temporary Booking ID to cancel the the  booking
    {
        "status" : "Success",
        "message" : "Booking has been cancelled",
        "booking_status" : "cancelled",
    }
    ** **If wrong temporary booking is entered**
    {
        "status" : "Failed",
        "message" : "No temporary booking id exist.",
        "data" : []
    }
    **If temporary booking is expired after 30 mins**

    {
        "status" : "Failed",
        "message" : "Temporary booking id has been expired and cancelled.",
        "data" : []
    }


  ```

#### Additional Information

- **Note**: For Healthians Pathology Lab (Another Provider as RedCliff), the API is available in the PDF `healthians_api.md` in the root directory.

[**Note**: Incomplete temporary dbschema is created for enhacement; `temp_dbschema.dbml`, don't change it create a new refined one]

(Non essential Requirement: Setup contact with providers for the support from the MantraCare team for any issues related to the booking, payment, or test results. This will help in providing a better user experience and resolving any issues quickly.)

- Chat Screen with initiates tickets with user details and booking details also include the description of the issue, and record their conversation for future reference.

- (User Visit Mantra Care) => GET user location
  [ Already have some packages stored for testing provided by different providers for mantracare ]

- [create a table or view having the package with approx location for quick retrieval ==> Efficient and Fastest retrieval technique ]
