import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ShowUserInfoPage() {
  const { id } = useParams(); // URL'deki kullanıcı ID'sini al
  const [user, setUser] = useState(null); // Kullanıcı bilgisi için state
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch("http://192.168.0.201:2431/api/logout", {
        method: "POST",
        credentials: "include", // Çerezleri gönder
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Çıkış işlemi başarısız oldu.");
      }

      // alert("Çıkış başarılı.");
      window.location.href = "http://192.168.0.201/";
    } catch (error) {
      console.error("Çıkış hatası:", error.message);
      // alert(`Çıkış Yapıldı, Çıkış hatası: ${error.message}`);
      window.location.href = "http://192.168.0.201/";
    }
  };

  // Kullanıcı bilgilerini çek
  useEffect(() => {
    fetch(`http://192.168.0.201:2431/api/get-user/${id}`)
      .then((response) => response.json())
      .then((data) => setUser(data))
      .catch((error) => console.error("Kullanıcı bilgisi alınamadı:", error));
  }, [id]);

  // Kullanıcıyı sil
  const handleDelete = () => {
    if (window.confirm("Bu kullanıcıyı silmek istediğinize emin misiniz?")) {
      fetch(`http://192.168.0.201:2431/api/delete-user/${id}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Kullanıcı silinemedi!");
          }
          alert("Kullanıcı başarıyla silindi!");
          navigate("/settings"); // Kullanıcı listesine yönlendir
        })
        .catch((error) => {
          console.error("Kullanıcı silme hatası:", error);
          alert("Bir hata oluştu, lütfen tekrar deneyin.");
        });
    }
  };

  if (!user) {
    return <p>Yükleniyor...</p>;
  }

  return (
    <div className="container mt-5">
      <h2 className="text-center">Kullanıcı Bilgileri</h2>
      <div className="card mt-4 shadow-lg">
        <div className="card-body">
          <h5 className="card-title">
            <strong>Kullanıcı Adı:</strong> {user.username} (#{user.id})
          </h5>
          <p className="card-text">
            <strong>Email:</strong> {user.email}
          </p>
          <p className="card-text">
            <strong>Rol:</strong> {user.role}
          </p>
          <p className="card-text">
            <strong>Oluşturulma Tarihi:</strong>{" "}
            {new Date(user.created_at).toLocaleDateString()}
          </p>
          <div className="d-flex justify-content-between">
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/edit-user/${id}`)} // Düzenleme sayfasına git
            >
              Düzenle
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              Sil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
