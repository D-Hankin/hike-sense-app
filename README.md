HikeSense App
=============

HikeSense is a mobile application designed to enhance hiking safety and social experience by providing real-time data monitoring, alerting functionalities and GPS location data. This app connects to the HikeSense server and integrates with Bluetooth for real-time heart rate monitoring, enabling users to manage their hiking activities, receive alerts, and stay connected with friends.

Stack
-----

-   **Client**: `/hike-sense-client`
-   **Server**: `/hike-sense-server`
-   **Arduino**: `/hike-sense-arduino`

Features
--------

### User Management

-   User sign-up, login, and JWT-based authentication.
-   Account management with friend connections for safety tracking.

### Hiking Data Collection

-   Collection and display of hike details, including route, heart rate (via Bluetooth), temperature, and more.

### Real-Time Heart Rate Monitoring

-   Connects to a pulse sensor through Bluetooth for real-time heart rate monitoring during hikes.

### Safety Alerts

-   Customized alerts based on heart rate thresholds for each user.
-   Location markers sent as email notifications to users' contacts at users request.

### Location Sharing

-   Users can send location markers to their contacts for enhanced safety and communication.

### Subscription Management

-   Integration with Stripe for upgrading subscription plans directly from the app.

### Real-Time Communication

-   WebSocket-based chat feature for friend-to-friend messaging.
-   Real-time updates on user location and safety statistics.

Technologies
------------

-   **Framework**: React Native
-   **State Management**: Context 
-   **Database**: MongoDB (hosted on MongoDB Atlas)
-   **Backend Framework**: Spring Boot
-   **Containerization**: Docker
-   **AI API**: OpenAI
-   **Bluetooth**: Bluetooth Low Energy (BLE) for heart rate sensor integration
