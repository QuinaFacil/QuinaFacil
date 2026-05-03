"use client";
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Portal } from './Portal';
import { Box } from './Box';
import { Stack } from './Stack';
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";

interface CustomOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: (string | CustomOption)[];
  label: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSelect?: (value: string) => void; // Para compatibilidade
  className?: string;
}

export function CustomSelect({
  options,
  label,
  value,
  defaultValue,
  onChange,
  onSelect,
  className = ""
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  // Normaliza opções para o formato { value, label }
  const normalizedOptions = options.map(opt =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  // Estado interno para quando não for controlado
  const [internalValue, setInternalValue] = useState(defaultValue || normalizedOptions[0]?.value);
  const selectedValue = value !== undefined ? value : internalValue;
  const selectedOption = normalizedOptions.find(opt => opt.value === selectedValue) || normalizedOptions[0];

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const updatePosition = () => {
      if (isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setCoords({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
    };

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen]);

  return (
    <Stack gap={2} className={`relative ${className}`}>
      <Text variant="label" color="primary" className=" uppercase italic font-black tracking-widest">{label}</Text>
      <Button
        ref={buttonRef}
        type="button"
        variant="glass"
        fullWidth
        onClick={() => setIsOpen(!isOpen)}
        className="!h-14 !px-5 !rounded-[5px] !justify-between group flex items-center"
      >
        <Text
          as="span"
          variant="body"
          className="!text-[11px] font-black italic uppercase tracking-wider text-foreground"
        >
          {selectedOption?.label}
        </Text>
        <ChevronDown 
          size={18} 
          className={`text-foreground/40 transition-transform duration-300 group-hover:text-primary-light shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </Button>
      {isOpen && (
        <Portal>
          <Box
            className="fixed inset-0 z-[9998]"
            onClick={() => setIsOpen(false)}
          />
          <Stack
            bg="glass"
            border="glass"
            padding={2}
            className="absolute z-[9999] shadow-2xl rounded-[5px] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
            style={{
              top: coords.top,
              left: coords.left,
              width: coords.width,
            }}
          >
            {normalizedOptions.map((opt) => (
              <Button
                key={opt.value}
                type="button"
                variant={selectedValue === opt.value ? "primary" : "glass"}
                fullWidth
                onClick={() => {
                  setInternalValue(opt.value);
                  setIsOpen(false);
                  onChange?.(opt.value);
                  onSelect?.(opt.value);
                }}
                className={`!p-4 !h-auto !justify-between !rounded-[5px] !text-[10px] !font-black !italic !uppercase !tracking-widest transition-all duration-200 flex items-center
                  ${selectedValue === opt.value 
                    ? '' 
                    : '!bg-transparent !border-0 text-foreground/40 hover:!bg-primary-light/10 hover:!text-primary-light'}`}
              >
                <Text as="span">{opt.label}</Text>
                {selectedValue === opt.value && <Check size={14} className="shrink-0" />}
              </Button>
            ))}
          </Stack>
        </Portal>
      )}
    </Stack>
  );
}
