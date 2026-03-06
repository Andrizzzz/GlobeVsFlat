import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext, type MapType } from '../context/AppContext';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';

export default function MapSelector() {
  const { t } = useTranslation();
  const { mapType, setMapType, customImages, addCustomImage, removeCustomImage, activeCustomImage, setActiveCustomImage } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mapOptions: { value: MapType; label: string }[] = [
    { value: 'azimuthal', label: t('mapSelector.azimuthalSatellite') },
    { value: 'grid', label: t('mapSelector.azimuthalGrid') },
    { value: 'mercator', label: t('mapSelector.mercator') },
    { value: 'custom', label: t('mapSelector.customImage') },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === 'string') {
        addCustomImage(result);
      }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-3" data-testid="map-selector">
      <div className="grid grid-cols-2 gap-1.5">
        {mapOptions.map(opt => (
          <Button
            key={opt.value}
            size="sm"
            variant={mapType === opt.value ? 'default' : 'secondary'}
            className="text-xs"
            onClick={() => setMapType(opt.value)}
            data-testid={`button-map-${opt.value}`}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {mapType === 'custom' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              data-testid="button-upload-image"
            >
              <Upload className="w-3 h-3 me-1" />
              {t('mapSelector.uploadImage')}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              data-testid="input-upload-file"
            />
          </div>
          {customImages.length > 0 ? (
            <div className="space-y-1">
              {customImages.map((img, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 p-1.5 rounded-md cursor-pointer text-xs ${i === activeCustomImage ? 'bg-primary/10 border border-primary/30' : 'bg-muted/30'}`}
                  onClick={() => setActiveCustomImage(i)}
                  data-testid={`custom-image-${i}`}
                >
                  <img src={img} className="w-8 h-8 rounded object-cover" alt="" />
                  <span className="flex-1 truncate">Image {i + 1}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={(e) => { e.stopPropagation(); removeCustomImage(i); }}
                    data-testid={`button-remove-image-${i}`}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">{t('mapSelector.noImages')}</p>
          )}
        </div>
      )}

      <div className="bg-muted/50 rounded-md p-2 text-xs text-muted-foreground" data-testid="text-map-note">
        {t('mapSelector.note')}
      </div>
    </div>
  );
}
