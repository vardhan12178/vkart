import React, { useState, useRef } from "react";
import imageCompression from "browser-image-compression";
import axios from "./axiosInstance";

export default function ProductImageUploader({
  label = "Upload Image",
  mode = "single", // "single" | "multiple"
  limit = 5,
  onUpload,
  initial = [], // For edit mode
}) {
  const [images, setImages] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const compressAndConvert = async (file) => {
    const compressed = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
      fileType: "image/webp",
    });

    // Convert Blob -> base64
    const base64 = await imageCompression.getDataUrlFromFile(compressed);
    const blob = await (await fetch(base64)).blob();

    return blob;
  };

  const uploadToS3 = async (blob) => {
    const fd = new FormData();
    fd.append("image", blob, `product-${Date.now()}.webp`);
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
        onUpload(url);
      } else {
        if (images.length >= limit) {
          alert(`Max ${limit} images allowed.`);
          return;
        }
        const next = [...images, url];
        setImages(next);
        onUpload(next); // return array
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url) => {
    const next = images.filter((i) => i !== url);
    setImages(next);
    onUpload(mode === "single" ? next[0] || "" : next);
  };

  return (
    <div className="space-y-2">
      <label className="font-medium">{label}</label>

      {/* Preview */}
      <div className="flex flex-wrap gap-3">
        {images.map((url) => (
          <div key={url} className="relative">
            <img
              src={url}
              className="h-24 w-24 object-cover rounded border shadow-sm"
              alt=""
            />
            <button
              type="button"
              onClick={() => removeImage(url)}
              className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-1.5"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Upload Button */}
      <button
        type="button"
        onClick={() => fileRef.current.click()}
        className="rounded-lg bg-orange-500 text-white px-4 py-2 text-sm shadow hover:brightness-110"
        disabled={uploading || (mode === "multiple" && images.length >= limit)}
      >
        {uploading ? "Uploading…" : mode === "single" ? "Choose Image" : "Add Image"}
      </button>

      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        ref={fileRef}
        className="hidden"
        onChange={handleFiles}
      />
    </div>
  );
}
