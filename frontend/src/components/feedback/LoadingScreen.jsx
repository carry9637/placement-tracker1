import { motion } from "framer-motion";
import { theme } from "../../config/theme";

export function LoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-950 text-white">
      <div className="text-center">
        <motion.div
          className={`mx-auto mb-5 h-14 w-14 rounded-2xl bg-gradient-to-br ${theme.gradients.primary}`}
          animate={{ rotate: 360, borderRadius: ["30%", "48%", "30%"] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
        />
        <p className="text-sm text-slate-400">Preparing workspace</p>
      </div>
    </div>
  );
}
