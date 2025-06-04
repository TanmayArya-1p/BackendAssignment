DROP DATABASE IF EXISTS mvc;

CREATE DATABASE IF NOT EXISTS mvc;

USE mvc;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM ('admin', 'chef', 'customer') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(255),
    price FLOAT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    issued_by INT NOT NULL,
    issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM (
        'pending',
        'preparing',
        'served',
        'billed',
        'paid'
    ) NOT NULL DEFAULT 'pending',
    billable_amount FLOAT,
    table_no INT,
    payer INT NULL,
    paid_at TIMESTAMP NULL,
    tip FLOAT NULL,
    FOREIGN KEY (issued_by) REFERENCES users (id),
    FOREIGN KEY (payer) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    item_id INT NOT NULL,
    instructions VARCHAR(255),
    quantity INT NOT NULL,
    price FLOAT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders (id),
    FOREIGN KEY (item_id) REFERENCES items (id)
);

CREATE INDEX idx_order_item_order ON order_items (order_id);

CREATE TABLE IF NOT EXISTS refresh_jti (
    jti VARCHAR(36) PRIMARY KEY,
    issued_by INT NOT NULL,
    expires_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS tag_rel (
    id INT PRIMARY KEY AUTO_INCREMENT,
    item_id INT NOT NULL,
    tag_id INT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items (id),
    FOREIGN KEY (tag_id) REFERENCES tags (id)
);

CREATE INDEX tag_rel_item_id_idx ON tag_rel (item_id);

CREATE INDEX tag_rel_tag_id_idx ON tag_rel (tag_id);

-- SUPPOSE I WANT TO FIND ALL ITEMS WITH TAG="HOT"
-- SELECT * FROM
--     items
--     RIGHT JOIN tags_rel
--         ON items.id=tags_rel.item_id
--     RIGHT JOIN tags
--         ON tags_rel.tag_id=tags.id
--     WHERE tags.name="HOT"
