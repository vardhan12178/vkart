import { useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import axios from "../axiosInstance";

const MAX_BYTES = 8 * 1024 * 1024;

// Pick, crop and upload a profile photo.
export default function useAvatarUpload({ notify, onUploaded, onUnauthorized }) {
  const editorRef = useRef(null);
  const [file, setFile] = useState(null);
  const [scale, setScale] = useState(1.2);
  const [open, setOpen] = useState(false);

  const pick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/^image\/(png|jpe?g|webp)$/i.test(f.type) || f.size > MAX_BYTES) {
      notify("error", "Use PNG/JPG/WEBP under 8MB.");
      return;
    }
    setFile(f);
    setOpen(true);
  };

  const upload = async () => {
    if (!editorRef.current || !file) return;
    try {
      const canvas = editorRef.current.getImageScaledToCanvas();
      const blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.92));
      if (!blob) return;
      const compressed = await imageCompression(blob, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      });
      const formData = new FormData();
      formData.append("profileImage", compressed, `profile-${Date.now()}.jpg`);
      const res = await axios.post("/api/profile/upload", formData);
      onUploaded(res.data);
      setFile(null);
      setScale(1.2);
      setOpen(false);
      notify("success", "Profile photo updated!", 1600);
    } catch (e) {
      if (e?.response?.status === 401) {
        await onUnauthorized();
        return;
      }
      notify("error", e?.response?.data?.message || "Failed to upload profile image.", 2200);
    }
  };

  return { editorRef, file, scale, setScale, open, close: () => setOpen(false), pick, upload };
}
