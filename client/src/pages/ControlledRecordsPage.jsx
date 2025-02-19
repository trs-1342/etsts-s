import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "./UserContext"; // Kullanıcı context'ini kullan

export default function ControlledRecordsPage() {
    const [records, setRecords] = useState([]);
    const { user } = useUser(); // Kullanıcıyı al
    const username = user?.username || JSON.parse(localStorage.getItem("user")) || "";

    useEffect(() => {
        if (!username) {
            console.error("Kullanıcı adı alınamadı.");
            return;
        }

        const fetchUserRecords = async () => {
            try {
                const response = await axios.get(`http://192.168.0.138:2431/api/get-user-records/${username}`);
                setRecords(response.data); // Çekilen verileri state'e kaydet
            } catch (error) {
                console.error("Kullanıcı verilerini çekerken hata oluştu:", error);
            }
        };

        fetchUserRecords();
    }, [username]);



    return (
        <div className="mt-4">
            <h1 className="mb-4">Filtrelenmiş Kayıtlar</h1>
            <p className="text-muted">Kullanıcı: <strong>{username || "Bilinmiyor"}</strong></p>

            {records.length > 0 ? (
                <div className="table-responsive">
                    <table className="table table-striped table-hover table-bordered">
                        <thead className="table-dark">
                            <tr>
                                {Object.keys(records[0]).map((col) => (
                                    <th key={col} className="text-center">{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((record, index) => (
                                <tr key={index}>
                                    {Object.values(record).map((value, idx) => (
                                        <td key={idx} className="text-center">{value || "Bilinmiyor"}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-center text-danger">Görüntülenecek veri yok.</p>
            )}
        </div>
    );
}
