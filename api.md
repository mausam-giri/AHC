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

(Non essential Requirement: Setup contact with providers for the support from the MantraCare team for any issues related to the booking, payment, or test results. This will help in providing a better user experience and resolving any issues quickly.)

- Chat Screen with initiates tickets with user details and booking details also include the description of the issue, and record their conversation for future reference.

- (User Visit Mantra Care) => GET user location
  [ Already have some packages stored for testing provided by different providers for mantracare ]

- [create a table or view having the package with approx location for quick retrieval ==> Efficient and Fastest retrieval technique ]
