import { useEffect, useMemo, useRef, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  Cell,
} from "recharts";
import axios from "axios";
import {
  fetchDivisions,
  fetchTopDiseasesByDivision,
  type DivisionBucket,
  type DivisionTopDisease,
} from "../../services/dashboardApi";

interface Props {
    limit?: number;     // default 5 (sesuai BE)
    height?: number;    // tinggi minimum kartu
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
function ellipsis(s: string, max = 28) {
    if (!s) return s;
    return s.length <= max ? s : s.slice(0, max - 1) + "…";
}

const TopDiseasesByDivisionChart: React.FC<Props> = ({ limit = 5, height = 320 }) => {
    const [divisions, setDivisions] = useState<string[]>([]);
    const [selected, setSelected] = useState<string>("");
    const [buckets, setBuckets] = useState<DivisionBucket[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    const H = Math.max(height, 320);
    const firstLoadRef = useRef(true);

    // ===== Tooltip Kustom (seperti TopDiseasesChart) ===== // NEW
    const [barTip, setBarTip] = useState<{ x: number; y: number; name: string; value: number } | null>(null); // NEW
    const rafRef = useRef<number | null>(null); // NEW
    const seqRef = useRef(0); // NEW
    const containerRef = useRef<HTMLDivElement | null>(null); // NEW
    const clearTip = () => { // NEW
        seqRef.current++;
        setBarTip(null);
        if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        }
    };

    useEffect(() => { // NEW
        const clear = () => clearTip();
        window.addEventListener("scroll", clear, true);
        window.addEventListener("resize", clear);
        window.addEventListener("blur", clear);
        return () => {
        window.removeEventListener("scroll", clear, true);
        window.removeEventListener("resize", clear);
        window.removeEventListener("blur", clear);
        };
    }, []);

    useEffect(() => { // NEW - clear saat pointer benar2 keluar area card
        const handleMove = (e: MouseEvent) => {
        const el = containerRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const { clientX: x, clientY: y } = e;
        if (x < r.left || x > r.right || y < r.top || y > r.bottom) {
            clearTip();
        }
        };
        window.addEventListener("mousemove", handleMove, { passive: true });
        return () => window.removeEventListener("mousemove", handleMove);
    }, []);

    useEffect(() => { // NEW - cleanup RAF
        return () => {
        if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
        };
    }, []);

  // ================================================

    useEffect(() => {
    let alive = true;
    (async () => {
        setLoading(true);
        setErr(null);
        try {
            const [divs, data] = await Promise.all([
                fetchDivisions(),
                fetchTopDiseasesByDivision(limit),
            ]);
        if (!alive) return;

        setDivisions(divs);
        setBuckets(data);

        if (firstLoadRef.current) {
            const nonEmpty = data.find(b => (b.top_diseases?.length ?? 0) > 0 && b.division);
            const pick = nonEmpty?.division || divs[0] || "";
            setSelected(pick);
            firstLoadRef.current = false;
        } else if (!selected && divs.length) {
            setSelected(divs[0]);
        }
        } catch (e: unknown) {
        if (axios.isAxiosError(e)) setErr(e.response?.data?.error ?? e.message);
        else setErr("Gagal memuat data per division");
        } finally {
        if (alive) setLoading(false);
        }
    })();
    return () => { alive = false; };
    }, [limit]);  // ✅ hanya fetch ulang kalau limit berubah


    const chartData: DivisionTopDisease[] = useMemo(() => {
        const b = buckets.find(x => (x.division ?? "") === selected);
        return (b?.top_diseases ?? []).slice(0, limit);
    }, [buckets, selected, limit]);

    const PALETTE = useMemo(() => makeGreenShades(chartData.length), [chartData.length]);

    // Reset tooltip saat data berganti // NEW
    useEffect(() => { setBarTip(null); }, [chartData]); // NEW

    return (
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-4 w-full h-full flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-lg sm:text-xl font-semibold tracking-wide">Top 5 Diseases by Division</h2>

            {/* Dropdown Division */}
            <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600">Division</label>
            <select
                className="text-sm border rounded-md px-2 py-1 bg-white"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
            >
                {divisions.length === 0 && <option value="">(No divisions)</option>}
                {divisions.map((d) => (
                <option key={d} value={d}>{d}</option>
                ))}
            </select>
            </div>
        </div>

        <div
            ref={containerRef} // NEW
            className="flex-1 relative" // NEW
            onMouseLeave={clearTip} // NEW
            onPointerLeave={clearTip} // NEW
            onMouseMoveCapture={clearTip} // NEW - mencegah tooltip “nyangkut”
        >
            {loading && <div className="text-xs text-gray-600">Loading chart…</div>}
            {err && !loading && <div className="text-xs text-red-600">{err}</div>}
            {!loading && !err && (!selected || chartData.length === 0) && (
            <div className="text-xs text-gray-600">Belum ada data untuk division ini.</div>
            )}

            {!loading && !err && chartData.length > 0 && (
            <ResponsiveContainer width="100%" height={H}>
                <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 16, right: 24, left: 8, bottom: 8 }}
                barCategoryGap="12%"
                onMouseLeave={clearTip}
                >
                <CartesianGrid strokeDasharray="3 3" opacity={0.22} />
                <XAxis type="number" domain={[0, (max: number) => Math.ceil(max * 1.25)]} allowDecimals={false} />
                <YAxis
                    type="category"
                    dataKey="disease_name"
                    width={160}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => ellipsis(String(v), 22)}
                />
                <Bar
                    dataKey="count"
                    radius={[0, 8, 8, 0]}
                    isAnimationActive={false}
                    style={{ cursor: "default" }}
                    // Tooltip kustom: hanya aktif saat mouse di atas BAR
                    onMouseMove={(data, _index, e) => { // NEW
                    const evt = e?.nativeEvent ?? e;
                    const x = evt?.clientX ?? 0;
                    const y = evt?.clientY ?? 0;
                    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
                    const mySeq = ++seqRef.current;
                    rafRef.current = requestAnimationFrame(() => {
                        if (mySeq !== seqRef.current) return;
                        const payload = data?.payload as DivisionTopDisease;
                        setBarTip({
                        x,
                        y,
                        name: payload?.disease_name ?? "",
                        value: payload?.count ?? 0,
                        });
                    });
                    }}
                    onMouseLeave={clearTip}
                >
                    {chartData.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i]} />
                    ))}
                    <LabelList dataKey="count" position="right" offset={8} className="text-[11px]" />
                </Bar>
                </BarChart>
            </ResponsiveContainer>
            )}

            {/* Tooltip kustom untuk BAR: hanya muncul di atas bar yang disentuh */} {/* NEW */}
            {barTip && ( // NEW
            <div
                className="pointer-events-none fixed z-50 rounded border border-gray-200 bg-white/95 px-2 py-1 text-xs shadow"
                style={{ left: barTip.x + 12, top: barTip.y + 12 }}
            >
                <div className="font-medium">{barTip.name}</div>
                <div>Count: {barTip.value}</div>
            </div>
            )} {/* NEW */}
        </div>
        </div>
    );
};

export default TopDiseasesByDivisionChart;