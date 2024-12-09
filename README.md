<br/>
<h1 align="center">Rentify</h1>
<p align="center">
Rentify is a backend API for a car rental system, built using NestJS and PostgreSQL.
<br/>
<br/>
<a href="https://app.swaggerhub.com/apis-docs/MustafaHamzawy/Rentify/1.0.0" target="_blank">API Docs .</a>  
<a href="https://github.com/MUSTAFA-Hamzawy/Rentify/issues/new?labels=bug&amp;template=bug_report.md" target="_blank">Report Bug .</a>
<a href="https://github.com/MUSTAFA-Hamzawy/Rentify/issues/new?labels=enhancement&amp;&template=feature_request.md" target="_blank">Request Feature</a>
</p>
</div>

<br/>

## Table Of Contents

- [About The Project](#about-the-project)
- [Features](#features)
- [API Documentation](#api-documentation)
- [Built With](#built-with)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
    - [Using Docker](#using-docker)
    - [Manual Setup](#manual-setup)
- [Contributing](#contributing)
  - [Creating A Pull Request](#creating-a-pull-request)
- [License](#license)

## About The Project

Rentify is a backend API for a car rental system built with NestJS and PostgreSQL, inspired by the RentX app. It provides essential endpoints for managing car rentals, focusing on robust features like user management, authentication, and rental operations. Rentify is designed to streamline the backend processes required for a modern car rental service.

## Features
- <strong>User Management:</strong> Handles user and admin accounts, supporting creation, updates, and role-based access.
- <strong>Authentication:</strong> Secures the API with JWT-based access and refresh token mechanisms.
- <strong>Brands:</strong> Provides endpoints to manage and retrieve car brands for easy categorization and filtering.
- <strong>Car Management:</strong> Includes CRUD operations for cars, managing details like availability, pricing, and specifications.
- <strong>Locations:</strong> Manages pickup and dropoff points for rented cars, offering flexibility for users.
- <strong>Discounts:</strong> Enables management of promotional discounts to enhance customer engagement.
- <strong>Orders:</strong> Handles rental bookings, including order creation, status tracking, and related operations.


## API Documentation

<a href="https://documenter.getpostman.com/view/17672386/2sAYBPkENB" target="_blank"> API Docs [Postman] </a>

<a href="https://app.swaggerhub.com/apis-docs/MustafaHamzawy/Rentify/1.0.0" target="_blank"> API Docs [Swagger] </a>


## Built With

* NodeJS
* NestJS
* TypeScript
* PostgreSQL
* TypeORM
* JWT (JSON Web Tokens)
* bcryptjs
* multer
* Jest
* npm
* Postman
* Swagger
* Docker

## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

* NodeJS
* npm
* PostgreSQL
* Docker (optional)

### Installation

### First : Clone the repo
  
  ```sh
      git clone https://github.com/MUSTAFA-Hamzawy/Rentify.git
  ```

then, Move to the project directory

#### Second : Make your own copy of the .env file

1. Create a copy of the `.env.example` file and name it `.env`:
   
   ```sh
       cp .env.example .env
    ```
   
2. Update the .env file with the following configurations:
   - JWT_ACCESS_TOKEN_KEY: Generate a secure hexadecimal key using this command ( or use any way you prefer )
     
   ```sh
       openssl rand -hex 32
    ```
   
   - JWT_REFRESH_TOKEN_KEY: Generate another secure hexadecimal key using the same command.
    
   - OTP_SECRET_KEY: Generate yet another secure hexadecimal key using the same command.
   - SMTP_MAIL : write your smtp email that will be used to send emails for users
   - APP_PASSWORD : you can generate app passwrod for gmail account from here : https://knowledge.workspace.google.com/kb/how-to-create-app-passwords-000009237

#### Second : You can proceed using docker or the manual setup
#### Using Docker

Set up and run the application using Docker containers
  ```sh
      docker-compose -f docker-compose.yml -f docker-compose-prod.yml up -d
  ```
NOTE: the container will run on port 4000, you can adjust it from the file docker-compose.yml
#### Manual Setup
  
  1. Create a new database
  2. setup "src/database/db.config.json" file based on your db configurations 
  3. Install dependecies & seeding database
  
  ```sh
      npm install -g @nestjs/cli
      npm install
      npm run migration:run
      npm run seed
  ```
  
  4. Start Running
  ```sh
      npm start
  ```

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.
- If you have suggestions for adding or removing projects, feel free to [open an issue](https://github.com/MUSTAFA-Hamzawy/Rentify/issues/new) to discuss it, or
-  Directly create a pull request after you edit the files with necessary changes.

### Creating A Pull Request

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
See [LICENSE](https://github.com/MUSTAFA-Hamzawy/Rentify/blob/main/LICENSE) for more information.
