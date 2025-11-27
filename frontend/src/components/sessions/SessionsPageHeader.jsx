function SessionsPageHeader({ description }) {
  return (
    <>
      <h2
        style={{
          marginTop: 0,
          marginBottom: "0.75rem",
          fontSize: "1.3rem",
        }}
      >
        Session history
      </h2>

      {description && (
        <p
          style={{
            marginTop: 0,
            marginBottom: "1rem",
            fontSize: "0.9rem",
            color: "#6b7280",
          }}
        >
          {description}
        </p>
      )}
    </>
  );
}

export default SessionsPageHeader;
