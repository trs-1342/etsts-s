-- Veritabanı sil
DROP DATABASE IF EXISTS ETSTS;

-- Veritabanı oluştur (eğer yoksa)
CREATE DATABASE IF NOT EXISTS ETSTS;
USE ETSTS;

-- Tabloyu sil
DROP TABLE IF EXISTS Kayitlar;

-- Tabloyu oluştur (eğer yoksa)
CREATE TABLE IF NOT EXISTS Kayitlar (
    fishNo INT AUTO_INCREMENT PRIMARY KEY,
    AdSoyad VARCHAR(255),
    SeriNo VARCHAR(255),
    TeslimAlan VARCHAR(255),
    Telefon VARCHAR(15),
    Durumu VARCHAR(255),
    Teknisyen VARCHAR(255),
    TeslimAlmaZamani VARCHAR(255),
    Urun VARCHAR(255),
    Marka VARCHAR(255),
    Model VARCHAR(255),
    GarantiDurumu VARCHAR(255),
    Sorunlar TEXT,
    Yapilanlar TEXT DEFAULT(''),
    BirlikteAlinanlar TEXT,
    Ucret DECIMAL(10,2) NOT NULL,
    HazirlamaTarihi DATE DEFAULT(''),
    TeslimEtmeTarihi DATE DEFAULT(''),
    Aciklama TEXT
);

-- Tablo içindeki tüm verileri sil
DELETE FROM Kayitlar;
DROP TABLE Kayirlar;
DROP DATABASE etsts;

-- Tüm verileri kontrol et
SELECT * FROM etsts.kayitlar;
SELECT * FROM etsts.users;

INSERT INTO Kayitlar (
    AdSoyad, SeriNo, TeslimAlan, Telefon, Durumu, Teknisyen, 
    TeslimAlmaZamani, Urun, Marka, Model, GarantiDurumu, 
    Sorunlar, BirlikteAlinanlar, Ucret, HazirlamaTarihi, TeslimEtmeTarihi, Aciklama
) 
VALUES 
('Ali Yılmaz', 'SN123456', 'Ahmet Kaya', '05551234567', 'Bekliyor', 'Teknisyen1', 
 '2024-01-01 10:00', 'Laptop', 'ASUS', 'ZenBook', 'Garantili', 
 'Ekran kırık', 'Şarj cihazı', 1500.50, NULL, NULL, ''),

('Ayşe Demir', 'SN654321', 'Fatma Korkmaz', '05559876543', 'Onay Bekliyor', 'Teknisyen2', 
 '2024-01-02 11:30', 'Bilgisayar', 'HP', 'Pavilion', 'Garantisiz', 
 'Fan sorunu', 'Yedek fan', 2000.00, NULL, NULL, ''),

('Mehmet Çelik', 'SN987654', 'Emre Demir', '05553456789', 'Onarılıyor', 'Teknisyen3', 
 '2024-01-03 09:45', 'Yazıcı', 'Canon', 'LBP2900', 'Sözleşmeli', 
 'Kağıt sıkışması', NULL, 800.75, NULL, NULL, ''),

('Elif Kılıç', 'SN345678', 'Zeynep Öztürk', '05557654321', 'Tamamlandı', 'Teknisyen4', 
 '2024-01-04 15:20', 'Telefon', 'Samsung', 'Galaxy S21', 'Garantili', 
 'Batarya sorunu', 'Ekran koruyucu', 3000.00, NULL, NULL, ''),

('Ahmet Koç', 'SN567890', 'Hüseyin Kaya', '05550123456', 'Teslim Edildi', 'Teknisyen5', 
 '2024-01-05 14:10', 'Ekran Kartı', 'MSI', 'RTX 3080', 'Garantili', 
 'Görüntü yok', NULL, 5000.25, NULL, NULL, ''),

('Fatma Yıldız', 'SN112233', 'Merve Taş', '05558889900', 'Problemli Ürün', 'Teknisyen1', 
 '2024-01-06 08:30', 'Kasa', 'NZXT', 'H510', 'Garantisiz', 
 'USB port çalışmıyor', NULL, 1200.00, NULL, NULL, ''),

('Emre Gül', 'SN445566', 'Ali Toprak', '05557778899', 'Yedek Parça', 'Teknisyen2', 
 '2024-01-07 13:50', 'Laptop', 'Lenovo', 'ThinkPad X1', 'Sözleşmeli', 
 'Ses çıkışı yok', 'USB adaptör', 2500.00, NULL, NULL, ''),

('Zeynep Arslan', 'SN778899', 'Serkan Demir', '05556667788', 'İade Edildi', 'Teknisyen3', 
 '2024-01-08 12:15', 'Yazıcı', 'Brother', 'HL-L2320', 'Garantili', 
 'Bağlantı hatası', 'Yazıcı kablosu', 700.50, NULL, NULL, ''),

('Hakan Yavuz', 'SN889900', 'Ayşe Tekin', '05555555666', 'Teslim Alınmadı', 'Teknisyen4', 
 '2024-01-09 10:45', 'Telefon', 'Apple', 'iPhone 13', 'Garantili', 
 'Hoparlör çalışmıyor', NULL, 4000.75, NULL, NULL, ''),

('Burak Özkan', 'SN990011', 'Selin Kaya', '05554443322', 'Bekliyor', 'Teknisyen5', 
 '2024-01-10 09:15', 'Bilgisayar', 'Dell', 'Inspiron 15', 'Garantisiz', 
 'Anakart arızası', NULL, 1800.00, NULL, NULL, '');
