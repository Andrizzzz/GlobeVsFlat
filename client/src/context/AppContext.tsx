import { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface Coordinates {
  lat: number;
  lon: number;
}

interface DistanceResult {
  globeDistance: number;
  flatDistance: number;
  difference: number;
  percentage: number;
}

interface QiblaResult {
  globeBearing: number;
  flatBearing: number;
  deviation: number;
}

interface FlightRoute {
  id: string;
  from: Coordinates;
  to: Coordinates;
  fromName: string;
  toName: string;
}

type MapType = 'azimuthal' | 'grid' | 'mercator' | 'custom';
type SelectingPoint = 'point1' | 'point2' | null;

interface AppState {
  point1: Coordinates | null;
  point2: Coordinates | null;
  distanceResult: DistanceResult | null;
  qiblaResult: QiblaResult | null;
  qiblaLocation: Coordinates | null;
  activeFlightRoute: FlightRoute | null;
  mapType: MapType;
  customImages: string[];
  activeCustomImage: number;
  isDark: boolean;
  selectingPoint: SelectingPoint;
  activeTab: string;
  comparisonMode: boolean;
}

interface AppContextType extends AppState {
  setPoint1: (p: Coordinates | null) => void;
  setPoint2: (p: Coordinates | null) => void;
  setDistanceResult: (r: DistanceResult | null) => void;
  setQiblaResult: (r: QiblaResult | null) => void;
  setQiblaLocation: (l: Coordinates | null) => void;
  setActiveFlightRoute: (r: FlightRoute | null) => void;
  setMapType: (t: MapType) => void;
  addCustomImage: (url: string) => void;
  removeCustomImage: (index: number) => void;
  setActiveCustomImage: (index: number) => void;
  toggleTheme: () => void;
  setSelectingPoint: (s: SelectingPoint) => void;
  setActiveTab: (t: string) => void;
  handleMapClick: (lat: number, lon: number) => void;
  setComparisonMode: (v: boolean) => void;
  resetAll: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    point1: null,
    point2: null,
    distanceResult: null,
    qiblaResult: null,
    qiblaLocation: null,
    activeFlightRoute: null,
    mapType: 'azimuthal',
    customImages: [],
    activeCustomImage: 0,
    isDark: true,
    selectingPoint: 'point1',
    activeTab: 'distance',
    comparisonMode: false,
  });

  useEffect(() => {
    if (state.isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.isDark]);

  const setPoint1 = useCallback((p: Coordinates | null) => {
    setState(s => ({ ...s, point1: p }));
  }, []);

  const setPoint2 = useCallback((p: Coordinates | null) => {
    setState(s => ({ ...s, point2: p }));
  }, []);

  const setDistanceResult = useCallback((r: DistanceResult | null) => {
    setState(s => ({ ...s, distanceResult: r }));
  }, []);

  const setQiblaResult = useCallback((r: QiblaResult | null) => {
    setState(s => ({ ...s, qiblaResult: r }));
  }, []);

  const setQiblaLocation = useCallback((l: Coordinates | null) => {
    setState(s => ({ ...s, qiblaLocation: l }));
  }, []);

  const setActiveFlightRoute = useCallback((r: FlightRoute | null) => {
    setState(s => ({ ...s, activeFlightRoute: r }));
  }, []);

  const setMapType = useCallback((t: MapType) => {
    setState(s => ({ ...s, mapType: t }));
  }, []);

  const addCustomImage = useCallback((url: string) => {
    setState(s => ({
      ...s,
      customImages: [...s.customImages, url],
      mapType: 'custom' as MapType,
      activeCustomImage: s.customImages.length,
    }));
  }, []);

  const removeCustomImage = useCallback((index: number) => {
    setState(s => {
      const newImages = s.customImages.filter((_, i) => i !== index);
      return {
        ...s,
        customImages: newImages,
        activeCustomImage: Math.min(s.activeCustomImage, Math.max(0, newImages.length - 1)),
        mapType: newImages.length === 0 ? 'azimuthal' as MapType : s.mapType,
      };
    });
  }, []);

  const setActiveCustomImage = useCallback((index: number) => {
    setState(s => ({ ...s, activeCustomImage: index }));
  }, []);

  const toggleTheme = useCallback(() => {
    setState(s => ({ ...s, isDark: !s.isDark }));
  }, []);

  const setSelectingPoint = useCallback((sp: SelectingPoint) => {
    setState(s => ({ ...s, selectingPoint: sp }));
  }, []);

  const setActiveTab = useCallback((t: string) => {
    setState(s => ({ ...s, activeTab: t }));
  }, []);

  const handleMapClick = useCallback((lat: number, lon: number) => {
    setState(s => {
      if (s.activeTab === 'qibla') {
        return { ...s, qiblaLocation: { lat, lon } };
      }
      if (s.selectingPoint === 'point1') {
        return { ...s, point1: { lat, lon }, selectingPoint: 'point2' };
      } else if (s.selectingPoint === 'point2') {
        return { ...s, point2: { lat, lon }, selectingPoint: null };
      }
      return s;
    });
  }, []);

  const setComparisonMode = useCallback((v: boolean) => {
    setState(s => ({ ...s, comparisonMode: v }));
  }, []);

  const resetAll = useCallback(() => {
    setState(s => ({
      ...s,
      point1: null,
      point2: null,
      distanceResult: null,
      qiblaResult: null,
      qiblaLocation: null,
      activeFlightRoute: null,
      selectingPoint: 'point1' as SelectingPoint,
    }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        setPoint1,
        setPoint2,
        setDistanceResult,
        setQiblaResult,
        setQiblaLocation,
        setActiveFlightRoute,
        setMapType,
        addCustomImage,
        removeCustomImage,
        setActiveCustomImage,
        toggleTheme,
        setSelectingPoint,
        setActiveTab,
        handleMapClick,
        setComparisonMode,
        resetAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}

export type { Coordinates, DistanceResult, QiblaResult, FlightRoute, MapType, SelectingPoint };
