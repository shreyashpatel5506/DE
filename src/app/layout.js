import "./globals.css";

export const metadata = {
  title: "Civic Infrastructure Management",
  description: "Report and manage civic infrastructure issues",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
