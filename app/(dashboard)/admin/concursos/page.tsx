"use client";

import React from 'react';
import { Section } from '@/components/ui/Section';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Flex } from '@/components/ui/Flex';
import { ConcursoList } from '@/components/ui/ConcursoList';
import { ConcursoModal } from '@/components/ui/ConcursoModal';
import { Trophy } from 'lucide-react';

import type { Concurso } from '@/types/lottery';

export default function AdminConcursosPage() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);


  const [selectedConcurso, setSelectedConcurso] = React.useState<Concurso | null>(null);

  const handleEdit = (concurso: Concurso, forceStatus?: string) => {
    const updatedConcurso = forceStatus 
      ? { ...concurso, status: forceStatus as 'open' | 'closed' | 'finished' } 
      : concurso;
    setSelectedConcurso(updatedConcurso);
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    setSelectedConcurso(null);
    setIsModalOpen(true);
  };

  return (
    <>
      <PageHeader 
        title="Gestão de Campanhas" 
        description="Administração de campanhas, lançamento de dezenas e processamento oficial de ganhadores."
      />

      <Section 
        num="01" 
        title="Histórico de Campanhas"
        action={
          <Flex gap={3} className="w-full lg:w-auto">

            <Button 
              variant="primary" 
              icon={Trophy} 
              onClick={handleOpenNew}
              fullWidth
              className="flex-1 lg:min-w-[200px]"
            >
              Nova Campanha
            </Button>
          </Flex>
        }
      >
        <ConcursoList 
          onEdit={(c) => handleEdit(c)} 
          onLaunchResult={(c) => handleEdit(c, 'finished')} 
        />
      </Section>

      <ConcursoModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedConcurso(null);
        }}
        selectedConcurso={selectedConcurso}
      />

    </>
  );
}
