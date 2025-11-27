import PaginationBar from "./PaginationBar";
import SessionsTable from "./SessionsTable";

function SessionsContent({
  loading,
  error,
  sortedSessions,
  pageSessions,
  page,
  totalPages,
  onPrev,
  onNext,
}) {
  if (loading) {
    return <p>Loading sessions...</p>;
  }

  if (error) {
    return <p style={{ color: "#b91c1c", marginBottom: "0.75rem" }}>{error}</p>;
  }

  if (sortedSessions.length === 0) {
    return <p style={{ color: "#6b7280" }}>No sessions match this filter.</p>;
  }

  return (
    <>
      <SessionsTable sessions={pageSessions} />

      <PaginationBar
        page={page}
        totalPages={totalPages}
        onPrev={onPrev}
        onNext={onNext}
      />
    </>
  );
}

export default SessionsContent;
