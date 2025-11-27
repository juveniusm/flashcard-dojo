// src/components/AuthPanel.jsx
import { useState } from "react";

function AuthPanel({ apiBase, auth, onAuthChange }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const isLoggedIn = !!auth?.user;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter email and password.");
      return;
    }

    setBusy(true);
    setError("");

    const endpoint =
      mode === "register" ? "/api/register" : "/api/login";

    fetch(`${apiBase}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Request failed");
        }
        return data;
      })
      .then((data) => {
        onAuthChange({
          user: data.user,
          token: data.token,
        });
        setPassword("");
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Authentication failed.");
      })
      .finally(() => setBusy(false));
  };

  const handleLogout = () => {
    onAuthChange({ user: null, token: null });
    setEmail("");
    setPassword("");
    setError("");
  };

  if (isLoggedIn) {
    return (
      <div
        style={{
          marginBottom: "1rem",
          padding: "0.75rem 1rem",
          borderRadius: "999px",
          backgroundColor: "#ecfdf5",
          border: "1px solid #bbf7d0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: "0.9rem",
            color: "#166534",
          }}
        >
          Logged in as <strong>{auth.user.email}</strong>
        </span>
        <button
          type="button"
          onClick={handleLogout}
          style={{
            padding: "0.3rem 0.9rem",
            borderRadius: "999px",
            border: "none",
            backgroundColor: "#ef4444",
            color: "white",
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        marginBottom: "1rem",
        padding: "0.75rem 1rem",
        borderRadius: "0.9rem",
        backgroundColor: "#f9fafb",
        border: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "0.5rem",
        }}
      >
        <button
          type="button"
          onClick={() => setMode("login")}
          style={{
            padding: "0.25rem 0.7rem",
            borderRadius: "999px",
            border: "none",
            backgroundColor:
              mode === "login" ? "#111827" : "transparent",
            color: mode === "login" ? "#f9fafb" : "#4b5563",
            fontSize: "0.8rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Log in
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          style={{
            padding: "0.25rem 0.7rem",
            borderRadius: "999px",
            border: "none",
            backgroundColor:
              mode === "register" ? "#111827" : "transparent",
            color: mode === "register" ? "#f9fafb" : "#4b5563",
            fontSize: "0.8rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            alignItems: "center",
          }}
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              flex: "1 1 160px",
              minWidth: "160px",
              padding: "0.35rem 0.55rem",
              borderRadius: "0.5rem",
              border: "1px solid #d1d5db",
              fontSize: "0.85rem",
              fontFamily: "inherit",
            }}
          />
          <input
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              flex: "1 1 160px",
              minWidth: "160px",
              padding: "0.35rem 0.55rem",
              borderRadius: "0.5rem",
              border: "1px solid #d1d5db",
              fontSize: "0.85rem",
              fontFamily: "inherit",
            }}
          />
          <button
            type="submit"
            disabled={busy}
            style={{
              padding: "0.35rem 0.9rem",
              borderRadius: "999px",
              border: "none",
              backgroundColor: busy ? "#9ca3af" : "#2563eb",
              color: "white",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: busy ? "default" : "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {mode === "register"
              ? busy
                ? "Registering..."
                : "Register"
              : busy
              ? "Logging in..."
              : "Log in"}
          </button>
        </div>
      </form>
      {error && (
        <p
          style={{
            marginTop: "0.5rem",
            fontSize: "0.8rem",
            color: "#b91c1c",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default AuthPanel;
