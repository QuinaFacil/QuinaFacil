"use client";
import React, { useRef, useState } from 'react';
import { Upload, User } from 'lucide-react';
import { Flex } from './Flex';
import { Stack } from './Stack';
import { Text } from './Text';
import { InputField } from "@/components/ui/InputField";

interface ImageUploadProps {
  label?: string;
  error?: string;
  hint?: string;
  value?: string | null;
  onChange?: (file: File | null) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ImageUpload({
  label,
  error,
  hint = 'JPG, PNG OU WEBP • MÁX. 2MB',
  value,
  onChange,
  className = '',
  size = 'md',
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value ?? null);
  const [dragging, setDragging] = useState(false);

  const iconSize = { sm: 20, md: 28, lg: 36 }[size];

  function handleFile(file: File | null) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange?.(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleFile(e.target.files?.[0] ?? null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0] ?? null);
  }


  return (
    <Flex direction="col" gap={2} className={`w-full ${className}`}>
      {label && (
        <Text variant="label" color="primary" className="">{label}</Text>
      )}
      <Flex direction="col" gap={5} align="center" className={`md:flex-row w-full`}>
        {/* Preview */}
        <Flex align="center" justify="center" className="w-full md:w-24 aspect-square rounded-[5px] bg-white/5 border border-white/10 relative overflow-hidden shrink-0">
          {preview ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={preview} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
            </>
          ) : (
            <User size={iconSize} className="text-foreground/20" />
          )}
        </Flex>

        {/* Drop zone */}
        <Flex
          as="button"
          tabIndex={0}
          align="center"
          justify="center"
          gap={4}
          padding={4}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
          onDragOver={(e: React.DragEvent) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`
            flex-1 w-full h-14 rounded-[5px] border border-dashed transition-all cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-primary-light/50
            ${error ? 'border-error/50 bg-error/5' : dragging ? 'border-primary-light bg-primary-light/5 shadow-[0_0_20px_rgba(0,132,255,0.1)]' : 'border-glass-border bg-foreground/[0.02] hover:border-primary-light/50 hover:bg-primary-light/[0.03]'}
          `}
        >
          <Upload size={18} className={dragging ? 'text-primary-light' : 'text-foreground/30'} />
          <Stack gap={0} align="center" className="text-center md:text-left md:items-start">
            <Text variant="auxiliary" className={`font-bold tracking-wide ${dragging ? '!text-primary-light !opacity-100' : ''}`}>
              {dragging ? 'SOLTE AQUI' : 'CLIQUE OU ARRASTE UMA IMAGEM'}
            </Text>
            <Text variant="tiny" className="opacity-40 uppercase tracking-tight">{hint}</Text>
          </Stack>
        </Flex>

        <InputField
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleChange}
        />
      </Flex>
      {error && (
        <Text variant="error" color="error" className="animate-in fade-in slide-in-from-top-1">
          {error}
        </Text>
      )}
    </Flex>
  );
}
