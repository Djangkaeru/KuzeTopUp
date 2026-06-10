-- ─────────────────────────────────────────────────────────────────────
--  KuzeTopUp Database
-- ─────────────────────────────────────────────────────────────────────

CREATE DATABASE IF NOT EXISTS kuzetopup CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kuzetopup;

-- ─── TABEL USERS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(20) NOT NULL UNIQUE,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        ENUM('admin', 'user') DEFAULT 'user',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── TABEL TRANSACTIONS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    code        VARCHAR(20) NOT NULL UNIQUE,
    user_id     INT NOT NULL,
    game        VARCHAR(100) NOT NULL,
    nominal     VARCHAR(100) NOT NULL,
    game_user_id VARCHAR(50) NOT NULL,
    server_id   VARCHAR(50) DEFAULT NULL,
    payment     VARCHAR(50) NOT NULL,
    total       INT NOT NULL,
    status      ENUM('pending', 'success', 'failed') DEFAULT 'pending',
    proof_image     VARCHAR(255) DEFAULT NULL,
    diamond_sent_at DATETIME DEFAULT NULL,
    diamond_note    VARCHAR(255) DEFAULT NULL,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Jalankan ini jika tabel sudah ada (ALTER):
-- ALTER TABLE transactions ADD COLUMN diamond_sent_at DATETIME DEFAULT NULL;
-- ALTER TABLE transactions ADD COLUMN diamond_note VARCHAR(255) DEFAULT NULL;

-- ─── INDEX ────────────────────────────────────────────────────────────
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status  ON transactions(status);
CREATE INDEX idx_transactions_code    ON transactions(code);
