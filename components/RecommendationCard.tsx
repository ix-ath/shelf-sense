import React, { useEffect, useState } from 'react';
import { SubstituteRecommendation, ShelfItemLocation } from '../types';
import { MapPin, Check, Leaf, Info, ArrowRight, AlertTriangle, ScanLine, ShieldCheck, ExternalLink, ChevronDown, ChevronUp, Activity, XCircle, Plus } from 'lucide-react';

interface RecommendationCardProps {
  data: SubstituteRecommendation;
  imageFile: File | null;
  onReset: () => void;
  themeColor?: string;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ data, imageFile, onReset, themeColor = 'violet' }) => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  
  // State to track which item we are currently "Locating" (Main vs Supplement)
  // -1 means Main Item, 0+ means index in supplementaryItems array
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(-1);

  const isWrongAisle = data.matchType === 'WRONG_AISLE';
  const isExactMatch = data.matchType === 'EXACT_MATCH';
  
  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImageSrc(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImageSrc('');
    }
  }, [imageFile]);

  // Determine which item data to display
  const activeItem: ShelfItemLocation = selectedItemIndex === -1 
    ? data 
    : (data.supplementaryItems && data.supplementaryItems[selectedItemIndex]) || data;

  const isViewingMain = selectedItemIndex === -1;
  const isViewingSupplement = !isViewingMain;

  // Color Logic
  const bgStyle = isViewingMain 
    ? (isExactMatch ? 'bg-emerald-500' : isWrongAisle ? 'bg-amber-500' : `bg-${themeColor}-600`)
    : 'bg-cyan-500';

  const dotColor = isViewingMain
    ? (isExactMatch ? 'bg-emerald-500' : `bg-${themeColor}-600`)
    : 'bg-cyan-500';
    
  const ringColor = isViewingMain
    ? (isExactMatch ? 'bg-emerald-500/30' : `bg-${themeColor}-600/30`)
    : 'bg-cyan-500/30';

  const borderColor = isViewingMain
    ? (isExactMatch ? 'border-emerald-400' : `border-${themeColor}-400`)
    : 'border-cyan-400';

  return (
    <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-12 duration-700">
      
      {/* Header Image Area if available */}
      {imageSrc && !isWrongAisle ? (
           <div className="relative w-full aspect-video bg-slate-900 transition-all duration-500">
              <img 
                src={imageSrc} 
                alt="Shelf Analysis" 
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
              
              {activeItem.boundingBox && (
                <div 
                  className={`absolute border-[2px] rounded-xl backdrop-blur-[1px] ${borderColor} shadow-sm transition-all duration-500 ease-in-out`}
                  style={{
                    top: `${activeItem.boundingBox.ymin}%`,
                    left: `${activeItem.boundingBox.xmin}%`,
                    height: `${activeItem.boundingBox.ymax - activeItem.boundingBox.ymin}%`,
                    width: `${activeItem.boundingBox.xmax - activeItem.boundingBox.xmin}%`,
                  }}
                >
                    {/* The "Match Dot" - Centered Locator */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                        <div className={`w-12 h-12 rounded-full ${ringColor} animate-ping absolute`}></div>
                        <div className={`w-4 h-4 rounded-full ${dotColor} shadow-[0_0_10px_rgba(0,0,0,0.2)] border-2 border-white z-10`}></div>
                    </div>

                    {/* Badge Pill */}
                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm whitespace-nowrap flex items-center gap-1 ${dotColor} transition-colors duration-300`}>
                        {isViewingMain ? (isExactMatch ? 'FOUND IT' : 'BEST MATCH') : 'ALSO FOUND'}
                    </div>
                </div>
              )}
           </div>
      ) : (
        // No Image State (e.g. History View)
        <div className={`w-full h-32 ${bgStyle} relative overflow-hidden`}>
           <div className="absolute inset-0 bg-white/10"></div>
           <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        </div>
      )}

      {/* Content Body */}
      <div className={`px-8 pb-8 ${imageSrc && !isWrongAisle ? '-mt-6 relative z-10' : '-mt-12 relative z-10'}`}>
        
        {/* Status Badge */}
        <div className="flex items-center justify-between mb-4">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border bg-white ${
              isViewingSupplement 
                ? 'border-cyan-100 text-cyan-700'
                : isExactMatch ? 'border-emerald-100 text-emerald-700' 
                : isWrongAisle ? 'border-amber-100 text-amber-700' 
                : `border-${themeColor}-100 text-${themeColor}-700`
            }`}>
                {isViewingSupplement ? <Plus size={14} strokeWidth={3} /> : (isExactMatch ? <Check size={14} strokeWidth={3} /> : isWrongAisle ? <AlertTriangle size={14} strokeWidth={3} /> : <ScanLine size={14} strokeWidth={3} />)}
                {isViewingSupplement ? 'Supplementary Item' : (isWrongAisle ? 'Location Alert' : isExactMatch ? 'Exact Match' : 'Smart Substitute')}
            </div>
            {!isWrongAisle && isViewingMain && (
                <div className={`text-sm font-display font-bold ${imageSrc ? 'text-slate-400' : 'text-slate-900 bg-white/50 px-2 py-1 rounded-lg'}`}>
                    {data.matchScore}% Match
                </div>
            )}
        </div>

        <h2 className="text-3xl font-display font-bold text-slate-900 leading-tight mb-2 transition-all duration-300">
            {isWrongAisle ? "Wrong Aisle Detected" : activeItem.productName}
        </h2>

        {/* Verification Link - Only show for Main Item */}
        {isViewingMain && data.verifiedSources && data.verifiedSources.length > 0 && !isWrongAisle && (
          <div className="mb-6 flex items-center gap-2">
             <ShieldCheck size={14} className="text-emerald-500" />
             <a 
               href={data.verifiedSources[0].uri} 
               target="_blank" 
               rel="noopener noreferrer" 
               className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
             >
               Verified Online
               <ExternalLink size={10} />
             </a>
          </div>
        )}
        
        {/* Fallback spacer */}
        {(!data.verifiedSources || data.verifiedSources.length === 0 || !isViewingMain) && <div className="mb-6"></div>}

        {/* Essential Info - Always Visible */}
        <div className="space-y-4">
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex gap-4 transition-colors duration-500">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bgStyle} text-white transition-colors duration-500`}>
                    <MapPin size={20} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">Location</h3>
                    <p className="text-slate-600 leading-snug">
                        {activeItem.locationDescription}
                    </p>
                    {!isWrongAisle && (
                        <div className="flex flex-wrap gap-2 mt-3">
                             <span className="text-[10px] font-bold bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-500 uppercase tracking-wide">
                                {activeItem.visualCues.color}
                             </span>
                             <span className="text-[10px] font-bold bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-500 uppercase tracking-wide">
                                {activeItem.visualCues.shelfPosition}
                             </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Supplementary Items Selector */}
            {data.supplementaryItems && data.supplementaryItems.length > 0 && (
                <div className="mt-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Complete the recipe</p>
                    <div className="flex flex-wrap gap-2">
                         {/* Main Item Button */}
                         <button
                            onClick={() => setSelectedItemIndex(-1)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-300 flex items-center gap-2
                                ${isViewingMain 
                                    ? `bg-${themeColor}-600 text-white border-${themeColor}-600 shadow-md shadow-${themeColor}-200` 
                                    : `bg-white text-slate-500 border-slate-200 hover:border-${themeColor}-200 hover:text-${themeColor}-600`
                                }
                            `}
                         >
                            {isViewingMain && <Check size={12} strokeWidth={3} />}
                            {data.productName} (Main)
                         </button>
                         
                         {/* Supplement Buttons */}
                         {data.supplementaryItems.map((item, idx) => {
                             const isSelected = selectedItemIndex === idx;
                             return (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedItemIndex(idx)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-300 flex items-center gap-2
                                        ${isSelected 
                                            ? 'bg-cyan-500 text-white border-cyan-500 shadow-md shadow-cyan-200' 
                                            : 'bg-white text-slate-500 border-slate-200 hover:border-cyan-200 hover:text-cyan-600'
                                        }
                                    `}
                                >
                                    {isSelected && <Check size={12} strokeWidth={3} />}
                                    {item.productName}
                                </button>
                             )
                         })}
                    </div>
                </div>
            )}
        </div>

        {/* Collapsible Analysis Section */}
        <div className="mt-4">
            <button 
                onClick={() => setShowAnalysis(!showAnalysis)}
                className="w-full flex items-center justify-between text-slate-500 text-sm font-bold py-3 px-1 hover:text-slate-800 transition-colors"
            >
                <span className="flex items-center gap-2">
                    <Activity size={16} />
                    View Analysis & Debug Info
                </span>
                {showAnalysis ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showAnalysis && (
                <div className="animate-in slide-in-from-top-2 duration-300 space-y-4 mt-2">
                    {/* AI Reasoning */}
                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-slate-200 text-slate-600`}>
                            <Leaf size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 mb-1">Why this item?</h3>
                            <p className="text-slate-600 leading-snug mb-3">
                                {activeItem.reasoning}
                            </p>
                            
                            {/* Only show health tags for main item, as supplements might not have full data */}
                            {isViewingMain && data.healthHighlights.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {data.healthHighlights.map((tag, idx) => (
                                        <span key={idx} className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded-lg">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Nutritional Note - Main Only */}
                    {isViewingMain && data.nutritionalComparison && (
                        <div className="px-2 flex gap-3 items-start opacity-70">
                            <Info size={14} className="text-slate-400 mt-1 shrink-0" />
                            <p className="text-xs text-slate-500 leading-relaxed">
                                {data.nutritionalComparison}
                            </p>
                        </div>
                    )}

                    {/* Debug / Stats Section - Main Only */}
                    {isViewingMain && (
                        <div className="mt-6 border-t border-slate-100 pt-6">
                             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Troubleshooting Data</h4>
                             
                             <div className="grid grid-cols-2 gap-4 mb-4">
                                 <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                     <span className="block text-2xl font-display font-bold text-slate-800">{data.detectedItemCount || 0}</span>
                                     <span className="text-[10px] font-bold text-slate-400 uppercase">Items Analyzed</span>
                                 </div>
                                 <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                     <span className="block text-2xl font-display font-bold text-slate-800">{data.otherCandidates?.length || 0}</span>
                                     <span className="text-[10px] font-bold text-slate-400 uppercase">Alternatives</span>
                                 </div>
                             </div>

                             {data.otherCandidates && data.otherCandidates.length > 0 && (
                                 <div className="space-y-2">
                                     <p className="text-xs font-bold text-slate-500">Rejected Candidates:</p>
                                     {data.otherCandidates.map((candidate, idx) => (
                                         <div key={idx} className="flex items-start gap-2 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                                             <XCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                                             <div>
                                                 <span className="font-bold text-slate-700 block">{candidate.name}</span>
                                                 <span className="text-slate-500">{candidate.reasonExcluded}</span>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             )}
                        </div>
                    )}
                </div>
            )}
        </div>

        <button 
            onClick={onReset}
            className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl font-display font-bold text-lg hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200"
        >
            Scan Next Item
            <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default RecommendationCard;