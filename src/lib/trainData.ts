import stationsDataset from "@/data/stations.json";
import { CSV_DATA } from "../data/trainData.generated";
import { OLD_ROUTE_MAP } from "../data/routeData.generated";

export type StationGeo = {
  code: string;
  name: string;
  lat: number;
  lng: number;
};

export type TrainStop = {
  trainNumber: string;
  trainName: string;
  stationCode: string;
  stationName: string;
  seq: number;
  arrival: string | null;
  departure: string | null;
  distance: number | null;
  distanceFromSource: number | null; // cumulative km from source station
  segmentDistance: number | null; // km from previous station to this one
  segmentFromLastStop: number | null; // km from last HALT station
  lat: number | null;
  lng: number | null;
  isHalt: boolean;
  isInterpolated: boolean; // true if arrival/departure were calculated by interpolation
};

export type Train = {
  trainNumber: string;
  trainName: string;
  sourceCode: string;
  sourceName: string;
  destinationCode: string;
  destinationName: string;
  stops: TrainStop[];

  // Legacy aliases used by UI components
  number: string;
  name: string;
  from: string;
  to: string;
  fromName: string;
  toName: string;
  type: string;
  departure: string;
  arrival: string;
  duration: string;
  distance: number | null;
};

export type UnifiedTrain = Train;

export type StationData = {
  code: string;
  name: string;
  state: string;
  zone: string;
  address: string;
  coordinates: [number, number] | null;
};

type RawStationFeature = {
  geometry?: {
    type?: string;
    coordinates?: unknown;
  } | null;
  properties?: Record<string, unknown>;
};

type RawStationDataset = {
  type?: string;
  features?: RawStationFeature[];
};

type CsvStop = {
  trainNumber: string;
  trainName: string;
  stationCode: string;
  stationName: string;
  arrival: string;
  departure: string;
  distance: number;
  seq: number;
};

type FinalStop = {
  stationCode: string;
  stationName: string;
  seq: number;
  arrival: string | null;
  departure: string | null;
  distance: number | null; // cumulative km from source
  distanceFromSource: number | null;
  segmentDistance: number | null;
  segmentFromLastStop: number | null;
  isHalt: boolean;
  isInterpolated: boolean;
};

const stationDataset = stationsDataset as RawStationDataset;

function toStringValue(value: unknown, fallback = ""): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed === "" ? fallback : trimmed;
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

function toTimeText(value: unknown): string {
  const text = toStringValue(value);
  return text === "None" || text === "null" ? "N/A" : text || "N/A";
}

function toDisplayTime(value: string | null): string {
  return value && value !== "N/A" ? value : "N/A";
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

export function normalizeStationCode(code: string): string {
  return normalizeCode(code);
}

function normalizeCode(code: string): string {
  return toStringValue(code).toUpperCase();
}

const STATION_CODE_ALIASES: Record<string, string> = {
  BCT: "MMCT",
  "BOMBAY CENTRAL": "MMCT",
  DELHI: "NDLS",
  KOTA: "KOTA",
};

function normalizeLookupName(name: string): string {
  return toStringValue(name)
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeTrainNumber(value: string): string {
  const raw = toStringValue(value).toUpperCase();
  if (!raw) {
    return "";
  }

  const match = raw.match(/^(\d+)(.*)$/);
  if (!match) {
    return raw;
  }

  const numeric = String(Number(match[1]));
  const suffix = toStringValue(match[2]);
  return `${numeric}${suffix}`;
}

const TRAIN_TYPE_MAP: Record<string, string> = {
  DURON: "Duronto Express",
  DURO: "Duronto Express",
  DUR: "Duronto Express",
  RAJD: "Rajdhani Express",
  RAJ: "Rajdhani Express",
  "S.KRA": "Sampark Kranti Express",
  SKRA: "Sampark Kranti Express",
  EXP: "Express",
  EX: "Express",
};

function normalizeTrainTypeSuffix(trainName: string): string {
  const normalizedInput = toStringValue(trainName);
  if (!normalizedInput) {
    return trainName;
  }

  const words = normalizedInput.split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return normalizedInput;
  }

  const updatedWords = [...words];
  let replaced = false;

  // Update only trailing type abbreviations to avoid touching route/code tokens.
  for (let index = updatedWords.length - 1; index >= 0; index -= 1) {
    const key = updatedWords[index].toUpperCase();
    const replacement = TRAIN_TYPE_MAP[key];
    if (!replacement) {
      break;
    }

    updatedWords[index] = replacement;
    replaced = true;
  }

  if (!replaced) {
    return normalizedInput;
  }

  const expandedWords = updatedWords.join(" ").split(/\s+/).filter(Boolean);
  const dedupedWords: string[] = [];

  for (const word of expandedWords) {
    const previous = dedupedWords[dedupedWords.length - 1];
    if (previous && previous.toLowerCase() === word.toLowerCase()) {
      continue;
    }
    dedupedWords.push(word);
  }

  return dedupedWords.join(" ").trim();
}

function parseCSV(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i += 1) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (char === "," && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (currentField || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        if (currentRow.some((field) => field)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = "";
      }

      if (char === "\r" && nextChar === "\n") {
        i += 1;
      }
      continue;
    }

    currentField += char;
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((field) => field)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

function parseCsvStops(csvText: string): CsvStop[] {
  const rows = parseCSV(csvText);
  if (rows.length <= 1) {
    return [];
  }

  const dataRows = rows.slice(1);
  const result: CsvStop[] = [];
  const seen = new Set<string>();

  for (const row of dataRows) {
    if (row.length < 8) {
      continue;
    }

    const trainNumber = normalizeTrainNumber(row[0]);
    const trainName = normalizeTrainTypeSuffix(toStringValue(row[1], "Unknown Train"));
    const seq = toNumber(row[2]);
    const stationCode = normalizeStationCode(row[3]);
    const stationName = toStringValue(row[4], stationCode || "Unknown Station");
    const arrival = toTimeText(row[5]);
    const departure = toTimeText(row[6]);
    const distance = toNumber(row[7]);

    if (!trainNumber || !stationCode || seq === null || distance === null) {
      continue;
    }

    const dedupeKey = `${trainNumber}|${seq}`;
    if (seen.has(dedupeKey)) {
      continue;
    }
    seen.add(dedupeKey);

    result.push({
      trainNumber,
      trainName,
      stationCode,
      stationName,
      arrival,
      departure,
      distance,
      seq,
    });
  }

  return result;
}

function buildStationMaps() {
  const normalizedStations = (stationDataset.features ?? []).map(normalizeStationFeature);
  const geoMap = new Map<string, StationGeo>();
  const stationMap = new Map<string, StationData>();
  const stationCodeByName = new Map<string, string>();
  const stationByNormalizedName = new Map<string, StationData>();
  const stationList: StationData[] = [];

  for (const station of normalizedStations) {
    const code = normalizeStationCode(station.code);
    if (!code) {
      continue;
    }

    stationMap.set(code, station);
    stationCodeByName.set(station.name.toUpperCase(), code);
    stationByNormalizedName.set(normalizeLookupName(station.name), station);
    stationList.push(station);

    if (station.coordinates) {
      geoMap.set(code, {
        code,
        name: station.name,
        lat: station.coordinates[1],
        lng: station.coordinates[0],
      });
    }
  }

  return {
    stationMap,
    stationGeoMap: geoMap,
    stationCodeByName,
    stationByNormalizedName,
    stationList,
  };
}

function buildCsvStopsByTrain(csvStops: CsvStop[]): Map<string, CsvStop[]> {
  const byTrain = new Map<string, CsvStop[]>();

  for (const stop of csvStops) {
    const existing = byTrain.get(stop.trainNumber) ?? [];
    existing.push(stop);
    byTrain.set(stop.trainNumber, existing);
  }

  for (const stops of byTrain.values()) {
    stops.sort((a, b) => a.seq - b.seq);
  }

  return byTrain;
}

function buildOldRouteByTrain() {
  const result = new Map<string, Array<{ stationCode: string; stationName: string; seq: number }>>();

  for (const [rawTrainNumber, points] of Object.entries(OLD_ROUTE_MAP)) {
    const trainNumber = normalizeTrainNumber(rawTrainNumber);
    if (!trainNumber || !Array.isArray(points) || points.length === 0) {
      continue;
    }

    const cleanPoints: Array<{ stationCode: string; stationName: string; seq: number }> = [];
    for (const point of points) {
      const stationCode = normalizeStationCode(point.stationCode);
      if (!stationCode) {
        continue;
      }

      cleanPoints.push({
        stationCode,
        stationName: toStringValue(point.stationName, stationCode),
        seq: cleanPoints.length + 1,
      });
    }

    if (cleanPoints.length > 0) {
      result.set(trainNumber, cleanPoints);
    }
  }

  return result;
}

/**
 * Converts time string "HH:MM" to total minutes since midnight
 */
function timeToMinutes(timeStr: string | null): number | null {
  if (!timeStr || timeStr === "N/A") return null;
  const parts = timeStr.split(":");
  if (parts.length < 2) return null;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

/**
 * Converts total minutes since midnight to time string "HH:MM"
 */
function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/**
 * Interpolates arrival/departure times for non-halt stations
 * between surrounding halt stations.
 *
 * Logic:
 * - For each segment [HALT A] -> [NON-HALTS] -> [HALT B]
 * - Calculate time range: endTime - startTime
 * - Distribute evenly: timePerStep = totalTime / (numStations + 1)
 * - Assign: each non-halt at position i gets startTime + (i * timePerStep)
 */
function interpolateNonHaltTimes(stops: FinalStop[]): FinalStop[] {
  const result = [...stops];

  let i = 0;
  while (i < result.length) {
    // Find first halt (starting point)
    let haltStartIdx = -1;
    for (let j = i; j < result.length; j++) {
      if (result[j].isHalt && result[j].departure !== null) {
        haltStartIdx = j;
        break;
      }
    }

    if (haltStartIdx === -1) {
      i++;
      continue; // No halt found, skip
    }

    const haltStart = result[haltStartIdx];
    const startTimeMinutes = timeToMinutes(haltStart.departure);

    if (startTimeMinutes === null) {
      i = haltStartIdx + 1;
      continue; // Invalid time, skip
    }

    // Find consecutive non-halts
    const nonHaltIndices: number[] = [];
    let j = haltStartIdx + 1;
    while (j < result.length) {
      if (result[j].isHalt) {
        break; // Found next halt
      }
      nonHaltIndices.push(j);
      j++;
    }

    // If no non-halts between, move to next
    if (nonHaltIndices.length === 0) {
      i = haltStartIdx + 1;
      continue;
    }

    // Check if we found the next halt (endpoint)
    const haltEndIdx = j;
    if (haltEndIdx >= result.length) {
      // No ending halt, can't interpolate
      i = haltStartIdx + 1;
      continue;
    }

    const haltEnd = result[haltEndIdx];
    const endTimeMinutes = timeToMinutes(haltEnd.arrival);

    if (endTimeMinutes === null) {
      i = haltStartIdx + 1;
      continue; // Invalid time, skip
    }

    // Calculate total time in segment
    let totalTime = endTimeMinutes - startTimeMinutes;
    // Handle times crossing midnight (e.g., 23:00 to 01:00 next day)
    if (totalTime < 0) {
      totalTime += 24 * 60; // Add 24 hours
    }

    // Ensure positive time range
    if (totalTime <= 0) {
      i = haltStartIdx + 1;
      continue;
    }

    // Distribute time across all stations (including start and end)
    const timePerStep = totalTime / (nonHaltIndices.length + 1);

    // Assign interpolated times to non-halt stations
    for (let k = 0; k < nonHaltIndices.length; k++) {
      const idx = nonHaltIndices[k];
      const stepTime = (k + 1) * timePerStep;
      const interpolatedMinutes = startTimeMinutes + stepTime;
      
      // Wrap around if crossing midnight
      const wrappedMinutes = interpolatedMinutes % (24 * 60);

      result[idx].arrival = minutesToTime(Math.round(wrappedMinutes));
      result[idx].departure = result[idx].arrival; // Same for non-halts (no stop duration)
      result[idx].isInterpolated = true;
    }

    i = haltEndIdx;
  }

  return result;
}

/**
 * Calculates and interpolates distance information for all stops.
 *
 * For each stop:
 * - distanceFromSource: cumulative km from source station
 * - segmentDistance: km from previous station to this one
 * - segmentFromLastStop: km from last HALT station to this one
 *
 * For non-halt stations without distance:
 * - Interpolates linearly between nearest halt stations with distance data
 */
function calculateStopDistances(stops: FinalStop[]): FinalStop[] {
  const result = [...stops];

  if (result.length === 0) {
    return result;
  }

  // Find stops that need interpolation
  for (let i = 0; i < result.length; i++) {
    if (result[i].distance !== null) {
      continue; // Already has distance data
    }

    // Find previous stop with distance
    let prevIdx = -1;
    let prevDistance: number | null = null;
    for (let j = i - 1; j >= 0; j--) {
      if (result[j].distance !== null) {
        prevIdx = j;
        prevDistance = result[j].distance;
        break;
      }
    }

    // Find next stop with distance
    let nextIdx = -1;
    let nextDistance: number | null = null;
    for (let j = i + 1; j < result.length; j++) {
      if (result[j].distance !== null) {
        nextIdx = j;
        nextDistance = result[j].distance;
        break;
      }
    }

    // Interpolate distance if we have both surrounding points
    if (prevIdx !== -1 && nextIdx !== -1 && prevDistance !== null && nextDistance !== null) {
      const prevSeq = result[prevIdx].seq;
      const nextSeq = result[nextIdx].seq;
      const currSeq = result[i].seq;

      const totalSegments = nextSeq - prevSeq;
      const currentSegment = currSeq - prevSeq;
      const distanceDiff = nextDistance - prevDistance;

      const interpolatedDistance =
        prevDistance + (distanceDiff * currentSegment) / totalSegments;

      result[i].distance = Math.round(interpolatedDistance);
    } else if (prevIdx !== -1 && prevDistance !== null) {
      // Only have previous, use that distance (shouldn't advance much)
      result[i].distance = prevDistance;
    } else if (nextIdx !== -1 && nextDistance !== null) {
      // Only have next, estimate backwards (conservative)
      result[i].distance = Math.max(0, nextDistance - 5);
    }
    // If neither, leave as null
  }

  // Second pass: calculate distanceFromSource, segmentDistance, and segmentFromLastStop
  let lastHaltDistance: number | null = null;

  for (let i = 0; i < result.length; i++) {
    result[i].distanceFromSource = result[i].distance;

    if (i === 0) {
      // First station: distance from source is 0
      result[i].segmentDistance = 0;
      result[i].segmentFromLastStop = 0;

      if (result[i].isHalt && result[i].distance !== null) {
        lastHaltDistance = result[i].distance;
      }
    } else {
      // Calculate segment distance from previous station
      const current = result[i].distance;
      const prev = result[i - 1].distance;

      if (current !== null && prev !== null) {
        result[i].segmentDistance = Math.max(0, current - prev);
      } else {
        result[i].segmentDistance = null;
      }

      if (current !== null && lastHaltDistance !== null) {
        result[i].segmentFromLastStop = Math.max(0, current - lastHaltDistance);
      } else if (i === 0) {
        result[i].segmentFromLastStop = 0;
      } else {
        result[i].segmentFromLastStop = null;
      }

      if (result[i].isHalt && current !== null) {
        lastHaltDistance = current;
      }
    }
  }

  return result;
}

function mergeStopsForTrain(
  trainNumber: string,
  csvStops: CsvStop[],
  oldRoute: Array<{ stationCode: string; stationName: string; seq: number }> | undefined,
  stationGeoMap: Map<string, StationGeo>
): TrainStop[] {
  const csvByCode = new Map<string, CsvStop[]>();
  for (const stop of csvStops) {
    const existing = csvByCode.get(stop.stationCode) ?? [];
    existing.push(stop);
    csvByCode.set(stop.stationCode, existing);
  }

  for (const queue of csvByCode.values()) {
    queue.sort((a, b) => a.seq - b.seq);
  }

  const finalStops: FinalStop[] = [];

  if (oldRoute && oldRoute.length > 0) {
    for (const routePoint of oldRoute) {
      const queue = csvByCode.get(routePoint.stationCode) ?? [];
      const csvMatch = queue.length > 0 ? queue.shift() : null;

      if (csvMatch) {
        finalStops.push({
          stationCode: routePoint.stationCode,
          stationName: csvMatch.stationName || routePoint.stationName,
          seq: routePoint.seq,
          arrival: csvMatch.arrival,
          departure: csvMatch.departure,
          distance: csvMatch.distance,
          distanceFromSource: null, // Will be calculated later
          segmentDistance: null, // Will be calculated later
          segmentFromLastStop: null, // Will be calculated later
          isHalt: true,
          isInterpolated: false,
        });
      } else {
        finalStops.push({
          stationCode: routePoint.stationCode,
          stationName: routePoint.stationName,
          seq: routePoint.seq,
          arrival: null,
          departure: null,
          distance: null,
          distanceFromSource: null, // Will be calculated later
          segmentDistance: null, // Will be calculated later
          segmentFromLastStop: null, // Will be calculated later
          isHalt: false,
          isInterpolated: false,
        });
      }
    }

    // CSV halts that were not present in old route are appended to preserve CSV truth.
    const leftovers = [...csvByCode.values()].flat().sort((a, b) => a.seq - b.seq);
    for (const left of leftovers) {
      finalStops.push({
        stationCode: left.stationCode,
        stationName: left.stationName,
        seq: finalStops.length + 1,
        arrival: left.arrival,
        departure: left.departure,
        distance: left.distance,
        distanceFromSource: null, // Will be calculated later
        segmentDistance: null, // Will be calculated later
        segmentFromLastStop: null, // Will be calculated later
        isHalt: true,
        isInterpolated: false,
      });
    }
  } else {
    for (const csvStop of csvStops) {
      finalStops.push({
        stationCode: csvStop.stationCode,
        stationName: csvStop.stationName,
        seq: finalStops.length + 1,
        arrival: csvStop.arrival,
        departure: csvStop.departure,
        distance: csvStop.distance,
        distanceFromSource: null, // Will be calculated later
        segmentDistance: null, // Will be calculated later
        segmentFromLastStop: null, // Will be calculated later
        isHalt: true,
        isInterpolated: false,
      });
    }
  }

  finalStops.sort((a, b) => a.seq - b.seq);

  // Interpolate times for non-halt stations
  const interpolatedStops = interpolateNonHaltTimes(finalStops);

  // Calculate distances for all stations (including interpolation for non-halts)
  const stopsWithDistances = calculateStopDistances(interpolatedStops);

  return stopsWithDistances.map((stop) => {
    const geo = stationGeoMap.get(stop.stationCode);
    const resolvedStation = resolveStation(stop.stationCode, stop.stationName, {
      warnOnMissing: false,
    });

    return {
      trainNumber,
      trainName: csvStops[0]?.trainName ?? "Unknown Train",
      stationCode: stop.stationCode,
      stationName: resolvedStation?.name ?? stop.stationName,
      seq: stop.seq,
      arrival: stop.arrival,
      departure: stop.departure,
      distance: stop.distance,
      distanceFromSource: stop.distanceFromSource,
      segmentDistance: stop.segmentDistance,
      segmentFromLastStop: stop.segmentFromLastStop,
      lat: geo?.lat ?? null,
      lng: geo?.lng ?? null,
      isHalt: stop.isHalt,
      isInterpolated: stop.isInterpolated,
    };
  });
}

const csvStops = parseCsvStops(CSV_DATA);
const {
  stationMap,
  stationGeoMap,
  stationCodeByName,
  stationByNormalizedName,
  stationList,
} = buildStationMaps();
const csvStopsByTrain = buildCsvStopsByTrain(csvStops);
const oldRouteByTrain = buildOldRouteByTrain();

function findStationByName(name: string): StationData | null {
  const normalizedName = normalizeLookupName(name);
  if (!normalizedName) {
    return null;
  }

  const exact = stationByNormalizedName.get(normalizedName);
  if (exact) {
    return exact;
  }

  return (
    stationList.find((station) => {
      const candidate = normalizeLookupName(station.name);
      return candidate.includes(normalizedName) || normalizedName.includes(candidate);
    }) ?? null
  );
}

function resolveStation(
  code: string,
  fallbackName?: string,
  options: { warnOnMissing?: boolean } = {}
): StationData | null {
  const { warnOnMissing = true } = options;
  const normalized = normalizeCode(code);
  const aliased = STATION_CODE_ALIASES[normalized] ?? normalized;

  const directByCode = stationMap.get(aliased);
  if (directByCode) {
    return directByCode;
  }

  const byExactNameCode = stationCodeByName.get(aliased);
  if (byExactNameCode) {
    return stationMap.get(byExactNameCode) ?? null;
  }

  const byFallbackName = fallbackName ? findStationByName(fallbackName) : null;
  if (byFallbackName) {
    return byFallbackName;
  }

  const byInputName = findStationByName(aliased);
  if (byInputName) {
    return byInputName;
  }

  if (warnOnMissing && process.env.NODE_ENV !== "production") {
    console.warn("Missing station mapping:", code);
  }

  return null;
}

function buildTrainMap(): Map<string, Train> {
  const result = new Map<string, Train>();
  const trainNumbers = new Set<string>([
    ...csvStopsByTrain.keys(),
    ...oldRouteByTrain.keys(),
  ]);

  for (const trainNumber of trainNumbers) {
    const csvTrainStops = csvStopsByTrain.get(trainNumber) ?? [];
    if (csvTrainStops.length === 0) {
      continue;
    }

    const mergedStops = mergeStopsForTrain(
      trainNumber,
      csvTrainStops,
      oldRouteByTrain.get(trainNumber),
      stationGeoMap
    );

    const source = mergedStops[0];
    const destination = mergedStops[mergedStops.length - 1];
    if (!source || !destination) {
      continue;
    }

    const firstHalt = mergedStops.find((stop) => stop.isHalt) ?? source;
    const lastHalt = [...mergedStops].reverse().find((stop) => stop.isHalt) ?? destination;

    const totalDistance = (() => {
      const withDistance = mergedStops.filter((stop) => stop.distance !== null);
      if (withDistance.length === 0) {
        return null;
      }
      return withDistance[withDistance.length - 1].distance;
    })();

    const trainName = csvTrainStops[0]?.trainName ?? "Unknown Train";

    result.set(trainNumber, {
      trainNumber,
      trainName,
      sourceCode: source.stationCode,
      sourceName: source.stationName,
      destinationCode: destination.stationCode,
      destinationName: destination.stationName,
      stops: mergedStops,

      number: trainNumber,
      name: trainName,
      from: source.stationCode,
      to: destination.stationCode,
      fromName: source.stationName,
      toName: destination.stationName,
      type: "Express",
      departure: toDisplayTime(firstHalt.departure),
      arrival: toDisplayTime(lastHalt.arrival),
      duration: "N/A",
      distance: totalDistance,
    });
  }

  return result;
}

const trainMap = buildTrainMap();

function normalizeQuery(value: string): string {
  return value.trim().toUpperCase();
}

function resolveStationCode(input: string): string {
  const query = normalizeCode(input);
  if (!query) {
    return "";
  }

  const resolved = resolveStation(query, undefined, { warnOnMissing: false });
  return resolved?.code ?? query;
}

function getInterpolatedDistance(stops: TrainStop[], index: number): number | null {
  const current = stops[index];
  if (!current) {
    return null;
  }

  if (current.distance !== null) {
    return current.distance;
  }

  let leftIndex = index - 1;
  while (leftIndex >= 0 && stops[leftIndex]?.distance === null) {
    leftIndex -= 1;
  }

  let rightIndex = index + 1;
  while (rightIndex < stops.length && stops[rightIndex]?.distance === null) {
    rightIndex += 1;
  }

  const left = leftIndex >= 0 ? stops[leftIndex] : undefined;
  const right = rightIndex < stops.length ? stops[rightIndex] : undefined;

  if (left && right && left.distance !== null && right.distance !== null) {
    const span = rightIndex - leftIndex;
    if (span <= 0) {
      return left.distance;
    }
    const ratio = (index - leftIndex) / span;
    return left.distance + (right.distance - left.distance) * ratio;
  }

  if (left && left.distance !== null) {
    return left.distance;
  }

  if (right && right.distance !== null) {
    return right.distance;
  }

  return null;
}

export function getAllTrains(): Train[] {
  return [...trainMap.values()];
}

export function searchTrains(from: string, to: string): Train[] {
  const fromQuery = normalizeQuery(from);
  const toQuery = normalizeQuery(to);

  if (!fromQuery || !toQuery || fromQuery === toQuery) {
    return [];
  }

  const resolvedFrom = resolveStationCode(fromQuery);
  const resolvedTo = resolveStationCode(toQuery);

  return [...trainMap.values()].filter((train) => {
    const fromIndex = train.stops.findIndex((stop) => {
      const code = stop.stationCode.toUpperCase();
      const name = stop.stationName.toUpperCase();
      return code === fromQuery || code === resolvedFrom || name === fromQuery;
    });

    const toIndex = train.stops.findIndex((stop) => {
      const code = stop.stationCode.toUpperCase();
      const name = stop.stationName.toUpperCase();
      return code === toQuery || code === resolvedTo || name === toQuery;
    });

    return fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;
  });
}

export function getTrainByNumber(trainNumber: string): Train | null {
  const normalized = normalizeTrainNumber(trainNumber);
  return trainMap.get(normalized) ?? null;
}

export function getTrainSchedule(trainNumber: string): TrainStop[] {
  const train = getTrainByNumber(trainNumber);
  return train?.stops ?? [];
}

export function getRouteCoordinates(trainNumber: string): [number, number][] {
  return getTrainSchedule(trainNumber)
    .filter((stop) => stop.lat !== null && stop.lng !== null)
    .map((stop) => [stop.lat as number, stop.lng as number]);
}

export function getStationByCode(stationCode: string): StationData | null {
  const resolved = resolveStation(stationCode);
  if (resolved) {
    return resolved;
  }

  const code = normalizeCode(stationCode);
  const geo = stationGeoMap.get(code);
  if (!geo) {
    return null;
  }

  return {
    code: geo.code,
    name: geo.name,
    state: "N/A",
    zone: "N/A",
    address: "N/A",
    coordinates: [geo.lng, geo.lat],
  };
}

export function getAllStations(): StationData[] {
  return [...stationMap.values()];
}

export function getRealStopCount(trainNumber: string): number {
  return getTrainSchedule(trainNumber).filter((stop) => stop.isHalt).length;
}

export function getSegmentDistance(trainNumber: string, fromSeq: number, toSeq: number): number {
  const stops = getTrainSchedule(trainNumber);
  const fromIndex = stops.findIndex((stop) => stop.seq === fromSeq);
  const toIndex = stops.findIndex((stop) => stop.seq === toSeq);

  if (fromIndex === -1 || toIndex === -1) {
    return 0;
  }

  const fromDistance = getInterpolatedDistance(stops, fromIndex);
  const toDistance = getInterpolatedDistance(stops, toIndex);

  if (fromDistance === null || toDistance === null) {
    return 0;
  }

  return Math.abs(toDistance - fromDistance);
}

export function getJourneyDistance(trainNumber: string, fromSeq: number, toSeq: number): number {
  return getSegmentDistance(trainNumber, fromSeq, toSeq);
}

export function getValidationReport() {
  const totalTrains = trainMap.size;
  const totalStops = [...trainMap.values()].reduce((sum, train) => sum + train.stops.length, 0);
  const totalHaltStops = [...trainMap.values()].reduce(
    (sum, train) => sum + train.stops.filter((stop) => stop.isHalt).length,
    0
  );
  const totalStations = stationGeoMap.size;
  const stopsWithGeo = [...trainMap.values()].reduce(
    (sum, train) => sum + train.stops.filter((stop) => stop.lat !== null && stop.lng !== null).length,
    0
  );

  return {
    totalTrains,
    totalStops,
    totalHaltStops,
    totalStations,
    stopsWithGeo,
    geoDataCoverage: totalStops > 0 ? `${((stopsWithGeo / totalStops) * 100).toFixed(2)}%` : "0%",
  };
}
