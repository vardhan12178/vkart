import React, { useState, useRef, useEffect } from "react";
import imageCompression from "browser-image-compression";
import axios from "./axiosInstance"; // Ensure this path is correct for your setup
import { 
  CloudUploadIcon, 
  XIcon, 
  PhotographIcon, 
  RefreshIcon 
} from "@heroicons/react/outline";

export default function ProductImageUploader({
  label = "Upload Image",
  mode = "single", // "single" | "multiple"
  limit = 5,
  onUpload,
  initial = [],
}) {
  // Ensure images is always an array for consistent rendering
  const [images, setImages] = useState(Array.isArray(initial) ? initial : []);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  // Sync state if initial prop changes (e.g., when editing a different product)
  useEffect(() => {
    setImages(Array.isArray(initial) ? initial : []);
  }, [initial]);

  const compressAndConvert = async (file) => {
    const compressed = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
      fileType: "image/webp",
    });

    // Convert Blob -> base64 -> Blob (Standardizes format)
    const base64 = await imageCompression.getDataUrlFromFile(compressed);
    const blob = await (await fetch(base64)).blob();
    return blob;
  };

  const uploadToS3 = async (blob) => {
    const fd = new FormData();
    // Unique filename
    fd.append("image", blob, `product-${Date.now()}.webp`); 
    
    // Adjust your API endpoint here
    const res = await axios.post("/api/admin/products/upload", fd); 
    return res.data.url;
  };

  const handleFiles = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) {
      alert("Only PNG, JPG, JPEG, WEBP allowed.");
      return;
    }

    try {
      setUploading(true);

      const blob = await compressAndConvert(file);
      const url = await uploadToS3(blob);

      if (mode === "single") {
        setImages([url]);
        onUpload(url); // Return string for single
      } else {
        if (images.length >= limit) {
          alert(`Max ${limit} images allowed.`);
          return;
        }
        const next = [...images, url];
        setImages(next);
        onUpload(next); // Return array for multiple
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Image upload failed. Check console.");
    } finally {
      setUploading(false);
      // Reset input so same file can be selected again if needed
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeImage = (urlToRemove) => {
    const next = images.filter((url) => url !== urlToRemove);
    setImages(next);
    onUpload(mode === "single" ? "" : next);
  };

  const isLimitReached = mode === "multiple" && images.length >= limit;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
        {mode === "multiple" && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
            {images.length} / {limit}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {/* Render Existing Images */}
        {images.map((url, idx) => (
          <div
            key={url + idx}
            className="group relative aspect-square rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden"
          >
            <img
              src={url}
              alt="Product"
              className="h-full w-full object-contain p-1"
            />
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

            {/* Remove Button */}
            <button
              type="button"
              onClick={() => removeImage(url)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-white text-slate-400 hover:text-red-600 hover:bg-red-50 shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100"
              title="Remove Image"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        ))}

        {/* Upload Button / Dropzone */}
        {(!isLimitReached && (mode === "multiple" || images.length === 0)) && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className={`
              relative aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all group
              ${uploading 
                ? "bg-slate-50 border-slate-200 cursor-not-allowed" 
                : "border-slate-300 hover:border-slate-400 hover:bg-slate-50 cursor-pointer active:scale-95"
              }
            `}
          >
            {uploading ? (
              <>
                <RefreshIcon className="h-8 w-8 text-orange-500 animate-spin" />
                <span className="text-xs font-bold text-slate-400 animate-pulse">Processing...</span>
              </>
            ) : (
              <>
                <div className="p-3 rounded-full bg-slate-100 group-hover:bg-white group-hover:shadow-sm transition-all">
                   <CloudUploadIcon className="h-6 w-6 text-slate-400 group-hover:text-slate-600" />
                </div>
                <div className="text-center px-2">
                  <span className="block text-xs font-bold text-slate-600 group-hover:text-slate-900">
                    Click to Upload
                  </span>
                  {mode === "single" && (
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      Supports: JPG, WEBP
                    </span>
                  )}
                </div>
              </>
            )}
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileRef}
        onChange={handleFiles}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />
    </div>
  );
}