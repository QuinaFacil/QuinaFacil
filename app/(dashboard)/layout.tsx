import { Sidebar } from "@/components/ui/Sidebar";
import { Main } from "@/components/ui/Main";
import { MobileNavWrapper } from "@/components/ui/MobileNavWrapper";
import { Flex } from "@/components/ui/Flex";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Flex as="div" className="w-full min-h-screen bg-background font-sans text-foreground transition-colors duration-300 overflow-x-hidden relative">
      {/* Sidebar Fixa (Desktop) */}
      <Sidebar />

      {/* Mobile Navigation (Dinamizada) */}
      <MobileNavWrapper />

      {/* Conteúdo Principal */}
      <Main>
        {children}
      </Main>
    </Flex>
  );
}
