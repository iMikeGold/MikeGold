import { analysePublicService } from "@/server/service-engine/analyse-public-service";

const noStoreHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "Content-Type": "application/json; charset=utf-8",
};

export async function GET() {
  return Response.json({ error: "Method not allowed." }, { status: 405, headers: {
    ...noStoreHeaders,
    Allow: "POST",
  } });
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return Response.json({ error: "Content-Type must be application/json." }, { status: 415, headers: noStoreHeaders });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400, headers: noStoreHeaders });
  }
  const query = typeof body === "object" && body !== null && "query" in body
    ? String((body as { query: unknown }).query).trim()
    : "";
  if (!query || query.length > 500) {
    return Response.json({ error: "Enter an enquiry of up to 500 characters." }, { status: 400, headers: noStoreHeaders });
  }
  try {
    return Response.json(analysePublicService(query), { headers: noStoreHeaders });
  } catch {
    return Response.json({ error: "The enquiry could not be analysed." }, { status: 500, headers: noStoreHeaders });
  }
}
