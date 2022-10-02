Context
========

The Hotel reservatio APIs are a set of RESTful endpoints for performing some hotel reservation functions/tasks. All API endpoints are secured using role based authentication & authorization. 

API ENDPOINTS URL - base URL
=============================

https://b4yskc-5000.preview.csb.app

CODE SANDBOX URL
=================

https://codesandbox.io/p/github/rameshbsone/hotel-reservation/master


GITHUB REPO URL
================

https://github.com/rameshbsone/hotel-reservation.git

Pre-defined users available for authentication
==============================================
email: employee@gmail.com, Password: Employee@12
email: manager@gmail.com, Password: Manager@12
email: admin@gmail.com, Password: Admin@12

STEPS TO RUN an API endpoint
=============================

1.) Navigate to the login URL: /api/v1/login

2.) Enter user credentials mentioned in the pre-defined users section

3.) Invoke the login API

4.) From the login response, copy the web token generated

5.) Provide the token as authorization header for invoking the other APIs
        Authorization: Bearer <JSON Web Token>

6.) Postman request JSon collection is available in the code sandbox: hotel_reservation_api.postman_collection.json

7.) Browse to the base URL for the API endpoints documentation