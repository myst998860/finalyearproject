-- Seed data for testing
USE bookbridge;

-- Insert test users
INSERT INTO users (full_name, email, password, user_type, location, phone) VALUES 
('John Doe', 'john@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'INDIVIDUAL', 'Kathmandu', '9841234567'),
('Jane Smith', 'jane@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'INDIVIDUAL', 'Pokhara', '9851234567'),
('ABC Organization', 'org@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ORGANIZATION', 'Lalitpur', '9861234567'),
('Admin User', 'admin@bookbridge.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN', 'Kathmandu', '9871234567');

-- Update organization specific fields
UPDATE users SET 
    organization_name = 'ABC Educational Foundation',
    contact_person = 'Ram Sharma',
    business_registration_number = 'REG123456',
    pan_number = 'PAN123456'
WHERE email = 'org@example.com';

-- Insert test books
INSERT INTO books (title, author, category, `condition`, listing_type, price, description, location, user_id) VALUES 
('Introduction to Algorithms', 'Thomas H. Cormen', 'TECHNOLOGY', 'GOOD', 'SELL', 1500.00, 'Comprehensive guide to algorithms and data structures', 'Kathmandu', 1),
('Pride and Prejudice', 'Jane Austen', 'LITERATURE', 'FAIR', 'EXCHANGE', NULL, 'Classic English literature novel', 'Kathmandu', 1),
('Calculus: Early Transcendentals', 'James Stewart', 'MATHEMATICS', 'NEW', 'SELL', 2000.00, 'Advanced calculus textbook', 'Pokhara', 2),
('The Great Gatsby', 'F. Scott Fitzgerald', 'FICTION', 'GOOD', 'DONATE', NULL, 'American classic novel', 'Pokhara', 2),
('Engineering Mechanics', 'R.C. Hibbeler', 'ENGINEERING', 'GOOD', 'SELL', 1800.00, 'Statics and dynamics textbook', 'Lalitpur', 3);

-- Insert test messages
INSERT INTO messages (sender_id, receiver_id, content, book_id) VALUES 
(1, 2, 'Hi, I am interested in your Calculus book. Is it still available?', 3),
(2, 1, 'Yes, it is still available. Would you like to exchange it for something?', 3),
(1, 2, 'I have an Algorithms book that might interest you.', 3),
(3, 1, 'Hello, I would like to donate some books to students. Do you know anyone who needs them?', NULL),
(1, 3, 'That is very kind of you! I know several students who would benefit from book donations.', NULL);

-- Insert test cart items
INSERT INTO cart_items (user_id, book_id, quantity) VALUES 
(1, 3, 1),
(2, 1, 1);

-- Insert test orders
INSERT INTO orders (order_number, user_id, total_amount, delivery_address, delivery_phone, status) VALUES 
('ORD1234567890', 1, 2000.00, '123 Main Street, Kathmandu', '9841234567', 'PENDING'),
('ORD1234567891', 2, 1500.00, '456 Lake Side, Pokhara', '9851234567', 'DELIVERED');

-- Insert test order items
INSERT INTO order_items (order_id, book_id, quantity, unit_price, total_price) VALUES 
(1, 3, 1, 2000.00, 2000.00),
(2, 1, 1, 1500.00, 1500.00);

-- Insert test payments
INSERT INTO payments (payment_id, order_id, amount, payment_method, status, esewa_transaction_id, merchant_code) VALUES 
('PAY1234567890', 1, 2000.00, 'ESEWA', 'PENDING', NULL, 'EPAYTEST'),
('PAY1234567891', 2, 1500.00, 'ESEWA', 'SUCCESS', 'TXN123456789', 'EPAYTEST');

-- Insert test Upwork transactions
INSERT INTO upwork_transactions (transaction_id, project_name, amount, description, status) VALUES 
('UPW123456789', 'BookBridge Development', 5000.00, 'Backend development payment', 'COMPLETED'),
('UPW123456790', 'BookBridge Frontend', 3000.00, 'Frontend development payment', 'PENDING');
