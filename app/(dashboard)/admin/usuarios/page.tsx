"use client";

import React from 'react';
import { Section } from '@/components/ui/Section';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { UserPlus } from 'lucide-react';
import { UserList, type UserListHandle } from '@/components/ui/UserList';

export default function AdminUsuariosPage() {
  const userListRef = React.useRef<UserListHandle>(null);

  return (
    <>
      <PageHeader 
        title="Gestão de Usuários" 
        description="Administração de perfis, permissões e hierarquia do sistema."
      />

      <Section 
        num="01" 
        title="Lista de Usuários"
        action={
          <Button 
            variant="primary" 
            icon={UserPlus} 
            onClick={() => userListRef.current?.openNew()}
            fullWidth
          >
            Novo Usuário
          </Button>
        }
      >
        <UserList ref={userListRef} />
      </Section>
    </>
  );
}
