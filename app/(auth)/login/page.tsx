"use client";

import React, { Suspense } from 'react';
import { Flex } from '@/components/ui/Flex';
import { Box } from '@/components/ui/Box';
import { LoginFormContent } from '@/components/ui/LoginFormContent';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <Flex align="center" justify="center" className="min-h-screen">
        <Box className="w-8 h-8 rounded-full border-2 border-primary-light border-t-transparent animate-spin" />
      </Flex>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
