import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import * as XLSX from "xlsx";
import { FaBars, FaTimes, FaArchive } from "react-icons/fa";
import { IoHome } from "react-icons/io5";
import { IoMdLogOut } from "react-icons/io";
import { IoSettingsSharp } from "react-icons/io5";
import { MdEditSquare } from "react-icons/md";
import "../css/HomePage.css";
import usePageAccess from "./usePageAccess";
// import { FaSortUp, FaSortDown } from "react-icons/fa"; // İkonları ekledik
// import SidePanel from "./SidePanelCom.jsx"
// import axios from "axios";

function formatTarihVeSaat(tarih) {
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

export default function HomePage() {
  const { hasAccess, loading } = usePageAccess("HomePage");

  //

  const navigate = useNavigate();
  const [kayitlar, setKayitlar] = useState([]);
  const [filtre, setFiltre] = useState("Hepsi");
  const [garantiFiltre, setGarantiFiltre] = useState("Hepsi");
  const [filtreTarihi, setFiltreTarihi] = useState("");
  const [acikDetaylar, setAcikDetaylar] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [isToolsPanelOpen, setIsToolsPanelOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [role, setRole] = useState("");
  const [userRole, setUserRole] = useState(""); // Kullanıcı rolü için state
  const [allowedColumns, setAllowedColumns] = useState([]);
  const [userId, setUserId] = useState(null); // Initialize userId state
  const [userData, setUserData] = useState(null);

  // Check if the user is authorized and set userId
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

  // useEffect(() => {
  //   const fetchRecords = async () => {
  //     try {
  //       const response = await fetch("http://192.168.0.201:2431/api/records", {
  //         credentials: "include",
  //       });
  //       if (!response.ok) throw new Error("Yetkisiz erişim!");

  //       const data = await response.json();
  //       setKayitlar(data.data);
  //     } catch (error) {
  //       console.error("Kayıtları getirirken hata:", error.message);
  //     }
  //   };

  //   fetchRecords();
  // }, [isAuthorized]);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await fetch("http://192.168.0.201:2431/api/records", {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Yetkisiz erişim!");

        const data = await response.json();

        // API'den gelen verileri teslim alma tarihine göre sıralayarak setKayitlar'a aktarıyoruz
        const sortedData = [...data.data].sort((a, b) => {
          if (!a.TeslimAlmaTarihi) return 1;
          if (!b.TeslimAlmaTarihi) return -1;

          const dateA = parseDateString(a.TeslimAlmaTarihi);
          const dateB = parseDateString(b.TeslimAlmaTarihi);
          if (!dateA) return 1;
          if (!dateB) return -1;

          return dateB - dateA; // En yeni en üste olacak şekilde sıralama
        });

        setKayitlar(sortedData);
      } catch (error) {
        console.error("Kayıtları getirirken hata:", error.message);
      }
    };

    fetchRecords();
  }, [isAuthorized]); // API çağrısı tamamlandıktan sonra çalışır.


  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const results = kayitlar.filter(
      (kayit) =>
        kayit.AdSoyad?.toLowerCase().includes(term) ||
        kayit.Urun?.toLowerCase().includes(term) ||
        kayit.Marka?.toLowerCase().includes(term) ||
        kayit.Model?.toLowerCase().includes(term) ||
        kayit.GarantiDurumu?.toLowerCase().includes(term) ||
        kayit.Sorunlar?.toLowerCase().includes(term) ||
        kayit.Yapilanlar?.toLowerCase().includes(term) ||
        kayit.BirlikteAlinanlar?.toLowerCase().includes(term) ||
        kayit.Aciklama?.toLowerCase().includes(term) ||
        kayit.TelNo?.toLowerCase().includes(term) ||
        kayit.SeriNo?.toLowerCase().includes(term) ||
        kayit.Teknisyen?.toLowerCase().includes(term) ||
        kayit.Durum?.toLowerCase().includes(term) ||
        kayit.TeslimAlmaTarihi?.toLowerCase().includes(term) ||
        kayit.TeslimEtmeTarihi?.toLowerCase().includes(term) ||
        kayit.HazirlamaTarihi?.toLowerCase().includes(term) ||
        kayit.TeslimAlan?.toLowerCase().includes(term)
    );

    setFilteredResults(results);
  };

  const filtrelenmisKayitlar = (kayitlar || []).filter((kayit) => {
    const durumUygun = filtre === "Hepsi" || kayit.Durum === filtre;
    const garantiUygun =
      garantiFiltre === "Hepsi" || kayit.GarantiDurumu === garantiFiltre;
    const tarihUygun =
      !filtreTarihi ||
      (kayit.TeslimAlmaTarihi &&
        kayit.TeslimAlmaTarihi.startsWith(filtreTarihi));

    return durumUygun && garantiUygun && tarihUygun;
  });

  const toggleDetay = (index) => {
    setAcikDetaylar((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  function parseDateString(dateString) {
    // Örnek dateString: "10/01/2025 10:30"
    // Boşluğa göre ayır ("10/01/2025" ve "10:30")
    const [datePart, timePart] = dateString.split(" ");
    if (!datePart || !timePart) return null;

    const [day, month, year] = datePart.split("/").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);

    // new Date(yıl, ayIndex, gün, saat, dakika)
    // Dikkat: JavaScript'te ay 0-index'li (0 = Ocak, 1 = Şubat...)
    return new Date(year, month - 1, day, hour, minute);
  }

  useEffect(() => {
    // Varsayılanı "TeslimAlmaTarihi"ne göre desc olarak ayarla
    setSortConfig({ key: "TeslimAlmaTarihi", direction: "desc" });

    // Sonra da kayitlar'ı yeniden düzenle
    const sorted = [...kayitlar].sort((a, b) => {
      if (!a.TeslimAlmaTarihi) return 1;
      if (!b.TeslimAlmaTarihi) return -1;

      const dateA = parseDateString(a.TeslimAlmaTarihi);
      const dateB = parseDateString(b.TeslimAlmaTarihi);
      if (!dateA) return 1;
      if (!dateB) return -1;

      // desc: yeni tarih önce gelsin
      return dateB - dateA;
    });
    setKayitlar(sorted);
    // eslint-disable-next-line
  }, []);


  // const sortData = (key) => {
  //   let direction = "asc";

  //   // Aynı key'e tıklandıkça asc/desc yönünü değiştiriyor
  //   if (sortConfig.key === key && sortConfig.direction === "asc") {
  //     direction = "desc";
  //   } else if (sortConfig.key === key && sortConfig.direction === "desc") {
  //     direction = "asc";
  //   }

  //   setSortConfig({ key, direction });

  //   const sortedData = [...kayitlar].sort((a, b) => {
  //     if (!a[key]) return 1;
  //     if (!b[key]) return -1;

  //     // Eğer TeslimAlmaTarihi ise özel tarih sıralaması yap
  //     if (key === "TeslimAlmaTarihi") {
  //       const dateA = parseDateString(a[key]);
  //       const dateB = parseDateString(b[key]);

  //       // Parse edilemezse en sona atsın
  //       if (!dateA) return 1;
  //       if (!dateB) return -1;

  //       // direction === 'asc' => küçük tarihten büyüğe
  //       // direction === 'desc' => büyük tarihten küçüğe
  //       return direction === "asc" ? dateA - dateB : dateB - dateA;
  //     }

  //     // Diğer alanlar için mevcut string/number kıyaslama
  //     if (typeof a[key] === "string" && typeof b[key] === "string") {
  //       return direction === "asc"
  //         ? a[key].localeCompare(b[key])
  //         : b[key].localeCompare(a[key]);
  //     }

  //     return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
  //   });

  //   setKayitlar(sortedData);
  // };

  const sortData = (key) => {
    let direction = "asc";

    // Eğer yeni bir sütuna tıklanmışsa, sıralamayı sıfırla ve "asc" ile başlat
    if (sortConfig.key !== key) {
      direction = "asc";
    } else {
      // Eğer aynı sütuna tıklanıyorsa yönü değiştir
      direction = sortConfig.direction === "asc" ? "desc" : "asc";
    }

    setSortConfig({ key, direction });

    // Orijinal kayıtları koruyarak yeni bir sıralama yap
    const sortedData = [...kayitlar].sort((a, b) => {
      if (!a[key]) return 1;
      if (!b[key]) return -1;

      // Eğer tarih sıralanıyorsa, önce parse işlemi yap
      if (key === "TeslimAlmaTarihi" || key === "HazirlamaTarihi" || key === "TeslimEtmeTarihi") {
        const dateA = parseDateString(a[key]);
        const dateB = parseDateString(b[key]);

        if (!dateA) return 1;
        if (!dateB) return -1;

        return direction === "asc" ? dateA - dateB : dateB - dateA;
      }

      // Eğer metin sıralanıyorsa (string karşılaştırma)
      if (typeof a[key] === "string" && typeof b[key] === "string") {
        return direction === "asc"
          ? a[key].localeCompare(b[key])
          : b[key].localeCompare(a[key]);
      }

      // Sayı sıralaması
      return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
    });

    setKayitlar(sortedData);
  };

  const toggleToolsPanel = () => {
    setIsToolsPanelOpen(!isToolsPanelOpen);
  };

  const exportAllRecordsToExcel = () => {
    // Tüm verileri "Teslim Edildi" hariç aktar
    const filteredKayitlar = kayitlar.filter(
      (row) => row.Durum !== "Teslim Edildi"
    );

    const header = [
      "Fis No",
      "Ad Soyad",
      "Teslim Alma Tarihi",
      "TelNo",
      "Ürün",
      "Marka",
      "Model",
      "Seri No",
      "Garanti Durumu",
      "Teslim Alan",
      "Teknisyen",
      "Ücret",
      "Sorun",
      "Aciklama",
      "Yapilanlar",
      "Hazırlama Tarihi",
      "Teslim Etme Tarihi",
      "Durum",
    ];

    const rows = filteredKayitlar.map((row) => [
      row.fishNo,
      row.AdSoyad,
      row.TeslimAlmaTarihi,
      row.TelNo,
      row.Urun,
      row.Marka,
      row.Model,
      row.SeriNo,
      row.GarantiDurumu,
      row.TeslimAlan,
      row.Teknisyen,
      row.Ucret,
      row.Sorunlar,
      row.Aciklama,
      row.Yapilanlar,
      row.HazirlamaTarihi,
      row.TeslimEtmeTarihi,
      row.Durum,
    ]);

    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tüm Kayıtlar");
    XLSX.writeFile(wb, "tüm kayıtlar.xlsx");
  };

  const exportFilteredRecordsToExcel = () => {
    // Eğer hiçbir filtre seçilmediyse uyarı ver
    if (filtre === "Hepsi" && garantiFiltre === "Hepsi" && !filtreTarihi) {
      alert("Lütfen bir filtre seçiniz!");
      return;
    }

    // 'Teslim Edildi' durumunu hariç tutarak filtreleme
    const filteredKayitlar = kayitlar.filter(
      (row) => row.Durum !== "Teslim Edildi"
    );

    // Filtrelenmiş kayıtlara göre dışa aktarma işlemi
    let filteredRecords = filteredKayitlar;

    // Durum filtresi varsa uygula
    if (filtre !== "Hepsi") {
      filteredRecords = filteredRecords.filter((row) => row.Durum === filtre);
    }

    // Garanti filtresi varsa uygula
    if (garantiFiltre !== "Hepsi") {
      filteredRecords = filteredRecords.filter(
        (row) => row.GarantiDurumu === garantiFiltre
      );
    }

    // Tarih filtresi varsa uygula
    if (filtreTarihi) {
      const filteredDate = new Date(filtreTarihi); // filtre tarihini Date nesnesine çeviriyoruz
      filteredRecords = filteredRecords.filter((row) => {
        const rowDate = new Date(row.TeslimAlmaTarihi); // row.TeslimAlmaTarihi'ni Date nesnesine çeviriyoruz
        // Yalnızca yıl, ay ve gün karşılaştırması yapıyoruz
        return (
          rowDate.getFullYear() === filteredDate.getFullYear() &&
          rowDate.getMonth() === filteredDate.getMonth() &&
          rowDate.getDate() === filteredDate.getDate()
        );
      });
    }

    // Eğer hiçbir kayıt kalmadıysa, kullanıcıya uyarı ver
    if (filteredRecords.length === 0) {
      alert("Seçilen filtrelerle eşleşen veri bulunamadı.");
      return;
    }

    // Başlıkları ve satırları ayarlıyoruz
    let header = [];
    let rows = [];

    if (garantiFiltre === "Garantisiz") {
      header = [
        "Fis No",
        "Ad Soyad",
        "Garanti Durumu",
        "Ürün",
        "Marka",
        "Model",
        "Seri No",
      ];
      rows = filteredRecords.map((row) => [
        row.fishNo,
        row.AdSoyad,
        row.GarantiDurumu,
        row.Urun,
        row.Marka,
        row.Model,
        row.SeriNo,
      ]);
    } else {
      header = [
        "Fis No",
        "Ad Soyad",
        "Teslim Alma Tarihi",
        "TelNo",
        "Ürün",
        "Marka",
        "Model",
        "Seri No",
        "Garanti Durumu",
        "Teslim Alan",
        "Teknisyen",
        "Ücret",
        "Sorun",
        "Aciklama",
        "Yapilanlar",
        "Hazırlama Tarihi",
        "Teslim Etme Tarihi",
        "Durum",
      ];
      rows = filteredRecords.map((row) => [
        row.fishNo,
        row.AdSoyad,
        row.TeslimAlmaTarihi,
        row.TelNo,
        row.Urun,
        row.Marka,
        row.Model,
        row.SeriNo,
        row.GarantiDurumu,
        row.TeslimAlan,
        row.Teknisyen,
        row.Ucret,
        row.Sorun,
        row.Aciklama,
        row.Yapilanlar,
        row.HazırlamaTarihi,
        row.TeslimEtmeTarihi,
        row.Durum,
      ]);
    }

    // Excel dosyasını oluşturuyoruz
    const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Kayıtlar");

    // Excel dosyasını indir
    XLSX.writeFile(workbook, "filterli kayıtlar.xlsx");
  };

  let selectedRecords = [];

  // Checkbox'ların durumunu değiştirdiğimizde çağrılacak fonksiyon
  const handleCheckboxChange = (record, event) => {
    if (event.target.checked) {
      // Checkbox seçildiyse kaydı diziye ekle
      selectedRecords.push(record);
    } else {
      // Checkbox seçilmediyse kaydı diziden çıkar
      selectedRecords = selectedRecords.filter(
        (item) => item.fishNo !== record.fishNo
      );
    }
  };

  // Seçilen kayıtları Excel'e aktarma fonksiyonu
  const exportSelectedRecordsToExcel = () => {
    if (selectedRecords.length === 0) {
      alert("Lütfen en az bir ürün seçin!");
      return;
    }

    // Başlıklar
    const header = [
      "Fis No",
      "Ad Soyad",
      "Teslim Alma Tarihi",
      "TelNo",
      "Ürün",
      "Marka",
      "Model",
      "Seri No",
      "Garanti Durumu",
      "Teslim Alan",
      "Teknisyen",
      "Ücret",
      "Sorun",
      "Aciklama",
      "Yapilanlar",
      "Hazırlama Tarihi",
      "Teslim Etme Tarihi",
      "Durum",
    ];

    // Satırlar (seçilen ürünler)
    const rows = selectedRecords.map((record) => [
      record.fishNo,
      record.AdSoyad,
      record.TeslimAlmaTarihi,
      record.TelNo,
      record.Urun,
      record.Marka,
      record.Model,
      record.SeriNo,
      record.GarantiDurumu,
      record.TeslimAlan,
      record.Teknisyen,
      record.Ucret,
      record.Sorunlar,
      record.Aciklama,
      record.Yapilanlar,
      record.HazırlamaTarihi,
      record.TeslimEtmeTarihi,
      record.Durum,
    ]);

    // Excel dosyasını oluşturma
    const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Seçilmiş Kayıtlar");

    // Excel dosyasını indirme
    XLSX.writeFile(workbook, "seçili kayıtlar.xlsx");
  };

  const handleLogout = async () => {
    try {
      // Backend'e çıkış işlemi için istek gönder
      const response = await fetch("http://192.168.0.201:2431/api/logout", {
        method: "POST",
        credentials: "include", // Çerezleri gönder
      });

      // Eğer istek başarılı değilse hata fırlat
      if (!response.ok) {
        throw new Error("Çıkış işlemi başarısız oldu.");
      }

      // **Kullanıcı bilgilerini tamamen temizle**
      localStorage.removeItem("user"); // localStorage'dan 'user' verisini temizle
      sessionStorage.clear(); // sessionStorage'ı temizle
      setUserId(null); // Context'i sıfırla (örneğin, React Context kullanıyorsanız)

      // **Başarılı çıkış sonrası giriş sayfasına yönlendir**
      window.location.href = "/login"; // Giriş sayfasına yönlendir
    } catch (error) {
      // Hata durumu: Çıkış işleminde bir sorun oluştuysa hata mesajını yazdır
      console.error("Çıkış hatası:", error.message);

      // Kullanıcıyı giriş sayfasına yönlendir
      window.location.href = "/login";
    }
  };

  var idInListe = 1;

  return (
    <>
      <div
        className="tools-panel-header"
        onClick={toggleToolsPanel}
        style={{
          backgroundColor: "rgba(255, 0, 0, 0.5)",
          color: "#fff",
          padding: "15px",
          borderRadius: "50%",
          cursor: "pointer",
          display: "inline-flex",
          position: "absolute",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 999,
          top: "10px",
          right: "10px",
        }}
      >
        {isToolsPanelOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </div>
      {isToolsPanelOpen && (
        <div className="row align-items-center mt-3 mb-3 ms-3">
          <div
            className="col-auto"
            style={{ marginTop: "40px", width: "500px" }}
          >
            <input
              type="text"
              placeholder="Arama yapın..."
              value={searchTerm}
              onChange={handleSearch}
              className="form-control mb-3 w-100"
            />
          </div>
          <div className="col-auto">
            <label className="fs-6 fw-light" htmlFor="Durum">
              Durum
            </label>
            <select
              className="form-control"
              onChange={(e) => setFiltre(e.target.value)}
              value={filtre}
            >
              <option value="Hepsi">Hepsi</option>
              <option value="Onarılıyor">Onarılıyor</option>
              <option value="Bekliyor">Bekliyor</option>
              <option value="Hazırlanıyor">Hazırlanıyor</option>
              <option value="Tamamlandı">Tamamlandı</option>
            </select>
          </div>
          <div className="col-auto">
            <label className="fs-6 fw-light" htmlFor="GarantiDurumu">
              Garanti
            </label>
            <select
              className="form-control"
              onChange={(e) => setGarantiFiltre(e.target.value)}
              value={garantiFiltre}
            >
              <option value="Hepsi">Hepsi</option>
              <option value="Garantili">Garantili</option>
              <option value="Garantisiz">Garantisiz</option>
              <option value="Sözleşmeli">Sözleşmeli</option>
              <option value="Belirsiz">Belirsiz</option>
            </select>
          </div>
          <div className="col-auto">
            <label className="fs-6 fw-light" htmlFor="Tarih">
              Tarih
            </label>
            <input
              type="date"
              className="form-control"
              value={filtreTarihi}
              onChange={(e) => setFiltreTarihi(e.target.value)}
            />
          </div>
          <div className="col-auto">
            <div className="dropdown-center">
              <button
                className="btn btn-success dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ width: "100%", height: "50px" }}
              >
                Excel İşlemleri
              </button>
              <ul className="dropdown-menu">
                <li>
                  <a
                    className="dropdown-item"
                    onClick={exportAllRecordsToExcel}
                  >
                    Tüm Verileri Excele Aktar
                  </a>
                </li>
                <li>
                  <a
                    className="dropdown-item"
                    onClick={exportFilteredRecordsToExcel}
                  >
                    Filtreyi Excele Aktar
                  </a>
                </li>
                <li>
                  <a
                    className="dropdown-item"
                    onClick={exportSelectedRecordsToExcel}
                  >
                    Seçilmişi Excele Aktar
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-auto">
            <a
              href="/"
              className="btn btn-success w-100 mb-2"
              style={{ width: "100%", height: "50px" }}
            >
              <IoHome style={{ width: "30px", height: "30px" }} />
            </a>
          </div>
          <div className="col-auto">
            <a
              href="/delivered-products"
              className="btn btn-warning w-100 mb-2"
              style={{ width: "100%", height: "50px" }}
            >
              <FaArchive style={{ width: "30px", height: "30px" }} />
            </a>
          </div>
          {isAuthorized && userRole === "admin" && (
            <>
              <div className="col-auto">
                <div className="dropdown-center">
                  <button
                    className="btn btn-info dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{ width: "100%", height: "50px" }}
                  >
                    Ekleme İşlemleri
                  </button>
                  <ul className="dropdown-menu">
                    <li>
                      <a className="dropdown-item" href="/add-product">
                        Ürün Ekle
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="/add-customer">
                        Müşteri/Bayi Ekle
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-auto">
                <a
                  href="/settings"
                  className="btn btn-warning w-100 mb-2"
                  style={{ width: "100%", height: "50px" }}
                >
                  <IoSettingsSharp style={{ width: "30px", height: "30px" }} />
                </a>
              </div>
            </>
          )}
          <div className="col-auto">
            <button className="btn btn-danger rounded-1" onClick={handleLogout}>
              <IoMdLogOut style={{ width: "30px", height: "30px" }} />
            </button>
          </div>
        </div>
      )}

      {/* PANEL MENU */}

      {/* <SidePanel /> */}

      <div className="table mt-1">
        {filteredResults.length > 0 ? (
          <table
            border="1"
            cellPadding="5"
            cellSpacing="0"
            className="w-100 table-striped"
          >
            {/* <thead>
              <tr style={{ backgroundColor: "#bdbdbd" }}>
                <th onClick={() => sortData("fishNo")}>
                  Fis No {sortConfig.key === "fishNo" && (sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />)}
                </th>
                <th onClick={() => sortData("AdSoyad")}>
                  Ad Soyad {sortConfig.key === "AdSoyad" && (sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />)}
                </th>
                <th onClick={() => sortData("TeslimAlmaTarihi")}>
                  Teslim Alma Tarihi {sortConfig.key === "TeslimAlmaTarihi" && (sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />)}
                </th>
                <th onClick={() => sortData("TelNo")}>
                  TelNo {sortConfig.key === "TelNo" && (sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />)}
                </th>
                <th onClick={() => sortData("Urun")}>
                  Ürün {sortConfig.key === "Urun" && (sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />)}
                </th>
                <th onClick={() => sortData("Marka")}>
                  Marka {sortConfig.key === "Marka" && (sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />)}
                </th>
                <th onClick={() => sortData("Model")}>
                  Model {sortConfig.key === "Model" && (sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />)}
                </th>
                <th onClick={() => sortData("SeriNo")}>
                  Seri No {sortConfig.key === "SeriNo" && (sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />)}
                </th>
                <th onClick={() => sortData("GarantiDurumu")}>
                  Garanti Durum {sortConfig.key === "GarantiDurumu" && (sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />)}
                </th>
                <th onClick={() => sortData("TeslimAlan")}>
                  Teslim Alan {sortConfig.key === "TeslimAlan" && (sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />)}
                </th>
                <th onClick={() => sortData("Durum")} className="rounded">
                  Durum {sortConfig.key === "Durum" && (sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />)}
                </th>
              </tr>
            </thead> */}
            <thead>
              <tr style={{ backgroundColor: "#bdbdbd" }}>
                {[
                  { key: "fishNo", label: "Fis No" },
                  { key: "AdSoyad", label: "Ad Soyad" },
                  { key: "TeslimAlmaTarihi", label: "Teslim Alma Tarihi" },
                  { key: "TelNo", label: "TelNo" },
                  { key: "Urun", label: "Ürün" },
                  { key: "Marka", label: "Marka" },
                  { key: "Model", label: "Model" },
                  { key: "SeriNo", label: "Seri No" },
                  { key: "GarantiDurumu", label: "Garanti Durum" },
                  { key: "TeslimAlan", label: "Teslim Alan" },
                  { key: "Teknisyen", label: "Teknisyen" },
                  { key: "Sorunlar", label: "Sorun" },
                  { key: "Aciklama", label: "Açıklama" },
                  { key: "Yapilanlar", label: "Yapılanlar" },
                  { key: "Maliyet", label: "Maliyet" },
                  { key: "Ucret", label: "Ücret" },
                  { key: "HazirlamaTarihi", label: "Hazırlama Tarihi" },
                  { key: "TeslimEtmeTarihi", label: "Teslim Etme Tarihi" },
                  { key: "Durum", label: "Durum" }
                ].map(({ key, label }) => (
                  <th key={key} onClick={() => sortData(key)} style={{ cursor: "pointer" }}>
                    {label}
                    {sortConfig.key === key &&
                      (sortConfig.direction === "asc" ? " ▲" : " ▼")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredResults
                .filter((recordS) => recordS.Durum !== "Teslim Edildi")
                .map((recordS, index) => (
                  <tr key={recordS.fishNo || `recordS-${index}`}>
                    <td>
                      <a
                        className="btn btn-sm btn-secondary d-block mb-2 fs-3"
                        href={`/product-info/${recordS.fishNo || index}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {recordS.fishNo}
                      </a>
                      <span className="glyphicon d-block mb-2">
                        #{idInListe++}
                      </span>
                      <input
                        type="checkbox"
                        name="selected-product"
                        id={`selected-product-${recordS.fishNo}`}
                        onChange={(e) => handleCheckboxChange(recordS, e)}
                        className="form-check-input"
                        style={{ width: "20px", height: "20px" }}
                      />
                    </td>
                    <td>{recordS.AdSoyad || "Bilinmiyor"}</td>
                    <td>
                      {formatTarihVeSaat(recordS.TeslimAlmaTarihi) ||
                        "Bilinmiyor"}
                    </td>
                    <td>{recordS.TelNo || "Bilinmiyor"}</td>
                    <td>{recordS.Urun || "Bilinmiyor"}</td>
                    <td>{recordS.Marka || "Bilinmiyor"}</td>
                    <td>{recordS.Model || "Bilinmiyor"}</td>
                    <td>{recordS.SeriNo || "Bilinmiyor"}</td>
                    <td>{recordS.GarantiDurumu || "Bilinmiyor"}</td>
                    <td>{recordS.TeslimAlan || "Bilinmiyor"}</td>
                    <td>{recordS.Teknisyen || "Bilinmiyor"}</td>
                    <td>
                      {recordS?.Sorunlar?.length > 100 ? (
                        <>
                          <span className="text-break">
                            {acikDetaylar[index]
                              ? recordS.Sorunlar
                              : `${recordS.Sorunlar.slice(0, 50)}...`}
                          </span>
                          <button
                            onClick={() => toggleDetay(index)}
                            className="btn btn-sm btn-info mt-1"
                          >
                            {acikDetaylar[index] ? "Daha Az" : "Daha Fazla"}
                          </button>
                        </>
                      ) : (
                        <span>{recordS.Sorunlar || ""}</span>
                      )}
                    </td>
                    <td>
                      {recordS.Aciklama?.length > 100 ? (
                        <>
                          <span className="text-break">
                            {acikAciklama[index]
                              ? recordS.Aciklama
                              : `${recordS.Aciklama.slice(0, 50)}...`}
                          </span>
                          <button
                            onClick={() => toggleAciklama(index)}
                            className="btn btn-sm btn-info mt-1"
                          >
                            {acikAciklama[index] ? "Daha Az" : "Daha Fazla"}
                          </button>
                        </>
                      ) : (
                        <span>{recordS.Aciklama || ""}</span>
                      )}
                    </td>
                    <td>
                      {recordS?.Yapilanlar?.length > 100 ? (
                        <>
                          <span className="text-break">
                            {acikYapilanlar[index]
                              ? recordS.Yapilanlar
                              : `${recordS.Yapilanlar.slice(0, 50)}...`}
                          </span>
                          <button
                            onClick={() => toggleYapilanlar(index)}
                            className="btn btn-sm btn-info mt-1"
                          >
                            {acikYapilanlar[index] ? "Daha Az" : "Daha Fazla"}
                          </button>
                        </>
                      ) : (
                        <span>{recordS.Yapilanlar || ""}</span>
                      )}
                    </td>
                    <td>MALIYET</td>
                    <td>{recordS.Ucret}₺</td>
                    <td>
                      {formatTarihVeSaat(recordS.HazirlamaTarihi) ||
                        "Daha Belirtilmedi"}
                    </td>
                    <td>
                      {formatTarihVeSaat(recordS.TeslimEtmeTarihi) ||
                        "Daha Belirtilmedi"}
                    </td>
                    {/* {isAuthorized && (
                      <td>
                        <button
                          onClick={() => navigate(`/record/${recordS.fishNo}`)}
                          className="btn btn-sm btn-secondary"
                        >
                          Düzenle
                        </button>
                      </td>
                    )} */}
                    <td
                      id="gitdegistirya"
                      className={
                        recordS.Durum === "Onarılıyor"
                          ? "onariliyor"
                          : recordS.Durum === "Tamamlandı"
                            ? "tamamlandi"
                            : recordS.Durum === "Bekliyor"
                              ? "bklyr"
                              : recordS.Durum === "İade Edildi"
                                ? "iade-edildi"
                                : recordS.Durum === "Teslim Edildi"
                                  ? "teslim-edildi"
                                  : recordS.Durum === "Onay Bekliyor"
                                    ? "onay-bekliyor"
                                    : recordS.Durum === "Yedek Parça Bekliyor"
                                      ? "yedek-parca"
                                      : recordS.Durum === "Problemli Ürün"
                                        ? "problemli-urun"
                                        : recordS.Durum === "Teslim Alınmadı"
                                          ? "teslim-alinmadi"
                                          : recordS.Durum === "Hazırlanıyor"
                                            ? "hazirlaniyor"
                                            : recordS.Durum === "Arıza Tespiti"
                                              ? "ariza-tespiti"
                                              : recordS.Durum === "Değişim Tamamlandı"
                                                ? "degisim-tamamlandi"
                                                : recordS.Durum === "Faturalandı"
                                                  ? "faturalandi"
                                                  : recordS.Durum === "Garantili Onarım"
                                                    ? "garantili-onarim"
                                                    : recordS.Durum === "Teslim Durumu"
                                                      ? "teslim-durumu"
                                                      : recordS.Durum === "Hurdaya Ayrıldı"
                                                        ? "hurdaya-ayrildi"
                                                        : recordS.Durum === "İade Tamamlandı"
                                                          ? "iade-tamamlandi"
                                                          : recordS.Durum === "İade Toplanıyor"
                                                            ? "iade-toplaniyor"
                                                            : recordS.Durum === "Kiralama"
                                                              ? "kiralama"
                                                              : recordS.Durum === "Montaj Yapılacak"
                                                                ? "montaj-yapilacak"
                                                                : recordS.Durum === "Onarım Aşamasında"
                                                                  ? "onarim-asamasinda"
                                                                  : recordS.Durum === "Onay Durumu"
                                                                    ? "onay-durumu"
                                                                    : recordS.Durum === "Parça Durumu"
                                                                      ? "parca-durumu"
                                                                      : recordS.Durum === "Periyodik Bakım"
                                                                        ? "periyodik-bakim"
                                                                        : recordS.Durum === "Satın Alındı"
                                                                          ? "satin-alindi"
                                                                          : recordS.Durum === "Servis Durumu"
                                                                            ? "servis-durumu"
                                                                            : recordS.Durum === "Sipariş Durumu"
                                                                              ? "siparis-durumu"
                                                                              : recordS.Durum === "Tahsilat Bekliyor"
                                                                                ? "tahsilat-bekliyor"
                                                                                : recordS.Durum === "Ücret Bildirilecek"
                                                                                  ? "ucret-bildirilecek"
                                                                                  : ""
                      }
                    >
                      {recordS.Durum}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <table
            border="1"
            cellPadding="5"
            cellSpacing="0"
            className="w-100 table-striped"
          >
            <thead>
              <tr style={{ backgroundColor: "#bdbdbd" }}>
                {[
                  { key: "fishNo", label: "Fis No" },
                  { key: "AdSoyad", label: "Ad Soyad" },
                  { key: "TeslimAlmaTarihi", label: "Teslim Alma Tarihi" },
                  { key: "TelNo", label: "TelNo" },
                  { key: "Urun", label: "Ürün" },
                  { key: "Marka", label: "Marka" },
                  { key: "Model", label: "Model" },
                  { key: "SeriNo", label: "Seri No" },
                  { key: "GarantiDurumu", label: "Garanti Durum" },
                  { key: "TeslimAlan", label: "Teslim Alan" },
                  { key: "Teknisyen", label: "Teknisyen" },
                  { key: "Sorunlar", label: "Sorun" },
                  { key: "Aciklama", label: "Açıklama" },
                  { key: "Yapilanlar", label: "Yapılanlar" },
                  { key: "Maliyet", label: "Maliyet" },
                  { key: "Ucret", label: "Ücret" },
                  { key: "HazirlamaTarihi", label: "Hazırlama Tarihi" },
                  { key: "TeslimEtmeTarihi", label: "Teslim Etme Tarihi" },
                  { key: "Durum", label: "Durum" }
                ].map(({ key, label }) => (
                  <th key={key} onClick={() => sortData(key)} style={{ cursor: "pointer" }}>
                    {label}
                    {sortConfig.key === key &&
                      (sortConfig.direction === "asc" ? " ▲" : " ▼")}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filtrelenmisKayitlar.length > 0 ? (
                filtrelenmisKayitlar
                  .filter((record) => record.Durum !== "Teslim Edildi")
                  .map((record, index) => (
                    <tr key={record.fishNo || `record-${index}`}>
                      <td>
                        <a
                          className="btn btn-sm btn-secondary d-block mb-2 fs-3"
                          href={`/product-info/${record.fishNo || index}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {record.fishNo}
                        </a>
                        <span className="glyphicon d-block mb-2">
                          #{idInListe++}
                        </span>
                        <input
                          type="checkbox"
                          name="selected-product"
                          id={`selected-product-${record.fishNo}`}
                          onChange={(e) => handleCheckboxChange(record, e)}
                          className="form-check-input custom-checkbox"
                        style={{ width: "20px", height: "20px" }}
                        />
                      </td>
                      <td>{record.AdSoyad || "Bilinmiyor"}</td>
                      <td>
                        {formatTarihVeSaat(record.TeslimAlmaTarihi) ||
                          "Bilinmiyor"}
                      </td>
                      <td>{record.TelNo || "Bilinmiyor"}</td>
                      <td>{record.Urun || "Bilinmiyor"}</td>
                      <td>{record.Marka || "Bilinmiyor"}</td>
                      <td>{record.Model || "Bilinmiyor"}</td>
                      <td>{record.SeriNo || "Bilinmiyor"}</td>
                      <td>{record.GarantiDurumu || "Bilinmiyor"}</td>
                      <td>{record.TeslimAlan || "Bilinmiyor"}</td>
                      <td>{record.Teknisyen || "Bilinmiyor"}</td>
                      <td>
                        {record.Sorunlar?.length > 100 ? (
                          <>
                            <span className="text-break">
                              {acikAciklama[index]
                                ? record.Sorunlar
                                : `${record.Sorunlar.slice(0, 50)}...`}
                            </span>
                            <button
                              onClick={() => toggleAciklama(index)}
                              className="btn btn-sm btn-info mt-1"
                            >
                              {acikAciklama[index] ? "Daha Az" : "Daha Fazla"}
                            </button>
                          </>
                        ) : (
                          <span>{record.Sorunlar || ""}</span>
                        )}
                      </td>
                      <td>
                        {record.Aciklama?.length > 100 ? (
                          <>
                            <span className="text-break">
                              {acikAciklama[index]
                                ? record.Aciklama
                                : `${record.Aciklama.slice(0, 50)}...`}
                            </span>
                            <button
                              onClick={() => toggleAciklama(index)}
                              className="btn btn-sm btn-info mt-1"
                            >
                              {acikAciklama[index] ? "Daha Az" : "Daha Fazla"}
                            </button>
                          </>
                        ) : (
                          <span>{record.Aciklama || ""}</span>
                        )}
                      </td>
                      <td>
                        {record.Yapilanlar?.length > 100 ? (
                          <>
                            <span className="text-break">
                              {acikAciklama[index]
                                ? record.Yapilanlar
                                : `${record.Yapilanlar.slice(0, 50)}...`}
                            </span>
                            <button
                              onClick={() => toggleAciklama(index)}
                              className="btn btn-sm btn-info mt-1"
                            >
                              {acikAciklama[index] ? "Daha Az" : "Daha Fazla"}
                            </button>
                          </>
                        ) : (
                          <span>{record.Yapilanlar || ""}</span>
                        )}
                      </td>
                      <td>MALIYET</td>
                      <td>{record.Ucret || "0"}₺</td>
                      <td>
                        {formatTarihVeSaat(record.HazirlamaTarihi) ||
                          "Daha Belirtilmedi"}
                      </td>
                      <td>
                        {formatTarihVeSaat(record.TeslimEtmeTarihi) ||
                          "Daha Belirtilmedi"}
                      </td>
                      <td
                        id="gitdegistirya"
                        className={`durum-container ${record.Durum === "Onarılıyor"
                          ? "onariliyor"
                          : record.Durum === "Tamamlandı"
                            ? "tamamlandi"
                            : record.Durum === "Bekliyor"
                              ? "bklyr"
                              : record.Durum === "İade Edildi"
                                ? "iade-edildi"
                                : record.Durum === "Teslim Edildi"
                                  ? "teslim-edildi"
                                  : record.Durum === "Onay Bekliyor"
                                    ? "onay-bekliyor"
                                    : record.Durum === "Yedek Parça Bekliyor"
                                      ? "yedek-parca"
                                      : record.Durum === "Problemli Ürün"
                                        ? "problemli-urun"
                                        : record.Durum === "Teslim Alınmadı"
                                          ? "teslim-alinmadi"
                                          : record.Durum === "Hazırlanıyor"
                                            ? "hazirlaniyor"
                                            : record.Durum === "Arıza Tespiti"
                                              ? "ariza-tespiti"
                                              : record.Durum === "Değişim Tamamlandı"
                                                ? "degisim-tamamlandi"
                                                : record.Durum === "Faturalandı"
                                                  ? "faturalandi"
                                                  : record.Durum === "Garantili Onarım"
                                                    ? "garantili-onarim"
                                                    : record.Durum === "Teslim Durumu"
                                                      ? "teslim-durumu"
                                                      : record.Durum === "Hurdaya Ayrıldı"
                                                        ? "hurdaya-ayrildi"
                                                        : record.Durum === "İade Tamamlandı"
                                                          ? "iade-tamamlandi"
                                                          : record.Durum === "İade Toplanıyor"
                                                            ? "iade-toplaniyor"
                                                            : record.Durum === "Kiralama"
                                                              ? "kiralama"
                                                              : record.Durum === "Montaj Yapılacak"
                                                                ? "montaj-yapilacak"
                                                                : record.Durum === "Onarım Aşamasında"
                                                                  ? "onarim-asamasinda"
                                                                  : record.Durum === "Onay Durumu"
                                                                    ? "onay-durumu"
                                                                    : record.Durum === "Parça Durumu"
                                                                      ? "parca-durumu"
                                                                      : record.Durum === "Periyodik Bakım"
                                                                        ? "periyodik-bakim"
                                                                        : record.Durum === "Satın Alındı"
                                                                          ? "satin-alindi"
                                                                          : record.Durum === "Servis Durumu"
                                                                            ? "servis-durumu"
                                                                            : record.Durum === "Sipariş Durumu"
                                                                              ? "siparis-durumu"
                                                                              : record.Durum === "Tahsilat Bekliyor"
                                                                                ? "tahsilat-bekliyor"
                                                                                : record.Durum === "Ücret Bildirilecek"
                                                                                  ? "ucret-bildirilecek"
                                                                                  : "default"
                          }`}
                      >
                        {record.Durum}
                        {(isAuthorized && userRole === "admin") ? (
                          <button
                            onClick={() => navigate(`/record/${record.fishNo}`)}
                            className="duzenle-btn"
                          >
                            <MdEditSquare />
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr className="bg-danger text-danger">
                  <td colSpan="19">Filtreye uygun kayıt bulunamadı.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
