import React, { useState } from "react";
import { FaBars, FaTimes, FaArchive } from "react-icons/fa";
import { IoHome } from "react-icons/io5";
import { IoMdLogOut } from "react-icons/io";
import { IoSettingsSharp } from "react-icons/io5";
// import { FaSortUp, FaSortDown } from "react-icons/fa"; // İkonları ekledik
import "../css/SidePanelCom.css";

export default function SidePanel({
  searchTerm,
  setSearchTerm,
  filtre,
  setFiltre,
  garantiFiltre,
  setGarantiFiltre,
  filtreTarihi,
  setFiltreTarihi,
  exportAllRecordsToExcel,
  exportFilteredRecordsToExcel,
  exportSelectedRecordsToExcel,
  isAuthorized,
  userRole,
  handleLogout,
}) {
  const [isToolsPanelOpen, setIsToolsPanelOpen] = useState(false);

  const toggleToolsPanel = () => {
    setIsToolsPanelOpen(!isToolsPanelOpen);
  };

  return (
    <div className="side-menu-container">
      {/* Menü Aç/Kapa Butonu */}
      <div className="menu-toggle" onClick={toggleToolsPanel}>
        {isToolsPanelOpen ? <FaTimes size={25} /> : <FaBars size={25} />}
      </div>

      {/* Soldan Açılan Menü */}
      <div className={`side-menu ${isToolsPanelOpen ? "open" : ""}`}>
        <div className="menu-content">
          <input
            type="text"
            placeholder="Arama yapın..."
            className="form-control mb-3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <label className="fs-6 fw-light">Durum</label>
          <select
            className="form-control mb-3"
            value={filtre}
            onChange={(e) => setFiltre(e.target.value)}
          >
            <option value="Hepsi">Hepsi</option>
            <option value="Onarılıyor">Onarılıyor</option>
            <option value="Bekliyor">Bekliyor</option>
            <option value="Hazırlanıyor">Hazırlanıyor</option>
            <option value="Tamamlandı">Tamamlandı</option>
          </select>

          <label className="fs-6 fw-light">Garanti</label>
          <select
            className="form-control mb-3"
            value={garantiFiltre}
            onChange={(e) => setGarantiFiltre(e.target.value)}
          >
            <option value="Hepsi">Hepsi</option>
            <option value="Garantili">Garantili</option>
            <option value="Garantisiz">Garantisiz</option>
          </select>

          <label className="fs-6 fw-light">Tarih</label>
          <input
            type="date"
            className="form-control mb-3"
            value={filtreTarihi}
            onChange={(e) => setFiltreTarihi(e.target.value)}
          />

          {/* Excel İşlemleri Butonları */}
          <button className="btn btn-success w-100 mb-2" onClick={exportAllRecordsToExcel}>
            Tüm Verileri Excele Aktar
          </button>
          <button className="btn btn-warning w-100 mb-2" onClick={exportFilteredRecordsToExcel}>
            Filtreyi Excele Aktar
          </button>
          <button className="btn btn-info w-100 mb-2" onClick={exportSelectedRecordsToExcel}>
            Seçilmişi Excele Aktar
          </button>

          {/* Menü Butonları */}
          <a href="/" className="btn btn-primary w-100 mb-2">
            <IoHome style={{ width: "30px", height: "30px" }} /> Anasayfa
          </a>
          <a href="/delivered-products" className="btn btn-warning w-100 mb-2">
            <FaArchive style={{ width: "30px", height: "30px" }} /> Teslim Edilenler
          </a>

          {isAuthorized && userRole === "admin" && (
            <>
              <a href="/settings" className="btn btn-danger w-100 mb-2">
                <IoSettingsSharp style={{ width: "30px", height: "30px" }} /> Ayarlar
              </a>
              <a href="/add-product" className="btn btn-info w-100 mb-2">
                Ürün Ekle
              </a>
              <a href="/add-customer" className="btn btn-secondary w-100 mb-2">
                Müşteri/Bayi Ekle
              </a>
            </>
          )}

          <button className="btn btn-danger w-100 mt-3" onClick={handleLogout}>
            <IoMdLogOut style={{ width: "30px", height: "30px" }} /> Çıkış Yap
          </button>
        </div>
      </div>
    </div>
  );
}
