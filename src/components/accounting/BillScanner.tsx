"use client";
import { useState, useRef, useCallback } from "react";
import { Camera, Upload, X, Loader2, ScanLine, Check, RotateCcw, Zap, FileImage } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { extractBillData, BillData } from "@/services/ocr.service";

interface BillScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDataExtracted: (data: BillData) => void;
}

type ScannerStep = "choose" | "camera" | "preview" | "processing" | "result";

export default function BillScanner({ open, onOpenChange, onDataExtracted }: BillScannerProps) {
  const [step, setStep] = useState<ScannerStep>("choose");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [extractedData, setExtractedData] = useState<BillData | null>(null);
  const [error, setError] = useState<string>("");
  const [isCameraActive, setIsCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // ─── Camera Logic ───
  const startCamera = useCallback(async () => {
    try {
      setError("");
      setStep("camera");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error("Camera error:", err);
      setError("Could not access camera. Please check permissions or use the upload option.");
      setStep("choose");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `bill_capture_${Date.now()}.jpg`, { type: "image/jpeg" });
          setImageFile(file);
          setImagePreview(canvas.toDataURL("image/jpeg", 0.9));
          stopCamera();
          setStep("preview");
        }
      },
      "image/jpeg",
      0.9
    );
  }, [stopCamera]);

  // ─── File Upload Logic ───
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setImageFile(file);

    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string);
      setStep("preview");
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) {
      setError("Please drop an image file");
      return;
    }
    setError("");
    setImageFile(file);

    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string);
      setStep("preview");
    };
    reader.readAsDataURL(file);
  }, []);

  // ─── OCR Processing ───
  const processImage = useCallback(async () => {
    if (!imageFile) return;
    setStep("processing");
    setError("");

    try {
      const data = await extractBillData(imageFile);
      if (data.success) {
        setExtractedData(data);
        setStep("result");
      } else {
        setError(data.error || "Failed to extract data from the bill.");
        setStep("preview");
      }
    } catch (err: any) {
      console.error("OCR error:", err);
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to process the bill image.";
      setError(message);
      setStep("preview");
      toast.error("OCR failed: " + message);
    }
  }, [imageFile]);

  // ─── Apply Data ───
  const applyData = useCallback(() => {
    if (extractedData) {
      onDataExtracted(extractedData);
      toast.success("Bill data applied to form!");
      handleClose();
    }
  }, [extractedData, onDataExtracted]);

  // ─── Reset / Close ───
  const handleClose = useCallback(() => {
    stopCamera();
    setStep("choose");
    setImageFile(null);
    setImagePreview("");
    setExtractedData(null);
    setError("");
    onOpenChange(false);
  }, [stopCamera, onOpenChange]);

  const handleRetry = useCallback(() => {
    setImageFile(null);
    setImagePreview("");
    setExtractedData(null);
    setError("");
    setStep("choose");
  }, []);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[540px] p-0 overflow-hidden rounded-xl border-0 shadow-2xl">
        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 px-6 py-4">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold flex items-center gap-2">
              <ScanLine className="w-5 h-5" />
              Bill Scanner
              {extractedData?.source && (
                <span className="ml-auto text-xs font-normal bg-white/20 px-2 py-0.5 rounded-full">
                  via {extractedData.source === "llm" ? "AI" : "Pattern Match"}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm flex items-start gap-2">
              <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* ═══ Step: Choose Mode ═══ */}
          {step === "choose" && (
            <div className="space-y-4">
              <p className="text-gray-500 text-sm text-center">
                Capture or upload a bill image to automatically fill the transaction form
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={startCamera}
                  className="group flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-gray-200 hover:border-purple-400 hover:bg-purple-50/50 transition-all duration-200"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-purple-200 group-hover:scale-110 transition-all">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-800">Take Photo</p>
                    <p className="text-xs text-gray-400 mt-0.5">Use your camera</p>
                  </div>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="group flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg group-hover:shadow-blue-200 group-hover:scale-110 transition-all">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-800">Upload Image</p>
                    <p className="text-xs text-gray-400 mt-0.5">From your device</p>
                  </div>
                </button>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center text-sm text-gray-400 hover:border-purple-300 hover:text-purple-500 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileImage className="w-5 h-5 mx-auto mb-1 opacity-50" />
                or drag & drop a bill image here
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {/* ═══ Step: Camera ═══ */}
          {step === "camera" && (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Viewfinder overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-white/70 rounded-tl-lg" />
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-white/70 rounded-tr-lg" />
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-white/70 rounded-bl-lg" />
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-white/70 rounded-br-lg" />
                </div>
                <p className="absolute bottom-2 left-0 right-0 text-center text-white/60 text-xs">
                  Position the bill within the frame
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { stopCamera(); setStep("choose"); }} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={capturePhoto}
                  disabled={!isCameraActive}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                >
                  <Camera className="w-4 h-4 mr-2" /> Capture
                </Button>
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}

          {/* ═══ Step: Preview ═══ */}
          {step === "preview" && imagePreview && (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                <img
                  src={imagePreview}
                  alt="Bill preview"
                  className="w-full max-h-[350px] object-contain"
                />
                <div className="absolute top-2 right-2">
                  <button
                    onClick={handleRetry}
                    className="bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleRetry} className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" /> Retake
                </Button>
                <Button
                  onClick={processImage}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                >
                  <Zap className="w-4 h-4 mr-2" /> Extract Data
                </Button>
              </div>
            </div>
          )}

          {/* ═══ Step: Processing ═══ */}
          {step === "processing" && (
            <div className="py-12 flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
                </div>
                <div className="absolute -inset-3 rounded-full border-2 border-purple-200 animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                <p className="font-semibold text-gray-800">Scanning your bill...</p>
                <p className="text-sm text-gray-500">
                  Running OCR and extracting data. This may take a few seconds.
                </p>
              </div>
              {imagePreview && (
                <div className="w-32 h-24 rounded-lg overflow-hidden border border-gray-200 opacity-60 relative">
                  <img src={imagePreview} alt="Processing" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent" />
                  {/* Animated scan line */}
                  <div className="absolute inset-x-0 h-0.5 bg-purple-500 animate-bounce top-1/2" />
                </div>
              )}
            </div>
          )}

          {/* ═══ Step: Result ═══ */}
          {step === "result" && extractedData && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Data extracted successfully!</span>
              </div>

              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {/* Extracted Fields */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bill Details</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <ResultField label="Client/Vendor" value={extractedData.clientName} />
                    <ResultField label="VAT No" value={extractedData.vatNo} />
                    <ResultField label="Bill No" value={extractedData.vatBillNo} />
                    <ResultField label="Type" value={extractedData.category} />
                  </div>
                </div>

                {/* Items */}
                {extractedData.items.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Items ({extractedData.items.length})
                    </h4>
                    <div className="space-y-1.5">
                      {extractedData.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm bg-white rounded-md px-3 py-2 border border-gray-100">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 truncate">{item.itemName || "—"}</p>
                            <p className="text-xs text-gray-400">
                              {item.quantity} × {item.price.toFixed(2)}
                            </p>
                          </div>
                          <span className="font-semibold text-gray-700 ml-3">
                            {item.amount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="bg-purple-50 rounded-lg p-3 flex justify-between items-center">
                  <span className="font-semibold text-purple-800">Total Amount</span>
                  <span className="text-xl font-bold text-purple-700">
                    {extractedData.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={handleRetry} className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" /> Scan Again
                </Button>
                <Button
                  onClick={applyData}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  <Check className="w-4 h-4 mr-2" /> Apply to Form
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Helper Component ───
function ResultField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-gray-400 uppercase">{label}</p>
      <p className="text-sm font-medium text-gray-700 truncate">{value || "—"}</p>
    </div>
  );
}
