"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "mc_install_dismissed";

/**
 * Discreet, dismissible "Instalar app" banner. Uses the Chrome/Android
 * `beforeinstallprompt` event. On iOS (no event) it stays hidden — la
 * instalación allí es Compartir → Agregar a pantalla de inicio (ver docs/pwa.md).
 */
export function InstallAppPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(DISMISS_KEY)) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setHidden(false);
    };
    const onInstalled = () => {
      setHidden(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (hidden || !deferred) return null;

  const install = async () => {
    await deferred.prompt();
    await deferred.userChoice;
    setHidden(true);
    setDeferred(null);
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setHidden(true);
  };

  return (
    <div
      data-testid="install-app-prompt"
      className="flex items-center gap-3 rounded-2xl border border-brand/30 bg-brand/10 p-3"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-black">
        <Download className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">Instala Moto Control</p>
        <p className="text-xs text-muted">
          Ábrela como una app desde tu pantalla de inicio.
        </p>
      </div>
      <button
        type="button"
        onClick={install}
        className="shrink-0 rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-black hover:bg-brand-400"
      >
        Instalar
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Cerrar"
        className="shrink-0 rounded-lg p-1.5 text-muted hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
