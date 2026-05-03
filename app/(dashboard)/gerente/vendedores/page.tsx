"use client";

import React from 'react';
import { Section } from '@/components/ui/Section';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { UserPlus } from 'lucide-react';
import { SellerList, type SellerListHandle } from '@/components/ui/SellerList';

export default function GerenteVendedoresPage() {
  const sellerListRef = React.useRef<SellerListHandle>(null);

  return (
    <>
      <PageHeader 
        title="Gestão de Vendedores" 
        description="Controle de acessos, comissões e performance da sua equipe regional."
      />

      <Section 
        num="01" 
        title="Sua Equipe"
        action={
          <Button 
            variant="primary" 
            icon={UserPlus} 
            onClick={() => sellerListRef.current?.openNew()}
            fullWidth
          >
            Novo Vendedor
          </Button>
        }
      >
        <SellerList ref={sellerListRef} />
      </Section>
    </>
  );
}
