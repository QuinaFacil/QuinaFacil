"use client";

import React, { useState } from 'react';
import { Box } from '@/components/ui/Box';
import { Flex } from '@/components/ui/Flex';
import { Stack } from '@/components/ui/Stack';
import { InputField } from '@/components/ui/InputField';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { Button } from '@/components/ui/Button';
import { Calendar, Search } from 'lucide-react';

interface ReportFiltersProps {
  options?: {
    managers?: { id: string; name: string }[];
    sellers?: { id: string; name: string; manager_id?: string }[];
    cities?: string[];
  };
  onFilter: (filters: ReportFilterValues) => void;
  variant?: 'admin' | 'manager' | 'seller';
}

export type ReportFilterValues = {
  dateStart: string;
  dateEnd: string;
  managerId: string;
  sellerId: string;
  city: string;
};

export function ReportFilters({ options, onFilter, variant = 'manager' }: ReportFiltersProps) {
  const [filters, setFilters] = useState<ReportFilterValues>({
    dateStart: new Date().toISOString().split('T')[0],
    dateEnd: new Date().toISOString().split('T')[0],
    managerId: 'all',
    sellerId: 'all',
    city: 'all'
  });

  const handleQuickDate = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);

    const newFilters = {
      ...filters,
      dateStart: start.toISOString().split('T')[0],
      dateEnd: end.toISOString().split('T')[0]
    };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const filteredSellers = (variant === 'admin' && filters.managerId !== 'all')
    ? (options?.sellers || []).filter(s => s.manager_id === filters.managerId)
    : (options?.sellers || []);

  const isSeller = variant === 'seller';
  const isAdmin = variant === 'admin';

  return (
    <Box padding={6} bg="glass" border="glass" className="border-primary-light/10 overflow-hidden">
      <Stack gap={6}>
        {/* Row 1: Período e Atalhos */}
        <Stack gap={6} className="lg:flex-row lg:items-end">
          <Flex direction="col" gap={4} className="flex-1 md:flex-row min-w-0 w-full">
            <InputField
              label="Data Inicial"
              type="date"
              icon={Calendar}
              className="w-full"
              value={filters.dateStart}
              onChange={(e) => setFilters({ ...filters, dateStart: e.target.value })}
            />
            <InputField
              label="Data Final"
              type="date"
              icon={Calendar}
              className="w-full"
              value={filters.dateEnd}
              onChange={(e) => setFilters({ ...filters, dateEnd: e.target.value })}
            />
          </Flex>

          <Flex gap={2} wrap>
            <Button variant="glass" onClick={() => handleQuickDate(0)}>Hoje</Button>
            <Button variant="glass" onClick={() => handleQuickDate(7)}>7 dias</Button>
            <Button variant="glass" onClick={() => handleQuickDate(30)}>Este Mês</Button>
          </Flex>

          {/* Botão de Filtrar para modo Vendedor */}
          {isSeller && (
            <Button
              variant="primary"
              icon={Search}
              className="lg:w-48"
              onClick={() => onFilter(filters)}
            >
              Filtrar
            </Button>
          )}
        </Stack>

        {/* Row 2: Filtros de Hierarquia (Admin / Manager) */}
        {!isSeller && (
          <Flex direction="col" gap={4} className="lg:flex-row lg:items-end">
            {/* Gerente (Apenas Admin vê) */}
            {isAdmin && (
              <CustomSelect
                className="flex-1"
                label="Gerente"
                options={[
                  { value: 'all', label: 'Todos os Gerentes' },
                  ...(options?.managers || []).map(m => ({ value: m.id, label: m.name }))
                ]}
                value={filters.managerId}
                onChange={(val) => setFilters({ ...filters, managerId: val, sellerId: 'all' })}
              />
            )}

            {/* Vendedor (Admin e Manager veem) */}
            <CustomSelect
              className="flex-1"
              label="Vendedor"
              options={[
                { value: 'all', label: 'Todos os Vendedores' },
                ...filteredSellers.map(s => ({ value: s.id, label: s.name }))
              ]}
              value={filters.sellerId}
              onChange={(val) => setFilters({ ...filters, sellerId: val })}
            />

            {/* Cidade (Apenas Admin vê por padrão, mas Manager poderia se quisesse) */}
            {isAdmin && options?.cities && (
              <CustomSelect
                className="flex-1"
                label="Cidade"
                options={[
                  { value: 'all', label: 'Todas as Cidades' },
                  ...options.cities.map(c => ({ value: c, label: c }))
                ]}
                value={filters.city}
                onChange={(val) => setFilters({ ...filters, city: val })}
              />
            )}

            <Button
              variant="primary"
              icon={Search}
              className="lg:w-48"
              onClick={() => onFilter(filters)}
            >
              Filtrar
            </Button>
          </Flex>
        )}
      </Stack>
    </Box>
  );
}
