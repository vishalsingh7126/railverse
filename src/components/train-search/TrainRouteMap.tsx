"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import L, { type DivIcon, type LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import { getStationByCode, getTrainSchedule } from "@/lib/trainData";

type LeafletIconDefaultPrototype = typeof L.Icon.Default.prototype & {
  _getIconUrl?: unknown;
};

const leafletDefaultIcon = L.Icon.Default.prototype as LeafletIconDefaultPrototype;
delete leafletDefaultIcon._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

type TrainRouteMapProps = {
  trainNumber: string;
};

type MappedStop = {
  stationName: string;
  stationCode: string;
  arrival: string;
  departure: string;
  latitude: number;
  longitude: number;
  isHalt: boolean;
};

type RouteResponse = {
  features?: Array<{
    geometry?: {
      coordinates?: Array<[number, number]>;
    };
  }>;
};

const SOURCE_ICON = createStationIcon({
  size: 14,
  color: "#22c55e",
  shadow: "0 0 12px #22c55e",
});
const DESTINATION_ICON = createStationIcon({
  size: 14,
  color: "#ef4444",
  shadow: "0 0 12px #ef4444",
});
const HALT_ICON = createStationIcon({
  size: 12,
  color: "#38bdf8",
  shadow: "0 0 8px #38bdf8",
});
const NON_HALT_ICON = createStationIcon({
  size: 8,
  color: "#6b7280",
  opacity: 0.5,
});
const ORS_API_KEY = process.env.NEXT_PUBLIC_OPENROUTESERVICE_API_KEY;
const MAX_ROUTE_POINTS = 50;

export function TrainRouteMap({ trainNumber }: TrainRouteMapProps) {
  const [routePath, setRoutePath] = useState<LatLngTuple[]>([]);
  const [routeStatus, setRouteStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  const schedule = useMemo(() => getTrainSchedule(trainNumber), [trainNumber]);

  const mapStops = useMemo(() => {
    return schedule
      .map((stop) => {
        const station = getStationByCode(stop.stationCode);

        if (!station?.coordinates) {
          return null;
        }

        const [longitude, latitude] = station.coordinates;
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          return null;
        }

        return {
          stationName: station.name,
          stationCode: stop.stationCode,
          arrival: stop.arrival,
          departure: stop.departure,
          latitude,
          longitude,
          isHalt:
            stop.arrival !== stop.departure &&
            stop.arrival !== "N/A" &&
            stop.departure !== "N/A",
        } satisfies MappedStop;
      })
      .filter((stop): stop is MappedStop => stop !== null);
  }, [schedule]);

  const coordinates = useMemo(
    () => mapStops.map((stop) => [stop.latitude, stop.longitude] as LatLngTuple),
    [mapStops]
  );

  const routeCoordinates = useMemo(() => reduceRoutePoints(mapStops), [mapStops]);
  const displayedRoute = routePath.length > 0 ? routePath : coordinates;

  useEffect(() => {
    let isCancelled = false;

    async function loadRoute() {
      if (routeCoordinates.length < 2) {
        setRoutePath([]);
        setRouteStatus("idle");
        return;
      }

      if (!ORS_API_KEY) {
        setRoutePath([]);
        setRouteStatus("error");
        return;
      }

      setRouteStatus("loading");

      try {
        const path = await fetchRoute(routeCoordinates, ORS_API_KEY);

        if (isCancelled) {
          return;
        }

        setRoutePath(path);
        setRouteStatus(path.length > 0 ? "ready" : "error");
      } catch {
        if (isCancelled) {
          return;
        }

        setRoutePath([]);
        setRouteStatus("error");
      }
    }

    loadRoute();

    return () => {
      isCancelled = true;
    };
  }, [routeCoordinates]);

  if (coordinates.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/20 p-8 text-center text-sm text-foreground/70">
        Route map is unavailable because station coordinates were not found.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <MapContainer
        center={coordinates[0]}
        zoom={6}
        scrollWheelZoom
        style={{ height: "400px", width: "100%" }}
        className="rounded-xl border border-white/10"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {routeStatus === "loading" ? (
          <Polyline positions={coordinates} color="#94a3b8" weight={3} dashArray="8 10" />
        ) : (
          <Polyline
            positions={displayedRoute}
            color="#3b82f6"
            weight={4}
          />
        )}

        <FitRouteBounds coordinates={displayedRoute} />

        {mapStops.map((stop, index) => {
          const isSource = index === 0;
          const isDestination = index === mapStops.length - 1;
          const icon = isSource
            ? SOURCE_ICON
            : isDestination
              ? DESTINATION_ICON
              : stop.isHalt
                ? HALT_ICON
                : NON_HALT_ICON;

          return (
            <Marker
              key={`${stop.stationCode}-${index}`}
              position={[stop.latitude, stop.longitude]}
              icon={icon}
              zIndexOffset={isSource || isDestination || stop.isHalt ? 1000 : 0}
            >
              <Popup>
                <strong>{stop.stationName}</strong>
                <br />
                {stop.stationCode}
                <br />
                {stop.arrival} - {stop.departure}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <div className="flex items-center justify-between gap-3 text-xs text-foreground/70">
        <span>
          {routeStatus === "loading"
            ? "Calculating route..."
            : routeStatus === "error"
              ? "Using fallback straight-line route"
              : "Routed path loaded"}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-foreground/80">
        <LegendDot color="#22c55e" label="Source" />
        <LegendDot color="#ef4444" label="Destination" />
        <LegendDot color="#38bdf8" label="Halt" />
        <LegendDot color="#6b7280" label="Non-halt" />
      </div>
    </div>
  );
}

function FitRouteBounds({ coordinates }: { coordinates: LatLngTuple[] }) {
  const map = useMap();

  useEffect(() => {
    if (coordinates.length === 1) {
      map.setView(coordinates[0], 8);
      return;
    }

    map.fitBounds(L.latLngBounds(coordinates), {
      padding: [30, 30],
    });
  }, [coordinates, map]);

  return null;
}

async function fetchRoute(coordinates: LatLngTuple[], apiKey: string): Promise<LatLngTuple[]> {
  const response = await fetch("https://api.openrouteservice.org/v2/directions/driving-car/geojson", {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      coordinates: coordinates.map((coord) => [coord[1], coord[0]]),
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouteService request failed: ${response.status}`);
  }

  const data = (await response.json()) as RouteResponse;
  const geometry = data.features?.[0]?.geometry?.coordinates;

  if (!geometry || geometry.length === 0) {
    return [];
  }

  return geometry
    .map((coord) => [coord[1], coord[0]] as LatLngTuple)
    .filter(([latitude, longitude]) => Number.isFinite(latitude) && Number.isFinite(longitude));
}

function reduceRoutePoints(stops: MappedStop[]): LatLngTuple[] {
  const majorStops = stops.filter((stop, index) => {
    if (index === 0 || index === stops.length - 1) {
      return true;
    }

    return stop.arrival !== stop.departure && stop.arrival !== "N/A" && stop.departure !== "N/A";
  });

  const preferredStops = majorStops.length >= 2 ? majorStops : stops;
  const points = preferredStops.map((stop) => [stop.latitude, stop.longitude] as LatLngTuple);

  if (points.length <= MAX_ROUTE_POINTS) {
    return dedupeRoutePoints(points);
  }

  const sampled: LatLngTuple[] = [];
  const lastIndex = points.length - 1;

  for (let i = 0; i < MAX_ROUTE_POINTS; i += 1) {
    const index = Math.round((i / (MAX_ROUTE_POINTS - 1)) * lastIndex);
    sampled.push(points[index]);
  }

  return dedupeRoutePoints(sampled);
}

function dedupeRoutePoints(points: LatLngTuple[]): LatLngTuple[] {
  return points.filter((point, index, array) => {
    if (index === 0) {
      return true;
    }

    const previous = array[index - 1];
    return previous[0] !== point[0] || previous[1] !== point[1];
  });
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span>{label}</span>
    </div>
  );
}

function createStationIcon({
  color,
  size,
  shadow,
  opacity = 1,
}: {
  color: string;
  size: number;
  shadow?: string;
  opacity?: number;
}): DivIcon {
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;background:${color};opacity:${opacity};border-radius:999px;box-shadow:${shadow ?? "0 0 0 1px rgba(15,23,42,0.6)"};"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2)],
  });
}
