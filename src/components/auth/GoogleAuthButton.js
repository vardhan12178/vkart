import React from "react";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { Dots } from "../ui/Skeleton";
import { fadeInUp } from "./authMotion";

// Google sign-in/sign-up button with a loading veil while the server verifies the credential.
export default function GoogleAuthButton({ onSuccess, onError, loading, text, compact = false }) {
  return (
    <motion.div
      variants={fadeInUp}
      className={compact ? "mb-4 sm:mb-5 flex justify-center" : "mb-5 sm:mb-6"}
    >
      <div
        className={`w-full relative flex justify-center transform transition-transform hover:scale-[1.01] ${
          compact ? "max-w-[400px]" : ""
        }`}
      >
        {loading && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-white/60 backdrop-blur-[2px] rounded-lg text-ink">
            <Dots />
          </div>
        )}
        <GoogleLogin
          onSuccess={onSuccess}
          onError={onError}
          ux_mode="popup"
          theme="outline"
          size="large"
          width="100%"
          shape="rectangular"
          text={text}
        />
      </div>
    </motion.div>
  );
}
