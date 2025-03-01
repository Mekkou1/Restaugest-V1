-- phpMyAdmin SQL Dump
-- version 4.9.5
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Feb 27, 2025 at 12:24 PM
-- Server version: 5.7.24
-- PHP Version: 7.4.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `restaurant_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `articles`
--

CREATE TABLE `articles` (
  `id` int(11) NOT NULL,
  `designation` varchar(255) NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `prix` decimal(10,2) DEFAULT NULL,
  `stock` int(11) DEFAULT NULL,
  `seuil_alerte` int(11) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `articles`
--

INSERT INTO `articles` (`id`, `designation`, `type`, `prix`, `stock`, `seuil_alerte`, `image_url`) VALUES
(1, 'Lettues afrique', 'Intrant', '3000.00', 20, 5, 'uploads/1739153059127-cesar.jpeg'),
(2, 'Gaspacho', 'Plat', '2000.00', 0, 0, 'uploads/1739310546293-Gaspacho.jpeg'),
(5, 'Coca-Cola', 'Boisson', '1000.00', 10, 10, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `avoirs`
--

CREATE TABLE `avoirs` (
  `id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `montant` decimal(10,2) NOT NULL,
  `date_emission` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `utilise` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `billetage`
--

CREATE TABLE `billetage` (
  `id` int(11) NOT NULL,
  `caisse_id` int(11) NOT NULL,
  `valeur` decimal(10,2) NOT NULL,
  `quantite` int(11) NOT NULL,
  `montant` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `boissons`
--

CREATE TABLE `boissons` (
  `id` int(11) NOT NULL,
  `ref` varchar(50) NOT NULL,
  `designation` varchar(100) NOT NULL,
  `nomenclature` varchar(255) DEFAULT NULL,
  `famille_id` int(11) NOT NULL,
  `prix` decimal(10,2) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT '0',
  `seuil_alerte` int(11) NOT NULL DEFAULT '5',
  `image_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `boissons`
--

INSERT INTO `boissons` (`id`, `ref`, `designation`, `nomenclature`, `famille_id`, `prix`, `stock`, `seuil_alerte`, `image_url`) VALUES
(5, ' B001', 'Coca-Cola', NULL, 3, '1000.00', 10, 10, NULL);

--
-- Triggers `boissons`
--
DELIMITER $$
CREATE TRIGGER `after_boisson_delete` AFTER DELETE ON `boissons` FOR EACH ROW BEGIN
    DELETE FROM articles WHERE id = OLD.id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_boisson_insert` AFTER INSERT ON `boissons` FOR EACH ROW BEGIN
    INSERT INTO articles (id, designation, type, prix, stock, seuil_alerte, image_url)
    VALUES (NEW.id, NEW.designation, 'Boisson', NEW.Prix, NEW.stock, NEW.seuil_alerte, NEW.image_url)
    ON DUPLICATE KEY UPDATE
        designation = NEW.designation,
        type = 'Boisson',
        prix = NEW.Prix,
        stock = NEW.stock,
        seuil_alerte = NEW.seuil_alerte,
        image_url = NEW.image_url;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_boisson_update` AFTER UPDATE ON `boissons` FOR EACH ROW BEGIN
    UPDATE articles
    SET designation = NEW.designation,
        type = 'Boisson',
        prix = NEW.Prix,
        stock = NEW.stock,
        seuil_alerte = NEW.seuil_alerte,
        image_url = NEW.image_url
    WHERE id = NEW.id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `boisson_intrants`
--

CREATE TABLE `boisson_intrants` (
  `id` int(11) NOT NULL,
  `boisson_id` int(11) NOT NULL,
  `intrant_id` int(11) NOT NULL,
  `quantite_utilisee` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `caisses`
--

CREATE TABLE `caisses` (
  `id` int(11) NOT NULL,
  `solde_jour` decimal(10,2) NOT NULL DEFAULT '0.00',
  `solde_veille` decimal(10,2) NOT NULL DEFAULT '0.00',
  `monnaie_disponible` decimal(10,2) NOT NULL DEFAULT '0.00',
  `devise_id` int(11) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `cartemenu`
--

CREATE TABLE `cartemenu` (
  `id` int(11) NOT NULL,
  `salle_id` int(11) DEFAULT NULL,
  `article_id` int(11) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `designation` varchar(255) DEFAULT NULL,
  `prix` decimal(10,2) DEFAULT NULL,
  `visible` tinyint(1) DEFAULT '1',
  `image_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `cartemenu`
--

INSERT INTO `cartemenu` (`id`, `salle_id`, `article_id`, `type`, `designation`, `prix`, `visible`, `image_url`) VALUES
(15, 5, 1, 'plat', NULL, '3000.00', 1, NULL),
(16, 5, 5, 'boisson', NULL, '1000.00', 1, NULL),
(17, 6, 1, 'plat', NULL, '5000.00', 1, NULL),
(18, 6, 5, 'boisson', NULL, '2000.00', 1, NULL),
(19, 5, 2, 'plat', NULL, '2000.00', 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `cartes_commande`
--

CREATE TABLE `cartes_commande` (
  `id` int(11) NOT NULL,
  `salle_id` int(11) NOT NULL,
  `article_id` int(11) NOT NULL,
  `type` enum('Plat','Boisson') NOT NULL,
  `designation` varchar(100) NOT NULL,
  `prix` decimal(10,2) NOT NULL,
  `visible` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `commandes`
--

CREATE TABLE `commandes` (
  `id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `article_id` int(11) NOT NULL,
  `quantite` int(11) NOT NULL,
  `prix` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `devises`
--

CREATE TABLE `devises` (
  `id` int(11) NOT NULL,
  `code` varchar(10) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `symbole` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `devises`
--

INSERT INTO `devises` (`id`, `code`, `nom`, `symbole`) VALUES
(1, 'XOF', 'Franc CFA', 'CFA'),
(2, 'USD', 'US Dollar', '$'),
(3, 'EUR', 'Euro', '€'),
(4, 'GBP', 'British Pound', '£'),
(5, 'JPY', 'Japanese Yen', '¥'),
(6, 'AUD', 'Australian Dollar', 'A$'),
(7, 'CAD', 'Canadian Dollar', 'C$'),
(8, 'CHF', 'Swiss Franc', 'CHF'),
(9, 'CNY', 'Chinese Yuan', '¥'),
(10, 'INR', 'Indian Rupee', '₹'),
(11, 'BRL', 'Brazilian Real', 'R$'),
(12, 'RUB', 'Russian Ruble', '₽'),
(13, 'ZAR', 'South African Rand', 'R'),
(14, 'MXN', 'Mexican Peso', '$'),
(15, 'KRW', 'South Korean Won', '₩'),
(16, 'SEK', 'Swedish Krona', 'kr'),
(17, 'SGD', 'Singapore Dollar', 'S$'),
(18, 'TRY', 'Turkish Lira', '₺'),
(19, 'AED', 'UAE Dirham', 'د.إ'),
(20, 'SAR', 'Saudi Riyal', '﷼'),
(21, 'HKD', 'Hong Kong Dollar', 'HK$'),
(22, 'NZD', 'New Zealand Dollar', 'NZ$'),
(23, 'NOK', 'Norwegian Krone', 'kr'),
(24, 'DKK', 'Danish Krone', 'kr'),
(25, 'PLN', 'Polish Zloty', 'zł'),
(26, 'TWD', 'New Taiwan Dollar', 'NT$'),
(27, 'THB', 'Thai Baht', '฿'),
(28, 'MYR', 'Malaysian Ringgit', 'RM'),
(29, 'IDR', 'Indonesian Rupiah', 'Rp'),
(30, 'PHP', 'Philippine Peso', '₱'),
(31, 'EGP', 'Egyptian Pound', 'E£'),
(32, 'ARS', 'Argentine Peso', '$'),
(33, 'CLP', 'Chilean Peso', '$'),
(34, 'COP', 'Colombian Peso', '$'),
(35, 'PEN', 'Peruvian Sol', 'S/.');

-- --------------------------------------------------------

--
-- Table structure for table `familles`
--

CREATE TABLE `familles` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `description` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `familles`
--

INSERT INTO `familles` (`id`, `nom`, `description`) VALUES
(1, 'Salades', 'plats entrée'),
(2, 'Légumes', 'ingrediants de preparation'),
(3, 'Sucrerie', 'famille de boissons'),
(4, 'Desserts', 'prise après plat de résistance');

-- --------------------------------------------------------

--
-- Table structure for table `historique_actions`
--

CREATE TABLE `historique_actions` (
  `id` int(11) NOT NULL,
  `utilisateur_id` int(11) NOT NULL,
  `action` varchar(255) NOT NULL,
  `date_action` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `historique_tickets`
--

CREATE TABLE `historique_tickets` (
  `id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `utilisateur_id` int(11) NOT NULL,
  `etat` enum('En attente de validation','En cuisine','En préparation','Servi','Payé','Payé avec avoir') NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `intrants`
--

CREATE TABLE `intrants` (
  `id` int(11) NOT NULL,
  `ref` varchar(50) NOT NULL,
  `designation` varchar(100) NOT NULL,
  `nomenclature` varchar(255) DEFAULT NULL,
  `famille_id` int(11) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT '0',
  `seuil_alerte` int(11) NOT NULL DEFAULT '5'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `intrants`
--

INSERT INTO `intrants` (`id`, `ref`, `designation`, `nomenclature`, `famille_id`, `stock`, `seuil_alerte`) VALUES
(1, 'I003', 'Lettues afrique', NULL, 1, 20, 5);

--
-- Triggers `intrants`
--
DELIMITER $$
CREATE TRIGGER `after_intrant_delete` AFTER DELETE ON `intrants` FOR EACH ROW BEGIN
    DELETE FROM articles WHERE id = OLD.id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_intrant_insert` AFTER INSERT ON `intrants` FOR EACH ROW BEGIN
    INSERT INTO articles (id, designation, type, prix, stock, seuil_alerte, image_url)
    VALUES (NEW.id, NEW.designation, 'Intrant', 0, NEW.stock, NEW.seuil_alerte, NULL)
    ON DUPLICATE KEY UPDATE
        designation = NEW.designation,
        type = 'Intrant',
        stock = NEW.stock,
        seuil_alerte = NEW.seuil_alerte;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_intrant_update` AFTER UPDATE ON `intrants` FOR EACH ROW BEGIN
    UPDATE articles
    SET designation = NEW.designation,
        type = 'Intrant',
        stock = NEW.stock,
        seuil_alerte = NEW.seuil_alerte
    WHERE id = NEW.id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `paiements`
--

CREATE TABLE `paiements` (
  `id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `montant` decimal(10,2) NOT NULL,
  `mode` enum('Espèces','Carte Bancaire','Monnaie Électronique') NOT NULL,
  `date_paiement` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `performances_employes`
--

CREATE TABLE `performances_employes` (
  `id` int(11) NOT NULL,
  `employe_id` int(11) NOT NULL,
  `role` enum('Cuisinier','Caissier','Serveur') NOT NULL,
  `nombre_commandes` int(11) NOT NULL DEFAULT '0',
  `nombre_paiements` int(11) NOT NULL DEFAULT '0',
  `nombre_preparations` int(11) NOT NULL DEFAULT '0',
  `date_statistique` date NOT NULL,
  `total_ventes` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_commandes` int(11) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `plats`
--

CREATE TABLE `plats` (
  `id` int(11) NOT NULL,
  `ref` varchar(50) NOT NULL,
  `designation` varchar(100) NOT NULL,
  `nomenclature` varchar(255) DEFAULT NULL,
  `famille_id` int(11) NOT NULL,
  `prix` decimal(10,2) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `plats`
--

INSERT INTO `plats` (`id`, `ref`, `designation`, `nomenclature`, `famille_id`, `prix`, `image_url`) VALUES
(1, 'P001', 'Salade César', NULL, 1, '3000.00', 'uploads/1739153059127-cesar.jpeg'),
(2, 'P002', 'Gaspacho', NULL, 4, '2000.00', 'uploads/1739310546293-Gaspacho.jpeg');

--
-- Triggers `plats`
--
DELIMITER $$
CREATE TRIGGER `after_plat_delete` AFTER DELETE ON `plats` FOR EACH ROW BEGIN
    DELETE FROM articles WHERE id = OLD.id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_plat_insert` AFTER INSERT ON `plats` FOR EACH ROW BEGIN
    INSERT INTO articles (id, designation, type, prix, stock, seuil_alerte, image_url)
    VALUES (NEW.id, NEW.designation, 'Plat', NEW.Prix, 0, 0, NEW.image_url)
    ON DUPLICATE KEY UPDATE
        designation = NEW.designation,
        type = 'Plat',
        prix = NEW.Prix,
        image_url = NEW.image_url;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_plat_update` AFTER UPDATE ON `plats` FOR EACH ROW BEGIN
    UPDATE articles
    SET designation = NEW.designation,
        type = 'Plat',
        prix = NEW.Prix,
        image_url = NEW.image_url
    WHERE id = NEW.id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `plat_intrants`
--

CREATE TABLE `plat_intrants` (
  `id` int(11) NOT NULL,
  `plat_id` int(11) NOT NULL,
  `intrant_id` int(11) NOT NULL,
  `quantite_utilisee` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `salles`
--

CREATE TABLE `salles` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `type` enum('VIP','Terrasse','Standard') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `salles`
--

INSERT INTO `salles` (`id`, `nom`, `type`) VALUES
(5, 'Terrasse', 'Terrasse'),
(6, 'VIP', 'VIP');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `sessionId` varchar(255) NOT NULL,
  `userId` int(11) NOT NULL,
  `refreshToken` varchar(255) NOT NULL,
  `expiresAt` datetime NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`sessionId`, `userId`, `refreshToken`, `expiresAt`, `createdAt`, `updatedAt`) VALUES
('014a0bb1baed86482e8d0b725e067b75', 4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImlhdCI6MTc0MDU5NzA5NCwiZXhwIjoxNzQxMjAxODk0fQ.Mg1VJ1gW4VQjtowwLidMSIyODbA52CB76U3WHdoqJus', '2025-02-27 19:11:34', '2025-02-26 19:11:34', '2025-02-26 19:11:34'),
('07057e5af539ee79314286e66a0a919c', 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImlhdCI6MTc0MDU5NjgzOSwiZXhwIjoxNzQxMjAxNjM5fQ.4MsnytXZ-RNrVbrbFpMgkHSmkwOpaavwlkteneB7Fk4', '2025-02-27 19:07:19', '2025-02-26 19:07:19', '2025-02-26 19:07:19'),
('3b035696261d29ecc8b824dd705eeb32', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc0MDU5NzQ1OSwiZXhwIjoxNzQxMjAyMjU5fQ.Mxo6pPxu9sypxqFeFoMQSBzAesHrfxh5z2i1bxiCQC8', '2025-02-27 19:17:39', '2025-02-26 19:17:39', '2025-02-26 19:17:39'),
('464c281f13dd2cd972b94467f1a75676', 5, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImlhdCI6MTc0MDU5NTYyMiwiZXhwIjoxNzQxMjAwNDIyfQ.Jkg3km5o-Uy1a9-4B6s35thRpt3JotQUpHo4JANPVhE', '2025-02-27 18:47:02', '2025-02-26 18:47:02', '2025-02-26 18:47:02'),
('f7e1e0fb653cca99e96cc62646c9da5d', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc0MDU5NTY0MywiZXhwIjoxNzQxMjAwNDQzfQ.4TUiFgEIxT8gb0u2QPOdseoB1dF3k2Jnz2PqjB-QrPM', '2025-02-26 19:17:39', '2025-02-26 18:47:23', '2025-02-26 19:17:39');

-- --------------------------------------------------------

--
-- Table structure for table `statistiques_ventes`
--

CREATE TABLE `statistiques_ventes` (
  `id` int(11) NOT NULL,
  `date_statistique` date NOT NULL,
  `total_ventes` decimal(10,2) NOT NULL,
  `total_commandes` int(11) NOT NULL,
  `total_plats` int(11) NOT NULL DEFAULT '0',
  `total_boissons` int(11) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `suivi_stocks`
--

CREATE TABLE `suivi_stocks` (
  `id` int(11) NOT NULL,
  `article_id` int(11) NOT NULL,
  `type` enum('Intrant','Boisson') NOT NULL,
  `variation` int(11) NOT NULL,
  `date_action` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tables_restaurant`
--

CREATE TABLE `tables_restaurant` (
  `id` int(11) NOT NULL,
  `nom` varchar(50) NOT NULL,
  `salle_id` int(11) NOT NULL,
  `type` enum('Carrée','Ronde','Rectangulaire') NOT NULL,
  `etat` enum('Libre','Occupée') DEFAULT 'Libre'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `tables_restaurant`
--

INSERT INTO `tables_restaurant` (`id`, `nom`, `salle_id`, `type`, `etat`) VALUES
(7, 'Terrasse1', 5, 'Carrée', 'Libre'),
(8, 'VIP1', 6, 'Ronde', 'Libre');

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--

CREATE TABLE `tickets` (
  `id` int(11) NOT NULL,
  `reference` varchar(20) NOT NULL,
  `table_id` int(11) NOT NULL,
  `etat` enum('En attente de validation','En cuisine','En préparation','Servi','Payé','Payé avec avoir') NOT NULL DEFAULT 'En attente de validation',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `transferts_monnaie`
--

CREATE TABLE `transferts_monnaie` (
  `id` int(11) NOT NULL,
  `caisse_source_id` int(11) NOT NULL,
  `caisse_destination_id` int(11) NOT NULL,
  `montant` decimal(10,2) NOT NULL,
  `date_transfert` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Stand-in structure for view `user_authentication`
-- (See below for the actual view)
--
CREATE TABLE `user_authentication` (
`id` int(11)
,`pseudo` varchar(50)
,`mot_de_passe` varchar(255)
,`role` enum('Administrateur','Gérant','Cuisinier','Caissier','Serveur')
,`etat` enum('Connecté','Déconnecté')
);

-- --------------------------------------------------------

--
-- Table structure for table `utilisateurs`
--

CREATE TABLE `utilisateurs` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `pseudo` varchar(50) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `contact1` varchar(20) DEFAULT NULL,
  `contact2` varchar(20) DEFAULT NULL,
  `role` enum('Administrateur','Gérant','Cuisinier','Caissier','Serveur') NOT NULL,
  `etat` enum('Connecté','Déconnecté') NOT NULL DEFAULT 'Déconnecté',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id`, `nom`, `prenom`, `pseudo`, `mot_de_passe`, `contact1`, `contact2`, `role`, `etat`, `created_at`) VALUES
(1, 'Admin', 'Principal', 'admin1', '$2a$10$2t.gdZ2Ie0xJwfvw3lJm9uNaswoSGti5uryHjLO1isFmMWu.5HRga', '0123456789', '0987654321', 'Administrateur', 'Déconnecté', '2025-02-09 13:56:31'),
(2, 'Durand', 'Marie', 'gerant1', '$2a$10$2t.gdZ2Ie0xJwfvw3lJm9uNaswoSGti5uryHjLO1isFmMWu.5HRga', '0147852369', '0987456321', 'Gérant', 'Déconnecté', '2025-02-09 13:56:31'),
(3, 'Martin', 'Paul', 'chef_cuisine1', '$2a$10$2t.gdZ2Ie0xJwfvw3lJm9uNaswoSGti5uryHjLO1isFmMWu.5HRga', '0178456932', '0954231786', 'Cuisinier', 'Déconnecté', '2025-02-09 13:56:31'),
(4, 'Dupont', 'Jean', 'caissier1', '$2a$10$2t.gdZ2Ie0xJwfvw3lJm9uNaswoSGti5uryHjLO1isFmMWu.5HRga', '0156932478', '0932147856', 'Caissier', 'Déconnecté', '2025-02-09 13:56:31'),
(5, 'Bernard', 'Sophie', 'serveur1', '$2a$10$2t.gdZ2Ie0xJwfvw3lJm9uNaswoSGti5uryHjLO1isFmMWu.5HRga', '0132698745', '0985746321', 'Serveur', 'Déconnecté', '2025-02-09 13:56:31'),
(7, 'Admin', 'System', 'admin', '$2a$10$2t.gdZ2Ie0xJwfvw3lJm9uNaswoSGti5uryHjLO1isFmMWu.5HRga', NULL, NULL, 'Administrateur', 'Déconnecté', '2025-02-24 01:40:32');

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_articles`
-- (See below for the actual view)
--
CREATE TABLE `v_articles` (
`id` int(11)
,`type` varchar(7)
,`ref` varchar(50)
,`designation` varchar(100)
,`famille_id` int(11)
,`prix` decimal(10,2)
,`stock` int(11)
,`seuil_alerte` int(11)
);

-- --------------------------------------------------------

--
-- Structure for view `user_authentication`
--
DROP TABLE IF EXISTS `user_authentication`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `user_authentication`  AS  select `utilisateurs`.`id` AS `id`,`utilisateurs`.`pseudo` AS `pseudo`,`utilisateurs`.`mot_de_passe` AS `mot_de_passe`,`utilisateurs`.`role` AS `role`,`utilisateurs`.`etat` AS `etat` from `utilisateurs` ;

-- --------------------------------------------------------

--
-- Structure for view `v_articles`
--
DROP TABLE IF EXISTS `v_articles`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_articles`  AS  select `plats`.`id` AS `id`,'Plat' AS `type`,`plats`.`ref` AS `ref`,`plats`.`designation` AS `designation`,`plats`.`famille_id` AS `famille_id`,`plats`.`prix` AS `prix`,NULL AS `stock`,NULL AS `seuil_alerte` from `plats` union all select `boissons`.`id` AS `id`,'Boisson' AS `type`,`boissons`.`ref` AS `ref`,`boissons`.`designation` AS `designation`,`boissons`.`famille_id` AS `famille_id`,`boissons`.`prix` AS `prix`,`boissons`.`stock` AS `stock`,`boissons`.`seuil_alerte` AS `seuil_alerte` from `boissons` union all select `intrants`.`id` AS `id`,'Intrant' AS `type`,`intrants`.`ref` AS `ref`,`intrants`.`designation` AS `designation`,`intrants`.`famille_id` AS `famille_id`,NULL AS `prix`,`intrants`.`stock` AS `stock`,`intrants`.`seuil_alerte` AS `seuil_alerte` from `intrants` ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `articles`
--
ALTER TABLE `articles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `avoirs`
--
ALTER TABLE `avoirs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_id` (`ticket_id`);

--
-- Indexes for table `billetage`
--
ALTER TABLE `billetage`
  ADD PRIMARY KEY (`id`),
  ADD KEY `caisse_id` (`caisse_id`);

--
-- Indexes for table `boissons`
--
ALTER TABLE `boissons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ref` (`ref`),
  ADD KEY `famille_id` (`famille_id`);

--
-- Indexes for table `boisson_intrants`
--
ALTER TABLE `boisson_intrants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `boisson_id` (`boisson_id`),
  ADD KEY `intrant_id` (`intrant_id`);

--
-- Indexes for table `caisses`
--
ALTER TABLE `caisses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `devise_id` (`devise_id`);

--
-- Indexes for table `cartemenu`
--
ALTER TABLE `cartemenu`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_article` (`salle_id`,`article_id`,`type`),
  ADD KEY `article_id` (`article_id`);

--
-- Indexes for table `cartes_commande`
--
ALTER TABLE `cartes_commande`
  ADD PRIMARY KEY (`id`),
  ADD KEY `salle_id` (`salle_id`),
  ADD KEY `article_id` (`article_id`);

--
-- Indexes for table `commandes`
--
ALTER TABLE `commandes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_id` (`ticket_id`),
  ADD KEY `article_id` (`article_id`);

--
-- Indexes for table `devises`
--
ALTER TABLE `devises`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `familles`
--
ALTER TABLE `familles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nom` (`nom`);

--
-- Indexes for table `historique_actions`
--
ALTER TABLE `historique_actions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `utilisateur_id` (`utilisateur_id`);

--
-- Indexes for table `historique_tickets`
--
ALTER TABLE `historique_tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_id` (`ticket_id`),
  ADD KEY `utilisateur_id` (`utilisateur_id`);

--
-- Indexes for table `intrants`
--
ALTER TABLE `intrants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ref` (`ref`),
  ADD KEY `famille_id` (`famille_id`);

--
-- Indexes for table `paiements`
--
ALTER TABLE `paiements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_id` (`ticket_id`);

--
-- Indexes for table `performances_employes`
--
ALTER TABLE `performances_employes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employe_id` (`employe_id`);

--
-- Indexes for table `plats`
--
ALTER TABLE `plats`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ref` (`ref`),
  ADD KEY `famille_id` (`famille_id`);

--
-- Indexes for table `plat_intrants`
--
ALTER TABLE `plat_intrants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `plat_id` (`plat_id`),
  ADD KEY `intrant_id` (`intrant_id`);

--
-- Indexes for table `salles`
--
ALTER TABLE `salles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`sessionId`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `statistiques_ventes`
--
ALTER TABLE `statistiques_ventes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `suivi_stocks`
--
ALTER TABLE `suivi_stocks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `article_id` (`article_id`);

--
-- Indexes for table `tables_restaurant`
--
ALTER TABLE `tables_restaurant`
  ADD PRIMARY KEY (`id`),
  ADD KEY `salle_id` (`salle_id`);

--
-- Indexes for table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `reference` (`reference`),
  ADD KEY `table_id` (`table_id`);

--
-- Indexes for table `transferts_monnaie`
--
ALTER TABLE `transferts_monnaie`
  ADD PRIMARY KEY (`id`),
  ADD KEY `caisse_source_id` (`caisse_source_id`),
  ADD KEY `caisse_destination_id` (`caisse_destination_id`);

--
-- Indexes for table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pseudo` (`pseudo`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_etat` (`etat`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `articles`
--
ALTER TABLE `articles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `avoirs`
--
ALTER TABLE `avoirs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `billetage`
--
ALTER TABLE `billetage`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `boissons`
--
ALTER TABLE `boissons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `boisson_intrants`
--
ALTER TABLE `boisson_intrants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `caisses`
--
ALTER TABLE `caisses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cartemenu`
--
ALTER TABLE `cartemenu`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `cartes_commande`
--
ALTER TABLE `cartes_commande`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `commandes`
--
ALTER TABLE `commandes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `devises`
--
ALTER TABLE `devises`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `familles`
--
ALTER TABLE `familles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `historique_actions`
--
ALTER TABLE `historique_actions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `historique_tickets`
--
ALTER TABLE `historique_tickets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `intrants`
--
ALTER TABLE `intrants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `paiements`
--
ALTER TABLE `paiements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `performances_employes`
--
ALTER TABLE `performances_employes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `plats`
--
ALTER TABLE `plats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `plat_intrants`
--
ALTER TABLE `plat_intrants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `salles`
--
ALTER TABLE `salles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `statistiques_ventes`
--
ALTER TABLE `statistiques_ventes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `suivi_stocks`
--
ALTER TABLE `suivi_stocks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tables_restaurant`
--
ALTER TABLE `tables_restaurant`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transferts_monnaie`
--
ALTER TABLE `transferts_monnaie`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `avoirs`
--
ALTER TABLE `avoirs`
  ADD CONSTRAINT `avoirs_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `billetage`
--
ALTER TABLE `billetage`
  ADD CONSTRAINT `billetage_ibfk_1` FOREIGN KEY (`caisse_id`) REFERENCES `caisses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `boissons`
--
ALTER TABLE `boissons`
  ADD CONSTRAINT `boissons_ibfk_1` FOREIGN KEY (`famille_id`) REFERENCES `familles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `boisson_intrants`
--
ALTER TABLE `boisson_intrants`
  ADD CONSTRAINT `boisson_intrants_ibfk_1` FOREIGN KEY (`boisson_id`) REFERENCES `boissons` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `boisson_intrants_ibfk_2` FOREIGN KEY (`intrant_id`) REFERENCES `intrants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `caisses`
--
ALTER TABLE `caisses`
  ADD CONSTRAINT `caisses_ibfk_1` FOREIGN KEY (`devise_id`) REFERENCES `devises` (`id`);

--
-- Constraints for table `cartemenu`
--
ALTER TABLE `cartemenu`
  ADD CONSTRAINT `cartemenu_ibfk_1` FOREIGN KEY (`salle_id`) REFERENCES `salles` (`id`),
  ADD CONSTRAINT `cartemenu_ibfk_2` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`);

--
-- Constraints for table `cartes_commande`
--
ALTER TABLE `cartes_commande`
  ADD CONSTRAINT `cartes_commande_ibfk_1` FOREIGN KEY (`salle_id`) REFERENCES `salles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cartes_commande_ibfk_2` FOREIGN KEY (`article_id`) REFERENCES `plats` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `commandes`
--
ALTER TABLE `commandes`
  ADD CONSTRAINT `commandes_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `commandes_ibfk_2` FOREIGN KEY (`article_id`) REFERENCES `plats` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `historique_actions`
--
ALTER TABLE `historique_actions`
  ADD CONSTRAINT `historique_actions_ibfk_1` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `historique_tickets`
--
ALTER TABLE `historique_tickets`
  ADD CONSTRAINT `historique_tickets_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `historique_tickets_ibfk_2` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `intrants`
--
ALTER TABLE `intrants`
  ADD CONSTRAINT `intrants_ibfk_1` FOREIGN KEY (`famille_id`) REFERENCES `familles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `paiements`
--
ALTER TABLE `paiements`
  ADD CONSTRAINT `paiements_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `performances_employes`
--
ALTER TABLE `performances_employes`
  ADD CONSTRAINT `performances_employes_ibfk_1` FOREIGN KEY (`employe_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `plats`
--
ALTER TABLE `plats`
  ADD CONSTRAINT `plats_ibfk_1` FOREIGN KEY (`famille_id`) REFERENCES `familles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `plat_intrants`
--
ALTER TABLE `plat_intrants`
  ADD CONSTRAINT `plat_intrants_ibfk_1` FOREIGN KEY (`plat_id`) REFERENCES `plats` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `plat_intrants_ibfk_2` FOREIGN KEY (`intrant_id`) REFERENCES `intrants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `utilisateurs` (`id`);

--
-- Constraints for table `suivi_stocks`
--
ALTER TABLE `suivi_stocks`
  ADD CONSTRAINT `suivi_stocks_ibfk_1` FOREIGN KEY (`article_id`) REFERENCES `intrants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tables_restaurant`
--
ALTER TABLE `tables_restaurant`
  ADD CONSTRAINT `tables_restaurant_ibfk_1` FOREIGN KEY (`salle_id`) REFERENCES `salles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tickets`
--
ALTER TABLE `tickets`
  ADD CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`table_id`) REFERENCES `tables_restaurant` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `transferts_monnaie`
--
ALTER TABLE `transferts_monnaie`
  ADD CONSTRAINT `transferts_monnaie_ibfk_1` FOREIGN KEY (`caisse_source_id`) REFERENCES `caisses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transferts_monnaie_ibfk_2` FOREIGN KEY (`caisse_destination_id`) REFERENCES `caisses` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
