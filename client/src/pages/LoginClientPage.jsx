import "bootstrap/dist/css/bootstrap.min.css";
import "../css/LoginClientPage.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginClientPage() {
  const [adSoyad, setAdSoyad] = useState("");
  const [fishNo, setFishNo] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  //   const HOST = process.env.API_HOST;
  // ✅ Oturum Açık mı Kontrol Et
  useEffect(() => {
    const storedUser = localStorage.getItem("userSession");
    if (storedUser) {
      navigate("/client"); // Eğer oturum varsa direkt yönlendir
    }
  }, [navigate]);

  const handleSorgula = async () => {
    setError("");

    try {
      const response = await fetch(
        `http://192.168.0.201:80/api-client/sorgula`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ adSoyad, fishNo }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // ✅ Kullanıcı verisini LocalStorage'a kaydet
        localStorage.setItem("userSession", JSON.stringify(data.record));

        // ✅ ClientPage'e yönlendir
        navigate("/client");
      } else {
        setError("Kayıt bulunamadı!");
      }
    } catch (error) {
      setError("Sunucu hatası! Daha sonra tekrar deneyin.");
      console.error(error);
    }
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center vh-100">
      <div className="text-center p-4 shadow rounded bg-light w-75">
        <h1 className="fw-bold text-primary">Müşteri Ekranı</h1>
        <p className="lead mt-3">
          Fish No ve Ad Soyad bilgisi ile kaydınızı sorgulayabilirsiniz.
        </p>

        <div className="mt-4">
          <div className="mb-3">
            <label className="form-label fw-bold">Ad Soyad</label>
            <input
              type="text"
              className="form-control"
              placeholder="Adınızı ve soyadınızı girin"
              value={adSoyad}
              onChange={(e) => setAdSoyad(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Fish No</label>
            <input
              type="text"
              className="form-control"
              placeholder="Fish numaranızı girin"
              value={fishNo}
              onChange={(e) => setFishNo(e.target.value)}
            />
          </div>

          {error && <p className="text-danger">{error}</p>}

          <button
            className="btn btn-primary mt-3 px-4 py-2"
            onClick={handleSorgula}
          >
            Sorgula
          </button>
        </div>
      </div>
    </div>
  );
}
