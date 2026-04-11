import trainsDataset from "@/data/trains.json";
import schedulesDataset from "@/data/schedules.json";
import stationsDataset from "@/data/stations.json";

type RawTrainFeature = {
  geometry?: {
    type?: string;
    coordinates?: unknown;
  } | null;
  properties?: Record<string, unknown>;
};

type RawStationFeature = {
  geometry?: {
    type?: string;
    coordinates?: unknown;
  } | null;
  properties?: Record<string, unknown>;
};

type RawScheduleRow = {
  arrival?: unknown;
  day?: unknown;
  departure?: unknown;
  id?: unknown;
  station_code?: unknown;
  station_name?: unknown;
  train_name?: unknown;
  train_number?: unknown;
};

type RawTrainDataset = {
  type?: string;
  features?: RawTrainFeature[];
};

type RawStationDataset = {
  type?: string;
  features?: RawStationFeature[];
};

type RawScheduleDataset = RawScheduleRow[];

export type TrainStop = {
  stationCode: string;
  stationName: string;
  arrival: string;
  departure: string;
  stopNumber: number;
  day: number | null;
  stationZone: string;
  stationState: string;
  stationCoordinates: [number, number] | null;
};

export type UnifiedTrain = {
  number: string;
  name: string;
  from: string;
  to: string;
  fromName: string;
  toName: string;
  departure: string;
  arrival: string;
  duration: string;
  distance: number | null;
  type: string;
  coordinates: [number, number][];
  stops: TrainStop[];
};

export type StationData = {
  code: string;
  name: string;
  state: string;
  zone: string;
  address: string;
  coordinates: [number, number] | null;
};

type ScheduleRow = {
  arrival: string;
  day: number | null;
  departure: string;
  stationCode: string;
  stationName: string;
  trainName: string;
  trainNumber: string;
  sequence: number;
};

type ValidationReport = {
  totalTrains: number;
  totalSchedules: number;
  totalStations: number;
  missingTrainRefs: number;
  missingStationRefs: number;
};

const trainDataset = trainsDataset as RawTrainDataset;
const stationDataset = stationsDataset as RawStationDataset;
const scheduleRowsRaw = schedulesDataset as RawScheduleDataset;

function toStringValue(value: unknown, fallback = ""): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed === "" ? fallback : trimmed;
}

function toUpperKey(value: unknown): string {
  return toStringValue(value).toUpperCase();
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function toCoordinates(value: unknown): [number, number][] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((pair): pair is [unknown, unknown] => Array.isArray(pair) && pair.length >= 2)
    .map((pair) => [Number(pair[0]), Number(pair[1])] as [number, number])
    .filter(([longitude, latitude]) => Number.isFinite(longitude) && Number.isFinite(latitude));
}

function toCoordinatePair(value: unknown): [number, number] | null {
  if (!Array.isArray(value) || value.length < 2) {
    return null;
  }

  const longitude = Number(value[0]);
  const latitude = Number(value[1]);
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
    return null;
  }

  return [longitude, latitude];
}

function toDurationText(durationH: unknown, durationM: unknown): string {
  const hours = toNumber(durationH);
  const minutes = toNumber(durationM);

  if (hours === null && minutes === null) {
    return "N/A";
  }

  const safeHours = hours ?? 0;
  const safeMinutes = minutes ?? 0;
  return `${safeHours}h ${safeMinutes}m`;
}

function toTimeText(value: unknown): string {
  const text = toStringValue(value);
  return text === "None" || text === "null" ? "N/A" : text || "N/A";
}

function normalizeTrainFeature(feature: RawTrainFeature) {
  const properties = feature.properties ?? {};

  return {
    number: toStringValue(properties.number, "Unknown"),
    name: toStringValue(properties.name, "Unknown Train"),
    from: toStringValue(properties.from_station_code, "N/A"),
    to: toStringValue(properties.to_station_code, "N/A"),
    fromName: toStringValue(properties.from_station_name, "N/A"),
    toName: toStringValue(properties.to_station_name, "N/A"),
    departure: toTimeText(properties.departure),
    arrival: toTimeText(properties.arrival),
    duration: toDurationText(properties.duration_h, properties.duration_m),
    distance: toNumber(properties.distance),
    type: toStringValue(properties.type, "N/A"),
    coordinates: toCoordinates(feature.geometry?.coordinates),
  };
}

function normalizeStationFeature(feature: RawStationFeature): StationData {
  const properties = feature.properties ?? {};

  return {
    code: toStringValue(properties.code, "N/A"),
    name: toStringValue(properties.name, "Unknown Station"),
    state: toStringValue(properties.state, "N/A"),
    zone: toStringValue(properties.zone, "N/A"),
    address: toStringValue(properties.address, "N/A"),
    coordinates: toCoordinatePair(feature.geometry?.coordinates),
  };
}

function normalizeScheduleRow(row: RawScheduleRow, sequence: number): ScheduleRow {
  return {
    arrival: toTimeText(row.arrival),
    day: toNumber(row.day),
    departure: toTimeText(row.departure),
    stationCode: toUpperKey(row.station_code),
    stationName: toStringValue(row.station_name, "Unknown Station"),
    trainName: toStringValue(row.train_name, "Unknown Train"),
    trainNumber: toStringValue(row.train_number, ""),
    sequence,
  };
}

const normalizedTrains = (trainDataset.features ?? []).map(normalizeTrainFeature);
const normalizedStations = (stationDataset.features ?? []).map(normalizeStationFeature);
const normalizedSchedules = scheduleRowsRaw.map((row, index) => normalizeScheduleRow(row, index));

const trainMap = new Map<string, UnifiedTrain>();
const stationMap = new Map<string, StationData>();
const scheduleMap = new Map<string, ScheduleRow[]>();
const routeMap = new Map<string, string[]>();
const stationLookupByName = new Map<string, string>();

for (const station of normalizedStations) {
  const code = station.code.toUpperCase();
  if (!code) {
    continue;
  }

  stationMap.set(code, station);
  if (station.name) {
    stationLookupByName.set(station.name.toUpperCase(), code);
  }
}

for (const train of normalizedTrains) {
  trainMap.set(train.number, {
    ...train,
    stops: [],
  });
}

for (const row of normalizedSchedules) {
  if (!row.trainNumber) {
    continue;
  }

  const existing = scheduleMap.get(row.trainNumber) ?? [];
  existing.push(row);
  scheduleMap.set(row.trainNumber, existing);
}

for (const [trainNumber, rows] of scheduleMap) {
  rows.sort((left, right) => {
    const leftDay = left.day ?? Number.MAX_SAFE_INTEGER;
    const rightDay = right.day ?? Number.MAX_SAFE_INTEGER;

    if (leftDay !== rightDay) {
      return leftDay - rightDay;
    }

    return left.sequence - right.sequence;
  });

  const stops: TrainStop[] = rows.map((row, index) => {
    const station = stationMap.get(row.stationCode);

    return {
      stationCode: row.stationCode || "N/A",
      stationName: station?.name ?? row.stationName ?? "Unknown Station",
      arrival: row.arrival,
      departure: row.departure,
      stopNumber: index + 1,
      day: row.day,
      stationZone: station?.zone ?? "N/A",
      stationState: station?.state ?? "N/A",
      stationCoordinates: station?.coordinates ?? null,
    };
  });

  const train = trainMap.get(trainNumber);
  if (train) {
    train.stops = stops;
  }
}

for (const train of trainMap.values()) {
  const normalizedFrom = train.from.toUpperCase();
  const normalizedTo = train.to.toUpperCase();
  const fromStationCode = stationLookupByName.get(train.fromName.toUpperCase()) ?? normalizedFrom;
  const toStationCode = stationLookupByName.get(train.toName.toUpperCase()) ?? normalizedTo;
  const routeKey = `${fromStationCode}|${toStationCode}`;
  const existing = routeMap.get(routeKey) ?? [];
  existing.push(train.number);
  routeMap.set(routeKey, existing);
}

function normalizeQuery(value: string): string {
  return value.trim().toUpperCase();
}

function resolveStationCode(input: string): string {
  const query = normalizeQuery(input);
  if (!query) {
    return "";
  }

  if (stationMap.has(query)) {
    return query;
  }

  return stationLookupByName.get(query) ?? query;
}

function buildUnifiedTrain(train: UnifiedTrain): UnifiedTrain {
  const stops = train.stops;
  const firstStop = stops[0];
  const lastStop = stops[stops.length - 1];

  return {
    ...train,
    name: train.name || "Unknown Train",
    from: train.from || "N/A",
    to: train.to || "N/A",
    fromName: train.fromName || "N/A",
    toName: train.toName || "N/A",
    departure: train.departure || "N/A",
    arrival: train.arrival || "N/A",
    duration: train.duration || "N/A",
    distance: train.distance ?? null,
    type: train.type || "N/A",
    coordinates: train.coordinates,
    stops: stops.length
      ? stops
      : firstStop || lastStop
        ? stops
        : [],
  };
}

function buildScheduleStops(trainNumber: string): TrainStop[] {
  const train = trainMap.get(trainNumber);
  return train ? train.stops : [];
}

function getRouteTrainNumbers(from: string, to: string): string[] {
  const fromCode = resolveStationCode(from);
  const toCode = resolveStationCode(to);

  if (!fromCode || !toCode) {
    return [];
  }

  const directKey = `${fromCode}|${toCode}`;
  const directMatches = routeMap.get(directKey) ?? [];
  if (directMatches.length > 0) {
    return directMatches;
  }

  const fromNameMatches = stationLookupByName.get(normalizeQuery(from)) ?? fromCode;
  const toNameMatches = stationLookupByName.get(normalizeQuery(to)) ?? toCode;
  const fallbackKey = `${fromNameMatches}|${toNameMatches}`;
  return routeMap.get(fallbackKey) ?? [];
}

export function getAllTrains(): UnifiedTrain[] {
  return [...trainMap.values()].map(buildUnifiedTrain);
}

export function getAllStations(): StationData[] {
  return [...stationMap.values()];
}

export function searchTrains(from: string, to: string): UnifiedTrain[] {
  const fromQuery = normalizeQuery(from);
  const toQuery = normalizeQuery(to);

  if (!fromQuery || !toQuery || fromQuery === toQuery) {
    return [];
  }

  const resolvedFrom = resolveStationCode(fromQuery);
  const resolvedTo = resolveStationCode(toQuery);

  return [...trainMap.values()]
    .filter((train) => {
      const stops = scheduleMap.get(train.number) ?? train.stops;

      if (!stops.length) {
        return false;
      }

      const fromIndex = stops.findIndex((stop) => {
        const stationCode = stop.stationCode.toUpperCase();
        const stationName = stop.stationName.toUpperCase();
        return stationCode === fromQuery || stationName === fromQuery || stationCode === resolvedFrom;
      });

      const toIndex = stops.findIndex((stop) => {
        const stationCode = stop.stationCode.toUpperCase();
        const stationName = stop.stationName.toUpperCase();
        return stationCode === toQuery || stationName === toQuery || stationCode === resolvedTo;
      });

      return fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;
    })
    .map(buildUnifiedTrain);
}

export function getTrainByNumber(trainNumber: string): UnifiedTrain | null {
  const train = trainMap.get(toStringValue(trainNumber).trim());
  return train ? buildUnifiedTrain(train) : null;
}

export function getTrainSchedule(trainNumber: string): TrainStop[] {
  return buildScheduleStops(toStringValue(trainNumber).trim());
}

export function getStationByCode(stationCode: string): StationData | null {
  const station = stationMap.get(normalizeQuery(stationCode));
  return station ?? null;
}

const validationReport: ValidationReport = (() => {
  const trainNumbers = new Set(trainMap.keys());
  const stationCodes = new Set(stationMap.keys());

  let missingTrainRefs = 0;
  let missingStationRefs = 0;
  for (const row of normalizedSchedules) {
    if (row.trainNumber && !trainNumbers.has(row.trainNumber)) {
      missingTrainRefs++;
    }
    if (row.stationCode && !stationCodes.has(row.stationCode)) {
      missingStationRefs++;
    }
  }

  return {
    totalTrains: trainMap.size,
    totalSchedules: normalizedSchedules.length,
    totalStations: stationMap.size,
    missingTrainRefs,
    missingStationRefs,
  };
})();

export function getValidationReport(): ValidationReport {
  return validationReport;
}
