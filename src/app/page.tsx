import Link from "next/link";
import {
  Bike,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  KeyRound,
  MessageCircle,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { listMotorcycles } from "@/lib/data/motorcycles";
import { businessWhatsappLink } from "@/lib/whatsapp";
import { BUSINESS_NAME } from "@/lib/constants";
import { formatCOP } from "@/lib/utils";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const BENEFITS = [
  {
    icon: Wallet,
    title: "Tarifas claras",
    text: "Paga por día, semana o mes. Sin sorpresas ni costos ocultos.",
  },
  {
    icon: ShieldCheck,
    title: "Motos al día",
    text: "SOAT, tecnomecánica y mantenimiento siempre vigentes.",
  },
  {
    icon: Bike,
    title: "Listas para trabajar",
    text: "Motos económicas ideales para domicilios y mensajería.",
  },
  {
    icon: MessageCircle,
    title: "Atención por WhatsApp",
    text: "Resuelve dudas y coordina la entrega en minutos.",
  },
];

const STEPS = [
  {
    icon: MessageCircle,
    title: "Escríbenos",
    text: "Cuéntanos qué moto necesitas y por cuánto tiempo.",
  },
  {
    icon: FileCheck2,
    title: "Envía tus documentos",
    text: "Cédula y licencia de conducción vigente categoría A2.",
  },
  {
    icon: ClipboardList,
    title: "Firma el acuerdo",
    text: "Definimos tarifa, frecuencia de pago y condiciones.",
  },
  {
    icon: KeyRound,
    title: "Recibe tu moto",
    text: "Entregamos la moto lista y revisada para trabajar.",
  },
];

const REQUIREMENTS = [
  "Cédula de ciudadanía o documento de identidad vigente.",
  "Licencia de conducción categoría A2 vigente.",
  "Referencia personal o laboral.",
  "Comprobante de domicilio o actividad económica.",
  "Pago del depósito o garantía acordada.",
];

const FAQS = [
  {
    q: "¿Qué necesito para alquilar una moto?",
    a: "Documento de identidad, licencia A2 vigente, una referencia y el pago de la garantía acordada.",
  },
  {
    q: "¿Cómo se realizan los pagos?",
    a: "Los pagos se acuerdan directamente con nosotros: efectivo, transferencia, Nequi o Bancolombia. Llevamos el registro de cada pago para tu tranquilidad.",
  },
  {
    q: "¿Quién responde por las multas?",
    a: "El arrendatario es responsable de las infracciones cometidas durante el alquiler, según el acuerdo firmado.",
  },
  {
    q: "¿El mantenimiento está incluido?",
    a: "El mantenimiento preventivo lo gestionamos nosotros. Los daños por mal uso corren por cuenta del arrendatario.",
  },
];

// Read the catalog at request time (reflects live availability and avoids
// hitting Supabase during the production build).
export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const motos = await listMotorcycles();
  const catalog = motos
    .filter((m) => m.current_status === "disponible" || m.current_status === "alquilada")
    .slice(0, 6);

  const ctaMessage = `Hola ${BUSINESS_NAME}, estoy interesado en alquilar una moto para trabajar. ¿Me das más información?`;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-black">
              <Bike className="h-5 w-5" />
            </span>
            <span className="text-sm font-bold uppercase tracking-wide text-foreground">
              {BUSINESS_NAME}
            </span>
          </div>
          <Link
            href="/login"
            className="text-sm font-medium text-muted hover:text-foreground"
          >
            Ingresar
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 pb-12 pt-10 sm:pt-16">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
              <Bike className="h-3.5 w-3.5" /> Alquiler de motos en Medellín
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight text-foreground sm:text-5xl">
              Alquila, controla y mantén tu moto{" "}
              <span className="text-brand">siempre al día</span>.
            </h1>
            <p className="mt-4 text-base text-muted">
              Motos económicas y confiables para tu trabajo diario: domicilios,
              mensajería y movilidad. Documentos al día y soporte por WhatsApp.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <LinkButton href={businessWhatsappLink(ctaMessage)} size="lg">
                <MessageCircle className="h-5 w-5" />
                Escríbenos por WhatsApp
              </LinkButton>
              <LinkButton href="#catalogo" variant="secondary" size="lg">
                Ver motos
              </LinkButton>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-3xl border border-border bg-gradient-to-br from-surface to-background p-8">
              <div className="flex h-56 items-center justify-center rounded-2xl bg-surface-2">
                <Bike className="h-28 w-28 text-brand/70" />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-surface-2 p-3">
                  <p className="text-lg font-bold text-brand">+5</p>
                  <p className="text-[11px] text-muted">Motos</p>
                </div>
                <div className="rounded-xl bg-surface-2 p-3">
                  <p className="text-lg font-bold text-brand">A2</p>
                  <p className="text-[11px] text-muted">Licencia</p>
                </div>
                <div className="rounded-xl bg-surface-2 p-3">
                  <p className="text-lg font-bold text-brand">24/7</p>
                  <p className="text-[11px] text-muted">WhatsApp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-5xl px-4 py-10">
        <h2 className="text-2xl font-bold text-foreground">¿Por qué nosotros?</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b) => (
            <Card key={b.title} className="p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15 text-brand">
                <b.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-base font-semibold text-foreground">
                {b.title}
              </h3>
              <p className="mt-1 text-sm text-muted">{b.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Catalog */}
      <section id="catalogo" className="mx-auto max-w-5xl px-4 py-10">
        <h2 className="text-2xl font-bold text-foreground">Nuestras motos</h2>
        <p className="mt-1 text-sm text-muted">
          Catálogo de referencia. Disponibilidad sujeta a confirmación por
          WhatsApp.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.map((m) => (
            <Card key={m.id} className="overflow-hidden">
              <div className="flex h-32 items-center justify-center bg-surface-2">
                <Bike className="h-16 w-16 text-brand/60" />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-foreground">
                    {m.brand} {m.model}
                  </h3>
                  <span className="text-xs text-muted">{m.year}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted">
                  {m.cc} cc · {m.color}
                </p>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <p className="text-lg font-bold text-brand">
                      {formatCOP(m.weekly_price)}
                    </p>
                    <p className="text-[11px] text-muted">por semana</p>
                  </div>
                  <LinkButton
                    href={businessWhatsappLink(
                      `Hola, me interesa la ${m.brand} ${m.model}. ¿Está disponible?`,
                    )}
                    size="sm"
                    variant="secondary"
                  >
                    Consultar
                  </LinkButton>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-4 py-10">
        <h2 className="text-2xl font-bold text-foreground">Cómo funciona</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Card key={s.title} className="p-5">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-black">
                  {i + 1}
                </span>
                <s.icon className="h-5 w-5 text-brand" />
              </div>
              <h3 className="mt-3 text-base font-semibold text-foreground">
                {s.title}
              </h3>
              <p className="mt-1 text-sm text-muted">{s.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Requirements */}
      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Requisitos</h2>
            <ul className="mt-6 space-y-3">
              {REQUIREMENTS.map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm text-foreground/90">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground">
              ¿Listo para empezar?
            </h3>
            <p className="mt-2 text-sm text-muted">
              Escríbenos por WhatsApp y coordina la entrega de tu moto hoy mismo.
            </p>
            <LinkButton
              href={businessWhatsappLink(ctaMessage)}
              size="lg"
              className="mt-5 w-full"
            >
              <MessageCircle className="h-5 w-5" />
              Contactar ahora
            </LinkButton>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-5xl px-4 py-10">
        <h2 className="text-2xl font-bold text-foreground">Preguntas frecuentes</h2>
        <div className="mt-6 space-y-3">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-border bg-surface p-4"
            >
              <summary className="cursor-pointer list-none text-sm font-semibold text-foreground marker:hidden">
                {f.q}
              </summary>
              <p className="mt-2 text-sm text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-black">
                <Bike className="h-5 w-5" />
              </span>
              <span className="text-sm font-bold uppercase tracking-wide text-foreground">
                {BUSINESS_NAME}
              </span>
            </div>
            <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
              <Link href="/terms" className="hover:text-foreground">
                Términos
              </Link>
              <Link href="/privacy" className="hover:text-foreground">
                Privacidad
              </Link>
              <Link href="/login" className="hover:text-foreground">
                Ingresar
              </Link>
              <a
                href={businessWhatsappLink(ctaMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                WhatsApp
              </a>
            </nav>
          </div>
          <p className="mt-6 text-xs text-muted">
            © {new Date().getFullYear()} {BUSINESS_NAME}. Medellín, Colombia.
            Plataforma de gestión operativa de alquiler de motocicletas.
          </p>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a
        href={businessWhatsappLink(ctaMessage)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-black shadow-lg transition-transform hover:scale-105"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
    </div>
  );
}
