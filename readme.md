# Backend Factory API

A general, scalable backend built with Node.js, Express, and MongoDB. This project implements reusable factory methods for CRUD operations, dynamic query handling (filtering, sorting, pagination), custom error handling, security middleware, and both unit and integration tests.

Note: Postman collection file is added in the repository.

## Table of Contents

- [Features](#features)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [Testing](#testing)

## Features

- **Reusable CRUD Factory Methods:**
  - `createOne`, `getOne`, `updateOne`, `deleteOne`, `getAll`, `getAllAgg`, `singularCreateAndUpdate`
- **Dynamic Query Handling:**
  - Filtering, sorting, and pagination for GET endpoints.
- **Custom Error Handling:**
  - Global error middleware and a custom `AppError` class.
- **Validation:**
  - Request validation using `express-validator`.
- **Security Middleware:**
  - HTTP header protection with Helmet, rate limiting, data sanitization, and CORS.
- **Testing:**
  - Comprehensive unit tests (using Jest) and integration tests (using Supertest and mongodb-memory-server).

## Installation & Setup

## Clone the Repository

```bash
git clone https://github.com/yourusername/modular-backend.git
cd modular-backend
```

## Install Dependencies

```
npm install
```

## Environment Variables

Create a `.env` file in the root directory and add:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
NODE_ENV=dev
```

For testing, the project uses an in-memory MongoDB instance, so you don't need to set MONGO_URI when running tests.

# Running the Project

## Start the server

```
node server.js
```

The server will start on the port specified in the .env file (default is 3000).

# Access the API

## Base URL

```
http://localhost:3000/api/users
```

# Testing

Note: For testing set the NODE_ENV must not be test

## Unit Tests

```
npm run test:unit
```

## Integration Tests

```
npm run test:integration
```
