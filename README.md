# Zay Backend

Backend API for the **Zay E-Commerce Platform**.  
This server handles authentication, product management, orders, users, and admin operations for the Zay ecosystem.

## Overview

Zay Backend powers the main business logic of the application and serves APIs for:

- Client storefront
- Admin dashboard
- User authentication
- Product and order management

## Features

- RESTful API architecture
- User authentication and authorization
- Admin-protected routes
- Product CRUD operations
- Category management
- Order management
- User management
- Error handling middleware
- Scalable backend structure

## Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB**
- **Mongoose**
- **JWT Authentication**
- **bcrypt**
- **Cookie / token based auth**

## Related Repositories

- **Admin Dashboard**: [Zay_Admin](https://github.com/KaungSettNaingKSN/Zay_Admin)
- **Client App**: [Zay_Client](https://github.com/KaungSettNaingKSN/Zay_Client)

## API Role in the System

```text
Client App / Admin Dashboard
            |
            v
       Zay Backend API
            |
            v
         MongoDB
```

## Project Structure

```text
src/
├── controllers/
├── models/
├── routes/
├── middleware/
├── utils/
├── config/
└── server.js
```

> Update the structure above to match your real folders.

## Installation

Clone the repository:

```bash
git clone https://github.com/KaungSettNaingKSN/Zay_Backend.git
cd Zay_Backend
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Run production:

```bash
npm start
```

## Environment Variables

Create a `.env` file in the root directory and add:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
NODE_ENV=development
```

> Replace the values with your actual configuration.

## Scripts

```json
{
  "dev": "nodemon server.js",
  "start": "node server.js"
}
```

> Change these scripts if your project uses different filenames.

## Main API Modules

### Auth
- Register user
- Login user
- Logout user
- Get current user
- Admin authentication

### Products
- Get all products
- Get single product
- Create product
- Update product
- Delete product

### Categories
- Create category
- Update category
- Delete category
- Get all categories

### Orders
- Create order
- Get user orders
- Get all orders
- Update order status
- Delete order

### Users
- Get all users
- Get single user
- Update user role
- Delete user

## Example API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| GET | `/api/orders` | Get all orders |
| POST | `/api/orders` | Create order |
| GET | `/api/users` | Get all users |

> Update endpoints to match your actual routes.

## Authentication

This backend uses **JWT-based authentication** for securing protected routes.

Typical flow:

1. User logs in with email and password
2. Server validates credentials
3. JWT token is generated
4. Protected routes are accessible with valid token
5. Admin routes require admin role

## Error Handling

The project includes centralized error handling for:

- Invalid routes
- Validation errors
- Authentication errors
- Authorization errors
- Server errors

## Future Improvements

- Payment gateway integration
- Product reviews API
- Coupon system
- Analytics endpoints
- File/image upload optimization
- Role-based permission system

## Author

**Kaung Sett Naing**  
GitHub: [KaungSettNaingKSN](https://github.com/KaungSettNaingKSN)

## License

This project is for learning and portfolio purposes.