import React, { useState } from "react";
import { FaBars, FaTimes, FaArchive } from "react-icons/fa";
import { IoHome } from "react-icons/io5";
import { IoMdLogOut } from "react-icons/io";
import { IoSettingsSharp } from "react-icons/io5";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/ToolsPanel.css";

const ToolsPanel = ({
  isAuthorized,
  userRole,
  handleLogout,
  exportAllRecordsToExcel,
  exportFilteredRecordsToExcel,
  exportSelectedRecordsToExcel,
  setFiltre,
  setGarantiFiltre,
  setFiltreTarihi,
  setSearchTerm,
  searchTerm,
}) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <>
      <div
        className="tools-panel-toggle"
        onClick={() => setIsPanelOpen(!isPanelOpen)}
      >
        {isPanelOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </div>

      {isPanelOpen && (
        <div className="tools-panel-overlay">
          <div className="tools-panel-container">
            <div className="tools-panel-header">
              <h3>Araçlar Paneli</h3>
              {/* <FaTimes
                className="close-icon"
                onClick={() => setIsPanelOpen(false)}
              /> */}
            </div>
            <div className="tools-panel-content">
              <input
                type="text"
                placeholder="Arama yapın..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control"
              />
              <select
                className="form-control"
                onChange={(e) => setFiltre(e.target.value)}
              >
                <option value="Hepsi">Tüm Durumlar</option>
                <option value="Onarılıyor">Onarılıyor</option>
                <option value="Tamamlandı">Tamamlandı</option>
                <option value="Bekliyor">Bekliyor</option>
                <option value="İade Edildi">İade Edildi</option>
                <option value="Teslim Edildi">Teslim Edildi</option>
                <option value="Onay Bekliyor">Onay Bekliyor</option>
                <option value="Yedek Parça Bekliyor">
                  Yedek Parça Bekliyor
                </option>
                <option value="Problemli Ürün">Problemli Ürün</option>
                <option value="Teslim Alınmadı">Teslim Alınmadı</option>
                <option value="Hazırlanıyor">Hazırlanıyor</option>
                <option value="Arıza Tespiti">Arıza Tespiti</option>
                <option value="Değişim Tamamlandı">Değişim Tamamlandı</option>
                <option value="Faturalandı">Faturalandı</option>
                <option value="Garantili Onarım">Garantili Onarım</option>
                <option value="Teslim Durumu">Teslim Durumu</option>
                <option value="Hurdaya Ayrıldı">Hurdaya Ayrıldı</option>
                <option value="İade Tamamlandı">İade Tamamlandı</option>
                <option value="İade Toplanıyor">İade Toplanıyor</option>
                <option value="Kiralama">Kiralama</option>
                <option value="Montaj Yapılacak">Montaj Yapılacak</option>
                <option value="Onarım Aşamasında">Onarım Aşamasında</option>
                <option value="Onay Durumu">Onay Durumu</option>
                <option value="Parça Durumu">Parça Durumu</option>
                <option value="Periyodik Bakım">Periyodik Bakım</option>
                <option value="Satın Alındı">Satın Alındı</option>
                <option value="Servis Durumu">Servis Durumu</option>
                <option value="Sipariş Durumu">Sipariş Durumu</option>
                <option value="Tahsilat Bekliyor">Tahsilat Bekliyor</option>
                <option value="Ücret Bildirilecek">Ücret Bildirilecek</option>
              </select>
              <select
                className="form-control"
                onChange={(e) => setGarantiFiltre(e.target.value)}
              >
                <option value="Hepsi">Tüm Garanti Durumları</option>
                <option value="Garantili">Garantili</option>
                <option value="Garantisiz">Garantisiz</option>
                <option value="Sözleşmeli">Sözleşmeli</option>
                <option value="Belirsiz">Belirsiz</option>
              </select>
              <input
                type="date"
                className="form-control"
                onChange={(e) => setFiltreTarihi(e.target.value)}
              />
              <button
                className="btn btn-success"
                onClick={exportAllRecordsToExcel}
              >
                Tüm Verileri Excele Aktar
              </button>
              <button
                className="btn btn-success"
                onClick={exportFilteredRecordsToExcel}
              >
                Filtreyi Excele Aktar
              </button>
              <button
                className="btn btn-success"
                onClick={exportSelectedRecordsToExcel}
              >
                Seçilmişi Excele Aktar
              </button>
              {isAuthorized && userRole === "admin" && (
                <>
                  <button
                    className="btn btn-info"
                    onClick={() => (window.location.href = "/add-product")}
                  >
                    Ürün Ekle
                  </button>
                  <button
                    className="btn btn-info"
                    onClick={() => (window.location.href = "/add-customer")}
                  >
                    Müşteri/Bayi Ekle
                  </button>
                  <button
                    className="btn btn-warning"
                    onClick={() => (window.location.href = "/settings")}
                  >
                    Ayarlara Git
                  </button>
                </>
              )}
              <a className="btn btn-warning" href="/delivered-products">
                Teslim Edilmiş Ürünler <FaArchive />
              </a>
              <button className="btn btn-danger" onClick={handleLogout}>
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ToolsPanel;
