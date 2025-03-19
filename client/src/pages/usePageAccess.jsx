import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";

export default function usePageAccess(pageName) {
    const { user } = useUser();
    const navigate = useNavigate();
    const [hasAccess, setHasAccess] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAccess = async () => {
            if (!user) {
                navigate("/login");
                return;
            }

            try {
                const response = await fetch("http://192.168.0.201:2431/api/check-page-access", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username: user.username, page: pageName }),
                });

                if (!response.ok) {
                    navigate("/show-user-status");
                    setHasAccess(false);
                } else {
                    setHasAccess(true);
                }
            } catch (error) {
                console.error("Yetki kontrol hatası:", error);
                navigate("/show-user-status");
            }

            setLoading(false);
        };

        checkAccess();
    }, [user, pageName, navigate]);

    return { hasAccess, loading };
}
