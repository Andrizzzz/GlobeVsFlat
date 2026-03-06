import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { haversineDistance } from '../math/haversine';
import { flatDistance } from '../math/projection';
import { Globe, Map, AlertTriangle } from 'lucide-react';

export default function DistancePanel() {
  const { t } = useTranslation();
  const { point1, point2, distanceResult, setDistanceResult } = useAppContext();

  useEffect(() => {
    if (point1 && point2) {
      const globe = haversineDistance(point1.lat, point1.lon, point2.lat, point2.lon);
      const flat = flatDistance(point1.lat, point1.lon, point2.lat, point2.lon);
      const diff = Math.abs(globe - flat);
      const pct = globe > 0 ? (diff / globe) * 100 : 0;
      setDistanceResult({ globeDistance: globe, flatDistance: flat, difference: diff, percentage: pct });
    } else {
      setDistanceResult(null);
    }
  }, [point1, point2, setDistanceResult]);

  if (!distanceResult) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4" data-testid="distance-no-data">
        {t('distance.noData')}
      </div>
    );
  }

  const cards = [
    {
      label: t('distance.globeDistance'),
      value: distanceResult.globeDistance,
      icon: <Globe className="w-4 h-4" />,
      color: 'border-green-500/30 bg-green-500/5',
      textColor: 'text-green-600 dark:text-green-400',
    },
    {
      label: t('distance.flatDistance'),
      value: distanceResult.flatDistance,
      icon: <Map className="w-4 h-4" />,
      color: 'border-blue-500/30 bg-blue-500/5',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: t('distance.difference'),
      value: distanceResult.difference,
      icon: <AlertTriangle className="w-4 h-4" />,
      color: 'border-red-500/30 bg-red-500/5',
      textColor: 'text-red-600 dark:text-red-400',
    },
  ];

  return (
    <div className="space-y-2" data-testid="distance-panel">
      {cards.map((card, i) => (
        <div key={i} className={`rounded-lg border p-3 ${card.color}`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={card.textColor}>{card.icon}</span>
              <span className="text-xs text-muted-foreground">{card.label}</span>
            </div>
            <span className={`text-sm font-mono font-semibold ${card.textColor}`} data-testid={`text-distance-${i}`}>
              {card.value.toFixed(2)} {t('distance.km')}
            </span>
          </div>
        </div>
      ))}
      <div className={`rounded-lg border p-3 ${distanceResult.percentage > 10 ? 'border-red-500/50 bg-red-500/10' : 'border-primary/30 bg-primary/5'}`}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium">{t('distance.percentage')}</span>
          <span className={`text-sm font-mono font-bold ${distanceResult.percentage > 10 ? 'text-red-600 dark:text-red-400' : 'text-primary'}`} data-testid="text-distance-pct">
            {distanceResult.percentage.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}
