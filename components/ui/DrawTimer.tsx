/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

import { Box } from './Box';
import { Stack } from './Stack';
import { Text } from './Text';
import { Heading } from './Heading';

interface DrawTimerProps {
  time?: string; // Fallback ou tempo inicial
  progress: number; // 0 to 100
  label?: string;
  statusText?: string;
  className?: string;
  endTime?: string | Date; // Adicionado para contagem real-time
}

export function DrawTimer({
  time: initialTime,
  progress,
  label = "Contagem Regressiva",
  statusText = "O sorteio encerra em instantes!",
  className = "",
  endTime
}: DrawTimerProps) {
  // Inicializa displayTime com initialTime se disponível para evitar set-state-in-effect síncrono
  const [displayTime, setDisplayTime] = useState(initialTime || "--:--");

  useEffect(() => {
    if (!endTime) {
      if (initialTime && initialTime !== displayTime) {
        setDisplayTime(initialTime);
      }
      return;
    }

    const target = new Date(endTime).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setDisplayTime("00:00:00");
        return;
      }

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      const hStr = hours.toString().padStart(2, '0');
      const mStr = minutes.toString().padStart(2, '0');
      const sStr = seconds.toString().padStart(2, '0');

      setDisplayTime(`${hStr}:${mStr}:${sStr}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endTime, initialTime, displayTime]);

  return (
    <Box bg="glass" padding={6} rounded="md" className={`relative overflow-hidden ${className}`}>
      <Box className="absolute top-0 right-0 p-4 opacity-5">
        <Clock size={120} />
      </Box>

      <Stack gap={6}>
        <Text variant="tiny" className="opacity-60 uppercase italic font-black tracking-widest">{label}</Text>

        <Stack gap={1}>
          <Heading
            className="text-3xl md:text-5xl tabular-nums break-all"
            level={3}>{displayTime}</Heading>
          <Text
            variant="tiny"
            className="font-black italic uppercase text-warning"
          >{statusText}</Text>
        </Stack>

        <Box bg="muted" rounded="full" className="w-full h-1 overflow-hidden">
          <Box
            as="div"
            style={{ width: `${progress}%` }}
            className="h-full bg-linear-to-r from-primary-light to-blue-400 transition-all duration-1000"
          />
        </Box>
      </Stack>
    </Box>
  );
}
