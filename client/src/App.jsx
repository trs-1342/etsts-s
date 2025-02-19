import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  matchPath,
} from "react-router-dom";
import { useUser, UserProvider } from "./pages/UserContext";
import "./App.css";
import LoginPanelPage from "./pages/LoginPanelPage";
import HomePage from "./pages/HomePage";
import ControlledRecordsPage from "./pages/ControlledRecordsPage.jsx";
import ProductInfoPage from "./pages/ProductInfoPage";
import RecordFormPage from "./pages/RecordFormPage";
import ShowCostumerRecordsPage from "./pages/ShowCostumerRecordsPage";
import ShowUserInfoPage from "./pages/ShowUserInfoPage";
import ChangeSettingsPage from "./pages/ChangeSettingsPage";
import SettingsPage from "./pages/SettingsPage.jsx";
import AddCustomerPage from "./pages/AddCustomerPage";
import AddProductPage from "./pages/AddProductPage";
import AddUserPage from "./pages/AddUserPage";
import EditUserPage from "./pages/EditUserInfoPage";
import DeliveredProductsPage from "./pages/DeliveredProductsPage";
import NotFoundPage from "./pages/NotFoundPage";
import UnauthorizedPage from "./pages/UnauthorizedPage.jsx";
import ShowUserStatusPage from "./pages/ShowUserStatusPage";
import YouCantSee from "./pages/YouCantSee.jsx";
import AboutPage from "./pages/AboutPage.jsx";

function AppContent() {
  const { user } = useUser();
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const titles = {
      "/": "Ana Sayfa",
      "/login": "Giriş Yap",
      "/about": "Hakkında",
      "/product-info/:fishNo": "Ürün Bilgisi - {fishNo}",
      "/record/:fishNo": "Kayıt Düzenleme - {fishNo}",
      "/user/:id": "Kullanıcı Bilgisi - {id}",
      "/show-costumers-records": "Müşteri Kayıtları",
      "/show-user-info/:id": "Kullanıcı Yetkisi - {id}",
      "/settings": "Ayarlar",
      "/change-settings": "Ayarları Değiştir",
      "/add-customer": "Müşteri Ekle",
      "/add-product": "Ürün Ekle",
      "/add-user": "Kullanıcı Ekle",
      "/edit-user/:id": "Kullanıcı Düzenle - {id}",
      "/delivered-products": "Arşivlenmiş Ürünler",
      "/unauthorized": "Yetkisiz Giriş",
      "/you-cant-see": "Erişim Engellendi",
      "/show-user-status": "Kullanıcı Durumu",
      "/crecord": "Kontrollü Kayıtlar",
      // "*": "Sayfa Bulunamadı",
    };

    let pageTitle = "ETSTS"; // default başlık

    Object.keys(titles).forEach((pattern) => {
      const match = matchPath(pattern, location.pathname);
      if (match) {
        pageTitle = titles[pattern];

        if (match.params) {
          Object.keys(match.params).forEach((key) => {
            pageTitle = pageTitle.replace(`{${key}}`, match.params[key]);
          });
        }
      }
    });

    document.title = pageTitle;
  }, [location]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchPermissions = async () => {
      try {
        const response = await fetch(
          `http://192.168.0.138:2431/api/get-user-pages/${user.username}`
        );
        const data = await response.json();

        if (response.ok) {
          setPermissions(data.role === "admin" ? "admin" : data || {});
        } else {
          console.error("Yetkilendirme hatası:", data.message);
          setPermissions({});
        }
      } catch (error) {
        console.error("Yetki çekme hatası:", error);
        setPermissions({});
      }
      setLoading(false);
    };

    fetchPermissions();
  }, [user]);

  if (loading) {
    return <div className="container bg-info rounded">Yükleniyor...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPanelPage />} />
      {/* <Route path="/" element={<Navigate to={<HomePage />} />} /> */}
      {!user ? (
        <Route path="*" element={<Navigate to="/login" />} />
      ) : permissions === "admin" ? (
        <>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/product-info/:fishNo" element={<ProductInfoPage />} />
          <Route path="/record/:fishNo" element={<RecordFormPage />} />
          <Route path="/user/:id" element={<ShowUserInfoPage />} />
          <Route
            path="/show-costumers-records"
            element={<ShowCostumerRecordsPage />}
          />
          <Route path="/show-user-info/:id" element={<ShowUserInfoPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/change-settings" element={<ChangeSettingsPage />} />
          <Route path="/add-customer" element={<AddCustomerPage />} />
          <Route path="/add-product" element={<AddProductPage />} />
          <Route path="/add-user" element={<AddUserPage />} />
          <Route path="/edit-user/:id" element={<EditUserPage />} />
          <Route
            path="/delivered-products"
            element={<DeliveredProductsPage />}
          />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/you-cant-see" element={<YouCantSee />} />
          <Route path="/show-user-status" element={<ShowUserStatusPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </>
      ) : (
        <>
          <Route path="*" element={<Navigate to="/" />} />
          {permissions?.HomePage ? (
            <Route path="/" element={<HomePage />} />
          ) : (
            <Route path="/" element={<ShowUserStatusPage />} />
          )}
          {permissions?.AddCustomerPage ? (
            <Route path="/add-customer-page" element={<AddCustomerPage />} />
          ) : (
            <Route path="/add-customer-page" element={<YouCantSee />} />
          )}
          {permissions?.DeliveredProductsPage ? (
            <Route
              path="/delivered-products"
              element={<DeliveredProductsPage />}
            />
          ) : (
            <Route path="/delivered-products" element={<YouCantSee />} />
          )}
          {/* {permissions?.ControlledRecordsPage ? (
            <Route path="/crecord" element={<ControlledRecordsPage />} />
          ) : (
            <Route path="/crecord" element={<YouCantSee />} />
          )} */}
          {permissions?.ProductInfoPage ? (
            <Route path="/product-info/:fishNo" element={<ProductInfoPage />} />
          ) : (
            <Route path="/product-info/:fishNo" element={<YouCantSee />} />
          )}
          {permissions?.RecordFormPage ? (
            <Route path="/record/:fishNo" element={<RecordFormPage />} />
          ) : (
            <Route path="/record/:fishNo" element={<YouCantSee />} />
          )}
          <Route path="/crecord" element={<ControlledRecordsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </>
      )}
    </Routes>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
}

export default App;
