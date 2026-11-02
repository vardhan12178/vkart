import React from "react";
import AvatarEditor from "react-avatar-editor";

export default function AvatarCropModal({ avatar }) {
  const { open, file, editorRef, scale, setScale, close, upload } = avatar;
  if (!open || !file) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in">
      <div className="bg-white p-6 rounded-3xl shadow-2xl space-y-6 w-[320px]">
        <h3 className="text-lg font-bold text-center text-ink">Adjust Photo</h3>

        <div className="flex justify-center">
          <AvatarEditor
            ref={editorRef}
            image={file}
            width={200}
            height={200}
            border={20}
            borderRadius={120}
            scale={scale}
            rotate={0}
            className="rounded-full bg-tint"
          />
        </div>

        <div>
          <label
            htmlFor="avatar-zoom"
            className="text-xs font-bold text-muted mb-2 block uppercase tracking-wider text-center"
          >
            Zoom
          </label>
          <input
            id="avatar-zoom"
            type="range"
            min="1"
            max="2"
            step="0.01"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-line rounded-lg appearance-none cursor-pointer accent-gray-900"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={close}
            className="flex-1 py-2.5 rounded-xl border border-line-strong text-muted font-bold text-sm hover:bg-sand transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={upload}
            className="flex-1 py-2.5 rounded-xl bg-ink text-white font-bold text-sm shadow-md hover:bg-black transition-transform active:scale-95"
          >
            Save Photo
          </button>
        </div>
      </div>
    </div>
  );
}
