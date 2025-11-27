// src/components/study/EndlessSessionModal.jsx

function EndlessSessionModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "1rem",
          padding: "1.5rem 2rem",
          maxWidth: "360px",
          width: "90%",
          boxShadow: "0 20px 45px rgba(15, 23, 42, 0.35)",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: "0.5rem",
            fontSize: "1.25rem",
            color: "#111827",
          }}
        >
          Your session has ended
        </h2>
        <p
          style={{
            marginTop: 0,
            marginBottom: "1rem",
            fontSize: "0.95rem",
            color: "#4b5563",
          }}
        >
          You can start a new run whenever you&apos;re ready.
        </p>
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: "0.5rem 1.3rem",
            borderRadius: "999px",
            border: "none",
            backgroundColor: "#2563eb",
            color: "white",
            fontWeight: 600,
            fontSize: "0.95rem",
            cursor: "pointer",
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}

export default EndlessSessionModal;
