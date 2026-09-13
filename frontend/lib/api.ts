const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return "http://localhost:8000/api/v1";
    }
    return "/api/v1";
  }
  return "http://localhost:8000/api/v1";
};

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${getBaseUrl()}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      cache: "no-store"
    });
    if (!res.ok) {
      throw new Error(`Erreur API ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`Erreur lors de l'appel à ${url}:`, error);
    throw error;
  }
}

export const api = {
  // Overview avec filtrage de plateforme (iOS, Android, Combiné)
  getOverview: (platform?: string) => {
    const p = platform && platform !== "all" ? `?platform=${encodeURIComponent(platform)}` : "";
    return fetchApi<any>(`/overview${p}`);
  },

  // Apps
  getApps: (params: Record<string, any> = {}) => {
    const cleanParams: Record<string, string> = {};
    for (const [k, v] of Object.entries(params)) {
      if (v && v !== "all" && v !== "undefined") {
        cleanParams[k] = String(v);
      }
    }
    const q = new URLSearchParams(cleanParams).toString();
    return fetchApi<any[]>(`/apps${q ? `?${q}` : ""}`);
  },
  getAppDetail: (appId: string) => fetchApi<any>(`/apps/${encodeURIComponent(appId)}`),

  // New Launches & Functional Analysis
  getNewLaunches: (params: { platform?: string; category?: string; sort_by?: string; search?: string } = {}) => {
    const cleanParams: Record<string, string> = {};
    for (const [k, v] of Object.entries(params)) {
      if (v && v !== "all" && v !== "undefined") {
        cleanParams[k] = String(v);
      }
    }
    const q = new URLSearchParams(cleanParams).toString();
    return fetchApi<{
      radar: {
        total_new_launches: number;
        ios_count: number;
        android_count: number;
        indie_ratio: string;
        top_active_category: string;
        avg_days_since_launch: number;
      };
      apps: any[];
    }>(`/new-launches${q ? `?${q}` : ""}`);
  },

  // Trends
  getTrends: (category?: string, platform?: string) => {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (platform && platform !== "all") params.append("platform", platform);
    const q = params.toString();
    return fetchApi<any[]>(`/trends${q ? `?${q}` : ""}`);
  },

  // Breakouts
  getBreakouts: (platform?: string) => {
    const p = platform && platform !== "all" ? `?platform=${encodeURIComponent(platform)}` : "";
    return fetchApi<any[]>(`/breakouts${p}`);
  },

  // Pains & Missing features
  getPainPoints: (platform?: string) => {
    const p = platform && platform !== "all" ? `?platform=${encodeURIComponent(platform)}` : "";
    return fetchApi<any[]>(`/pains${p}`);
  },
  getMissingFeatures: () => fetchApi<any[]>("/pains/missing-features"),

  // Markets & Geo Gaps
  getMarketGaps: (platform?: string) => {
    const p = platform && platform !== "all" ? `?platform=${encodeURIComponent(platform)}` : "";
    return fetchApi<any[]>(`/markets${p}`);
  },

  // Search
  getSearchMetrics: (country?: string) => {
    const q = country ? `?country=${encodeURIComponent(country)}` : "";
    return fetchApi<any[]>(`/search${q}`);
  },

  // Opportunities
  getOpportunities: (status?: string, platform?: string) => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (platform && platform !== "all") params.append("platform", platform);
    const q = params.toString();
    return fetchApi<any[]>(`/opportunities${q ? `?${q}` : ""}`);
  },
  getOpportunity: (oppId: number) => fetchApi<any>(`/opportunities/${oppId}`),

  // Ideas & Kill The Idea
  getIdeas: (platform?: string) => {
    const p = platform && platform !== "all" ? `?platform=${encodeURIComponent(platform)}` : "";
    return fetchApi<any[]>(`/ideas${p}`);
  },
  getIdea: (ideaId: number) => fetchApi<any>(`/ideas/${ideaId}`),
  killIdea: (ideaId: number) => fetchApi<any>(`/ideas/${ideaId}/kill`, { method: "POST" }),

  // Watchlist
  getWatchlist: () => fetchApi<any[]>("/watchlist"),
  addToWatchlist: (item: any) => fetchApi<any>("/watchlist", {
    method: "POST",
    body: JSON.stringify(item)
  }),
  removeFromWatchlist: (id: number) => fetchApi<any>(`/watchlist/${id}`, { method: "DELETE" }),

  // Alerts
  getAlerts: () => fetchApi<any[]>("/alerts"),
  markAlertRead: (id: number) => fetchApi<any>(`/alerts/${id}/read`, { method: "POST" }),

  // Sources & Observability
  getSources: () => fetchApi<any>("/sources"),
  triggerSync: () => fetchApi<any>("/sources/sync", { method: "POST" }),

  // Settings
  getSettings: () => fetchApi<any>("/settings"),
  updateSettings: (settings: any) => fetchApi<any>("/settings", {
    method: "POST",
    body: JSON.stringify(settings)
  })
};
