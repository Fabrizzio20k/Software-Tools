import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portal de Ingeniería de Software",
  description: "Acceso con Keycloak",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
  },
  icons: {
    icon: "/icons/icon.ico",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Script id="theme-preference" strategy="beforeInteractive">
          {`try { const storedTheme = localStorage.getItem("theme"); const theme = storedTheme === "light" || storedTheme === "dark" ? storedTheme : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; document.documentElement.dataset.theme = theme; } catch {}`}
        </Script>
      </body>
    </html>
  );
}
