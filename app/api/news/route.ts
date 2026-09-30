import { newsFeed } from "@/lib/news";

export const dynamic = "force-static";

export function GET() {
  return Response.json(newsFeed, { headers: { "Cache-Control": "public, max-age=300" } });
}
