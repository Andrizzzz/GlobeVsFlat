import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MERCATOR_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

export default function MercatorView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const { t } = useTranslation();
  const {
    point1, point2, activeFlightRoute, qiblaLocation,
    activeTab, handleMapClick, selectingPoint, isDark
  } = useAppContext();

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [20, 0],
      zoom: 2,
      minZoom: 1,
      maxZoom: 6,
      zoomControl: false,
      attributionControl: false,
      doubleClickZoom: false,
    });

    L.tileLayer(MERCATOR_TILE_URL, {
      maxZoom: 18,
      attribution: '',
    }).addTo(map);

    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (lat >= -90 && lat <= 90) {
        handleMapClick(
          parseFloat(lat.toFixed(4)),
          parseFloat(lng.toFixed(4))
        );
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    const addPoint = (lat: number, lon: number, color: string, label: string) => {
      const pos = L.latLng(lat, lon);
      L.circleMarker(pos, {
        radius: 8,
        fillColor: color,
        color: '#fff',
        weight: 2.5,
        fillOpacity: 1,
        className: 'marker-shadow',
      }).addTo(layer);
      L.marker(pos, {
        icon: L.divIcon({
          className: 'leaflet-label-overlay',
          html: `<span style="font-size:12px;font-weight:bold;color:${isDark ? '#e5e7eb' : '#1f2937'};text-shadow:0 0 4px ${isDark ? '#000' : '#fff'}, 0 0 4px ${isDark ? '#000' : '#fff'}">${label}</span>`,
          iconAnchor: [-12, 18],
        }),
      }).addTo(layer);
    };

    const greatCirclePoints = (lat1: number, lon1: number, lat2: number, lon2: number, numPoints = 100): [number, number][] => {
      const toRad = (d: number) => (d * Math.PI) / 180;
      const toDeg = (r: number) => (r * 180) / Math.PI;
      const phi1 = toRad(lat1), lam1 = toRad(lon1);
      const phi2 = toRad(lat2), lam2 = toRad(lon2);
      const d = 2 * Math.asin(Math.sqrt(
        Math.sin((phi2 - phi1) / 2) ** 2 +
        Math.cos(phi1) * Math.cos(phi2) * Math.sin((lam2 - lam1) / 2) ** 2
      ));
      if (d < 1e-10) return [[lat1, lon1], [lat2, lon2]];
      const pts: [number, number][] = [];
      for (let i = 0; i <= numPoints; i++) {
        const f = i / numPoints;
        const a = Math.sin((1 - f) * d) / Math.sin(d);
        const b = Math.sin(f * d) / Math.sin(d);
        const x = a * Math.cos(phi1) * Math.cos(lam1) + b * Math.cos(phi2) * Math.cos(lam2);
        const y = a * Math.cos(phi1) * Math.sin(lam1) + b * Math.cos(phi2) * Math.sin(lam2);
        const z = a * Math.sin(phi1) + b * Math.sin(phi2);
        pts.push([toDeg(Math.atan2(z, Math.sqrt(x * x + y * y))), toDeg(Math.atan2(y, x))]);
      }
      return pts;
    };

    const addLine = (lat1: number, lon1: number, lat2: number, lon2: number, color: string, weight: number) => {
      const pts = greatCirclePoints(lat1, lon1, lat2, lon2);
      const segments: [number, number][][] = [[]];
      for (let i = 0; i < pts.length; i++) {
        segments[segments.length - 1].push(pts[i]);
        if (i < pts.length - 1 && Math.abs(pts[i + 1][1] - pts[i][1]) > 180) {
          segments.push([]);
        }
      }
      segments.forEach(seg => {
        if (seg.length > 1) {
          L.polyline(seg, { color, weight, opacity: 0.9 }).addTo(layer);
        }
      });
    };

    if (point1) addPoint(point1.lat, point1.lon, '#22c55e', 'P1');
    if (point2) addPoint(point2.lat, point2.lon, '#ef4444', 'P2');
    if (point1 && point2) addLine(point1.lat, point1.lon, point2.lat, point2.lon, '#ef4444', 3);

    if (activeFlightRoute) {
      const { from, to, fromName, toName } = activeFlightRoute;
      addPoint(from.lat, from.lon, '#ef4444', fromName);
      addPoint(to.lat, to.lon, '#ef4444', toName);
      addLine(from.lat, from.lon, to.lat, to.lon, '#ef4444', 3);
    }

    const KAABA = { lat: 21.4225, lon: 39.8262 };
    if (activeTab === 'qibla' && qiblaLocation) {
      addPoint(qiblaLocation.lat, qiblaLocation.lon, '#22c55e', 'You');
      addPoint(KAABA.lat, KAABA.lon, '#eab308', 'Kaaba');
      addLine(qiblaLocation.lat, qiblaLocation.lon, KAABA.lat, KAABA.lon, '#ef4444', 3);
    }
  }, [point1, point2, activeFlightRoute, qiblaLocation, activeTab, isDark]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const container = map.getContainer();
    if (selectingPoint) {
      container.style.cursor = 'crosshair';
    } else {
      container.style.cursor = '';
    }
  }, [selectingPoint]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative w-full h-full" data-testid="mercator-view">
      <div className="absolute top-2 end-2 z-[1000] bg-card/80 backdrop-blur-sm px-3 py-1 rounded-md text-sm font-medium text-card-foreground">
        {t('mapSelector.mercator')}
      </div>
      <div
        ref={containerRef}
        className="w-full h-full"
        data-testid="mercator-canvas"
      />
    </div>
  );
}
