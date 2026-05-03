"use client";

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { login } from './actions';
import { Heading } from '@/components/ui/Heading';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';
import { Card } from '@/components/ui/Card';
import { Stack } from '@/components/ui/Stack';
import { Box } from '@/components/ui/Box';
import { Flex } from '@/components/ui/Flex';
import { Alert } from '@/components/ui/Alert';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'deactivated') {
      setErrorMessage("Sua conta foi desativada. Entre em contato com o suporte.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await login(formData);

    if (result?.error) {
      setErrorMessage(result.error);
      setLoading(false);
    }
  };

  return (
    <Flex align="center" justify="center" className="min-h-screen w-full p-4 relative overflow-hidden">
      {/* Background Decorativo */}
      <Box className="absolute inset-0 z-0 pointer-events-none">
        <Box className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-light/10 blur-[120px]" />
        <Box className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary-cyan/10 blur-[120px]" />
      </Box>

      <Box className="w-full max-w-[400px] z-10">
        <Stack gap={10}>
          {/* Logo Area */}
          <Box className="dynamic-logo w-full h-20" />

          {/* Login Card */}
          <Card padding="md" className="relative">
            <Stack gap={10}>
              <Stack gap={2}>
                <Heading level={1} size="2xl">BEM-VINDO</Heading>
                <Text variant="description">Entre com suas credenciais para acessar o painel.</Text>
              </Stack>

              {errorMessage && (
                <Alert variant="error" className="animate-in fade-in slide-in-from-top-2 duration-300">
                  {errorMessage}
                </Alert>
              )}

              <Stack as="form" onSubmit={handleSubmit} gap={5}>
                {/* Email Field */}
                <InputField
                  label="E-mail"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  icon={Mail}
                  required
                />

                <InputField
                  label="SENHA"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  icon={Lock}
                  required
                  rightElement={
                    <Button
                      type="button"
                      variant="link"
                      className="text-foreground/30"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  }
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  variant="primary"
                  fullWidth
                  icon={ArrowRight}
                >
                  {loading ? 'Entrando...' : 'Entrar no Sistema'}
                </Button>
              </Stack>

              {/* Footer Info */}
              <Stack gap={4}>
                <Box padding={0} className="w-full h-px bg-glass-border " />
                <Text variant="sub" className="text-center">
                  AO ACESSAR VOCÊ CONCORDA COM OS TERMOS DE SEGURANÇA E AUDITORIA DO QUINA FÁCIL.
                </Text>
              </Stack>
            </Stack>
          </Card>
        </Stack>
      </Box>
    </Flex>
  );
}
