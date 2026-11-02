import React from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { fadeInUp, staggerContainer } from "./authMotion";

const LOGO_BADGE =
  "bg-gradient-to-tr from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white";

// The two-panel frame shared by sign in and register: brand panel on the left, form on the right.
// `compact` is the register variant: narrower brand panel and a scrollable form column.
export default function AuthLayout({
  metaTitle,
  metaDescription,
  headline,
  title,
  subtitle,
  compact = false,
  children,
}) {
  const form = (
    <>
      <div className={`lg:hidden flex justify-center ${compact ? "mb-6" : "mb-6 sm:mb-8"}`}>
        <div className={`h-10 w-10 ${LOGO_BADGE} shadow-lg`}>
          <ShoppingCart className="h-6 w-6" />
        </div>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className={`w-full mx-auto ${compact ? "max-w-md" : "max-w-sm"}`}
      >
        <motion.div
          variants={fadeInUp}
          className={`text-center ${compact ? "mb-5 sm:mb-6" : "mb-6 sm:mb-8"}`}
        >
          <h1 className="font-editorial text-4xl sm:text-5xl font-normal text-[#1d1c19] tracking-[-0.035em]">
            {title}
          </h1>
          <p className={`text-[#777269] ${compact ? "mt-2 text-xs sm:text-sm" : "mt-3 text-sm"}`}>
            {subtitle}
          </p>
        </motion.div>
        {children}
      </motion.div>
    </>
  );

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
      </Helmet>

      <div className="premium-page premium-auth min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#f6f3ed] relative overflow-hidden">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className={`premium-auth-shell relative w-full max-w-[1180px] bg-[#fffdf8] rounded-[1.5rem] shadow-[0_30px_80px_rgba(29,28,25,.12)] flex overflow-hidden border border-black/[0.06] ${
            compact ? "min-h-[720px]" : "min-h-[650px] lg:min-h-[720px]"
          }`}
        >
          <div
            className={`premium-auth-visual hidden lg:flex relative flex-col justify-between bg-[#ded2c2] p-8 overflow-hidden ${
              compact ? "w-5/12 xl:p-10" : "w-1/2 xl:p-12"
            }`}
          >
            <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className={`h-10 w-10 ${LOGO_BADGE} shadow-lg shadow-orange-500/20`}>
                  <ShoppingCart className="h-6 w-6" />
                </div>
                <span className="text-2xl font-bold text-gray-900 tracking-tight">VKart.</span>
              </div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-editorial text-4xl xl:text-5xl font-normal text-[#1d1c19] leading-[0.98] tracking-[-0.03em]"
              >
                {headline}
              </motion.h2>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative z-10 flex-1 flex items-center justify-center py-8"
            >
              <img
                src="/vkart-editorial-hero.webp"
                alt="A curated selection of VKart products"
                className={`w-full rounded-[1.25rem] object-cover object-[68%_center] shadow-2xl ${
                  compact ? "h-[300px] xl:h-[360px]" : "h-[310px] xl:h-[380px]"
                }`}
              />
            </motion.div>
          </div>

          {compact ? (
            <div className="premium-auth-form w-full lg:w-7/12 bg-[#fffdf8] flex flex-col relative">
              <div className="absolute inset-0 overflow-y-auto no-scrollbar">
                <div className="min-h-full flex flex-col justify-center px-5 sm:px-8 md:px-12 lg:px-16 py-8 sm:py-10">
                  {form}
                </div>
              </div>
            </div>
          ) : (
            <div className="premium-auth-form w-full lg:w-1/2 bg-[#fffdf8] flex flex-col justify-center px-5 sm:px-8 md:px-12 lg:px-16 py-8 sm:py-12 relative">
              {form}
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}
