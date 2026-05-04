"use client";;
import React from 'react';
import { Box } from './Box';
import { Stack } from './Stack';
import { Flex } from './Flex';
import { Grid } from './Grid';

import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";

interface NumberPickerProps {
  num?: string;
  label?: string;
  subLabel?: string;
  maxSelections?: number;
  selectedNumbers?: number[];
  onSelectionChange?: (numbers: number[]) => void;
  className?: string;
}

export function NumberPicker({
  num,
  label = "Seletor Quina",
  subLabel = "Escolha 5 dezenas para o bilhete",
  maxSelections = 5,
  selectedNumbers = [],
  onSelectionChange,
  className = ""
}: NumberPickerProps) {
  const toggleNumber = (n: number) => {
    let newSelected;
    if (selectedNumbers.includes(n)) {
      newSelected = selectedNumbers.filter(num => num !== n);
    } else {
      if (selectedNumbers.length < maxSelections) {
        newSelected = [...selectedNumbers, n].sort((a, b) => a - b);
      } else {
        return; // Max reached
      }
    }
    onSelectionChange?.(newSelected);
  };

  return (
    <Box padding={4} bg="glass" border="glass" className={className}>
      <Stack gap={5}>
        <Stack gap={1}>
          <Flex gap={4} align="center">
            {num && <Text color="primary" className="italic font-black text-xl" as="span">{num}.</Text>}
            <Heading level={3} size="xl">{label}</Heading>
          </Flex>
          <Text variant="tiny" className="opacity-60 uppercase italic font-black tracking-widest">{subLabel}</Text>
        </Stack>

        <Grid cols={10} gap={1}>
          {Array.from({ length: 80 }, (_, i) => i + 1).map((num) => {
            const isSelected = selectedNumbers.includes(num);
            return (
              <Button
                key={num}
                type="button"
                variant={isSelected ? 'primary' : 'glass'}
                fullWidth
                onClick={() => toggleNumber(num)}
                className={`h-9 p-0 rounded-[5px] text-[10px] font-black italic flex items-center justify-center transition-all
                  ${isSelected
                    ? 'shadow-lg shadow-primary-light/30 z-10'
                    : 'btn-number-subtle  hover:opacity-100'}`}
              >
                {num.toString().padStart(2, '0')}
              </Button>
            );
          })}
        </Grid>

        <Stack gap={3}>
          <Box className="ui-divider-line" />
          <Flex direction="col" gap={4} className="md:flex-row md:justify-between md:items-center">
            <Text
              variant="tiny"
              className="opacity-60 uppercase italic font-black tracking-widest"
              as="span">Selecionados: {selectedNumbers.length}/{maxSelections}</Text>
            <Button
              type="button"
              variant="danger"
              size="sm"
              fullWidth
              onClick={() => { onSelectionChange?.([]); }}
              className="text-error md:w-auto"
            >
              Limpar
            </Button>
          </Flex>
        </Stack>
      </Stack>
    </Box>
  );
}
