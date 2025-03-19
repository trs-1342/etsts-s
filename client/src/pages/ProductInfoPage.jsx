import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/ProductInfo.css";

export default function ProductInfo() {
  const navigate = useNavigate();
  const { fishNo } = useParams();

  const [kayit, setKayit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState("");
  const [userRole, setUserRole] = useState(""); // Kullanıcı rolü için state
  const [isAuthorized, setIsAuthorized] = useState(false);
  const isMounted = useRef(true);
  const [userId, setUserId] = useState(null); // Initialize userId state

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          "http://192.168.0.201:2431/api/checkAdmin",
          {
            credentials: "include",
          }
        );
        if (response.ok) {
          const data = await response.json();
          setIsAuthorized(data.isAuthorized);
          setUserRole(data.role);
          setUserId(data.username); // Assuming the username is used as userId
          // console.log(data);
        } else {
          console.error("Yetki kontrolü başarısız");
        }
      } catch (error) {
        console.error("Yetki kontrolünde hata:", error.message);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchKayit = async () => {
      try {
        const response = await fetch(
          `http://192.168.0.201:2431/api/getInfoProd/${fishNo}`,
          { credentials: "include" }
        );

        if (!response.ok) {
          throw new Error(
            response.status === 404 ? "Kayıt bulunamadı" : "Sunucu hatası"
          );
        }

        const data = await response.json();
        if (isMounted.current) {
          setKayit(data.data);
        }
      } catch (error) {
        console.error("Kayıt getirme hatası:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchKayit();
  }, [fishNo]);

  useEffect(() => {
    const fetchPrinters = async () => {
      try {
        const response = await fetch("http://192.168.0.201:2431/api/printers");
        if (!response.ok) {
          throw new Error(`Sunucu hatası: ${response.status}`);
        }

        const data = await response.json();
        // console.log("Sunucudan gelen yazıcılar:", data.printers); // ✅ Kontrol için

        if (data.printers && Array.isArray(data.printers)) {
          // ✅ Yazıcı adını tam olarak aldığımızdan emin olmak için tırnak içine al
          setPrinters(data.printers);
          setSelectedPrinter(
            data.printers.length > 0 ? `"${data.printers[0]}"` : ""
          );
        } else {
          setPrinters([]);
        }
      } catch (error) {
        console.error("Yazıcıları alma hatası:", error);
      }
    };

    fetchPrinters();
  }, []);

  function formatDate(timestamp) {
    if (!timestamp) return "Bilinmiyor";

    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return "Geçersiz Tarih";

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");

    return `${day}-${month}-${year}_${hours}${minutes}${seconds}`;
  }

  async function handlePrint() {
    if (!kayit) return alert("Yazdırılacak kayıt bulunamadı.");
    if (!selectedPrinter) return alert("Lütfen bir yazıcı seçin!");

    const printData = {
      fishNo: kayit.fishNo,
      AdSoyad: kayit.AdSoyad,
      data: btoa(unescape(encodeURIComponent(JSON.stringify(kayit, null, 2)))),
      printerName: selectedPrinter,
      date: formatDate(Date.now()),
      TelNo: kayit.TelNo || "Belirtilmedi",
      Urun: kayit.Urun || "Belirtilmedi",
      Marka: kayit.Marka || "Belirtilmedi",
      Model: kayit.Model || "Belirtilmedi",
      SeriNo: kayit.SeriNo || "Belirtilmedi",
      GarantiDurumu: kayit.GarantiDurumu || "Belirtilmedi",
      Aciklama: kayit.Aciklama || "Belirtilmedi",
      sorunlar: kayit.Sorunlar || "Belirtilmedi",
      yapilanlar: kayit.Yapilanlar || "Belirtilmedi",
      ucret: kayit.Ucret || "0",
      altMetin: `
- 30 gün içinde alınmayan ürünlerden ve kisisel bilgilerin güvenliginden firmamız sorumlu degildir.
-Yapılan onarımların garanti süresi 3 aydır.
- Yapılan çalışmalar sonucunda arızanızın tespit edilmesine rağmen ürününüzü servisimizde onarmayı
tercih etmemeniz halinde 500 tl arıza tespit ücreti ödemeniz gerekecektir.`,
    };

    try {
      const response = await fetch("http://192.168.0.201:2431/api/print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(printData),
      });

      const result = await response.json();
      alert(
        result.success ? "Baskı başarılı!" : "Baskı sırasında hata oluştu."
      );
    } catch (error) {
      console.error("Baskı hatası:", error);
      alert("Yazıcıya bağlanırken hata oluştu.");
    }
  }

  const statusClassMap = {
    Onarılıyor: "onariliyor",
    Tamamlandı: "tamamlandi",
    Bekliyor: "bekliyor",
    "İade Edildi": "iade-edildi",
    "Teslim Edildi": "teslim-edildi",
    "Onay Bekliyor": "onay-bekliyor",
    "Yedek Parça Bekliyor": "yedek-parca",
    "Problemli Ürün": "problemli-urun",
    "Teslim Alınmadı": "teslim-alinmadi",
    Hazırlanıyor: "hazirlaniyor",
    "Arıza Tespiti": "ariza-tespiti",
    "Değişim Tamamlandı": "degisim-tamamlandi",
    Faturalandı: "faturalandi",
    "Garantili Onarım": "garantili-onarim",
    "Hurdaya Ayrıldı": "hurdaya-ayrildi",
    "İade Tamamlandı": "iade-tamamlandi",
    "İade Toplanıyor": "iade-toplaniyor",
    Kiralama: "kiralama",
    "Montaj Yapılacak": "montaj-yapilacak",
    "Onarım Aşamasında": "onarim-asamasinda",
    "Periyodik Bakım": "periyodik-bakim",
    "Satın Alındı": "satin-alindi",
    "Servis Durumu": "servis-durumu",
    "Sipariş Durumu": "siparis-durumu",
    default: "default-class",
  };

  // Duruma göre CSS sınıfı seç
  const durumClass = statusClassMap[kayit?.Durum] || statusClassMap["default"];

  return (
    <div className="container mt-4">
      <h1>Ürün Bilgileri</h1>

      {loading ? <p>Yükleniyor...</p> : null}

      {kayit ? (
        <>
          <table className="table table-bordered table-striped">
            <tbody>
              <tr>
                <th>Fiş No</th>
                <td>{kayit.fishNo}</td>
              </tr>
              <tr>
                <th>Ad Soyad</th>
                <td>{kayit.AdSoyad}</td>
              </tr>
              <tr>
                <th>Teslim Alma Tarihi</th>
                <td>{formatDate(kayit.TeslimAlmaTarihi) || "Bilinmiyor"}</td>
              </tr>
              <tr>
                <th>Telefon</th>
                <td>{kayit.TelNo}</td>
              </tr>
              <tr>
                <th>Ürün</th>
                <td>{kayit.Urun}</td>
              </tr>
              <tr>
                <th>Marka</th>
                <td>{kayit.Marka}</td>
              </tr>
              <tr>
                <th>Model</th>
                <td>{kayit.Model}</td>
              </tr>
              <tr>
                <th>Seri No</th>
                <td>{kayit.SeriNo}</td>
              </tr>
              <tr>
                <th>Garanti Durumu</th>
                <td>{kayit.GarantiDurumu}</td>
              </tr>
              <tr>
                <th>Sorunlar</th>
                <td>{kayit.Sorunlar}</td>
              </tr>
              <tr>
                <th>Açıklama</th>
                <td>{kayit.Aciklama}</td>
              </tr>
              <tr>
                <th>Durum</th>
                <td className={`fw-bold text-center ${durumClass}`}>
                  {kayit.Durum}
                </td>
              </tr>
              <tr>
                <th>Yedek Parça Durumu</th>
                <td>{kayit.YedekParcaDurumu || "Bilinmiyor"}</td>
              </tr>
              <tr>
                <th>Toplam Tutar</th>
                <td>{kayit.Ucret ? `${kayit.Ucret} TL` : "Bilinmiyor"}</td>
              </tr>
              <tr>
                <th>Açıklama</th>
                <td>{kayit.Aciklama || "Bilinmiyor"}</td>
              </tr>
            </tbody>
          </table>
          <div className="mb-3">
            <label className="form-label">Yazıcı Seçin:</label>
            <select
              className="form-select"
              value={selectedPrinter}
              onChange={(e) => setSelectedPrinter(e.target.value)}
            >
              {printers.length > 0 ? (
                printers.map((printer, index) => (
                  <option key={index} value={printer.name}>
                    ({printer.name}) ({printer.type})
                  </option>
                ))
              ) : (
                <option disabled>Bağlı yazıcı bulunamadı</option>
              )}
            </select>
          </div>

          <button
            onClick={async () => {
              const response = await fetch(
                "http://192.168.0.201:2431/api/xprint"
              );
              const printers = await response.json();
              console.log("İstemcideki Yazıcılar:", printers);
            }}
            className="btn btn-success"
          >
            Yazıcıları Tara
          </button>

          {isAuthorized && userRole === "admin" ? (
            <div className="text-center">
              <button
                className="btn btn-warning mx-2"
                onClick={() => navigate(`/record/${kayit.fishNo}`)}
              >
                Düzenle
              </button>
              <button
                className="btn btn-danger mx-2 ms-4"
                onClick={async () => {
                  const confirmDelete = window.confirm(
                    "Bu kaydı silmek istediğinize emin misiniz?"
                  );
                  if (confirmDelete) {
                    try {
                      const response = await fetch(
                        `http://192.168.0.201:2431/api/deleteProduct/${kayit.fishNo}`,
                        {
                          method: "DELETE",
                          credentials: "include",
                        }
                      );
                      if (response.ok) {
                        alert("Kayıt başarıyla silindi.");
                        navigate("/");
                      } else {
                        alert("Silme işlemi başarısız oldu.");
                      }
                    } catch (error) {
                      console.error(
                        "Silme işlemi sırasında hata:",
                        error.message
                      );
                    }
                  }
                }}
              >
                Sil
              </button>
            </div>
          ) : (
            <p>d</p>
          )}
          <button className="btn btn-primary" onClick={handlePrint}>
            Fiş ve PDF Oluştur ve Yazdır
          </button>
        </>
      ) : null}
    </div>
  );
}
