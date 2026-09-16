import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, PenTool, Check, Undo2 } from 'lucide-react';

interface SignaturePadProps {
  value?: string;
  onChange: (dataUrl: string) => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ value, onChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(!!value);
  const historyRef = useRef<ImageData[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI scaling
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.strokeStyle = '#0f172a'; // Ink navy/black
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // If initial value exists and is an image, draw it
    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasSignature(true);
      };
      img.src = value;
    }
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e && e.touches[0]) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    const mouseE = e as React.MouseEvent;
    return {
      x: mouseE.clientX - rect.left,
      y: mouseE.clientY - rect.top,
    };
  };

  const saveHistoryState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      historyRef.current.push(imgData);
      if (historyRef.current.length > 10) historyRef.current.shift();
    } catch (e) {
      // Ignored
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    saveHistoryState();
    const { x, y } = getPos(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onChange(dataUrl);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    historyRef.current = [];
    setHasSignature(false);
    onChange('');
  };

  const undoLast = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (historyRef.current.length > 0) {
      const prev = historyRef.current.pop();
      if (prev) {
        ctx.putImageData(prev, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        onChange(dataUrl);
        setHasSignature(true);
        return;
      }
    }
    clearCanvas();
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <PenTool className="w-3.5 h-3.5 text-blue-700" />
          <span>Member's Signature (Sign on Screen)</span>
          <span className="text-red-500 font-bold">*</span>
        </label>
        {hasSignature && (
          <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Signature Captured
          </span>
        )}
      </div>

      <div className="relative border-2 border-slate-300 rounded-xl overflow-hidden bg-white shadow-xs touch-none">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-32 bg-white cursor-crosshair block"
        />

        {/* Signature Line & Guidelines */}
        <div className="absolute inset-x-6 bottom-7 border-b border-dashed border-slate-300 pointer-events-none flex justify-between">
          <span className="text-[10px] text-slate-400 select-none uppercase tracking-wider -translate-y-4">
            Sign inside this box
          </span>
          <span className="text-[10px] text-slate-400 select-none -translate-y-4">
            Official Endorsement
          </span>
        </div>

        {/* Action Controls */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5">
          <button
            type="button"
            onClick={undoLast}
            disabled={!hasSignature}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition"
            title="Undo stroke"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={clearCanvas}
            disabled={!hasSignature}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:pointer-events-none transition"
            title="Clear signature"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>
      <p className="mt-1 text-[11px] text-slate-500">
        Field officers can pass the device to the Marshal to sign with their finger or stylus.
      </p>
    </div>
  );
};
