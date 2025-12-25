-- Create database
CREATE DATABASE IF NOT EXISTS bookbridge;
USE bookbridge;

-- Users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    user_type ENUM('INDIVIDUAL', 'ORGANIZATION', 'ADMIN') NOT NULL,
    status ENUM('ACTIVE', 'BLOCKED', 'DELETED') DEFAULT 'ACTIVE',
    
    -- Individual user fields
    id_card_number VARCHAR(50),
    id_card_photo VARCHAR(255),
    
    -- Organization fields
    organization_name VARCHAR(200),
    contact_person VARCHAR(100),
    business_registration_number VARCHAR(50),
    pan_number VARCHAR(20),
    document_photo VARCHAR(255),
    
    -- Common fields
    location VARCHAR(255),
    profile_image VARCHAR(255),
    phone VARCHAR(20),
    reset_token VARCHAR(255),
    reset_token_expiry DATETIME,
    is_verified BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_user_type (user_type),
    INDEX idx_status (status),
    INDEX idx_reset_token (reset_token)
);

-- Books table
CREATE TABLE books (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(100) NOT NULL,
    edition VARCHAR(50),
    isbn VARCHAR(20),
    category ENUM('SCIENCE', 'LITERATURE', 'ENGINEERING', 'MATHEMATICS', 'HISTORY', 
                  'PHILOSOPHY', 'ARTS', 'BUSINESS', 'TECHNOLOGY', 'MEDICAL', 
                  'LAW', 'EDUCATION', 'FICTION', 'NON_FICTION', 'TEXTBOOK', 'OTHER') NOT NULL,
    `condition` ENUM('NEW', 'GOOD', 'FAIR', 'POOR') NOT NULL,
    listing_type ENUM('SELL', 'EXCHANGE', 'DONATE') NOT NULL,
    price DECIMAL(10, 2),
    description TEXT,
    location VARCHAR(255) NOT NULL,
    book_image VARCHAR(255),
    status ENUM('AVAILABLE', 'RESERVED', 'SOLD', 'EXCHANGED', 'DONATED', 'DELETED') DEFAULT 'AVAILABLE',
    view_count INT DEFAULT 0,
    interest_count INT DEFAULT 0,
    user_id BIGINT NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_title (title),
    INDEX idx_author (author),
    INDEX idx_category (category),
    INDEX idx_condition (`condition`),
    INDEX idx_listing_type (listing_type),
    INDEX idx_status (status),
    INDEX idx_location (location),
    INDEX idx_user_id (user_id),
    FULLTEXT idx_search (title, author, isbn)
);

-- Messages table
CREATE TABLE messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    book_id BIGINT,
    message_type ENUM('TEXT', 'IMAGE', 'SYSTEM') DEFAULT 'TEXT',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE SET NULL,
    INDEX idx_sender_receiver (sender_id, receiver_id),
    INDEX idx_receiver_unread (receiver_id, is_read),
    INDEX idx_book_id (book_id),
    INDEX idx_created_at (created_at)
);

-- Orders table
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED') DEFAULT 'PENDING',
    
    delivery_address TEXT,
    delivery_phone VARCHAR(20),
    delivery_notes TEXT,
    estimated_delivery DATETIME,
    delivery_status ENUM('PENDING', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'FAILED') DEFAULT 'PENDING',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_order_number (order_number),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_delivery_status (delivery_status),
    INDEX idx_created_at (created_at)
);

-- Order Items table
CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    book_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_book_id (book_id)
);

-- Cart Items table
CREATE TABLE cart_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    book_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_book (user_id, book_id),
    INDEX idx_user_id (user_id),
    INDEX idx_book_id (book_id)
);

-- Payments table
CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_id VARCHAR(50) UNIQUE NOT NULL,
    order_id BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('ESEWA', 'CASH_ON_DELIVERY') NOT NULL,
    status ENUM('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED') DEFAULT 'PENDING',
    
    -- eSewa specific fields
    esewa_transaction_id VARCHAR(100),
    esewa_ref_id VARCHAR(100),
    merchant_code VARCHAR(20),
    success_url VARCHAR(255),
    failure_url VARCHAR(255),
    payment_response TEXT,
    failure_reason VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_payment_id (payment_id),
    INDEX idx_order_id (order_id),
    INDEX idx_status (status),
    INDEX idx_payment_method (payment_method),
    INDEX idx_esewa_transaction_id (esewa_transaction_id)
);

-- Upwork Transactions table
CREATE TABLE upwork_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    project_name VARCHAR(200),
    amount DECIMAL(10, 2),
    description TEXT,
    status ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED') DEFAULT 'PENDING',
    upwork_reference VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Create admin user
INSERT INTO users (full_name, email, password, user_type) VALUES 
('Admin User', 'admin@bookbridge.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN');
-- Password is 'password' (bcrypt encoded)
