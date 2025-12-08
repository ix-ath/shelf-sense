
import React from 'react';
import { Trash2, Clock, ChevronRight } from 'lucide-react';
import { ScanHistoryItem, ThemeConfig, ThemeId } from '../types';

interface RecentScansProps {
  history: ScanHistoryItem[];
  onLoadItem: (item: ScanHistoryItem) => void;
  onClearHistory: () => void;
  theme: ThemeConfig;
  currentThemeId: ThemeId;
}

const RecentScans: React.FC<RecentScansProps> = ({ 
  history, 
  onLoadItem, 
  onClearHistory, 
  theme, 
  currentThemeId 
}) => {
  return (
    <div className={`pb-10 pt-4 border-t ${theme.borderColor}`}>
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Finds</h3>
            <button onClick={onClearHistory} className="text-slate-300 hover:text-red-400 transition-colors">
            <Trash2 size={14} />
            </button>
        </div>
        
        <div className="space-y-3">
            {history.map((item) => (
            <button 
                key={item.id}
                onClick={() => onLoadItem(item)}
                className={`w-full p-4 rounded-2xl border shadow-sm transition-all text-left group flex items-center gap-3
                ${currentThemeId === 'dark' 
                    ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' 
                    : 'bg-white border-slate-100 hover:shadow-md hover:border-violet-100'
                }
                `}
            >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 
                ${item.summary.matchType === 'EXACT_MATCH' ? 'bg-emerald-100 text-emerald-600' : 
                    item.summary.matchType === 'WRONG_AISLE' ? 'bg-amber-100 text-amber-600' : `bg-${theme.primary}-100 text-${theme.primary}-600`}`}>
                <Clock size={18} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm truncate ${currentThemeId === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{item.summary.productName}</p>
                    <p className="text-xs text-slate-500 truncate">{item.summary.locationDescription}</p>
                </div>
                <ChevronRight size={16} className={`text-slate-300 group-hover:text-${theme.primary}-400`} />
            </button>
            ))}
        </div>
    </div>
  );
};

export default RecentScans;
