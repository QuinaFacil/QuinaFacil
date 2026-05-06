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
    sellers?: { id: string; name: string; manager_id?: string; city?: string; city_id?: string }[];
    cities?: { id: string; name: string }[];
    states?: string[];
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
  state: string;
};

export function ReportFilters({ options, onFilter, variant = 'manager' }: ReportFiltersProps) {
  const [filters, setFilters] = useState<ReportFilterValues>(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    return {
      dateStart: start.toISOString().split('T')[0],
      dateEnd: end.toISOString().split('T')[0],
      managerId: 'all',
      sellerId: 'all',
      city: 'all',
      state: 'all'
    };
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

  // Filtros Independentes: Sempre mostram todas as opções
  const availableManagers = options?.managers || [];
  const availableSellers = options?.sellers || [];
  const availableCities = options?.cities || [];
  const availableStates = options?.states || [];

  const isSeller = variant === 'seller';
  const isAdmin = variant === 'admin';

  // Handlers Individuais
  const handleStateChange = (val: string) => {
    setFilters(prev => ({ ...prev, state: val }));
  };

  const handleCityChange = (val: string) => {
    setFilters(prev => ({ ...prev, city: val }));
  };

  const handleManagerChange = (val: string) => {
    setFilters(prev => ({ ...prev, managerId: val }));
  };

  const handleSellerChange = (val: string) => {
    setFilters(prev => ({ ...prev, sellerId: val }));
  };

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

        {/* Row 2: Filtros de Hierarquia */}
        {!isSeller && (
          <Flex direction="col" gap={4} className="lg:flex-row lg:items-end">
            
            {/* 0. Estado */}
            {isAdmin && availableStates.length > 0 && (
              <CustomSelect
                className="flex-1"
                label="Estado"
                options={[
                  { value: 'all', label: 'Todos os Estados' },
                  ...availableStates.map((s: string) => ({ value: s, label: s }))
                ]}
                value={filters.state}
                onChange={handleStateChange}
              />
            )}

            {/* 1. Cidade */}
            {isAdmin && options?.cities && (
              <CustomSelect
                className="flex-1"
                label="Cidade"
                options={[
                  { value: 'all', label: 'Todas as Cidades' },
                  ...availableCities.map(c => ({ value: c.name, label: c.name }))
                ]}
                value={filters.city}
                onChange={handleCityChange}
              />
            )}

            {/* 2. Gerente */}
            {isAdmin && (
              <CustomSelect
                className="flex-1"
                label="Gerente"
                options={[
                  { value: 'all', label: 'Todos os Gerentes' },
                  ...availableManagers.map(m => ({ value: m.id, label: m.name }))
                ]}
                value={filters.managerId}
                onChange={handleManagerChange}
              />
            )}

            {/* 3. Vendedor */}
            <CustomSelect
              className="flex-1"
              label="Vendedor"
              options={[
                { value: 'all', label: 'Todos os Vendedores' },
                ...availableSellers.map(s => ({ value: s.id, label: s.name }))
              ]}
              value={filters.sellerId}
              onChange={handleSellerChange}
            />

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
