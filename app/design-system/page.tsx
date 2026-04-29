"use client";

import React, { useState } from "react";
import { 
  TrendingUp, 
  Wallet, 
  Ticket, 
  Users, 
  Settings, 
  LogOut, 
  Clock, 
  ChevronRight, 
  Check, 
  AlertCircle, 
  Info, 
  Search, 
  Filter, 
  Calendar, 
  Palette,
  X,
  Trophy,
  User,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  Zap
} from "lucide-react";
import { Sidebar } from "@/components/ui/Sidebar";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { ListRow } from "@/components/ui/ListRow";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { NumberPicker } from "@/components/ui/NumberPicker";
import { DigitalTicket } from "@/components/ui/DigitalTicket";
import { DrawTimer } from "@/components/ui/DrawTimer";
import { MiniChart } from "@/components/ui/MiniChart";
import { MobileNavItem, MobileNav } from "@/components/ui/MobileNav";
import { InputField } from "@/components/ui/InputField";

export default function DesignSystem() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex w-full min-h-screen bg-background font-sans text-foreground transition-colors duration-300 overflow-x-hidden relative">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavItem icon={<TrendingUp size={20} />} active />
        <MobileNavItem icon={<Ticket size={20} />} />
        <MobileNavItem icon={<Trophy size={20} />} />
        <MobileNavItem icon={<User size={20} />} />
        <MobileNavItem icon={<LogOut size={20} />} />
      </MobileNav>

      <main className="flex-1 p-6 pb-32 md:pb-12 md:p-12 lg:ml-72 flex flex-col gap-[50px] md:gap-[100px]">
        {/* Header */}
        <header className="flex flex-col gap-4">
          <div className="flex flex-row items-center gap-3">
            <Badge variant="info" dot>SYSTEM LIVE</Badge>
            <Badge variant="success" icon={ShieldCheck}>PROPS AUDITED</Badge>
          </div>
          <h1 className="text-4xl md:text-7xl title-italic break-words">
            DESIGN <span className="text-primary-light">SYSTEM</span>
          </h1>
          <p className="text-foreground/60 font-medium max-w-2xl text-lg">
            Plataforma Quina Fácil v1.0. Todos os componentes são modulares, aceitam ícones Lucide e navegação via Next.js Link.
          </p>
        </header>

        {/* 01. Brand Identity */}
        <Section num="01" title="Brand Identity">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-center bg-foreground/[0.02] p-6 rounded-[5px] border border-glass-border">
            <div className="flex flex-col gap-4 items-center">
              <p className="label-caps">Logo Principal</p>
              <div className="bg-primary-dark p-4 rounded-[5px] flex items-center justify-center">
                <img src="/logo.png" alt="Logo" className="h-16 object-contain" />
              </div>
            </div>
            <div className="flex flex-col gap-4 items-center border-r border-glass-border pr-8">
              <p className="label-caps">Logo Horizontal</p>
              <div className="bg-primary-dark p-4 rounded-[5px] flex items-center justify-center w-full">
                <img src="/logo-horizontal.png" alt="Logo Horizontal" className="h-10 object-contain" />
              </div>
            </div>
            <div className="flex flex-col gap-4 items-center border-r border-glass-border pr-8">
              <p className="label-caps">Logo Escura (Light BG)</p>
              <div className="bg-white p-4 rounded-[5px]">
                <img src="/logo-dark.png" alt="Logo Dark" className="h-10 object-contain" />
              </div>
            </div>
            <div className="flex flex-col gap-4 items-center">
              <p className="label-caps">Favicon / Ícone</p>
              <img src="/favicon.png" alt="Favicon" className="h-12 w-12 object-contain" />
            </div>
          </div>
        </Section>

        {/* 04. Form Elements */}
        <Section num="02" title="Form Elements & Inputs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <InputField 
              label="Nome Completo" 
              placeholder="Ex: Marcos Vinicius" 
              icon={User} 
            />
            <InputField 
              label="E-mail" 
              type="email" 
              placeholder="seu@email.com" 
              icon={Search} 
            />
            <InputField 
              label="Telefone" 
              placeholder="(11) 99999-9999" 
              icon={Settings} 
              error="Campo obrigatório"
            />
          </div>
        </Section>

        {/* 05. Interactive Components */}
        <Section num="03" title="Interactive Components">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            <div className="glass-card gap-5">
              <p className="label-caps !text-primary-light/80">Buttons & States</p>
              <div className="flex flex-wrap gap-5">
                <button className="primary-button w-full md:w-auto">Primary Button</button>
                <button className="glass-button w-full md:md:w-auto">Glass Button</button>
                <button className="primary-button !bg-brand-success !shadow-brand-success/20 hover:!shadow-brand-success/40 w-full md:w-auto">Success Action</button>
                <button className="glass-button w-full md:w-auto hover:!border-error/40 hover:!bg-error/5 group">
                  <LogOut size={16} className="text-foreground/40 group-hover:text-error transition-colors mr-2" />
                  <span className="group-hover:text-error transition-colors">Danger Action</span>
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <p className="label-caps !text-primary-light/80">Custom Select</p>
              <CustomSelect
                label="Selecione o Turno"
                options={["Matutino (06h - 12h)", "Vespertino (12h - 17h)", "Noturno (Fechado)"]}
              />
            </div>
          </div>
        </Section>

        {/* 06. Data Display */}
        <Section num="04" title="Data Display & Cards">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <StatCard
              label="Vendas Hoje"
              value="R$ 12.450"
              sub="+15% em relação a ontem"
              icon={TrendingUp}
              trend="+12.4% PERFORMANCE"
              href="#"
            />
            <StatCard
              label="Comissão Acumulada"
              value="R$ 842,00"
              sub="Disponível para saque"
              icon={Wallet}
              href="#"
            />
            <StatCard
              label="Bilhetes Ativos"
              value="156"
              sub="Aguardando sorteio"
              icon={Ticket}
              href="#"
            />
          </div>
        </Section>

        {/* 07. List Patterns */}
        <Section num="05" title="List Patterns & Rows">
          <div className="glass-card !p-0 overflow-hidden">
            <div className="p-6 border-b border-glass-border flex justify-between items-center">
              <h3 className="title-italic text-lg">Transações Recentes</h3>
              <button className="text-primary-light text-[10px] font-black italic uppercase hover:underline">Ver Tudo</button>
            </div>
            <ListRow 
              title="Venda de Bilhete" 
              sub="Série QF-901" 
              amount="+ R$ 20,00" 
              time="14:20" 
              variant="success" 
              icon={CreditCard}
              href="#"
            />
            <ListRow 
              title="Ajuste de Saldo" 
              sub="Manutenção de Sistema" 
              amount="- R$ 15,00" 
              time="12:05" 
              variant="error" 
              icon={Zap}
              href="#"
            />
            <ListRow 
              title="Comissão Paga" 
              sub="Vendedor Marcos" 
              amount="+ R$ 5,00" 
              time="09:15" 
              variant="info"
              icon={ArrowUpRight}
              href="#"
            />
          </div>
        </Section>

        {/* 08. Feedback & Overlays */}
        <Section num="06" title="Feedback & Overlays">
          <div className="flex flex-col md:flex-row gap-5">
            <button onClick={() => setIsModalOpen(true)} className="primary-button w-full md:w-auto">Teste de Modal</button>
            <div className="flex flex-row items-center gap-4 glass-card !py-3 !px-4 border-l-4 border-l-primary-light w-full md:w-auto">
              <Info className="text-primary-light shrink-0" size={18} />
              <span className="text-xs font-black italic uppercase tracking-wider">Dica: Use atalhos de teclado para vender mais rápido.</span>
            </div>
          </div>

          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
              <div className="absolute inset-0 bg-background/90 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
              <div className="glass-card w-full max-w-md relative z-10 gap-5 animate-in fade-in zoom-in duration-300">
                <div className="flex flex-row items-center justify-between">
                  <h3 className="title-italic text-2xl">Confirmar Ação</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-foreground/20 hover:text-foreground transition-colors"><X /></button>
                </div>
                <p className="opacity-60 text-sm leading-relaxed text-foreground">
                  Você está prestes a emitir um bilhete de <strong>R$ 50,00</strong>. Esta ação não pode ser desfeita após a impressão.
                </p>
                <div className="flex flex-col gap-3">
                  <button className="primary-button w-full">Confirmar e Imprimir</button>
                  <button onClick={() => setIsModalOpen(false)} className="glass-button w-full">Cancelar</button>
                </div>
              </div>
            </div>
          )}
        </Section>

        {/* 09. Monitoring & Analytics */}
        <Section num="07" title="Monitoring & Analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <DrawTimer time="04:20:15" progress={75} />
            <div className="grid grid-cols-1 gap-5">
              <MiniChart data={[40, 65, 30, 85, 45, 95, 70]} label="Vendas Semanais" variant="primary" />
              <MiniChart data={[20, 45, 10, 55, 25, 65, 40]} label="Comissões Pagas" variant="success" />
            </div>
          </div>
        </Section>

        {/* 11. Advanced Audit Filters */}
        <Section num="08" title="Advanced Audit Filters">
          <div className="glass-card gap-5">
            <div className="flex flex-col md:flex-row gap-5">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input type="text" placeholder="BUSCAR POR ID OU VENDEDOR..." className="input-field pl-12 font-bold uppercase" />
              </div>
              <div className="flex gap-2">
                <button className="glass-button !px-4"><Calendar size={18} /></button>
                <button className="glass-button !px-4"><Filter size={18} /></button>
                <button className="primary-button !px-6">Filtrar</button>
              </div>
            </div>
          </div>
        </Section>

        {/* 12. Identity & Toasts */}
        <Section num="09" title="Identity & Toasts">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="glass-card !flex-row items-center gap-4">
              <div className="w-14 h-14 rounded-[5px] bg-linear-to-br from-primary-light to-primary-mid border-2 border-foreground/20 flex items-center justify-center text-xl font-black italic shrink-0">
                MA
              </div>
              <div className="flex flex-col gap-0.5">
                <h4 className="title-italic text-lg">Marcos Admin</h4>
                <p className="label-caps !text-primary-light/80">Administrador Geral</p>
              </div>
              <button className="ml-auto text-foreground/20 hover:text-error transition-colors"><LogOut size={20} /></button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="glass-card !flex-row items-center gap-4 border-l-4 border-l-brand-success animate-in slide-in-from-right-10">
                <Check className="text-brand-success" size={24} />
                <div className="flex flex-col">
                  <span className="text-xs font-black italic uppercase">Sucesso!</span>
                  <span className="text-[10px] opacity-60">Bilhete #9921 emitido com sucesso.</span>
                </div>
              </div>
              <div className="glass-card !flex-row items-center gap-4 border-l-4 border-l-error animate-in slide-in-from-right-10 delay-75">
                <AlertCircle className="text-error" size={24} />
                <div className="flex flex-col">
                  <span className="text-xs font-black italic uppercase">Erro de Conexão</span>
                  <span className="text-[10px] opacity-60">Verifique sua internet e tente novamente.</span>
                </div>
              </div>
            </div>
          </div>
        </Section>
      </main>
    </div>
  );
}

function ColorCard({ name, hex, className }: { name: string; hex: string; className: string }) {
  return (
    <div className={`p-6 h-40 rounded-[5px] flex flex-col justify-end gap-y-2 group transition-all hover:brightness-110 ${className}`}>
      <div className="p-2 bg-black/20 rounded-lg w-fit opacity-0 group-hover:opacity-100 transition-opacity">
        <Palette size={14} />
      </div>
      <div>
        <p className="text-xs font-black italic uppercase tracking-widest">{name}</p>
        <p className="text-[10px] font-bold opacity-60 tracking-wider">{hex}</p>
      </div>
    </div>
  );
}

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-[30px] md:gap-[50px]">
      <div className="flex flex-row items-center gap-4 border-b border-white/5 pb-4">
        <span className="text-primary-light font-black italic text-xl">{num}.</span>
        <h2 className="title-italic text-xl md:text-3xl">{title}</h2>
      </div>
      <div className="flex flex-col gap-5">
        {children}
      </div>
    </section>
  );
}
