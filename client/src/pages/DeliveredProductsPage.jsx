import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { FaBars, FaTimes, FaArchive } from "react-icons/fa";
import { IoHome } from "react-icons/io5";
import { IoMdLogOut } from "react-icons/io";
import { IoSettingsSharp } from "react-icons/io5";
import { MdEditSquare } from "react-icons/md";
import "../css/HomePage.css";
import "../css/DeliveredProductsPagecss.css";

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

export default function DeliveredProductsPage() {
  const navigate = useNavigate();
  const [kayitlar, setKayitlar] = useState([]);
  const [acikDetaylar, setAcikDetaylar] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [garantiFiltre, setGarantiFiltre] = useState("Hepsi");
  const [filtreTarihi, setFiltreTarihi] = useState("");
  // const [isAuthorized, setisAuthorized] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [teslimEdilenKayitlar, setTeslimEdilenKayitlar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isToolsPanelOpen, setIsToolsPanelOpen] = useState(true);
  const [userRole, setUserRole] = useState(""); // Kullanıcı rolü için state

  var idInListe = 1;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          "http://192.168.0.138:2431/api/checkAdmin",
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
    const fetchTeslimEdilenler = async () => {
      try {
        const response = await fetch(
          "http://192.168.0.138:2431/api/delivered-products"
        );

        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }

        const { data } = await response.json(); // Destructure to get 'data'

        if (Array.isArray(data)) {
          // Veriyi "Teslim Edildi" durumu ile filtreliyoruz
          const filteredData = data.filter(
            (kayit) => kayit.Durum === "Teslim Edildi"
          );
          setTeslimEdilenKayitlar(filteredData);
        } else {
          console.error("Beklenmedik veri formatı:", data);
        }
      } catch (error) {
        console.error("Kayıtlar alınamadı:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeslimEdilenler();
  }, []);

  const exportAllRecordsWithTotalToExcel = () => {
    // Excel başlıkları
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
      "Hazırlama Tarihi",
      "Teslim Etme Tarihi",
      "Durum",
    ];

    // Verileri tablo formatına dönüştür
    const rows = teslimEdilenKayitlar.map((row) => [
      row.fishNo || "Bilinmiyor",
      row.AdSoyad || "Bilinmiyor",
      formatTarihVeSaat(row.TeslimAlmaTarihi) || "Bilinmiyor",
      row.TelNo || "Bilinmiyor",
      row.Urun || "Bilinmiyor",
      row.Marka || "Bilinmiyor",
      row.Model || "Bilinmiyor",
      row.SeriNo || "Bilinmiyor",
      row.GarantiDurumu || "Bilinmiyor",
      row.TeslimAlan || "Bilinmiyor",
      row.Teknisyen || "Bilinmiyor",
      row.Ucret || 0,
      row.Sorunlar || "Bilinmiyor",
      formatTarihVeSaat(row.HazirlamaTarihi) || "Bilinmiyor",
      formatTarihVeSaat(row.TeslimEtmeTarihi) || "Bilinmiyor",
      row.Durum || "Bilinmiyor",
    ]);

    // Ücret sütunundaki değerlerin toplamını hesapla
    const totalAmount = teslimEdilenKayitlar.reduce((sum, row) => {
      return sum + (row.Ucret ? parseFloat(row.Ucret) : 0);
    }, 0);

    // Toplam satırını ekle
    rows.push([
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      `Toplam: ${totalAmount.toFixed(2)}`,
      "",
      "",
      "",
      "",
      "",
    ]);

    // Excel çalışma sayfasını oluştur
    const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ürünler");

    // Dinamik dosya adı oluştur
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")} ${String(
      today.getHours()
    ).padStart(2, "0")}:${String(today.getMinutes()).padStart(2, "0")}:${String(
      today.getSeconds()
    ).padStart(2, "0")}`;
    const fileName = `Ürünler Raporu ${formattedDate}.xlsx`;

    // Excel dosyasını indir
    XLSX.writeFile(workbook, fileName);
  };

  // const filteredTeslimEdilenKayitlar = teslimEdilenKayitlar.filter((kayit) => {
  //   const garantiUygun =
  //     garantiFiltre === "Hepsi" ||
  //     kayit.GarantiDurumu?.toLowerCase() === garantiFiltre.toLowerCase();
  //   const tarihUygun =
  //     !filtreTarihi ||
  //     (kayit.TeslimAlmaTarihi &&
  //       new Date(kayit.TeslimAlmaTarihi).toISOString().split("T")[0] ===
  //       filtreTarihi);

  //   return garantiUygun && tarihUygun;
  // });

  const filteredTeslimEdilenKayitlar = teslimEdilenKayitlar.filter((kayit) => {
    const garantiUygun =
      garantiFiltre === "Hepsi" ||
      kayit.GarantiDurumu?.toLowerCase() === garantiFiltre.toLowerCase();
    const tarihUygun =
      !filtreTarihi ||
      (kayit.TeslimAlmaTarihi &&
        new Date(kayit.TeslimAlmaTarihi).toISOString().split("T")[0] ===
        filtreTarihi);

    return garantiUygun && tarihUygun;
  });


  const toggleDetay = (index) => {
    setAcikDetaylar((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  // const sortData = (key) => {
  //   let direction = "asc";
  //   if (sortConfig.key === key && sortConfig.direction === "asc") {
  //     direction = "desc";
  //   }
  //   setSortConfig({ key, direction });

  //   const sortedData = [...kayitlar].sort((a, b) => {
  //     if (!a[key]) return 1;
  //     if (!b[key]) return -1;
  //     if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
  //     if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
  //     return 0;
  //   });

  //   setKayitlar(sortedData);
  // };

  function parseDateString(dateString) {
    if (!dateString) return null;

    const [datePart, timePart] = dateString.split(" ");
    if (!datePart || !timePart) return null;

    const [day, month, year] = datePart.split("/").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);

    return new Date(year, month - 1, day, hour, minute);
  }


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

    // Orijinal veri üzerinden çalışalım
    const sortedData = [...teslimEdilenKayitlar].sort((a, b) => {
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

    // Sıralanmış diziyi kaydet
    setTeslimEdilenKayitlar(sortedData);
  };

  const toggleToolsPanel = () => {
    setIsToolsPanelOpen(!isToolsPanelOpen);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("http://192.168.0.138:2431/api/logout", {
        method: "POST",
        credentials: "include", // Çerezleri gönder
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Çıkış işlemi başarısız oldu.");
      }

      // alert("Çıkış başarılı.");
      window.location.href = "http://192.168.0.138:1342/";
    } catch (error) {
      console.error("Çıkış hatası:", error.message);
      // alert(`Çıkış Yapıldı, Çıkış hatası: ${error.message}`);
      window.location.href = "http://192.168.0.138:1342/";
    }
  };

  let selectedRecords = [];

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
      record.HazırlamaTarihi,
      record.TeslimEtmeTarihi,
      record.Durum,
    ]);

    // Excel dosyasını oluşturma
    const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Seçilmiş Kayıtlar");
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")} ${String(
      today.getHours()
    ).padStart(2, "0")}:${String(today.getMinutes()).padStart(2, "0")}:${String(
      today.getSeconds()
    ).padStart(2, "0")}`;
    // Excel dosyasını indirme
    XLSX.writeFile(workbook, `seçili kayıtlar ${formattedDate}.xlsx`);
  };

  const exportFilteredRecordsToExcel = () => {
    // Excel başlıkları
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
      "Hazırlama Tarihi",
      "Teslim Etme Tarihi",
      "Durum",
    ];

    // Filtrelenmiş verileri tablo formatına dönüştür
    const rows = filteredTeslimEdilenKayitlar.map((row) => [
      row.fishNo || "Bilinmiyor",
      row.AdSoyad || "Bilinmiyor",
      formatTarihVeSaat(row.TeslimAlmaTarihi) || "Bilinmiyor",
      row.TelNo || "Bilinmiyor",
      row.Urun || "Bilinmiyor",
      row.Marka || "Bilinmiyor",
      row.Model || "Bilinmiyor",
      row.SeriNo || "Bilinmiyor",
      row.GarantiDurumu || "Bilinmiyor",
      row.TeslimAlan || "Bilinmiyor",
      row.Teknisyen || "Bilinmiyor",
      row.Ucret || 0,
      row.Sorunlar || "Bilinmiyor",
      formatTarihVeSaat(row.HazirlamaTarihi) || "Bilinmiyor",
      formatTarihVeSaat(row.TeslimEtmeTarihi) || "Bilinmiyor",
      row.Durum || "Bilinmiyor",
    ]);

    // Ücret sütunundaki değerlerin toplamını hesapla
    const totalAmount = filteredTeslimEdilenKayitlar.reduce((sum, row) => {
      return sum + (row.Ucret ? parseFloat(row.Ucret) : 0);
    }, 0);

    // Toplam satırını ekle
    rows.push([
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      `Toplam: ${totalAmount.toFixed(2)}`,
      "",
      "",
      "",
      "",
      "",
    ]);

    // Excel çalışma sayfasını oluştur
    const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ürünler");

    // Dinamik dosya adı oluştur
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")} ${String(
      today.getHours()
    ).padStart(2, "0")}:${String(today.getMinutes()).padStart(2, "0")}:${String(
      today.getSeconds()
    ).padStart(2, "0")}`;
    const fileName = `Filtreli Ürünler Raporu ${formattedDate}.xlsx`;

    // Excel dosyasını indir
    XLSX.writeFile(workbook, fileName);
  };

  const handleCheckboxChange = (kayit, event) => {
    if (event.target.checked) {
      // Checkbox seçildiyse kaydı diziye ekle
      selectedRecords.push(kayit);
    } else {
      // Checkbox seçilmediyse kaydı diziden çıkar
      selectedRecords = selectedRecords.filter(
        (item) => item.fishNo !== kayit.fishNo
      );
    }
  };

  if (loading) {
    return <p className="container bg-danger">Yükleniyor...</p>;
  }

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
            <a
              href="/"
              className="btn btn-success w-100 mb-2"
              style={{ width: "100%", height: "50px" }}
            >
              <IoHome style={{ width: "30px", height: "30px" }} />
            </a>
          </div>
          <div className="col-auto">
            <div className="dropdown-center">
              <button
                className="btn btn-secondary dropdown-toggle"
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
                <li>
                  <a
                    className="dropdown-item"
                    onClick={exportAllRecordsWithTotalToExcel}
                  >
                    Tüm Ürünleri ve Toplamı Excele Aktar
                  </a>
                </li>
              </ul>
            </div>
          </div>
          {isAuthorized &&
            (userRole === "admin" || userRole === "personel") && (
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
                    <IoSettingsSharp
                      style={{ width: "30px", height: "30px" }}
                    />
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
      <div className="table mt-1">
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
                { key: "Ucret", label: "Ücret" },
                { key: "Sorunlar", label: "Sorun" },
                { key: "Yapilanlar", label: "Yapılanlar" },
                { key: "Aciklama", label: "Açıklama" },
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
            {

              filteredTeslimEdilenKayitlar.length > 0 ? (

                filteredTeslimEdilenKayitlar.map((kayit, index) => (
                  <tr key={kayit.fishNo || `record-${index}`}>
                    <td>
                      <a
                        className="btn btn-sm btn-secondary d-block mb-2 fs-3"
                        href={`/product-info/${kayit.fishNo || index}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {kayit.fishNo}
                      </a>
                      <span className="glyphicon d-block mb-2">
                        #{idInListe++}
                      </span>
                      <input
                        type="checkbox"
                        name="selected-product"
                        id={`selected-product-${kayit.fishNo}`}
                        onChange={(e) => handleCheckboxChange(kayit, e)}
                        className="form-check-input custom-checkbox"
                        style={{ width: "20px", height: "20px" }}
                      />
                    </td>
                    <td>{kayit.AdSoyad || "Bilinmiyor"}</td>
                    <td>
                      {formatTarihVeSaat(kayit.TeslimAlmaTarihi) || "Bilinmiyor"}
                    </td>
                    <td>{kayit.TelNo || "Bilinmiyor"}</td>
                    <td>{kayit.Urun || "Bilinmiyor"}</td>
                    <td>{kayit.Marka || "Bilinmiyor"}</td>
                    <td>{kayit.Model || "Bilinmiyor"}</td>
                    <td>{kayit.SeriNo || "Bilinmiyor"}</td>
                    <td>{kayit.GarantiDurumu || "Bilinmiyor"}</td>
                    <td>{kayit.TeslimAlan || "Bilinmiyor"}</td>
                    <td>{kayit.Teknisyen || "Bilinmiyor"}</td>
                    <td>{kayit.Ucret || "0"}₺</td>
                    <td>
                      {kayit?.Sorunlar?.length > 100 ? (
                        <>
                          <span className="text-break">
                            {acikDetaylar[index]
                              ? kayit.Sorunlar
                              : `${kayit.Sorunlar.slice(0, 50)}...`}
                          </span>
                          <button
                            onClick={() => toggleDetay(index)}
                            className="btn btn-sm btn-info mt-1"
                          >
                            {acikDetaylar[index] ? "Daha Az" : "Daha Fazla"}
                          </button>
                        </>
                      ) : (
                        <span>
                          {kayit.Sorunlar || "Sorun bilgisi mevcut değil"}
                        </span>
                      )}
                    </td>
                    <td>
                      {kayit?.Yapilanlar?.length > 100 ? (
                        <>
                          <span className="text-break">
                            {acikYapilanlar[index]
                              ? kayit.Yapilanlar
                              : `${kayit.Yapilanlar.slice(0, 50)}...`}
                          </span>
                          <button
                            onClick={() => toggleYapilanlar(index)}
                            className="btn btn-sm btn-info mt-1"
                          >
                            {acikYapilanlar[index] ? "Daha Az" : "Daha Fazla"}
                          </button>
                        </>
                      ) : (
                        <span>{kayit.Yapilanlar || ""}</span>
                      )}
                    </td>
                    <td>
                      {kayit.Aciklama?.length > 100 ? (
                        <>
                          <span className="text-break">
                            {acikAciklama[index]
                              ? kayit.Aciklama
                              : `${kayit.Aciklama.slice(0, 50)}...`}
                          </span>
                          <button
                            onClick={() => toggleAciklama(index)}
                            className="btn btn-sm btn-info mt-1"
                          >
                            {acikAciklama[index] ? "Daha Az" : "Daha Fazla"}
                          </button>
                        </>
                      ) : (
                        <span>{kayit.Aciklama || ""}</span>
                      )}
                    </td>
                    <td>
                      {formatTarihVeSaat(kayit.HazirlamaTarihi) ||
                        "Daha Belirtilmedi"}
                    </td>
                    <td>
                      {formatTarihVeSaat(kayit.TeslimEtmeTarihi) ||
                        "Daha Belirtilmedi"}
                    </td>
                    <td
                      id="gitdegistirya"
                      className={`durum-container ${kayit.Durum === "Onarılıyor"
                        ? "onariliyor"
                        : kayit.Durum === "Tamamlandı"
                          ? "tamamlandi"
                          : kayit.Durum === "Bekliyor"
                            ? "bklyr"
                            : kayit.Durum === "İade Edildi"
                              ? "iade-edildi"
                              : kayit.Durum === "Teslim Edildi"
                                ? "teslim-edildi"
                                : kayit.Durum === "Onay Bekliyor"
                                  ? "onay-bekliyor"
                                  : kayit.Durum === "Yedek Parça Bekliyor"
                                    ? "yedek-parca"
                                    : kayit.Durum === "Problemli Ürün"
                                      ? "problemli-urun"
                                      : kayit.Durum === "Teslim Alınmadı"
                                        ? "teslim-alinmadi"
                                        : kayit.Durum === "Hazırlanıyor"
                                          ? "hazirlaniyor"
                                          : kayit.Durum === "Arıza Tespiti"
                                            ? "ariza-tespiti"
                                            : kayit.Durum === "Değişim Tamamlandı"
                                              ? "degisim-tamamlandi"
                                              : kayit.Durum === "Faturalandı"
                                                ? "faturalandi"
                                                : kayit.Durum === "Garantili Onarım"
                                                  ? "garantili-onarim"
                                                  : kayit.Durum === "Teslim Durumu"
                                                    ? "teslim-durumu"
                                                    : kayit.Durum === "Hurdaya Ayrıldı"
                                                      ? "hurdaya-ayrildi"
                                                      : kayit.Durum === "İade Tamamlandı"
                                                        ? "iade-tamamlandi"
                                                        : kayit.Durum === "İade Toplanıyor"
                                                          ? "iade-toplaniyor"
                                                          : kayit.Durum === "Kiralama"
                                                            ? "kiralama"
                                                            : kayit.Durum === "Montaj Yapılacak"
                                                              ? "montaj-yapilacak"
                                                              : kayit.Durum === "Onarım Aşamasında"
                                                                ? "onarim-asamasinda"
                                                                : kayit.Durum === "Onay Durumu"
                                                                  ? "onay-durumu"
                                                                  : kayit.Durum === "Parça Durumu"
                                                                    ? "parca-durumu"
                                                                    : kayit.Durum === "Periyodik Bakım"
                                                                      ? "periyodik-bakim"
                                                                      : kayit.Durum === "Satın Alındı"
                                                                        ? "satin-alindi"
                                                                        : kayit.Durum === "Servis Durumu"
                                                                          ? "servis-durumu"
                                                                          : kayit.Durum === "Sipariş Durumu"
                                                                            ? "siparis-durumu"
                                                                            : kayit.Durum === "Tahsilat Bekliyor"
                                                                              ? "tahsilat-bekliyor"
                                                                              : kayit.Durum === "Ücret Bildirilecek"
                                                                                ? "ucret-bildirilecek"
                                                                                : "default"
                        }`}
                    >
                      {kayit.Durum}
                      {(isAuthorized && userRole === "admin") ? (
                        <button
                          onClick={() => navigate(`/record/${kayit.fishNo}`)}
                          className="duzenle-btn"
                        >
                          <MdEditSquare />
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))) : (
                <tr>
                  <td colSpan="19" className="bg-danger text-center">
                    Kayıt bulunamadı
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>
    </>
  );
}
