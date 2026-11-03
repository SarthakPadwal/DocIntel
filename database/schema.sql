-- DocIntel Database Schema

CREATE DATABASE IF NOT EXISTS `docintel`;
USE `docintel`;

-- Drop tables in reverse order of dependencies to avoid foreign key constraints
DROP TABLE IF EXISTS `document_history`;
DROP TABLE IF EXISTS `search_history`;
DROP TABLE IF EXISTS `document_information`;
DROP TABLE IF EXISTS `documents`;
DROP TABLE IF EXISTS `users`;

-- ==========================================
-- Table: users
-- ==========================================
CREATE TABLE `users` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `phone` VARCHAR(20) NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('USER', 'ADMIN') DEFAULT 'USER',
  `department` VARCHAR(100) NULL,
  `designation` VARCHAR(100) NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`)
);

-- ==========================================
-- Table: documents
-- ==========================================
CREATE TABLE `documents` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `uploaded_by` INT NOT NULL,
  `original_filename` VARCHAR(255) NOT NULL,
  `stored_filename` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `file_type` VARCHAR(50),
  `file_size` INT,
  `document_type` ENUM('Invoice', 'Quotation', 'Tender', 'Purchase Document', 'Agreement', 'Other') DEFAULT 'Other',
  `status` ENUM('PENDING', 'DONE') DEFAULT 'PENDING',
  `processing_status` ENUM('UPLOADED', 'PROCESSING', 'PROCESSED', 'FAILED') DEFAULT 'UPLOADED',
  `document_date` DATE NULL,
  `due_date` DATE NULL,
  `uploaded_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`),
  INDEX `idx_documents_uploaded_by` (`uploaded_by`),
  INDEX `idx_documents_document_type` (`document_type`),
  INDEX `idx_documents_status` (`status`),
  INDEX `idx_documents_processing_status` (`processing_status`),
  INDEX `idx_documents_document_date` (`document_date`),
  INDEX `idx_documents_due_date` (`due_date`)
);

-- ==========================================
-- Table: document_information
-- ==========================================
CREATE TABLE `document_information` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `document_id` INT NOT NULL UNIQUE,
  `company_name` VARCHAR(255) NULL,
  `gst_number` VARCHAR(50) NULL,
  `document_number` VARCHAR(100) NULL,
  `document_date` DATE NULL,
  `due_date` DATE NULL,
  `amount` DECIMAL(15,2) NULL,
  `key_points` TEXT NULL,
  `summary` TEXT NULL,
  `extracted_text` LONGTEXT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON DELETE CASCADE,
  INDEX `idx_docinfo_company_name` (`company_name`),
  INDEX `idx_docinfo_document_number` (`document_number`)
);

-- ==========================================
-- Table: search_history
-- ==========================================
CREATE TABLE `search_history` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `search_query` VARCHAR(500) NOT NULL,
  `filters` JSON NULL,
  `searched_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_search_history_user_id` (`user_id`)
);

-- ==========================================
-- Table: document_history
-- ==========================================
CREATE TABLE `document_history` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `document_id` INT NULL,
  `action` ENUM('VIEW', 'UPLOAD', 'SEARCH', 'OPEN', 'UPDATE_STATUS', 'EDIT_META', 'DELETE') NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON DELETE SET NULL,
  INDEX `idx_doc_history_user_id` (`user_id`),
  INDEX `idx_doc_history_document_id` (`document_id`)
);
