import React from 'react';
import {
  TrendingUp, Ticket, Wallet, Users,
  FileText, ShieldAlert, Trophy, User,
  Hash, BarChart3, Clock, MapPin
} from "lucide-react";

export interface MenuItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

export const ADMIN_MENU: MenuItem[] = [
  { icon: <TrendingUp size={18} />, label: "Dashboard", href: "/admin/dashboard" },
  { icon: <BarChart3 size={18} />, label: "Relatórios", href: "/admin/relatorios" },
  { icon: <Users size={18} />, label: "Usuários", href: "/admin/usuarios" },
  { icon: <ShieldAlert size={18} />, label: "Logs", href: "/admin/logs" },
  { icon: <Hash size={18} />, label: "Campanhas", href: "/admin/concursos" },
  { icon: <MapPin size={18} />, label: "Cidades", href: "/admin/cidades" },
  { icon: <Trophy size={18} />, label: "Vencedores", href: "/admin/vencedores" },
  { icon: <Wallet size={18} />, label: "Solicitações de Saque", href: "/admin/saques" },
  { icon: <Ticket size={18} />, label: "Tickets Emitidos", href: "/admin/tickets" },
  { icon: <User size={18} />, label: "Perfil", href: "/admin/perfil" },
];

export const GERENTE_MENU: MenuItem[] = [
  { icon: <TrendingUp size={18} />, label: "Dashboard", href: "/gerente/dashboard" },
  { icon: <FileText size={18} />, label: "Relatórios", href: "/gerente/relatorios" },
  { icon: <Users size={18} />, label: "Vendedores", href: "/gerente/vendedores" },
  { icon: <Ticket size={18} />, label: "Tickets Emitidos", href: "/gerente/tickets" },
  { icon: <User size={18} />, label: "Perfil", href: "/gerente/perfil" },
];

export const VENDEDOR_MENU: MenuItem[] = [
  { icon: <TrendingUp size={18} />, label: "Dashboard", href: "/vendedor/dashboard" },
  { icon: <Wallet size={18} />, label: "Comissão", href: "/vendedor/comissao" },
  { icon: <FileText size={18} />, label: "Relatórios", href: "/vendedor/relatorios" },
  { icon: <Ticket size={18} />, label: "Emitir Bilhete", href: "/vendedor/emitir" },
  { icon: <Clock size={18} />, label: "Tickets Pendentes", href: "/vendedor/tickets-pendentes" },
  { icon: <Ticket size={18} />, label: "Tickets Emitidos", href: "/vendedor/tickets" },
  { icon: <User size={18} />, label: "Perfil", href: "/vendedor/perfil" },
];
