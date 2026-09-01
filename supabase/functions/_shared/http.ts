export const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
} as const;

export function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), { headers: corsHeaders, status });
}

export function errorResponse(code: string, status: number): Response {
  return jsonResponse({ code, message: "No pudimos completar la operación de pago." }, status);
}
