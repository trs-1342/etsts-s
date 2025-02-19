import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";
import "../css/ChangeSettingsPagecss.css";

export default function ChangeSettingsPage() {
  const [columns] = useState({
    group1: [
      "fishNo",
      "AdSoyad",
      "TeslimAlmaTarihi",
      "TelNo",
      "Urun",
      "Marka",
      "Model",
      "SeriNo",
      "GarantiDurumu",
      "TeslimAlan",
      "Teknisyen",
      "Ucret",
      "Sorunlar",
      "BirlikteAlinanlar",
      "Aciklama",
      "Yapilanlar",
      "HazirlamaTarihi",
      "TeslimEtmeTarihi",
      "Durum"
    ],
    group2: [
      "AddCustomerPage",
      "DeliveredProductsPage",
      "HomePage",
      "ProductInfoPage",
      "RecordFormPage",
      "ShowCostumerRecordsPage",
      "ShowUserInfoPage",
      "ChangeSettingsPage",
      // "AddCustomer",
      "AddProdPage",
      "AddUserPage",
      // "ShowUserStatusPage",
      "EditUserPage",
    ]
  });

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedColumns, setSelectedColumns] = useState({});
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://192.168.0.138:2431/api/get-users-data");
        setUsers(response.data);
      } catch (error) {
        console.error("Hata:", error);
        alert("Kullanıcı verileri alınırken bir hata oluştu.");
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!selectedUser) {
      setSelectedColumns({}); // Kullanıcı seçilmediğinde tüm seçimleri temizle
      return;
    }

    // kullanıcı değiştiğinde önce eski yetkileri temizle
    setSelectedColumns({});

    const fetchUserPermissions = async () => {
      try {
        const response = await axios.get(`http://192.168.0.138:2431/api/get-user-permissions/${selectedUser}`);
        const userPermissions = response.data;
        let updatedColumns = {};
        [...columns.group1, ...columns.group2].forEach((col) => {
          updatedColumns[col] = userPermissions[col] || 0;
        });
        setSelectedColumns(updatedColumns);
      } catch (error) {
        console.error("Yetki bilgisi alınırken hata oldu", error);
        alert("Kullanıcının yetki bilgisi yok veya bulunamadı.");
      }
    };
    fetchUserPermissions();
  }, [selectedUser]);

  useEffect(() => {
    if (user && user.role !== "admin" && selectedUser && selectedColumns) {
      const allowedPages = Object.keys(selectedColumns).filter((col) => selectedColumns[col] === 1);
      if (!allowedPages.includes(window.location.pathname.replace("/", ""))) {
        navigate("/you-cant-enter-this-page");
      }
    }
  }, [selectedColumns, user]);

  const handleColumnChange = (column) => {
    setSelectedColumns((prev) => ({
      ...prev,
      [column]: prev[column] === 1 ? 0 : 1 // Seçiliyse 0 yap, değilse 1 yap
    }));
  };

  const handleApplySettings = async () => {
    if (!selectedUser) {
      alert("Kullanıcı seçmelisiniz!");
      return;
    }

    if (Object.keys(selectedColumns).length === 0) {
      alert("En az bir yetki seçmelisiniz!");
      return;
    }

    try {
      console.log("Gönderilen Veri:", { username: selectedUser, permissions: selectedColumns });

      const response = await axios.post("http://192.168.0.138:2431/api/change-user-settings", {
        username: selectedUser,
        permissions: selectedColumns,
      });

      alert(response.data.message);
      navigate("/settings");
    } catch (error) {
      console.error("Hata:", error);
      alert("Ayarlar güncellenirken bir hata oluştu.");
    }
  };


  return (
    <div className="container mt-4">
      <h3 className="mb-3">Kullanıcı Seçin ve Başlıkları Belirleyin</h3>

      {/* Kullanıcı seçimi */}
      <select className="form-control mb-3" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
        <option value="">Bir kullanıcı seçin</option>
        {users
          .filter((user) => user.role !== "admin") // Admin olanları çıkart
          .map((user) => (
            <option key={user.id} value={user.username}>
              {user.username} ({user.role})
            </option>
          ))}
      </select>


      {/* Checkbox grupları */}
      <div className="mb-4">
        <h4>Genel Bilgiler</h4>
        <div className="row">
          {columns.group1.map((column) => (
            <div key={column} className="col-6 col-md-4 col-lg-3 mb-2">
              <div className="form-check custom-checkbox">
                <input
                  className="form-check-input bg-warning"
                  style={{ border: '2px solid black' }}
                  type="checkbox"
                  id={column}
                  // disabled='true'
                  checked={selectedColumns[column] === 1}
                  onChange={() => handleColumnChange(column)}
                />
                <label className="form-check-label" htmlFor={column}>
                  {column}
                </label>
              </div>
            </div>
          ))}
        </div>

        <h4 className="mt-3">Sayfa Yetkileri</h4>
        <div className="row">
          {columns.group2.map((column) => (
            <div key={column} className="col-6 col-md-4 col-lg-3 mb-2">
              <div className="form-check custom-checkbox">
                {
                  column === "ShowUserStatusPage"
                    ? (
                      <>
                        <input
                          className="form-check-input bg-warning"
                          style={{ border: '2px solid black' }}
                          type="checkbox"
                          id={column}
                          // disabled={column === "ShowUserStatusPage" && selectedColumns["ShowUserStatusPage"] === 1}
                          disabled='true'
                          checked='checked'
                          onChange={() => handleColumnChange(column)}
                        />
                        <label className="form-check-label" htmlFor={column}>
                          {column}
                        </label>
                      </>
                    )
                    : (
                      <>
                        <input
                          className="form-check-input bg-warning"
                          style={{ border: '2px solid black' }}
                          type="checkbox"
                          id={column}
                          // disabled={column === "ShowUserStatusPage" && selectedColumns["ShowUserStatusPage"] === 0}
                          checked={selectedColumns[column] === 1 ? 1 : 0}
                          onChange={() => handleColumnChange(column)}
                        />
                        <label className="form-check-label" htmlFor={column}>
                          {column}
                        </label>
                      </>
                    )
                }
              </div>
            </div>

          ))}
        </div>
      </div>

      <button className="btn btn-primary" onClick={handleApplySettings}>
        Uygula
      </button>
    </div>
  );
}
