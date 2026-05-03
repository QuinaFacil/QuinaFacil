"use server";

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { data: { user }, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Credenciais inválidas. Verifique seu e-mail e senha." };
  }

  if (user) {
    // Verificar se o usuário está ativo
    const { data: profile } = await supabase
      .from('profiles')
      .select('active')
      .eq('id', user.id)
      .single();

    if (profile && !profile.active) {
      await supabase.auth.signOut();
      return { error: "Sua conta está desativada. Entre em contato com o administrador." };
    }
  }

  // Redireciona para o dashboard após o login
  redirect('/dashboard');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
