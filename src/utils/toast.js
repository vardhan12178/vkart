import toast from "react-hot-toast";
import { AlertCircle, Check, Info, X } from "lucide-react";

export const showToast = (msg, type = "success") => {
  const tones = {
    success: {
      Icon: Check,
      iconClass: "bg-[#e4e8df] text-[#4e5c47]",
      label: "Added to your edit",
    },
    error: {
      Icon: AlertCircle,
      iconClass: "bg-[#efe1d7] text-[#985233]",
      label: "Please take another look",
    },
    info: {
      Icon: Info,
      iconClass: "bg-[#e8e4dd] text-[#555149]",
      label: "A note from VKart",
    },
  };

  const tone = tones[type] || tones.info;
  const ToastIcon = tone.Icon;

  return toast.custom(
    (currentToast) => (
      <div
        className={`pointer-events-auto flex w-[min(92vw,390px)] items-center gap-3 rounded-[1.05rem] border border-black/10 bg-[#fffdf8] p-3.5 text-[#1d1c19] shadow-[0_18px_55px_rgba(29,28,25,.16)] transition-all duration-300 ${
          currentToast.visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
        }`}
        role={type === "error" ? "alert" : "status"}
      >
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-[0.8rem] ${tone.iconClass}`}>
          <ToastIcon size={17} strokeWidth={1.9} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#8a8379]">{tone.label}</p>
          <p className="mt-1 text-sm font-semibold leading-snug text-[#37342f]">{msg}</p>
        </div>
        <button
          type="button"
          onClick={() => toast.dismiss(currentToast.id)}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[#8b857b] transition-colors hover:bg-black/5 hover:text-[#1d1c19]"
          aria-label="Dismiss notification"
        >
          <X size={15} />
        </button>
      </div>
    ),
    { duration: 2800 }
  );
};
