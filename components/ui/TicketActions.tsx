"use client";

import React from 'react';
import { Printer, Download, Share2 } from 'lucide-react';
import { Button } from './Button';
import { Flex } from './Flex';
import { toPng } from 'html-to-image';

interface TicketActionsProps {
  serialNumber: string;
  targetId?: string;
  className?: string;
}

export function TicketActions({ serialNumber, targetId = 'printable-ticket', className = "" }: TicketActionsProps) {
  const ticketUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/ticket/${serialNumber}`
    : `https://www.quinafacil.com.br/ticket/${serialNumber}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    const element = document.getElementById(targetId);
    if (!element) return;
    
    // Temporarily hide serrated edges for better photo
    const edges = element.querySelectorAll('.serrated-edge');
    edges.forEach(e => (e as HTMLElement).style.opacity = '0');

    try {
      const dataUrl = await toPng(element, {
        backgroundColor: '#FFFFFF',
        pixelRatio: 2,
        cacheBust: true,
      });
      
      const link = document.createElement('a');
      link.download = `quina-facil-${serialNumber.slice(-8)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error generating image:", err);
    } finally {
      edges.forEach(e => (e as HTMLElement).style.opacity = '0.2');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Bilhete Quina Fácil - ${serialNumber}`,
          text: `Confira meu bilhete da Quina Fácil!`,
          url: ticketUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(ticketUrl);
    }
  };

  return (
    <Flex gap={3} className={`w-full max-w-[380px] mx-auto print:hidden ${className}`}>
      <Button 
        variant="glass" 
        fullWidth 
        icon={Printer} 
        onClick={handlePrint} 
        className="h-12"
        title="Imprimir"
      />
      <Button 
        variant="glass" 
        fullWidth 
        icon={Download} 
        onClick={handleDownload} 
        className="h-12"
        title="Baixar Foto"
      />
      <Button 
        variant="primary" 
        fullWidth 
        icon={Share2} 
        onClick={handleShare} 
        className="h-12"
        title="Compartilhar Link"
      />
    </Flex>
  );
}
