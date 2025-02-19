import React, { useState } from "react";

export default function AddCustomer() {
  const [kisiTuru, setKisiTuru] = useState("Müşteri");
  const [musteriTipi, setMusteriTipi] = useState("");
  const [bayiTuru, setBayiTuru] = useState("");
  const [communicationPreferences, setCommunicationPreferences] = useState({
    sms: false,
    email: false,
  });
  const [deviceInfo, setDeviceInfo] = useState({
    deviceName: "",
    deviceModel: "",
    serialNumber: "",
    warrantyStart: "",
    warrantyEnd: "",
    purchaseDate: "",
    purchasePlace: "",
    serviceHistory: "",
  });

  const handleKisiTuruChange = (event) => {
    setKisiTuru(event.target.value);
  };

  const handleMusteriTipiChange = (event) => {
    setMusteriTipi(event.target.value);
  };

  const handleBayiTuruChange = (event) => {
    setBayiTuru(event.target.value);
  };

  const handleCommunicationPreferencesChange = (event) => {
    const { name, checked } = event.target;
    setCommunicationPreferences((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleDeviceInfoChange = (event) => {
    const { name, value } = event.target;
    setDeviceInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="container mt-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
        <div className="justify-content-start text-center">
          <h2>{kisiTuru === "Müşteri" ? "Müşteri Ekle" : "Bayi Ekle"}</h2>
        </div>
        <div className="d-flex justify-content-end">
          <a href="/" className="btn btn-danger">
            Anasayfaya Dön
          </a>
        </div>
      </div>

      {/* Kisi Turu (Müşteri/Bayi) Seçimi */}
      <div className="d-flex justify-content-start mb-4">
        <div className="form-check me-4">
          <input
            type="radio"
            id="Musteri"
            name="KisiTuru"
            value="Müşteri"
            checked={kisiTuru === "Müşteri"}
            onChange={handleKisiTuruChange}
            className="form-check-input bg-danger"
          />
          <label className="form-check-label" htmlFor="Musteri">
            Müşteri
          </label>
        </div>
        <div className="form-check">
          <input
            type="radio"
            id="Bayi"
            name="KisiTuru"
            value="Bayi"
            checked={kisiTuru === "Bayi"}
            onChange={handleKisiTuruChange}
            className="form-check-input bg-danger"
          />
          <label className="form-check-label" htmlFor="Bayi">
            Bayi
          </label>
        </div>
      </div>

      <form className="row g-3">
        {/* Ad Soyad / Firma Adı */}
        <div className="col-md-6">
          <label htmlFor="AdSoyad" className="form-label">
            {kisiTuru === "Müşteri" ? "Adı Soyadı" : "Firma Adı"}
          </label>
          <input
            type="text"
            className="form-control"
            id="AdSoyad"
            name="AdSoyad"
            placeholder={
              kisiTuru === "Müşteri" ? "Adı ve Soyadı girin" : "Firma Adı girin"
            }
            required
          />
        </div>

        <div className="col-md-6">
          <label htmlFor="TelNo" className="form-label">
            Telefon
          </label>
          <input
            type="text"
            id="TelNo"
            name="TelNo"
            className="form-control"
            placeholder="(531)-335-790-00"
            maxLength={17} // Format dahil maksimum 16 karakter
            required
            onInput={(e) => {
              let value = e.target.value.replace(/\D/g, ""); // Sadece rakamları al
              if (!value.startsWith("0")) {
                value = "0" + value; // Eğer başında 0 yoksa ekle
              }
              if (value.length > 11) {
                value = value.slice(0, 11); // Maksimum 11 rakam sınırı
              }
              // Formatlama
              value = value.replace(
                /^(\d{1})(\d{3})(\d{3})(\d{3})(\d{0,2})$/,
                (_, p1, p2, p3, p4, p5) =>
                  p5
                    ? `(${p2})-${p3}-${p4}-${p5}`
                    : p4
                    ? `(${p2})-${p3}-${p4}`
                    : p3
                    ? `(${p2})-${p3}`
                    : `(${p2})`
              );
              e.target.value = value; // Biçimlendirilmiş değeri input'a uygula
            }}
          />
        </div>

        <div className="col-md-6">
          <label htmlFor="Email" className="form-label">
            E-posta
          </label>
          <input
            type="email"
            name="Email"
            className="form-control"
            placeholder="E-posta adresinizi girin"
            required
          />
        </div>
        {/* Adres Bilgileri */}
        <div className="col-md-6">
          <label htmlFor="Il" className="form-label">
            İl
          </label>
          <select id="Il" name="Il" className="form-select" required>
            <option value="">İl seçin</option>
            <option value="1">Adana</option>
            <option value="2">Adıyaman</option>
            <option value="3">Afyonkarahisar</option>
            <option value="4">Ağrı</option>
            <option value="5">Amasya</option>
            <option value="6">Ankara</option>
            <option value="7">Antalya</option>
            <option value="8">Artvin</option>
            <option value="9">Aydın</option>
            <option value="10">Balıkesir</option>
            <option value="11">Bilecik</option>
            <option value="12">Bingöl</option>
            <option value="13">Bitlis</option>
            <option value="14">Bolu</option>
            <option value="15">Burdur</option>
            <option value="16">Bursa</option>
            <option value="17">Çanakkale</option>
            <option value="18">Çankırı</option>
            <option value="19">Çorum</option>
            <option value="20">Denizli</option>
            <option value="21">Diyarbakır</option>
            <option value="22">Edirne</option>
            <option value="23">Elazığ</option>
            <option value="24">Erzincan</option>
            <option value="25">Erzurum</option>
            <option value="26">Eskişehir</option>
            <option value="27">Gaziantep</option>
            <option value="28">Giresun</option>
            <option value="29">Gümüşhane</option>
            <option value="30">Hakkâri</option>
            <option value="31">Hatay</option>
            <option value="32">Isparta</option>
            <option value="33">Mersin</option>
            <option value="34">İstanbul</option>
            <option value="35">İzmir</option>
            <option value="36">Kars</option>
            <option value="37">Kastamonu</option>
            <option value="38">Kayseri</option>
            <option value="39">Kırklareli</option>
            <option value="40">Kırşehir</option>
            <option value="41">Kocaeli</option>
            <option value="42">Konya</option>
            <option value="43">Kütahya</option>
            <option value="44">Malatya</option>
            <option value="45">Manisa</option>
            <option value="46">Kahramanmaraş</option>
            <option value="47">Mardin</option>
            <option value="48">Muğla</option>
            <option value="49">Muş</option>
            <option value="50">Nevşehir</option>
            <option value="51">Niğde</option>
            <option value="52">Ordu</option>
            <option value="53">Rize</option>
            <option value="54">Sakarya</option>
            <option value="55">Samsun</option>
            <option value="56">Siirt</option>
            <option value="57">Sinop</option>
            <option value="58">Sivas</option>
            <option value="59">Tekirdağ</option>
            <option value="60">Tokat</option>
            <option value="61">Trabzon</option>
            <option value="62">Tunceli</option>
            <option value="63">Şanlıurfa</option>
            <option value="64">Uşak</option>
            <option value="65">Van</option>
            <option value="66">Yozgat</option>
            <option value="67">Zonguldak</option>
            <option value="68">Aksaray</option>
            <option value="69">Bayburt</option>
            <option value="70">Karaman</option>
            <option value="71">Kırıkkale</option>
            <option value="72">Batman</option>
            <option value="73">Şırnak</option>
            <option value="74">Bartın</option>
            <option value="75">Ardahan</option>
            <option value="76">Iğdır</option>
            <option value="77">Yalova</option>
            <option value="78">Karabük</option>
            <option value="79">Kilis</option>
            <option value="80">Osmaniye</option>
            <option value="81">Düzce</option>
          </select>
        </div>
        <div className="col-md-6">
          <label htmlFor="Ilce" className="form-label">
            İlçe
          </label>
          <input
            type="text"
            id="Ilce"
            name="Ilce"
            className="form-control"
            placeholder="İlçe adı"
            required
            onInput={(e) => {
              e.target.value = e.target.value.toUpperCase();
            }}
          />
        </div>

        <div className="col-md-6">
          <label htmlFor="TamAdres" className="form-label">
            Tam Adres
          </label>
          <input
            type="text"
            id="TamAdres"
            name="TamAdres"
            className="form-control"
            placeholder="Tam adresinizi girin"
            required
          />
        </div>

        {/* Bayi İçin Vergi Bilgileri */}
        {kisiTuru === "Bayi" && (
          <>
            <div className="col-md-6">
              <label htmlFor="VergiKimlikNo" className="form-label">
                Vergi Kimlik Numarası
              </label>
              <input
                type="text"
                className="form-control"
                id="VergiKimlikNo"
                name="VergiKimlikNo"
                placeholder="Vergi Kimlik Numarası"
                required
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="VergiDairesi" className="form-label">
                Vergi Dairesi
              </label>
              <input
                type="text"
                className="form-control"
                id="VergiDairesi"
                name="VergiDairesi"
                placeholder="Vergi Dairesini girin"
                required
              />
            </div>
          </>
        )}

        {/* İletişim Tercihleri */}
        {/* <div className="col-md-6">
                    <label className="form-label">İletişim Tercihleri</label>
                    <div className="form-check">
                        <input
                            type="checkbox"
                            name="sms"
                            checked={communicationPreferences.sms}
                            onChange={handleCommunicationPreferencesChange}
                            className="form-check-input"
                        />
                        <label className="form-check-label" htmlFor="sms">
                            SMS ile iletişim
                        </label>
                    </div>
                    <div className="form-check">
                        <input
                            type="checkbox"
                            name="email"
                            checked={communicationPreferences.email}
                            onChange={handleCommunicationPreferencesChange}
                            className="form-check-input"
                        />
                        <label className="form-check-label" htmlFor="email">
                            E-posta ile iletişim
                        </label>
                    </div>
                </div> */}

        {/* Müşteri Tipi / Bayi Türü */}
        {kisiTuru === "Müşteri" && (
          <div className="col-md-6">
            <label htmlFor="MusteriTipi" className="form-label">
              Müşteri Tipi
            </label>
            <select
              className="form-select"
              id="MusteriTipi"
              name="MusteriTipi"
              onChange={handleMusteriTipiChange}
              required
            >
              <option value="" disabled>
                Seçin
              </option>
              <option value="Bireysel">Bireysel</option>
              <option value="Kurumsal">Kurumsal</option>
            </select>
          </div>
        )}

        {kisiTuru === "Bayi" && (
          <div className="col-md-6">
            <label htmlFor="BayiTuru" className="form-label">
              Bayi Türü
            </label>
            <select
              className="form-select"
              id="BayiTuru"
              name="BayiTuru"
              onChange={handleBayiTuruChange}
              required
            >
              <option value="">Seçiniz</option>
              <option value="Distribütör">Distribütör</option>
              <option value="Bayi">Bayi</option>
              <option value="Perakendeci">Perakendeci</option>
            </select>
          </div>
        )}

        {/* Cihaz Bilgileri */}
        <div className="col-md-6">
          <label htmlFor="DeviceName" className="form-label">
            Cihaz Markası
          </label>
          <input
            type="text"
            name="DeviceName"
            className="form-control"
            id="DeviceName"
            placeholder="Cihaz Markası"
            value={deviceInfo.deviceName}
            onChange={handleDeviceInfoChange}
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="DeviceModel" className="form-label">
            Cihaz Modeli
          </label>
          <input
            type="text"
            name="DeviceModel"
            className="form-control"
            id="DeviceModel"
            placeholder="Cihaz modeli"
            value={deviceInfo.deviceModel}
            onChange={handleDeviceInfoChange}
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="SerialNumber" className="form-label">
            Seri Numarası
          </label>
          <input
            type="text"
            name="SerialNumber"
            className="form-control"
            id="SerialNumber"
            placeholder="Seri numarası"
            value={deviceInfo.serialNumber}
            onChange={handleDeviceInfoChange}
          />
        </div>

        <div className="col-md-12">
          <label htmlFor="ServiceHistory" className="form-label">
            Cihaz Bakım Geçmişi
          </label>
          <textarea
            name="ServiceHistory"
            className="form-control"
            id="ServiceHistory"
            rows="3"
            placeholder="Cihazın geçmiş bakım ve onarım bilgilerini girin"
            value={deviceInfo.serviceHistory}
            onChange={handleDeviceInfoChange}
          />
        </div>

        {/* Notlar ve Ekstra Alanlar */}
        <div className="col-md-12">
          <label htmlFor="Notes" className="form-label">
            Özel Notlar
          </label>
          <textarea
            name="Notes"
            className="form-control"
            id="Notes"
            rows="3"
            placeholder="Müşteri/bayi hakkında özel notlar"
          />
        </div>

        <div className="col-md-12">
          <button type="submit" className="btn btn-primary">
            {kisiTuru === "Müşteri" ? "Müşteri Ekle" : "Bayi Ekle"}
          </button>
        </div>
      </form>
    </div>
  );
}
