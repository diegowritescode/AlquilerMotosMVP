import { getDataClient } from "./db";

/**
 * Single-row business configuration. Used by the acta PDF and internal info.
 * Always resolvable: falls back to env defaults when there is no row (or in
 * demo mode), so callers never get null.
 */
export interface BusinessSettings {
  id?: string;
  business_name: string;
  owner_name: string | null;
  owner_document: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  city: string | null;
  address: string | null;
  currency: string;
  alert_days_before_expiration: number;
  contract_terms_text: string | null;
}

const TABLE = "business_settings";

function defaults(): BusinessSettings {
  return {
    business_name: process.env.NEXT_PUBLIC_BUSINESS_NAME || "Will",
    owner_name: null,
    owner_document: null,
    phone: null,
    whatsapp: process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || null,
    email: null,
    city: "Medellín",
    address: null,
    currency: "COP",
    alert_days_before_expiration: 30,
    contract_terms_text: null,
  };
}

// In-memory holder for demo mode (no Supabase).
const DEMO_KEY = "__MOTO_RENTAL_BUSINESS_SETTINGS__";
type G = typeof globalThis & { [DEMO_KEY]?: BusinessSettings };

/** Read settings; never throws, never null (env fallback). */
export async function getBusinessSettings(): Promise<BusinessSettings> {
  const supabase = getDataClient();
  if (!supabase) {
    const g = globalThis as G;
    return g[DEMO_KEY] ?? defaults();
  }
  try {
    const { data, error } = await supabase.from(TABLE).select("*").limit(1).maybeSingle();
    if (error || !data) return defaults();
    return data as BusinessSettings;
  } catch {
    return defaults();
  }
}

/** Update (or create) the single settings row. Returns the saved settings. */
export async function updateBusinessSettings(
  input: Partial<BusinessSettings>,
): Promise<BusinessSettings> {
  const supabase = getDataClient();
  if (!supabase) {
    const g = globalThis as G;
    g[DEMO_KEY] = { ...defaults(), ...(g[DEMO_KEY] ?? {}), ...input } as BusinessSettings;
    return g[DEMO_KEY] as BusinessSettings;
  }

  const { data: existing } = await supabase.from(TABLE).select("id").limit(1).maybeSingle();
  if (existing?.id) {
    const { data, error } = await supabase
      .from(TABLE)
      .update(input)
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw new Error(`[Supabase] updateBusinessSettings: ${error.message}`);
    return data as BusinessSettings;
  }
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ ...defaults(), ...input })
    .select()
    .single();
  if (error) throw new Error(`[Supabase] insertBusinessSettings: ${error.message}`);
  return data as BusinessSettings;
}
