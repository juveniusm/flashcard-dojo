import { useEffect, useState } from "react";

function useSessionsData(apiBase, authToken, onResetPage) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authToken) {
      setSessions([]);
      return;
    }

    setLoading(true);
    setError("");

    fetch(`${apiBase}/api/sessions?limit=500`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load sessions");
        }
        return res.json();
      })
      .then((data) => {
        setSessions(data || []);
        if (onResetPage) onResetPage();
      })
      .catch((err) => {
        console.error("Error loading sessions:", err);
        setError("Failed to load sessions. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [apiBase, authToken, onResetPage]);

  return { sessions, loading, error };
}

export default useSessionsData;
