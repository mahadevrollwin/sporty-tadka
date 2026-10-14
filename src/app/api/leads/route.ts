import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { isValidEmail, isValidPhone } from "@/lib/lead";
import { loadHome } from "@/sanity/content";

type Lead = {
  name: string;
  phone: string;
  email: string;
  requirement: string[];
  createdAt: string;
};

const file = path.join(process.cwd(), "data", "leads.json");

function clean(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

async function parseRequirements(value: unknown) {
  if (!Array.isArray(value)) return null;
  const site = await loadHome();
  const allowed = new Set<string>(site.audiences.map((item) => item.label));
  const picked = value.filter((item): item is string => typeof item === "string");
  if (picked.length === 0 || new Set(picked).size !== picked.length) return null;
  if (picked.some((item) => !allowed.has(item))) return null;
  return site.audiences.filter((item) => picked.includes(item.label)).map((item) => item.label);
}

async function parseLead(body: unknown) {
  if (!body || typeof body !== "object") return { error: "Check the form and try again." };
  const record = body as Record<string, unknown>;
  const name = clean(record.name, 80);
  const phone = clean(record.phone, 32);
  const email = clean(record.email, 120);
  const requirement = await parseRequirements(record.requirement);
  if (name.length < 2) return { error: "Enter your name." };
  if (!isValidPhone(phone)) return { error: "Enter a valid phone number." };
  if (!isValidEmail(email)) return { error: "Enter a valid email." };
  if (!requirement) return { error: "Pick at least one requirement." };
  return { lead: { name, phone, email, requirement } };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Check the form and try again." }, { status: 400 });
  }

  const parsed = await parseLead(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const entry: Lead = { ...parsed.lead, createdAt: new Date().toISOString() };
  await mkdir(path.dirname(file), { recursive: true });

  let existing: Lead[] = [];
  try {
    const stored: unknown = JSON.parse(await readFile(file, "utf8"));
    if (Array.isArray(stored)) existing = stored as Lead[];
  } catch {
    existing = [];
  }

  existing.push(entry);
  await writeFile(file, JSON.stringify(existing, null, 2));
  return NextResponse.json({ ok: true });
}
