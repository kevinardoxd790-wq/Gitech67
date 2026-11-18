import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import GotechBackdrop from "@/components/GotechBackdrop";

export default function NotFound() {
  return (
    <div className="pt-16 min-h-screen relative overflow-hidden bg-[#F4F8FF] text-[#0B172A] flex items-center justify-center">
      <GotechBackdrop />
      <div className="relative z-10 text-center px-4">
        <p className="font-montserrat font-black text-8xl text-[#0057FF]/20 mb-4">
          404
        </p>
        <h1 className="font-montserrat font-black text-2xl text-[#0B172A] mb-3">
          Página no encontrada
        </h1>
        <p className="text-[#4D607D] mb-8">La página que buscas no existe.</p>
        <Link to="/" className="btn-gotech inline-flex items-center gap-2">
          <Home className="w-4 h-4" />
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
