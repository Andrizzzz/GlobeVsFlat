import { useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { latLonToAzimuthal, azimuthalToLatLon } from '../math/projection';
import { EARTH_RADIUS_KM } from '../math/haversine';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import defaultFlatMap from '../assets/flat_maps/azimuthal_default.jpg';


const IMAGE_WIDTH = 543;
const IMAGE_RADIUS = IMAGE_WIDTH / 2;

const MAX_R = EARTH_RADIUS_KM * Math.PI;
const SCALE = IMAGE_RADIUS / MAX_R;

const BOUNDS: L.LatLngBoundsExpression = [
  [-IMAGE_RADIUS, -IMAGE_RADIUS],
  [IMAGE_RADIUS, IMAGE_RADIUS],
];

function projToLeaflet(x: number, y: number): L.LatLng {
  return L.latLng(y * SCALE, x * SCALE);
}

function createGridCanvas(size: number, isDark: boolean): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = isDark ? '#0f1318' : '#f5f7fa';
  ctx.fillRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;
  const canvasScale = (size / 2) / MAX_R;

  ctx.strokeStyle = isDark ? '#2a3040' : '#cbd5e1';
  ctx.lineWidth = 0.5;

  for (let lat = -80; lat <= 80; lat += 10) {
    const r = EARTH_RADIUS_KM * (Math.PI / 2 - (lat * Math.PI) / 180) * canvasScale;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    if (lat % 30 === 0) {
      ctx.fillStyle = isDark ? '#6b7280' : '#94a3b8';
      ctx.font = `${Math.max(10, size / 100)}px sans-serif`;
      ctx.fillText(`${lat}\u00B0`, cx + r + 3, cy + 3);
    }
  }

  for (let lon = 0; lon < 360; lon += 15) {
    const lonRad = (lon * Math.PI) / 180;
    const endR = MAX_R * canvasScale;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + endR * Math.sin(lonRad), cy + endR * Math.cos(lonRad));
    ctx.stroke();

    if (lon % 30 === 0) {
      const labelR = endR + 10;
      ctx.fillStyle = isDark ? '#6b7280' : '#94a3b8';
      ctx.font = `${Math.max(9, size / 110)}px sans-serif`;
      const lx = cx + labelR * Math.sin(lonRad);
      const ly = cy + labelR * Math.cos(lonRad);
      ctx.fillText(`${lon > 180 ? lon - 360 : lon}\u00B0`, lx - 8, ly + 3);
    }
  }

  const outerR = MAX_R * canvasScale;
  ctx.strokeStyle = isDark ? '#4b5563' : '#94a3b8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = isDark ? '#60a5fa' : '#2563eb';
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = isDark ? '#9ca3af' : '#64748b';
  ctx.font = `${Math.max(10, size / 100)}px sans-serif`;
  ctx.fillText('NP', cx + 6, cy - 6);

  const continents: Array<{ color: string; points: number[][] }> = [
    {
      color: isDark ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.1)',
      points: [
        [71,-25],[60,5],[55,28],[50,40],[45,42],
        [40,28],[36,0],[35,-5],[30,-10],[10,-15],
        [5,-1],[4,10],[10,50],[30,50],[40,45],
        [55,70],[60,60],[65,70],[70,65],[72,40],[71,-25]
      ],
    },
    {
      color: isDark ? 'rgba(251,191,36,0.15)' : 'rgba(251,191,36,0.1)',
      points: [
        [35,-5],[30,32],[25,45],[12,44],[5,40],
        [-5,35],[-15,27],[-25,30],[-35,19],
        [-34,17],[-10,12],[5,-15],[35,-5]
      ],
    },
    {
      color: isDark ? 'rgba(96,165,250,0.12)' : 'rgba(96,165,250,0.08)',
      points: [
        [70,-170],[65,-168],[60,-152],[55,-130],
        [50,-125],[40,-124],[32,-117],[25,-110],
        [20,-105],[15,-90],[10,-84],[8,-77],
        [5,-77],[-5,-80],[-15,-75],[-40,-73],
        [-55,-68],[-55,-65],[-40,-63],
        [0,-50],[10,-60],[20,-75],[25,-80],
        [30,-85],[48,-90],[50,-95],
        [52,-130],[60,-140],[65,-162],[70,-170]
      ],
    },
    {
      color: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)',
      points: [
        [-10,112],[-20,115],[-25,120],[-28,123],
        [-32,133],[-35,138],[-38,145],[-35,150],
        [-30,153],[-25,150],[-20,148],[-15,140],
        [-12,136],[-10,130],[-11,120],[-10,112]
      ],
    },
  ];

  continents.forEach(c => {
    ctx.fillStyle = c.color;
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    c.points.forEach((p, i) => {
      const proj = latLonToAzimuthal(p[0], p[1]);
      const px = cx + proj.x * canvasScale;
      const py = cy - proj.y * canvasScale;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });

  return canvas.toDataURL('image/png');
}

export default function FlatMapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const overlayRef = useRef<L.ImageOverlay | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const { t } = useTranslation();
  const {
    point1, point2, activeFlightRoute, qiblaLocation,
    activeTab, handleMapClick, selectingPoint, mapType, customImages, activeCustomImage, isDark
  } = useAppContext();

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      crs: L.CRS.Simple,
      zoomControl: false,
      minZoom: -2,
      maxZoom: 4,
      maxBounds: BOUNDS,
      maxBoundsViscosity: 1.0,
      scrollWheelZoom: true,
      doubleClickZoom: false,
      worldCopyJump: false,
      attributionControl: false,
      zoomSnap: 0.25,
      zoomDelta: 0.5,
    });

    map.fitBounds(BOUNDS);

    const fittedZoom = map.getZoom();
    map.setMinZoom(fittedZoom);
    map.setMaxZoom(fittedZoom + 2);

    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat: leafLat, lng: leafLng } = e.latlng;
      const projX = leafLng / SCALE;
      const projY = leafLat / SCALE;
      const coords = azimuthalToLatLon(projX, projY);
      if (coords.lat >= -90 && coords.lat <= 90) {
        handleMapClick(
          parseFloat(coords.lat.toFixed(4)),
          parseFloat(coords.lon.toFixed(4))
        );
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      overlayRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  const setImageOverlay = useCallback((url: string) => {
    const map = mapRef.current;
    if (!map) return;

    if (overlayRef.current) {
      map.removeLayer(overlayRef.current);
      overlayRef.current = null;
    }

    overlayRef.current = L.imageOverlay(url, BOUNDS).addTo(map);
    overlayRef.current.bringToBack();
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    let url: string;
    if (mapType === 'azimuthal') {
      url = defaultFlatMap;
    } else if (mapType === 'grid') {
      url = createGridCanvas(2048, isDark);
    } else if (mapType === 'custom' && customImages.length > 0) {
      url = customImages[activeCustomImage] || defaultFlatMap;
    } else {
      url = defaultFlatMap;
    }

    setImageOverlay(url);
  }, [mapType, customImages, activeCustomImage, isDark, setImageOverlay]);

  useEffect(() => {
    const map = mapRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    const addPoint = (lat: number, lon: number, color: string, label: string) => {
      const proj = latLonToAzimuthal(lat, lon);
      const pos = projToLeaflet(proj.x, proj.y);
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

    const addLine = (lat1: number, lon1: number, lat2: number, lon2: number, color: string, weight: number) => {
      const p1 = latLonToAzimuthal(lat1, lon1);
      const p2 = latLonToAzimuthal(lat2, lon2);
      L.polyline([projToLeaflet(p1.x, p1.y), projToLeaflet(p2.x, p2.y)], {
        color,
        weight,
        opacity: 0.9,
      }).addTo(layer);
    };

    if (point1) addPoint(point1.lat, point1.lon, '#22c55e', 'P1');
    if (point2) addPoint(point2.lat, point2.lon, '#ef4444', 'P2');
    if (point1 && point2) addLine(point1.lat, point1.lon, point2.lat, point2.lon, '#3b82f6', 3);

    if (activeFlightRoute) {
      const { from, to, fromName, toName } = activeFlightRoute;
      addPoint(from.lat, from.lon, '#3b82f6', fromName);
      addPoint(to.lat, to.lon, '#3b82f6', toName);
      addLine(from.lat, from.lon, to.lat, to.lon, '#3b82f6', 3);
    }

    const KAABA = { lat: 21.4225, lon: 39.8262 };
    if (activeTab === 'qibla' && qiblaLocation) {
      addPoint(qiblaLocation.lat, qiblaLocation.lon, '#22c55e', 'You');
      addPoint(KAABA.lat, KAABA.lon, '#eab308', 'Kaaba');
      addLine(qiblaLocation.lat, qiblaLocation.lon, KAABA.lat, KAABA.lon, '#3b82f6', 3);
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

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const bg = isDark ? '#0f1318' : '#f5f7fa';
    map.getContainer().style.backgroundColor = bg;
  }, [isDark]);

  return (
    <div className="relative w-full h-full" data-testid="flat-map-view">
      <div className="absolute top-2 end-2 z-[1000] bg-card/80 backdrop-blur-sm px-3 py-1 rounded-md text-sm font-medium text-card-foreground">
        {t('app.flat')}
      </div>
      <div
        ref={containerRef}
        className="w-full h-full"
        data-testid="flat-canvas"
      />
    </div>
  );
}
