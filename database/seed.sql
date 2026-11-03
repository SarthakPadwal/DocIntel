-- DocIntel Demo Seed Data
-- Run this AFTER schema.sql

USE `docintel`;

-- Disable foreign key checks temporarily for a clean seed process
SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing data
TRUNCATE TABLE `document_history`;
TRUNCATE TABLE `search_history`;
TRUNCATE TABLE `document_information`;
TRUNCATE TABLE `documents`;
TRUNCATE TABLE `users`;

-- Enable foreign key checks back
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`) VALUES
(1, 'Sarah Jenkins', 'admin@docintel.com', '$2a$10$Kb4dnRRC/vOyghyrRfDEyORRDQA90QpVrboggc4MfZsgou9EZUHIi', 'ADMIN'),
(2, 'Rahul Sharma', 'user@docintel.com', '$2a$10$9u2.rMsoT07VWxJrAqknCejSAn78pQifnTwqACnBxCVdcVSfG/CeC', 'USER');

-- 2. Documents
INSERT INTO `documents` (`id`, `uploaded_by`, `original_filename`, `stored_filename`, `file_path`, `file_type`, `file_size`, `document_type`, `status`, `processing_status`, `document_date`, `due_date`) VALUES
(1, 2, 'invoice_abc_sept.pdf', '550e8400-e29b-41d4-a716-446655440001_invoice_abc_sept.pdf', 'uploads/550e8400-e29b-41d4-a716-446655440001_invoice_abc_sept.pdf', 'application/pdf', 1250000, 'Invoice', 'DONE', 'UPLOADED', '2026-09-15', '2026-10-15'),
(2, 2, 'quotation_xyz_q3.pdf', '550e8400-e29b-41d4-a716-446655440002_quotation_xyz_q3.pdf', 'uploads/550e8400-e29b-41d4-a716-446655440002_quotation_xyz_q3.pdf', 'application/pdf', 850000, 'Quotation', 'PENDING', 'UPLOADED', '2026-09-20', '2026-10-05'),
(3, 1, 'tender_vertex_2026.pdf', '550e8400-e29b-41d4-a716-446655440003_tender_vertex_2026.pdf', 'uploads/550e8400-e29b-41d4-a716-446655440003_tender_vertex_2026.pdf', 'application/pdf', 4500000, 'Tender', 'DONE', 'UPLOADED', '2026-09-25', '2026-10-25'),
(4, 2, 'po_apex_infra.pdf', '550e8400-e29b-41d4-a716-446655440004_po_apex_infra.pdf', 'uploads/550e8400-e29b-41d4-a716-446655440004_po_apex_infra.pdf', 'application/pdf', 560000, 'Purchase Document', 'PENDING', 'UPLOADED', '2026-10-01', '2026-11-01'),
(5, 1, 'agreement_tata.pdf', '550e8400-e29b-41d4-a716-446655440005_agreement_tata.pdf', 'uploads/550e8400-e29b-41d4-a716-446655440005_agreement_tata.pdf', 'application/pdf', 3200000, 'Agreement', 'DONE', 'UPLOADED', '2026-10-02', '2026-12-31'),
(6, 2, 'reliance_invoice_oct.pdf', '550e8400-e29b-41d4-a716-446655440006_reliance_invoice_oct.pdf', 'uploads/550e8400-e29b-41d4-a716-446655440006_reliance_invoice_oct.pdf', 'application/pdf', 1100000, 'Invoice', 'PENDING', 'UPLOADED', '2026-10-05', '2026-11-04'),
(7, 2, 'abc_enterprises_po.pdf', '550e8400-e29b-41d4-a716-446655440007_abc_enterprises_po.pdf', 'uploads/550e8400-e29b-41d4-a716-446655440007_abc_enterprises_po.pdf', 'application/pdf', 600000, 'Purchase Document', 'DONE', 'UPLOADED', '2026-10-06', '2026-11-06'),
(8, 1, 'vertex_agreement.pdf', '550e8400-e29b-41d4-a716-446655440008_vertex_agreement.pdf', 'uploads/550e8400-e29b-41d4-a716-446655440008_vertex_agreement.pdf', 'application/pdf', 2500000, 'Agreement', 'PENDING', 'UPLOADED', '2026-10-07', '2027-10-07'),
(9, 2, 'xyz_tender_doc.pdf', '550e8400-e29b-41d4-a716-446655440009_xyz_tender_doc.pdf', 'uploads/550e8400-e29b-41d4-a716-446655440009_xyz_tender_doc.pdf', 'application/pdf', 4100000, 'Tender', 'PENDING', 'UPLOADED', '2026-10-07', '2026-11-15'),
(10, 2, 'reliance_quotation.pdf', '550e8400-e29b-41d4-a716-446655440010_reliance_quotation.pdf', 'uploads/550e8400-e29b-41d4-a716-446655440010_reliance_quotation.pdf', 'application/pdf', 950000, 'Quotation', 'DONE', 'UPLOADED', '2026-10-07', '2026-10-21');

-- 3. Document Information
INSERT INTO `document_information` (`document_id`, `company_name`, `gst_number`, `document_number`, `document_date`, `due_date`, `amount`, `key_points`, `summary`, `extracted_text`) VALUES
(1, 'ABC Enterprises Pvt. Ltd.', '27AADCB2230M1Z5', 'INV-2026-010', '2026-09-15', '2026-10-15', 150000.00, NULL, NULL, NULL),
(2, 'XYZ Industries', '27AABCX1234N1Z2', 'QUO-2026-018', '2026-09-20', '2026-10-05', 45000.00, NULL, NULL, NULL),
(3, 'Vertex Global Solutions', '29AABCV5678P1Z8', 'TENDER-2026-022', '2026-09-25', '2026-10-25', 1200000.00, NULL, NULL, NULL),
(4, 'Apex InfraCorp', '07AABCA9012R1Z4', 'PO-2026-045', '2026-10-01', '2026-11-01', 850000.00, NULL, NULL, NULL),
(5, 'Tata Consultancy', '27AAACT3456S1Z1', 'AGR-2026-101', '2026-10-02', '2026-12-31', 5000000.00, NULL, NULL, NULL),
(6, 'Reliance Digital', '27AAACR7890T1Z9', 'INV-2026-088', '2026-10-05', '2026-11-04', 320000.00, NULL, NULL, NULL),
(7, 'ABC Enterprises Pvt. Ltd.', '27AADCB2230M1Z5', 'PO-2026-050', '2026-10-06', '2026-11-06', 150000.00, NULL, NULL, NULL),
(8, 'Vertex Global Solutions', '29AABCV5678P1Z8', 'AGR-2026-105', '2026-10-07', '2027-10-07', 2500000.00, NULL, NULL, NULL),
(9, 'XYZ Industries', '27AABCX1234N1Z2', 'TENDER-2026-030', '2026-10-07', '2026-11-15', 800000.00, NULL, NULL, NULL),
(10, 'Reliance Digital', '27AAACR7890T1Z9', 'QUO-2026-042', '2026-10-07', '2026-10-21', 125000.00, NULL, NULL, NULL);

-- 4. Search History
INSERT INTO `search_history` (`user_id`, `search_query`, `filters`) VALUES
(2, 'Invoice ABC Enterprises', '{"status": "DONE"}'),
(2, 'Reliance', '{}'),
(1, 'Tender documents', '{"document_type": "Tender"}');

-- 5. Document History
INSERT INTO `document_history` (`user_id`, `document_id`, `action`) VALUES
(2, 1, 'UPLOAD'),
(2, 2, 'UPLOAD'),
(1, 3, 'UPLOAD'),
(2, 4, 'UPLOAD'),
(1, 5, 'UPLOAD'),
(2, 6, 'UPLOAD'),
(2, 7, 'UPLOAD'),
(1, 8, 'UPLOAD'),
(2, 9, 'UPLOAD'),
(2, 10, 'UPLOAD'),
(2, 1, 'VIEW'),
(1, 3, 'VIEW'),
(2, 2, 'VIEW'),
(2, 6, 'VIEW'),
(1, 5, 'OPEN');
