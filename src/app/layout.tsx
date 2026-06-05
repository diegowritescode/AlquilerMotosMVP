import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { BUSINESS_NAME } from "@/lib/constants";
import { PwaProvider } from "@/components/app/pwa-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  applicationName: "Moto Control",
  title: {
    default: `${BUSINESS_NAME} — Alquiler de motos en Medellín`,
    template: `%s · ${BUSINESS_NAME}`,
  },
  description:
    "Plataforma de gestión de alquiler de motocicletas para trabajo diario en Medellín. Control de flota, arrendatarios, pagos, vencimientos y mantenimientos.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Moto Control",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <body>
        {/* Apply saved theme before paint (default dark) to avoid flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){document.documentElement.classList.add('dark')}})();",
          }}
        />
        {children}
        <PwaProvider />
      </body>
    </html>
  );
}
