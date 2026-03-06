import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';

const CITIES: { nameAr: string; nameEn: string; lat: number; lon: number; group: 'arab' | 'world' }[] = [
  { nameAr: 'بغداد', nameEn: 'Baghdad', lat: 33.3152, lon: 44.3661, group: 'arab' },
  { nameAr: 'الرياض', nameEn: 'Riyadh', lat: 24.7136, lon: 46.6753, group: 'arab' },
  { nameAr: 'القاهرة', nameEn: 'Cairo', lat: 30.0444, lon: 31.2357, group: 'arab' },
  { nameAr: 'الدار البيضاء', nameEn: 'Casablanca', lat: 33.5731, lon: -7.5898, group: 'arab' },
  { nameAr: 'الجزائر', nameEn: 'Algiers', lat: 36.7538, lon: 3.0588, group: 'arab' },
  { nameAr: 'تونس', nameEn: 'Tunis', lat: 36.8065, lon: 10.1815, group: 'arab' },
  { nameAr: 'الخرطوم', nameEn: 'Khartoum', lat: 15.5007, lon: 32.5599, group: 'arab' },
  { nameAr: 'دمشق', nameEn: 'Damascus', lat: 33.5138, lon: 36.2765, group: 'arab' },
  { nameAr: 'بيروت', nameEn: 'Beirut', lat: 33.8938, lon: 35.5018, group: 'arab' },
  { nameAr: 'عمّان', nameEn: 'Amman', lat: 31.9454, lon: 35.9284, group: 'arab' },
  { nameAr: 'دبي', nameEn: 'Dubai', lat: 25.2048, lon: 55.2708, group: 'arab' },
  { nameAr: 'أبو ظبي', nameEn: 'Abu Dhabi', lat: 24.4539, lon: 54.3773, group: 'arab' },
  { nameAr: 'الكويت', nameEn: 'Kuwait', lat: 29.3759, lon: 47.9774, group: 'arab' },
  { nameAr: 'الدوحة', nameEn: 'Doha', lat: 25.2854, lon: 51.5310, group: 'arab' },
  { nameAr: 'مسقط', nameEn: 'Muscat', lat: 23.5880, lon: 58.3829, group: 'arab' },
  { nameAr: 'لندن', nameEn: 'London', lat: 51.5074, lon: -0.1278, group: 'world' },
  { nameAr: 'باريس', nameEn: 'Paris', lat: 48.8566, lon: 2.3522, group: 'world' },
  { nameAr: 'برلين', nameEn: 'Berlin', lat: 52.5200, lon: 13.4050, group: 'world' },
  { nameAr: 'موسكو', nameEn: 'Moscow', lat: 55.7558, lon: 37.6173, group: 'world' },
  { nameAr: 'نيويورك', nameEn: 'New York', lat: 40.7128, lon: -74.0060, group: 'world' },
  { nameAr: 'لوس أنجلوس', nameEn: 'Los Angeles', lat: 34.0522, lon: -118.2437, group: 'world' },
  { nameAr: 'تورنتو', nameEn: 'Toronto', lat: 43.6532, lon: -79.3832, group: 'world' },
  { nameAr: 'مكسيكو سيتي', nameEn: 'Mexico City', lat: 19.4326, lon: -99.1332, group: 'world' },
  { nameAr: 'ريو دي جانيرو', nameEn: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729, group: 'world' },
  { nameAr: 'بوينس آيرس', nameEn: 'Buenos Aires', lat: -34.6037, lon: -58.3816, group: 'world' },
  { nameAr: 'كيب تاون', nameEn: 'Cape Town', lat: -33.9249, lon: 18.4241, group: 'world' },
  { nameAr: 'جوهانسبرغ', nameEn: 'Johannesburg', lat: -26.2041, lon: 28.0473, group: 'world' },
  { nameAr: 'دلهي', nameEn: 'Delhi', lat: 28.7041, lon: 77.1025, group: 'world' },
  { nameAr: 'بكين', nameEn: 'Beijing', lat: 39.9042, lon: 116.4074, group: 'world' },
  { nameAr: 'طوكيو', nameEn: 'Tokyo', lat: 35.6762, lon: 139.6503, group: 'world' },
  { nameAr: 'سيول', nameEn: 'Seoul', lat: 37.5665, lon: 126.9780, group: 'world' },
  { nameAr: 'سنغافورة', nameEn: 'Singapore', lat: 1.3521, lon: 103.8198, group: 'world' },
  { nameAr: 'سيدني', nameEn: 'Sydney', lat: -33.8688, lon: 151.2093, group: 'world' },
  { nameAr: 'أوكلاند', nameEn: 'Auckland', lat: -36.8485, lon: 174.7633, group: 'world' },
  { nameAr: 'سانتياغو', nameEn: 'Santiago', lat: -33.4489, lon: -70.6693, group: 'world' },
  { nameAr: 'ليما', nameEn: 'Lima', lat: -12.0464, lon: -77.0428, group: 'world' },
];

export default function ControlPanel() {
  const { t, i18n } = useTranslation();
  const { point1, point2, setPoint1, setPoint2, selectingPoint, setSelectingPoint } = useAppContext();
  const isAr = i18n.language === 'ar';

  const [lat1, setLat1] = useState('');
  const [lon1, setLon1] = useState('');
  const [lat2, setLat2] = useState('');
  const [lon2, setLon2] = useState('');

  useEffect(() => {
    if (point1) {
      setLat1(point1.lat.toString());
      setLon1(point1.lon.toString());
    }
  }, [point1]);

  useEffect(() => {
    if (point2) {
      setLat2(point2.lat.toString());
      setLon2(point2.lon.toString());
    }
  }, [point2]);

  const handleApply = () => {
    const p1Lat = parseFloat(lat1);
    const p1Lon = parseFloat(lon1);
    const p2Lat = parseFloat(lat2);
    const p2Lon = parseFloat(lon2);
    if (!isNaN(p1Lat) && !isNaN(p1Lon)) setPoint1({ lat: p1Lat, lon: p1Lon });
    if (!isNaN(p2Lat) && !isNaN(p2Lon)) setPoint2({ lat: p2Lat, lon: p2Lon });
  };

  const handleReset = () => {
    setLat1(''); setLon1(''); setLat2(''); setLon2('');
    setPoint1(null); setPoint2(null);
    setSelectingPoint('point1');
  };

  const handleCitySelect = (cityIndex: string, point: 'point1' | 'point2') => {
    const idx = parseInt(cityIndex);
    if (isNaN(idx) || idx < 0 || idx >= CITIES.length) return;
    const city = CITIES[idx];
    if (point === 'point1') {
      setPoint1({ lat: city.lat, lon: city.lon });
    } else {
      setPoint2({ lat: city.lat, lon: city.lon });
    }
  };

  const arabCities = CITIES.map((c, i) => ({ ...c, idx: i })).filter(c => c.group === 'arab');
  const worldCities = CITIES.map((c, i) => ({ ...c, idx: i })).filter(c => c.group === 'world');

  const renderCityOptions = () => (
    <>
      <SelectGroup>
        <SelectLabel>{isAr ? 'مدن عربية مشهورة' : 'Famous Arab Cities'}</SelectLabel>
        {arabCities.map(c => (
          <SelectItem key={c.idx} value={c.idx.toString()}>
            {isAr ? c.nameAr : c.nameEn}
          </SelectItem>
        ))}
      </SelectGroup>
      <SelectGroup>
        <SelectLabel>{isAr ? 'مدن عالمية مشهورة' : 'Famous World Cities'}</SelectLabel>
        {worldCities.map(c => (
          <SelectItem key={c.idx} value={c.idx.toString()}>
            {isAr ? c.nameAr : c.nameEn}
          </SelectItem>
        ))}
      </SelectGroup>
    </>
  );

  const findCityIndex = (lat: number | undefined, lon: number | undefined): string | undefined => {
    if (lat === undefined || lon === undefined) return undefined;
    const idx = CITIES.findIndex(c => Math.abs(c.lat - lat) < 0.01 && Math.abs(c.lon - lon) < 0.01);
    return idx >= 0 ? idx.toString() : undefined;
  };

  return (
    <div className="space-y-3" data-testid="control-panel">
      <div className="space-y-2">
        <Label className="text-xs font-medium">{isAr ? 'اختر مدينة البداية (مدن مشهورة)' : 'Select Start City (Famous Cities)'}</Label>
        <Select
          value={findCityIndex(point1?.lat, point1?.lon)}
          onValueChange={(v) => handleCitySelect(v, 'point1')}
        >
          <SelectTrigger className="text-xs" data-testid="select-city-start">
            <SelectValue placeholder={isAr ? 'اختر مدينة...' : 'Select a city...'} />
          </SelectTrigger>
          <SelectContent>
            {renderCityOptions()}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium">{isAr ? 'اختر مدينة الهدف (مدن مشهورة)' : 'Select Destination City (Famous Cities)'}</Label>
        <Select
          value={findCityIndex(point2?.lat, point2?.lon)}
          onValueChange={(v) => handleCitySelect(v, 'point2')}
        >
          <SelectTrigger className="text-xs" data-testid="select-city-destination">
            <SelectValue placeholder={isAr ? 'اختر مدينة...' : 'Select a city...'} />
          </SelectTrigger>
          <SelectContent>
            {renderCityOptions()}
          </SelectContent>
        </Select>
      </div>

      <p className="text-[10px] text-muted-foreground" data-testid="text-city-helper">
        {isAr
          ? 'يمكنك اختيار مدينة مشهورة من القائمة أو إدخال الإحداثيات يدويًا.'
          : 'You can select a famous city from the list or enter coordinates manually.'}
      </p>

      <div className="border-t border-border pt-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 shrink-0" />
          <Label className="text-sm font-medium">{t('control.point1')}</Label>
          <Button
            size="sm"
            variant={selectingPoint === 'point1' ? 'default' : 'secondary'}
            className="text-xs ms-auto"
            onClick={() => setSelectingPoint('point1')}
            data-testid="button-select-point1"
          >
            {selectingPoint === 'point1' ? '...' : t('control.clickMap')}
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-muted-foreground">{t('control.latitude')}</Label>
            <Input
              type="number"
              step="0.0001"
              value={lat1}
              onChange={e => setLat1(e.target.value)}
              placeholder="-90 to 90"
              data-testid="input-lat1"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">{t('control.longitude')}</Label>
            <Input
              type="number"
              step="0.0001"
              value={lon1}
              onChange={e => setLon1(e.target.value)}
              placeholder="-180 to 180"
              data-testid="input-lon1"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
          <Label className="text-sm font-medium">{t('control.point2')}</Label>
          <Button
            size="sm"
            variant={selectingPoint === 'point2' ? 'default' : 'secondary'}
            className="text-xs ms-auto"
            onClick={() => setSelectingPoint('point2')}
            data-testid="button-select-point2"
          >
            {selectingPoint === 'point2' ? '...' : t('control.clickMap')}
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-muted-foreground">{t('control.latitude')}</Label>
            <Input
              type="number"
              step="0.0001"
              value={lat2}
              onChange={e => setLat2(e.target.value)}
              placeholder="-90 to 90"
              data-testid="input-lat2"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">{t('control.longitude')}</Label>
            <Input
              type="number"
              step="0.0001"
              value={lon2}
              onChange={e => setLon2(e.target.value)}
              placeholder="-180 to 180"
              data-testid="input-lon2"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleApply} className="flex-1" data-testid="button-calculate">
          {t('control.calculate')}
        </Button>
        <Button variant="secondary" onClick={handleReset} data-testid="button-reset">
          {t('control.reset')}
        </Button>
      </div>
    </div>
  );
}
