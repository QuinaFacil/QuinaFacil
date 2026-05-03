import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Heading } from '@/components/ui/Heading';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Stack } from '@/components/ui/Stack';
import { Box } from '@/components/ui/Box';
import { Flex } from '@/components/ui/Flex';

export default function LandingPage() {
  return (
    <Flex as="div" className="min-h-screen flex flex-col relative overflow-hidden bg-background selection:bg-primary-light/30">
      {/* BACKGROUND DECOR (Glows) */}
      <Box className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <Box className="absolute top-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary-light/10 blur-[120px]" />
        <Box className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-cyan/10 blur-[120px]" />
        <Box className="absolute top-[20%] left-[10%] w-[30%] h-[30%] rounded-full bg-primary-mid/5 blur-[100px]" />
      </Box>
      {/* HEADER */}
      <Box as="header" className="fixed top-0 left-0 right-0 z-50 border-b border-glass-border bg-background/50 backdrop-blur-md">
        <Container className="h-20">
          <Flex align="center" justify="between" className="h-full">
            <Box className="dynamic-logo w-40 h-8 logo-left" />
            
            <Link href="/login">
              <Button variant="primary" size="sm" icon={ArrowRight}>
                Acessar Painel
              </Button>
            </Link>
          </Flex>
        </Container>
      </Box>
      {/* HERO SECTION MINIMALISTA */}
      <Flex as="main" className="flex-1 flex items-center z-10">
        <Container>
          <Stack gap={10} className="max-w-4xl">
            <Flex align="center" gap={2} className="rounded-full bg-primary-light/10 border border-primary-light/20 w-fit">
              <Box className="w-1.5 h-1.5 rounded-full bg-primary-light animate-pulse" />
              <Text variant="sub" color="primary">Plataforma Auditável v1.0</Text>
            </Flex>

            <Stack gap={6}>
              <Heading level={1} size="8xl">
                Gestão de Loterias com <Heading as="span" variant="brand" size="8xl">Precisão Digital.</Heading>
              </Heading>
              <Text variant="body" color="muted" className="max-w-2xl">
                Uma solução robusta para emissão de bilhetes, controle de comissões e gestão de concursos com segurança bancária e transparência total.
              </Text>
            </Stack>

            <Flex align="center" gap={12}>
              <Stack gap={0}>
                <Heading level={3} size="3xl">100%</Heading>
                <Text variant="sub">Auditável</Text>
              </Stack>
              <Box className="w-px h-12 bg-glass-border" />
              <Stack gap={0}>
                <Heading level={3} size="3xl">0.1s</Heading>
                <Text variant="sub">Processamento</Text>
              </Stack>
            </Flex>
          </Stack>
        </Container>
      </Flex>
      {/* FOOTER */}
      <Box as="footer" className="border-t border-glass-border bg-background z-10">
        <Container>
          <Flex justify="between" align="center">
            <Box className="dynamic-logo w-40 h-8 logo-left" />
            <Text variant="sub">
              © 2024 Quina Fácil. Todos os direitos reservados.
            </Text>
          </Flex>
        </Container>
      </Box>
    </Flex>
  );
}
