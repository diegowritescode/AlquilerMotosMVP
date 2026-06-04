import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { whatsappLink } from "@/lib/whatsapp";

/**
 * WhatsApp deep-link button. Pass a phone (any format) and optional message.
 * Renders green per WhatsApp branding.
 */
export function WhatsAppButton({
  phone,
  message,
  label = "WhatsApp",
  size = "md",
  variant = "solid",
  className,
}: {
  phone: string;
  message?: string;
  label?: string;
  size?: "sm" | "md" | "lg" | "icon";
  variant?: "solid" | "outline";
  className?: string;
}) {
  const href = whatsappLink(phone, message);
  const sizes = {
    sm: "h-9 px-3 text-sm rounded-lg",
    md: "h-11 px-4 text-sm rounded-xl",
    lg: "h-12 px-5 text-base rounded-xl",
    icon: "h-10 w-10 rounded-full",
  } as const;
  const styles =
    variant === "solid"
      ? "bg-[#25D366] text-black font-semibold hover:bg-[#25D366]/90"
      : "border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/10";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-colors",
        sizes[size],
        styles,
        className,
      )}
    >
      <MessageCircle className="h-4 w-4" />
      {size !== "icon" ? label : null}
    </a>
  );
}
