CREATE DATABASE rental_system
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE rental_system;

-- =========================
-- USERS
-- =========================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE COMMENT 'อีเมลสำหรับเข้าสู่ระบบ',
  password VARCHAR(255) NOT NULL COMMENT 'รหัสผ่าน (bcrypt hash)',
  first_name VARCHAR(100) NOT NULL COMMENT 'ชื่อ',
  last_name VARCHAR(100) NOT NULL COMMENT 'นามสกุล',
  role ENUM('tenant','landlord','admin') NOT NULL DEFAULT 'tenant' COMMENT 'บทบาทผู้ใช้',
  phone VARCHAR(20) DEFAULT NULL COMMENT 'เบอร์โทรศัพท์',
  line_id VARCHAR(100) DEFAULT NULL COMMENT 'LINE ID',
  is_banned TINYINT(1) DEFAULT 0 COMMENT 'สถานะถูกระงับ',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_is_banned (is_banned)
) ENGINE=InnoDB COMMENT='ตารางผู้ใช้งาน';

-- =========================
-- AMENITIES
-- =========================
CREATE TABLE amenities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE COMMENT 'ชื่อสิ่งอำนวยความสะดวก',
  name_th VARCHAR(100) DEFAULT NULL COMMENT 'ชื่อภาษาไทย',
  icon VARCHAR(50) DEFAULT NULL COMMENT 'ไอคอน'
) ENGINE=InnoDB COMMENT='ตารางสิ่งอำนวยความสะดวก';

-- =========================
-- LISTINGS
-- =========================
CREATE TABLE listings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  landlord_id INT NOT NULL COMMENT 'รหัสเจ้าของหอ',
  title VARCHAR(255) NOT NULL COMMENT 'ชื่อประกาศ',
  description TEXT DEFAULT NULL COMMENT 'รายละเอียด',
  address TEXT NOT NULL COMMENT 'ที่อยู่',
  latitude DECIMAL(10,8) DEFAULT NULL,
  longitude DECIMAL(11,8) DEFAULT NULL,
  price DECIMAL(10,2) NOT NULL COMMENT 'ราคาเช่า/เดือน',
  deposit DECIMAL(10,2) DEFAULT NULL COMMENT 'ค่ามัดจำ',
  water_price DECIMAL(10,2) DEFAULT NULL COMMENT 'ค่าน้ำ/หน่วย',
  electricity_price DECIMAL(10,2) DEFAULT NULL COMMENT 'ค่าไฟ/หน่วย',
  room_type ENUM('air_conditioned','fan') NOT NULL DEFAULT 'fan',
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  is_available TINYINT(1) DEFAULT 1 COMMENT 'สถานะว่าง/ไม่ว่าง',
  view_count INT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_landlord (landlord_id),
  INDEX idx_status (status),
  INDEX idx_price (price),
  INDEX idx_room_type (room_type),
  INDEX idx_is_available (is_available),
  INDEX idx_created_at (created_at),

  CONSTRAINT fk_listings_landlord
    FOREIGN KEY (landlord_id)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='ตารางประกาศหอพัก';

-- =========================
-- LISTING IMAGES
-- =========================
CREATE TABLE listing_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  listing_id INT NOT NULL COMMENT 'รหัสประกาศ',
  image_url VARCHAR(500) NOT NULL COMMENT 'URL รูปภาพ',
  public_id VARCHAR(255) DEFAULT NULL,
  is_primary TINYINT(1) DEFAULT 0 COMMENT 'รูปหลัก',
  display_order INT DEFAULT 0 COMMENT 'ลำดับการแสดง',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_listing (listing_id),
  INDEX idx_is_primary (is_primary),

  CONSTRAINT fk_listing_images
    FOREIGN KEY (listing_id)
    REFERENCES listings(id)
    ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='ตารางรูปภาพประกาศ';

-- =========================
-- LISTING AMENITIES (M:N)
-- =========================
CREATE TABLE listing_amenities (
  listing_id INT NOT NULL,
  amenity_id INT NOT NULL,

  PRIMARY KEY (listing_id, amenity_id),

  CONSTRAINT fk_la_listing
    FOREIGN KEY (listing_id)
    REFERENCES listings(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_la_amenity
    FOREIGN KEY (amenity_id)
    REFERENCES amenities(id)
    ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='ตารางเชื่อมประกาศและสิ่งอำนวยความสะดวก';

-- =========================
-- FAVORITES
-- =========================
CREATE TABLE favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL COMMENT 'รหัสผู้เช่า',
  listing_id INT NOT NULL COMMENT 'รหัสประกาศ',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY uq_favorite (tenant_id, listing_id),
  INDEX idx_tenant (tenant_id),
  INDEX idx_listing (listing_id),

  CONSTRAINT fk_favorite_tenant
    FOREIGN KEY (tenant_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_favorite_listing
    FOREIGN KEY (listing_id)
    REFERENCES listings(id)
    ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='ตารางรายการโปรด';