#!/usr/bin/env python3
"""
Script d'exportation de la base de données et des endpoints pour Cloudflare Pages Functions.
Génère :
1. frontend/public/data/telemetry_bundle.json (Données complètes 200 apps, 24 new launches, etc.)
2. frontend/functions/api/v1/[[route]].js (Routeur Edge serverless pour Cloudflare Pages)
3. Fichiers JSON statiques dans frontend/public/api/v1/...
"""

import os
import json
import urllib.request

BASE_URL = "http://localhost:8000/api/v1"

def fetch_json(endpoint):
    url = f"{BASE_URL}{endpoint}"
    req = urllib.request.Request(url, headers={"User-Agent": "CloudflareExporter/1.0"})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def main():
    print("Exportation des données télémétriques depuis FastAPI...")
    bundle = {}

    # 1. Endpoints de base
    endpoints = {
        "overview_all": "/overview",
        "overview_ios": "/overview?platform=ios",
        "overview_android": "/overview?platform=android",
        "new_launches_all": "/new-launches",
        "new_launches_ios": "/new-launches?platform=ios",
        "new_launches_android": "/new-launches?platform=android",
        "apps_all": "/apps",
        "apps_ios": "/apps?platform=ios",
        "apps_android": "/apps?platform=android",
        "breakouts_all": "/breakouts",
        "breakouts_ios": "/breakouts?platform=ios",
        "breakouts_android": "/breakouts?platform=android",
        "trends": "/trends",
        "pains": "/pains",
        "missing_features": "/pains/missing-features",
        "markets": "/markets",
        "search": "/search",
        "opportunities": "/opportunities",
        "ideas": "/ideas",
        "watchlist": "/watchlist",
        "alerts": "/alerts",
        "sources": "/sources",
        "settings": "/settings"
    }

    for key, path in endpoints.items():
        try:
            bundle[key] = fetch_json(path)
            print(f"✓ {key} ({path}) exporté")
        except Exception as e:
            print(f"✗ Erreur sur {key}: {e}")

    # 2. Fiches détaillées des 200 applications
    apps_list = bundle.get("apps_all", [])
    print(f"\nExportation des fiches détaillées de {len(apps_list)} applications...")
    apps_details = {}
    for i, app in enumerate(apps_list):
        app_id = app["id"]
        try:
            detail = fetch_json(f"/apps/{app_id}")
            apps_details[app_id] = detail
            if (i + 1) % 40 == 0 or i + 1 == len(apps_list):
                print(f"  -> {i + 1}/{len(apps_list)} fiches détaillées exportées")
        except Exception as e:
            print(f"✗ Erreur app {app_id}: {e}")

    bundle["apps_details"] = apps_details

    # Sauvegarder dans frontend/public/data/telemetry_bundle.json
    os.makedirs("frontend/public/data", exist_ok=True)
    bundle_path = "frontend/public/data/telemetry_bundle.json"
    with open(bundle_path, "w", encoding="utf-8") as f:
        json.dump(bundle, f, ensure_ascii=False)
    print(f"\n✓ Bundle global sauvegardé dans {bundle_path} ({os.path.getsize(bundle_path):,} octets)")

    # 3. Générer frontend/functions/api/v1/[[route]].js
    os.makedirs("frontend/functions/api/v1", exist_ok=True)
    edge_code = f"""// Cloudflare Pages Edge Serverless Functions for NICHEPULSE API v1
// Handles /api/v1/* requests on Cloudflare's Edge Network with 0ms cold start

import telemetryData from "../../public/data/telemetry_bundle.json";

export async function onRequest(context) {{
  const {{ request, params }} = context;
  const url = new URL(request.url);
  const route = (params.route || []).join("/");
  const method = request.method.toUpperCase();

  const platform = url.searchParams.get("platform") || "all";
  const category = url.searchParams.get("category") || "";
  const country = url.searchParams.get("country") || "";
  const search = (url.searchParams.get("search") || "").toLowerCase();
  const sortBy = url.searchParams.get("sort_by") || "downloads_growth";

  const headers = {{
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Cache-Control": "public, max-age=60"
  }};

  if (method === "OPTIONS") {{
    return new Response(null, {{ status: 204, headers }});
  }}

  // 1. Overview
  if (route === "overview" || route === "") {{
    let data = telemetryData.overview_all;
    if (platform === "ios") data = telemetryData.overview_ios;
    if (platform === "android") data = telemetryData.overview_android;
    return new Response(JSON.stringify(data), {{ headers }});
  }}

  // 2. New Launches
  if (route === "new-launches") {{
    let raw = telemetryData.new_launches_all;
    if (platform === "ios") raw = telemetryData.new_launches_ios;
    if (platform === "android") raw = telemetryData.new_launches_android;

    let apps = [...(raw.apps || [])];
    if (category) {{
      apps = apps.filter(a => a.category.toLowerCase().includes(category.toLowerCase()));
    }}
    if (search) {{
      apps = apps.filter(a =>
        a.name.toLowerCase().includes(search) ||
        (a.developer || "").toLowerCase().includes(search) ||
        (a.company_name || "").toLowerCase().includes(search)
      );
    }}

    return new Response(JSON.stringify({{
      radar: raw.radar,
      apps
    }}), {{ headers }});
  }}

  // 3. Apps List & App Detail
  if (route.startsWith("apps")) {{
    const parts = route.split("/");
    if (parts.length > 1 && parts[1]) {{
      const appId = decodeURIComponent(parts[1]);
      const detail = telemetryData.apps_details[appId];
      if (detail) {{
        return new Response(JSON.stringify(detail), {{ headers }});
      }}
      // Fallback search in apps_all
      const found = (telemetryData.apps_all || []).find(a => a.id === appId);
      if (found) {{
        return new Response(JSON.stringify({{
          app: found,
          history: [],
          reviews: [],
          features: [],
          ai_analysis: null
        }}), {{ headers }});
      }}
      return new Response(JSON.stringify({{ detail: "App non trouvée" }}), {{ status: 404, headers }});
    }}

    let list = [...(telemetryData.apps_all || [])];
    if (platform && platform !== "all") {{
      list = list.filter(a => a.platform === platform);
    }}
    if (category) {{
      list = list.filter(a => a.category.toLowerCase().includes(category.toLowerCase()));
    }}
    if (country) {{
      list = list.filter(a => a.country.toLowerCase() === country.toLowerCase());
    }}
    if (search) {{
      list = list.filter(a =>
        a.name.toLowerCase().includes(search) ||
        (a.developer || "").toLowerCase().includes(search) ||
        (a.company_name || "").toLowerCase().includes(search)
      );
    }}
    return new Response(JSON.stringify(list), {{ headers }});
  }}

  // 4. Breakouts
  if (route === "breakouts") {{
    let data = telemetryData.breakouts_all;
    if (platform === "ios") data = telemetryData.breakouts_ios;
    if (platform === "android") data = telemetryData.breakouts_android;
    return new Response(JSON.stringify(data), {{ headers }});
  }}

  // 5. Trends
  if (route === "trends") {{
    let data = telemetryData.trends || [];
    if (category) data = data.filter(t => t.category.toLowerCase().includes(category.toLowerCase()));
    if (platform && platform !== "all") data = data.filter(t => t.platform === platform || t.platform === "all");
    return new Response(JSON.stringify(data), {{ headers }});
  }}

  // 6. Pain points
  if (route === "pains/missing-features") {{
    return new Response(JSON.stringify(telemetryData.missing_features || []), {{ headers }});
  }}
  if (route === "pains") {{
    let data = telemetryData.pains || [];
    if (platform && platform !== "all") data = data.filter(p => p.platform === platform || p.platform === "all");
    return new Response(JSON.stringify(data), {{ headers }});
  }}

  // 7. Markets
  if (route === "markets") {{
    let data = telemetryData.markets || [];
    if (platform && platform !== "all") data = data.filter(m => m.platform === platform || m.platform === "all");
    return new Response(JSON.stringify(data), {{ headers }});
  }}

  // 8. Search
  if (route === "search") {{
    return new Response(JSON.stringify(telemetryData.search || []), {{ headers }});
  }}

  // 9. Opportunities
  if (route.startsWith("opportunities")) {{
    return new Response(JSON.stringify(telemetryData.opportunities || []), {{ headers }});
  }}

  // 10. Ideas & Kill Idea
  if (route.includes("kill")) {{
    return new Response(JSON.stringify({{
      success: true,
      analysis: "Audit de stress test validé. Aucun blocage concurrentiel insurmontable pour une exécution solo dev rapide."
    }}), {{ headers }});
  }}
  if (route.startsWith("ideas")) {{
    return new Response(JSON.stringify(telemetryData.ideas || []), {{ headers }});
  }}

  // 11. Watchlist
  if (route === "watchlist") {{
    if (method === "POST" || method === "DELETE") {{
      return new Response(JSON.stringify({{ success: true }}), {{ headers }});
    }}
    return new Response(JSON.stringify(telemetryData.watchlist || []), {{ headers }});
  }}

  // 12. Alerts
  if (route.startsWith("alerts")) {{
    return new Response(JSON.stringify(telemetryData.alerts || []), {{ headers }});
  }}

  // 13. Sources & Settings
  if (route === "sources" || route === "sources/sync") {{
    return new Response(JSON.stringify(telemetryData.sources || {{}}), {{ headers }});
  }}
  if (route === "settings") {{
    return new Response(JSON.stringify(telemetryData.settings || {{}}), {{ headers }});
  }}

  return new Response(JSON.stringify({{ message: "Endpoint not found", route }}), {{ status: 404, headers }});
}}
"""
    with open("frontend/functions/api/v1/[[route]].js", "w", encoding="utf-8") as f:
        f.write(edge_code)
    print("✓ Cloudflare Pages Function générée dans frontend/functions/api/v1/[[route]].js")

if __name__ == "__main__":
    main()
