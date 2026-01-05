# Travel Buddy API

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9%2B-blue)](https://www.typescriptlang.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18%2B-green)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0%2B-purple)](https://www.prisma.io/)

A comprehensive travel companion platform that connects travelers worldwide, enabling them to create travel plans, find travel buddies, and share amazing experiences together.

## 🌟 Summary

Travel Buddy is a modern, full-stack platform designed to bring travelers together in a safe and engaging environment. Built with cutting-edge technologies, the platform enables users to create detailed travel plans, search for compatible travel companions, send join requests, and review their travel experiences. With features like user authentication, subscription management, payment processing, and a robust review system, Travel Buddy offers everything needed for seamless travel coordination and community building.

## 📊 Project Stats

- **API Endpoints**: 25+
- **Database Models**: 8 core models
- **Authentication**: JWT-based with refresh tokens
- **Payment Integration**: Stripe & SSLCommerz
- **File Storage**: Cloudinary integration
- **Real-time Features**: Email notifications, status updates
- **Security**: Rate limiting, input validation, CORS

## 🎯 Aim & Vision

### Primary Goals

- **Connect Travelers**: Bring together people with similar travel interests and destinations
- **Safety First**: Provide a verified and secure platform for finding travel companions
- **Seamless Planning**: Enable easy travel planning and coordination tools
- **Community Building**: Foster a trusted community through reviews and ratings
- **Premium Experience**: Offer advanced features through flexible subscription plans

### Vision

To become the world's most trusted travel companion platform, making solo travel safer and group travel more enjoyable through technology-driven connections.

## 🚀 Features

### User Management

- User registration and email verification
- Secure authentication with JWT tokens
- Profile management with travel interests and history
- Admin dashboard for user management
- User status management (Active, Inactive, Blocked)

### Travel Planning

- Create detailed travel plans with images
- Search and filter travel plans
- Travel buddy matching system
- Join requests with approval workflow
- Travel plan status management

### Social Features

- User reviews and ratings
- Public traveler profiles
- Travel history and badges
- Community interaction

### Payment & Subscription

- Stripe integration for payments
- Subscription plans (Free, Monthly, Yearly)
- Payment webhook handling
- Subscription management

### Security & Performance

- Advanced rate limiting with configurable limits
- Comprehensive input validation with Zod schemas
- Secure file uploads with Cloudinary integration
- JWT-based authentication with refresh token rotation
- Password hashing with bcrypt
- CORS configuration for cross-origin security
- Request logging and monitoring
- Soft delete functionality for data integrity
- Environment-based configuration management
- SQL injection prevention with Prisma ORM

## 🛠️ Tech Stack

### Backend Architecture

- **Node.js** (v18+) - Asynchronous JavaScript runtime
- **Express.js** (v4.18+) - Fast, minimalist web framework
- **TypeScript** (v4.9+) - Type-safe JavaScript development
- **Prisma** (v5.0+) - Modern database toolkit and ORM
- **PostgreSQL** - Robust, open-source relational database

### Authentication & Security

- **JWT** - JSON Web Tokens for stateless authentication
- **bcryptjs** - Secure password hashing library
- **Helmet** - Security header middleware for Express
- **CORS** - Cross-origin resource sharing configuration
- **express-rate-limit** - Rate limiting middleware

### File Storage & Payments

- **Cloudinary** - Cloud-based image and video management
- **Multer** - Middleware for handling multipart/form-data
- **Stripe** (v19+) - Payment processing platform
- **SSLCommerz** - Alternative payment gateway for local markets

### Development & DevOps Tools

- **ts-node-dev** - TypeScript development server with hot reload
- **Zod** (v4+) - TypeScript-first schema validation
- **Nodemailer** - Email sending library
- **node-cron** - Task scheduler for automated jobs
- **date-fns** - Modern JavaScript date utility library
- **uuid** - Generate RFC-compliant UUIDs

### Database Schema

The application uses PostgreSQL with the following core models:

- **User** - User profiles and authentication
- **TravelPlan** - Travel itineraries and details
- **TravelRequest** - Join requests and approvals
- **Review** - User ratings and feedback
- **Subscription** - Payment plans and status
- **VerificationCode** - Email verification tokens

## 📋 Prerequisites

### System Requirements

- **Node.js** (v18 or higher) - JavaScript runtime
- **PostgreSQL** (v13 or higher) - Primary database
- **npm** (v8 or higher) or **pnpm** (v7 or higher) - Package manager

### External Services

- **Stripe Account** - Payment processing (test keys for development)
- **Cloudinary Account** - Image and file storage
- **Gmail Account** - Email services with app password enabled

### Development Tools (Recommended)

- **PostgreSQL Client** - pgAdmin, DBeaver, or similar
- **API Testing Tool** - Postman, Insomnia, or similar
- **Git** - Version control

## 🚀 Getting Started

### 1. Clone the Repository

```bash
# Using HTTPS
git clone https://github.com/almamun2b/travel-buddy-api.git

# Using SSH (recommended for contributors)
git clone git@github.com:almamun2b/travel-buddy-api.git

# Navigate to project directory
cd travel-buddy-api
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Using pnpm (recommended for faster installs)
pnpm install

# Using yarn
yarn install
```

### 3. Environment Setup

Copy the environment template and configure your variables:

```bash
cp .env.example .env
```

Configure the following environment variables:

```env
# ===========================================
# Application Configuration
# ===========================================
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# ===========================================
# Database Configuration
# ===========================================
DATABASE_URL="postgresql://username:password@localhost:5432/travel_buddy_db?schema=public"

# ===========================================
# Security Configuration
# ===========================================
SALT_ROUND=12

# ===========================================
# JWT Configuration
# ===========================================
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here_make_it_long_and_secure
REFRESH_TOKEN_EXPIRES_IN=30d

# ===========================================
# Password Reset Configuration
# ===========================================
RESET_PASS_TOKEN=your_reset_pass_token_secret_here
RESET_PASS_TOKEN_EXPIRES_IN=1h
RESET_PASS_LINK=http://localhost:3000/reset-password

# ===========================================
# Email Configuration (Gmail SMTP)
# ===========================================
EMAIL=your_email@gmail.com
APP_PASS=your_google_app_password

# ===========================================
# Payment Configuration
# ===========================================
# Stripe Payment Gateway
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# SSLCommerz Payment Gateway (optional)
STORE_ID=your_ssl_store_id
STORE_PASS=your_ssl_store_pass
SUCCESS_URL=http://localhost:3000/payment/success
CANCEL_URL=http://localhost:3000/payment/cancel
FAIL_URL=http://localhost:3000/payment/fail
SSL_PAYMENT_API=https://sandbox.sslcommerz.com/gwprocess/v4/api.php
SSL_VALIDATIOIN_API=https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php

# ===========================================
# File Storage Configuration
# ===========================================
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 4. Database Setup

```bash
# Generate Prisma client
pnpm db:generate

# Push database schema (for development)
pnpm db:push

# Run migrations (for production)
pnpm db:migrate

# View database in Prisma Studio (optional)
pnpm db:studio
```

### 5. Start Development Server

```bash
# Development mode with hot reload
pnpm dev

# Production build
pnpm build
pnpm start

# View logs in production
pm2 logs travel-buddy-api
```

The API will be available at `http://localhost:5000`

### 6. Verify Installation

Test the API endpoints:

```bash
# Health check
curl http://localhost:5000/health

# API documentation (if available)
curl http://localhost:5000/api-docs
```

## 📚 API Documentation

### Overview

The Travel Buddy API follows RESTful principles and uses JSON for all requests and responses. All endpoints are properly documented with request/response examples and include comprehensive error handling.

### Base URL

- **Development**: `http://localhost:5000`
- **Production**: `https://travel-buddy-api-5xvg.onrender.com`
- **API Version**: v1

### Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```json
{
  "Authorization": "Bearer <your_jwt_token>",
  "Content-Type": "application/json"
}
```

### Rate Limiting

- **Default**: 100 requests per 15 minutes per IP
- **Authenticated Users**: 200 requests per 15 minutes
- **Admin Users**: 500 requests per 15 minutes

### Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error details",
    "stack": "Development only"
  }
}
```

---

## 🔐 Authentication Endpoints

### Register User

**POST** `/auth/register`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "contactNumber": "+1234567890",
  "bio": "Travel enthusiast",
  "currentLocation": "New York",
  "travelInterests": ["Adventure", "Photography"],
  "visitedCountries": ["USA", "Canada"]
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully. Please check your email for verification code.",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "isVerified": false
  }
}
```

### Verify Email

**POST** `/auth/verify-email`

**Request Body:**

```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "isVerified": true
  }
}
```

### Login

**POST** `/auth/login`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "USER"
    }
  }
}
```

### Refresh Token

**POST** `/auth/refresh-token`

**Request Body:**

```json
{
  "refreshToken": "your_refresh_token"
}
```

### Forgot Password

**POST** `/auth/forgot-password`

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

### Reset Password

**POST** `/auth/reset-password`

**Request Body:**

```json
{
  "id": "user_uuid",
  "password": "new_password123"
}
```

### Change Password (Protected)

**POST** `/auth/change-password`

**Request Body:**

```json
{
  "oldPassword": "old_password",
  "newPassword": "new_password123"
}
```

### Get Current User (Protected)

**GET** `/auth/me`

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "USER",
    "isVerified": true
  }
}
```

---

## 👥 User Endpoints

### Get All Users (Admin Only)

**GET** `/user`

### Get Dashboard Stats (Protected)

**GET** `/user/dashboard-stats`

**Response:**

```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalTravelPlans": 75,
    "activePlans": 25,
    "pendingRequests": 10
  }
}
```

### Get My Profile (Protected)

**GET** `/user/profile/me`

### Explore Travelers (Public)

**GET** `/user/explore/travelers`

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search by name or location
- `interests`: Filter by travel interests

### Get Public Profile

**GET** `/user/profile/:id`

### Update My Profile (Protected)

**PATCH** `/user/profile/update`

**Request Body (multipart/form-data):**

```
data: {
  "fullName": "John Doe",
  "bio": "Updated bio",
  "currentLocation": "Los Angeles",
  "travelInterests": ["Adventure", "Photography", "Food"]
}
file: [image_file]
```

---

## 🌍 Travel Plans Endpoints

### Get All Travel Plans (Public)

**GET** `/travel-plans`

**Query Parameters:**

- `page`: Page number
- `limit`: Items per page
- `destination`: Filter by destination
- `travelType`: Filter by travel type
- `startDate`: Filter by start date
- `endDate`: Filter by end date

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Adventure in Bali",
      "description": "Exploring the beautiful beaches and temples",
      "destination": "Bali, Indonesia",
      "startDate": "2024-06-15",
      "endDate": "2024-06-25",
      "budget": 2000,
      "travelType": "GROUP",
      "maxMembers": 5,
      "activities": ["Surfing", "Temple Tours", "Hiking"],
      "images": ["https://example.com/image1.jpg"],
      "status": "OPEN",
      "creator": {
        "id": "uuid",
        "fullName": "John Doe",
        "avatar": "https://example.com/avatar.jpg"
      },
      "createdAt": "2024-05-01T10:00:00Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10
  }
}
```

### Create Travel Plan (Protected)

**POST** `/travel-plans`

**Request Body (multipart/form-data):**

```
data: {
  "title": "Adventure in Bali",
  "description": "Exploring the beautiful beaches and temples",
  "destination": "Bali, Indonesia",
  "startDate": "2024-06-15",
  "endDate": "2024-06-25",
  "budget": 2000,
  "travelType": "GROUP",
  "maxMembers": 5,
  "activities": ["Surfing", "Temple Tours", "Hiking"]
}
images: [file1, file2, file3]
```

### Get My Travel Plans (Protected)

**GET** `/travel-plans/my/plans`

### Get Travel Plan by ID (Public)

**GET** `/travel-plans/:id`

### Update Travel Plan (Protected)

**PATCH** `/travel-plans/:id`

### Update Travel Plan Status (Protected)

**PATCH** `/travel-plans/:id/status`

**Request Body:**

```json
{
  "status": "CLOSED"
}
```

### Delete Travel Plan (Protected)

**DELETE** `/travel-plans/:id`

---

## 🤝 Travel Requests Endpoints

### Send Travel Request (Protected)

**POST** `/travel-plans/requests/send`

**Request Body:**

```json
{
  "travelPlanId": "plan_uuid",
  "message": "I would love to join your trip! I have experience in hiking and photography."
}
```

### Get My Travel Requests (Protected)

**GET** `/travel-plans/requests/my`

### Get Pending Requests for My Plans (Protected)

**GET** `/travel-plans/requests/pending`

### Respond to Travel Request (Protected)

**PATCH** `/travel-plans/requests/:requestId/respond`

**Request Body:**

```json
{
  "status": "APPROVED"
}
```

### Get Approved Requests for Plan (Protected)

**GET** `/travel-plans/requests/approved/:travelPlanId`

---

## 💳 Payment Endpoints

### Get Subscription Plans (Public)

**GET** `/payment/plans`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "free",
      "name": "Free Plan",
      "price": 0,
      "duration": "lifetime",
      "features": ["Create up to 3 travel plans", "Basic profile features"]
    },
    {
      "id": "monthly",
      "name": "Monthly Plan",
      "price": 9.99,
      "duration": "month",
      "features": [
        "Unlimited travel plans",
        "Advanced profile features",
        "Priority support"
      ]
    }
  ]
}
```

### Create Checkout Session (Protected)

**POST** `/payment/create-checkout-session`

**Request Body:**

```json
{
  "planId": "monthly",
  "successUrl": "https://yourapp.com/payment/success",
  "cancelUrl": "https://yourapp.com/payment/cancel"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "sessionId": "cs_test_a1B2c3D4e5F6",
    "url": "https://checkout.stripe.com/pay/cs_test_a1B2c3D4e5F6"
  }
}
```

### Get Subscription Status (Protected)

**GET** `/payment/subscription/status`

**Response:**

```json
{
  "success": true,
  "data": {
    "plan": "MONTHLY",
    "status": "ACTIVE",
    "startDate": "2024-01-01",
    "endDate": "2024-02-01",
    "stripeCustomerId": "cus_123456789"
  }
}
```

### Cancel Subscription (Protected)

**POST** `/payment/subscription/cancel`

### Confirm Subscription (Protected)

**POST** `/payment/subscription/confirm`

---

## ⭐ Reviews Endpoints

### Create Review (Protected)

**POST** `/reviews`

**Request Body:**

```json
{
  "travelPlanId": "plan_uuid",
  "revieweeId": "user_uuid",
  "rating": 5,
  "comment": "Amazing travel companion! Very organized and friendly."
}
```

### Get My Reviews (Protected)

**GET** `/reviews/my`

### Get Reviews Given by Me (Protected)

**GET** `/reviews/given`

### Get Reviews for User (Public)

**GET** `/reviews/user/:userId`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "rating": 5,
      "comment": "Amazing travel companion!",
      "reviewer": {
        "id": "uuid",
        "fullName": "Jane Smith",
        "avatar": "https://example.com/avatar.jpg"
      },
      "travelPlan": {
        "id": "uuid",
        "title": "Adventure in Bali",
        "destination": "Bali, Indonesia"
      },
      "createdAt": "2024-05-01T10:00:00Z"
    }
  ]
}
```

### Update Review (Protected)

**PATCH** `/reviews/:id`

**Request Body:**

```json
{
  "rating": 4,
  "comment": "Updated review text"
}
```

### Delete Review (Protected)

**DELETE** `/reviews/:id`

---

## 🔧 Error Handling

The API uses standard HTTP status codes and returns error responses in the following format:

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error details"
  }
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## 🌐 Live URLs

### API (Backend)

- **Live API**: https://travel-buddy-api-5xvg.onrender.com
- **API Documentation**: Available at `/api-docs` endpoint

### Frontend

- **Live Application**: https://travel-buddy-mamun.vercel.app

### Repository

- **Backend Repository**: https://github.com/almamun2b/travel-buddy-api
- **Frontend Repository**: https://github.com/almamun2b/travel-buddy

---

## 📝 Scripts

### Development Scripts

```bash
# Start development server with hot reload
pnpm dev

# Build the application
pnpm build

# Start production server
pnpm start

# Run in watch mode
pnpm dev --watch
```

### Database Scripts

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database (development)
pnpm db:push

# Run database migrations
pnpm db:migrate

# Pull schema from database
pnpm db:pull

# Open Prisma Studio (database GUI)
pnpm db:studio

# Reset database (development only)
pnpm db:reset
```

### Payment & Webhook Scripts

```bash
# Listen for Stripe webhooks
pnpm stripe:webhook

# Test webhook endpoints
pnpm test:webhooks
```

### Utility Scripts

```bash
# Seed database with initial data
pnpm seed

# Run type checking
pnpm type-check

# Lint code
pnpm lint

# Format code
pnpm format

# Clean build artifacts
pnpm clean
```

## 🏗️ Project Structure

```
travel-buddy-api/
├── src/
│   ├── app/
│   │   ├── modules/          # Feature modules
│   │   │   ├── auth/         # Authentication logic
│   │   │   ├── user/         # User management
│   │   │   ├── travelPlans/  # Travel plan features
│   │   │   ├── payment/      # Payment processing
│   │   │   └── review/       # Review system
│   │   ├── middlewares/      # Custom middlewares
│   │   ├── routes/          # API routes
│   │   ├── interfaces/      # TypeScript interfaces
│   │   └── errors/          # Error handling
│   ├── config/              # Configuration files
│   ├── helpers/             # Utility functions
│   ├── shared/              # Shared utilities
│   ├── app.ts               # Express app setup
│   └── server.ts            # Server bootstrap
├── prisma/
│   ├── schema/              # Database schema files
│   └── migrations/          # Database migrations
├── uploads/                 # Temporary upload directory
├── dist/                    # Compiled JavaScript
├── .env.example             # Environment template
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── README.md                # This file
```

## 🔄 Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and test
pnpm dev

# Run tests and linting
pnpm test
pnpm lint

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```

### 2. Database Changes

```bash
# Modify schema in prisma/schema/
# Generate migration
pnpm db:migrate --name describe_changes

# Apply to local database
pnpm db:push

# Test changes
pnpm db:studio
```

### 3. Environment Management

```bash
# Development
NODE_ENV=development pnpm dev

# Production
NODE_ENV=production pnpm build && pnpm start

# Testing
NODE_ENV=test pnpm test
```

## 🚀 Deployment

### Environment Variables for Production

Ensure these are set in your production environment:

- `NODE_ENV=production`
- `DATABASE_URL` - Production database URL
- `JWT_SECRET` - Strong, unique secret
- `STRIPE_SECRET_KEY` - Production Stripe key
- `CLOUDINARY_*` - Production Cloudinary credentials
- `EMAIL` & `APP_PASS` - Production email settings

### Deployment Steps

```bash
# Install dependencies
pnpm install --production

# Build application
pnpm build

# Run database migrations
pnpm db:migrate

# Start application
pnpm start
```

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

---

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### How to Contribute

1. **Fork the Repository**

   ```bash
   # Fork on GitHub and clone your fork
   git clone https://github.com/your-username/travel-buddy-api.git
   cd travel-buddy-api
   ```

2. **Set Up Development Environment**

   ```bash
   # Install dependencies
   pnpm install

   # Copy environment file
   cp .env.example .env

   # Set up database
   pnpm db:push
   ```

3. **Create a Feature Branch**

   ```bash
   git checkout -b feature/amazing-feature
   ```

4. **Make Your Changes**

   - Follow the existing code style and patterns
   - Add tests for new functionality
   - Update documentation as needed
   - Ensure all tests pass

5. **Commit Your Changes**

   ```bash
   # Stage changes
   git add .

   # Commit with conventional commit message
   git commit -m 'feat: add amazing feature'
   ```

6. **Push and Create Pull Request**

   ```bash
   # Push to your fork
   git push origin feature/amazing-feature

   # Create pull request on GitHub
   ```

### Code Style Guidelines

- Use TypeScript for all new code
- Follow ESLint configuration
- Use conventional commit messages
- Write meaningful commit messages
- Add JSDoc comments for public functions
- Keep functions small and focused
- Use environment variables for configuration

### Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run integration tests
pnpm test:integration
```

### Pull Request Process

1. **Description**: Clearly describe what your PR does
2. **Testing**: Include tests for new functionality
3. **Documentation**: Update relevant documentation
4. **Screenshots**: Add screenshots for UI changes
5. **Breaking Changes**: Clearly mark any breaking changes

### Code Review Process

- All PRs require at least one approval
- Address all review comments
- Ensure CI/CD passes
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

### MIT License Summary

✅ **What you can do:**

- Commercial use
- Distribution
- Modification
- Private use

❌ **What you cannot do:**

- Hold liable
- Warranty

📝 **What you must do:**

- Include license
- Include copyright notice

## 🆘 Support & Help

### Getting Help

If you encounter any issues or have questions:

1. **Check Documentation**

   - Read this README thoroughly
   - Check API documentation
   - Review existing issues

2. **Search Existing Issues**

   - Browse [GitHub Issues](https://github.com/almamun2b/travel-buddy-api/issues)
   - Search for similar problems
   - Check if issue is resolved

3. **Create New Issue**

   - Use appropriate issue template
   - Provide detailed information
   - Include error messages and screenshots
   - Specify environment details

4. **Community Support**
   - Join our Discord community (link coming soon)
   - Participate in discussions
   - Help other community members

### Issue Templates

When creating issues, please use these templates:

#### Bug Report

- Description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details
- Screenshots if applicable

#### Feature Request

- Feature description
- Use case scenario
- Proposed implementation
- Alternative solutions considered

#### Question

- Clear question description
- What you've tried
- Relevant code snippets
- Expected outcome

### Contact Information

- **GitHub Issues**: [Create Issue](https://github.com/almamun2b/travel-buddy-api/issues)
- **Email**: contact@travelbuddy.com (for business inquiries)
- **Twitter**: [@travelbuddy_api](https://twitter.com/travelbuddy_api)

### Response Times

- **Bug Reports**: 24-48 hours
- **Feature Requests**: 3-5 business days
- **Questions**: 24-72 hours
- **Security Issues**: Immediate response

## 🔒 Security

### Reporting Security Vulnerabilities

If you discover a security vulnerability, please report it responsibly:

1. **Do not** create a public issue
2. Email us at security@travelbuddy.com
3. Include detailed vulnerability description
4. We'll respond within 24 hours
5. We'll work on a fix and coordinate disclosure

### Security Best Practices

- Keep dependencies updated
- Use strong, unique passwords
- Enable 2FA on accounts
- Regular security audits
- Follow OWASP guidelines

## 🙏 Acknowledgments

Special thanks to:

- All contributors who help improve this project
- The open-source community for amazing tools
- Early adopters for valuable feedback
- The travel community for inspiration

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/almamun2b">Al Mamun</a></p>
  <p>If you find this project helpful, please consider giving it a ⭐️</p>
  <p>
    <a href="#top">Back to top ↑</a>
  </p>
</div>
