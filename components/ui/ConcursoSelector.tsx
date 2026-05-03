"use client";

import React from 'react';
import { Box } from './Box';
import { Flex } from './Flex';
import { Stack } from './Stack';
import { Text } from './Text';
import { Trophy } from 'lucide-react';

export interface Concurso {
  id: string;
  concurso_numero: number;
  data_sorteio?: string;
  draw_date?: string;
}

interface ConcursoSelectorProps {
  concursos: Concurso[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ConcursoSelector({ concursos, selectedId, onSelect }: ConcursoSelectorProps) {
  if (!concursos || concursos.length === 0) return null;

  return (
    <Box padding={0} className="w-full overflow-x-auto no-scrollbar">
      <Flex gap={4} padding={4} className="min-w-max">
        {concursos.map((concurso) => {
          const isActive = selectedId === concurso.id;
          const displayDate = concurso.draw_date || concurso.data_sorteio;
          
          return (
            <Box
              key={concurso.id}
              padding={4}
              bg={isActive ? 'info' : 'glass'}
              border={isActive ? 'info' : 'glass'}
              className={`
                cursor-pointer transition-all duration-300 w-full md:w-48 shrink-0
                ${isActive ? 'scale-105 shadow-xl shadow-primary-light/20 bg-primary-light' : 'hover:bg-white/10 opacity-70 hover:opacity-100'}
              `}
              onClick={() => onSelect(concurso.id)}
            >
              <Stack gap={4} align="center">
                <Flex align="center" justify="center" padding={3} bg="glass" rounded="none" className={`rounded-full ${isActive ? 'bg-white/20' : ''}`}>
                  <Trophy size={20} className={isActive ? 'text-white' : 'text-primary-light'} />
                </Flex>
                
                <Stack gap={1} align="center">
                  <Text variant="label" color={isActive ? "white" : "primary"}>
                    #{concurso.concurso_numero}
                  </Text>
                  <Text variant="tiny" color={isActive ? "white" : "muted"}>
                    {displayDate ? new Date(displayDate).toLocaleDateString('pt-BR') : 'Sem data'}
                  </Text>
                </Stack>
              </Stack>
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
}
