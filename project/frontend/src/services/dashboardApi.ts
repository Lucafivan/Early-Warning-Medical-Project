import { api } from "./http";

export interface TopDisease {
    disease_id: number;
    disease_name: string;
    count: number;
}

export interface DashboardWeather {
    work_location?: { id: number } | null;
    weather?: {
        temperature: number | null;
        humidity: number | null;
        wind_speed: number | null;
        timestamp: string | null;
    } | null;
    air_quality?: {
        aqi: number | null;
        pm25: number | null;
        pm10: number | null;
        co_level: number | null;
        timestamp: string | null;
    } | null;
}

export async function fetchTopDiseases(limit = 10): Promise<TopDisease[]> {
    const { data } = await api.get<TopDisease[]>("/dashboard_top_diseases", {
        params: { limit },
    });
    return data;
}

export async function fetchDashboardWeather(): Promise<DashboardWeather> {
    const { data } = await api.get<DashboardWeather>("/dashboard_weather");
    return data;
}

export interface WeatherRow {
    id: number;
    work_location_id: number;
    temperature: number | null;
    humidity: number | null;
    wind_speed: number | null;
    timestamp: string | null;
}

export interface AirQualityRow {
    id: number;
    work_location_id: number;
    aqi: number | null;
    pm25: number | null;
    pm10: number | null;
    co_level: number | null;
    timestamp: string | null;
}

export async function fetchLatestWeatherGlobal(): Promise<WeatherRow | null> {
    const { data } = await api.get<WeatherRow[]>("/weather");
    if (!Array.isArray(data) || data.length === 0) return null;
    // Ambil record dengan timestamp paling baru
    const sorted = [...data].sort((a, b) =>
        new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime()
    );
    return sorted[0] ?? null;
}

export async function fetchLatestAirQualityGlobal(): Promise<AirQualityRow | null> {
    const { data } = await api.get<AirQualityRow[]>("/air_quality");
    if (!Array.isArray(data) || data.length === 0) return null;
    const sorted = [...data].sort((a, b) =>
        new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime()
    );
    return sorted[0] ?? null;
}

export interface WorkLocation {
    id: number;
    name: string;
    city: string;
    latitude: number;
    longitude: number;
}

export async function fetchWorkLocations(): Promise<WorkLocation[]> {
    const { data } = await api.get<WorkLocation[]>("/work_locations");
    return data;
}