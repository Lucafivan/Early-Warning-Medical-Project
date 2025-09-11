import { useEffect, useMemo, useState } from "react";
import {
  fetchEarlyWarning,
  type EarlyWarningRow,
  type RiskStatus,
} from "../services/earlyWarningApi";

// ===== helpers =====
function segClass(s: RiskStatus): string {
  if (!s) return "bg-gray-300";
  if (s === "aman") return "bg-green-500";
  if (s === "waspada") return "bg-amber-500";
  return "bg-red-500";
}
function titleCaseStatus(s: RiskStatus): string {
  if (!s) return "—";
  if (s === "aman") return "Aman";
  if (s === "waspada") return "Waspada";
  return "Bahaya";
}
function fmtTemp(v: number | null | undefined): string {
  return v == null ? "—" : `${Number(v).toFixed(1)}°C`;
}
function fmtAQ(v: number | null | undefined): string {
  return v == null ? "—" : `${Math.round(Number(v))}`;
}
function fmtPct(v: number | null | undefined): string {
  return v == null ? "—" : `${Math.round(Number(v))}%`;
}
function getWeatherStatus(row: EarlyWarningRow): RiskStatus {
  const p = row.weather_high_risk_percent;
  if (p == null) return null;
  if (p >= 66) return "bahaya";
  if (p > 0) return "waspada";
  return "aman";
}

function WarningSegments({ row }: { row: EarlyWarningRow }) {
  const maxStatus: RiskStatus = row.max_temp_status ?? null;
  const avgStatus: RiskStatus = row.avg_temp_status ?? null;
  const aqStatus: RiskStatus = row.air_quality_status ?? null;
  const wxStatus: RiskStatus = getWeatherStatus(row);

  const allNull =
    maxStatus === null && avgStatus === null && aqStatus === null && wxStatus === null;

  return (
    <div className="w-full">
      {/* segmented bar 4 bagian (Max / Avg / AQ / Wx) */}
      <div
        className="mt-1.5 grid grid-cols-4 gap-px rounded-full bg-gray-200 overflow-hidden pointer-events-none cursor-default select-none"
      >
        <div className={`h-3 ${segClass(maxStatus)}`} aria-label={`Max: ${titleCaseStatus(maxStatus)}`} />
        <div className={`h-3 ${segClass(avgStatus)}`} aria-label={`Avg: ${titleCaseStatus(avgStatus)}`} />
        <div className={`h-3 ${segClass(aqStatus)}`} aria-label={`AQ: ${titleCaseStatus(aqStatus)}`} />
        <div className={`h-3 ${segClass(wxStatus)}`} aria-label={`Wx: ${titleCaseStatus(wxStatus)}`} />
      </div>

      {/* Nilai sesuai urutan segmen */}
      <div className="mt-3 grid grid-cols-4 gap-2 text-[12px]">
        <div className="rounded-lg bg-gray-50 px-2 py-1">
          <span className="text-gray-500">Max Temp: </span>
          <span className="font-medium text-gray-900">{fmtTemp(row.max_temperature)}</span>
        </div>
        <div className="rounded-lg bg-gray-50 px-2 py-1">
          <span className="text-gray-500">Avg Temp: </span>
          <span className="font-medium text-gray-900">{fmtTemp(row.average_temperature)}</span>
        </div>
        <div className="rounded-lg bg-gray-50 px-2 py-1">
          <span className="text-gray-500">AQI: </span>
          <span className="font-medium text-gray-900">{fmtAQ(row.air_quality_index)}</span>
        </div>
        <div className="rounded-lg bg-gray-50 px-2 py-1">
          <span className="text-gray-500">Wx: </span>
          <span className="font-medium text-gray-900">{fmtPct(row.weather_high_risk_percent)}</span>
        </div>
      </div>

      {allNull && <div className="mt-2 text-[12px] text-gray-400">—</div>}
    </div>
  );
}

const EarlyWarningPage: React.FC = () => {
  const [rows, setRows] = useState<EarlyWarningRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchEarlyWarning();
        if (mounted) setRows(data);
      } catch (e: any) {
        if (mounted) setErr(e?.message ?? "Gagal memuat data");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return needle
      ? rows.filter((x) => x.location_name.toLowerCase().includes(needle))
      : rows.slice();
  }, [rows, q]);

  return (
    <div className="space-y-6">
      {/* Header + Search */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold max-w-2xl">Early Warning</h1>
        <div className="w-64">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari lokasi…"
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* TABLE: 2 kolom (Lokasi / Warning) */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="grid grid-cols-12 gap-0 border-b bg-gray-50 px-4 py-3 text-base font-semibold text-gray-700">
          <div className="col-span-5">Lokasi</div>
          <div className="col-span-7">Warning</div>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-gray-500">Memuat…</div>
        ) : err ? (
          <div className="p-6 text-sm text-red-600">{err}</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">Tidak ada data.</div>
        ) : (
          <ul role="list" className="divide-y divide-gray-200">
            {filtered.map((row) => (
              <li key={row.location_name} className="grid grid-cols-12 items-start gap-0 px-4 py-3">
                <div className="col-span-5">
                  <div className="text-lg sm:text-xl font-medium text-gray-900">{row.location_name}</div>
                  <div className="mt-1 text-xs text-gray-500">{row.weather_condition ?? "—"}</div>
                </div>
                <div className="col-span-7 pr-10 pt-1">
                  <WarningSegments row={row} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Keterangan warna & singkatan */}
      <div className="mt-4 text-xs text-gray-600 space-y-1">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
            <span>Aman</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span>Waspada</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
            <span>Bahaya</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-gray-300" />
            <span>Data tidak tersedia</span>
          </span>
        </div>

        <div>
          <span className="font-medium">AQI</span> = <span className="italic">Air Quality Index</span> (makin besar = makin berisiko).{" "}
          <span className="font-medium">Wx</span> = risiko bahaya saat kondisi cuaca sekarang (makin besar = makin berisiko).
        </div>
      </div>
    </div>
  );
};

export default EarlyWarningPage;