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
