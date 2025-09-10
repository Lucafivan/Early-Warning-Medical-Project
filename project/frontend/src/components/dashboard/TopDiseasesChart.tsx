import { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { fetchTopDiseases, type TopDisease } from "../../services/dashboardApi";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
  LabelList,
  type TooltipProps,
} from "recharts";

type ChartMode = "bar" | "pie";

interface Props {
  limit?: number;
  height?: number;
}

function hslToHex(h: number, s: number, l: number): string {
    const _s = s / 100, _l = l / 100;
    const c = (1 - Math.abs(2 * _l - 1)) * _s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = _l - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }
    const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function makeGreenShades(n: number): string[] {
    if (n <= 0) return [];
    const H = 150, S = 45, L_START = 22, L_END = 68;
    if (n === 1) return [hslToHex(H, S, L_START)];
    return Array.from({ length: n }, (_ , i) => {
        const t = i / (n - 1);
        const l = L_START + t * (L_END - L_START);
        return hslToHex(H, S, l);
    });
}

/* ====== Util lainnya ====== */
function ellipsis(s: string, max = 26) {
    if (!s) return s;
    return s.length <= max ? s : s.slice(0, max - 1) + "…";
}

/* Tooltip khusus PIE (tampilkan nama + count) */
const PieTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const p = payload[0];
        const name = (p.payload as { name?: string })?.name ?? p.name ?? "";
        const value = p.value as number;
        return (
        <div className="rounded border bg-white/95 px-2 py-1 text-xs shadow">
            <div className="font-medium">{name}</div>
            <div>Count: {value}</div>
        </div>
        );
    }
    return null;
};

const TopDiseasesChart: React.FC<Props> = ({ limit = 10, height = 180 }) => {
    const [data, setData] = useState<TopDisease[]>([]);
    const [mode, setMode] = useState<ChartMode>("bar");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Tooltip kustom hanya saat mouse di atas BAR
    const [barTip, setBarTip] = useState<{
        x: number; y: number; name: string; value: number;
    } | null>(null);

    // requestAnimationFrame id untuk throttle update tooltip
    const rafRef = useRef<number | null>(null);

    // Tinggi nyaman
    const H = Math.max(height ?? 180, 460);

    useEffect(() => {
        let alive = true;
        (async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchTopDiseases(limit);
            if (alive) setData(res);
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) setError(e.response?.data?.error ?? e.message);
            else setError("Gagal memuat data");
        } finally {
            if (alive) setLoading(false);
        }
        })();
        return () => { alive = false; };
    }, [limit]);

    useEffect(() => {
    const clear = () => setBarTip(null);
    window.addEventListener("scroll", clear, true); // capture agar event di container mana pun ketangkap
    window.addEventListener("resize", clear);
    window.addEventListener("blur", clear);
    return () => {
        window.removeEventListener("scroll", clear, true);
        window.removeEventListener("resize", clear);
        window.removeEventListener("blur", clear);
    };
    }, []);

    useEffect(() => {
    return () => {
        if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
    }, []);

    useEffect(() => {
    setBarTip(null);
    }, [mode, data]);

    const PALETTE = useMemo(() => makeGreenShades(data.length), [data.length]);
    const pieData = useMemo(() => data.map(d => ({ name: d.disease_name, value: d.count })), [data]);

    return (
        <div className="w-full h-full flex flex-col">
        {/* Header: judul lebih besar + warna hijau gelap; tombol Bar/Pie diperbesar */}
        <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg sm:text-xl font-semibold tracking-wide" style={{ color: "#424141" }}>
            Top 10 Diseases
            </h1>
            <div className="inline-flex gap-0">
            <button
                className={`px-3 py-1.5 text-sm rounded-lg transition ${
                mode === "bar" ? "bg-white shadow" : "bg-white/70 hover:bg-white"
                }`}
                onClick={() => setMode("bar")}
            >
                Bar
            </button>
            <button
                className={`px-3 py-1.5 text-sm rounded-lg transition ${
                mode === "pie" ? "bg-white shadow" : "bg-white/70 hover:bg-white"
                }`}
                onClick={() => setMode("pie")}
            >
                Pie
            </button>
            </div>
        </div>

        <div className="flex-1 relative" onMouseLeave={() => setBarTip(null)}>
            {loading && <div className="text-xs text-gray-600">Loading chart…</div>}
            {error && !loading && <div className="text-xs text-red-600">{error}</div>}
            {!loading && !error && data.length === 0 && <div className="text-xs text-gray-600">Belum ada data.</div>}

            {!loading && !error && data.length > 0 && (
            <ResponsiveContainer width="100%" height={H}>
                {mode === "bar" ? (
                <BarChart
                    data={data}
                    margin={{ top: 32, right: 16, left: 8, bottom: 84 }}
                    barCategoryGap="0%"
                    onMouseLeave={() => setBarTip(null)} 
                >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.22} />
                    <XAxis
                    dataKey="disease_name"
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-30}
                    textAnchor="end"
                    height={72}
                    tickMargin={12}
                    tickFormatter={(v) => ellipsis(String(v), 26)}
                    />
                    <YAxis domain={[0, (max: number) => Math.ceil(max * 1.25)]} allowDecimals={false} />

                    {/* Hapus Tooltip bawaan untuk BarChart agar tidak aktif di area kosong */}

                    <Bar
                    dataKey="count"
                    barSize={70}
                    radius={[8, 8, 0, 0]}
                    isAnimationActive={false}
                    style={{ cursor: "pointer" }}
                    // Tooltip kustom: hanya aktif saat mouse di atas BAR
                    onMouseMove={(d: any, _index: number, e: any) => {
                        const evt = e?.nativeEvent ?? e;
                        const x = evt?.clientX ?? 0;
                        const y = evt?.clientY ?? 0;
                        // Batasi update ke frame berikutnya saja
                        if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
                        rafRef.current = requestAnimationFrame(() => {
                            setBarTip({
                            x,
                            y,
                            name: d?.payload?.disease_name ?? "",
                            value: d?.value ?? d?.payload?.count ?? 0,
                            });
                        });
                        }}
                    onMouseLeave={() => {
                        setBarTip(null)
                        if (rafRef.current != null) {
                            cancelAnimationFrame(rafRef.current);
                            rafRef.current = null;
                        }
                    }}
                    >
                    {data.map((_, i) => (
                        <Cell key={i} fill={PALETTE[i]} />
                    ))}
                    <LabelList dataKey="Count" position="top" offset={12} className="text-[11px]" />
                    </Bar>

                </BarChart>
                ) : (
                <PieChart margin={{ top: 16, right: 16, bottom: 120, left: 16 }}>
                    <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius="100%"
                    labelLine={false}
                    label={false}
                    >
                    {pieData.map((_, i) => (
                        <Cell key={i} fill={PALETTE[i]} />
                    ))}
                    </Pie>
                    <Legend
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    wrapperStyle={{ paddingTop: 8 }}
                    formatter={(value: string) => ellipsis(value, 36)}
                    />
                    <Tooltip content={<PieTooltip />} /> {/* Tooltip PIE: nama + count */}
                </PieChart>
                )}
          </ResponsiveContainer>
        )}

        {/* Tooltip kustom untuk BAR: hanya muncul di atas bar yang disentuh */}
        {barTip && (
          <div
            className="pointer-events-none fixed z-50 rounded border border-gray-200 bg-white/95 px-2 py-1 text-xs shadow"
            style={{ left: barTip.x + 12, top: barTip.y + 12 }}
          >
            <div className="font-medium">{barTip.name}</div>
            <div>Count: {barTip.value}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopDiseasesChart;