"use client";

/**
 * Last-resort boundary for errors in the root layout. Must render its own
 * <html>/<body>. Inline styles (no Tailwind guarantee at this level).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0b",
          color: "#f5f5f4",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Algo salió mal</h1>
        <p style={{ maxWidth: 360, color: "#9b9ba3", fontSize: 14 }}>
          Ocurrió un error inesperado. Reintenta; si persiste, cierra y vuelve a
          abrir la aplicación.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            marginTop: 16,
            height: 44,
            padding: "0 20px",
            borderRadius: 12,
            border: "none",
            background: "#f5c518",
            color: "#0a0a0b",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          Reintentar
        </button>
        {error?.digest ? (
          <p style={{ marginTop: 16, fontSize: 11, color: "#9b9ba3" }}>
            Ref: {error.digest}
          </p>
        ) : null}
      </body>
    </html>
  );
}
