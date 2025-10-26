import toast from "react-hot-toast";

export const showToast = (msg, type = "success") => {
  const styles = {
    success: { background: "#16a34a", color: "white" },
    error: { background: "#dc2626", color: "white" },
    info: { background: "#2563eb", color: "white" },
  };
  toast(msg, { style: styles[type] || styles.info });
};
