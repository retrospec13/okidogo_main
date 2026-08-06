export interface RadioStation {
  id: string;
  name: string;
  url: string;
  url_resolved: string;
  homepage: string;
  favicon: string;
  tags: string[];
  country: string;
  countrycode: string;
  state: string;
  language: string;
  codec: string;
  bitrate: number;
  votes: number;
  lastcheckok: boolean;
  lastchecktime: string;
  lastcheckoktime: string;
  clickcount: number;
  clicktrend: number;
  geo_lat?: number | null;
  geo_long?: number | null;
}

export interface StationCache {
  timestamp: number; // When the data was cached
  stations: RadioStation[];
}

export type StationFilters = {
  country?: string;
  language?: string;
  tag?: string;
  name?: string;
}

export const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds 