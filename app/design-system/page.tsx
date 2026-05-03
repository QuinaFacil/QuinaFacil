"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  Wallet,
  Ticket,
  LogOut,
  Clock,
  Search,
  Calendar,
  Trophy,
  User,
  ShieldCheck,
  Hash,
  Phone
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
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Main } from "@/components/ui/Main";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { Stack } from "@/components/ui/Stack";
import { PageHeader } from "@/components/ui/PageHeader";
import { Box } from "@/components/ui/Box";
import { Flex } from "@/components/ui/Flex";
import { Grid } from "@/components/ui/Grid";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import Image from 'next/image';

function ColorSwatch({ name, hex, variable }: { name: string, hex: string, variable: string }) {
  return (
    <Box bg="glass" border="glass" className="p-2 group">
      <Stack gap={3}>
        <Box
          className={`w-full h-16 rounded-[5px] shadow-lg transition-transform group-hover:scale-[1.02] ${variable}`}
          style={{ backgroundColor: hex.startsWith('#') ? hex : undefined }}
        />
        <Stack gap={1}>
          <Text variant="label" className="!text-[10px]">{name}</Text>
          <Text variant="tiny" color="muted">{hex}</Text>
          <code className="text-[8px] text-primary-light/50 font-mono">{variable}</code>
        </Stack>
      </Stack>
    </Box>
  );
}

export default function DesignSystem() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Flex className="w-full min-h-screen bg-background font-sans text-foreground transition-colors duration-300 overflow-x-hidden relative">
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
      <Main>
        {/* Header */}
        <PageHeader
          title="Design System"
          description="Plataforma Quina Fácil v1.0. Todos os componentes são modulares, aceitam ícones Lucide e navegação via Next.js Link."
        >
          <Badge variant="info" dot>SYSTEM LIVE</Badge>
          <Badge variant="success" icon={ShieldCheck}>PROPS AUDITED</Badge>
        </PageHeader>

        {/* 01. Brand Identity */}
        <Section num="01" title="Brand Identity" className="z-50">
          <Box padding={6} bg="muted" border="glass" rounded="md">
            <Grid cols={4} gap={5} align="center">
              <Flex direction="col" gap={4} align="center">
                <Text variant="label">Logo Principal</Text>
                <Box bg="dark" padding={4}>
                  <Image src="/logo.png" alt="Logo" width={120} height={64} className="h-16 object-contain" />
                </Box>
              </Flex>
              <Flex direction="col" gap={4} align="center" className="border-r border-glass-border">
                <Text variant="label">Logo Horizontal</Text>
                <Box bg="dark" padding={4} className="w-[80%] max-w-[200px]">
                  <Flex justify="center" align="center">
                    <Image src="/logo-horizontal.png" alt="Logo Horizontal" width={160} height={40} className="h-10 object-contain" />
                  </Flex>
                </Box>
              </Flex>
              <Flex direction="col" gap={4} align="center" className="border-r border-glass-border">
                <Text variant="label">Logo Escura (Light BG)</Text>
                <Box bg="white" padding={4}>
                  <Image src="/logo-dark.png" alt="Logo Dark" width={100} height={40} className="h-10 object-contain" />
                </Box>
              </Flex>
              <Flex direction="col" gap={4} align="center">
                <Text variant="label">Favicon / Ícone</Text>
                <Image src="/favicon.png" alt="Favicon" width={48} height={48} className="h-12 w-12 object-contain" />
              </Flex>
            </Grid>
          </Box>
        </Section>

        {/* 02. Color Palette */}
        <Section num="02" title="Color Palette" className="z-40">
          <Card padding="md">
            <Grid cols={4} gap={6}>
              <ColorSwatch name="Primary Dark" hex="#060E1E" variable="bg-background" />
              <ColorSwatch name="Primary Light" hex="#0084FF" variable="bg-primary-light" />
              <ColorSwatch name="Primary Cyan" hex="#00D1FF" variable="bg-primary-cyan" />
              <ColorSwatch name="Success" hex="#10B981" variable="bg-brand-success" />
              <ColorSwatch name="Error" hex="#EF4444" variable="bg-error" />
              <ColorSwatch name="Warning" hex="#F59E0B" variable="bg-warning" />
              <ColorSwatch name="Glass Border" hex="rgba(255,255,255,0.1)" variable="border-glass-border" />
              <ColorSwatch name="Glass Background" hex="rgba(255,255,255,0.05)" variable="bg-glass" />
            </Grid>
          </Card>
        </Section>

        {/* 03. Typography */}
        <Section num="03" title="Typography & Text Variants" className="z-30">
          <Card padding="md">
            <Stack gap={8}>

              <Stack gap={6}>
                <Text variant="label">Headings &amp; Titles</Text>
                <Stack gap={4}>
                  <Heading level={1}>Heading L1 (Title Italic)</Heading>
                  <Heading level={2}>Heading L2 (Standard Bold)</Heading>
                  <Heading level={3} variant="brand">Heading L3 (Brand Style)</Heading>
                  <Heading level={4} variant="standard">Heading L4 (Standard UI)</Heading>
                </Stack>
              </Stack>

              <Box className="border-t border-glass-border" />

              <Stack gap={6}>
                <Text variant="label">Standard Text</Text>
                <Grid cols={2} gap={6}>
                  <Stack gap={2}>
                    <Text variant="label" color="muted">Body Text (Standard)</Text>
                    <Text variant="body">Esta é a tipografia padrão para textos longos e descrições gerais do sistema.</Text>
                  </Stack>
                  <Stack gap={2}>
                    <Text variant="label" color="muted">Description (Small)</Text>
                    <Text variant="description">Texto de apoio ligeiramente menor que o padrão, ideal para instruções.</Text>
                  </Stack>
                </Grid>
              </Stack>

              <Box className="border-t border-glass-border" />

              <Stack gap={6}>
                <Text variant="label">Metadata &amp; System Labels</Text>
                <Grid cols={2} gap={6}>
                  <Stack gap={2}>
                    <Text variant="label" color="muted">Auxiliary (Extra Small)</Text>
                    <Text variant="auxiliary">Texto pequeno (10px), cinza e em caixa baixa/normal. Perfeito para metadados secundários.</Text>
                  </Stack>
                  <Stack gap={2}>
                    <Text variant="label" color="muted">Label Caps (System Label)</Text>
                    <Text variant="label">Labels do sistema com tracking e uppercase (0.2em).</Text>
                  </Stack>
                  <Stack gap={2}>
                    <Text variant="label" color="muted">Sub (Metadata Caps)</Text>
                    <Text variant="sub">METADADOS EM CAIXA ALTA COM ESPAÇAMENTO REDUZIDO</Text>
                  </Stack>
                  <Stack gap={2}>
                    <Text variant="label" color="muted">Tiny (Metadata Detail)</Text>
                    <Text variant="tiny">MICRO TEXTO (9PX) PARA DETALHES EXTREMOS</Text>
                  </Stack>
                </Grid>
              </Stack>

              <Box className="border-t border-glass-border" />

              <Stack gap={6}>
                <Text variant="label">Text States &amp; Colors</Text>
                <Grid cols={3} gap={4}>
                  <Text variant="body" color="primary">Primary Text Color</Text>
                  <Text variant="body" color="success">Success Text Color</Text>
                  <Text variant="body" color="error">Error Text Color</Text>
                  <Text variant="body" color="info">Info Text Color</Text>
                  <Text variant="body" color="warning">Warning Text Color</Text>
                  <Text variant="body" color="muted">Muted/Disabled Text</Text>
                </Grid>
              </Stack>

            </Stack>
          </Card>
        </Section>

        {/* 04. Form Elements */}
        <Section num="04" title="Form Elements & Inputs" className="z-20">
          <Card padding="md">
            <Stack gap={8}>

              <Stack gap={4}>
                <Text variant="label">Text Inputs</Text>
                <Grid cols={3} gap={5}>
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
                    icon={Phone}
                    error="Campo obrigatório"
                  />
                </Grid>
              </Stack>

              <Box className="border-t border-glass-border" />

              <Stack gap={4}>
                <Text variant="label">Numeric &amp; Date Inputs</Text>
                <Grid cols={3} gap={5}>
                  <InputField
                    label="Quantidade de Bilhetes"
                    type="number"
                    placeholder="0"
                    min={1}
                    max={999}
                    icon={Hash}
                  />
                  <InputField
                    label="Data do Sorteio"
                    type="date"
                    icon={Calendar}
                  />
                  <InputField
                    label="Data e Hora"
                    type="datetime-local"
                    icon={Clock}
                  />
                </Grid>
              </Stack>

              <Box className="border-t border-glass-border" />

              <Stack gap={4}>
                <Text variant="label">Image Upload</Text>
                <Grid cols={2} gap={5}>
                  <ImageUpload
                    label="Foto de Perfil"
                    size="md"
                  />
                  <ImageUpload
                    label="Foto de Perfil (Estado de Erro)"
                    size="md"
                    error="Imagem inválida ou muito grande"
                  />
                </Grid>
              </Stack>

              <Box className="border-t border-glass-border" />

              <Stack gap={4}>
                <Text variant="label">Custom Dropdown</Text>
                <CustomSelect
                  label="Selecione o Turno"
                  options={["Matutino (06h - 12h)", "Vespertino (12h - 17h)", "Noturno (Fechado)"]}
                />
              </Stack>

            </Stack>
          </Card>
        </Section>

        {/* 05. Interactive Elements */}
        <Section num="05" title="Buttons, Badges & Interactive">
          <Grid cols={2} gap={5} align="start">
            <Card>
              <Stack gap={5}>
                <Text variant="label" color="primary" className="">Buttons &amp; States</Text>
                <Flex wrap gap={5}>
                  <Button variant="primary">Primary Button</Button>
                  <Button variant="glass">Glass Button</Button>
                  <Button variant="success">Success Action</Button>
                  <Button variant="danger" icon={LogOut}>Danger Action</Button>
                  <Button variant="link">Link Button</Button>
                </Flex>
              </Stack>
            </Card>
            <Card>
              <Stack gap={5}>
                <Text variant="label" color="primary" className="">Badges &amp; Status</Text>
                <Flex wrap gap={3}>
                  <Badge variant="success" dot>CONCLUÍDO</Badge>
                  <Badge variant="info" icon={TrendingUp}>PROCESSANDO</Badge>
                  <Badge variant="error">REJEITADO</Badge>
                  <Badge variant="warning">PENDENTE</Badge>
                  <Badge variant="neutral">METADADO</Badge>
                </Flex>
              </Stack>
            </Card>
          </Grid>
        </Section>

        {/* 06. Data Display */}
        <Section num="06" title="Data Display & Cards" className="z-10">
          <Grid cols={3} gap={5}>
            <StatCard
              label="Vendas Hoje"
              value="R$ 12.450"
              sub="+ 15% em relação a ontem"
              icon={TrendingUp}
              trend="+ 12.4% PERFORMANCE"
              href="#"
            />
            <StatCard
              label="Comissão Acumulada"
              value="R$ 842,00"
              sub="Disponível para saque"
              icon={Wallet}
              color="white"
              bg="glass"
            />
            <StatCard
              label="Bilhetes Ativos"
              value="156"
              sub="Aguardando sorteio"
              icon={Ticket}
              color="primary"
              bg="success"
            />
          </Grid>
        </Section>

        {/* 07. List Patterns */}
        <Section num="07" title="List Patterns & Rows">
          <Card padding="none">
            <Stack gap={0}>
              <Flex justify="between" align="center" className="border-b border-white/5 p-6">
                <Heading level={3} size="3xl">TRANSAÇÕES RECENTES</Heading>
                <Button variant="link">VER TUDO</Button>
              </Flex>
              <Stack gap={0}>
                <ListRow
                  title="VENDA DE BILHETE"
                  sub="Série QF-901"
                  amount="+ R$ 20,00"
                  time="14:20"
                  variant="success"
                  icon={Ticket}
                />
                <ListRow
                  title="AJUSTE DE SALDO"
                  sub="Manutenção de sistema"
                  amount="- R$ 15,00"
                  time="12:05"
                  variant="error"
                  icon={TrendingUp}
                />
                <ListRow
                  title="COMISSÃO PAGA"
                  sub="Vendedor Marcos"
                  amount="+ R$ 5,00"
                  time="09:15"
                  variant="info"
                  icon={Search}
                />
              </Stack>
            </Stack>
          </Card>
        </Section>

        {/* 08. Lottery Game Tools */}
        <Section num="08" title="Lottery Game Tools">
          <Grid cols={1} gap={5} className="md:grid-cols-2" align="start">
            <NumberPicker />
            <Stack gap={4}>
              <DigitalTicket
                auditId="8829-XQ-2024"
                dateTime="29/04/2024 - 14:45"
                contest="#6422"
                numbers={[5, 12, 44, 56, 71]}
              />
            </Stack>
          </Grid>
        </Section>

        {/* 09. Specialized UI & Visualization */}
        <Section num="09" title="Specialized UI & Visualization">
          <Grid cols={2} gap={5} align="start">
            <Card padding="md">
              <Stack gap={6}>
                <Text variant="label" color="primary" className="">Countdown Timer</Text>
                <DrawTimer time="14:05:22" progress={65} />
              </Stack>
            </Card>
            <Card padding="md">
              <Stack gap={6}>
                <Text variant="label" color="primary" className="">Activity Charts</Text>
                <MiniChart
                  label="Vendas por Hora"
                  data={[10, 25, 45, 30, 55, 70, 40]}
                  variant="primary"
                />
              </Stack>
            </Card>
          </Grid>
        </Section>

        {/* 10. Feedback & Overlays */}
        <Section num="10" title="Feedback & Overlays">
          <Flex direction="col" gap={5} className="md:flex-row">
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>Teste de Modal</Button>
            <Alert variant="info">Dica: Use atalhos de teclado para vender mais rápido.</Alert>
          </Flex>
        </Section>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Confirmar Ação"
          footer={
            <Stack gap={3}>
              <Button variant="primary" fullWidth>Confirmar e Imprimir</Button>
              <Button variant="glass" fullWidth onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            </Stack>
          }
        >
          Você está prestes a emitir um bilhete de <Text as="span" variant="body" color="primary" className="font-bold">R$ 50,00</Text>. Esta ação não pode ser desfeita após a impressão.
        </Modal>
      </Main>
    </Flex>
  );
}
