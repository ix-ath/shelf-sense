import React, { useRef } from 'react';
import { Camera, Image as ImageIcon, X, Scan, Zap } from 'lucide-react';

interface CameraCaptureProps {
  currentImage: File | null;
  onCapture: (file: File) => void;
  onClear: () => void;
  isLoading: boolean;
  themeColor?: string;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ currentImage, onCapture, onClear, isLoading, themeColor = 'violet' }) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onCapture(e.target.files[0]);
    }
  };

  const triggerCamera = () => {
    cameraInputRef.current?.click();
  };

  const triggerGallery = () => {
    galleryInputRef.current?.click();
  };

  if (currentImage) {
    const imageUrl = URL.createObjectURL(currentImage);
    
    return (
      <div className="relative w-full aspect-[4/3] overflow-hidden rounded-[2rem] shadow-2xl shadow-slate-200 border-4 border-white group">
        <img 
          src={imageUrl} 
          alt="Shelf Preview" 
          className="w-full h-full object-cover" 
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

        <div className="absolute top-4 right-4 z-10">
            <button 
                onClick={onClear}
                disabled={isLoading}
                className="bg-white/20 hover:bg-white/40 text-white p-2.5 rounded-full backdrop-blur-md transition-all active:scale-95"
            >
                <X size={20} />
            </button>
        </div>

        {isLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                 <div className="relative">
                    <div className={`absolute inset-0 bg-${themeColor}-500 rounded-full blur-xl opacity-50 animate-pulse`}></div>
                    <Scan size={48} className="text-white relative z-10 animate-spin-slow duration-[3s]" />
                 </div>
                 <p className="text-white font-display font-medium mt-4 tracking-wide text-sm">Analyzing Shelf...</p>
            </div>
        )}

        <div className="absolute bottom-4 left-4 right-4 z-10">
             <button 
                onClick={triggerCamera}
                disabled={isLoading}
                className="w-full bg-white/90 hover:bg-white text-slate-900 py-3 rounded-2xl font-bold shadow-lg shadow-black/5 flex items-center justify-center gap-2 backdrop-blur-md transition-all active:scale-[0.98]"
            >
                <Camera size={18} />
                Retake Photo
            </button>
        </div>
        
        <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={cameraInputRef}
            onChange={handleFileChange}
            className="hidden"
        />
      </div>
    );
  }

  // Empty State: Viewfinder Style
  return (
    <div className="w-full">
      {/* Input for Camera Button (Forces Camera) */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={cameraInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      
      {/* Input for Gallery Button (Standard Picker) */}
      <input
        type="file"
        accept="image/*"
        ref={galleryInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      
      <button
        onClick={triggerCamera}
        disabled={isLoading}
        className={`
          group relative w-full aspect-[4/3] overflow-hidden rounded-[2.5rem] 
          transition-all duration-300 ease-out 
          ${isLoading 
            ? 'bg-slate-100 cursor-not-allowed' 
            : `bg-slate-100 hover:bg-${themeColor}-50 hover:shadow-inner active:scale-[0.99]`
          }
        `}
      >
        {/* Viewfinder Corners */}
        <div className={`absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-slate-300 rounded-tl-xl group-hover:border-${themeColor}-400 transition-colors`}></div>
        <div className={`absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-slate-300 rounded-tr-xl group-hover:border-${themeColor}-400 transition-colors`}></div>
        <div className={`absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-slate-300 rounded-bl-xl group-hover:border-${themeColor}-400 transition-colors`}></div>
        <div className={`absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-slate-300 rounded-br-xl group-hover:border-${themeColor}-400 transition-colors`}></div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full gap-4">
            <div className={`
                p-6 rounded-full transition-all duration-500
                ${isLoading ? 'bg-slate-200' : `bg-white shadow-xl shadow-slate-200/50 group-hover:scale-110 group-hover:shadow-${themeColor}-200`}
            `}>
                <Camera size={32} className={`text-slate-700 ${!isLoading && `group-hover:text-${themeColor}-600`}`} />
            </div>
            <div className="text-center space-y-1">
                <h3 className={`text-lg font-display font-bold text-slate-800 group-hover:text-${themeColor}-900 transition-colors`}>
                    Capture Shelf
                </h3>
                <p className="text-slate-400 text-sm px-8">
                    Tap to snap a photo of the products
                </p>
            </div>
        </div>
      </button>

      <div className="mt-4 flex justify-center">
        <button 
          onClick={triggerGallery}
          className={`text-slate-500 text-sm font-medium flex items-center gap-2 hover:text-${themeColor}-600 transition-colors py-2 px-4 rounded-full hover:bg-${themeColor}-50`}
        >
          <ImageIcon size={16} />
          <span>Upload from gallery</span>
        </button>
      </div>
    </div>
  );
};

export default CameraCapture;