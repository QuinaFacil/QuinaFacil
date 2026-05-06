"use client";

import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Box } from './Box';
import { Stack } from './Stack';
import { Flex } from './Flex';
import { Text } from './Text';
import { Button } from './Button';
import { InputField } from './InputField';
import { Clock, Save, CheckCircle2, AlertTriangle } from 'lucide-react';
import { getSalesScheduleAction, saveSalesScheduleAction } from '@/app/(dashboard)/admin/concursos/actions';

interface SimpleSchedule {
  openTime: string;
  closeTime: string;
  activeDays: number[];
}

const DAYS = [
  { id: 0, label: 'D' },
  { id: 1, label: 'S' },
  { id: 2, label: 'T' },
  { id: 3, label: 'Q' },
  { id: 4, label: 'Q' },
  { id: 5, label: 'S' },
  { id: 6, label: 'S' },
];

interface SalesScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SalesScheduleModal({ isOpen, onClose }: SalesScheduleModalProps) {
  const [schedule, setSchedule] = useState<SimpleSchedule>({
    openTime: '08:00',
    closeTime: '20:00',
    activeDays: [1, 2, 3, 4, 5, 6]
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const loadSchedule = async () => {
    try {
      const data = await getSalesScheduleAction();
      if (data && data.activeDays) {
        setSchedule(data);
      }
    } catch {
      // Ignored for now
    }
  };

  useEffect(() => {
    if (isOpen) {
      const fetchSchedule = async () => {
        await loadSchedule();
      };
      fetchSchedule();
    }
  }, [isOpen]);

  const toggleDay = (dayId: number) => {
    setSchedule(prev => ({
      ...prev,
      activeDays: prev.activeDays.includes(dayId)
        ? prev.activeDays.filter(id => id !== dayId)
        : [...prev.activeDays, dayId].sort()
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await saveSalesScheduleAction(schedule);
      setMessage({ text: 'Configurações de vendas salvas!', type: 'success' });
      setTimeout(() => onClose(), 1500);
    } catch {
      setMessage({ text: 'Erro ao salvar.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Horários de Venda"
      footer={
        <Stack direction="row" gap={3} className="w-full">
          <Button variant="glass" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSave} 
            loading={saving} 
            icon={Save} 
            className="flex-1"
          >
            Salvar
          </Button>
        </Stack>
      }
    >
      <Stack gap={8} padding={0}>
        
        {/* Dias da Semana */}
        <Stack gap={2}>
          <Text variant="label" weight="bold">Dias de Venda Aberta</Text>
          <Flex gap={2} justify="start" wrap>
            {DAYS.map((day) => {
              const isActive = schedule.activeDays.includes(day.id);
              return (
                <Flex
                  key={day.id}
                  padding={0}
                  align="center"
                  justify="center"
                  onClick={() => toggleDay(day.id)}
                  className={`
                    w-10 h-10 rounded-full font-bold transition-all duration-200 text-sm cursor-pointer
                    ${isActive 
                      ? 'bg-primary-light text-white shadow-lg shadow-primary-light/20 scale-105' 
                      : 'bg-white/5 text-muted hover:bg-white/10'
                    }
                  `}
                >
                  {day.label}
                </Flex>
              );
            })}
          </Flex>
        </Stack>

        {/* Horários */}
        <Stack gap={3}>
          <Text variant="label" weight="bold">Intervalo de Horário</Text>
          <Box padding={6} bg="glass" border="glass" className="bg-white/5">
            <Flex align="center" gap={4} justify="center">
              <Stack gap={1} className="flex-1">
                <Text variant="tiny" color="muted">Abertura</Text>
                <InputField
                  type="time"
                  value={schedule.openTime}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSchedule(prev => ({ ...prev, openTime: e.target.value }))}
                  className="text-xl h-14"
                />
              </Stack>
              
              <Flex padding={0} align="center" className="h-full">
                <Clock size={24} className="text-muted" />
              </Flex>

              <Stack gap={1} className="flex-1">
                <Text variant="tiny" color="muted">Encerramento</Text>
                <InputField
                  type="time"
                  value={schedule.closeTime}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSchedule(prev => ({ ...prev, closeTime: e.target.value }))}
                  className="text-xl h-14"
                />
              </Stack>
            </Flex>
          </Box>
        </Stack>

        {message && (
          <Flex align="center" gap={2} className={`${message.type === 'success' ? 'text-success' : 'text-error'} justify-center`}>
            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <Text variant="tiny" color="inherit">{message.text}</Text>
          </Flex>
        )}
      </Stack>
    </Modal>
  );
}
