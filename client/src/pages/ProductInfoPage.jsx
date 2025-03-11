// import React, {
//   useEffect,
//   useState,
//   useContext,
//   useRef,
//   useCallback,
// } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "../css/ProductInfo.css";
// export default function ProductInfo() {
//   const { user } = useUser();
//   const navigate = useNavigate();
//   const { fishNo } = useParams();

//   // ✅ Tüm Hooks'ları en üstte çağır
//   const [kayit, setKayit] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [userRole, setUserRole] = useState(""); // Kullanıcı rolü için state
//   const [isAuthorized, setIsAuthorized] = useState(false);
//   const [printers, setPrinters] = useState([]);
//   const [selectedPrinter, setSelectedPrinter] = useState("");
//   const [showPrintDialog, setShowPrintDialog] = useState(false);
//   const isMounted = useRef(true);

//   useEffect(() => {
//     isMounted.current = true;
//     return () => {
//       isMounted.current = false;
//     };
//   }, []);

//   useEffect(() => {
//     const checkAuthorization = async () => {
//       try {
//         const response = await fetch(
//           `http://192.168.0.201:2431/api/check-product-access/${fishNo}`,
//           {
//             credentials: "include",
//           }
//         );

//         if (response.ok) {
//           const data = await response.json();
//           setIsAuthorized(data.isAuthorized);
//         } else {
//           setIsAuthorized(false);
//         }
//       } catch (error) {
//         console.error("Yetki kontrolünde hata:", error);
//         setIsAuthorized(false);
//       } finally {
//         setLoading(false);
//       }
//     };

//     checkAuthorization();
//   }, [fishNo]);

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const response = await fetch(
//           "http://192.168.0.201:2431/api/checkAdmin",
//           {
//             credentials: "include",
//           }
//         );

//         if (response.ok) {
//           const data = await response.json();
//           setIsAuthorized(data.isAuthorized); // Yetki bilgisini ayarla
//           setUserRole(data.role); // Kullanıcı rolünü ayarla
//         } else {
//           console.error("Yetki kontrolü başarısız");
//         }
//       } catch (error) {
//         console.error("Yetki kontrolünde hata:", error.message);
//       }
//     };

//     fetchUser();
//   }, []);

//   useEffect(() => {
//     const fetchkayit = async () => {
//       try {
//         const response = await fetch(
//           `http://192.168.0.201:2431/api/getInfoProd/${fishNo}`,
//           {
//             credentials: "include",
//           }
//         );
//         if (!response.ok) {
//           if (response.status === 404) {
//             throw new Error("Kayıt bulunamadı");
//           } else {
//             throw new Error("Sunucu hatası");
//           }
//         }

//         const data = await response.json();
//         setKayit(data.data);
//       } catch (error) {
//         console.error("Kayıt getirme hatası:", error.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchkayit();
//   }, [fishNo]);

//   if (loading) {
//     return <div>Yükleniyor...</div>;
//   }

//   if (!kayit) {
//     return (
//       <>
//         <div className="container mt-4 bg-danger text-white fs-4 fw-bold">
//           <p>Kayıt bulunamadı</p>
//           <a href="/" className="btn btn-success">
//             Anasayfaya Git
//           </a>
//         </div>
//       </>
//     );
//   }

//   // Durumlara özel sınıflar
//   const statusClassMap = {
//     Onarılıyor: "onariliyor",
//     Tamamlandı: "tamamlandi",
//     Bekliyor: "bekliyor",
//     "İade Edildi": "iade-edildi",
//     "Teslim Edildi": "teslim-edildi",
//     "Onay Bekliyor": "onay-bekliyor",
//     "Yedek Parça Bekliyor": "yedek-parca",
//     "Problemli Ürün": "problemli-urun",
//     "Teslim Alınmadı": "teslim-alinmadi",
//     Hazırlanıyor: "hazirlaniyor",
//     "Arıza Tespiti": "ariza-tespiti",
//     "Değişim Tamamlandı": "degisim-tamamlandi",
//     Faturalandı: "faturalandi",
//     "Garantili Onarım": "garantili-onarim",
//     "Hurdaya Ayrıldı": "hurdaya-ayrildi",
//     "İade Tamamlandı": "iade-tamamlandi",
//     "İade Toplanıyor": "iade-toplaniyor",
//     Kiralama: "kiralama",
//     "Montaj Yapılacak": "montaj-yapilacak",
//     "Onarım Aşamasında": "onarim-asamasinda",
//     "Periyodik Bakım": "periyodik-bakim",
//     "Satın Alındı": "satin-alindi",
//     "Servis Durumu": "servis-durumu",
//     "Sipariş Durumu": "siparis-durumu",
//     // Varsayılan bir sınıf tanımlanabilir
//     default: "default-class",
//   };

//   // Duruma göre sınıf seçimi

//   useEffect(() => {
//     const fetchPrinters = async () => {
//       try {
//         const response = await fetch("http://192.168.0.201:2431/api/printers");
//         const data = await response.json();
//         if (data.printers) {
//           setPrinters(data.printers);
//           setSelectedPrinter(data.printers[0]); // Varsayılan olarak ilk yazıcıyı seç
//         }
//       } catch (error) {
//         console.error("Yazıcıları alma hatası:", error);
//       }
//     };
//     fetchPrinters();
//   }, []);

//   useEffect(() => {
//     const fetchkayit = async () => {
//       try {
//         const response = await fetch(
//           `http://192.168.0.201:2431/api/getInfoProd/${fishNo}`,
//           {
//             credentials: "include",
//           }
//         );
//         if (!response.ok) {
//           throw new Error(
//             response.status === 404 ? "Kayıt bulunamadı" : "Sunucu hatası"
//           );
//         }
//         const data = await response.json();
//         if (isMounted.current) {
//           setKayit(data.data);
//           setLoading(false);
//         }
//       } catch (error) {
//         console.error("Kayıt getirme hatası:", error.message);
//         if (isMounted.current) setLoading(false);
//       }
//     };
//     fetchkayit();
//   }, [fishNo]);

//   const handleRecord = async () => {
//     if (!kayit) {
//       alert("Yazdırılacak kayıt bulunamadı.");
//       return;
//     }
//     if (!selectedPrinter) {
//       alert("Lütfen bir yazıcı seçin!");
//       return;
//     }

//     const printData = `
//       Fiş No: ${kayit.fishNo}
//       Tarihi: ${kayit.TeslimAlmaTarihi}
//       Ad Soyad: ${kayit.AdSoyad}
//       Telefon: ${kayit.TelNo}
//       Ürün: ${kayit.Urun}
//       Marka: ${kayit.Marka}
//       Model: ${kayit.Model}
//       Seri No: ${kayit.SeriNo}
//       Garanti Durumu: ${kayit.GarantiDurumu}
//       Sorunlar: ${kayit.Sorunlar}
//       Açıklama: ${kayit.Aciklama || ""}
//       Birlikte Alınanlar: ${kayit.BirlikteAlinanlar || ""}

//       - 30 gün içinde alınmayan ürünlerden firmamız sorumlu değildir.
//       - Yapılan onarımlar 3 ay garantilidir.
//       - Onarım reddedilirse 500 TL arıza tespit ücreti ödenir.
//     `;

//     try {
//       const response = await fetch("http://localhost:2431/print", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           data: btoa(unescape(encodeURIComponent(printData))),
//           fishNo: kayit.fishNo,
//           AdSoyad: kayit.AdSoyad,
//           printerName: selectedPrinter,
//         }),
//       });

//       const result = await response.json();
//       if (result.message) {
//         alert(`Baskı başarılı! Yazıcı: ${selectedPrinter}`);
//       } else {
//         alert("Baskı sırasında hata oluştu.");
//       }
//     } catch (error) {
//       console.error("Baskı hatası:", error);
//       alert("Yazıcıya bağlanırken hata oluştu.");
//     }
//   };

//   return (
//     <div className="container mt-4">
//       <div className="row g-0 text-center">
//         <div className="col-sm-6 col-md-8">
//           <h1 className="text-start mb-4">Ürün Bilgileri</h1>
//         </div>
//         <div className="col-6 col-md-4 text-end">
//           <button className="btn btn-success" onClick={() => navigate("/")}>
//             Anasayfa
//           </button>
//         </div>
//       </div>
//       <table className="table table-bordered table-striped">
//         <tbody>
//           <tr>
//             <th>Fiş No</th>
//             <td>{kayit.fishNo}</td>
//           </tr>
//           <tr>
//             <th>Ad Soyad</th>
//             <td>{kayit.AdSoyad}</td>
//           </tr>
//           <tr>
//             <th>Teslim Alma Tarihi</th>
//             <td>{formatDate(kayit.TeslimAlmaTarihi) || "Bilinmiyor"}</td>
//           </tr>
//           <tr>
//             <th>Telefon</th>
//             <td>{kayit.TelNo}</td>
//           </tr>
//           <tr>
//             <th>Ürün</th>
//             <td>{kayit.Urun}</td>
//           </tr>
//           <tr>
//             <th>Marka</th>
//             <td>{kayit.Marka}</td>
//           </tr>
//           <tr>
//             <th>Model</th>
//             <td>{kayit.Model}</td>
//           </tr>
//           <tr>
//             <th>Seri No</th>
//             <td>{kayit.SeriNo}</td>
//           </tr>
//           <tr>
//             <th>Garanti Durumu</th>
//             <td>{kayit.GarantiDurumu}</td>
//           </tr>
//           <tr>
//             <th>Sorunlar</th>
//             <td>{kayit.Sorunlar}</td>
//           </tr>
//           <tr>
//             <th>Açıklama</th>
//             <td>{kayit.Aciklama}</td>
//           </tr>
//           <tr>
//             <th>Durum</th>
//             <td className={`fw-bold text-center ${durumClass}`}>
//               {kayit.Durum}
//             </td>
//           </tr>
//           <tr>
//             <th>Yedek Parça Durumu</th>
//             <td>{kayit.YedekParcaDurumu || "Bilinmiyor"}</td>
//           </tr>
//           <tr>
//             <th>Toplam Tutar</th>
//             <td>{kayit.Ucret ? `${kayit.Ucret} TL` : "Bilinmiyor"}</td>
//           </tr>
//           <tr>
//             <th>Açıklama</th>
//             <td>{kayit.Aciklama || "Bilinmiyor"}</td>
//           </tr>
//         </tbody>
//       </table>

//       {isAuthorized && userRole === "admin" ? (
//         <div className="text-center">
//           <button
//             className="btn btn-warning mx-2"
//             onClick={() => navigate(`/record/${kayit.fishNo}`)}
//           >
//             Düzenle
//           </button>
//           <button
//             className="btn btn-danger mx-2 ms-4"
//             onClick={async () => {
//               const confirmDelete = window.confirm(
//                 "Bu kaydı silmek istediğinize emin misiniz?"
//               );
//               if (confirmDelete) {
//                 try {
//                   const response = await fetch(
//                     `http://192.168.0.201:2431/api/deleteProduct/${kayit.fishNo}`,
//                     {
//                       method: "DELETE",
//                       credentials: "include",
//                     }
//                   );
//                   if (response.ok) {
//                     alert("Kayıt başarıyla silindi.");
//                     navigate("/");
//                   } else {
//                     alert("Silme işlemi başarısız oldu.");
//                   }
//                 } catch (error) {
//                   console.error("Silme işlemi sırasında hata:", error.message);
//                 }
//               }
//             }}
//           >
//             Sil
//           </button>
//           <button className="btn btn-primary" onClick={handleRecord}>
//             Fiş ve PDF Oluştur
//           </button>

//           <div className="mb-3">
//             <label className="form-label">Yazıcı Seçin:</label>
//             <select
//               className="form-select"
//               value={selectedPrinter}
//               onChange={(e) => setSelectedPrinter(e.target.value)}
//             >
//               {printers.length > 0 ? (
//                 printers.map((printer, index) => (
//                   <option key={index} value={printer}>
//                     {printer}
//                   </option>
//                 ))
//               ) : (
//                 <option>Yazıcı bulunamadı</option>
//               )}
//             </select>
//           </div>
//         </div>
//       ) : null}
//     </div>
//   );
// }

import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/ProductInfo.css";
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
  const [userRole, setUserRole] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState("");
  const isMounted = useRef(true);

  // ✅ Component mount durumunu takip et
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // ✅ Kullanıcı yetkilendirme kontrolü
  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const response = await fetch(
          `http://192.168.0.201:2431/api/check-product-access/${fishNo}`,
          { credentials: "include" }
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
      }
    };

    checkAuthorization();
  }, [fishNo]);

  // ✅ Kullanıcı bilgilerini getir ve admin olup olmadığını kontrol et
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          "http://192.168.0.201:2431/api/checkAdmin",
          { credentials: "include" }
        );

        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.isAuthorized);
          setUserRole(data.role);
        } else {
          console.error("Yetki kontrolü başarısız");
        }
      } catch (error) {
        console.error("Yetki kontrolünde hata:", error.message);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {}, [isAdmin, userRole]);

  // ✅ Kayıt bilgilerini getir
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
        if (!response.ok) throw new Error("Sunucu hatası");
        const data = await response.json();
        console.log("Printer data:", data); // Bu satırı ekle
        if (data.printers) {
          setPrinters(data.printers);
          setSelectedPrinter(data.printers[0]);
        }
      } catch (error) {
        console.error("Yazıcıları alma hatası:", error);
      }
    };
    fetchPrinters();
  }, []);

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
    default: "default-class",
  };

  // Duruma göre CSS sınıfı seç
  const durumClass = statusClassMap[kayit?.Durum] || statusClassMap["default"];

  const handleRecord = async () => {
    if (!kayit) {
      alert("Yazdırılacak kayıt bulunamadı.");
      return;
    }
    if (!selectedPrinter) {
      alert("Lütfen bir yazıcı seçin!");
      return;
    }

    const printData = `
      Fiş No: ${kayit.fishNo}
      Tarihi: ${kayit.TeslimAlmaTarihi}
      Ad Soyad: ${kayit.AdSoyad}
      Telefon: ${kayit.TelNo}
      Ürün: ${kayit.Urun}
      Marka: ${kayit.Marka}
      Model: ${kayit.Model}
      Seri No: ${kayit.SeriNo}
      Garanti Durumu: ${kayit.GarantiDurumu}
      Sorunlar: ${kayit.Sorunlar}
      Açıklama: ${kayit.Aciklama || ""}
      Birlikte Alınanlar: ${kayit.BirlikteAlinanlar || ""}

      - 30 gün içinde alınmayan ürünlerden firmamız sorumlu değildir.
      - Yapılan onarımlar 3 ay garantilidir.
      - Onarım reddedilirse 500 TL arıza tespit ücreti ödenir.
    `;

    try {
      const response = await fetch("http://192.168.0.201:1342/print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: btoa(unescape(encodeURIComponent(printData))),
          fishNo: kayit.fishNo,
          AdSoyad: kayit.AdSoyad,
          printerName: selectedPrinter,
        }),
      });

      const result = await response.json();
      if (result.message) {
        alert(`Baskı başarılı! Yazıcı: ${selectedPrinter}`);
      } else {
        alert("Baskı sırasında hata oluştu.");
      }
    } catch (error) {
      console.error("Baskı hatası:", error);
      alert("Yazıcıya bağlanırken hata oluştu.");
    }
  };

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
                  <option key={index} value={printer}>
                    {printer}
                  </option>
                ))
              ) : (
                <option disabled>Yazıcı bulunamadı</option>
              )}
            </select>
          </div>

          {isAdmin ? (
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
          ) : null}

          <button className="btn btn-primary" onClick={handleRecord}>
            Fiş ve PDF Oluştur
          </button>
        </>
      ) : (
        <p>Kayıt bulunamadı.</p>
      )}
    </div>
  );
}
