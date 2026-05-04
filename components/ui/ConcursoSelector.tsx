"use client";

import React from 'react';
import { Box } from './Box';
import { Flex } from './Flex';
import { Stack } from './Stack';
import { Text } from './Text';
import { Trophy } from 'lucide-react';
import { EmptyState } from './EmptyState';

import type { Concurso } from '@/types/lottery';

interface ConcursoSelectorProps {
  concursos: Concurso[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ConcursoSelector({ concursos, selectedId, onSelect }: ConcursoSelectorProps) {
  if (!concursos || concursos.length === 0) {
    return (
      <EmptyState 
        icon={Trophy} 
        description="Nenhuma campanha finalizada encontrada." 
        minHeight={120}
      />
    );
  }

  return (
    <Box padding={0} className="w-full overflow-x-auto no-scrollbar">
      <Flex gap={5} padding={4} className="min-w-max">
        {concursos.map((concurso) => {
          const isActive = selectedId === concurso.id;
          const displayDate = concurso.draw_date;
          
          return (
            <Box
              key={concurso.id}
              padding={0}
              className={`
                relative overflow-hidden cursor-pointer transition-all duration-500 w-full md:w-64 shrink-0 border
                ${isActive 
                  ? 'border-primary-light/50 bg-primary-light/10 shadow-[0_0_40px_rgba(0,132,255,0.15)] scale-[1.02]' 
                  : 'border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05] opacity-70 hover:opacity-100'}
              `}
              onClick={() => onSelect(concurso.id)}
            >
              {/* Banner Area */}
              <Box className="relative h-28 overflow-hidden bg-white/5">
                {concurso.banner_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img 
                    src={concurso.banner_url} 
                    alt="" 
                    className={`w-full h-full object-cover transition-all duration-700 ${isActive ? 'scale-110 opacity-80' : 'opacity-40 grayscale-[50%] hover:grayscale-0 hover:opacity-60'}`} 
                  />
                ) : (
                  <Flex align="center" justify="center" className="w-full h-full opacity-10">
                    <Trophy size={48} className="text-foreground" />
                  </Flex>
                )}
                
                {/* Overlay Gradient for contrast */}
                <Box className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-transparent to-transparent opacity-80" />
                
                {/* Prize Badge */}
                <Box padding={2} className="absolute top-3 left-3 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl">
                  <Text variant="tiny" color="primary" className="font-black uppercase tracking-tight text-[9px]">
                    PRÊMIO R$ {Number(concurso.prize_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Text>
                </Box>
              </Box>

              {/* Content Section */}
              <Box padding={4} className="relative z-10">
                <Stack gap={4}>
                  <Flex justify="between" align="end">
                    <Stack gap={0}>
                      <Text variant="tiny" color="muted" className="font-black uppercase tracking-widest opacity-40">Campanha</Text>
                      <Text size="xl" weight="black" transform="uppercase" className="italic tracking-tighter leading-none text-foreground">
                        #{concurso.concurso_numero}
                      </Text>
                    </Stack>
                    
                    <Box padding={2} className={`rounded-[4px] border ${isActive ? 'bg-primary-light/20 border-primary-light/30' : 'bg-white/5 border-white/10'}`}>
                      <Text variant="tiny" color={isActive ? "primary" : "muted"} className="font-bold">
                        {displayDate ? new Date(displayDate).toLocaleDateString('pt-BR') : '---'}
                      </Text>
                    </Box>
                  </Flex>

                  {isActive && (
                    <Box className="h-1 w-full bg-primary-light/20 rounded-full overflow-hidden">
                      <Box className="h-full w-1/3 bg-primary-light animate-[shimmer_2s_infinite]" />
                    </Box>
                  )}
                </Stack>
              </Box>

              {/* Active Selection Indicator Dot */}
              {isActive && (
                <Box className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-primary-light shadow-[0_0_15px_rgba(0,132,255,0.8)] animate-pulse" />
              )}
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
}
