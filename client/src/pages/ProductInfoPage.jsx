import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/ProductInfo.css";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";

function formatDate(tarih) {
  if (!tarih) return "Bilinmiyor";

  const d = new Date(tarih);
  if (isNaN(d.getTime())) return "Geçersiz Tarih";

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export default function ProductInfo() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { fishNo } = useParams();
  const [kayit, setKayit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState(""); // Kullanıcı rolü için state
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState("");
  const [showPrintDialog, setShowPrintDialog] = useState(false);

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const response = await fetch("http://192.168.0.201:2431/api/printers");
  //       if (!response.ok) throw new Error("Yazıcı listesi alınamadı");

  //       const data = await response.json();
  //       if (!Array.isArray(data) || data.length === 0) {
  //         console.warn("⚠️ Bağlı yazıcı bulunamadı");
  //         setPrinters([]);
  //       } else {
  //         setPrinters(data);
  //         setSelectedPrinter(data[0]);
  //       }
  //     } catch (error) {
  //       console.error("Yazıcıları tarama hatası:", error);
  //     }
  //   })();
  // }, []);

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const response = await fetch(
          `http://192.168.0.201:2431/api/check-product-access/${fishNo}`,
          {
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setIsAuthorized(data.isAuthorized);
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error("Yetki kontrolünde hata:", error);
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthorization();
  }, [fishNo]);

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
          setIsAuthorized(data.isAuthorized); // Yetki bilgisini ayarla
          setUserRole(data.role); // Kullanıcı rolünü ayarla
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
    const fetchkayit = async () => {
      try {
        const response = await fetch(
          `http://192.168.0.201:2431/api/getInfoProd/${fishNo}`,
          {
            credentials: "include",
          }
        );
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Kayıt bulunamadı");
          } else {
            throw new Error("Sunucu hatası");
          }
        }

        const data = await response.json();
        setKayit(data.data);
      } catch (error) {
        console.error("Kayıt getirme hatası:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchkayit();
  }, [fishNo]);

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  if (!kayit) {
    return (
      <>
        <div className="container mt-4 bg-danger text-white fs-4 fw-bold">
          <p>Kayıt bulunamadı</p>
          <a href="/" className="btn btn-success">
            Anasayfaya Git
          </a>
        </div>
      </>
    );
  }

  // Durumlara özel sınıflar
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
    // Varsayılan bir sınıf tanımlanabilir
    default: "default-class",
  };

  // Duruma göre sınıf seçimi
  const durumClass = statusClassMap[kayit.Durum] || statusClassMap["default"];

  // if (!isAuthorized) {
  //   navigate("/you-cant-see");
  //   return null;
  // }

  const handleRecord = async () => {
    if (!kayit) {
      alert("Yazdırılacak kayıt bulunamadı.");
      return;
    }

    const printData = `
      Fiş No: ${kayit.fishNo}
      Tarihi: ${formatDate(kayit.TeslimAlmaTarihi)}
      Ad Soyad: ${kayit.AdSoyad}
      Teslim Alma Tarihi: ${formatDate(kayit.TeslimAlmaTarihi)}
      Telefon: ${kayit.TelNo}
      Ürün: ${kayit.Urun}
      Marka: ${kayit.Marka}
      Model: ${kayit.Model}
      Seri No: ${kayit.SeriNo}
      Garanti Durumu: ${kayit.GarantiDurumu}
      Sorunlar: ${kayit.Sorunlar}
      Açıklama ${kayit.Aciklama || ""}
      \n
      - 30 gün içerisinde alınmayan ürünlerden ve kişisel bilgilerin güvenliğinden firmamız sorumlu değildir.
      - Yapılan onarımların garanti süresi 3 aydır.
      - Yapılan çalışmalar sonucunda arızanızın tespit edilmesine rağmen ürününüzün servisimizde onarmayı tercih etmemeniz halinde 500 tl arıza tespit parası ödenir.
    `;

    // Türkçe karakterleri korumak için Base64 kodlaması kullanıyoruz
    const encodedData = btoa(unescape(encodeURIComponent(printData)));

    try {
      const response = await fetch("http://192.168.0.201:2431/print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: encodedData, // Base64 olarak gönderiliyor
          fishNo: kayit.fishNo,
          AdSoyad: kayit.AdSoyad,
        }),
      });

      if (response.ok) {
        alert(
          "Baskı başarılı, PDF Dosyası Desktop/enigma-pdfs/ yolunda oluşturuldu."
        );
      } else {
        alert("Baskı sırasında hata oluştu.");
      }
    } catch (error) {
      console.error("Baskı hatası:", error);
      alert("Yazıcıya bağlanırken hata oluştu.");
    }
  };

  // const handleShowPrintDialog = () => setShowPrintDialog(true);

  // const handlePrint = async () => {
  //   if (!selectedPrinter) return alert("Lütfen bir yazıcı seçin");
  //   try {
  //     const response = await fetch("http://192.168.0.201:2431/api/print", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         printerName: selectedPrinter,
  //         data: btoa(unescape(encodeURIComponent(JSON.stringify(kayit)))),
  //         fishNo: kayit.fishNo,
  //         AdSoyad: kayit.AdSoyad,
  //       }),
  //     });
  //     alert(response.ok ? "Baskı başarılı" : "Baskı sırasında hata oluştu");
  //   } catch (error) {
  //     console.error("Baskı hatası:", error);
  //     alert("Yazıcıya bağlanırken hata oluştu");
  //   }
  // };

  return (
    <div className="container mt-4">
      <div className="row g-0 text-center">
        <div className="col-sm-6 col-md-8">
          <h1 className="text-start mb-4">Ürün Bilgileri</h1>
        </div>
        <div className="col-6 col-md-4 text-end">
          <button className="btn btn-success" onClick={() => navigate("/")}>
            Anasayfa
          </button>
        </div>
      </div>
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

      {isAuthorized && userRole === "admin" ? (
        <div className="text-center">
          {/* <button className="btn btn-primary" onClick={() => handleRecord()}>
            Fiş ve PDF Oluştur
          </button> */}
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
                  console.error("Silme işlemi sırasında hata:", error.message);
                }
              }
            }}
          >
            Sil
          </button>
          <button className="btn btn-primary" onClick={handleRecord}>
            Fiş ve PDF Oluştur
          </button>
          {/* {showPrintDialog && (
            <div className="card p-3 mt-3">
              <h3>Bağlı Yazıcılar</h3>
              {printers.length > 0 ? (
                printers.map((printer, index) => (
                  <div key={index} className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="printer"
                      value={printer}
                      checked={selectedPrinter === printer}
                      onChange={() => setSelectedPrinter(printer)}
                    />
                    <label className="form-check-label">{printer}</label>
                  </div>
                ))
              ) : (
                <p className="text-danger">⚠️ Bağlı yazıcı bulunamadı</p>
              )}
              <button className="btn btn-success mt-3" onClick={handlePrint} disabled={printers.length === 0}>
                Yazdır
              </button>
            </div>
          )} */}
        </div>
      ) : null}
    </div>
  );
}
