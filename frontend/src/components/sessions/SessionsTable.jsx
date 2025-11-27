// src/components/sessions/SessionsTable.jsx
import { formatDateTime } from "../../utils/sessionView";

function SessionsTable({ sessions }) {
  return (
    <div
      style={{
        borderRadius: "0.75rem",
        border: "1px solid #e5e7eb",
        overflow: "hidden",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "0.9rem",
        }}
      >
        <thead
          style={{
            backgroundColor: "#f3f4f6",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <tr>
            <th
              style={{
                textAlign: "left",
                padding: "0.5rem 0.75rem",
                fontWeight: 600,
                color: "#4b5563",
              }}
            >
              Date
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "0.5rem 0.75rem",
                fontWeight: 600,
                color: "#4b5563",
              }}
            >
              Deck
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "0.5rem 0.75rem",
                fontWeight: 600,
                color: "#4b5563",
              }}
            >
              Mode
            </th>
            <th
              style={{
                textAlign: "right",
                padding: "0.5rem 0.75rem",
                fontWeight: 600,
                color: "#4b5563",
              }}
            >
              Answered
            </th>
            <th
              style={{
                textAlign: "right",
                padding: "0.5rem 0.75rem",
                fontWeight: 600,
                color: "#4b5563",
              }}
            >
              Correct
            </th>
            <th
              style={{
                textAlign: "right",
                padding: "0.5rem 0.75rem",
                fontWeight: 600,
                color: "#4b5563",
              }}
            >
              Accuracy
            </th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr
              key={s.id}
              style={{
                borderTop: "1px solid #e5e7eb",
              }}
            >
              <td
                style={{
                  padding: "0.45rem 0.75rem",
                  color: "#111827",
                }}
              >
                {formatDateTime(s.startedAt)}
              </td>
              <td
                style={{
                  padding: "0.45rem 0.75rem",
                  color: "#111827",
                }}
              >
                {s.deckName || `Deck #${s.deckId}`}
              </td>
              <td
                style={{
                  padding: "0.45rem 0.75rem",
                  color: "#4b5563",
                  textTransform: "capitalize",
                }}
              >
                {s.mode}
              </td>
              <td
                style={{
                  padding: "0.45rem 0.75rem",
                  textAlign: "right",
                  color: "#111827",
                }}
              >
                {s.totalAnswered}
              </td>
              <td
                style={{
                  padding: "0.45rem 0.75rem",
                  textAlign: "right",
                  color: "#111827",
                }}
              >
                {s.correct}
              </td>
              <td
                style={{
                  padding: "0.45rem 0.75rem",
                  textAlign: "right",
                  color: "#111827",
                }}
              >
                {typeof s.accuracy === "number" ? `${s.accuracy}%` : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SessionsTable;
