import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { BUSINESS_NAME } from "@/lib/constants";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: `${BUSINESS_NAME} — Alquiler de motos en Medellín`,
    template: `%s · ${BUSINESS_NAME}`,
  },
  description:
    "Plataforma de gestión de alquiler de motocicletas para trabajo diario en Medellín. Control de flota, arrendatarios, pagos, vencimientos y mantenimientos.",
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
    <html lang="es" className={`${inter.variable} dark`}>
      <body>{children}</body>
    </html>
  );
}
