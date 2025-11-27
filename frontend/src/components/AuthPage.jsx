// src/components/AuthPage.jsx
import AuthPanel from "./AuthPanel";

function AuthPage({ apiBase, auth, onAuthChange }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, #e0f2fe, transparent 55%), radial-gradient(circle at bottom right, #fee2e2, transparent 55%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem 0.75rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "560px",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderRadius: "1rem",
          padding: "1.5rem",
          boxShadow: "0 20px 45px rgba(15, 23, 42, 0.18)",
          backdropFilter: "blur(10px)",
        }}
      >
        <header
          style={{
            marginBottom: "1rem",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "1.6rem",
              color: "#0f172a",
            }}
          >
            Flashcard Dojo
          </h1>
          <p
            style={{
              margin: "0.35rem 0 0",
              color: "#4b5563",
              lineHeight: 1.5,
            }}
          >
            Log in or register to start building decks, studying, and reviewing
            your past sessions.
          </p>
        </header>

        <AuthPanel apiBase={apiBase} auth={auth} onAuthChange={onAuthChange} />
      </div>
    </div>
  );
}

export default AuthPage;
