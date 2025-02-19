DROP DATABASE IF EXISTS ETSTSR;

CREATE DATABASE IF NOT EXISTS ETSTSR;
USE ETSTSR;

CREATE TABLE IF NOT EXISTS records (
    fishNo INT AUTO_INCREMENT PRIMARY KEY,
    AdSoyad VARCHAR(255),
    TelNo VARCHAR(11),
    TeslimAlan VARCHAR(255),
    Teknisyen VARCHAR(255),
    Durum VARCHAR(255) DEFAULT 'bekliyor',
    SeriNo VARCHAR(255),
    Urun VARCHAR(255),
    Marka VARCHAR(255),
    Model VARCHAR(255),
    GarantiDurumu VARCHAR(255),
    Sorunlar TEXT,
    Yapilanlar TEXT DEFAULT NULL,
    BirlikteAlinanlar TEXT DEFAULT NULL,
    Ucret DECIMAL(10,2) DEFAULT 0,
    HazirlamaTarihi DATE DEFAULT NULL,
    TeslimEtmeTarihi DATE DEFAULT NULL,
    Aciklama TEXT DEFAULT NULL
);

INSERT INTO records (AdSoyad, TelNo, TeslimAlan, Teknisyen, Durum, SeriNo, Urun, Marka, Model, GarantiDurumu, Sorunlar, BirlikteAlinanlar, Aciklama)
VALUES
('Ali Yılmaz', '5551234567', 'Ahmet Kaya', 'İbrahim Bey', 'Bekliyor', 'SN123456', 'Bilgisayar', 'ACER', 'Predator X34', 'Garantili', 'Anakart arızası', 'Şarj adaptörü', 'Parça siparişi bekleniyor'),

('Fatma Demir', '5549876543', 'Zeynep Çelik', 'Emre Bey', 'Onay Bekliyor', 'SN654321', 'Laptop', 'ASUS', 'ROG Zephyrus', 'Garantisiz', 'Fan gürültülü çalışıyor', NULL, 'Temizlik sonrası test ediliyor'),

('Mehmet Aydın', '5321122334', 'Kemal Yılmaz', 'Halil Bey', 'Yedek Parça', 'SN789123', 'Kasa', 'COOLER MASTER', 'H500', 'Sözleşmeli', 'USB portları çalışmıyor', 'Güç kablosu', 'Yeni USB modülü bekleniyor'),

('Ayşe Kaya', '5304445566', 'Emre Tunç', 'Talha Bey', 'Onarılıyor', 'SN321987', 'Ekran Kartı', 'MSI', 'RTX 3080', 'Garantili', 'Ekran görüntüsü yok', NULL, 'Test aşamasında'),

('Mustafa Çelik', '5355678899', 'Burak Aslan', 'Mehmet Bey', 'Tamamlandı', 'SN456654', 'Yazıcı', 'CANON', 'PIXMA TR4520', 'Garantisiz', 'Kağıt sıkışması', 'USB kablo', 'Teslimata hazır'),

('Elif Taş', '5399988776', 'Merve Soylu', 'İbrahim Bey', 'Teslim Edildi', 'SN159357', 'Bilgisayar', 'LENOVO', 'ThinkPad X1', 'Belirsiz', 'Klavye çalışmıyor', NULL, 'Teslim edildi, memnuniyet sağlandı'),

('Ahmet Yıldırım', '5312345678', 'Selin Gül', 'Emre Bey', 'Problemli Ürün', 'SN753951', 'Laptop', 'APPLE', 'MacBook Air M2', 'Sözleşmeli', 'Batarya şişmesi', 'Şarj cihazı', 'İade önerildi'),

('Zeynep Çiçek', '5338765432', 'Ali Tan', 'Halil Bey', 'İade Edildi', 'SN852456', 'Kasa', 'NZXT', 'H510 Elite', 'Garantisiz', 'LED ışıklar yanmıyor', NULL, 'Müşteri ücreti geri aldı'),

('Burak Öz', '5376655443', 'Sevim Arslan', 'Talha Bey', 'Teslim Alınmadı', 'SN963258', 'Ekran Kartı', 'GIGABYTE', 'RTX 3070 Ti', 'Garantili', 'Fan çalışmıyor', NULL, 'Müşteriye ulaşılamıyor'),

('Merve Akın', '5341122334', 'Berkay Demir', 'Mehmet Bey', 'Tamamlandı', 'SN741852', 'Yazıcı', 'BROTHER', 'HL-L2350DW', 'Belirsiz', 'Kağıt beslemesi yapılmıyor', 'Ekstra toner', 'Teslim edildi');
