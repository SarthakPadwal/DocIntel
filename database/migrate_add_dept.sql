-- Run this in phpMyAdmin to add the new columns to existing users table
-- (No need to drop & recreate the table)

ALTER TABLE `users` 
  ADD COLUMN `department` VARCHAR(100) NULL AFTER `role`,
  ADD COLUMN `designation` VARCHAR(100) NULL AFTER `department`;

-- Update existing seed users with sensible defaults
UPDATE `users` SET `designation` = 'System Administrator' WHERE `email` = 'admin@docintel.com';
UPDATE `users` SET `department` = 'Development', `designation` = 'Team Member' WHERE `email` = 'user@docintel.com';
