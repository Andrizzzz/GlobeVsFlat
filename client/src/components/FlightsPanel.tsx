import { useTranslation } from 'react-i18next';
import { useAppContext, type FlightRoute } from '../context/AppContext';
import { haversineDistance } from '../math/haversine';
import { flatDistance } from '../math/projection';
import { Button } from '@/components/ui/button';

const FLIGHT_ROUTES: FlightRoute[] = [
  {
    id: 'sydney_santiago',
    fromName: 'Sydney',
    toName: 'Santiago',
    from: { lat: -33.8688, lon: 151.2093 },
    to: { lat: -33.4489, lon: -70.6693 },
  },
  {
    id: 'johannesburg_sydney',
    fromName: 'Johannesburg',
    toName: 'Sydney',
    from: { lat: -26.2041, lon: 28.0473 },
    to: { lat: -33.8688, lon: 151.2093 },
  },
  {
    id: 'santiago_auckland',
    fromName: 'Santiago',
    toName: 'Auckland',
    from: { lat: -33.4489, lon: -70.6693 },
    to: { lat: -36.8485, lon: 174.7633 },
  },
  {
    id: 'perth_johannesburg',
    fromName: 'Perth',
    toName: 'Johannesburg',
    from: { lat: -31.9505, lon: 115.8605 },
    to: { lat: -26.2041, lon: 28.0473 },
  },
  {
    id: 'buenos_aires_sydney',
    fromName: 'Buenos Aires',
    toName: 'Sydney',
    from: { lat: -34.6037, lon: -58.3816 },
    to: { lat: -33.8688, lon: 151.2093 },
  },
  {
    id: 'cape_town_auckland',
    fromName: 'Cape Town',
    toName: 'Auckland',
    from: { lat: -33.9249, lon: 18.4241 },
    to: { lat: -36.8485, lon: 174.7633 },
  },
  {
    id: 'sao_paulo_johannesburg',
    fromName: 'São Paulo',
    toName: 'Johannesburg',
    from: { lat: -23.5505, lon: -46.6333 },
    to: { lat: -26.2041, lon: 28.0473 },
  },
  {
    id: 'lima_sydney',
    fromName: 'Lima',
    toName: 'Sydney',
    from: { lat: -12.0464, lon: -77.0428 },
    to: { lat: -33.8688, lon: 151.2093 },
  },
  {
    id: 'dubai_santiago',
    fromName: 'Dubai',
    toName: 'Santiago',
    from: { lat: 25.2048, lon: 55.2708 },
    to: { lat: -33.4489, lon: -70.6693 },
  },
  {
    id: 'santiago_sydney',
    fromName: 'Santiago',
    toName: 'Sydney',
    from: { lat: -33.4489, lon: -70.6693 },
    to: { lat: -33.8688, lon: 151.2093 },
  },
  {
    id: 'auckland_cape_town',
    fromName: 'Auckland',
    toName: 'Cape Town',
    from: { lat: -36.8485, lon: 174.7633 },
    to: { lat: -33.9249, lon: 18.4241 },
  },
  {
    id: 'santiago_johannesburg',
    fromName: 'Santiago',
    toName: 'Johannesburg',
    from: { lat: -33.4489, lon: -70.6693 },
    to: { lat: -26.2041, lon: 28.0473 },
  },
  {
    id: 'rio_sydney',
    fromName: 'Rio de Janeiro',
    toName: 'Sydney',
    from: { lat: -22.9068, lon: -43.1729 },
    to: { lat: -33.8688, lon: 151.2093 },
  },
];

export default function FlightsPanel() {
  const { t } = useTranslation();
  const { activeFlightRoute, setActiveFlightRoute } = useAppContext();

  const handleSelect = (route: FlightRoute) => {
    if (activeFlightRoute?.id === route.id) {
      setActiveFlightRoute(null);
    } else {
      setActiveFlightRoute(route);
    }
  };

  return (
    <div className="space-y-2" data-testid="flights-panel">
      {FLIGHT_ROUTES.map(route => {
        const isActive = activeFlightRoute?.id === route.id;
        const globe = haversineDistance(route.from.lat, route.from.lon, route.to.lat, route.to.lon);
        const flat = flatDistance(route.from.lat, route.from.lon, route.to.lat, route.to.lon);

        return (
          <div
            key={route.id}
            className={`rounded-md p-3 cursor-pointer transition-colors ${isActive ? 'bg-primary/10 border border-primary/30' : 'bg-muted/30 border border-transparent'}`}
            onClick={() => handleSelect(route)}
            data-testid={`flight-route-${route.id}`}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-sm font-medium">
                {t(`flights.${route.id}`)}
              </span>
              <Button
                size="sm"
                variant={isActive ? 'default' : 'secondary'}
                className="text-xs"
                data-testid={`button-flight-${route.id}`}
              >
                {t('flights.showRoute')}
              </Button>
            </div>
            {isActive && (
              <div className="text-xs space-y-1 mt-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('flights.globeRoute')}</span>
                  <span className="font-mono text-blue-500 dark:text-blue-400">{globe.toFixed(0)} {t('distance.km')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('flights.flatRoute')}</span>
                  <span className="font-mono text-orange-500 dark:text-orange-400">{flat.toFixed(0)} {t('distance.km')}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
