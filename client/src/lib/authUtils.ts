import { queryClient } from './queryClient';

export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

export const logout = async () => {
  // Remove token do localStorage
  localStorage.removeItem('token');

  // Limpa todas as queries do cache
  queryClient.clear();

  try {
    // Faz requisição de logout no servidor
    await fetch('/api/auth/logout', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Erro no logout:', error);
  } finally {
    // Redireciona para login
    window.location.href = '/login';
  }
};