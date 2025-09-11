import { api } from "./http";

export type RiskStatus = "aman" | "waspada" | "bahaya" | null;

export interface EarlyWarningRow {
  location_name: string;

  max_temperature: number | null;
  max_temp_status: RiskStatus;

  average_temperature: number | null;
  avg_temp_status: RiskStatus;

  weather_condition: string | null;
  weather_high_risk_percent: number | null; // 0 - 66 (dari backend)

  air_quality_index: number | null;
  air_quality_status: RiskStatus;
}

export async function fetchEarlyWarning(): Promise<EarlyWarningRow[]> {
  const { data } = await api.get("/early_warning");
  return data as EarlyWarningRow[];
}