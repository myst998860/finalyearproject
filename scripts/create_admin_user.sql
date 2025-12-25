-- Create admin user for BookBridge
USE bookbridge;

-- Check if admin user already exists
SET @admin_exists = (SELECT COUNT(*) FROM users WHERE email = 'admin@bookbridge.com');

-- Insert admin user if it doesn't exist
INSERT INTO users (full_name, email, password, user_type, status, location, phone, is_verified, created_at, updated_at)
SELECT 
    'Admin User',
    'admin@bookbridge.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: admin123
    'ADMIN',
    'ACTIVE',
    'Kathmandu',
    '9871234567',
    true,
    NOW(),
    NOW()
WHERE @admin_exists = 0;

-- Display result
SELECT 
    CASE 
        WHEN @admin_exists = 0 THEN 'Admin user created successfully'
        ELSE 'Admin user already exists'
    END AS result; 