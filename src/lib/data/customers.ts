import type { Customer } from "../types";
import type { CustomerInput } from "../schemas";
import { getMockDB } from "../mock/store";
import { uuid } from "../utils";
import { getDataClient, unwrap } from "./db";

const TABLE = "customers";
const active = (c: Customer) => !c.deleted_at;

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function listCustomers(opts?: {
  search?: string;
}): Promise<Customer[]> {
  const supabase = getDataClient();
  if (!supabase) return listCustomersMock(opts);

  let query = supabase.from(TABLE).select("*").is("deleted_at", null);
  if (opts?.search) {
    const q = opts.search.trim();
    query = query.or(
      `full_name.ilike.%${q}%,document_number.ilike.%${q}%,phone.ilike.%${q}%`,
    );
  }
  const res = await query.order("full_name", { ascending: true });
  return unwrap(res, "listCustomers") as Customer[];
}

export async function getCustomer(id: string): Promise<Customer | null> {
  const supabase = getDataClient();
  if (!supabase) return getCustomerMock(id);
  const res = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  return (unwrap(res, "getCustomer") as Customer | null) ?? null;
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

export async function createCustomer(input: CustomerInput): Promise<Customer> {
  const supabase = getDataClient();
  if (!supabase) return createCustomerMock(input);
  const res = await supabase.from(TABLE).insert(input).select().single();
  return unwrap(res, "createCustomer") as Customer;
}

export async function updateCustomer(
  id: string,
  input: Partial<CustomerInput>,
): Promise<Customer | null> {
  const supabase = getDataClient();
  if (!supabase) return updateCustomerMock(id, input);
  const res = await supabase
    .from(TABLE)
    .update(input)
    .eq("id", id)
    .select()
    .maybeSingle();
  return (unwrap(res, "updateCustomer") as Customer | null) ?? null;
}

export async function deleteCustomer(id: string): Promise<boolean> {
  const supabase = getDataClient();
  if (!supabase) return deleteCustomerMock(id);
  const res = await supabase
    .from(TABLE)
    .update({ status: "inactivo", deleted_at: new Date().toISOString() })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  return Boolean(unwrap(res, "deleteCustomer"));
}

// ---------------------------------------------------------------------------
// Demo (in-memory) fallback
// ---------------------------------------------------------------------------

function listCustomersMock(opts?: { search?: string }): Customer[] {
  const db = getMockDB();
  let rows = db.customers.filter(active);
  if (opts?.search) {
    const q = opts.search.toLowerCase().trim();
    rows = rows.filter(
      (c) =>
        c.full_name.toLowerCase().includes(q) ||
        c.document_number.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q),
    );
  }
  return rows.sort((a, b) => a.full_name.localeCompare(b.full_name));
}

function getCustomerMock(id: string): Customer | null {
  const db = getMockDB();
  return db.customers.find((c) => c.id === id && active(c)) ?? null;
}

function createCustomerMock(input: CustomerInput): Customer {
  const db = getMockDB();
  const nowIso = new Date().toISOString();
  const customer: Customer = {
    id: uuid(),
    full_name: input.full_name,
    document_type: input.document_type,
    document_number: input.document_number,
    nationality: input.nationality,
    birth_date: input.birth_date ?? null,
    phone: input.phone,
    address: input.address ?? null,
    license_number: input.license_number ?? null,
    license_category: input.license_category ?? null,
    references_info: input.references_info ?? null,
    notes: input.notes ?? null,
    license_photo_url: input.license_photo_url ?? null,
    front_photo_url: input.front_photo_url ?? null,
    status: input.status ?? "activo",
    created_at: nowIso,
    updated_at: nowIso,
    deleted_at: null,
  };
  db.customers.unshift(customer);
  return customer;
}

function updateCustomerMock(
  id: string,
  input: Partial<CustomerInput>,
): Customer | null {
  const db = getMockDB();
  const idx = db.customers.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  db.customers[idx] = {
    ...db.customers[idx]!,
    ...input,
    updated_at: new Date().toISOString(),
  };
  return db.customers[idx]!;
}

function deleteCustomerMock(id: string): boolean {
  const db = getMockDB();
  const idx = db.customers.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  db.customers[idx] = {
    ...db.customers[idx]!,
    status: "inactivo",
    deleted_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  return true;
}
