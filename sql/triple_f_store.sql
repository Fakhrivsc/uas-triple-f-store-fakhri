-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 09, 2026 at 09:07 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `triple_f_store`
--

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `carts`
--

INSERT INTO `carts` (`id`, `user_id`, `created_at`, `updated_at`) VALUES
(1, 5, '2026-04-10 10:09:47', '2026-04-10 10:09:47'),
(2, 1, '2026-04-10 10:19:47', '2026-04-10 10:19:47');

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `id` int(11) NOT NULL,
  `cart_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cart_items`
--

INSERT INTO `cart_items` (`id`, `cart_id`, `product_id`, `quantity`, `created_at`, `updated_at`) VALUES
(16, 2, 12, 1, '2026-05-14 11:52:37', '2026-05-14 11:52:37');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(120) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `image_url`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Daging Segar', 'daging-segar', 'Daging sapi segar pilihan berkualitas tinggi, dipotong setiap hari untuk menjaga kesegaran dan cita rasa terbaik.', '/images/daging semur 500gram.jpg.jpeg', 1, '2026-04-10 09:52:11', '2026-04-12 03:43:44'),
(2, 'Daging Olahan', 'daging-olahan', 'Produk olahan daging sapi premium seperti bakso, sosis, dan kornet dengan bumbu pilihan.', '/images/giling ayam 250 gram.jpg.jpeg', 1, '2026-04-10 09:52:11', '2026-04-12 03:43:44'),
(3, 'Jeroan', 'jeroan', 'Jeroan sapi segar berkualitas tinggi, dibersihkan dengan higienis dan siap diolah.', '/images/hati sapi lokal 500gram.jpg.jpeg', 1, '2026-04-10 09:52:11', '2026-04-12 03:43:44'),
(4, 'Daging Beku', 'daging-beku', 'Daging sapi beku impor dan lokal dengan kualitas terjamin, dibekukan dengan teknologi modern.', '/images/iga backribs.jpg.jpeg', 1, '2026-04-10 09:52:11', '2026-04-12 03:43:44');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `address_id` int(11) DEFAULT NULL,
  `order_number` varchar(30) NOT NULL,
  `status` enum('pending','paid','processing','packed','shipped','delivered','completed','cancelled','refunded') DEFAULT 'pending',
  `subtotal` decimal(15,2) NOT NULL,
  `shipping_cost` decimal(15,2) DEFAULT 0.00,
  `total` decimal(15,2) NOT NULL,
  `notes` text DEFAULT NULL,
  `courier` varchar(50) DEFAULT NULL,
  `service_type` varchar(50) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_deadline` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `address_id`, `order_number`, `status`, `subtotal`, `shipping_cost`, `total`, `notes`, `courier`, `service_type`, `payment_method`, `payment_deadline`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 'TF-20240101-00001', 'delivered', 330000.00, 15000.00, 345000.00, NULL, 'JNE', 'REG', 'bank_transfer', '2026-04-11 09:52:11', '2024-01-01 00:00:00', '2024-01-05 00:00:00'),
(2, 3, 2, 'TF-20240115-00002', 'processing', 165000.00, 18000.00, 183000.00, 'Tolong dikemas dengan baik', 'JNT', 'EXPRESS', 'e-wallet', '2026-04-11 09:52:11', '2024-01-15 00:00:00', '2024-01-16 00:00:00'),
(3, 4, 3, 'TF-20240120-00003', 'pending', 420000.00, 25000.00, 445000.00, NULL, 'SICEPAT', 'REG', 'bank_transfer', '2026-04-11 09:52:11', '2024-01-20 00:00:00', '2024-01-20 00:00:00'),
(4, 2, 1, 'TF-20240125-00004', 'shipped', 85000.00, 12000.00, 97000.00, NULL, 'ANTERAJA', 'REGULAR', 'credit_card', '2026-04-11 09:52:11', '2024-01-25 00:00:00', '2024-01-27 00:00:00'),
(5, 3, 2, 'TF-20240130-00005', 'cancelled', 120000.00, 15000.00, 135000.00, NULL, 'JNE', 'YES', 'bank_transfer', '2026-04-11 09:52:11', '2024-01-30 00:00:00', '2024-01-30 00:00:00'),
(6, 1, 4, 'TF-20260410-33995', 'processing', 245000.00, 50.00, 245050.00, '', 'JNE', 'YES', 'bank_transfer', '2026-04-11 10:37:40', '2026-04-10 10:37:40', '2026-04-12 02:38:06'),
(7, 5, 5, 'TF-20260423-48392', 'processing', 95000.00, 25.00, 95025.00, '', 'JNE', 'YES', 'bank_transfer', '2026-04-24 02:40:26', '2026-04-23 02:40:26', '2026-05-08 04:23:01'),
(8, 1, 4, 'TF-20260504-24652', 'processing', 75000.00, 15.00, 75015.00, '', 'JNE', 'REG', 'bank_transfer', '2026-05-05 02:35:47', '2026-05-04 02:35:47', '2026-05-08 04:23:07'),
(9, 1, 4, 'TF-20260504-21113', 'processing', 75000.00, 15.00, 75015.00, '', 'JNE', 'REG', 'bank_transfer', '2026-05-05 02:35:52', '2026-05-04 02:35:52', '2026-05-08 04:23:15'),
(10, 5, 5, 'TF-20260504-15040', 'pending', 40000.00, 25.00, 40025.00, '', 'JNE', 'YES', 'midtrans', '2026-05-05 02:39:54', '2026-05-04 02:39:54', '2026-05-04 02:39:54'),
(11, 5, 5, 'TF-20260504-35651', 'processing', 40000.00, 30.00, 40030.00, '', 'ANTERAJA', 'NEXT DAY', 'midtrans', '2026-05-05 04:39:20', '2026-05-04 04:39:20', '2026-05-04 04:58:52'),
(12, 1, 4, 'TF-20260504-80638', 'delivered', 75000.00, 30.00, 75030.00, '', 'ANTERAJA', 'NEXT DAY', 'midtrans', '2026-05-05 04:56:40', '2026-05-04 04:56:40', '2026-05-04 05:01:56'),
(13, 5, 5, 'TF-20260504-77570', 'delivered', 425000.00, 150.00, 425150.00, '', 'ANTERAJA', 'NEXT DAY', 'midtrans', '2026-05-05 05:20:20', '2026-05-04 05:20:20', '2026-05-04 05:23:22'),
(14, 5, 5, 'TF-20260504-14288', 'processing', 95000.00, 15.00, 95015.00, '', 'JNE', 'REG', 'midtrans', '2026-05-05 06:49:14', '2026-05-04 06:49:14', '2026-05-08 04:22:53'),
(15, 1, 4, 'TF-20260504-59504', 'processing', 95000.00, 15.00, 95015.00, '', 'JNE', 'REG', 'bank_transfer', '2026-05-05 14:25:15', '2026-05-04 14:25:15', '2026-05-08 04:22:47'),
(16, 1, 4, 'TF-20260507-83921', 'processing', 380000.00, 60.00, 380060.00, '', 'JNE', 'REG', 'midtrans', '2026-05-08 11:59:42', '2026-05-07 11:59:42', '2026-05-08 04:22:42'),
(17, 1, 4, 'TF-20260510-96568', 'processing', 285000.00, 75.00, 285075.00, '', 'JNE', 'YES', 'midtrans', '2026-05-11 08:00:29', '2026-05-10 08:00:29', '2026-05-14 12:05:10'),
(18, 1, 4, 'TF-20260511-96147', 'pending', 570000.00, 150.00, 570150.00, '', 'JNE', 'YES', 'midtrans', '2026-05-12 11:50:38', '2026-05-11 11:50:38', '2026-05-11 11:50:38'),
(19, 5, 5, 'TF-20260514-39417', 'completed', 95000.00, 25.00, 95025.00, '', 'JNE', 'YES', 'midtrans', '2026-05-15 11:54:05', '2026-05-14 11:54:05', '2026-05-14 12:12:23'),
(20, 5, 5, 'TF-20260514-69359', 'packed', 165000.00, 31000.00, 196000.00, '', 'JNT', 'EZ', 'midtrans', '2026-05-15 13:19:19', '2026-05-14 13:19:19', '2026-05-14 13:22:20'),
(21, 5, 5, 'TF-20260606-64288', 'processing', 110000.00, 14000.00, 124000.00, '', 'JNE', 'OKE', 'midtrans', '2026-06-07 13:28:25', '2026-06-06 13:28:25', '2026-06-09 05:08:05'),
(22, 5, 6, 'TF-20260608-67639', 'processing', 95000.00, 23000.00, 118000.00, '', 'SICEPAT', 'BEST', 'midtrans', '2026-06-09 15:41:24', '2026-06-08 15:41:24', '2026-06-09 05:08:01'),
(23, 5, 6, 'TF-20260609-29300', 'processing', 165000.00, 56000.00, 221000.00, '', 'JNE', 'YES', 'midtrans', '2026-06-10 05:01:18', '2026-06-09 05:01:18', '2026-06-09 05:07:55');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `product_name` varchar(200) NOT NULL,
  `product_price` decimal(15,2) NOT NULL,
  `quantity` int(11) NOT NULL,
  `weight_gram` int(11) NOT NULL,
  `subtotal` decimal(15,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `product_price`, `quantity`, `weight_gram`, `subtotal`) VALUES
(1, 1, 1, 'Daging Sapi Has Dalam (Tenderloin)', 165000.00, 2, 500, 330000.00),
(2, 2, 1, 'Daging Sapi Has Dalam (Tenderloin)', 165000.00, 1, 500, 165000.00),
(3, 3, 9, 'Daging Sapi Wagyu Beku Import', 420000.00, 1, 300, 420000.00),
(4, 4, 3, 'Daging Sapi Giling Premium', 85000.00, 1, 500, 85000.00),
(5, 5, 4, 'Iga Sapi Segar', 120000.00, 1, 500, 120000.00),
(6, 6, 2, 'Daging Sapi Has Luar (Sirloin)', 160000.00, 1, 500, 160000.00),
(7, 6, 3, 'Daging Sapi Giling Premium', 85000.00, 1, 500, 85000.00),
(8, 7, 12, 'Daging Semur 500gram', 95000.00, 1, 500, 95000.00),
(9, 8, 14, 'Iga Neckbone Lokal', 75000.00, 1, 500, 75000.00),
(10, 9, 14, 'Iga Neckbone Lokal', 75000.00, 1, 500, 75000.00),
(11, 10, 28, 'Fillet Dada Ayam 500gram', 40000.00, 1, 500, 40000.00),
(12, 11, 28, 'Fillet Dada Ayam 500gram', 40000.00, 1, 500, 40000.00),
(13, 12, 14, 'Iga Neckbone Lokal', 75000.00, 1, 500, 75000.00),
(14, 13, 15, 'Iga Neckbone Super 500gram', 85000.00, 5, 500, 425000.00),
(15, 14, 12, 'Daging Semur 500gram', 95000.00, 1, 500, 95000.00),
(16, 15, 12, 'Daging Semur 500gram', 95000.00, 1, 500, 95000.00),
(17, 16, 12, 'Daging Semur 500gram', 95000.00, 4, 500, 380000.00),
(18, 17, 12, 'Daging Semur 500gram', 95000.00, 3, 500, 285000.00),
(19, 18, 12, 'Daging Semur 500gram', 95000.00, 6, 500, 570000.00),
(20, 19, 12, 'Daging Semur 500gram', 95000.00, 1, 500, 95000.00),
(21, 20, 13, 'Daging Semur 1kg', 165000.00, 1, 1000, 165000.00),
(22, 21, 16, 'Iga Neckbone Special 500gram', 110000.00, 1, 500, 110000.00),
(23, 22, 12, 'Daging Semur 500gram', 95000.00, 1, 500, 95000.00),
(24, 23, 13, 'Daging Semur 1kg', 165000.00, 1, 1000, 165000.00);

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `method` enum('bank_transfer','e-wallet','credit_card','midtrans') NOT NULL,
  `status` enum('pending','confirmed','rejected','refunded','expired') DEFAULT 'pending',
  `amount` decimal(15,2) NOT NULL,
  `payment_proof_url` varchar(500) DEFAULT NULL,
  `snap_token` varchar(500) DEFAULT NULL,
  `snap_redirect_url` varchar(500) DEFAULT NULL,
  `confirmed_at` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `order_id`, `method`, `status`, `amount`, `payment_proof_url`, `snap_token`, `snap_redirect_url`, `confirmed_at`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, 'bank_transfer', 'confirmed', 345000.00, NULL, NULL, NULL, '2024-01-02 00:00:00', NULL, '2024-01-01 00:00:00', '2024-01-02 00:00:00'),
(2, 2, 'e-wallet', 'confirmed', 183000.00, NULL, NULL, NULL, '2024-01-16 00:00:00', NULL, '2024-01-15 00:00:00', '2024-01-16 00:00:00'),
(3, 3, 'bank_transfer', 'pending', 445000.00, NULL, NULL, NULL, NULL, NULL, '2024-01-20 00:00:00', '2024-01-20 00:00:00'),
(4, 4, 'credit_card', 'confirmed', 97000.00, NULL, NULL, NULL, '2024-01-26 00:00:00', NULL, '2024-01-25 00:00:00', '2024-01-26 00:00:00'),
(5, 5, 'bank_transfer', 'pending', 135000.00, NULL, NULL, NULL, NULL, NULL, '2024-01-30 00:00:00', '2024-01-30 00:00:00'),
(6, 6, 'bank_transfer', 'confirmed', 245050.00, NULL, NULL, NULL, '2026-04-12 02:38:06', '', '2026-04-10 10:37:40', '2026-04-12 02:38:06'),
(7, 7, 'bank_transfer', 'confirmed', 95025.00, NULL, NULL, NULL, '2026-05-08 04:23:01', '', '2026-04-23 02:40:26', '2026-05-08 04:23:01'),
(8, 8, 'bank_transfer', 'confirmed', 75015.00, NULL, NULL, NULL, '2026-05-08 04:23:07', '', '2026-05-04 02:35:47', '2026-05-08 04:23:07'),
(9, 9, 'bank_transfer', 'confirmed', 75015.00, NULL, NULL, NULL, '2026-05-08 04:23:15', '', '2026-05-04 02:35:52', '2026-05-08 04:23:15'),
(10, 10, 'midtrans', 'rejected', 40025.00, NULL, NULL, NULL, NULL, '', '2026-05-04 02:39:54', '2026-05-08 04:23:21'),
(11, 11, 'midtrans', 'confirmed', 40030.00, NULL, '4f5b95a4-4137-436b-a312-5c453fa9ceae', 'https://app.sandbox.midtrans.com/snap/v4/redirection/4f5b95a4-4137-436b-a312-5c453fa9ceae', '2026-05-04 04:58:52', '', '2026-05-04 04:39:20', '2026-05-04 04:58:52'),
(12, 12, 'midtrans', 'confirmed', 75030.00, NULL, '01e6ddd3-281b-43c4-a508-2bd4d8437e73', 'https://app.sandbox.midtrans.com/snap/v4/redirection/01e6ddd3-281b-43c4-a508-2bd4d8437e73', '2026-05-04 04:58:45', '', '2026-05-04 04:56:40', '2026-05-04 04:58:45'),
(13, 13, 'midtrans', 'confirmed', 425150.00, NULL, 'ccd8cc79-ed20-41cb-a77b-5035bdd7463d', 'https://app.sandbox.midtrans.com/snap/v4/redirection/ccd8cc79-ed20-41cb-a77b-5035bdd7463d', '2026-05-04 05:22:12', '', '2026-05-04 05:20:20', '2026-05-04 05:22:12'),
(14, 14, 'midtrans', 'confirmed', 95015.00, NULL, '80633dae-e133-4983-b397-3ff15d0e2e5d', 'https://app.sandbox.midtrans.com/snap/v4/redirection/80633dae-e133-4983-b397-3ff15d0e2e5d', '2026-05-08 04:22:53', '', '2026-05-04 06:49:14', '2026-05-08 04:22:53'),
(15, 15, 'bank_transfer', 'confirmed', 95015.00, NULL, NULL, NULL, '2026-05-08 04:22:47', '', '2026-05-04 14:25:15', '2026-05-08 04:22:47'),
(16, 16, 'midtrans', 'confirmed', 380060.00, NULL, 'e37de149-6ecf-425f-8ef8-6e7755e36056', 'https://app.sandbox.midtrans.com/snap/v4/redirection/e37de149-6ecf-425f-8ef8-6e7755e36056', '2026-05-08 04:22:42', '', '2026-05-07 11:59:42', '2026-05-08 04:22:42'),
(17, 17, 'midtrans', 'confirmed', 285075.00, NULL, '48ae5ce6-26b2-4e89-8a5f-1120baff5fe6', 'https://app.sandbox.midtrans.com/snap/v4/redirection/48ae5ce6-26b2-4e89-8a5f-1120baff5fe6', '2026-05-14 12:05:10', '', '2026-05-10 08:00:29', '2026-05-14 12:05:10'),
(18, 18, 'midtrans', 'rejected', 570150.00, NULL, '5a464402-08f8-47c2-9749-a3d113fa50e9', 'https://app.sandbox.midtrans.com/snap/v4/redirection/5a464402-08f8-47c2-9749-a3d113fa50e9', NULL, '', '2026-05-11 11:50:38', '2026-05-14 12:05:20'),
(19, 19, 'midtrans', 'confirmed', 95025.00, NULL, 'd498f552-ae6c-4cf0-bd06-05b7821f37c3', 'https://app.sandbox.midtrans.com/snap/v4/redirection/d498f552-ae6c-4cf0-bd06-05b7821f37c3', '2026-05-14 12:05:46', '', '2026-05-14 11:54:05', '2026-05-14 12:05:46'),
(20, 20, 'midtrans', 'confirmed', 196000.00, NULL, '35b7164a-5cda-41a3-8356-38955b704762', 'https://app.sandbox.midtrans.com/snap/v4/redirection/35b7164a-5cda-41a3-8356-38955b704762', '2026-05-14 13:21:26', 'sudah di bayar', '2026-05-14 13:19:19', '2026-05-14 13:21:26'),
(21, 21, 'midtrans', 'confirmed', 124000.00, NULL, 'befa3d1d-0d3b-4895-b457-b73454ce74ac', 'https://app.sandbox.midtrans.com/snap/v4/redirection/befa3d1d-0d3b-4895-b457-b73454ce74ac', '2026-06-09 05:08:05', '', '2026-06-06 13:28:25', '2026-06-09 05:08:05'),
(22, 22, 'midtrans', 'confirmed', 118000.00, NULL, 'a9b99685-9d05-481b-8d0b-9bc2b26d509c', 'https://app.sandbox.midtrans.com/snap/v4/redirection/a9b99685-9d05-481b-8d0b-9bc2b26d509c', '2026-06-09 05:08:01', '', '2026-06-08 15:41:24', '2026-06-09 05:08:01'),
(23, 23, 'midtrans', 'confirmed', 221000.00, NULL, '50b82f2b-cc0e-4958-9013-6f1e5f0468f2', 'https://app.sandbox.midtrans.com/snap/v4/redirection/50b82f2b-cc0e-4958-9013-6f1e5f0468f2', '2026-06-09 05:07:55', '', '2026-06-09 05:01:18', '2026-06-09 05:07:55');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `slug` varchar(220) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(15,2) NOT NULL,
  `discount_price` decimal(15,2) DEFAULT NULL,
  `stock` int(11) DEFAULT 0,
  `weight_gram` int(11) NOT NULL,
  `unit` enum('kg','gram','pack') DEFAULT 'gram',
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `category_id`, `name`, `slug`, `description`, `price`, `discount_price`, `stock`, `weight_gram`, `unit`, `images`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'Daging Sapi Has Dalam (Tenderloin)', 'daging-sapi-has-dalam-tenderloin', 'Daging sapi has dalam (tenderloin) premium pilihan, tekstur lembut dan empuk. Cocok untuk steak, tumis, atau masakan berkuah. Dipotong segar setiap hari dari sapi lokal pilihan.', 185000.00, 165000.00, 50, 500, 'gram', '[]', 0, '2026-04-10 09:52:11', '2026-04-10 09:52:11'),
(2, 1, 'Daging Sapi Has Luar (Sirloin)', 'daging-sapi-has-luar-sirloin', 'Daging sapi has luar (sirloin) segar dengan marbling yang sempurna. Ideal untuk steak, BBQ, atau masakan panggang. Kualitas premium dari sapi lokal terpilih.', 160000.00, NULL, 34, 500, 'gram', '[]', 0, '2026-04-10 09:52:11', '2026-04-10 10:37:40'),
(3, 1, 'Daging Sapi Giling Premium', 'daging-sapi-giling-premium', 'Daging sapi giling segar dengan kandungan lemak seimbang. Sempurna untuk bakso homemade, burger, perkedel, atau isian pastel. Digiling segar setiap hari.', 95000.00, 85000.00, 79, 500, 'gram', '[]', 0, '2026-04-10 09:52:11', '2026-04-10 10:37:40'),
(4, 1, 'Iga Sapi Segar', 'iga-sapi-segar', 'Iga sapi segar dengan daging tebal dan tulang yang kuat. Cocok untuk sup iga, iga bakar, atau iga penyet. Dipilih dari sapi muda untuk hasil yang lebih empuk.', 120000.00, NULL, 25, 500, 'gram', '[]', 0, '2026-04-10 09:52:11', '2026-04-10 09:52:11'),
(5, 2, 'Bakso Sapi Premium Homemade', 'bakso-sapi-premium-homemade', 'Bakso sapi premium buatan tangan dengan bahan pilihan. Tekstur kenyal dan rasa gurih alami tanpa pengawet. Tersedia dalam ukuran sedang, cocok untuk mie bakso atau sup.', 65000.00, 55000.00, 100, 500, 'gram', '[]', 0, '2026-04-10 09:52:11', '2026-04-10 09:52:11'),
(6, 2, 'Sosis Sapi Jumbo', 'sosis-sapi-jumbo', 'Sosis sapi jumbo dengan kandungan daging sapi asli minimal 80%. Tanpa pewarna buatan, cocok untuk sarapan, bekal anak, atau BBQ keluarga.', 75000.00, NULL, 60, 500, 'pack', '[]', 0, '2026-04-10 09:52:11', '2026-04-10 09:52:11'),
(7, 3, 'Hati Sapi Segar', 'hati-sapi-segar', 'Hati sapi segar berkualitas tinggi, dibersihkan dengan teliti dan higienis. Kaya akan zat besi dan vitamin. Cocok untuk semur hati, hati goreng, atau sate hati.', 55000.00, 48000.00, 40, 500, 'gram', '[]', 0, '2026-04-10 09:52:11', '2026-04-10 09:52:11'),
(8, 3, 'Babat Sapi Segar', 'babat-sapi-segar', 'Babat sapi segar yang sudah dibersihkan dan direbus setengah matang. Siap diolah menjadi soto babat, gulai babat, atau oseng babat pedas.', 50000.00, NULL, 30, 500, 'gram', '[]', 0, '2026-04-10 09:52:11', '2026-04-10 09:52:11'),
(9, 4, 'Daging Sapi Wagyu Beku Import', 'daging-sapi-wagyu-beku-import', 'Daging sapi Wagyu impor beku dengan marbling score tinggi. Cita rasa premium dengan tekstur yang sangat lembut dan juicy. Ideal untuk steak mewah di rumah.', 450000.00, 420000.00, 15, 300, 'gram', '[]', 0, '2026-04-10 09:52:11', '2026-04-10 09:52:11'),
(10, 4, 'Daging Sapi Rendang Beku', 'daging-sapi-rendang-beku', 'Rendang sapi beku siap saji dengan bumbu rempah asli Minang. Dimasak dengan metode tradisional dan dibekukan untuk menjaga cita rasa. Cukup dipanaskan dan siap disajikan.', 135000.00, 120000.00, 45, 500, 'pack', '[]', 0, '2026-04-10 09:52:11', '2026-04-10 09:52:11'),
(11, 4, 'steak500gr', 'steak500gr', 'daging steak berkualitas', 50.00, 45.00, 50, 500, 'gram', '[\"/images/daging steak.jpg.jpeg\",\"/uploads/products/1777877965225-598179345.jpeg\"]', 1, '2026-04-12 03:43:44', '2026-05-04 06:59:25'),
(12, 1, 'Daging Semur 500gram', 'daging-semur-500gram', 'Daging sapi potongan khusus untuk semur, empuk dan mudah meresap bumbu.', 95000.00, NULL, 42, 500, 'gram', '[\"/images/daging semur 500gram.jpg.jpeg\"]', 1, '2026-04-12 03:43:44', '2026-06-08 15:41:24'),
(13, 1, 'Daging Semur 1kg', 'daging-semur-1kg', 'Daging sapi potongan khusus untuk semur ukuran 1kg, hemat untuk keluarga besar.', 180000.00, 165000.00, 38, 1000, 'gram', '[\"/images/daging semur 1kg.jpg.jpeg\"]', 1, '2026-04-12 03:43:44', '2026-06-09 05:01:18'),
(14, 1, 'Iga Neckbone Lokal', 'iga-neckbone-lokal', 'Iga neckbone sapi lokal segar, cocok untuk sup iga, iga bakar, atau kaldu.', 75000.00, NULL, 32, 500, 'gram', '[\"/images/iga neckbone lokal.jpg.jpeg\"]', 1, '2026-04-12 03:43:44', '2026-05-04 04:56:40'),
(15, 1, 'Iga Neckbone Super 500gram', 'iga-neckbone-super-500gram', 'Iga neckbone sapi super pilihan, daging lebih tebal dan berkualitas premium.', 95000.00, 85000.00, 25, 500, 'gram', '[\"/images/iga neckbone super 500gram.jpg.jpeg\"]', 1, '2026-04-12 03:43:44', '2026-05-04 05:20:20'),
(16, 1, 'Iga Neckbone Special 500gram', 'iga-neckbone-special-500gram', 'Iga neckbone sapi special grade, potongan terbaik dengan daging melimpah.', 110000.00, NULL, 24, 500, 'gram', '[\"/images/iga neckbone special 500gram.jpg.jpeg\"]', 1, '2026-04-12 03:43:44', '2026-06-06 13:28:25'),
(17, 1, 'Iga Backribs', 'iga-backribs', 'Iga backribs sapi premium, potongan iga belakang dengan daging tebal dan juicy.', 130000.00, 115000.00, 20, 500, 'gram', '[\"/images/iga backribs.jpg.jpeg\"]', 1, '2026-04-12 03:43:44', '2026-04-12 03:43:44'),
(18, 1, 'Tetelan Sop', 'tetelan-sop', 'Tetelan sapi khusus untuk sop, menghasilkan kaldu yang gurih dan kaya rasa.', 65000.00, NULL, 55, 500, 'gram', '[\"/images/tetelan sop.jpg.jpeg\"]', 1, '2026-04-12 03:43:44', '2026-04-12 03:43:44'),
(19, 1, 'Tetelan Buntut 500gram', 'tetelan-buntut-500gram', 'Tetelan buntut sapi segar, menghasilkan kaldu yang kaya kolagen dan gurih.', 70000.00, NULL, 40, 500, 'gram', '[\"/images/tetelan buntut 500gram.jpg.jpeg\"]', 1, '2026-04-12 03:43:44', '2026-04-12 03:43:44'),
(20, 1, 'Tetelan Ekonomis 500gram', 'tetelan-ekonomis-500gram', 'Tetelan sapi ekonomis, pilihan hemat untuk masakan sehari-hari.', 50000.00, NULL, 70, 500, 'gram', '[\"/images/tetelan ekonomis 500gram.jpg.jpeg\"]', 1, '2026-04-12 03:43:44', '2026-04-12 03:43:44'),
(21, 1, 'Buntut Sapi Super 500gram', 'buntut-sapi-super-500gram', 'Buntut sapi super pilihan, daging tebal dan kaya kolagen.', 120000.00, 105000.00, 25, 500, 'gram', '[\"/images/buntut sapi super 500gram.jpg.jpeg\"]', 1, '2026-04-12 03:43:44', '2026-04-12 03:43:44'),
(22, 1, 'Buntut Mini 500gram', 'buntut-mini-500gram', 'Buntut sapi mini ukuran 500gram, cocok untuk porsi keluarga kecil.', 90000.00, NULL, 30, 500, 'gram', '[\"/images/buntut mini 500gram.jpg.jpeg\"]', 1, '2026-04-12 03:43:44', '2026-04-12 03:43:44'),
(23, 1, 'Buntut Center B 500gram', 'buntut-center-b-500gram', 'Buntut sapi center cut grade B, potongan tengah buntut dengan daging merata.', 100000.00, 90000.00, 20, 500, 'gram', '[\"/images/buntut center b 500gram.jpg.jpeg\"]', 1, '2026-04-12 03:43:44', '2026-04-12 03:43:44'),
(24, 1, 'Paha Fillet 500gram', 'paha-fillet-500gram', 'Paha fillet sapi segar, daging tanpa lemak berlebih dan bertekstur lembut.', 110000.00, NULL, 45, 500, 'gram', '[\"/images/paha fillet 500gram.jpg.jpeg\"]', 1, '2026-04-12 03:43:44', '2026-04-12 03:43:44'),
(25, 2, 'Teriyaki Slice dan Sukiyaki Slice 250 gram', 'teriyaki-slice-dan-sukiyaki-slice-250gram', 'Daging sapi iris tipis siap masak untuk teriyaki dan sukiyaki, ukuran 250gram.', 65000.00, 55000.00, 80, 250, 'gram', '[\"/images/teriyaki slice dan sukiyaki slice 250 gram.jpg.jpeg\"]', 1, '2026-04-12 03:43:44', '2026-04-12 03:43:44'),
(26, 2, 'Teriyaki Slice dan Sukiyaki Slice 500 gram', 'teriyaki-slice-dan-sukiyaki-slice-500gram', 'Daging sapi iris tipis siap masak untuk teriyaki dan sukiyaki, ukuran 500gram.', 120000.00, 105000.00, 60, 500, 'gram', '[\"/images/teriyaki slice dan sukiyaki slice 500 gram.jpg.jpeg\"]', 1, '2026-04-12 03:43:44', '2026-04-12 03:43:44'),
(27, 2, 'Giling Ayam 250 gram', 'giling-ayam-250gram', 'Daging ayam giling segar 250gram, cocok untuk bakso ayam atau nugget homemade.', 30000.00, NULL, 100, 250, 'gram', '[\"/images/giling ayam 250 gram.jpg.jpeg\"]', 1, '2026-04-12 03:43:44', '2026-04-12 03:43:44'),
(28, 2, 'Fillet Dada Ayam 500gram', 'fillet-dada-ayam-500gram', 'Fillet dada ayam segar tanpa tulang dan kulit, tinggi protein rendah lemak.', 45000.00, 40000.00, 88, 500, 'gram', '[\"/images/fillet dada ayam 500gram.jpg.jpeg\"]', 1, '2026-04-12 03:43:44', '2026-05-04 04:39:20'),
(29, 3, 'Hati Sapi Lokal 500gram', 'hati-sapi-lokal-500gram', 'Hati sapi lokal segar 500gram, kaya zat besi dan vitamin B12.', 55000.00, 48000.00, 40, 500, 'gram', '[\"/images/hati sapi lokal 500gram.jpg.jpeg\"]', 1, '2026-04-12 03:43:44', '2026-04-12 03:43:44');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `rating` tinyint(4) NOT NULL,
  `comment` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `user_id`, `product_id`, `order_id`, `rating`, `comment`, `created_at`) VALUES
(1, 5, 12, 14, 5, 'daging nya bagus, packing nya rapih, mantap lah pokoknya', '2026-05-04 06:53:52');

-- --------------------------------------------------------

--
-- Table structure for table `sequelizemeta`
--

CREATE TABLE `sequelizemeta` (
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `sequelizemeta`
--

INSERT INTO `sequelizemeta` (`name`) VALUES
('20240101000001-create-users.js'),
('20240101000002-create-user-addresses.js'),
('20240101000003-create-categories.js'),
('20240101000004-create-products.js'),
('20240101000005-create-wishlists.js'),
('20240101000006-create-carts.js'),
('20240101000007-create-orders.js'),
('20240101000008-create-payments.js'),
('20240101000009-create-shipments.js'),
('20240101000010-create-reviews.js'),
('20240101000011-create-settings.js');

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int(11) NOT NULL,
  `key` varchar(100) NOT NULL,
  `value` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `key`, `value`, `created_at`, `updated_at`) VALUES
(1, 'store_name', 'Triple-F Store', '2026-04-10 09:52:11', '2026-04-10 09:52:11'),
(2, 'store_address', 'Jl. Raya Daging No. 1, Jakarta Selatan, DKI Jakarta 12110', '2026-04-10 09:52:11', '2026-04-10 09:52:11'),
(3, 'store_phone', '021-12345678', '2026-04-10 09:52:11', '2026-04-10 09:52:11'),
(4, 'store_email', 'info@triplef.com', '2026-04-10 09:52:11', '2026-04-10 09:52:11'),
(5, 'store_hours', 'Senin - Sabtu: 07.00 - 20.00 WIB', '2026-04-10 09:52:11', '2026-04-10 09:52:11'),
(6, 'bank_bca', '1234567890 a.n. Triple-F Store', '2026-04-10 09:52:11', '2026-04-10 09:52:11'),
(7, 'bank_bri', '0987654321 a.n. Triple-F Store', '2026-04-10 09:52:11', '2026-04-10 09:52:11'),
(8, 'bank_mandiri', '1122334455 a.n. Triple-F Store', '2026-04-10 09:52:11', '2026-04-10 09:52:11'),
(9, 'ewallet_gopay', '081234567890', '2026-04-10 09:52:11', '2026-04-10 09:52:11'),
(10, 'ewallet_ovo', '081234567890', '2026-04-10 09:52:11', '2026-04-10 09:52:11'),
(11, 'ewallet_dana', '081234567890', '2026-04-10 09:52:11', '2026-04-10 09:52:11'),
(12, 'announcement_text', 'Promo Spesial! Gratis ongkir untuk pembelian di atas Rp 300.000', '2026-04-10 09:52:11', '2026-04-10 09:52:11'),
(13, 'announcement_active', 'true', '2026-04-10 09:52:11', '2026-04-10 09:52:11'),
(14, 'announcement_expiry', '2025-12-31', '2026-04-10 09:52:11', '2026-04-10 09:52:11');

-- --------------------------------------------------------

--
-- Table structure for table `shipments`
--

CREATE TABLE `shipments` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `courier` enum('JNE','JNT','SICEPAT','ANTERAJA') NOT NULL,
  `service_type` varchar(50) NOT NULL,
  `tracking_number` varchar(100) DEFAULT NULL,
  `status` enum('waiting','picked_up','in_transit','delivered') DEFAULT 'waiting',
  `estimated_date` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `shipments`
--

INSERT INTO `shipments` (`id`, `order_id`, `courier`, `service_type`, `tracking_number`, `status`, `estimated_date`, `created_at`, `updated_at`) VALUES
(1, 1, 'JNE', 'REG', 'JNE1234567890', 'delivered', '2024-01-05 00:00:00', '2024-01-02 00:00:00', '2024-01-05 00:00:00'),
(2, 2, 'JNT', 'EXPRESS', 'JNT9876543210', 'in_transit', '2024-01-18 00:00:00', '2024-01-16 00:00:00', '2024-01-17 00:00:00'),
(3, 4, 'ANTERAJA', 'REGULAR', 'ANT5555666677', 'in_transit', '2024-01-30 00:00:00', '2024-01-26 00:00:00', '2024-01-27 00:00:00'),
(4, 12, 'ANTERAJA', 'NEXT DAY', 'aresrtyuioipaesdryfuygihuo', 'waiting', NULL, '2026-05-04 05:01:43', '2026-05-04 05:01:43'),
(5, 13, 'ANTERAJA', 'NEXT DAY', 'qawesdrtyghuijko', 'waiting', NULL, '2026-05-04 05:23:15', '2026-05-04 05:23:15'),
(6, 14, 'JNE', 'REG', 'awesedrfgh', 'waiting', NULL, '2026-05-04 06:50:50', '2026-05-04 06:50:50'),
(7, 15, 'JNE', 'REG', 'eawrsedryfguyhijo', 'delivered', '0076-08-09 00:00:00', '2026-05-04 14:27:49', '2026-05-04 14:27:56'),
(8, 16, 'JNE', 'REG', '46743136413', 'waiting', '2026-05-07 00:00:00', '2026-05-07 12:01:03', '2026-05-07 12:01:03'),
(9, 19, 'JNE', 'YES', 'asdfghj', 'delivered', '0056-04-23 00:00:00', '2026-05-14 12:02:22', '2026-05-14 12:05:34'),
(10, 20, 'JNT', 'EZ', 'awsedrfgyh', 'waiting', '2026-06-14 00:00:00', '2026-05-14 13:21:08', '2026-05-14 13:21:08'),
(11, 23, 'JNE', 'YES', 'asdfghjhgfds', 'waiting', '2026-05-31 00:00:00', '2026-06-09 05:07:37', '2026-06-09 05:07:37');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('customer','admin') DEFAULT 'customer',
  `avatar_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `refresh_token` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone`, `role`, `avatar_url`, `is_active`, `refresh_token`, `created_at`, `updated_at`) VALUES
(1, 'Admin Triple-F', 'admin@triplef.com', '$2a$12$0eLpXx.lZPFJfl/uGL3PB.xAOy7ExqXgyFy76NRALixu0dF/0u3Wu', '081234567890', 'admin', NULL, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzgwOTgxNjA0LCJleHAiOjE3ODE1ODY0MDR9.FAVRHkZ3Zey1c_-5AJOa8XDJrF1a-sYPEtXDKo06pgk', '2026-04-10 09:52:11', '2026-06-09 05:06:44'),
(2, 'Budi Santoso', 'budi.santoso@gmail.com', '$2a$12$MbC.squ8zoho9FvgE2Ce8eIVh/FeE001DAIO5fkk.bizgnk/rINqi', '082345678901', 'customer', NULL, 1, NULL, '2026-04-10 09:52:11', '2026-04-10 09:52:11'),
(3, 'Siti Rahayu', 'siti.rahayu@gmail.com', '$2a$12$MbC.squ8zoho9FvgE2Ce8eIVh/FeE001DAIO5fkk.bizgnk/rINqi', '083456789012', 'customer', NULL, 1, NULL, '2026-04-10 09:52:11', '2026-04-10 09:52:11'),
(4, 'Ahmad Fauzi', 'ahmad.fauzi@gmail.com', '$2a$12$MbC.squ8zoho9FvgE2Ce8eIVh/FeE001DAIO5fkk.bizgnk/rINqi', '084567890123', 'customer', NULL, 1, NULL, '2026-04-10 09:52:11', '2026-04-10 09:52:11'),
(5, 'Fakhri Miftahul khairi', 'miftahulkhairifakhri@gmail.com', '$2a$12$QAqNHGUXEWXnRM.V4kzuEuuJIl3AXqqqfbQq.kcua61f4snWpaOhS', '089513260188', 'customer', NULL, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiaWF0IjoxNzgwOTg3MzM3LCJleHAiOjE3ODE1OTIxMzd9.NmAm2l7QDI6kI_ggqBzawO3In4BbGwxVPQww0_HD3ps', '2026-04-10 10:09:29', '2026-06-09 06:42:17');

-- --------------------------------------------------------

--
-- Table structure for table `user_addresses`
--

CREATE TABLE `user_addresses` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `label` varchar(50) NOT NULL,
  `recipient_name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `province` varchar(100) NOT NULL,
  `province_id` varchar(10) DEFAULT NULL,
  `city` varchar(100) NOT NULL,
  `city_id` varchar(10) DEFAULT NULL,
  `district` varchar(100) NOT NULL,
  `postal_code` varchar(10) NOT NULL,
  `full_address` text NOT NULL,
  `is_default` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_addresses`
--

INSERT INTO `user_addresses` (`id`, `user_id`, `label`, `recipient_name`, `phone`, `province`, `province_id`, `city`, `city_id`, `district`, `postal_code`, `full_address`, `is_default`, `created_at`, `updated_at`) VALUES
(1, 2, 'Rumah', 'Budi Santoso', '082345678901', 'DKI Jakarta', NULL, 'Jakarta Selatan', NULL, 'Kebayoran Baru', '12110', 'Jl. Melati No. 12, RT 03/RW 05, Kebayoran Baru', 1, '2026-04-10 09:52:11', '2026-04-10 09:52:11'),
(2, 3, 'Rumah', 'Siti Rahayu', '083456789012', 'Jawa Barat', NULL, 'Bandung', NULL, 'Cicendo', '40172', 'Jl. Anggrek No. 7, RT 01/RW 02, Cicendo', 1, '2026-04-10 09:52:11', '2026-04-10 09:52:11'),
(3, 4, 'Rumah', 'Ahmad Fauzi', '084567890123', 'Jawa Tengah', NULL, 'Semarang', NULL, 'Semarang Tengah', '50134', 'Jl. Mawar No. 15, RT 02/RW 04, Semarang Tengah', 1, '2026-04-10 09:52:11', '2026-04-10 09:52:11'),
(4, 1, 'rumah', 'Fakhri Miftahul khairi', '089513260188', 'Prop. Jawa Barat', NULL, 'Kab. Bogor', NULL, 'kec.ciomas', '16610', 'TMN. PEGELARAN BLOK PTB JL. PIPIT RAYA NO. 3', 1, '2026-04-10 10:36:37', '2026-04-10 10:36:37'),
(5, 5, 'guifuifu,', 'Fakhri Miftahul khairi', '089513260188', 'Prop. Jawa Barat', NULL, 'bogor', NULL, 'ciomas', '16610', 'TMN. PEGELARAN BLOK PTB JL. PIPIT RAYA NO. 3', 0, '2026-04-23 02:39:48', '2026-06-09 04:59:21'),
(6, 5, 'rumah', 'Fakhri', '089513260188', 'Jawa Barat', '9', 'Kota Bogor', '115', 'bogor barat', '16111', 'Jl. Cemara Kipas I No.6, RT.04/RW.11, Cilendek Tim., Kec. Bogor Bar., Kota Bogor,  16112', 0, '2026-06-08 14:45:52', '2026-06-09 04:59:21'),
(7, 5, 'rumah', 'bunda', '089513260188', 'Jawa Barat', '9', 'Kabupaten Bogor', '114', 'ciomas', '16911', 'CQ67+C7G, Ciomas Rahayu, Kec. Ciomas, Kabupaten Bogor, Jawa Barat 16610', 0, '2026-06-09 04:56:12', '2026-06-09 04:59:21');

-- --------------------------------------------------------

--
-- Table structure for table `wishlists`
--

CREATE TABLE `wishlists` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wishlists`
--

INSERT INTO `wishlists` (`id`, `user_id`, `product_id`, `created_at`) VALUES
(4, 1, 13, '2026-05-08 06:47:43'),
(5, 1, 12, '2026-05-08 06:47:47'),
(6, 1, 11, '2026-05-08 06:47:49');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cart_id` (`cart_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `address_id` (`address_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_id` (`order_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `sequelizemeta`
--
ALTER TABLE `sequelizemeta`
  ADD PRIMARY KEY (`name`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `key` (`key`);

--
-- Indexes for table `shipments`
--
ALTER TABLE `shipments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_id` (`order_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_addresses`
--
ALTER TABLE `user_addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `wishlists_user_id_product_id` (`user_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `carts`
--
ALTER TABLE `carts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `shipments`
--
ALTER TABLE `shipments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `user_addresses`
--
ALTER TABLE `user_addresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `wishlists`
--
ALTER TABLE `wishlists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`address_id`) REFERENCES `user_addresses` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `shipments`
--
ALTER TABLE `shipments`
  ADD CONSTRAINT `shipments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_addresses`
--
ALTER TABLE `user_addresses`
  ADD CONSTRAINT `user_addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD CONSTRAINT `wishlists_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `wishlists_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
