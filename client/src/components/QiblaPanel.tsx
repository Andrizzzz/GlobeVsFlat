import { useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { sphericalBearing } from '../math/bearing';
import { flatBearing } from '../math/projection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2 } from 'lucide-react';

const KAABA = { lat: 21.4225, lon: 39.8262 };

export default function QiblaPanel() {
  const { t } = useTranslation();
  const { qiblaLocation, qiblaResult, setQiblaLocation, setQiblaResult } = useAppContext();
  const [latInput, setLatInput] = useState('');
  const [lonInput, setLonInput] = useState('');
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    if (qiblaLocation) {
      setLatInput(qiblaLocation.lat.toString());
      setLonInput(qiblaLocation.lon.toString());
    }
  }, [qiblaLocation]);

  const calculate = useCallback(() => {
    const lat = parseFloat(latInput);
    const lon = parseFloat(lonInput);
    if (isNaN(lat) || isNaN(lon)) return;

    setQiblaLocation({ lat, lon });

    const globe = sphericalBearing(lat, lon, KAABA.lat, KAABA.lon);
    const flat = flatBearing(lat, lon, KAABA.lat, KAABA.lon);
    let deviation = Math.abs(globe - flat);
    if (deviation > 180) deviation = 360 - deviation;

    setQiblaResult({ globeBearing: globe, flatBearing: flat, deviation });
  }, [latInput, lonInput, setQiblaLocation, setQiblaResult]);

  const useMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError(t('qibla.locationUnavailable'));
      return;
    }

    setLocating(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(4));
        const lon = parseFloat(position.coords.longitude.toFixed(4));
        setLatInput(lat.toString());
        setLonInput(lon.toString());
        setQiblaLocation({ lat, lon });

        const globe = sphericalBearing(lat, lon, KAABA.lat, KAABA.lon);
        const flat = flatBearing(lat, lon, KAABA.lat, KAABA.lon);
        let deviation = Math.abs(globe - flat);
        if (deviation > 180) deviation = 360 - deviation;
        setQiblaResult({ globeBearing: globe, flatBearing: flat, deviation });

        setLocating(false);
      },
      (error) => {
        setLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError(t('qibla.locationDenied'));
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError(t('qibla.locationUnavailable'));
            break;
          case error.TIMEOUT:
            setLocationError(t('qibla.locationTimeout'));
            break;
          default:
            setLocationError(t('qibla.locationUnavailable'));
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [t, setQiblaLocation, setQiblaResult]);

  return (
    <div className="space-y-3" data-testid="qibla-panel">
      <div className="bg-muted/50 rounded-md p-2 text-xs text-muted-foreground">
        {t('qibla.kaaba')}: {KAABA.lat}°N, {KAABA.lon}°E
      </div>

      <Button
        onClick={useMyLocation}
        variant="secondary"
        className="w-full"
        disabled={locating}
        data-testid="button-use-location"
      >
        {locating ? (
          <>
            <Loader2 className="w-4 h-4 me-1 animate-spin" />
            {t('qibla.locating')}
          </>
        ) : (
          <>
            <MapPin className="w-4 h-4 me-1" />
            {t('qibla.useMyLocation')}
          </>
        )}
      </Button>

      {locationError && (
        <div className="bg-destructive/10 text-destructive text-xs rounded-md p-2" data-testid="text-location-error">
          {locationError}
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-sm font-medium">{t('qibla.from')}</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-muted-foreground">{t('control.latitude')}</Label>
            <Input
              type="number"
              step="0.0001"
              value={latInput}
              onChange={e => setLatInput(e.target.value)}
              placeholder="-90 to 90"
              data-testid="input-qibla-lat"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">{t('control.longitude')}</Label>
            <Input
              type="number"
              step="0.0001"
              value={lonInput}
              onChange={e => setLonInput(e.target.value)}
              placeholder="-180 to 180"
              data-testid="input-qibla-lon"
            />
          </div>
        </div>
        <Button onClick={calculate} className="w-full" data-testid="button-qibla-calculate">
          {t('qibla.calculate')}
        </Button>
      </div>

      {qiblaResult ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 py-1">
            <span className="text-sm text-muted-foreground">{t('qibla.globeBearing')}</span>
            <span className="text-sm font-mono font-medium text-blue-500 dark:text-blue-400" data-testid="text-qibla-globe">
              {qiblaResult.globeBearing.toFixed(2)}°
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 py-1">
            <span className="text-sm text-muted-foreground">{t('qibla.flatBearing')}</span>
            <span className="text-sm font-mono font-medium text-orange-500 dark:text-orange-400" data-testid="text-qibla-flat">
              {qiblaResult.flatBearing.toFixed(2)}°
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 py-1 border-t border-border pt-2">
            <span className="text-sm font-medium">{t('qibla.deviation')}</span>
            <span className="text-sm font-mono font-bold text-primary" data-testid="text-qibla-deviation">
              {qiblaResult.deviation.toFixed(2)}°
            </span>
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground text-center py-2" data-testid="qibla-no-data">
          {t('qibla.noLocation')}
        </div>
      )}
    </div>
  );
}
