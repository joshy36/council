import { listSessions } from "@/lib/storage";

export async function GET() {
  const sessions = await listSessions();
  return Response.json(sessions);
}
