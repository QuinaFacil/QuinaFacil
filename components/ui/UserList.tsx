"use client";

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsersAction, toggleUserStatusAction, deleteUserAction, createUserAction, updateUserAction, getGerentesAction } from '@/app/(dashboard)/admin/usuarios/actions';
import { logout } from '@/app/(auth)/login/actions';
import { getCurrentUserProfileAction } from '@/app/(dashboard)/actions';
import { ListRow } from '@/components/ui/ListRow';
import { Badge } from '@/components/ui/Badge';
import { Box } from '@/components/ui/Box';
import { Flex } from '@/components/ui/Flex';
import { Stack } from '@/components/ui/Stack';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { UserModal, type UserProfile, type UserInput } from '@/components/ui/UserModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { User, Shield, Briefcase, UserCheck, Phone, Edit2, Trash2, Power, MapPin, Wallet, Loader2, Users } from 'lucide-react';

export interface UserListHandle {
  openNew: () => void;
}

export const UserList = React.forwardRef<UserListHandle, Record<string, unknown>>((_, ref) => {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = React.useState<UserProfile | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState<string | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsersAction()
  });

  const { data: currentUser } = useQuery({
    queryKey: ['current-user-profile'],
    queryFn: () => getCurrentUserProfileAction()
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string, active: boolean }) => toggleUserStatusAction(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUserAction(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      // Se eu me auto remover, devo ser deslogado imediatamente
      if (currentUser?.id === deletedId) {
        logout();
      } else {
        setUserToDelete(null);
      }
    }
  });

  const handleEdit = (user: UserProfile) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    setSelectedUser(undefined);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (data: UserInput) => {
    if (!selectedUser) {
      const result = await createUserAction(data);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        queryClient.invalidateQueries({ queryKey: ['gerentes-options'] });
      }
      return result;
    } else {
      const result = await updateUserAction(selectedUser.id, data);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        queryClient.invalidateQueries({ queryKey: ['gerentes-options'] });
      }
      return result;
    }
  };

  React.useImperativeHandle(ref, () => ({
    openNew: handleOpenNew
  }));

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete);
    }
  };

  if (isLoading) {
    return (
      <Flex direction="col" align="center" justify="center" padding={10} className=" w-full min-h-[200px]">
        <Loader2 className="animate-spin text-primary-light" size={32} />
        <Text variant="label">Carregando usuários...</Text>
      </Flex>
    );
  }

  if (!users || users.length === 0) {
    return (
      <EmptyState 
        icon={Users} 
        description="Nenhum usuário encontrado no sistema." 
        minHeight={300}
      />
    );
  }

  return (
    <>
      <Box padding={0} bg="glass" border="glass" className="overflow-hidden w-full">
        {(users as unknown as UserProfile[]).map((user) => {
          const roleConfig = ({
            admin: { icon: Shield, label: 'Admin' },
            gerente: { icon: Briefcase, label: 'Gerente' },
            vendedor: { icon: User, label: 'Vendedor' }
          } as const)[user.role as 'admin' | 'gerente' | 'vendedor'] || { icon: User, label: 'Usuário' };

          return (
            <ListRow
              key={user.id}
              title={user.name || 'Sem Nome'}
              sub={user.email}
              amount={user.active ? 'Ativo' : 'Inativo'}
              time={`Desde ${new Date(user.created_at).toLocaleDateString('pt-BR')}`}
              variant={user.active ? 'success' : 'error'}
              icon={user.avatar_url ? undefined : roleConfig.icon}
              image={user.avatar_url}
              className="cursor-default"
              actions={
                <Flex gap={2}>
                  <Button
                    variant="glass"
                    icon={Edit2}
                    size="icon"
                    onClick={() => handleEdit(user)}
                  />
                  <Button
                    variant={user.active ? "success" : "danger"}
                    icon={Power}
                    size="icon"
                    onClick={() => toggleMutation.mutate({ id: user.id, active: !user.active })}
                  />
                  <Button
                    variant="glass"
                    icon={Trash2}
                    size="icon"
                    onClick={() => setUserToDelete(user.id)}
                  />
                </Flex>
              }
            >
              <Stack gap={3} align="end" className="w-full">
                <Flex align="center" gap={2} wrap justify="end" className="w-full">
                  <Badge
                    variant={user.role === 'admin' ? 'error' : user.role === 'gerente' ? 'info' : 'success'}
                    icon={roleConfig.icon}
                    size="xs"
                  >
                    {roleConfig.label}
                  </Badge>

                  {user.phone && (
                    <Badge variant="success" icon={Phone} size="xs">
                      {user.phone}
                    </Badge>
                  )}

                  {user.pix_key && user.role !== 'gerente' && (
                    <Badge variant="warning" icon={Wallet} size="xs">
                      PIX: {user.pix_key}
                    </Badge>
                  )}
                </Flex>

                <Flex align="center" gap={2} wrap justify="end" className="w-full">
                  {user.manager && (
                    <Badge variant="info" icon={UserCheck} size="xs">
                      Gerente: {user.manager.name}
                    </Badge>
                  )}

                  {user.city && (
                    <Badge
                      variant="info"
                      icon={MapPin}
                      size="xs"
                    >
                      {user.city}
                    </Badge>
                  )}
                </Flex>
              </Stack>
            </ListRow>
          );
        })}
      </Box>

      <UserModal
        key={selectedUser?.id || 'new'}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(undefined);
        }}
        selectedUser={selectedUser}
        onSubmit={handleModalSubmit}
        getGerentes={getGerentesAction}
      />

      <Modal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        title="Confirmar Exclusão"
        footer={
          <Stack direction="row" gap={3} className="w-full">
            <Button variant="glass" onClick={() => setUserToDelete(null)} fullWidth>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm} loading={deleteMutation.isPending} fullWidth>
              Excluir Permanentemente
            </Button>
          </Stack>
        }
      >
        <Stack gap={3}>
          <Text variant="body">
            Você está prestes a excluir este usuário do sistema de forma permanente.
          </Text>
          <Text variant="description" color="error">
            Esta ação não pode ser desfeita e removerá todos os acessos do usuário imediatamente.
          </Text>
        </Stack>
      </Modal>
    </>
  );
});

UserList.displayName = 'UserList';
