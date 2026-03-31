import { cookies } from "next/headers";

const COOKIE_NAME = "council_auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function POST(req: Request) {
  const { passphrase } = (await req.json()) as { passphrase?: string };

  if (passphrase !== process.env.SITE_PASSPHRASE) {
    return Response.json({ error: "Incorrect passphrase" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return Response.json({ ok: true });
}

export async function GET() {
  const cookieStore = await cookies();
  const auth = cookieStore.get(COOKIE_NAME);
  return Response.json({ authenticated: auth?.value === "authenticated" });
}
