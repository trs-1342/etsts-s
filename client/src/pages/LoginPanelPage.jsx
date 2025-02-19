import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";

export default function LoginPanelPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { setUser } = useUser();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    // Eğer kullanıcı bilgisi varsa ve rolü admin değilse,
    // ayrıca mevcut sayfa "/show-user-status" değilse yönlendir.
    if (
      storedUser &&
      storedUser.role !== "admin" &&
      window.location.pathname !== "/show-user-status"
    ) {
      navigate("/show-user-status");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://192.168.0.138:2431/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser({ username, role: data.user.role });
        localStorage.setItem(
          "user",
          JSON.stringify({ username, role: data.user.role })
        );
        navigate(data.redirectTo);
      } else {
        setMessage(data.message || "Bilinmeyen bir hata oluştu.");
      }
    } catch (error) {
      console.error("Hata:", error);
      setMessage("Sunucuya bağlanırken bir hata oluştu.");
    }
  };

  return (
    <div
      className="container d-flex justify-content-center align-items-center"
      id="loginPageCSS"
      style={{ marginTop: "200px", zIndex: "13", position: "flex" }}
    >
      <div className="text-center w-50">
        <div className="center">
          <img
            src="/enigma-logo.svg"
            alt="enigma-logo"
            width="300"
            style={{ userSelect: "none", pointerEvents: "none" }}
          />
        </div>
        {/* <div className="text-center w-100 bg-danger rounded"
        style={{
          width: "400px !important",
        }}
        >
          <p
            style={{
              fontFamily: "Lora, serif",
            }}
            className="text-break w-100"
          >
            Bilgisayarınız size bozulmasın, Biz ona bakalım, O da size baksın.
          </p>
        </div> */}
        <div className="login-form">
          <form onSubmit={handleSubmit}>
            <div className="mb-2">
              <input
                placeholder="Username..."
                type="text"
                className="form-control fw-semibold"
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <input
                placeholder="Password..."
                type="password"
                className="form-control fw-semibold"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-success fw-medium w-100">
              Login
            </button>
          </form>
          <p className="text-danger mt-4">
            {message && message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
          </p>
        </div>
      </div>
    </div>
  );
}
