CREATE USER 'pma'@'192.168.0.138' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON phpmyadmin.* TO 'pma'@'192.168.0.138';

FLUSH PRIVILEGES;


ALTER USER 'root'@'192.168.0.138' IDENTIFIED WITH mysql_native_password BY 'password';


-- AAAAAAAAAAAAAAAAAAAA

CREATE DATABASE IF NOT EXISTS ETSTSR;

USE ETSTSR;

CREATE TABLE records (
    fishNo INT AUTO_INCREMENT PRIMARY KEY,
    AdSoyad VARCHAR(255) NOT NULL,
    TeslimAlmaTarihi DATETIME,
    TelNo VARCHAR(50),
    Urun VARCHAR(255),
    Marka VARCHAR(255),
    Model VARCHAR(255),
    SeriNo VARCHAR(255),
    GarantiDurumu VARCHAR(100),
    TeslimAlan VARCHAR(255),
    Teknisyen VARCHAR(255),
    Ucret DECIMAL(10, 2),
    Sorunlar TEXT,
    BirlikteAlinanlar TEXT,
    Aciklama TEXT,
    Yapilanlar TEXT,
    HazirlamaTarihi DATETIME,
    TeslimEtmeTarihi DATETIME,
    Durum VARCHAR(100)
);

ALTER TABLE records AUTO_INCREMENT = 3000;
ALTER TABLE records ADD COLUMN fishNo INT AUTO_INCREMENT PRIMARY KEY;

CREATE TABLE crecords (
    cFishNo INT AUTO_INCREMENT PRIMARY KEY,
    AdSoyad VARCHAR(255) NOT NULL,
    TelNo VARCHAR(50),
    Email VARCHAR(255),
	Province VARCHAR(255),
    District VARCHAR(255),
    Addres TEXT,
    CostumerType VARCHAR(255),
    TeslimAlmaTarihi DATETIME,
    Urun VARCHAR(255),
    Marka VARCHAR(255),
    Model VARCHAR(255),
    SeriNo VARCHAR(255),
    GarantiDurumu VARCHAR(100),
    Teknisyen VARCHAR(255),
    Ucret DECIMAL(10, 2),
    Sorunlar TEXT,
    BirlikteAlinanlar TEXT,
    Aciklama TEXT,
    Yapilanlar TEXT,
    HazirlamaTarihi DATETIME,
    TeslimEtmeTarihi DATETIME,
    Durum VARCHAR(100)
);

CREATE TABLE tablestatus(
	id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50), -- Boolean
    AdSoyad TINYINT(1),
    TeslimAlmaTarihi TINYINT(1), -- Boolean
    TelNo TINYINT(1), -- Boolean
    Urun TINYINT(1), -- Boolean
    Marka TINYINT(1), -- Boolean
    Model TINYINT(1), -- Boolean
    SeriNo TINYINT(1), -- Boolean
    GarantiDurumu TINYINT(1), -- Boolean
    TeslimAlan TINYINT(1), -- Boolean
    Teknisyen TINYINT(1), -- Boolean
    Ucret TINYINT(1), -- Boolean
    Sorunlar TINYINT(1), -- Boolean
    BirlikteAlinanlar TINYINT(1), -- Boolean
    Aciklama TINYINT(1), -- Boolean
    Yapilanlar TINYINT(1), -- Boolean
    HazirlamaTarihi TINYINT(1), -- Boolean
    TeslimEtmeTarihi TINYINT(1), -- Boolean
    Durum TINYINT(1), -- Boolean
    -- PAGES
    AddCustomerPage TINYINT(1),
    DeliveredProductsPage TINYINT(1),
    HomePage TINYINT(1),
    ProductInfoPage TINYINT(1),
    RecordFormPage TINYINT(1),
    ShowCostumerRecordsPage TINYINT(1),
    ShowUserInfoPage TINYINT(1),
    ChangeSettingsPage TINYINT(1),
    -- AddCustomer TINYINT(1),
    AddProdPage TINYINT(1),
    AddUserPage TINYINT(1),
    -- ShowUserStatusPage TINYINT(1),
    EditUserPage TINYINT(1),
    ProdInfoPage TINYINT(1)
);

CREATE TABLE adminusers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  username VARCHAR(255) NOT NULL,
  selected_columns TEXT NOT NULL
);

ALTER TABLE users ADD UNIQUE (username);

SELECT * FROM etstsr.adminusers;
SELECT * FROM etstsr.users;
SELECT * FROM etstsr.user_settings;
SELECT * FROM etstsr.records;
SELECT * FROM etstsr.tablestatus;

-- DIKKAT !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
TRUNCATE etstsr.users;
TRUNCATE etstsr.adminusers;
TRUNCATE etstsr.user_settings;
TRUNCATE etstsr.tablestatus;

DROP TABLE `etstsr`.`records`;
DROP TABLE `etstsr`.`users`;
DROP TABLE `etstsr`.`adminusers`;
DROP TABLE `etstsr`.`user_settings`;
DROP TABLE `etstsr`.`tablestatus`;

SELECT * FROM user_settings WHERE username = 'agabuga' LIMIT 1;


INSERT INTO records (fishNo, AdSoyad, TeslimAlmaTarihi, TelNo, Urun, Marka, Model, SeriNo, GarantiDurumu, TeslimAlan, Teknisyen, Ucret, Sorunlar, BirlikteAlinanlar, Aciklama, Yapilanlar, HazirlamaTarihi, TeslimEtmeTarihi, Durum)
VALUES
(3000, 'Ali Bey', '2025-01-10 10:30:00', '05012345678', 'kasa pc', 'Dell', 'Optiplex 3050', 'SN123456', 'garantisiz', 'mağza', 'Mehmet', NULL, '', '', '', '', NULL, NULL, 'Onarılıyor'),
(3001, 'Fikret Bey', '2025-01-11 09:00:00', '05023456789', 'laptop', 'HP', 'Pavilion 14', 'SN234567', 'garantisiz', 'mehmetim', 'Talha', NULL, '', '', '', '', NULL, NULL, 'Bekliyor'),
(3002, 'Halil Bey', '2025-01-12 11:15:00', '05034567890', 'ekran kartı', 'NVIDIA', 'RTX 3060', 'SN345678', 'garantili', 'mehmet', 'Emre Bey', NULL, '', '', '', '', NULL, NULL, 'Tamamlandı'),
(3003, 'İbrahim Bey', '2025-01-13 14:00:00', '05045678901', 'yazıcı', 'Canon', 'PIXMA G4010', 'SN456789', 'sözleşmeli', 'talha', 'İbrahim Bey', NULL, '', '', '', '', NULL, NULL, 'İade Edildi'),
(3004, 'Emre Bey', '2025-01-14 16:00:00', '05056789012', 'kasa pc', 'Lenovo', 'ThinkCentre M90n', 'SN567890', 'garantisiz', 'alp bey', 'Ali Bey', NULL, '', '', '', '', NULL, NULL, 'Yedek Parça'),
(3005, 'Alp Bey', '2025-01-15 13:30:00', '05067890123', 'laptop', 'Acer', 'Aspire 5', 'SN678901', 'garantili', 'hahlil', 'Fikret Bey', NULL, '', '', '', '', NULL, NULL, 'Onarılıyor'),
(3006, 'Mehmetim', '2025-01-16 08:45:00', '05078901234', 'ekran kartı', 'AMD', 'Radeon RX 6600', 'SN789012', 'belirsiz', 'ali bey', 'Halil Bey', NULL, '', '', '', '', NULL, NULL, 'Satın Alındı'),
(3007, 'Mehmet', '2025-01-17 17:00:00', '05089012345', 'yazıcı', 'HP', 'LaserJet Pro', 'SN890123', 'garantisiz', 'fikret bey', 'Mehmet', NULL, '', '', '', '', NULL, NULL, 'Montaj Yapılacak'),
(3008, 'İbrahim Bey', '2025-01-18 10:00:00', '05090123456', 'kasa pc', 'HP', 'EliteDesk 800 G5', 'SN901234', 'garantili', 'talha', 'Talha', NULL, '', '', '', '', NULL, NULL, 'Faturalandı'),
(3009, 'Fikret Bey', '2025-01-19 12:30:00', '05012345679', 'laptop', 'Dell', 'XPS 13', 'SN012345', 'garantisiz', 'emre bey', 'Ali Bey', NULL, '', '', '', '', NULL, NULL, 'Onay Bekliyor'),
(3010, 'Ali Bey', '2025-01-20 14:30:00', '05023456780', 'yazıcı', 'Epson', 'EcoTank L3150', 'SN123457', 'garantisiz', 'halil bey', 'Mehmet', NULL, '', '', '', '', NULL, NULL, 'Hazırlanıyor'),
(3011, 'Emre Bey', '2025-01-21 09:00:00', '05034567891', 'kasa pc', 'HP', 'ProDesk 600 G3', 'SN123458', 'garantili', 'hahlil', 'Mehmetim', NULL, '', '', '', '', NULL, NULL, 'Periyodik Bakım'),
(3012, 'Alp Bey', '2025-01-22 11:15:00', '05045678902', 'ekran kartı', 'EVGA', 'GeForce GTX 1660', 'SN345679', 'garantisiz', 'talha', 'Ali Bey', NULL, '', '', '', '', NULL, NULL, 'Problemli Ürün');
