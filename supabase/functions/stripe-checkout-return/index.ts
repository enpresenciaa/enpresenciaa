const APP_RETURN_URLS = {
  cancelled: "enpresenciaa://billing/return?result=cancelled",
  success: "enpresenciaa://billing/return?result=success",
} as const;

type CheckoutReturnResult = keyof typeof APP_RETURN_URLS;

function isCheckoutReturnResult(value: string | null): value is CheckoutReturnResult {
  return value === "cancelled" || value === "success";
}

Deno.serve(request => {
  if (request.method !== "GET") {
    return new Response("Method not allowed", {
      headers: { "Allow": "GET", "Content-Type": "text/plain; charset=utf-8" },
      status: 405,
    });
  }

  const result = new URL(request.url).searchParams.get("result");

  if (!isCheckoutReturnResult(result)) {
    return new Response("Invalid checkout return", {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
      status: 400,
    });
  }

  return new Response(null, {
    headers: {
      "Cache-Control": "no-store",
      "Location": APP_RETURN_URLS[result],
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    },
    status: 302,
  });
});
