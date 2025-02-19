import React, { useEffect, useState } from "react";
import { useUser } from "./UserContext";
import { useNavigate } from "react-router-dom";

export default function ShowUserStatusPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState(() => {
    const storedPermissions = localStorage.getItem("permissions");
    return storedPermissions ? JSON.parse(storedPermissions) : null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchPermissions = async () => {
      try {
        const response = await fetch(
          `http://192.168.0.138:2431/api/get-user-pages/${user.username}`,
          {
            credentials: "include",
          }
        );
        if (!response.ok) throw new Error("Yetkilendirme hatası");
        const data = await response.json();
        setPermissions(data);
        localStorage.setItem("permissions", JSON.stringify(data));
      } catch (error) {
        console.error("Yetki bilgisi alınırken hata:", error);
        setError(
          "Yetkiler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPermissions();
  }, [user]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!user && storedUser) {
      setTimeout(() => {
        navigate(storedUser.role === "admin" ? "/" : "/show-user-status");
      }, 100);
    }
  }, [user, navigate]);

  if (loading)
    return <div className="container text-center">Yetkiler yükleniyor...</div>;

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
    <div className="container-sm w-50 mt-4">
      {/* <h1 className="text-center">Kullanıcı Yetki Durumu</h1>
      <h3>Kullanıcı: {user?.username}</h3>
      <h3>Rol: {user?.role}</h3> */}
      {error && (
        <div className="alert alert-danger">
          {error}
          <button
            className="btn btn-primary ms-3"
            onClick={() => window.location.reload()}
          >
            Sayfayı Yenile
          </button>
          <button
            className="ms-5 btn btn-danger ms-3"
            onClick={() => window.location.reload()}
          >
            Çıkış Yap
          </button>
        </div>
      )}

      {user?.role === "admin" ? (
        <>
          <div className="alert alert-success">
            <p className="mt-4 ps-5 fs-1">
              Admin olduğnuz için tam yetkiniz var!
            </p>
            <figcaption className="blockquote-footer ps-5 fw-bolder">
              Kullanıcı:{" "}
              <cite title="Source Title">
                {user?.username}, Rol: {user?.role}
              </cite>
            </figcaption>
            <div className="ps-5">
              <a href="/" type="button" className="btn btn-outline-primary">
                Anasayfa'ya Git
              </a>
            </div>
          </div>
        </>
      ) : (
        <>
          <h4>Görebildiğiniz Veriler:</h4>
          {permissions && Object.keys(permissions).length > 0 ? (
            <>
              <h5>Sayfalar:</h5>
              <div className="row">
                {Object.entries(permissions)
                  .filter(([key, value]) => value === 1 && key.includes("Page"))
                  .map(([page]) => {
                    const pageRoutes = {
                      HomePage: "/",
                      DeliveredProductsPage: "/delivered-products",
                      RecordFormPage: "/record/:fishNo",
                      ShowCostumerRecordsPage: "/show-costumers-records",
                      // * ShowUserInfoPage: `/show-user-info/${user.id}`,
                      ChangeSettingsPage: "/change-settings",
                      AddCustomerPage: "/add-customer",
                      AddProductPage: "/add-product",
                      AddUserPage: "/add-user",
                      EditUserPage: "/edit-user/:id",
                      ShowUserStatusPage: "/show-user-status",
                      ProductInfoPage: "/product-info/:fishNo",
                    };
                    return (
                      <div key={page} className="col-md-3">
                        {page === "ProductInfoPage" ? (
                          <div
                            className="card text-center p-2 m-2"
                            style={{
                              maxWidth: "500px",
                              overflowX: "scroll",
                              maxHeight: "70px",
                            }}
                          >
                            <p className="break">
                              Ürün Görüntülemek için ´/product-info/:fishNo`
                              girmeniz gerek
                            </p>
                          </div>
                        ) : page === "EditUserPage" ? (
                          <div
                            className="card text-center p-2 m-2"
                            style={{
                              maxWidth: "500px",
                              overflowX: "scroll",
                              maxHeight: "70px",
                            }}
                          >
                            <p className="break">
                              Kullanıcı Görüntülemek için ´/user/:id` girmeniz
                              gerek
                            </p>
                          </div>
                        ) : page === "RecordFormPage" ? (
                          <div
                            className="card text-center p-2 m-2"
                            style={{
                              maxWidth: "500px",
                              overflowX: "scroll",
                              maxHeight: "70px",
                            }}
                          >
                            <p className="break">
                              Kayıt Görüntülemek için ´/record/:fishNo` girmeniz
                              gerek
                            </p>
                          </div>
                        ) : (
                          <div className="card text-center p-2 m-2">
                            <a
                              href={
                                pageRoutes[page] ||
                                `/${page.replace("Page", "").toLowerCase()}`
                              }
                              className="text-decoration-none"
                            >
                              {page.replace("Page", "")}
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
              <h5 className="mt-4">Veri Sütunları:</h5>
              <ul className="row">
                {Object.entries(permissions)
                  .filter(
                    ([key, value]) => value === 1 && !key.includes("Page")
                  )
                  .map(([column]) => (
                    <div key={column} className="col-md-3">
                      <div className="card text-center p-2 m-2">
                        <p className="center mt-3">{column}</p>
                      </div>
                    </div>
                  ))}
              </ul>
            </>
          ) : (
            <p className="text-danger">Hiçbir veriye erişiminiz yok.</p>
          )}
          <div className="center text-center">
            <a className="btn btn-primary rounded-1 me-4" href="/crecord">
              {/* <IoMdLogOut style={{ width: "30px", height: "30px" }} /> */}
              Tabloya Git
            </a>
            <a className="btn btn-danger rounded-1" onClick={handleLogout}>
              {/* <IoMdLogOut style={{ width: "30px", height: "30px" }} /> */}
              Çıkış Yap
            </a>
          </div>
        </>
      )}
    </div>
  );
}
