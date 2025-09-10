import { useEffect, useState } from "react";
import axios from "axios";
import {
  fetchDashboardWeather,
  type DashboardWeather,
  fetchLatestWeatherGlobal,
  fetchLatestAirQualityGlobal,
  fetchWorkLocations,
  type WorkLocation,
} from "../../services/dashboardApi";

function formatDate(ts?: string | null) {
    if (!ts) return "-";
    try { return new Date(ts).toLocaleString(); } catch { return String(ts); }
}

function aqiCategory(aqi: number | null | undefined) {
    if (aqi == null) return { label: "Unknown", badge: "bg-gray-400" };
    if (aqi <= 50) return { label: "Good", badge: "bg-green-500" };
    if (aqi <= 100) return { label: "Moderate", badge: "bg-yellow-500" };
    if (aqi <= 150) return { label: "Unhealthy (SG)", badge: "bg-orange-500" };
    if (aqi <= 200) return { label: "Unhealthy", badge: "bg-red-500" };
    if (aqi <= 300) return { label: "Very Unhealthy", badge: "bg-purple-600" };
    return { label: "Hazardous", badge: "bg-rose-700" };
}

interface Props {
    /** opsional: kalau mau paksa minimum tinggi container */
    height?: number;
}

const WeatherAirQualityCard: React.FC<Props> = ({ height }) => {
    const [data, setData] = useState<DashboardWeather | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFallback, setIsFallback] = useState(false);
    const [fallbackReason, setFallbackReason] = useState<string | null>(null);
    const [locationLabel, setLocationLabel] = useState<string>("Lokasi Anda");

    const containerStyle = height ? { minHeight: Math.max(height, 280) } : undefined;

    useEffect(() => {
        let alive = true;
        (async () => {
        setLoading(true);
        setError(null);
        setIsFallback(false);
        setLocationLabel("Lokasi Anda");

        try {
            const res = await fetchDashboardWeather();
            if (!alive) return;
            setData(res);

            const locId = res.work_location?.id ?? null;
            if (locId != null) {
            try {
                const locs = await fetchWorkLocations();
                if (!alive) return;
                const loc = locs.find((l: WorkLocation) => l.id === locId);
                setLocationLabel(loc ? `${loc.name}${loc.city ? " — " + loc.city : ""}` : `Work Location #${locId}`);
            } catch {
                setLocationLabel(`Work Location #${locId}`);
            }
            }
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
            const status = e.response?.status;
            const msg = e.response?.data?.error ?? e.message;

            if (status === 401) {
                setError("Silakan login untuk melihat Weather & Air Quality.");
            } else if (status === 404) {
                try {
                const [w, aq] = await Promise.all([fetchLatestWeatherGlobal(), fetchLatestAirQualityGlobal()]);
                if (!alive) return;
                setData({
                    weather: w ? { temperature: w.temperature, humidity: w.humidity, wind_speed: w.wind_speed, timestamp: w.timestamp } : null,
                    air_quality: aq ? { aqi: aq.aqi, pm25: aq.pm25, pm10: aq.pm10, co_level: aq.co_level, timestamp: aq.timestamp } : null,
                });
                setIsFallback(true);
                setFallbackReason(msg || "Assignment tidak ditemukan");

                const locFallbackId = w?.work_location_id ?? aq?.work_location_id ?? null;
                if (locFallbackId != null) {
                    try {
                    const locs = await fetchWorkLocations();
                    if (!alive) return;
                    const loc = locs.find((l: WorkLocation) => l.id === locFallbackId);
                    setLocationLabel(loc ? `${loc.name}${loc.city ? " — " + loc.city : ""}` : `Work Location #${locFallbackId}`);
                    } catch {
                    setLocationLabel(`Work Location #${locFallbackId}`);
                    }
                } else {
                    setLocationLabel("Perusahaan (fallback)");
                }
                } catch {
                setError("Tidak ada data weather/air quality untuk ditampilkan.");
                }
            } else {
                setError(msg);
            }
            } else {
            setError("Gagal memuat dashboard weather");
            }
        } finally {
            if (alive) setLoading(false);
        }
        })();
        return () => { alive = false; };
    }, []);

    if (loading) return <div className="text-xs text-gray-600">Loading weather & air quality…</div>;
    if (error) return <div className="text-xs text-red-600">{error}</div>;
    if (!data || (!data.weather && !data.air_quality)) {
        return <div className="text-xs text-gray-600">Belum ada data untuk ditampilkan.</div>;
    }

    const aqi = data.air_quality?.aqi ?? null;
    const cat = aqiCategory(aqi);

    return (
        <div className="space-y-3" style={containerStyle}>
            {isFallback && (
            <div className="text-xs sm:text-sm text-amber-900 bg-amber-100/90 border border-amber-200 rounded-md px-3 py-2 flex items-center gap-2">
                <span className="text-base leading-none">⚠️</span>
                <span className="font-normal">
                Menampilkan data terbaru perusahaan (fallback). Alasan: {fallbackReason}
                </span>
            </div>
            )}


        {/* Cards: tinggi mengikuti konten (lebih pendek, tanpa ruang putih berlebih) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            {/* Weather */}
            <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-4 flex flex-col">
            <div className="mb-2">
                <div className="text-base font-semibold">Weather</div>
                <div className="text-xs text-gray-500">({locationLabel})</div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5 text-sm">
                <div>
                <div className="text-gray-600">Suhu</div>
                <div className="text-lg font-semibold">
                    {data.weather?.temperature ?? "-"}
                    <span className="text-xs font-normal text-gray-600 ml-1">°C</span>
                </div>
                </div>
                <div>
                <div className="text-gray-600">Kelembapan</div>
                <div className="text-lg font-semibold">
                    {data.weather?.humidity ?? "-"}
                    <span className="text-xs font-normal text-gray-600 ml-1">%</span>
                </div>
                </div>
                <div>
                <div className="text-gray-600">Angin</div>
                <div className="text-lg font-semibold">
                    {data.weather?.wind_speed ?? "-"}
                    <span className="text-xs font-normal text-gray-600 ml-1">m/s</span>
                </div>
                </div>
            </div>

            <div className="mt-3 pt-2 text-xs text-gray-500">
                Update: {formatDate(data.weather?.timestamp ?? null)}
            </div>
            </div>

            {/* Air Quality */}
            <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-4 flex flex-col">
            <div className="mb-2">
                <div className="text-base font-semibold">Air Quality</div>
                <div className="text-xs text-gray-500">({locationLabel})</div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5 text-sm">
                <div className="col-span-2 sm:col-span-1">
                <div className="text-gray-600">AQI</div>
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-white text-xs ${cat.badge}`}>
                    {aqi ?? "-"}
                    </span>
                    <span className="text-xs text-gray-600">({cat.label})</span>
                </div>
                </div>
                <div>
                <div className="text-gray-600">PM2.5</div>
                <div className="text-lg font-semibold">
                    {data.air_quality?.pm25 ?? "-"}
                    <span className="text-xs font-normal text-gray-600 ml-1">
                    µg/m<sup>3</sup>
                    </span>
                </div>
                </div>
                <div>
                <div className="text-gray-600">PM10</div>
                <div className="text-lg font-semibold">
                    {data.air_quality?.pm10 ?? "-"}
                    <span className="text-xs font-normal text-gray-600 ml-1">
                    µg/m<sup>3</sup>
                    </span>
                </div>
                </div>
                <div>
                <div className="text-gray-600">CO</div>
                <div className="text-lg font-semibold">
                    {data.air_quality?.co_level ?? "-"}
                    <span className="text-xs font-normal text-gray-600 ml-1">ppm</span>
                </div>
                </div>
            </div>

            <div className="mt-3 pt-2 text-xs text-gray-500">
                Update: {formatDate(data.air_quality?.timestamp ?? null)}
            </div>
            </div>
        </div>
    </div>
  );
};

export default WeatherAirQualityCard;