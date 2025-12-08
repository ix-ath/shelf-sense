import React, { useState } from 'react';
import { analyzeShelfImage } from './services/geminiService';
import CameraCapture from './components/CameraCapture';
import RecommendationCard from './components/RecommendationCard';
import SettingsModal from './components/SettingsModal';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import RecentScans from './components/RecentScans';
import { AppState, SubstituteRecommendation, ScanHistoryItem } from './types';
import { AlertCircle, ScanLine, ArrowRight } from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import { useScanHistory } from './hooks/useScanHistory';
import { useGlobalPreferences } from './hooks/useGlobalPreferences';

const App: React.FC = () => {
  const { currentThemeId, theme, changeTheme } = useTheme();
  const { history, saveToHistory, clearHistory } = useScanHistory();
  const { globalTags, toggleTag } = useGlobalPreferences();

  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [showSettings, setShowSettings] = useState(false);
  
  // Input
  const [searchQuery, setSearchQuery] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Results
  const [result, setResult] = useState<SubstituteRecommendation | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCapture = (file: File) => {
    setImageFile(file);
    setErrorMsg("");
  };

  const handleClearImage = () => {
    setImageFile(null);
  };

  const handleAnalyze = async () => {
    if (!searchQuery.trim()) {
      setErrorMsg("Please describe what you are looking for.");
      return;
    }
    if (!imageFile) {
        setErrorMsg("We need a photo of the shelf first.");
        return;
    }
    
    setErrorMsg("");
    setAppState(AppState.ANALYZING);

    try {
      // Convert file to Base64
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        
        try {
          const analysisResult = await analyzeShelfImage(base64Data, searchQuery, globalTags);
          setResult(analysisResult);
          saveToHistory(analysisResult);
          setAppState(AppState.RESULT);
        } catch (err) {
            console.error(err);
            setAppState(AppState.ERROR);
            setErrorMsg("Could not analyze the image. Please ensure the shelf is well-lit and try again.");
        }
      };
    } catch (err) {
      setAppState(AppState.ERROR);
      setErrorMsg("Error processing image file.");
    }
  };

  const resetApp = () => {
    setAppState(AppState.IDLE);
    setResult(null);
    setImageFile(null);
    setErrorMsg("");
    setSearchQuery(""); // Auto-clear text on reset as requested
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadHistoryItem = (item: ScanHistoryItem) => {
    setResult(item.fullData);
    setImageFile(null); // We don't store images in history to save space
    setAppState(AppState.RESULT);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setShowSettings(false);
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} pb-24 selection:bg-${theme.primary}-200 selection:text-${theme.primary}-900 transition-colors duration-500`}>
      
      {/* Decorative Background Blob */}
      <div className={`fixed top-0 left-0 right-0 h-64 bg-gradient-to-b from-${theme.primary}-100/30 to-transparent pointer-events-none`} />

      <Header 
        theme={theme}
        currentThemeId={currentThemeId}
        appState={appState}
        onReset={resetApp}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal 
            onClose={() => setShowSettings(false)}
            currentThemeId={currentThemeId}
            onChangeTheme={changeTheme}
            onClearHistory={clearHistory}
            theme={theme}
            globalTags={globalTags}
            onToggleTag={toggleTag}
        />
      )}

      <main className="max-w-md mx-auto px-6 mt-4 relative z-10">
        
        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-6 bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 shadow-sm">
            <div className="bg-red-100 p-2 rounded-full text-red-600">
                 <AlertCircle size={18} />
            </div>
            <p className="text-sm text-red-800 font-medium leading-tight">{errorMsg}</p>
          </div>
        )}

        {appState === AppState.IDLE || appState === AppState.ANALYZING || appState === AppState.ERROR ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            
            {/* Intro Description */}
            <div className="text-center px-2 mb-2">
                <p className={`text-sm leading-relaxed font-medium ${currentThemeId === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    Snap a shelf. We’ll find your item, suggest the best replacement, or offer smarter options in seconds.
                </p>
            </div>
            
            {/* Step 1: Camera */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <label className={`text-sm font-bold font-display ${currentThemeId === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                        1. Capture Shelf
                    </label>
                    {imageFile && (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                            <ScanLine size={10} />
                            Image Ready
                        </span>
                    )}
                </div>
                <CameraCapture 
                    currentImage={imageFile}
                    onCapture={handleCapture} 
                    onClear={handleClearImage}
                    isLoading={appState === AppState.ANALYZING}
                    themeColor={theme.primary}
                />
            </div>

            {/* Step 2: Inputs */}
            <SearchForm 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                theme={theme}
                currentThemeId={currentThemeId}
                globalTags={globalTags}
                onOpenSettings={() => setShowSettings(true)}
            />

            {/* Floating Action Button */}
            <div className={`sticky bottom-6 pt-4 bg-gradient-to-t from-${currentThemeId === 'dark' ? 'slate-950' : '[#F8FAFC]'} via-${currentThemeId === 'dark' ? 'slate-950' : '[#F8FAFC]'} to-transparent pb-2 transition-colors duration-500`}>
                <button
                    onClick={handleAnalyze}
                    disabled={appState === AppState.ANALYZING || (!imageFile && !searchQuery)}
                    className={`
                        w-full py-4 rounded-2xl font-display font-bold text-lg shadow-2xl transition-all flex items-center justify-center gap-3
                        ${appState === AppState.ANALYZING 
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                            : (imageFile && searchQuery) 
                                ? `bg-slate-900 text-white hover:bg-${theme.primary}-600 hover:shadow-${theme.primary}-300 transform active:scale-[0.98]` 
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                        }
                    `}
                >
                    {appState === AppState.ANALYZING ? (
                        <>
                            <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin"></div>
                            <span>Analyzing...</span>
                        </>
                    ) : (
                        <>
                            Find Match
                            <ArrowRight size={20} />
                        </>
                    )}
                </button>
            </div>
            
            {/* Recent Scans History */}
            {history.length > 0 && (
              <RecentScans 
                history={history}
                onLoadItem={loadHistoryItem}
                onClearHistory={clearHistory}
                theme={theme}
                currentThemeId={currentThemeId}
              />
            )}

          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 pb-10">
             {result && (
                <RecommendationCard 
                    data={result} 
                    imageFile={imageFile}
                    onReset={resetApp} 
                    themeColor={theme.primary}
                />
             )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;