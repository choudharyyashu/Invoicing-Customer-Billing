-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 22, 2026 at 02:19 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ledgerflow_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `business_settings`
--

CREATE TABLE `business_settings` (
  `id` int(11) NOT NULL DEFAULT 1,
  `business_name` varchar(255) NOT NULL,
  `trading_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `vat_number` varchar(50) DEFAULT NULL,
  `company_number` varchar(50) DEFAULT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'GBP',
  `currency_symbol` varchar(5) NOT NULL DEFAULT '£',
  `invoice_prefix` varchar(20) NOT NULL DEFAULT 'INV-2026-',
  `next_invoice_number` int(11) NOT NULL DEFAULT 90,
  `default_payment_terms` int(11) NOT NULL DEFAULT 14,
  `default_vat_rate` decimal(5,2) NOT NULL DEFAULT 20.00,
  `bank_name` varchar(100) DEFAULT NULL,
  `account_name` varchar(150) DEFAULT NULL,
  `sort_code` varchar(20) DEFAULT NULL,
  `account_number` varchar(30) DEFAULT NULL,
  `iban` varchar(50) DEFAULT NULL,
  `square_connected` tinyint(1) NOT NULL DEFAULT 1,
  `square_merchant_id` varchar(100) DEFAULT NULL,
  `whatsapp_status` varchar(50) NOT NULL DEFAULT 'disconnected',
  `whatsapp_phone` varchar(50) DEFAULT NULL,
  `notes_footer` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `business_settings`
--

INSERT INTO `business_settings` (`id`, `business_name`, `trading_name`, `email`, `phone`, `address`, `vat_number`, `company_number`, `currency`, `currency_symbol`, `invoice_prefix`, `next_invoice_number`, `default_payment_terms`, `default_vat_rate`, `bank_name`, `account_name`, `sort_code`, `account_number`, `iban`, `square_connected`, `square_merchant_id`, `whatsapp_status`, `whatsapp_phone`, `notes_footer`, `created_at`, `updated_at`) VALUES
(1, 'Fresh Harvest Wholesale & Logistics Ltd', 'Fresh Harvest Direct Ltd', 'accounts@freshharvestdirect.co.uk', '+44 20 8123 4567', 'Unit 4, Spitalfields Wholesale Park, London, E1 6AQ', 'GB 381 9024 11', '12948201', 'USD', '$', 'INV-2026-', 90, 14, 20.00, 'Barclays Business UK', 'Fresh Harvest Direct Ltd', '20-44-67', '83920194', 'GB29 BARC 2044 6783 9201 94', 1, 'sq_merch_live_89124', 'disconnected', '+44 7700 900123', 'Payment terms: 14 days from issue date. All produce sold remains property of Fresh Harvest Direct Ltd until paid in full.', '2026-10-19 06:34:12.460', '2026-10-22 12:00:01.706');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `vat_number` varchar(50) DEFAULT NULL,
  `payment_terms` int(11) NOT NULL DEFAULT 14,
  `status` varchar(50) NOT NULL DEFAULT 'Active',
  `opening_balance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `van_id` varchar(50) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `name`, `contact_person`, `email`, `phone`, `address`, `vat_number`, `payment_terms`, `status`, `opening_balance`, `notes`, `van_id`, `created_at`, `updated_at`) VALUES
('CUST-001', 'Green Valley Restaurant', 'David Miller', 'accounts@greenvalley.co.uk', '+44 20 7946 0912', '14 Highfield Avenue, London, NW11 9PX', 'GB 923 8812 04', 14, 'Inactive', 0.00, NULL, 'van1', '2026-10-19 06:34:12.442', '2026-10-22 10:05:28.052'),
('CUST-002', 'The Fresh Kitchen', 'Elena Rostova', 'orders@freshkitchen.com', '+44 20 7946 0831', '88 St. John Street, Clerkenwell, London, EC1M 4EH', 'GB 842 1190 22', 30, 'Active', 0.00, NULL, 'van2', '2026-10-19 06:34:12.450', '2026-10-22 09:05:28.035');

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` varchar(36) NOT NULL,
  `invoice_number` varchar(50) NOT NULL,
  `customer_id` varchar(50) NOT NULL,
  `issue_date` date NOT NULL,
  `due_date` date NOT NULL,
  `reference` varchar(100) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Draft',
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `vat_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `discount_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `amount_paid` decimal(12,2) NOT NULL DEFAULT 0.00,
  `balance_due` decimal(12,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `voided_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`id`, `invoice_number`, `customer_id`, `issue_date`, `due_date`, `reference`, `status`, `subtotal`, `vat_amount`, `discount_amount`, `total`, `amount_paid`, `balance_due`, `notes`, `void_reason`, `voided_at`, `created_at`, `updated_at`) VALUES
('cmvjherfe0001to5401l2nq7l', 'INV-2026-137', 'CUST-001', '2026-10-22', '2026-11-05', 'PO-FLOW-TEST-01', 'Partially Paid', 60.00, 7.80, 0.00, 67.80, 30.00, 37.80, 'Live flow test invoice - wholesale delivery Bermondsey', NULL, NULL, '2026-10-22 11:52:42.074', '2026-10-22 11:52:42.103'),
('cmvjhgxjz0001toj05eguga9s', 'INV-2026-138', 'CUST-001', '2026-10-22', '2026-11-05', 'PO-FLOW-TEST-01', 'Partially Paid', 60.00, 7.80, 0.00, 67.80, 30.00, 37.80, 'Live flow test invoice - wholesale delivery Bermondsey', NULL, NULL, '2026-10-22 11:54:23.327', '2026-10-22 11:54:23.366');

-- --------------------------------------------------------

--
-- Table structure for table `invoice_items`
--

CREATE TABLE `invoice_items` (
  `id` varchar(36) NOT NULL,
  `invoice_id` varchar(36) NOT NULL,
  `product_id` varchar(50) DEFAULT NULL,
  `description` varchar(255) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `unit` varchar(50) NOT NULL DEFAULT 'kg',
  `unit_price` decimal(10,2) NOT NULL,
  `vat_rate` decimal(5,2) NOT NULL DEFAULT 0.00,
  `vat_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `subtotal` decimal(12,2) NOT NULL,
  `total` decimal(12,2) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `invoice_items`
--

INSERT INTO `invoice_items` (`id`, `invoice_id`, `product_id`, `description`, `quantity`, `unit`, `unit_price`, `vat_rate`, `vat_amount`, `subtotal`, `total`, `created_at`) VALUES
('cmvjherfe0003to54rqbef3hx', 'cmvjherfe0001to5401l2nq7l', 'PROD-012', 'San Marzano Canned Tomatoes (2.5kg)', 10.00, 'kg', 2.10, 0.00, 0.00, 21.00, 21.00, '2026-10-22 11:52:42.074'),
('cmvjherfe0004to54eji848jn', 'cmvjherfe0001to5401l2nq7l', 'PROD-011', 'Extra Virgin Olive Oil 5L', 2.00, 'tins', 19.50, 20.00, 7.80, 39.00, 46.80, '2026-10-22 11:52:42.074'),
('cmvjhgxjz0003toj0zy3kjgpk', 'cmvjhgxjz0001toj05eguga9s', 'PROD-012', 'San Marzano Canned Tomatoes (2.5kg)', 10.00, 'kg', 2.10, 0.00, 0.00, 21.00, 21.00, '2026-10-22 11:54:23.327'),
('cmvjhgxjz0004toj064f89yp2', 'cmvjhgxjz0001toj05eguga9s', 'PROD-011', 'Extra Virgin Olive Oil 5L', 2.00, 'tins', 19.50, 20.00, 7.80, 39.00, 46.80, '2026-10-22 11:54:23.327');

-- --------------------------------------------------------

--
-- Table structure for table `invoice_sequences`
--

CREATE TABLE `invoice_sequences` (
  `prefix` varchar(20) NOT NULL,
  `next_number` int(11) NOT NULL DEFAULT 1,
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `invoice_sequences`
--

INSERT INTO `invoice_sequences` (`prefix`, `next_number`, `updated_at`) VALUES
('EXP-2026-', 19, '2026-10-22 08:44:45.664'),
('INV-2026-', 139, '2026-10-22 11:54:23.323'),
('MIL-2026-', 19, '2026-10-22 08:44:45.593'),
('ORD-2026-10-25-', 40, '2026-10-22 08:44:45.317'),
('PAY-2026-', 49, '2026-10-22 11:54:23.369'),
('PUR-2026-', 54, '2026-10-22 09:08:30.242'),
('SUP-', 20, '2026-10-22 09:08:30.245');

-- --------------------------------------------------------

--
-- Table structure for table `mileage_records`
--

CREATE TABLE `mileage_records` (
  `id` varchar(36) NOT NULL,
  `mileage_number` varchar(50) NOT NULL,
  `van_id` varchar(50) DEFAULT NULL,
  `vehicle` varchar(150) DEFAULT NULL,
  `date` date NOT NULL,
  `start_mileage` decimal(10,1) NOT NULL,
  `end_mileage` decimal(10,1) NOT NULL,
  `distance` decimal(10,1) NOT NULL,
  `distance_unit` varchar(20) NOT NULL DEFAULT 'miles',
  `purpose` varchar(255) NOT NULL,
  `rate` decimal(6,2) DEFAULT NULL,
  `estimated_expense` decimal(10,2) DEFAULT NULL,
  `recorded_in_expenses` tinyint(1) NOT NULL DEFAULT 0,
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` varchar(36) NOT NULL,
  `order_number` varchar(50) NOT NULL,
  `customer_id` varchar(50) NOT NULL,
  `van_id` varchar(50) DEFAULT NULL,
  `order_date` date NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Confirmed',
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` varchar(36) NOT NULL,
  `order_id` varchar(36) NOT NULL,
  `product_id` varchar(50) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `unit` varchar(50) NOT NULL DEFAULT 'kg',
  `unit_price` decimal(10,2) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` varchar(36) NOT NULL,
  `payment_number` varchar(50) NOT NULL,
  `customer_id` varchar(50) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `unallocated_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `payment_date` date NOT NULL,
  `payment_method` varchar(50) NOT NULL DEFAULT 'Bank Transfer',
  `reference` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Completed',
  `idempotency_key` varchar(100) DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `voided_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `payment_number`, `customer_id`, `amount`, `unallocated_amount`, `payment_date`, `payment_method`, `reference`, `notes`, `status`, `idempotency_key`, `void_reason`, `voided_at`, `created_at`, `updated_at`) VALUES
('cmvjherga0006to54r8y3azpb', 'PAY-2026-047', 'CUST-001', 30.00, 0.00, '2026-10-22', 'Bank Transfer', 'BACS-TEST-FLOW-99', 'Partial remittance towards INV-2026-137', 'Completed', NULL, NULL, NULL, '2026-10-22 11:52:42.106', '2026-10-22 11:52:42.106'),
('cmvjhgxl60006toj0bos753ij', 'PAY-2026-048', 'CUST-001', 30.00, 0.00, '2026-10-22', 'Bank Transfer', 'BACS-TEST-FLOW-99', 'Partial remittance towards INV-2026-138', 'Completed', NULL, NULL, NULL, '2026-10-22 11:54:23.370', '2026-10-22 11:54:23.370');

-- --------------------------------------------------------

--
-- Table structure for table `payment_allocations`
--

CREATE TABLE `payment_allocations` (
  `id` varchar(36) NOT NULL,
  `payment_id` varchar(36) NOT NULL,
  `invoice_id` varchar(36) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_allocations`
--

INSERT INTO `payment_allocations` (`id`, `payment_id`, `invoice_id`, `amount`, `created_at`) VALUES
('cmvjherga0008to544xy2h2sb', 'cmvjherga0006to54r8y3azpb', 'cmvjherfe0001to5401l2nq7l', 30.00, '2026-10-22 11:52:42.106'),
('cmvjhgxl60008toj01kmk0ceh', 'cmvjhgxl60006toj0bos753ij', 'cmvjhgxjz0001toj05eguga9s', 30.00, '2026-10-22 11:54:23.370');

-- --------------------------------------------------------

--
-- Table structure for table `procurement_fulfillments`
--

CREATE TABLE `procurement_fulfillments` (
  `id` varchar(36) NOT NULL,
  `date` date NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `purchased_qty` decimal(10,2) NOT NULL DEFAULT 0.00,
  `is_completed` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `unit` varchar(50) NOT NULL,
  `default_rate` decimal(10,2) NOT NULL DEFAULT 0.00,
  `default_vat` decimal(5,2) NOT NULL DEFAULT 0.00,
  `category` varchar(100) NOT NULL DEFAULT 'Produce',
  `stock` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `unit`, `default_rate`, `default_vat`, `category`, `stock`, `is_active`, `created_at`, `updated_at`) VALUES
('PROD-001', 'Vine Tomatoes', 'kg', 3.20, 0.00, 'Produce', 120, 1, '2026-10-19 06:47:00.640', '2026-10-19 06:47:00.640'),
('PROD-002', 'King Edward Potatoes', 'kg', 1.45, 0.00, 'Produce', 350, 1, '2026-10-19 06:47:00.649', '2026-10-19 06:47:00.649'),
('PROD-003', 'Spanish Brown Onions', 'kg', 1.80, 0.00, 'Produce', 180, 1, '2026-10-19 06:47:00.661', '2026-10-19 06:47:00.661'),
('PROD-004', 'Crisp Iceberg Lettuce', 'units', 1.15, 0.00, 'Salads', 95, 1, '2026-10-19 06:47:00.667', '2026-10-19 06:47:00.667'),
('PROD-005', 'English Cucumbers', 'units', 0.95, 0.00, 'Salads', 110, 1, '2026-10-19 06:47:00.677', '2026-10-19 06:47:00.677'),
('PROD-006', 'Mixed Bell Peppers (Red/Yellow)', 'kg', 3.80, 0.00, 'Produce', 65, 1, '2026-10-19 06:47:00.682', '2026-10-19 06:47:00.682'),
('PROD-007', 'Fresh Washed Carrots', 'kg', 1.20, 0.00, 'Root Veg', 210, 1, '2026-10-19 06:47:00.687', '2026-10-19 06:47:00.687'),
('PROD-008', 'Portobello Mushrooms', 'kg', 4.50, 0.00, 'Produce', 40, 1, '2026-10-19 06:47:00.692', '2026-10-19 06:47:00.692'),
('PROD-009', 'Fresh Basil Bunches', 'bunches', 1.50, 0.00, 'Herbs', 30, 1, '2026-10-19 06:47:00.697', '2026-10-19 06:47:00.697'),
('PROD-010', 'Avocados (Ready to Eat)', 'boxes (18ct)', 14.50, 0.00, 'Produce', 22, 1, '2026-10-19 06:47:00.703', '2026-10-19 06:47:00.703'),
('PROD-011', 'Extra Virgin Olive Oil 5L', 'tins', 28.00, 20.00, 'Pantry', 15, 1, '2026-10-19 06:47:00.709', '2026-10-19 06:47:00.709'),
('PROD-012', 'San Marzano Canned Tomatoes (2.5kg)', 'cans', 6.50, 20.00, 'Pantry', 48, 1, '2026-10-19 06:47:00.715', '2026-10-19 06:47:00.715');

-- --------------------------------------------------------

--
-- Table structure for table `purchases`
--

CREATE TABLE `purchases` (
  `id` varchar(36) NOT NULL,
  `purchase_number` varchar(50) NOT NULL,
  `supplier_id` varchar(50) DEFAULT NULL,
  `supplier_name` varchar(255) NOT NULL,
  `supplier_invoice_no` varchar(100) DEFAULT NULL,
  `date` date NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Paid',
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `vat_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchase_items`
--

CREATE TABLE `purchase_items` (
  `id` varchar(36) NOT NULL,
  `purchase_id` varchar(36) NOT NULL,
  `product_id` varchar(50) DEFAULT NULL,
  `product` varchar(255) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `unit` varchar(50) NOT NULL DEFAULT 'kg',
  `unit_cost` decimal(10,2) NOT NULL,
  `vat_rate` decimal(5,2) NOT NULL DEFAULT 0.00,
  `vat_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total` decimal(12,2) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `vat_number` varchar(50) DEFAULT NULL,
  `payment_terms` int(11) NOT NULL DEFAULT 30,
  `status` varchar(50) NOT NULL DEFAULT 'Active',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` varchar(36) NOT NULL,
  `transaction_number` varchar(50) NOT NULL,
  `date` date NOT NULL,
  `type` varchar(50) NOT NULL,
  `category` varchar(100) NOT NULL,
  `description` varchar(255) NOT NULL,
  `reference` varchar(100) DEFAULT NULL,
  `customer_or_supplier` varchar(255) DEFAULT NULL,
  `net_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `vat_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `gross_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` varchar(50) NOT NULL DEFAULT 'Completed',
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `title` varchar(100) DEFAULT NULL,
  `customer_id` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_login_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `role`, `name`, `title`, `customer_id`, `is_active`, `last_login_at`, `created_at`, `updated_at`) VALUES
('USR-ACC', 'accounts@freshharvest.co.uk', '$2b$12$O0g23ncJ/PjymakTPLENdOP/vAgL.csvtTK8/UcVWMt21akUwpJqi', 'accountant', 'Accounts & Tax Manager', 'Accountant / Auditor', NULL, 1, '2026-10-22 12:05:05.705', '2026-10-19 06:34:12.773', '2026-10-22 12:05:05.715'),
('USR-ADMIN', 'admin@freshharvest.co.uk', '$2b$12$O0g23ncJ/PjymakTPLENdOP/vAgL.csvtTK8/UcVWMt21akUwpJqi', 'admin', 'Fresh Harvest Admin', 'Business Owner / Admin', NULL, 1, '2026-10-22 11:54:23.248', '2026-10-19 06:34:12.764', '2026-10-22 11:54:23.251'),
('USR-CUST-001', 'accounts@greenvalley.co.uk', '$2b$12$O0g23ncJ/PjymakTPLENdOP/vAgL.csvtTK8/UcVWMt21akUwpJqi', 'customer', 'David Miller', 'Customer Client', 'CUST-001', 1, '2026-10-22 11:54:23.737', '2026-10-19 06:34:12.788', '2026-10-22 11:54:23.740');

-- --------------------------------------------------------

--
-- Table structure for table `vans`
--

CREATE TABLE `vans` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `vehicle` varchar(150) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vans`
--

INSERT INTO `vans` (`id`, `name`, `vehicle`, `is_active`, `created_at`, `updated_at`) VALUES
('van1', 'Van 1', 'Ford Transit - LN72 XRT', 1, '2026-10-19 06:34:12.413', '2026-10-19 06:34:12.413'),
('van2', 'Van 2', 'Mercedes Sprinter - RO23 FHK', 1, '2026-10-19 06:34:12.423', '2026-10-19 06:34:12.423'),
('van3', 'Van 3', 'Standard Van 3', 1, '2026-10-19 06:34:12.429', '2026-10-19 06:34:12.429');

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_expenses`
--

CREATE TABLE `vehicle_expenses` (
  `id` varchar(36) NOT NULL,
  `expense_number` varchar(50) NOT NULL,
  `van_id` varchar(50) DEFAULT NULL,
  `vehicle` varchar(150) DEFAULT NULL,
  `mileage_id` varchar(36) DEFAULT NULL,
  `date` date NOT NULL,
  `category` varchar(100) NOT NULL,
  `description` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Recorded',
  `void_reason` varchar(255) DEFAULT NULL,
  `voided_at` datetime(3) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('285e60ca-1165-40a2-9a32-3e8462608fff', '00e98de9954234c8dce7f71e112ad637cdc1fecc929773f7fcd4ab16266ed889', '2026-10-19 07:34:21.786', '20261019073420_add_orders_and_mileage', NULL, NULL, '2026-10-19 07:34:20.799', 1),
('6a4a3a4e-90e9-480c-b629-d15d9f370538', 'e0afd6609d675ae0329ef164f49b6f665ce82e334d9ebd0cc31c609d9ba6a91d', '2026-10-19 07:07:09.762', '20261019070708_add_invoices_and_payments', NULL, NULL, '2026-10-19 07:07:08.843', 1),
('ccae93ea-a7ca-40ed-be85-e158c3b1961d', '7b8ad4b6422b62e8a461b77166d6e658336809cf82d294e6c3760892f630a822', '2026-10-19 06:32:16.973', '20261019063216_init_phase2_auth_core', NULL, NULL, '2026-10-19 06:32:16.650', 1),
('f6037a4b-44e4-4a07-8f11-60cabed7ef49', '080aceb20a323b0723377688315c8df8616daa0cf03cd7089f465d90f479eae5', '2026-10-19 06:43:10.907', '20261019064310_add_products_table', NULL, NULL, '2026-10-19 06:43:10.828', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `business_settings`
--
ALTER TABLE `business_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_customers_van_id` (`van_id`),
  ADD KEY `idx_customers_status` (`status`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoices_invoice_number_key` (`invoice_number`),
  ADD KEY `idx_invoices_customer_id` (`customer_id`),
  ADD KEY `idx_invoices_status` (`status`),
  ADD KEY `idx_invoices_issue_date` (`issue_date`);

--
-- Indexes for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_invoice_items_invoice_id` (`invoice_id`),
  ADD KEY `idx_invoice_items_product_id` (`product_id`);

--
-- Indexes for table `invoice_sequences`
--
ALTER TABLE `invoice_sequences`
  ADD PRIMARY KEY (`prefix`);

--
-- Indexes for table `mileage_records`
--
ALTER TABLE `mileage_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `mileage_records_mileage_number_key` (`mileage_number`),
  ADD KEY `idx_mileage_van_id` (`van_id`),
  ADD KEY `idx_mileage_date` (`date`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `orders_order_number_key` (`order_number`),
  ADD KEY `idx_orders_customer_id` (`customer_id`),
  ADD KEY `idx_orders_order_date` (`order_date`),
  ADD KEY `idx_orders_van_id` (`van_id`),
  ADD KEY `idx_orders_status` (`status`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_items_order_id` (`order_id`),
  ADD KEY `idx_order_items_product_id` (`product_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payments_payment_number_key` (`payment_number`),
  ADD UNIQUE KEY `payments_idempotency_key_key` (`idempotency_key`),
  ADD KEY `idx_payments_customer_id` (`customer_id`),
  ADD KEY `idx_payments_payment_date` (`payment_date`),
  ADD KEY `idx_payments_status` (`status`);

--
-- Indexes for table `payment_allocations`
--
ALTER TABLE `payment_allocations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_payment_allocations_payment_id` (`payment_id`),
  ADD KEY `idx_payment_allocations_invoice_id` (`invoice_id`);

--
-- Indexes for table `procurement_fulfillments`
--
ALTER TABLE `procurement_fulfillments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_fulfillment_date_product` (`date`,`product_name`),
  ADD KEY `idx_fulfillment_date` (`date`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_products_category` (`category`),
  ADD KEY `idx_products_is_active` (`is_active`);

--
-- Indexes for table `purchases`
--
ALTER TABLE `purchases`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `purchases_purchase_number_key` (`purchase_number`),
  ADD KEY `idx_purchases_supplier_id` (`supplier_id`),
  ADD KEY `idx_purchases_date` (`date`),
  ADD KEY `idx_purchases_status` (`status`);

--
-- Indexes for table `purchase_items`
--
ALTER TABLE `purchase_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_purchase_items_purchase_id` (`purchase_id`),
  ADD KEY `idx_purchase_items_product_id` (`product_id`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transactions_transaction_number_key` (`transaction_number`),
  ADD KEY `idx_transactions_date` (`date`),
  ADD KEY `idx_transactions_type` (`type`),
  ADD KEY `idx_transactions_category` (`category`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_key` (`email`),
  ADD KEY `idx_users_role` (`role`),
  ADD KEY `idx_users_customer_id` (`customer_id`);

--
-- Indexes for table `vans`
--
ALTER TABLE `vans`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `vehicle_expenses`
--
ALTER TABLE `vehicle_expenses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `vehicle_expenses_expense_number_key` (`expense_number`),
  ADD KEY `idx_vehicle_expenses_van_id` (`van_id`),
  ADD KEY `idx_vehicle_expenses_date` (`date`),
  ADD KEY `idx_vehicle_expenses_category` (`category`),
  ADD KEY `idx_vehicle_expenses_mileage_id` (`mileage_id`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `customers`
--
ALTER TABLE `customers`
  ADD CONSTRAINT `customers_van_id_fkey` FOREIGN KEY (`van_id`) REFERENCES `vans` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD CONSTRAINT `invoice_items_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `invoice_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `mileage_records`
--
ALTER TABLE `mileage_records`
  ADD CONSTRAINT `mileage_records_van_id_fkey` FOREIGN KEY (`van_id`) REFERENCES `vans` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_van_id_fkey` FOREIGN KEY (`van_id`) REFERENCES `vans` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `order_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `payment_allocations`
--
ALTER TABLE `payment_allocations`
  ADD CONSTRAINT `payment_allocations_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `payment_allocations_payment_id_fkey` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `purchases`
--
ALTER TABLE `purchases`
  ADD CONSTRAINT `purchases_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `purchase_items`
--
ALTER TABLE `purchase_items`
  ADD CONSTRAINT `purchase_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `purchase_items_purchase_id_fkey` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `vehicle_expenses`
--
ALTER TABLE `vehicle_expenses`
  ADD CONSTRAINT `vehicle_expenses_mileage_id_fkey` FOREIGN KEY (`mileage_id`) REFERENCES `mileage_records` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `vehicle_expenses_van_id_fkey` FOREIGN KEY (`van_id`) REFERENCES `vans` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
