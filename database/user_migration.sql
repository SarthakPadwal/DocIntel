-- DocIntel Phase 1 + Phase 2: SAFE DATABASE ENHANCEMENT MIGRATION
USE `docintel`;

ALTER TABLE `documents`
  ADD COLUMN `created_by` INT NULL AFTER `uploaded_by`,
  ADD COLUMN `last_modified_by` INT NULL AFTER `created_by`,
  ADD COLUMN `deleted_at` DATETIME NULL AFTER `updated_at`,
  ADD COLUMN `deleted_by` INT NULL AFTER `deleted_at`,
  ADD COLUMN `deletion_reason` VARCHAR(500) NULL AFTER `deleted_by`,
  ADD COLUMN `is_deleted` TINYINT(1) NOT NULL DEFAULT 0 AFTER `deletion_reason`,
  ADD COLUMN `restored_at` DATETIME NULL AFTER `is_deleted`,
  ADD COLUMN `restored_by` INT NULL AFTER `restored_at`,
  ADD INDEX `idx_documents_is_deleted` (`is_deleted`),
  ADD INDEX `idx_documents_deleted_by` (`deleted_by`),
  ADD CONSTRAINT `fk_documents_created_by`
    FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_documents_last_modified_by`
    FOREIGN KEY (`last_modified_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_documents_deleted_by`
    FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_documents_restored_by`
    FOREIGN KEY (`restored_by`) REFERENCES `users`(`id`) ON DELETE SET NULL;

UPDATE `documents` SET `created_by` = `uploaded_by` WHERE `created_by` IS NULL;

ALTER TABLE `document_information`
  ADD COLUMN `payment_terms` TEXT NULL AFTER `amount`,
  ADD COLUMN `created_by` INT NULL AFTER `extracted_text`,
  ADD COLUMN `updated_by` INT NULL AFTER `created_by`,
  ADD COLUMN `last_extracted_at` DATETIME NULL AFTER `updated_by`,
  ADD COLUMN `extraction_method` VARCHAR(50) NULL AFTER `last_extracted_at`,
  ADD COLUMN `extraction_version` VARCHAR(50) NULL AFTER `extraction_method`,
  ADD CONSTRAINT `fk_docinfo_created_by`
    FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_docinfo_updated_by`
    FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL;

ALTER TABLE `document_history`
  MODIFY COLUMN `action` ENUM(
    'VIEW', 'UPLOAD', 'SEARCH', 'OPEN', 'UPDATE_STATUS', 'EDIT_META',
    'DELETE', 'DOWNLOAD', 'RESTORE', 'REPROCESS', 'PROCESS_SUCCESS',
    'PROCESS_FAILED', 'LOGIN', 'LOGOUT', 'PREVIEW', 'EXPORT'
  ) NOT NULL,
  ADD COLUMN `actor_role` ENUM('USER', 'ADMIN', 'SYSTEM') NULL AFTER `user_id`,
  ADD COLUMN `details` JSON NULL AFTER `action`,
  ADD COLUMN `old_values` JSON NULL AFTER `details`,
  ADD COLUMN `new_values` JSON NULL AFTER `old_values`,
  ADD COLUMN `ip_address` VARCHAR(45) NULL AFTER `new_values`,
  ADD COLUMN `user_agent` VARCHAR(500) NULL AFTER `ip_address`,
  ADD COLUMN `request_id` VARCHAR(100) NULL AFTER `user_agent`,
  ADD COLUMN `action_result` ENUM('SUCCESS', 'FAILURE', 'DENIED') NOT NULL DEFAULT 'SUCCESS' AFTER `request_id`,
  ADD COLUMN `failure_reason` VARCHAR(500) NULL AFTER `action_result`,
  ADD INDEX `idx_doc_history_action` (`action`),
  ADD INDEX `idx_doc_history_created_at` (`created_at`),
  ADD INDEX `idx_doc_history_result` (`action_result`);

ALTER TABLE `search_history`
  ADD COLUMN `result_count` INT UNSIGNED NULL AFTER `filters`,
  ADD COLUMN `sort_by` VARCHAR(100) NULL AFTER `result_count`,
  ADD COLUMN `searched_document_ids` JSON NULL AFTER `sort_by`,
  ADD COLUMN `opened_document_ids` JSON NULL AFTER `searched_document_ids`,
  ADD COLUMN `search_source` VARCHAR(50) NULL AFTER `opened_document_ids`,
  ADD COLUMN `ip_address` VARCHAR(45) NULL AFTER `search_source`,
  ADD COLUMN `user_agent` VARCHAR(500) NULL AFTER `ip_address`,
  ADD COLUMN `request_id` VARCHAR(100) NULL AFTER `user_agent`,
  ADD INDEX `idx_search_history_searched_at` (`searched_at`);

CREATE TABLE `document_versions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `document_id` INT NOT NULL,
  `version_number` INT UNSIGNED NOT NULL,
  `changed_by` INT NULL,
  `change_type` ENUM('METADATA_EDIT', 'CONTENT_REPROCESS', 'FILE_REPLACEMENT', 'RESTORE') NOT NULL,
  `change_reason` VARCHAR(500) NULL,
  `before_data` JSON NULL,
  `after_data` JSON NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_document_version` (`document_id`, `version_number`),
  KEY `idx_doc_versions_changed_by` (`changed_by`),
  KEY `idx_doc_versions_created_at` (`created_at`),
  CONSTRAINT `fk_doc_versions_document`
    FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_doc_versions_user`
    FOREIGN KEY (`changed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `document_downloads` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `document_id` INT NULL,
  `user_id` INT NULL,
  `original_filename` VARCHAR(255) NOT NULL,
  `downloaded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `download_status` ENUM('SUCCESS', 'DENIED', 'FAILED') NOT NULL DEFAULT 'SUCCESS',
  `ip_address` VARCHAR(45) NULL,
  `user_agent` VARCHAR(500) NULL,
  `request_id` VARCHAR(100) NULL,
  `failure_reason` VARCHAR(500) NULL,
  PRIMARY KEY (`id`),
  KEY `idx_downloads_document_id` (`document_id`),
  KEY `idx_downloads_user_id` (`user_id`),
  KEY `idx_downloads_downloaded_at` (`downloaded_at`),
  KEY `idx_downloads_status` (`download_status`),
  CONSTRAINT `fk_downloads_document`
    FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_downloads_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
