import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminUsers } from "@/hooks/useAdminQueries";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Edit, UserX, UserPlus, Shield, AlertCircle } from "lucide-react";

export default function UsersTable() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: users, isLoading, error } = useAdminUsers({
    page,
    limit
  });

  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ userId, isBlocked }: { userId: string; isBlocked: boolean }) => {
      return apiRequest(`/api/admin/users/${userId}/block`, {
        method: 'PUT',
        body: JSON.stringify({ isBlocked })
      });
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Status do usuário atualizado com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do usuário",
        variant: "destructive",
      });
    },
  });

  const getUserInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || 'U';
  };

  const getRandomColor = (id: string) => {
    const colors = ['bg-primary/50', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-red-500'];
    const index = parseInt(id) % colors.length;
    return colors[index];
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar usuários. Tente novamente.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="material-shadow-1">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Gerenciar Usuários</CardTitle>
          <Button className="bg-primary hover:bg-primary/90">
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Último Acesso</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users && users.length > 0 ? (
                users.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 ${getRandomColor(user.id)} rounded-full flex items-center justify-center text-primary-foreground font-medium`}>
                          {user.profileImageUrl ? (
                            <img 
                              src={user.profileImageUrl} 
                              alt={`${user.firstName} ${user.lastName}`}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            getUserInitials(user.firstName, user.lastName)
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-gray-500">ID: #{user.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-900">{user.email}</span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={user.isAdmin 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {user.isAdmin ? 'Admin' : 'Cliente'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={user.isBlocked 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                        }
                      >
                        {user.isBlocked ? 'Bloqueado' : 'Ativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-900">
                        {user.updatedAt 
                          ? new Date(user.updatedAt).toLocaleDateString('pt-BR')
                          : 'N/A'
                        }
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          title="Editar usuário"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-primary"
                          title="Promover/Rebaixar admin"
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={`h-8 w-8 ${user.isBlocked ? 'text-green-600' : 'text-red-600'}`}
                          title={user.isBlocked ? "Desbloquear usuário" : "Bloquear usuário"}
                          onClick={() => updateUserStatusMutation.mutate({ 
                            userId: user.id, 
                            isBlocked: !user.isBlocked 
                          })}
                          disabled={updateUserStatusMutation.isPending}
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    <div className="flex flex-col items-center space-y-3">
                      <UserPlus className="h-12 w-12 text-gray-400" />
                      <p>Nenhum usuário encontrado</p>
                      <p className="text-sm">
                        Comece criando uma conta de usuário
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {users && users.length === limit && (
          <div className="flex justify-center mt-6">
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <Button 
                variant="outline"
                onClick={() => setPage(p => p + 1)}
              >
                Próximo
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}