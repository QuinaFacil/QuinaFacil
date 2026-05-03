"use client";

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSellersAction, toggleSellerStatusAction, deleteSellerAction } from '@/app/(dashboard)/gerente/vendedores/actions';
import { ListRow } from '@/components/ui/ListRow';
import { Badge } from '@/components/ui/Badge';
import { Box } from '@/components/ui/Box';
import { Flex } from '@/components/ui/Flex';
import { Stack } from '@/components/ui/Stack';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { SellerModal, type Seller } from '@/components/ui/SellerModal';
import { User, Phone, Edit2, Trash2, Power, MapPin, Wallet, Loader2 } from 'lucide-react';

export interface SellerListHandle {
  openNew: () => void;
}

export const SellerList = React.forwardRef<SellerListHandle, Record<string, unknown>>((_, ref) => {
  const queryClient = useQueryClient();
  const [selectedSeller, setSelectedSeller] = React.useState<Seller | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [sellerToDelete, setSellerToDelete] = React.useState<string | null>(null);
  
  const { data: sellers, isLoading } = useQuery({
    queryKey: ['sellers'],
    queryFn: () => getSellersAction()
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string, active: boolean }) => toggleSellerStatusAction(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSellerAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
      setSellerToDelete(null);
    }
  });

  const handleEdit = (seller: Seller) => {
    setSelectedSeller(seller);
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    setSelectedSeller(null);
    setIsModalOpen(true);
  };

  React.useImperativeHandle(ref, () => ({
    openNew: handleOpenNew
  }));

  const handleDeleteConfirm = () => {
    if (sellerToDelete) {
      deleteMutation.mutate(sellerToDelete);
    }
  };

  if (isLoading) {
    return (
      <Flex align="center" justify="center" padding={10} className="w-full">
        <Stack gap={4} align="center">
          <Loader2 className="animate-spin text-primary-light" size={32} />
          <Text variant="label" color="muted">Carregando sua equipe...</Text>
        </Stack>
      </Flex>
    );
  }

  if (!sellers || sellers.length === 0) {
    return (
      <Box padding={12} bg="glass" border="glass" className="text-center border-dashed border-white/10">
        <Stack gap={4} align="center">
          <User size={48} className="opacity-10" />
          <Stack gap={1}>
            <Text variant="label" color="muted">Sua equipe está vazia</Text>
            <Text variant="tiny" color="muted">Cadastre seu primeiro vendedor para começar as vendas.</Text>
          </Stack>
        </Stack>
      </Box>
    );
  }

  return (
    <>
      <Box padding={0} bg="glass" border="glass" className="overflow-hidden w-full">
        {(sellers as Seller[]).map((seller: Seller) => (
          <ListRow
            key={seller.id}
            title={seller.name || 'Sem Nome'}
            sub={seller.email} 
            amount={seller.active ? 'Ativo' : 'Inativo'}
            time={`Desde ${new Date(seller.created_at || Date.now()).toLocaleDateString('pt-BR')}`}
            variant={seller.active ? 'success' : 'error'}
            icon={seller.avatar_url ? undefined : User}
            image={seller.avatar_url || undefined}
            className="cursor-default"
            actions={
              <Flex gap={2}>
                <Button 
                  variant="glass" 
                  icon={Edit2} 
                  size="icon"
                  onClick={() => handleEdit(seller)}
                />
                <Button 
                  variant={seller.active ? "success" : "danger"}
                  icon={Power} 
                  size="icon"
                  onClick={() => toggleMutation.mutate({ id: seller.id, active: !seller.active })}
                />
                <Button 
                  variant="glass" 
                  icon={Trash2} 
                  size="icon"
                  onClick={() => setSellerToDelete(seller.id)}
                />
              </Flex>
            }
          >
            <Flex align="center" gap={3} wrap justify="end">
               {seller.phone && (
                 <Badge variant="success" icon={Phone} className="shrink-0">
                   {seller.phone}
                 </Badge>
               )}

               {seller.pix_key && (
                 <Badge variant="warning" icon={Wallet} className="shrink-0">
                   {seller.pix_key}
                 </Badge>
               )}
               
               <Badge variant="info" icon={MapPin} className="shrink-0">
                 {seller.city || 'Regional'}
               </Badge>
            </Flex>
          </ListRow>
        ))}
      </Box>

      <SellerModal 
        key={selectedSeller?.id || 'new'}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSeller(null);
        }}
        selectedSeller={selectedSeller || undefined}
      />

      <Modal
        isOpen={!!sellerToDelete}
        onClose={() => setSellerToDelete(null)}
        title="Remover Vendedor"
        footer={
          <Stack direction="row" gap={3} className="w-full">
            <Button variant="glass" onClick={() => setSellerToDelete(null)} fullWidth>
              Manter Vendedor
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm} loading={deleteMutation.isPending} fullWidth>
              Confirmar Remoção
            </Button>
          </Stack>
        }
      >
        <Stack gap={3}>
          <Text variant="body">
            Você está prestes a remover este vendedor da sua equipe permanentemente.
          </Text>
          <Text variant="description" color="error">
            Esta ação é irreversível e o vendedor perderá o acesso imediatamente.
          </Text>
        </Stack>
      </Modal>
    </>
  );
});

SellerList.displayName = 'SellerList';
