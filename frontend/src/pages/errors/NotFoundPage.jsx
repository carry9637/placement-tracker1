import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";

export function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-4 text-center text-white">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">404</p>
        <h1 className="mt-4 text-4xl font-semibold">Page not found</h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">The page does not exist in this frontend foundation.</p>
        <Link to="/" className="mt-8 inline-block">
          <Button>Back home</Button>
        </Link>
      </div>
    </main>
  );
}
