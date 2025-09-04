-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 04 Sep 2025 pada 17.21
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_ayokfood`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `pembeli_id` int(11) NOT NULL,
  `toko_id` int(11) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `delivery_address` text NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `status` enum('pending','confirmed','cooking','on_delivery','delivered','cancelled') DEFAULT 'pending',
  `order_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `produk_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price_per_item` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `toko_id` int(11) NOT NULL,
  `nama` varchar(255) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_available` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `products`
--

INSERT INTO `products` (`id`, `toko_id`, `nama`, `deskripsi`, `price`, `category`, `image_url`, `is_available`, `created_at`) VALUES
(1, 1, 'Sate Ayam', '10 tusuk sate ayam dengan bumbu kacang lembut', 35000.00, 'sate', '/uploads/productImage-1756993995793.jpeg', 1, '2025-09-04 13:53:15'),
(2, 1, 'Sate Kambing', '10 tusuk sate kambing empuk tanpa bau', 45000.00, 'sate', '/uploads/productImage-1756994442879.jpeg', 1, '2025-09-04 14:00:42'),
(3, 1, 'Lontong Sate', 'Lontong pulen sebagai pendamping sate', 35000.00, 'pelengkap', '/uploads/productImage-1756994508871.jpeg', 1, '2025-09-04 14:01:48'),
(4, 2, 'Bakmi spesial', '\'Bakmi dengan topping ayam jamur dan sayuran', 38000.00, 'bakmi', '/uploads/productImage-1756994851482.jpeg', 1, '2025-09-04 14:07:31'),
(5, 2, 'Pangsit Goreng', '5 buah pangsit goreng renyah dengan saus asam manis', 25000.00, 'pangsit', '/uploads/productImage-1756994903220.jpeg', 1, '2025-09-04 14:08:23'),
(6, 2, 'Nasi goreng Ayam asap', 'nasi goreng dengan potongan ayam asap', 47000.00, 'nasi goreng', '/uploads/productImage-1756995031303.jpeg', 1, '2025-09-04 14:10:31'),
(7, 3, 'CFC Ayam Krispy', 'ayam goreng krispy ,renyah , dan gurih', 75000.00, 'ayam', '/uploads/productImage-1756995480326.jpeg', 1, '2025-09-04 14:18:00'),
(8, 3, 'CFC paket lengkap', 'paket lengkap dengan tambahan nasi gratis', 120000.00, 'ayam', '/uploads/productImage-1756995547748.jpeg', 1, '2025-09-04 14:19:07'),
(9, 4, 'martabak manis', 'martabak dengan keju dan coklat melimpah', 28000.00, 'martabak', '/uploads/productImage-1756996060492.jpeg', 1, '2025-09-04 14:27:40');

-- --------------------------------------------------------

--
-- Struktur dari tabel `stores`
--

CREATE TABLE `stores` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `nama_toko` varchar(255) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `is_open` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `stores`
--

INSERT INTO `stores` (`id`, `user_id`, `nama_toko`, `deskripsi`, `alamat`, `latitude`, `longitude`, `is_open`, `created_at`) VALUES
(1, 2, 'Sate Khas Senayan', 'Restoran sate legendaris dengan bumbu kacang istimewa. ', 'Jl. Pakubuwono VI No.6, RT.9/RW.7, Gunung, Kebayoran Baru, Padang Selatan', -0.90058833, 100.38135486, 1, '2025-09-04 13:48:25'),
(2, 3, 'Kedai Bakmi Hits ', 'Bakmi otentik dengan pangsit goreng renyah yang terkenal', 'jl. Katib Sulaiman no. 11 ,padang barat, kota padang', -0.91325962, 100.36375366, 1, '2025-09-04 14:06:20'),
(3, 4, 'CFC Kota Padang', 'cfc cabang kota padang yang menyadiakan berbagai olahan ayam', 'jln. Tabing No. 2 ,padang utara, kota padang', -0.90005969, 100.34884299, 1, '2025-09-04 14:15:57'),
(4, 5, 'Martabak Agus', 'kedai Martabak yang empuk dan enak di tigo nagari', 'jln. pd sawah-kumpulang ,tigo nagari', -0.03734675, 100.06584462, 1, '2025-09-04 14:25:09');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `nama` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','toko','pembeli') NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `nama`, `email`, `password`, `role`, `phone_number`, `created_at`) VALUES
(1, 'Super admin', 'admin@gofood.com', '$2a$10$9cqlNhKc.ybKPsLvM7Eb/.sgdqn8qsQNLiZDNApwji4iUCdh351qO', 'admin', '0987653345', '2025-09-04 13:42:45'),
(2, 'Budi Santoso', 'budi@gofood.com', '$2a$10$vgz5sTQSeVpBp8R9oVowyubcWDjs/RbdBEn7pYom3/.0KakrMRfL6', 'toko', '081111111111', '2025-09-04 13:48:25'),
(3, 'Siti Aminah', 'siti@gofood.com', '$2a$10$UdfAB5tc7qdAJ0GS9gbLiud91gfE7B7IcML8u466Si70A9r9Xrm/a', 'toko', '08222222222', '2025-09-04 14:06:20'),
(4, 'Ayu Santoso', 'ayu@gofood.com', '$2a$10$6bBi6yzSsJXCqkJKeBO3k.60B9IVOK2Z6GfKMWU9FHbqfScUr/77q', 'toko', '089999999', '2025-09-04 14:15:57'),
(5, 'agus putra', 'agus@gmail.com', '$2a$10$k3AbU.vb8VPc69Be7nlAfOaCP/tlRxRcKyex7LyyznEnbFEmEsDJC', 'toko', '08345678911', '2025-09-04 14:25:09');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pembeli_id` (`pembeli_id`),
  ADD KEY `toko_id` (`toko_id`);

--
-- Indeks untuk tabel `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `produk_id` (`produk_id`);

--
-- Indeks untuk tabel `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `toko_id` (`toko_id`);

--
-- Indeks untuk tabel `stores`
--
ALTER TABLE `stores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT untuk tabel `stores`
--
ALTER TABLE `stores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`pembeli_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`toko_id`) REFERENCES `stores` (`id`);

--
-- Ketidakleluasaan untuk tabel `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`produk_id`) REFERENCES `products` (`id`);

--
-- Ketidakleluasaan untuk tabel `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`toko_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `stores`
--
ALTER TABLE `stores`
  ADD CONSTRAINT `stores_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
