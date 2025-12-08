import React from 'react';
import { ShoppingBag, Home, Settings } from 'lucide-react';
import { ThemeConfig, ThemeId, AppState } from '../types';

interface HeaderProps {
  theme: ThemeConfig;
  currentThemeId: ThemeId;
  appState: AppState;
  onReset: () => void;
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, currentThemeId, appState, onReset, onOpenSettings }) => {
  return (
    <header className={`sticky top-0 z-40 px-6 pt-4 pb-4 mb-2 backdrop-blur-md ${theme.headerBg} border-b ${theme.borderColor} transition-colors duration-500`}>
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={onReset}>
            <div className={`bg-${theme.primary}-600 text-white p-2.5 rounded-2xl shadow-lg shadow-${theme.primary}-200 transition-colors`}>
                <ShoppingBag size={22} strokeWidth={2.5} />
            </div>
            <div>
                <h1 className={`text-xl font-display font-bold ${currentThemeId === 'dark' ? 'text-white' : 'text-slate-900'} tracking-tight leading-none`}>ShelfSense</h1>
                <p className={`text-[10px] font-bold ${currentThemeId === 'dark' ? 'text-slate-400' : 'text-slate-400'} mt-1`}>Find the perfect match.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Home / Reset Button */}
            {appState !== AppState.IDLE && (
              <button 
                onClick={onReset}
                className={`p-2 ${theme.cardBg} ${currentThemeId === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-400 hover:text-slate-900'} rounded-full shadow-sm border ${theme.borderColor} transition-colors`}
                aria-label="Home"
              >
                <Home size={20} />
              </button>
            )}
            
            {/* Settings Button */}
            <button 
                onClick={onOpenSettings}
                className={`p-2 ${theme.cardBg} ${currentThemeId === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-400 hover:text-slate-900'} rounded-full shadow-sm border ${theme.borderColor} transition-colors`}
            >
                <Settings size={20} />
            </button>
          </div>
        </div>
      </header>
  );
};

export default Header;