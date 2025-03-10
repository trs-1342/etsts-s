import React, { useState } from "react";
import axios from "axios";

export default function AddUserPage() {
  // State'ler
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin");
  const [message, setMessage] = useState("");

  // Form gönderildiğinde yapılacak işlemler
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://192.168.0.201:2431/api/add-user",
        {
          username,
          password,
          email,
          role,
        }
      );

      if (response.data.success) {
        setMessage("Kullanıcı başarıyla eklendi!");
        window.location.href = "http://192.168.0.201/";
      } else {
        setMessage("Bir hata oluştu. Lütfen tekrar deneyin.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  return (
    <div className="container-xl mt-5 rounded bg-light shadow-lg pb-4">
      <div className="text-center mt-4 mb-4">
        <h2 className="text-primary">Kullanıcı Ekle</h2>
      </div>

      <form onSubmit={handleSubmit} className="col-md-6 mx-auto">
        <div className="mb-3">
          <label htmlFor="username" className="form-label">
            Kullanıcı Adı
          </label>
          <input
            type="text"
            className="form-control"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Şifre
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            E-posta
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="role" className="form-label">
            Rol
          </label>
          <select
            className="form-select"
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="admin">Admin</option>
            <option value="personel">Personel</option>
            <option value="monitor">Monitor</option>
          </select>
        </div>

        <button type="submit" className="btn btn-success w-100 mt-3">
          Kullanıcı Ekle
        </button>
      </form>

      {message && (
        <div className="text-center mt-4">
          <p>{message}</p>
        </div>
      )}

      <div className="text-center mt-4">
        <a className="btn btn-danger mx-2" href="/change-settings">
          Yetkileri Düzelt
        </a>
        <a className="btn btn-success mx-2" href="/add-user">
          Kullanıcı Ekle
        </a>
        <a className="btn btn-success mx-2" href="/">
          Anasayfa
        </a>
      </div>
    </div>
  );
}
