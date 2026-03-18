-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : dim. 04 mai 2025 à 14:04
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `iot`
--

-- --------------------------------------------------------

--
-- Structure de la table `alerts`
--

CREATE TABLE `alerts` (
  `id` bigint(20) NOT NULL,
  `type` varchar(255) DEFAULT NULL,
  `value` float NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `threshold` float NOT NULL,
  `timestamp` datetime(6) DEFAULT NULL,
  `device` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `alerts`
--

INSERT INTO `alerts` (`id`, `type`, `value`, `description`, `threshold`, `timestamp`, `device`) VALUES
(30, 'temperature', 29.8925, 'High temperature alert', 28, '2025-04-30 11:08:48.000000', 'CapteurTempérature1'),
(31, 'temperature', 29.5338, 'High temperature alert', 28, '2025-04-30 11:09:18.000000', 'CapteurTempérature1'),
(32, 'temperature', 28.3308, 'High temperature alert', 28, '2025-04-30 11:10:18.000000', 'CapteurTempérature1'),
(33, 'temperature', 28.6305, 'High temperature alert', 28, '2025-04-30 11:11:48.000000', 'CapteurTempérature1'),
(34, 'temperature', 28.5848, 'High temperature alert', 28, '2025-04-30 11:13:18.000000', 'CapteurTempérature1'),
(38, 'temperature', 29.042, 'High temperature alert', 28, '2025-04-30 11:32:53.000000', 'ESP32'),
(39, 'temperature', 28.875, 'High temperature alert', 28, '2025-04-30 11:34:28.000000', 'ESP32'),
(40, 'temperature', 29.7871, 'High temperature alert', 28, '2025-04-30 11:40:33.000000', 'CapteurTempérature1'),
(41, 'temperature', 29.2715, 'High temperature alert', 28, '2025-04-30 11:44:33.000000', 'CapteurTempérature1'),
(42, 'temperature', 28.576, 'High temperature alert', 28, '2025-04-30 11:49:23.000000', 'CapteurTempérature1'),
(43, 'temperature', 29.109, 'High temperature alert', 28, '2025-04-30 11:49:53.000000', 'CapteurTempérature1'),
(44, 'temperature', 28.9999, 'High temperature alert', 28, '2025-04-30 11:52:53.000000', 'CapteurTempérature1'),
(45, 'temperature', 29.116, 'High temperature alert', 28, '2025-04-30 12:10:53.000000', 'CapteurTempérature1'),
(46, 'temperature', 28.2358, 'High temperature alert', 28, '2025-04-30 12:12:53.000000', 'CapteurTempérature1'),
(47, 'temperature', 29.1713, 'High temperature alert', 28, '2025-04-30 12:15:23.000000', 'CapteurTempérature1'),
(48, 'temperature', 29.3821, 'High temperature alert', 28, '2025-04-30 12:17:23.000000', 'CapteurTempérature1'),
(49, 'temperature', 29.2123, 'High temperature alert', 28, '2025-04-30 12:17:53.000000', 'CapteurTempérature1'),
(50, 'temperature', 29.2097, 'High temperature alert', 28, '2025-04-30 12:22:53.000000', 'CapteurTempérature1'),
(51, 'temperature', 29.833, 'High temperature alert', 28, '2025-04-30 12:23:53.000000', 'CapteurTempérature1'),
(52, 'temperature', 29.3118, 'High temperature alert', 28, '2025-04-30 12:24:23.000000', 'CapteurTempérature1'),
(53, 'temperature', 28.1365, 'High temperature alert', 28, '2025-05-01 22:07:04.000000', 'CapteurTempérature1'),
(54, 'temperature', 29.245, 'High temperature alert', 28, '2025-05-01 22:08:34.000000', 'CapteurTempérature1'),
(55, 'temperature', 28.7285, 'High temperature alert', 28, '2025-05-01 22:10:34.000000', 'CapteurTempérature1'),
(56, 'temperature', 29.3658, 'High temperature alert', 28, '2025-05-01 22:11:04.000000', 'CapteurTempérature1'),
(57, 'temperature', 28.5688, 'High temperature alert', 28, '2025-05-01 22:12:04.000000', 'CapteurTempérature1'),
(58, 'temperature', 29.2724, 'High temperature alert', 28, '2025-05-01 22:13:29.000000', 'CapteurTempérature1'),
(59, 'temperature', 29.4752, 'High temperature alert', 28, '2025-05-01 22:16:29.000000', 'CapteurTempérature1'),
(60, 'temperature', 28.0807, 'High temperature alert', 28, '2025-05-01 22:20:29.000000', 'CapteurTempérature1'),
(61, 'temperature', 28.319, 'High temperature alert', 28, '2025-05-01 22:25:59.000000', 'CapteurTempérature1'),
(62, 'temperature', 29.5536, 'High temperature alert', 28, '2025-05-01 22:26:58.000000', 'CapteurTempérature1'),
(63, 'temperature', 29.4036, 'High temperature alert', 28, '2025-05-01 22:27:29.000000', 'CapteurTempérature1'),
(64, 'temperature', 29.5143, 'High temperature alert', 28, '2025-05-01 22:31:29.000000', 'CapteurTempérature1');

-- --------------------------------------------------------

--
-- Structure de la table `gateway`
--

CREATE TABLE `gateway` (
  `id` bigint(20) NOT NULL,
  `address_or_location` varchar(255) DEFAULT NULL,
  `ip_address` varchar(255) NOT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `mac_address` varchar(255) NOT NULL,
  `mark_or_model` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `gateway`
--

INSERT INTO `gateway` (`id`, `address_or_location`, `ip_address`, `latitude`, `longitude`, `mac_address`, `mark_or_model`, `name`) VALUES
(2, 'Location 2', '192.168.2.1', 40.7128, -74.006, '00:14:22:01:23:46', 'Model B', 'New Gateway'),
(3, 'Location 4', '192.168.2.3', 42.7128, -76.006, '00:14:22:01:23:48', 'Model D', 'Gateway2'),
(4, 'Tunis', '192.168.0.1', 36.8065, 10.1815, '00:11:22:33:44:55', 'ModelX', 'Gateway 1'),
(5, 'ghddgh', '12.32.65.36', 4, 7, '55:45:45', 'mlkj', 'touziiii');

-- --------------------------------------------------------

--
-- Structure de la table `node`
--

CREATE TABLE `node` (
  `id` bigint(20) NOT NULL,
  `address_or_location` varchar(255) DEFAULT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `mac_address` varchar(255) NOT NULL,
  `mark_or_model` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `gateway_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `node`
--

INSERT INTO `node` (`id`, `address_or_location`, `ip_address`, `latitude`, `longitude`, `mac_address`, `mark_or_model`, `name`, `gateway_id`) VALUES
(2, 'Location 1', '192.168.2.10', 40.7128, -74.006, '00:14:22:01:23:50', 'Model X', 'Node 1', 2);

-- --------------------------------------------------------

--
-- Structure de la table `nodes`
--

CREATE TABLE `nodes` (
  `id` bigint(20) NOT NULL,
  `address_or_location` varchar(255) DEFAULT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `latitude` double NOT NULL,
  `longitude` double NOT NULL,
  `mac_address` varchar(255) DEFAULT NULL,
  `mark_or_model` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `gateway_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `nodes`
--

INSERT INTO `nodes` (`id`, `address_or_location`, `ip_address`, `latitude`, `longitude`, `mac_address`, `mark_or_model`, `name`, `gateway_id`) VALUES
(2, 'Location 1', '192.168.2.10', 40.7128, -74.006, '00:14:22:01:23:50', 'Model X', 'Node 1', 2),
(3, 'Location 1', '192.168.0.1', 48.8566, 2.3522, '00:14:22:01:23:45', 'Model K', 'Node2', 3);

-- --------------------------------------------------------

--
-- Structure de la table `sensors`
--

CREATE TABLE `sensors` (
  `id` bigint(20) NOT NULL,
  `node_id` bigint(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `measurement_type` varchar(255) NOT NULL,
  `measurement_unit` varchar(255) DEFAULT NULL,
  `measurement_value` double DEFAULT NULL,
  `precision` double DEFAULT NULL,
  `threshold` double DEFAULT NULL,
  `sensor_precision` double DEFAULT NULL,
  `_precision` double DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `sensors`
--

INSERT INTO `sensors` (`id`, `node_id`, `name`, `type`, `measurement_type`, `measurement_unit`, `measurement_value`, `precision`, `threshold`, `sensor_precision`, `_precision`) VALUES
(6, 2, 'Capteur Température', 'Température', 'Température ambiante', 'Celsius', 22.5, NULL, 30, NULL, NULL),
(7, 2, 'camion', 'fhgg', 'fghhgf', 'n', 4, NULL, 4, NULL, NULL),
(8, 2, 'touzi', 'jjj', 'jj', 'jj', 45, NULL, 11, NULL, NULL),
(9, 2, 'dsfghj', 'gfhjk', 'hgdf', 'g', 47, NULL, 7, NULL, NULL),
(10, 2, 'aaa', 'aaa', 'a', 'a', 5, NULL, 5, NULL, NULL),
(11, 2, 'aaaaaaaaaaa', 'Température', 'Température ambiante', 'Celsius', 22.5, NULL, 30, NULL, NULL),
(12, 2, 'aaaaaaaaaaa', 'Température', 'Température ambiante', 'Celsius', 22.5, NULL, 30, NULL, NULL),
(13, 2, 'bbbbbbbb', 'Température', 'Température ambiante', 'Celsius', 22.5, NULL, 30, NULL, NULL),
(15, 2, 'hlel', 'monta', 'a', 'a', 5, NULL, 5, 5, NULL),
(16, 2, 'gaaaaa', 'Température', 'Température ambiante', 'Celsius', 22.5, NULL, 30, NULL, NULL),
(17, 2, 'Khmili Mohamed', 'monta', 'jj', 'jj', 5, NULL, 7, 1, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `user`
--

CREATE TABLE `user` (
  `name` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `weather_data`
--

CREATE TABLE `weather_data` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `temperature` double NOT NULL,
  `humidity` double NOT NULL,
  `wind_speed` double DEFAULT NULL,
  `precipitation` double DEFAULT NULL,
  `solar_radiation` double DEFAULT NULL,
  `timestamp` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Structure de la table `agro_results`
--

CREATE TABLE `agro_results` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `et0` double NOT NULL,
  `irrigation_need` double NOT NULL,
  `cold_hours` double DEFAULT 0,
  `timestamp` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Structure de la table `predictions`
--

CREATE TABLE `predictions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `model_name` varchar(255) DEFAULT NULL,
  `input_context` text,
  `prediction_value` double NOT NULL,
  `timestamp` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `user`
--

INSERT INTO `user` (`name`, `password`) VALUES
('aaa', '$2a$10$4t5j51enlDx5V/g6NKfBmuYfV96ym6uUgoCFlHVCayVKN61.tNl2W'),
('admin', '$2a$10$q1W3Ei22OAGTT5SLzgXyGu0OryLTjnZRPdBNrqyj./iWvaSOFp.Zi'),
('alice', '$2a$10$3Ki6eEB6xAvEDMZsaoj0pe7XgIJiaM9/9p9KVc7DSG82zB1lQ264S'),
('bbb', '$2a$10$ybXjJUWFSUQfdqCg3SB44uiOxV0qBbBtsY2T3rHsZxkQORw3yE2jG'),
('med', '$2a$10$84Uiwqbbz2RnV0PcjHfTj.9cSreUY9lq9f1qR.pjrkJxsfu7udsf6');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`name`, `password`) VALUES
('aaa', '$2a$10$VsEC3kBP0mW2NP1aYkvYhuGidojNE3k6jrXvUYhMpFGhzQJIhcxf6'),
('alice', '$2a$10$5pS6b2z0g8Yr2/eYnI0dx.vO2AIgZBOtAd5LZ4mhoDQccM1YT3rOW'),
('JBAL', '$2a$10$gOuPWIgjJR5a.eSCh05NyOr5uUClgfz1J.QlwzikkQSYuBJ2J8s/y');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `alerts`
--
ALTER TABLE `alerts`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `gateway`
--
ALTER TABLE `gateway`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `node`
--
ALTER TABLE `node`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKohprxc1l6psku4lyovhm1ym1` (`gateway_id`);

--
-- Index pour la table `nodes`
--
ALTER TABLE `nodes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKqcxqqt71h8y9lnvxfo2w57p4s` (`gateway_id`);

--
-- Index pour la table `sensors`
--
ALTER TABLE `sensors`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKj333b0tkax69dipjn66009ymb` (`node_id`);

--
-- Index pour la table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`name`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`name`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `alerts`
--
ALTER TABLE `alerts`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=65;

--
-- AUTO_INCREMENT pour la table `gateway`
--
ALTER TABLE `gateway`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `node`
--
ALTER TABLE `node`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `nodes`
--
ALTER TABLE `nodes`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `sensors`
--
ALTER TABLE `sensors`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `node`
--
ALTER TABLE `node`
  ADD CONSTRAINT `FKohprxc1l6psku4lyovhm1ym1` FOREIGN KEY (`gateway_id`) REFERENCES `gateway` (`id`);

--
-- Contraintes pour la table `nodes`
--
ALTER TABLE `nodes`
  ADD CONSTRAINT `FKqcxqqt71h8y9lnvxfo2w57p4s` FOREIGN KEY (`gateway_id`) REFERENCES `gateway` (`id`);

--
-- Contraintes pour la table `sensors`
--
ALTER TABLE `sensors`
  ADD CONSTRAINT `FKj333b0tkax69dipjn66009ymb` FOREIGN KEY (`node_id`) REFERENCES `nodes` (`id`),
  ADD CONSTRAINT `sensors_ibfk_1` FOREIGN KEY (`node_id`) REFERENCES `node` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
