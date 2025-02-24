import React, { useEffect, useState } from "react";
import { useUser } from "./UserContext";
import axios from "axios";

export default function YouCantSee() {
    const { user } = useUser();
    const username = user?.username || JSON.parse(localStorage.getItem("user"))?.username || "";
    const [validFishNos, setValidFishNos] = useState([]);
    const [redirectLink, setRedirectLink] = useState("/");

    useEffect(() => {
        if (!username) {
            console.error("Kullanıcı adı alınamadı.");
            return;
        }

        const fetchValidFishNos = async () => {
            try {
                const response = await axios.get(`http://192.168.0.201:2431/api/get-all-fishNos`);
                setValidFishNos(response.data); // Tüm fishNo değerlerini al
            } catch (error) {
                console.error("FishNo verileri çekilirken hata oluştu:", error);
            }
        };

        fetchValidFishNos();
    }, []);

    // useEffect(() => {
    //     const currentPath = window.location.pathname;
    //     const fishNoMatch = currentPath.match(/\/product-info\/(\d+)/); // `/product-info/:fishNo` yakalar

    //     if (fishNoMatch && validFishNos.includes(parseInt(fishNoMatch[1]))) {
    //         setRedirectLink(currentPath); // Eğer geçerli bir fishNo varsa yönlendirme yapma
    //     } else {
    //         // Kullanıcının yetkili olduğu sayfaya yönlendirme yap
    //         const pageRoutes = {
    //             HomePage: "/",
    //             ShowUserStatusPage: "/show-user-status",
    //         };
    //         const availablePage = Object.keys(pageRoutes).find(page => user?.permissions?.[page] === 1);
    //         setRedirectLink(availablePage ? pageRoutes[availablePage] : "/");
    //     }
    // }, [validFishNos, user]);

    const handleLogout = async () => {
        try {
            // Backend'e çıkış işlemi için istek gönder
            const response = await fetch("http://192.168.0.201:2431/api/logout", {
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
        <>
            <div className="container text-center alert alert-danger mt-5">
                <h1>Kullanıcı: <strong>{username}</strong></h1>
                <strong>
                    <p>Üzgünüz, bu sayfayı görüntüleme yetkiniz bulunmamaktadır.</p>
                </strong>
                <div className="mt-4">
                    <a href='/show-user-status' className="btn btn-primary">
                        Yetkili Olduğun Sayfa
                    </a>
                    <br />
                    <a className="btn btn-danger rounded-1 mt-2" onClick={handleLogout}>
                        {/* <IoMdLogOut style={{ width: "30px", height: "30px" }} /> */}
                        Çıkış Yap
                    </a>
                </div>
            </div>
        </>
    );
}
