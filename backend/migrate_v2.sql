-- Run this AFTER your existing schema.sql, against your existing `ecommerce` database.
-- It only ADDS new tables/columns - it does not touch your existing data.
--
-- PowerShell:  Get-Content backend/migrate_v2.sql | mysql -u root -p ecommerce

USE ecommerce;

-- ------------------------------------------------------------------
-- 1. Product ratings (customers rate products they purchased)
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ratings (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    product_id  INT NOT NULL,
    rating      TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review      TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product_rating (user_id, product_id)
);

-- ------------------------------------------------------------------
-- 2. Wishlist (save products for later)
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wishlist (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    product_id  INT NOT NULL,
    added_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product_wishlist (user_id, product_id)
);

-- ------------------------------------------------------------------
-- 3. Coupons (discount codes applied at checkout)
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coupons (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    code             VARCHAR(30) NOT NULL UNIQUE,
    discount_percent INT NOT NULL CHECK (discount_percent BETWEEN 1 AND 100),
    active           BOOLEAN DEFAULT TRUE,
    expires_at       DATE DEFAULT NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Track which coupon (if any) was used on an order, and how much it saved
ALTER TABLE orders
    ADD COLUMN coupon_code VARCHAR(30) DEFAULT NULL,
    ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0.00;

-- A couple of sample coupons to test with
INSERT INTO coupons (code, discount_percent, active, expires_at) VALUES
    ('WELCOME10', 10, TRUE, NULL),
    ('SAVE20', 20, TRUE, '2026-12-31')
ON DUPLICATE KEY UPDATE code = code;
