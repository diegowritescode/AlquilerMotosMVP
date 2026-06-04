import type { Payment, PaymentStatus } from "../types";
import type { PaymentInput } from "../schemas";
import { getMockDB } from "../mock/store";
import { uuid } from "../utils";
import { getDataClient, unwrap } from "./db";

const TABLE = "payments";
const active = (p: Payment) => !p.deleted_at;

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function listPayments(opts?: {
  status?: PaymentStatus | "todos";
  customerId?: string;
  rentalId?: string;
}): Promise<Payment[]> {
  const supabase = getDataClient();
  if (!supabase) return listPaymentsMock(opts);

  let query = supabase.from(TABLE).select("*").is("deleted_at", null);
  if (opts?.status && opts.status !== "todos") query = query.eq("status", opts.status);
  if (opts?.customerId) query = query.eq("customer_id", opts.customerId);
  if (opts?.rentalId) query = query.eq("rental_id", opts.rentalId);
  const res = await query.order("due_date", {
    ascending: false,
    nullsFirst: false,
  });
  return unwrap(res, "listPayments") as Payment[];
}

export async function getPayment(id: string): Promise<Payment | null> {
  const supabase = getDataClient();
  if (!supabase) return getPaymentMock(id);
  const res = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  return (unwrap(res, "getPayment") as Payment | null) ?? null;
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

export async function createPayment(input: PaymentInput): Promise<Payment> {
  const supabase = getDataClient();
  if (!supabase) return createPaymentMock(input);
  const payload = { ...input, rental_id: input.rental_id ?? null };
  const res = await supabase.from(TABLE).insert(payload).select().single();
  return unwrap(res, "createPayment") as Payment;
}

export async function updatePayment(
  id: string,
  input: Partial<PaymentInput>,
): Promise<Payment | null> {
  const supabase = getDataClient();
  if (!supabase) return updatePaymentMock(id, input);
  const res = await supabase
    .from(TABLE)
    .update(input)
    .eq("id", id)
    .select()
    .maybeSingle();
  return (unwrap(res, "updatePayment") as Payment | null) ?? null;
}

export async function markPaymentPaid(
  id: string,
  paidAt: string,
): Promise<Payment | null> {
  return updatePayment(id, {
    status: "pagado",
    paid_at: paidAt,
  } as Partial<PaymentInput>);
}

// ---------------------------------------------------------------------------
// Demo (in-memory) fallback
// ---------------------------------------------------------------------------

function listPaymentsMock(opts?: {
  status?: PaymentStatus | "todos";
  customerId?: string;
  rentalId?: string;
}): Payment[] {
  const db = getMockDB();
  let rows = db.payments.filter(active);
  if (opts?.status && opts.status !== "todos") rows = rows.filter((p) => p.status === opts.status);
  if (opts?.customerId) rows = rows.filter((p) => p.customer_id === opts.customerId);
  if (opts?.rentalId) rows = rows.filter((p) => p.rental_id === opts.rentalId);
  return rows.sort((a, b) =>
    (b.due_date ?? b.created_at).localeCompare(a.due_date ?? a.created_at),
  );
}

function getPaymentMock(id: string): Payment | null {
  const db = getMockDB();
  return db.payments.find((p) => p.id === id && active(p)) ?? null;
}

function createPaymentMock(input: PaymentInput): Payment {
  const db = getMockDB();
  const nowIso = new Date().toISOString();
  const payment: Payment = {
    id: uuid(),
    rental_id: input.rental_id ?? null,
    customer_id: input.customer_id,
    amount: input.amount,
    method: input.method,
    status: input.status,
    due_date: input.due_date ?? null,
    paid_at: input.paid_at ?? null,
    reference: input.reference ?? null,
    evidence_url: input.evidence_url ?? null,
    notes: input.notes ?? null,
    created_at: nowIso,
    updated_at: nowIso,
    deleted_at: null,
  };
  db.payments.unshift(payment);
  return payment;
}

function updatePaymentMock(
  id: string,
  input: Partial<PaymentInput>,
): Payment | null {
  const db = getMockDB();
  const idx = db.payments.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  db.payments[idx] = {
    ...db.payments[idx]!,
    ...input,
    updated_at: new Date().toISOString(),
  };
  return db.payments[idx]!;
}
