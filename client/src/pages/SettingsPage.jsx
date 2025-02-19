import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const [users, setUsers] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const navigate = useNavigate();

  // Kullanıcı listesini getir
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://192.168.0.138:2431/api/get-users-data");
        if (!response.ok) throw new Error("Kullanıcı listesi alınamadı!");

        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Veri çekme hatası:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Yetki kontrolü
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("http://192.168.0.138:2431/api/checkAdmin", {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Yetki kontrolü başarısız!");

        const data = await response.json();
        setIsAuthorized(data.isAuthorized);
        setUserRole(data.role);
      } catch (error) {
        console.error("Yetki kontrolü hatası:", error.message);
      }
    };

    fetchUser();
  }, []);

  // Kullanıcı silme işlemi
  const handleDelete = async (userId) => {
    if (!window.confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) return;

    try {
      const response = await fetch(`http://192.168.0.138:2431/api/delete-user/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Silme işlemi başarısız!");

      setUsers(users.filter((user) => user.id !== userId));
      alert("Kullanıcı başarıyla silindi!");
    } catch (error) {
      console.error("Silme hatası:", error);
      alert("Bir hata oluştu, tekrar deneyin.");
    }
  };

  // Yüklenme durumu
  if (loading) {
    return (
      <div className="container-xl mt-5 text-center">
        <h3>Yükleniyor...</h3>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  // Yetkisiz kullanıcıları yönlendir
  if (!isAuthorized || (userRole !== "admin" && userRole !== "personel")) {
    return (
      <div className="container-xl mt-5 text-center">
        <h3>Yetkiniz Yok!</h3>
        <p>Bu sayfayı görüntülemek için yeterli yetkiniz yok.</p>
        <a className="btn btn-danger mx-2" href="/">Anasayfa</a>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      // Backend'e çıkış işlemi için istek gönder
      const response = await fetch("http://192.168.0.138:2431/api/logout", {
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

  return (
    <div className="container-xl mt-5 rounded bg-light shadow-lg pb-4">
      <div className="text-center mt-4 mb-4">
        <h2 className="text-primary">Admin Ayarları</h2>
      </div>
      <div className="row justify-content-center pb-4">
        {users.length > 0 ? (
          users.map((user) => (
            <div key={user.id} className="col-md-4 mb-4 p-2">
              <div className="card shadow-sm" style={{ width: "25rem" }}>
                <div className="card-body">
                  <h5 className="card-title">
                    <strong>Username:</strong> <a href={`/user/${user.id}`}>{user.username}</a>
                  </h5>
                  <p className="card-text"><strong>Email:</strong> {user.email}</p>
                  <p className="card-text"><strong>Rol:</strong> {user.role}</p>
                  <p className="card-text">{new Date(user.created_at).toLocaleDateString()}</p>
                  {
                    (!isAuthorized || (userRole !== "admin" && userRole !== "personel")) ? (
                      // <p className="card-text text-danger">Bu kullanıcıyı düzenleme yetkiniz yok!</p>
                      null
                    ) :
                      (<div className="d-flex justify-content-between">
                        <button className="btn btn-primary" onClick={() => navigate(`/edit-user/${user.id}`)}>
                          Düzenle
                        </button>
                        <button className="btn btn-danger" onClick={() => handleDelete(user.id)}>
                          Sil
                        </button>
                      </div>)
                  }
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>Kullanıcı bulunamadı.</p>
        )}
      </div>
      <div className="text-center">
        {
          (!isAuthorized || (userRole !== "admin" && userRole !== "personel")) ? (
            // <p className="card-text text-danger">Ayarlara erişme yetkiniz yok!</p>
            null
          ) :
            (<div className="text-center mt-4">
              <a className="btn btn-danger mx-2" href="/change-settings">Yetkileri Düzelt</a>
              <a className="btn btn-success mx-2" href="/add-user">Kullanıcı Ekle</a>
            </div>)
        }
        <a className="btn btn-success mx-2 mt-4" href="/">Anasayfa</a>
        <br />
        <a className="btn btn-danger rounded-1 mt-2" onClick={handleLogout}>
          {/* <IoMdLogOut style={{ width: "30px", height: "30px" }} /> */}
          Çıkış Yap
        </a>
      </div>
    </div>
  );
}
