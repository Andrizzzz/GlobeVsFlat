import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { haversineDistance } from '../math/haversine';
import { flatDistance } from '../math/projection';

function mercatorProjectedDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const x1 = R * toRad(lon1);
  const y1 = R * Math.log(Math.tan(Math.PI / 4 + toRad(lat1) / 2));
  const x2 = R * toRad(lon2);
  const y2 = R * Math.log(Math.tan(Math.PI / 4 + toRad(lat2) / 2));
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export default function ComparisonTable() {
  const { t } = useTranslation();
  const { point1, point2, activeFlightRoute } = useAppContext();

  let from = point1;
  let to = point2;

  if (activeFlightRoute) {
    from = activeFlightRoute.from;
    to = activeFlightRoute.to;
  }

  if (!from || !to) {
    return (
      <div className="text-xs text-muted-foreground text-center py-2" data-testid="comparison-no-data">
        {t('distance.noData')}
      </div>
    );
  }

  const globe = haversineDistance(from.lat, from.lon, to.lat, to.lon);
  const azimuthal = flatDistance(from.lat, from.lon, to.lat, to.lon);
  const mercator = mercatorProjectedDistance(from.lat, from.lon, to.lat, to.lon);

  const azDiff = Math.abs(globe - azimuthal);
  const azPct = globe > 0 ? (azDiff / globe) * 100 : 0;
  const mDiff = Math.abs(globe - mercator);
  const mPct = globe > 0 ? (mDiff / globe) * 100 : 0;

  const rows = [
    { label: t('comparison.globeDistance'), globe: globe.toFixed(0), az: '', merc: '', diff: '', pct: '' },
    { label: t('comparison.azimuthalDistance'), globe: '', az: azimuthal.toFixed(0), merc: '', diff: azDiff.toFixed(0), pct: azPct.toFixed(1), pctVal: azPct },
    { label: t('comparison.mercatorDistance'), globe: '', az: '', merc: mercator.toFixed(0), diff: mDiff.toFixed(0), pct: mPct.toFixed(1), pctVal: mPct },
  ];

  return (
    <div className="overflow-x-auto" data-testid="comparison-table">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-start p-1.5 font-medium text-muted-foreground"></th>
            <th className="text-end p-1.5 font-medium text-muted-foreground">{t('distance.km')}</th>
            <th className="text-end p-1.5 font-medium text-muted-foreground">{t('comparison.absDifference')}</th>
            <th className="text-end p-1.5 font-medium text-muted-foreground">{t('comparison.pctDifference')}</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border/50">
            <td className="p-1.5 font-medium">{t('comparison.globeDistance')}</td>
            <td className="p-1.5 text-end font-mono text-blue-500 dark:text-blue-400">{globe.toFixed(0)}</td>
            <td className="p-1.5 text-end font-mono text-muted-foreground">-</td>
            <td className="p-1.5 text-end font-mono text-muted-foreground">-</td>
          </tr>
          <tr className="border-b border-border/50">
            <td className="p-1.5 font-medium">{t('comparison.azimuthalDistance')}</td>
            <td className="p-1.5 text-end font-mono text-orange-500 dark:text-orange-400">{azimuthal.toFixed(0)}</td>
            <td className="p-1.5 text-end font-mono">{azDiff.toFixed(0)}</td>
            <td className={`p-1.5 text-end font-mono font-bold ${azPct > 10 ? 'text-red-500' : ''}`} data-testid="text-az-pct">
              {azPct.toFixed(1)}%
            </td>
          </tr>
          <tr>
            <td className="p-1.5 font-medium">{t('comparison.mercatorDistance')}</td>
            <td className="p-1.5 text-end font-mono text-green-500 dark:text-green-400">{mercator.toFixed(0)}</td>
            <td className="p-1.5 text-end font-mono">{mDiff.toFixed(0)}</td>
            <td className={`p-1.5 text-end font-mono font-bold ${mPct > 10 ? 'text-red-500' : ''}`} data-testid="text-merc-pct">
              {mPct.toFixed(1)}%
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
