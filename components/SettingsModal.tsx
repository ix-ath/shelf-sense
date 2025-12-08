import React from 'react';
import { X, Palette, Lock, Shield, Info, Trash2, Check, Moon, Sun, Leaf, AlertTriangle } from 'lucide-react';
import { ThemeConfig, ThemeId } from '../types';
import { THEMES, AVAILABLE_TAGS } from '../constants';

interface SettingsModalProps {
  onClose: () => void;
  currentThemeId: ThemeId;
  onChangeTheme: (id: ThemeId) => void;
  onClearHistory: () => void;
  theme: ThemeConfig;
  globalTags: string[];
  onToggleTag: (tag: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  currentThemeId,
  onChangeTheme,
  onClearHistory,
  theme,
  globalTags,
  onToggleTag
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
        <div className={`relative w-full max-w-md ${theme.cardBg} rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300 max-h-[85vh] overflow-y-auto`}>
            
            <div className={`p-6 border-b ${theme.borderColor} flex items-center justify-between sticky top-0 ${theme.cardBg} z-10`}>
                <h2 className={`text-xl font-display font-bold ${currentThemeId === 'dark' ? 'text-white' : 'text-slate-900'}`}>Settings</h2>
                <button onClick={onClose} className={`p-2 rounded-full hover:bg-black/5 ${currentThemeId === 'dark' ? 'text-slate-300' : 'text-slate-500'}`}>
                    <X size={20} />
                </button>
            </div>

            <div className="p-6 space-y-8">
                
                {/* Dietary Profile */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Leaf size={18} className={`text-${theme.primary}-500`} />
                        <div>
                            <h3 className={`text-sm font-bold uppercase tracking-wider ${currentThemeId === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Dietary Profile</h3>
                            <p className="text-xs text-slate-400">Select tags to always apply to your searches.</p>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        {Object.entries(AVAILABLE_TAGS).map(([category, tags]) => (
                            <div key={category}>
                                <h4 className={`text-xs font-bold mb-3 ${currentThemeId === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{category}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map(tag => {
                                        const isActive = globalTags.includes(tag);
                                        return (
                                            <button
                                                key={tag}
                                                onClick={() => onToggleTag(tag)}
                                                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5
                                                    ${isActive 
                                                        ? `bg-${theme.primary}-500 border-${theme.primary}-500 text-white shadow-md shadow-${theme.primary}-200` 
                                                        : `bg-transparent border-slate-200 text-slate-500 hover:border-${theme.primary}-300 hover:text-${theme.primary}-600`
                                                    }
                                                    ${currentThemeId === 'dark' && !isActive ? 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200' : ''}
                                                `}
                                            >
                                                {tag}
                                                {isActive && <Check size={10} strokeWidth={4} />}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Disclaimer */}
                    <div className={`mt-6 p-3 rounded-xl border flex gap-2 ${currentThemeId === 'dark' ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-100'}`}>
                        <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                        <p className={`text-xs leading-snug ${currentThemeId === 'dark' ? 'text-amber-400' : 'text-amber-700'}`}>
                            <strong>Note:</strong> The AI will prioritize these settings, but it is on you to verify the ingredients on the package. AI suggestions may not be 100% accurate.
                        </p>
                    </div>
                </section>

                <hr className={`border-t ${theme.borderColor}`} />

                {/* Theme Selector */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Palette size={18} className={`text-${theme.primary}-500`} />
                        <h3 className={`text-sm font-bold uppercase tracking-wider ${currentThemeId === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Appearance</h3>
                    </div>
                    
                    <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                            {Object.values(THEMES).map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => onChangeTheme(t.id)}
                                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left
                                        ${currentThemeId === t.id 
                                            ? `border-${theme.primary}-500 bg-${theme.primary}-50/10` 
                                            : `border-transparent hover:border-${theme.primary}-100 ${currentThemeId === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}`
                                        }
                                    `}
                                >
                                    <div className={`w-8 h-8 rounded-full shadow-sm flex items-center justify-center shrink-0 ${t.id === 'dark' ? 'bg-slate-900' : `bg-${t.primary}-500`}`}>
                                        {t.id === 'dark' && <Moon size={14} className="text-white" />}
                                        {t.id === 'default' && <Sun size={14} className="text-white" />}
                                    </div>
                                    <div>
                                        <p className={`text-sm font-bold ${currentThemeId === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{t.name}</p>
                                    </div>
                                    {currentThemeId === t.id && <Check size={16} className={`ml-auto text-${theme.primary}-500`} />}
                                </button>
                            ))}
                            </div>
                    </div>
                </section>

                {/* Permissions */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Lock size={18} className={`text-${theme.primary}-500`} />
                        <h3 className={`text-sm font-bold uppercase tracking-wider ${currentThemeId === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Permissions</h3>
                    </div>
                    <div className={`p-4 rounded-xl border ${theme.borderColor} flex items-center justify-between ${currentThemeId === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                <Check size={16} strokeWidth={3} />
                            </div>
                            <div>
                                <p className={`text-sm font-bold ${currentThemeId === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>Camera Access</p>
                                <p className="text-xs text-slate-500">Required to scan shelves</p>
                            </div>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">ACTIVE</span>
                    </div>
                </section>

                {/* AI & Privacy Info */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Shield size={18} className={`text-${theme.primary}-500`} />
                        <h3 className={`text-sm font-bold uppercase tracking-wider ${currentThemeId === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Privacy & Data</h3>
                    </div>
                    <div className={`space-y-4 text-sm ${currentThemeId === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                        <p className="flex gap-3">
                            <Info size={16} className={`mt-0.5 shrink-0 text-${theme.primary}-500`} />
                            <span>
                                <strong>How AI Works:</strong> Your images are analyzed securely using the Google Gemini API. Images are processed in real-time and are <u>not stored</u> on our servers.
                            </span>
                        </p>
                        <p className="flex gap-3">
                            <Info size={16} className={`mt-0.5 shrink-0 text-${theme.primary}-500`} />
                            <span>
                                <strong>Data Retention:</strong> "Recent Finds" are stored locally on this device for your convenience. You can clear this history anytime.
                            </span>
                        </p>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-dashed border-slate-200">
                            <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase">Storage</span>
                            <button onClick={onClearHistory} className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1">
                                <Trash2 size={12} />
                                Clear History
                            </button>
                            </div>
                    </div>
                </section>
            </div>
            
            <div className={`p-4 border-t ${theme.borderColor} ${theme.bg}`}>
                <p className="text-center text-[10px] text-slate-400 font-medium">ShelfSense v1.4 • Powered by Google Gemini</p>
            </div>

        </div>
    </div>
  );
};

export default SettingsModal;