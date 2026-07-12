CREATE DATABASE IF NOT EXISTS assetflow;
USE assetflow;

-- Insert default admin user (password: admin123)
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@assetflow.com', '$2a$10$c9owByxNmm.imvPP1z9br.FfP9u/HsYgaBSZ79hQuB0eBJZ6FVkya', 'ADMIN')
ON DUPLICATE KEY UPDATE password='$2a$10$c9owByxNmm.imvPP1z9br.FfP9u/HsYgaBSZ79hQuB0eBJZ6FVkya';
