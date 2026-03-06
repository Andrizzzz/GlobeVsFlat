import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppProvider, useAppContext } from './context/AppContext';
import GlobeView from './components/GlobeView';
import FlatMapView from './components/FlatMapView';
import MercatorView from './components/MercatorView';
import ControlPanel from './components/ControlPanel';
import DistancePanel from './components/DistancePanel';
import QiblaPanel from './components/QiblaPanel';
import FlightsPanel from './components/FlightsPanel';
import MapSelector from './components/MapSelector';
import ComparisonTable from './components/ComparisonTable';
import KaabaIcon from './components/KaabaIcon';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/toaster';
import { Globe, Compass, Plane, Layers, Sun, Moon, Languages, BarChart3, RotateCcw, Settings } from 'lucide-react';
import './i18n';

function AppContent() {
  const { t, i18n } = useTranslation();
  const { isDark, toggleTheme, activeTab, setActiveTab, comparisonMode, setComparisonMode, mapType, resetAll } = useAppContext();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  const showMercator = mapType === 'mercator';

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground">
      <header className="border-b border-border bg-card shrink-0">
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <Globe className="w-6 h-6 text-primary shrink-0" />
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold leading-tight truncate" data-testid="text-app-title">
                {t('app.titleLine1')}
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-primary/80 leading-tight truncate" data-testid="text-app-title-line2">
                {t('app.titleLine2')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              size="sm"
              variant="destructive"
              onClick={resetAll}
              className="text-xs"
              data-testid="button-reset-all"
            >
              <RotateCcw className="w-4 h-4 me-1" />
              <span className="hidden sm:inline">{t('app.resetAll')}</span>
            </Button>
            <Button
              size="sm"
              variant={comparisonMode ? 'default' : 'secondary'}
              onClick={() => setComparisonMode(!comparisonMode)}
              className="text-xs"
              data-testid="button-toggle-comparison"
            >
              <BarChart3 className="w-4 h-4 me-1" />
              <span className="hidden sm:inline">{t('comparison.toggle')}</span>
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={toggleLanguage}
              className="hidden sm:inline-flex"
              data-testid="button-toggle-language"
            >
              <Languages className="w-4 h-4 me-1" />
              {t('app.language')}
            </Button>
            <Button
              size="icon"
              variant="secondary"
              onClick={toggleLanguage}
              className="sm:hidden"
              data-testid="button-toggle-language-mobile"
            >
              <Languages className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              onClick={toggleTheme}
              data-testid="button-toggle-theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      <div id="main-scroll" className="flex flex-row flex-1 overflow-auto">
        <div className="w-40 md:w-80 md:order-first shrink-0 border-b md:border-b-0 md:border-e border-border bg-card overflow-y-auto">
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="md:hidden w-full flex items-center justify-center gap-2 py-2 bg-card border-b border-border text-sm font-medium text-muted-foreground"
            data-testid="button-mobile-settings"
          >
            <Settings className="w-4 h-4" />
            {t('app.settings')}
          </button>
          {sidebarOpen && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
              <TabsList className="grid grid-cols-4 m-2 shrink-0">
                <TabsTrigger value="distance" className="text-xs gap-1" data-testid="tab-distance">
                  <Compass className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">{t('distance.title').split(' ')[0]}</span>
                </TabsTrigger>
                <TabsTrigger value="qibla" className="text-xs gap-1" data-testid="tab-qibla">
                  <KaabaIcon className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">{t('qibla.title').split(' ')[0]}</span>
                </TabsTrigger>
                <TabsTrigger value="flights" className="text-xs gap-1" data-testid="tab-flights">
                  <Plane className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">{t('flights.title').split(' ')[0]}</span>
                </TabsTrigger>
                <TabsTrigger value="map" className="text-xs gap-1" data-testid="tab-map">
                  <Layers className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">{t('mapSelector.title').split(' ')[0]}</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto p-3">
                <TabsContent value="distance" className="mt-0 space-y-4">
                  <h2 className="text-sm font-semibold">{t('distance.title')}</h2>
                  <ControlPanel />
                  <div className="border-t border-border pt-3">
                    <DistancePanel />
                  </div>
                  {comparisonMode && (
                    <div className="border-t border-border pt-3">
                      <h3 className="text-xs font-semibold mb-2">{t('comparison.title')}</h3>
                      <ComparisonTable />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="qibla" className="mt-0 space-y-4">
                  <h2 className="text-sm font-semibold">{t('qibla.title')}</h2>
                  <QiblaPanel />
                </TabsContent>

                <TabsContent value="flights" className="mt-0 space-y-4">
                  <h2 className="text-sm font-semibold">{t('flights.title')}</h2>
                  <FlightsPanel />
                  {comparisonMode && (
                    <div className="border-t border-border pt-3">
                      <h3 className="text-xs font-semibold mb-2">{t('comparison.title')}</h3>
                      <ComparisonTable />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="map" className="mt-0 space-y-4">
                  <h2 className="text-sm font-semibold">{t('mapSelector.title')}</h2>
                  <MapSelector />
                </TabsContent>
              </div>
            </Tabs>
          )}
        </div>

        <div className="flex-1 flex flex-col min-w-0 overflow-auto">
          <div className={`${comparisonMode ? 'flex flex-col sm:flex-row' : 'flex flex-col'}`}>
            <div className={`${comparisonMode ? 'sm:flex-1' : ''} relative border-b border-border h-[45vh] md:h-[50vh] shrink-0 overflow-hidden`}>
              <GlobeView />
            </div>
            <div className={`${comparisonMode ? 'sm:flex-1' : ''} relative border-b border-border h-[45vh] md:h-[50vh] shrink-0 overflow-hidden`}>
              {showMercator ? <MercatorView /> : <FlatMapView />}
            </div>
            {comparisonMode && (
              <div className="sm:flex-1 relative border-b border-border h-[45vh] md:h-[50vh] shrink-0 overflow-hidden">
                <MercatorView />
              </div>
            )}
          </div>
        </div>
      </div>

      <a
        href="https://www.facebook.com/MS98IQ"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-3 end-3 z-50 px-4 py-2.5 rounded-lg bg-gray-900 backdrop-blur-sm text-white text-xs font-medium leading-relaxed select-none pointer-events-auto"
        data-testid="link-watermark"
      >
        <span className="block text-gray-400 text-[10px]">الموقع من صنع</span>
        <span className="block font-semibold">Mustafa Hasan</span>
      </a>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
      <Toaster />
    </AppProvider>
  );
}

export default App;


