import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EditUserInfo() {
  const { id } = useParams(); // URL'deki id parametresini al
  const [user, setUser] = useState(null); // Kullanıcı bilgisi için state
  const [password, setPassword] = useState(""); // Şifre için ayrı state
  const [role, setRole] = useState(""); // Kullanıcı rolü için state
  const navigate = useNavigate();

  // Kullanıcı bilgilerini çek
  useEffect(() => {
    fetch(`http://192.168.0.201:2431/api/get-user/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setUser(data);
        setRole(data.role); // Kullanıcının mevcut rolünü state'e yükle
      })
      .catch((error) => console.error("Kullanıcı bilgisi alınamadı:", error));
  }, [id]);

  if (!user) {
    return <p>Yükleniyor...</p>;
  }

  // Formu gönderme işlemi
  const handleSubmit = (e) => {
    e.preventDefault();

    // Kullanıcı bilgilerini güncelleme isteği
    fetch(`http://192.168.0.201:2431/api/update-user/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...user,
        role: role, // Güncellenen rol bilgisini ekle
        password: password || undefined, // Şifre boşsa mevcut şifre korunur
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Güncelleme başarısız!");
        }
        return response.json();
      })
      .then(() => {
        alert("Kullanıcı bilgileri başarıyla güncellendi!");
        navigate("/settings"); // Ayarlar sayfasına yönlendir
      })
      .catch((error) => {
        console.error("Güncelleme hatası:", error);
        alert("Bir hata oluştu, tekrar deneyin.");
      });
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center">Kullanıcı Bilgilerini Düzenle</h2>
      <form className="mt-4" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Kullanıcı Adı</label>
          <input
            type="text"
            className="form-control"
            value={user.username}
            onChange={(e) => setUser({ ...user, username: e.target.value })}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Rol</label>
          <select
            className="form-control"
            value={role} // Mevcut rolü seçili olarak göster
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="admin">admin</option>
            <option value="personel">personel</option>
            <option value="monitor">monitor</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Yeni Şifre</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Kaydet
        </button>
      </form>
    </div>
  );
}
