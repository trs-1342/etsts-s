import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/AddProductPage.css";

export default function AddProductPage() {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userRole, setUserRole] = useState(""); // Kullanıcı rolü için state
  const [users, setUsers] = useState([]);

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
          setIsAuthorized(data.isAuthorized);
          setUserRole(data.role); // Kullanıcı rolünü alıyoruz
        } else {
          console.error("Yetki kontrolü başarısız");
        }
      } catch (error) {
        console.error("Yetki kontrolünde hata:", error.message);
      }
    };

    fetchUser();
  }, []);

  const [formData, setFormData] = useState({
    AdSoyad: "",
    TelNo: "",
    TeslimAlan: "",
    Teknisyen: "",
    SeriNo: "",
    Urun: "",
    Marka: "",
    Model: "",
    GarantiDurumu: "",
    BirlikteAlinanlar: "",
    Sorunlar: "",
    Aciklama: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    switch (name) {
      case "TelNo ":
        if (/^\+?\d{0,15}$/.test(value) || value === "") {
          setFormData({ ...formData, [name]: value });
        }
        break;
      case "SeriNo":
        if (/^[a-zA-Z0-9]*$/.test(value) || value === "") {
          setFormData({ ...formData, [name]: value });
        }
        break;
      default:
        setFormData({ ...formData, [name]: value });
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://192.168.0.138:2431/api/addpro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const text = await response.text();
      // console.log("Sunucudan dönen yanıt:", text);

      if (!response.ok) {
        // alert(text.message);
        throw new Error(`API hatası: ${text}`);
      }

      alert("Kayıt başarıyla eklendi.");
      window.location.href = "http://192.168.0.138:1342/";
      const data = JSON.parse(text);
      console.log("Ürün eklendi:", data);
    } catch (error) {
      console.error("Hata:", error.message);
    }
  };
  if (isAuthorized && (userRole === "admin" || userRole === "personel")) {
    return (
      <div className="container mt-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
          <div className="justify-content-start text-center">
            <h2>Ürün Ekle</h2>
          </div>
          <div className="d-flex justify-content-end">
            <a href="/" className="btn btn-danger">
              Anasayfaya Dön
            </a>
          </div>
        </div>
        <form className="row g-3" onSubmit={handleSubmit}>
          <div className="col-md-6">
            <label htmlFor="AdSoyad" className="form-label">
              Adı Soyadı
            </label>
            <input
              type="text"
              className="form-control"
              id="AdSoyad"
              name="AdSoyad"
              placeholder="Adı ve Soyadı girin"
              value={formData.AdSoyad}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="TelNo " className="form-label">
              Telefon
            </label>
            <input
              type="text"
              name="TelNo"
              className="form-control"
              value={formData.TelNo}
              onChange={handleChange}
              placeholder="Telefon"
              maxLength={15}
              pattern="^\d{10,15}$"
              title="Telefon numarası 10-15 rakam arasında olmalıdır."
              required
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="TeslimAlan" className="form-label">
              Teslim Alan
            </label>
            <input
              type="text"
              className="form-control"
              id="TeslimAlan"
              name="TeslimAlan"
              placeholder="Teslim alan kişiyi girin"
              value={formData.TeslimAlan}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="Teknisyen" className="form-label">
              Teknisyen
            </label>
            <select
              className="form-select"
              id="Teknisyen"
              name="Teknisyen"
              value={formData.Teknisyen}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                Teknisyeni Seçin
              </option>
              <option value="İbrahim Bey">İbrahim Bey</option>
              <option value="Emre Bey">Emre Bey</option>
              <option value="Halil Bey">Halil Bey</option>
              <option value="Talha Bey">Talha Bey</option>
              <option value="Mehmet Bey">Mehmet Bey</option>
            </select>
          </div>
          <div className="col-md-6">
            <label htmlFor="SeriNo" className="form-label">
              Seri No
            </label>
            <input
              type="text"
              className="form-control"
              id="SeriNo"
              name="SeriNo"
              placeholder="Seri Numarası"
              value={formData.SeriNo}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="Urun" className="form-label">
              Ürün
            </label>
            <select
              className="form-select"
              id="Urun"
              name="Urun"
              value={formData.Urun}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                Ürün Seçin
              </option>
              <option value="Bilgisayar">Bilgisayar</option>
              <option value="Laptop">Laptop</option>
              <option value="Kasa">Kasa</option>
              <option value="Ekran Kartı">Ekran Kartı</option>
              <option value="Yazıcı">Yazıcı</option>
            </select>
          </div>
          <div className="col-md-6">
            <label htmlFor="Marka" className="form-label">
              Marka
            </label>
            <select
              className="form-select"
              id="Marka"
              name="Marka"
              value={formData.Marka}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                Marka Seçin
              </option>
              <option value="ACER">ACER</option>
              <option value="AERO COOL">AERO COOL</option>
              <option value="ALL IN ONE">ALL IN ONE</option>
              <option value="APPLE">APPLE</option>
              <option value="ASUS">ASUS</option>
              <option value="BEKO">BEKO</option>
              <option value="BROTHER">BROTHER</option>
              <option value="CANON">CANON</option>
              <option value="CASPER">CASPER</option>
              <option value="CLOOER MASTER">CLOOER MASTER</option>
              <option value="COMPAQ">COMPAQ</option>
              <option value="COOLER MASTER">COOLER MASTER</option>
              <option value="CORSIR">CORSIR</option>
              <option value="DARK">DARK</option>
              <option value="DARK NEON">DARK NEON</option>
              <option value="DELL">DELL</option>
              <option value="DRAGOS">DRAGOS</option>
              <option value="EXCALIBUR">EXCALIBUR</option>
              <option value="EXPER">EXPER</option>
              <option value="FANTECKS">FANTECKS</option>
              <option value="FIJITSU">FIJITSU</option>
              <option value="GIGABYTE">GIGABYTE</option>
              <option value="GRUNDIG">GRUNDIG</option>
              <option value="HAP">HAP</option>
              <option value="HP">HP</option>
              <option value="HUAWEI">HUAWEI</option>
              <option value="IDEAPAD">IDEAPAD</option>
              <option value="IMAC">IMAC</option>
              <option value="INTEL">INTEL</option>
              <option value="KASA">KASA</option>
              <option value="LEGION">LEGION</option>
              <option value="LENOVO">LENOVO</option>
              <option value="MACBOOK">MACBOOK</option>
              <option value="MACBOOK AIR">MACBOOK AIR</option>
              <option value="MONSTER">MONSTER</option>
              <option value="MSI">MSI</option>
              <option value="NZXT">NZXT</option>
              <option value="OMEN">OMEN</option>
              <option value="PACKARD BELL">PACKARD BELL</option>
              <option value="POWERBOOST">POWERBOOST</option>
              <option value="POWERMASTER">POWERMASTER</option>
              <option value="RAZER">RAZER</option>
              <option value="RGB LIT">RGB LIT</option>
              <option value="SAMSUNG">SAMSUNG</option>
              <option value="SAPHIRE">SAPHIRE</option>
              <option value="SDF">SDF</option>
              <option value="SONY">SONY</option>
              <option value="THINKPAD">THINKPAD</option>
              <option value="THERMALTEK">THERMALTEK</option>
              <option value="TOPLAMA">TOPLAMA</option>
              <option value="TOSHIBA">TOSHIBA</option>
              <option value="TURBOX">TURBOX</option>
              <option value="VENTO">VENTO</option>
              <option value="ZALMAN">ZALMAN</option>
              <option value="ZOTAC">ZOTAC</option>
            </select>
          </div>
          <div className="col-md-6">
            <label htmlFor="Model" className="form-label">
              Model
            </label>
            <input
              type="text"
              className="form-control"
              id="Model"
              name="Model"
              placeholder="Model girin"
              value={formData.Model}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="GarantiDurumu" className="form-label">
              Garanti Durumu
            </label>
            <select
              className="form-select"
              id="GarantiDurumu"
              name="GarantiDurumu"
              value={formData.GarantiDurumu}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                Garanti Durumu
              </option>
              <option value="Garantili">Garantili</option>
              <option value="Garantisiz">Garantisiz</option>
              <option value="Sözleşmeli">Sözleşmeli</option>
              <option value="Belirsiz">Belirsiz</option>
            </select>
          </div>
          <div className="col-md-6">
            <label htmlFor="Model" className="form-label">
              Birlikte Alınanlar
            </label>
            <input
              type="text"
              className="form-control"
              id="BirlikteAlinanlar"
              name="BirlikteAlinanlar"
              placeholder="Birlikte Alınanlar"
              value={formData.BirlikteAlinanlar}
              onChange={handleChange}
              // required
            />
          </div>
          <div className="col-12">
            <label htmlFor="Sorunlar" className="form-label">
              Sorunlar:
            </label>
            <textarea
              id="Sorunlar"
              name="Sorunlar"
              placeholder={formData.Sorunlar || ""}
              onChange={handleChange}
              className="form-control"
              rows="3"
              required
              style={{ minHeight: "100px", maxHeight: "300px" }}
            ></textarea>
          </div>
          <div className="col-12">
            <label htmlFor="Aciklama" className="form-label">
              Açıklama:
            </label>
            <textarea
              id="Aciklama"
              name="Aciklama"
              placeholder={formData.Aciklama || ""}
              onChange={handleChange}
              className="form-control"
              rows="3"
              style={{ minHeight: "100px", maxHeight: "300px" }}
            ></textarea>
          </div>
          <div className="col-12 text-center mt-4">
            <button type="submit" className="btn btn-primary me-3">
              Kaydet
            </button>
          </div>
        </form>
      </div>
    );
  } else {
    return (
      <div className="container-xl mt-5 text-center">
        <h3>Yetkiniz Yok!</h3>
        <p>Bu sayfayı görüntülemek için yeterli yetkiniz yok.</p>
        <a className="btn btn-danger mx-2" href="/">
          Anasayfa
        </a>
      </div>
    );
  }
}
