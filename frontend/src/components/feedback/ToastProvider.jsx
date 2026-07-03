import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function ToastProvider() {
  return (
    <ToastContainer
      position="top-right"
      theme="dark"
      autoClose={2600}
      newestOnTop
      closeOnClick
      pauseOnFocusLoss={false}
      toastClassName="!rounded-xl !border !border-white/10 !bg-slate-950/95 !text-sm !shadow-2xl"
    />
  );
}
