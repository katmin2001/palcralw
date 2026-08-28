// Cloudflare Worker: proxy CORS cho API pawchive.
//
// Web tinh (GitHub Pages) khong tu goi duoc API pawchive vi API khong gui
// header CORS. Worker nay dung giua: nhan ?u=<url pawchive>, goi ho roi tra
// ve kem "Access-Control-Allow-Origin: *" de trinh duyet doc duoc.
//
// File that (file.pawchive.pw) da co CORS san nen KHONG di qua worker -
// trang web tai thang tu CDN. Worker chi phuc vu phan API JSON (nhe).
//
// --- Deploy nhanh ---
//   1. https://dash.cloudflare.com  ->  Workers & Pages  ->  Create Worker
//   2. Dan toan bo file nay vao, bam Deploy.
//   3. Copy URL worker (dang https://ten-abc.<tk>.workers.dev) va dan vao o
//      "Proxy URL" tren trang web.
//
// Hoac bang Wrangler:  npx wrangler deploy worker.js --name pawcrawl-proxy

const ALLOW = ["pawchive.pw", "pawchive.st"];

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Max-Age": "86400",
};

function allowedHost(host) {
  host = host.toLowerCase();
  return ALLOW.some((h) => host === h || host.endsWith("." + h));
}

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS });
    }

    const url = new URL(request.url);
    const target = url.searchParams.get("u");
    if (!target) {
      return new Response("Thieu tham so ?u=<url pawchive>", {
        status: 400,
        headers: CORS,
      });
    }

    let t;
    try {
      t = new URL(target);
    } catch {
      return new Response("URL khong hop le", { status: 400, headers: CORS });
    }

    if (t.protocol !== "https:" || !allowedHost(t.hostname)) {
      return new Response("Host khong duoc phep: " + t.hostname, {
        status: 403,
        headers: CORS,
      });
    }

    let upstream;
    try {
      // pawchive chan request "khong giong trinh duyet" -> gia lap header Chrome
      // that de giam kha nang bi tra 404/403/429.
      upstream = await fetch(t.toString(), {
        method: "GET",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Accept-Language": "en-US,en;q=0.9,vi;q=0.8",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
            "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
          Referer: "https://" + t.hostname + "/",
          Origin: "https://" + t.hostname,
          "Sec-Fetch-Site": "same-origin",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Dest": "empty",
          "X-Requested-With": "XMLHttpRequest",
        },
        // API co the tra ve lon (chi muc creator ~2MB gzip) - de Cloudflare nen lai
      });
    } catch (e) {
      return new Response("Loi goi upstream: " + e, {
        status: 502,
        headers: CORS,
      });
    }

    const headers = new Headers(CORS);
    const ct = upstream.headers.get("Content-Type");
    if (ct) headers.set("Content-Type", ct);
    // cho phep trinh duyet cache nhe cho cac danh sach it doi
    headers.set("Cache-Control", "public, max-age=60");

    return new Response(upstream.body, {
      status: upstream.status,
      headers,
    });
  },
};
