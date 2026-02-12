export interface LabelSummary {
  label: string;
  total: number;
  unique: number;
  bots: number;
  lastSeen: string;
  topCountry: string;
}

export interface StatsOverview {
  totalVisits: number;
  uniqueVisitors: number;
  botVisits: number;
  labels: LabelSummary[];
}

export interface TimelineEntry {
  date: string;
  visits: number;
  unique: number;
}

export interface CountryEntry {
  country: string;
  visits: number;
}

export interface DeviceEntry {
  deviceType: string;
  visits: number;
}

export interface BrowserEntry {
  browser: string;
  visits: number;
}

export interface BotEntry {
  botName: string;
  visits: number;
}

export interface RefererEntry {
  referer: string;
  visits: number;
}

export interface OsEntry {
  os: string;
  visits: number;
}

export interface LabelStats {
  label: string;
  total: number;
  unique: number;
  bots: number;
  timeline: TimelineEntry[];
  countries: CountryEntry[];
  devices: DeviceEntry[];
  browsers: BrowserEntry[];
  operatingSystems: OsEntry[];
  topBots: BotEntry[];
  referers: RefererEntry[];
}

export interface HealthStatus {
  status: string;
  totalVisits: number;
  totalLabels: number;
  timestamp: string;
}

/* ------------------------------------------------------------------ */
/* Analytics                                                           */
/* ------------------------------------------------------------------ */

export interface AnalyticsSummary {
  totalVisits: number;
  uniqueVisitors: number;
  botVisits: number;
  humanVisits: number;
  totalLabels: number;
}

export interface AnalyticsLabel {
  label: string;
  total: number;
  unique: number;
  bots: number;
  growth: number;
}

export interface AnalyticsCountry {
  country: string;
  visits: number;
}

export interface AnalyticsHourly {
  hour: number;
  visits: number;
}

export interface AnalyticsNameValue {
  name: string;
  visits: number;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  labels: AnalyticsLabel[];
  topLabels: string[];
  timeline: Array<Record<string, number | string>>;
  countries: AnalyticsCountry[];
  browsers: AnalyticsNameValue[];
  operatingSystems: AnalyticsNameValue[];
  devices: AnalyticsNameValue[];
  hourly: AnalyticsHourly[];
  referers: AnalyticsNameValue[];
}
