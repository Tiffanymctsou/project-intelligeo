# Intelligeo

![](https://github.com/Tiffanymctsou/Project_Assets/blob/master/Intelligeo/intelligeo_home.png)

> _An integrated management platform provides market information to assist franchise business owners in making effective decisions as well as enhance their connections with franchisees._

## Demo Link

**Website Link** 🌐: https://intelligeo.online

**Test Accounts**:

-   Enterprise
    -   [Login Link](https://intelligeo.online/login.html 'Login Link') 🌐
    -   Email: intelligeo.guest@gmail.com
    -   Password: guest2021
-   Franchise
    -   [Login Link](https://intelligeo.online/franchise/login.html 'Login Link') 🌐
    -   Account: N002
    -   Password: N002

## Contents

-   [Architecture](#architecture)
-   [Database Design](#database-design)
-   [Feature Highlights](#features)
-   [Future Features](#future-features)
-   [Technologies](#technologies)
-   [Contact](#contact)

## Architecture

![](https://github.com/Tiffanymctsou/Project_Assets/blob/master/Intelligeo/architecture.png)

## Database Design

![](https://github.com/Tiffanymctsou/Project_Assets/blob/master/Intelligeo/db_schema.png)

## Feature Highlights

### Data Visualisation

![](https://github.com/Tiffanymctsou/Project_Assets/blob/master/Intelligeo/data_visualisation.gif)

-   Combined multiple data sources, such as **Open Data APIs** and **Google Geocoding API**, to give an insight of target market
-   Applied **DrawingManager** constructor from Google Map APIs for **data visualisation**
-   Implemented **ETL process** for integrating Point of Interests collected from web crawler built in Python

### Real-Time Reporting System and Live Dashboard

![](https://github.com/Tiffanymctsou/Project_Assets/blob/master/Intelligeo/live_dashboard.gif)

> _Franchise (left) and Enterprise (right) User Interface_

-   Developed a **real-time dashboard** with **Socket.IO** to track performance and the live status of each franchise
-   Designed a franchise reporting system to simplify the reporting process
-   Adopted **RWD** in the reporting system with the consideration of outdoor franchisees

## Future Features

1. **Detection of franchise reported location** - to notice the enterprise admin when the location a franchise reported is out of the agreed area
2. **Detection of the distance between franchises' area** - to notice the enterprise admin when the newly selected area is too close to another (distance can be set by enterprise)
3. **Integration of stock system** - to simplify the process for franchise to place orders of ingredients; for enterprise to save time from sort all orders

## Technologies

#### Backend

-   Node.js, Express.js
-   Python (Crawler)
-   RESTful APIs
-   Nginx

#### Front-end

-   HTML
-   CSS
-   JavaScript
-   Bootstrap

#### Cloud Service (AWS)

-   Elastic Compute Cloud (EC2)
-   Simple Storage Service (S3)
-   Relational Database Service (RDS)
-   CloudFront

#### Database

-   MySQL

#### Web Socket

-   Socket.IO

#### Third Party APIs

-   Google Maps APIs (DrawingManager, Geocoding)
-   Open Data APIs

#### Networking

-   HTTP & HTTPS
-   Domain Name System

#### Test

-   Mocha
-   Chai

#### Others

-   MVC Design Pattern
-   RESTful APIs

## Contact

👩‍💻 ｜[Tiffany Tsou](https://github.com/Tiffanymctsou 'Tiffany Tsou')

✉️ ｜tiffany.mctsou@gmail.com
