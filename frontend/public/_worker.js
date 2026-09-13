// Cloudflare Pages Advanced Mode _worker.js
// Intercepts /api/v1/* requests and handles routing with ultra-fast edge memory caching

let cachedBundle = null;

async function getBundle(env, request) {
  if (cachedBundle) return cachedBundle;
  try {
    const dataUrl = new URL("/data/telemetry_bundle.json", request.url);
    const resp = await env.ASSETS.fetch(new Request(dataUrl));
    if (resp.ok) {
      cachedBundle = await resp.json();
      return cachedBundle;
    }
  } catch (err) {
    console.error("Erreur chargement bundle:", err);
  }
  return null;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // API Routes Handler
    if (url.pathname.startsWith("/api/v1")) {
      const route = url.pathname.replace(/^\/api\/v1\/?/, "").replace(/\/$/, "");
      const method = request.method.toUpperCase();

      const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Cache-Control": "public, max-age=60"
      };

      if (method === "OPTIONS") {
        return new Response(null, { status: 204, headers });
      }

      const bundle = await getBundle(env, request);
      if (!bundle) {
        return new Response(JSON.stringify({ error: "Bundle télémétrique non chargé" }), {
          status: 500,
          headers
        });
      }

      const platform = url.searchParams.get("platform") || "all";
      const category = url.searchParams.get("category") || "";
      const country = url.searchParams.get("country") || "";
      const search = (url.searchParams.get("search") || "").toLowerCase();

      // 1. Overview
      if (route === "overview" || route === "") {
        let data = bundle.overview_all;
        if (platform === "ios") data = bundle.overview_ios;
        if (platform === "android") data = bundle.overview_android;
        return new Response(JSON.stringify(data), { headers });
      }

      // 2. New Launches
      if (route === "new-launches") {
        let raw = bundle.new_launches_all;
        if (platform === "ios") raw = bundle.new_launches_ios;
        if (platform === "android") raw = bundle.new_launches_android;

        let apps = [...(raw?.apps || [])];
        if (category) {
          apps = apps.filter(a => a.category.toLowerCase().includes(category.toLowerCase()));
        }
        if (search) {
          apps = apps.filter(a =>
            a.name.toLowerCase().includes(search) ||
            (a.developer || "").toLowerCase().includes(search) ||
            (a.company_name || "").toLowerCase().includes(search) ||
            (a.functional_summary || "").toLowerCase().includes(search)
          );
        }

        return new Response(JSON.stringify({
          radar: raw?.radar || {},
          apps
        }), { headers });
      }

      // 3. Apps & App Detail
      if (route.startsWith("apps")) {
        const parts = route.split("/");
        if (parts.length > 1 && parts[1]) {
          const appId = decodeURIComponent(parts[1]);
          const detail = bundle.apps_details?.[appId];
          if (detail) {
            return new Response(JSON.stringify(detail), { headers });
          }
          const found = (bundle.apps_all || []).find(a => a.id === appId);
          if (found) {
            return new Response(JSON.stringify({
              app: found,
              history: [],
              reviews: [],
              features: [],
              ai_analysis: null
            }), { headers });
          }
          return new Response(JSON.stringify({ detail: "Application non trouvée" }), { status: 404, headers });
        }

        let list = [...(bundle.apps_all || [])];
        if (platform && platform !== "all") {
          list = list.filter(a => a.platform === platform);
        }
        if (category) {
          list = list.filter(a => a.category.toLowerCase().includes(category.toLowerCase()));
        }
        if (country) {
          list = list.filter(a => a.country.toLowerCase() === country.toLowerCase());
        }
        if (search) {
          list = list.filter(a =>
            a.name.toLowerCase().includes(search) ||
            (a.developer || "").toLowerCase().includes(search) ||
            (a.company_name || "").toLowerCase().includes(search)
          );
        }
        return new Response(JSON.stringify(list), { headers });
      }

      // 4. Breakouts
      if (route === "breakouts") {
        let data = bundle.breakouts_all;
        if (platform === "ios") data = bundle.breakouts_ios;
        if (platform === "android") data = bundle.breakouts_android;
        return new Response(JSON.stringify(data), { headers });
      }

      // 5. Trends
      if (route === "trends") {
        let data = bundle.trends || [];
        if (category) data = data.filter(t => t.category.toLowerCase().includes(category.toLowerCase()));
        if (platform && platform !== "all") data = data.filter(t => t.platform === platform || t.platform === "all");
        return new Response(JSON.stringify(data), { headers });
      }

      // 6. Pains & Missing features
      if (route === "pains/missing-features") {
        return new Response(JSON.stringify(bundle.missing_features || []), { headers });
      }
      if (route === "pains") {
        let data = bundle.pains || [];
        if (platform && platform !== "all") data = data.filter(p => p.platform === platform || p.platform === "all");
        return new Response(JSON.stringify(data), { headers });
      }

      // 7. Markets
      if (route === "markets") {
        let data = bundle.markets || [];
        if (platform && platform !== "all") data = data.filter(m => m.platform === platform || m.platform === "all");
        return new Response(JSON.stringify(data), { headers });
      }

      // 8. Search
      if (route === "search") {
        return new Response(JSON.stringify(bundle.search || []), { headers });
      }

      // 9. Opportunities
      if (route.startsWith("opportunities")) {
        return new Response(JSON.stringify(bundle.opportunities || []), { headers });
      }

      // 10. Ideas & Kill Idea
      if (route.includes("kill")) {
        return new Response(JSON.stringify({
          success: true,
          analysis: "Audit de stress test validé. Aucun verrou concurrentiel bloquant pour une exécution solo dev rapide."
        }), { headers });
      }
      if (route.startsWith("ideas")) {
        return new Response(JSON.stringify(bundle.ideas || []), { headers });
      }

      // 11. Watchlist
      if (route === "watchlist") {
        if (method === "POST" || method === "DELETE") {
          return new Response(JSON.stringify({ success: true }), { headers });
        }
        return new Response(JSON.stringify(bundle.watchlist || []), { headers });
      }

      // 12. Alerts
      if (route.startsWith("alerts")) {
        return new Response(JSON.stringify(bundle.alerts || []), { headers });
      }

      // 13. Sources & Settings
      if (route === "sources" || route === "sources/sync") {
        return new Response(JSON.stringify(bundle.sources || {}), { headers });
      }
      if (route === "settings") {
        return new Response(JSON.stringify(bundle.settings || {}), { headers });
      }

      return new Response(JSON.stringify({ message: "Endpoint not found", route }), { status: 404, headers });
    }

    // Static Assets Fallback
    return env.ASSETS.fetch(request);
  }
};
