import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light/10 border border-primary-light/20 text-primary-light text-sm font-medium animate-pulse">
          <Sparkles size={14} /> Design System Pronto
        </div>
        <h1 className="text-6xl font-black tracking-tight">
          Quina <span className="text-primary-light">Fácil</span>
        </h1>
        <p className="text-xl opacity-60 max-w-lg mx-auto">
          Iniciando o desenvolvimento com foco em design premium e segurança auditável.
        </p>
      </div>

      <Link 
        href="/design-system" 
        className="primary-button flex items-center gap-2 text-lg group"
      >
        Acessar Design System
        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </main>
  );
}
