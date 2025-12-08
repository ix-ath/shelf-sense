import React, { useState, useEffect } from 'react';
import { Search, X, Settings } from 'lucide-react';
import { ThemeConfig, ThemeId } from '../types';

interface SearchFormProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  theme: ThemeConfig;
  currentThemeId: ThemeId;
  globalTags: string[];
  onOpenSettings: () => void;
}

const EXAMPLE_PROMPTS = [
  "Looking for an 18oz family-style baked bean can.",
  "Need a healthy but not gross ranch dressing.",
  "What’s the closest match to a mild chili starter here?",
  "Need a substitute for creamy mushroom soup for a casserole.",
  "Looking for a low-sodium broth alternative.",
  "What’s similar to a sweet cornbread mix on this shelf?",
  "Need a dairy-free option similar to a creamy pasta sauce.",
  "Looking for firm-cooking gluten-free pasta options.",
  "Need a replacement for crushed tomatoes for pasta sauce.",
  "What’s closest to canned chicken for protein?",
  "Need a nut-free spread similar to chocolate hazelnut.",
  "Looking for a hearty canned stew alternative.",
  "What’s a lower-sugar fruit option here?",
  "Looking for a spicy bean dip replacement.",
  "Need a fluffy-texture pancake mix alternative.",
  "Need a gentler swap for all-purpose cleaner.",
  "Looking for a warm neutral paint tone match.",
  "Need something like satin interior paint.",
  "What’s closest to a 3/8” wood drill bit?",
  "Need a medium-grit sanding alternative."
];

const SearchForm: React.FC<SearchFormProps> = ({ 
  searchQuery, 
  setSearchQuery, 
  theme, 
  currentThemeId, 
  globalTags,
  onOpenSettings
}) => {
  const [placeholder, setPlaceholder] = useState("e.g. Describe what you need...");

  useEffect(() => {
    // Pick a random placeholder on mount
    const randomPrompt = EXAMPLE_PROMPTS[Math.floor(Math.random() * EXAMPLE_PROMPTS.length)];
    setPlaceholder(`e.g. ${randomPrompt}`);
  }, []);

  return (
    <div className="space-y-3">
        <div>
            <div className="flex items-center justify-between mb-3 px-1">
                <label className={`block text-sm font-bold font-display ${currentThemeId === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                    2. Describe what you need
                </label>
            </div>
            
            {/* Main Unified Input */}
            <div className="relative group">
                <div className="absolute top-4 left-4 flex items-start pointer-events-none">
                    <Search className={`transition-colors mt-0.5 ${currentThemeId === 'dark' ? 'text-slate-500 group-focus-within:text-white' : `text-slate-400 group-focus-within:text-${theme.primary}-500`}`} size={20} />
                </div>
                <textarea 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={placeholder}
                    rows={3}
                    className={`block w-full pl-12 pr-10 py-4 border-0 rounded-2xl ring-1 shadow-sm focus:ring-2 placeholder:text-slate-400 font-medium transition-all resize-none
                        ${currentThemeId === 'dark' 
                            ? 'bg-slate-900 text-white ring-slate-800 focus:ring-slate-600' 
                            : `bg-white text-slate-900 ring-slate-200 focus:ring-${theme.primary}-500`
                        }
                    `}
                />
                {searchQuery && (
                    <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute top-4 right-3 flex items-center text-slate-300 hover:text-slate-500 transition-colors"
                    >
                    <X size={16} fill="currentColor" className="opacity-50" />
                    </button>
                )}
            </div>

            {/* Active Profile Tags Display */}
            {globalTags.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2 items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Profile:</span>
                    {globalTags.map(tag => (
                        <span 
                            key={tag}
                            className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-lg border flex items-center gap-1
                                ${currentThemeId === 'dark' 
                                    ? `bg-${theme.primary}-500/10 border-${theme.primary}-500/30 text-${theme.primary}-300` 
                                    : `bg-${theme.primary}-50 border-${theme.primary}-100 text-${theme.primary}-600`
                                }
                            `}
                        >
                            {tag}
                        </span>
                    ))}
                    <button 
                        onClick={onOpenSettings}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border border-dashed hover:bg-black/5 transition-colors
                            ${currentThemeId === 'dark' ? 'border-slate-700 text-slate-500' : 'border-slate-300 text-slate-400'}
                        `}
                    >
                        Edit
                    </button>
                </div>
            ) : (
                <div className="mt-2 px-1">
                    <button 
                        onClick={onOpenSettings}
                        className={`text-xs font-medium flex items-center gap-1 hover:underline decoration-dashed underline-offset-4
                             ${currentThemeId === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}
                        `}
                    >
                        <Settings size={12} />
                        Set dietary profile (Vegan, Keto, etc.)
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};

export default SearchForm;