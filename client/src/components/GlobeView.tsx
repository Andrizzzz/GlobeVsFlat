import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { Loader2, AlertTriangle } from 'lucide-react';

declare global {
  interface Window {
    Cesium: any;
    CESIUM_LOADED?: boolean;
  }
}

export default function GlobeView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const handlerRef = useRef<any>(null);
  const entitiesRef = useRef<any[]>([]);
  const { t } = useTranslation();
  const {
    point1, point2, activeFlightRoute, qiblaLocation, qiblaResult,
    activeTab, handleMapClick, selectingPoint
  } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [tokenMissing, setTokenMissing] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    let destroyed = false;

    const initCesium = () => {
      if (destroyed || !containerRef.current) return;
      const Cesium = window.Cesium;
      const token = import.meta.env.VITE_CESIUM_TOKEN;

      if (!token) {
        console.warn('Cesium token missing. Configure VITE_CESIUM_TOKEN in Secrets.');
        setTokenMissing(true);
        setLoading(false);
        Cesium.Ion.defaultAccessToken = undefined;
      } else {
        Cesium.Ion.defaultAccessToken = token;
      }

      try {
        const viewerOptions: any = {
          baseLayerPicker: false,
          geocoder: false,
          homeButton: false,
          sceneModePicker: false,
          selectionIndicator: false,
          timeline: false,
          animation: false,
          navigationHelpButton: false,
          fullscreenButton: false,
          infoBox: false,
          creditContainer: document.createElement('div'),
          terrainProvider: undefined,
        };

        if (token) {
          viewerOptions.imageryProvider = undefined;
        } else {
          viewerOptions.imageryProvider = new Cesium.TileMapServiceImageryProvider({
            url: Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII'),
          });
        }

        viewerRef.current = new Cesium.Viewer(containerRef.current, viewerOptions);

        if (token) {
          Cesium.IonImageryProvider.fromAssetId(2).then((provider: any) => {
            if (!destroyed && viewerRef.current && !viewerRef.current.isDestroyed()) {
              viewerRef.current.imageryLayers.addImageryProvider(provider);
            }
          }).catch(() => {
            if (!destroyed && viewerRef.current && !viewerRef.current.isDestroyed()) {
              viewerRef.current.imageryLayers.addImageryProvider(
                new Cesium.TileMapServiceImageryProvider({
                  url: Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII'),
                })
              );
            }
          });
        }

        viewerRef.current.scene.globe.enableLighting = false;
        viewerRef.current.scene.skyAtmosphere.show = true;

        viewerRef.current.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(0, 20, 15000000),
        });

        handlerRef.current = new Cesium.ScreenSpaceEventHandler(viewerRef.current.scene.canvas);
        handlerRef.current.setInputAction((click: any) => {
          if (!viewerRef.current || viewerRef.current.isDestroyed()) return;
          const ray = viewerRef.current.camera.getPickRay(click.position);
          const cartesian = viewerRef.current.scene.globe.pick(ray, viewerRef.current.scene);
          if (cartesian) {
            const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            const lat = Cesium.Math.toDegrees(cartographic.latitude);
            const lon = Cesium.Math.toDegrees(cartographic.longitude);
            handleMapClick(parseFloat(lat.toFixed(4)), parseFloat(lon.toFixed(4)));
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        setLoading(false);
        setLoaded(true);
      } catch (e) {
        console.error('Cesium init error:', e);
        setLoading(false);
      }
    };

    if (window.CESIUM_LOADED && window.Cesium) {
      initCesium();
    } else {
      const existing = document.querySelector('script[src*="cesium"]');
      if (existing) {
        existing.addEventListener('load', initCesium);
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cesium.com/downloads/cesiumjs/releases/1.119/Build/Cesium/Widgets/widgets.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://cesium.com/downloads/cesiumjs/releases/1.119/Build/Cesium/Cesium.js';
      script.onload = () => {
        window.CESIUM_LOADED = true;
        initCesium();
      };
      document.head.appendChild(script);
    }

    return () => {
      destroyed = true;
      if (handlerRef.current) {
        handlerRef.current.destroy();
        handlerRef.current = null;
      }
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!viewerRef.current || !loaded || viewerRef.current.isDestroyed()) return;
    const Cesium = window.Cesium;
    if (!Cesium) return;

    entitiesRef.current.forEach(e => {
      try {
        if (viewerRef.current && !viewerRef.current.isDestroyed()) {
          viewerRef.current.entities.remove(e);
        }
      } catch {}
    });
    entitiesRef.current = [];

    const addEntity = (opts: any) => {
      if (!viewerRef.current || viewerRef.current.isDestroyed()) return null;
      const e = viewerRef.current.entities.add(opts);
      entitiesRef.current.push(e);
      return e;
    };

    if (point1) {
      addEntity({
        position: Cesium.Cartesian3.fromDegrees(point1.lon, point1.lat),
        point: { pixelSize: 14, color: Cesium.Color.fromCssColorString('#22c55e'), outlineColor: Cesium.Color.WHITE, outlineWidth: 2 },
        label: {
          text: 'P1',
          font: '14px sans-serif',
          fillColor: Cesium.Color.WHITE,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 3,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -18),
        },
      });
    }

    if (point2) {
      addEntity({
        position: Cesium.Cartesian3.fromDegrees(point2.lon, point2.lat),
        point: { pixelSize: 14, color: Cesium.Color.fromCssColorString('#ef4444'), outlineColor: Cesium.Color.WHITE, outlineWidth: 2 },
        label: {
          text: 'P2',
          font: '14px sans-serif',
          fillColor: Cesium.Color.WHITE,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 3,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -18),
        },
      });
    }

    if (point1 && point2) {
      addEntity({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray([
            point1.lon, point1.lat,
            point2.lon, point2.lat,
          ]),
          width: 3.5,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.25,
            color: Cesium.Color.fromCssColorString('#22c55e'),
          }),
          arcType: Cesium.ArcType.GEODESIC,
        },
      });
    }

    if (activeFlightRoute) {
      const { from, to } = activeFlightRoute;
      addEntity({
        position: Cesium.Cartesian3.fromDegrees(from.lon, from.lat),
        point: { pixelSize: 12, color: Cesium.Color.fromCssColorString('#22c55e'), outlineColor: Cesium.Color.WHITE, outlineWidth: 2 },
      });
      addEntity({
        position: Cesium.Cartesian3.fromDegrees(to.lon, to.lat),
        point: { pixelSize: 12, color: Cesium.Color.fromCssColorString('#22c55e'), outlineColor: Cesium.Color.WHITE, outlineWidth: 2 },
      });
      addEntity({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray([
            from.lon, from.lat, to.lon, to.lat,
          ]),
          width: 3.5,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.25,
            color: Cesium.Color.fromCssColorString('#22c55e'),
          }),
          arcType: Cesium.ArcType.GEODESIC,
        },
      });

      const minLat = Math.min(from.lat, to.lat);
      const maxLat = Math.max(from.lat, to.lat);
      const minLon = Math.min(from.lon, to.lon);
      const maxLon = Math.max(from.lon, to.lon);
      const pad = 5;
      const rectangle = Cesium.Rectangle.fromDegrees(
        minLon - pad, Math.max(minLat - pad, -89), maxLon + pad, Math.min(maxLat + pad, 89)
      );
      viewerRef.current.camera.flyTo({
        destination: rectangle,
        duration: 2,
      });
    }

    const KAABA = { lat: 21.4225, lon: 39.8262 };
    if (activeTab === 'qibla' && qiblaLocation) {
      addEntity({
        position: Cesium.Cartesian3.fromDegrees(qiblaLocation.lon, qiblaLocation.lat),
        point: { pixelSize: 12, color: Cesium.Color.fromCssColorString('#22c55e'), outlineColor: Cesium.Color.WHITE, outlineWidth: 2 },
        label: {
          text: t('qibla.from'),
          font: '12px sans-serif',
          fillColor: Cesium.Color.WHITE,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 3,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -16),
        },
      });
      addEntity({
        position: Cesium.Cartesian3.fromDegrees(KAABA.lon, KAABA.lat),
        point: { pixelSize: 14, color: Cesium.Color.fromCssColorString('#eab308'), outlineColor: Cesium.Color.WHITE, outlineWidth: 2 },
        label: {
          text: 'Kaaba',
          font: '12px sans-serif',
          fillColor: Cesium.Color.YELLOW,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 3,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -16),
        },
      });
      addEntity({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray([
            qiblaLocation.lon, qiblaLocation.lat,
            KAABA.lon, KAABA.lat,
          ]),
          width: 3.5,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.25,
            color: Cesium.Color.fromCssColorString('#22c55e'),
          }),
          arcType: Cesium.ArcType.GEODESIC,
        },
      });
    }
  }, [point1, point2, activeFlightRoute, qiblaLocation, qiblaResult, activeTab, loaded, t]);

  useEffect(() => {
    const handleResize = () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.resize();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cursorStyle = selectingPoint ? 'crosshair' : 'default';

  return (
    <div className="relative w-full h-full" data-testid="globe-view">
      <div className="absolute top-2 start-2 z-10 bg-card/80 backdrop-blur-sm px-3 py-1 rounded-md text-sm font-medium text-card-foreground">
        {t('app.globe')}
      </div>

      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <span className="text-sm font-medium text-muted-foreground">{t('app.globeLoading')}</span>
          </div>
        </div>
      )}

      {tokenMissing && (
        <div className="absolute top-10 start-2 end-2 z-20 bg-destructive/10 border border-destructive/30 rounded-md p-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
          <span className="text-xs text-destructive">
            Cesium token missing. Configure VITE_CESIUM_TOKEN in Secrets.
          </span>
        </div>
      )}

      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ cursor: cursorStyle }}
        data-testid="cesium-container"
      />
    </div>
  );
}
