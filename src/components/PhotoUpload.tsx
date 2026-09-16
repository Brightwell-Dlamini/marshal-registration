import React, { useRef, useState, useEffect } from 'react';
import { Camera, Upload, Trash2, RefreshCw, AlertCircle, Check } from 'lucide-react';

interface PhotoUploadProps {
  value?: string;
  onChange: (dataUrl: string) => void;
  staffNumber?: string;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ value, onChange, staffNumber }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async (mode: 'user' | 'environment' = facingMode) => {
    setCameraError(null);
    stopCamera();

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: mode,
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setIsCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((err) => {
          console.warn('Auto-play error:', err);
        });
      }
    } catch (err) {
      console.error('Camera access failed:', err);
      setCameraError('Camera access unavailable or permission denied. Please choose a file instead.');
      setIsCameraActive(false);
    }
  };

  const switchCamera = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    // Standard portrait ratio 3:4 or square passport
    const width = 450;
    const height = 540;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Crop center from video
    const videoRatio = video.videoWidth / video.videoHeight;
    const targetRatio = width / height;

    let sx = 0;
    let sy = 0;
    let sWidth = video.videoWidth;
    let sHeight = video.videoHeight;

    if (videoRatio > targetRatio) {
      sWidth = video.videoHeight * targetRatio;
      sx = (video.videoWidth - sWidth) / 2;
    } else {
      sHeight = video.videoWidth / targetRatio;
      sy = (video.videoHeight - sHeight) / 2;
    }

    ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    onChange(dataUrl);
    stopCamera();
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Compress and scale to reasonable passport size
        const canvas = document.createElement('canvas');
        const maxDimension = 640;
        let w = img.width;
        let h = img.height;

        if (w > h && w > maxDimension) {
          h = Math.round((h * maxDimension) / w);
          w = maxDimension;
        } else if (h > maxDimension) {
          w = Math.round((w * maxDimension) / h);
          h = maxDimension;
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          onChange(compressed);
        }
      };
      if (typeof e.target?.result === 'string') {
        img.src = e.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <span>Official Profile Photograph</span>
          <span className="text-red-500 font-bold">*</span>
        </label>
        {value && (
          <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Photo Attached
          </span>
        )}
      </div>

      {cameraError && (
        <div className="mb-3 p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{cameraError}</span>
        </div>
      )}

      {isCameraActive ? (
        // Live Camera View
        <div className="relative rounded-xl overflow-hidden bg-slate-900 border-2 border-blue-500 shadow-md">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full aspect-[3/4] object-cover"
          />

          {/* Guide Overlay for Passport Portrait */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
            <div className="w-44 h-56 border-2 border-dashed border-white/70 rounded-full flex items-center justify-center">
              <span className="text-white/80 text-[11px] font-medium bg-black/40 px-2 py-0.5 rounded-full">
                Align Head in Oval
              </span>
            </div>
          </div>

          {/* Camera Controls */}
          <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-around">
            <button
              type="button"
              onClick={stopCamera}
              className="px-3 py-1.5 text-xs text-white/90 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-xs"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={capturePhoto}
              className="w-14 h-14 rounded-full bg-white border-4 border-blue-500 shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition"
              title="Capture Photo"
            >
              <div className="w-10 h-10 rounded-full bg-blue-600" />
            </button>

            <button
              type="button"
              onClick={switchCamera}
              className="p-2 text-white/90 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-xs"
              title="Switch Camera (Front/Back)"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : value ? (
        // Photo Preview Card matching official document box
        <div className="relative border-2 border-slate-300 rounded-xl overflow-hidden bg-white p-2.5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-32 h-40 flex-shrink-0 rounded-lg overflow-hidden border border-slate-300 bg-slate-100 shadow-xs">
              <img
                src={value}
                alt="Marshal portrait"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 bg-slate-900/70 py-0.5 text-center text-[9px] text-white font-mono tracking-wider">
                STAFF #{staffNumber || 'PENDING'}
              </div>
            </div>

            <div className="flex-1 text-left w-full">
              <div className="text-xs font-semibold text-slate-800 mb-1">
                Profile Photo Captured
              </div>
              <p className="text-xs text-slate-500 mb-3">
                High-resolution passport photo attached to official marshal profile. Ready for field registration.
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => startCamera()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition"
                >
                  <Camera className="w-3.5 h-3.5 text-blue-600" />
                  Retake Photo
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-600" />
                  Choose Different File
                </button>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-xs font-medium text-red-700 transition ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Dropzone & Action Buttons
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-5 text-center transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
          }`}
        >
          <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
            <Camera className="w-6 h-6" />
          </div>

          <div className="text-sm font-semibold text-slate-800 mb-1">
            Capture or Upload Marshal Photo
          </div>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
            Field officers can take a direct photo using their mobile camera or upload an existing passport photo.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => startCamera()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition"
            >
              <Camera className="w-4 h-4" />
              Open Mobile Camera
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition"
            >
              <Upload className="w-4 h-4 text-slate-500" />
              Upload Image File
            </button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
