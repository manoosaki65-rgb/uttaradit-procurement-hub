import { newsFeed } from "@/lib/news";
export function GET() {
  return Response.json(newsFeed, { headers: { "Cache-Control": "no-store" } });
}
