// app/layout.js
export const metadata = {
  title: "Snake Game – Alzaeem Tech",
  description: "High-control Snake Game built with Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "linear-gradient(135deg, #000, #111, #222)",
          color: "white",
          fontFamily: "Segoe UI, sans-serif",
        }}
      >
        <header
          style={{
            textAlign: "center",
            padding: "20px",
            fontSize: "28px",
            fontWeight: "bold",
            color: "lime",
            textShadow: "0 0 10px lime",
          }}
        >
          ⚔️ Alzaeem Snake Game ⚔️
        </header>
        {children}
      </body>
    </html>
  );
}
