export default function Modal({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-5xl max-h-[90vh] overflow-hidden relative">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl"
        >
          ✕
        </button>

        {/* Header (optional) */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 z-10">
          <h2 className="text-lg font-semibold">Product Details</h2>
          <p className="text-xs text-gray-500">Fill all information carefully.</p>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[85vh] px-6 py-5">
          {children}
        </div>

      </div>
    </div>
  );
}
