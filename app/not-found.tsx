"use client";

import React from 'react';
import Link from 'next/link';
import { Home, AlertTriangle } from 'lucide-react';
import { Flex } from '@/components/ui/Flex';
import { Stack } from '@/components/ui/Stack';
import { Box } from '@/components/ui/Box';
import { Heading } from '@/components/ui/Heading';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <Flex align="center" justify="center" className="min-h-screen w-full bg-background p-6 relative overflow-hidden">
      {/* Background Decor */}
      <Box className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary-light/5 blur-[120px] pointer-events-none" />
      <Box className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-light/5 blur-[120px] pointer-events-none" />

      <Box bg="glass" padding={12} rounded="lg" border="glass" className="max-w-md w-full text-center relative z-10">
        <Stack gap={8} align="center">
          <Flex align="center" justify="center" className="w-24 h-24 bg-error/10 rounded-full">
            <AlertTriangle size={48} className="text-error" />
          </Flex>

          <Stack gap={4}>
            <Heading level={1} size="4xl">404</Heading>
            <Heading level={2} size="xl">Página não encontrada</Heading>
            <Text color="muted">
              Ops! O link que você seguiu pode estar quebrado ou a página pode ter sido removida.
            </Text>
          </Stack>

          <Box className="w-full h-px bg-white/10" />

          <Link href="/" className="w-full">
            <Button variant="primary" fullWidth icon={Home}>
              Voltar para o Início
            </Button>
          </Link>
        </Stack>
      </Box>
    </Flex>
  );
}
