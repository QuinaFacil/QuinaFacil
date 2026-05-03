import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      '[updateSession] Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY (ex.: em Vercel → Settings → Environment Variables).'
    )
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Sem landing: raiz vai direto para o login (quem já está logado cai no bloco abaixo e vai ao dashboard)
  if (!user && pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Proteção básica: Se não estiver logado
  if (!user && (pathname.startsWith('/admin') || pathname.startsWith('/vendedor') || pathname.startsWith('/gerente') || pathname.startsWith('/dashboard'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Lógica de Redirecionamento por Role
  if (user) {
    // Buscamos o profile para saber o cargo
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, active')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Middleware: Erro ao buscar profile:', profileError.message)
    }

    const role = profile?.role || null
    const isActive = profile?.active ?? true // Fallback para true se não encontrar profile

    // Debug para terminal
    console.log(`[Middleware] User: ${user.email} | Role: ${role} | Active: ${isActive} | Path: ${pathname}`)

    // BLOQUEIO: Se o usuário estiver desativado, barramos o acesso a qualquer rota exceto logout (se houver) ou login
    if (!isActive && pathname !== '/login') {
      console.warn(`[Middleware] Usuário desativado tentando acessar: ${pathname}`)
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      // Opcional: Adicionar um parâmetro para avisar o usuário
      url.searchParams.set('error', 'deactivated')
      return NextResponse.redirect(url)
    }

    // Tenta pegar o cargo do metadado como fallback (Plano B)
    const userRole = role || user.user_metadata?.role || null

    // Se estiver no login, só redireciona se já tiver um cargo (já está logado)
    if (pathname === '/login') {
      if (userRole) {
        const url = request.nextUrl.clone()
        url.pathname = `/${userRole}/dashboard`
        return NextResponse.redirect(url)
      }
      return supabaseResponse
    }

    // Se não conseguirmos determinar o cargo, não podemos prosseguir para áreas restritas
    if (!userRole && (pathname.startsWith('/admin') || pathname.startsWith('/vendedor') || pathname.startsWith('/gerente') || pathname === '/dashboard')) {
      console.warn('[Middleware] Cargo não encontrado. Redirecionando para login.')
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Redirecionamentos de conveniência (Raiz ou Dashboard genérico)
    if (pathname === '/' || pathname === '/dashboard') {
      if (!userRole) {
        return supabaseResponse
      }
      const url = request.nextUrl.clone()
      url.pathname = `/${userRole}/dashboard`
      return NextResponse.redirect(url)
    }

    // Bloqueio de rotas cruzadas (Segurança Estrita por Role)
    const isAccessingAdmin = pathname.startsWith('/admin')
    const isAccessingGerente = pathname.startsWith('/gerente')
    const isAccessingVendedor = pathname.startsWith('/vendedor')

    // REDIRECIONAMENTO AGRESSIVO PARA ADMIN (Exceto design-system e outros documentos livres)
    if (userRole === 'admin' && !isAccessingAdmin && !pathname.startsWith('/ticket') && pathname !== '/design-system') {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/dashboard'
      return NextResponse.redirect(url)
    }

    // Se acessar rota de outro cargo, redireciona para o dashboard correto
    const destRole = userRole ?? role
    if (isAccessingAdmin && role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = destRole ? `/${destRole}/dashboard` : '/login'
      return NextResponse.redirect(url)
    }

    if (isAccessingGerente && role !== 'gerente') {
      const url = request.nextUrl.clone()
      url.pathname = destRole ? `/${destRole}/dashboard` : '/login'
      return NextResponse.redirect(url)
    }

    if (isAccessingVendedor && role !== 'vendedor') {
      const url = request.nextUrl.clone()
      url.pathname = destRole ? `/${destRole}/dashboard` : '/login'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
