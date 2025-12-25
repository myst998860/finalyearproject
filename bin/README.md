# BookBridge Backend

BookBridge is a comprehensive backend system for a second-hand book trading platform built with Spring Boot. It supports buying, selling, exchanging, and donating books with features like real-time messaging, payment integration, and admin management.

## Features

### Core Functionality
- **User Registration & Authentication**: Individual and Organization registration with JWT authentication
- **Book Management**: CRUD operations for book listings with advanced search and filtering
- **Real-time Messaging**: WebSocket-based chat system for user communication
- **Cart & Checkout**: Shopping cart functionality with order management
- **Payment Integration**: eSewa Test API integration for secure payments
- **Admin Panel**: Comprehensive admin dashboard for user and content management
- **File Upload**: Support for profile images, ID cards, documents, and book images
- **Email Notifications**: SMTP-based email system for notifications and password reset

### Technical Features
- **JWT Authentication**: Secure token-based authentication with HTTP session management
- **RESTful APIs**: Complete REST API with proper HTTP status codes and error handling
- **Database Integration**: MySQL database with JPA/Hibernate ORM
- **WebSocket Support**: Real-time messaging and notifications
- **File Storage**: Local file storage with configurable paths
- **Email Service**: Gmail SMTP integration for email notifications
- **Payment Processing**: eSewa Test API integration with callback handling
- **Admin Dashboard**: Statistics, user management, and transaction monitoring

## Technology Stack

- **Framework**: Spring Boot 3.2.0
- **Database**: MySQL 8.0
- **Authentication**: JWT with HTTP Sessions
- **Real-time Communication**: WebSocket (STOMP)
- **Email**: Spring Mail with Gmail SMTP
- **File Upload**: Apache Commons FileUpload
- **Payment**: eSewa Test API
- **Build Tool**: Maven
- **Java Version**: 17

## Project Structure

\`\`\`
src/main/java/com/bookbridge/
├── model/              # Entity classes
├── repository/         # JPA repositories
├── service/           # Business logic services
├── controller/        # REST API controllers
├── config/           # Configuration classes
└── BookBridgeApplication.java

src/main/resources/
├── application.properties
└── static/

scripts/
├── create_database_schema.sql
└── seed_data.sql

postman/
└── BookBridge_API_Collection.json
\`\`\`

## Setup Instructions

### Prerequisites
- Java 17 or higher
- MySQL 8.0 or higher
- Maven 3.6 or higher
- Gmail account for SMTP (optional)

### Database Setup

1. **Create Database**:
   \`\`\`bash
   mysql -u root -p
   CREATE DATABASE bookbridge;
   \`\`\`

2. **Run Schema Script**:
   \`\`\`bash
   mysql -u root -p bookbridge < scripts/create_database_schema.sql
   \`\`\`

3. **Load Seed Data** (Optional):
   \`\`\`bash
   mysql -u root -p bookbridge < scripts/seed_data.sql
   \`\`\`

### Application Configuration

1. **Update Database Configuration** in `application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/bookbridge
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   \`\`\`

2. **Configure Email Settings** (Optional):
   ```properties
   spring.mail.username=your-email@gmail.com
   spring.mail.password=your-app-password
   \`\`\`

3. **Set File Upload Directory**:
   ```properties
   app.file.upload-dir=./uploads/
   \`\`\`

### Running the Application

1. **Clone the Repository**:
   \`\`\`bash
   git clone <repository-url>
   cd bookbridge-backend
   \`\`\`

2. **Build the Project**:
   \`\`\`bash
   mvn clean install
   \`\`\`

3. **Run the Application**:
   \`\`\`bash
   mvn spring-boot:run
   \`\`\`

4. **Access the Application**:
   - API Base URL: `http://localhost:8080/api`
   - WebSocket Endpoint: `ws://localhost:8080/ws`

## API Documentation

### Authentication Endpoints
- `POST /api/register/individual` - Register individual user
- `POST /api/register/organization` - Register organization
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `POST /api/password/reset` - Initiate password reset
- `POST /api/password/reset/complete` - Complete password reset
- `GET /api/me` - Get current user info

### Book Management
- `GET /api/books` - Get all books with search/filter
- `GET /api/books/{id}` - Get book by ID
- `POST /api/books` - Create new book listing
- `PUT /api/books/{id}` - Update book listing
- `DELETE /api/books/{id}` - Delete book listing
- `GET /api/books/my-books` - Get user's books
- `POST /api/books/{id}/interest` - Express interest in book

### Messaging
- `POST /api/messages` - Send message
- `GET /api/messages/conversation/{userId}` - Get conversation
- `GET /api/messages/unread` - Get unread messages
- `PUT /api/messages/{id}/read` - Mark message as read
- `GET /api/messages/partners` - Get chat partners

### Cart & Orders
- `GET /api/cart` - Get cart items
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/{id}` - Update cart item
- `DELETE /api/cart/{id}` - Remove from cart
- `DELETE /api/cart/clear` - Clear cart
- `GET /api/orders` - Get user orders
- `POST /api/orders/checkout` - Create order from cart
- `PUT /api/orders/{id}/cancel` - Cancel order

### Payments
- `POST /api/payments/esewa` - Initiate eSewa payment
- `GET /api/payments/esewa/success` - eSewa success callback
- `GET /api/payments/esewa/failure` - eSewa failure callback
- `GET /api/payments/verify` - Verify payment status

### User Management
- `GET /api/users/{id}/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/change-password` - Change password

### Admin Panel
- `POST /api/admin/login` - Admin login
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/{id}/block` - Block user
- `DELETE /api/admin/users/{id}` - Delete user
- `GET /api/admin/books` - Get all books
- `DELETE /api/admin/books/{id}` - Delete book
- `GET /api/admin/payments` - Get all payments
- `POST /api/admin/upwork` - Log Upwork transaction
- `GET /api/admin/upwork` - Get Upwork transactions

## eSewa Integration

The application integrates with eSewa Test API for payment processing:

- **Merchant Code**: `EPAYTEST`
- **Test Environment**: `https://uat.esewa.com.np`
- **Test Phone**: `9800000000`

### Payment Flow
1. User initiates payment via `/api/payments/esewa`
2. Application creates payment record and returns eSewa parameters
3. Frontend redirects to eSewa payment page
4. eSewa processes payment and calls success/failure callback
5. Application verifies payment and updates order status

## WebSocket Integration

Real-time messaging is implemented using WebSocket with STOMP protocol:

- **Connection Endpoint**: `/ws`
- **Message Destination**: `/app/chat.sendMessage`
- **User Queue**: `/user/{email}/queue/messages`

### WebSocket Usage
