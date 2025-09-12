import { api } from "./http";

/* ---------- Top Diseases ---------- */
export interface TopDisease {
    disease_id: number;
    disease_name: string;
    count: number;
}

export async function fetchTopDiseases(limit = 10): Promise<TopDisease[]> {
    const { data } = await api.get<TopDisease[]>("/dashboard_top_diseases", {
        params: { limit },
    });
    return data;
}

/* ---------- Dashboard Weather (baru) ---------- */
export interface DashboardWeather {
    work_location?: { id: number } | null;
    weather?:
        | {
            min_temperature: number | null;
            max_temperature: number | null;
            average_temperature: number | null;
            weather_condition: string | null;
            timestamp: string | null;
        }
        | null;
    air_quality?:
        | {
            air_quality_index: number | null;
            timestamp: string | null;
        }
        | null;
}

export async function fetchDashboardWeather(): Promise<DashboardWeather> {
    const { data } = await api.get<DashboardWeather>("/dashboard_weather");
    return data;
}

/* ---------- Fallback global (/weather & /air_quality) ---------- */
export interface WeatherRow {
    id: number;
    work_location_id: number;
    min_temperature: number | null;
    max_temperature: number | null;
    average_temperature: number | null;
    weather_condition: string | null;
    timestamp: string | null;
}

export interface AirQualityRow {
    id: number;
    work_location_id: number;
    air_quality_index: number | null;
    timestamp: string | null;
}

export async function fetchLatestWeatherGlobal(): Promise<WeatherRow | null> {
    const { data } = await api.get<WeatherRow[]>("/weather");
    if (!Array.isArray(data) || data.length === 0) return null;
    const sorted = [...data].sort(
        (a, b) =>
        new Date(b.timestamp ?? 0).getTime() -
        new Date(a.timestamp ?? 0).getTime()
    );
    return sorted[0] ?? null;
}

export async function fetchLatestAirQualityGlobal(): Promise<AirQualityRow | null> {
    const { data } = await api.get<AirQualityRow[]>("/air_quality");
    if (!Array.isArray(data) || data.length === 0) return null;
    const sorted = [...data].sort(
    (a, b) =>
        new Date(b.timestamp ?? 0).getTime() -
        new Date(a.timestamp ?? 0).getTime()
    );
    return sorted[0] ?? null;
}

/* ---------- Work Locations (field baru) ---------- */
export interface WorkLocation {
    id: number;
  location_name: string;
  latitude?: number | null;
  longitude?: number | null;
}

export async function fetchWorkLocations(): Promise<WorkLocation[]> {
  const { data } = await api.get<WorkLocation[]>("/work_locations");
  return data;
}

// ===== Divisions & Top Diseases by Division =====
export interface DivisionItem {
  division: string | null;
}

export interface DivisionTopDisease {
  disease_id: number;
  disease_name: string;
  count: number;
}

export interface DivisionBucket {
  division: string | null;
  top_diseases: DivisionTopDisease[];
}

/** GET /divisions -> array of { division } */
export async function fetchDivisions(): Promise<string[]> {
  const { data } = await api.get<DivisionItem[]>("/divisions");
  // ambil hanya yang ada nilainya dan unik
  const uniq = Array.from(
    new Set(
      (data ?? [])
        .map(d => (d?.division ?? "").trim())
        .filter(Boolean)
    )
  );
  return uniq;
}

/** GET /dashboard_top_diseases_by_division?limit=5 -> array bucket */
export async function fetchTopDiseasesByDivision(limit = 5): Promise<DivisionBucket[]> {
  const { data } = await api.get<DivisionBucket[]>("/dashboard_top_diseases_by_division", {
    params: { limit },
  });
  return Array.isArray(data) ? data : [];
}