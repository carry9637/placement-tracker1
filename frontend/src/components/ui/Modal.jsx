import { AnimatePresence, motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import { Button } from "./Button";

const sizes = {
  default: "max-w-lg",
  wide: "max-w-4xl",
  xl: "max-w-6xl",
};

export function Modal({ open, title, children, onClose, size = "default", footer }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center overflow-hidden bg-slate-950/75 p-3 backdrop-blur-md sm:p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose?.();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={`flex max-h-[calc(100dvh-24px)] w-full ${sizes[size]} flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-black/40 ring-1 ring-cyan-300/10 sm:max-h-[calc(100dvh-40px)]`}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-4 sm:px-5">
              <h2 className="min-w-0 truncate text-lg font-semibold text-white">{title}</h2>
              <Button variant="ghost" className="min-h-9 px-3" onClick={onClose} aria-label="Close modal">
                <FiX />
              </Button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">{children}</div>
            {footer ? <div className="shrink-0 border-t border-white/10 px-4 py-4 sm:px-5">{footer}</div> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
