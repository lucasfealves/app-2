import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Plus, AlertCircle } from "lucide-react";

export default function ProductsTable() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['/api/products', { page, limit }],
    queryFn: async () => {
      const response = await fetch(`/api/products?page=${page}&limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest('DELETE', `/api/products/${productId}`);
    },
    onSuccess: () => {
      toast({
        title: "Produto excluído",
        description: "Produto excluído com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao excluir produto",
        variant: "destructive",
      });
    },
  });

  const handleDeleteProduct = (productId: number) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      deleteProductMutation.mutate(productId);
    }
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
                <Skeleton className="h-12 w-12" />
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
          Erro ao carregar produtos. Tente novamente.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="material-shadow-1">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Gerenciar Produtos</CardTitle>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products && products.length > 0 ? (
                products.map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
                          {product.imageUrl ? (
                            <img 
                              src={product.imageUrl} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <span className="text-xs">-</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">ID: #{product.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-900">
                        {product.category?.name || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-900">
                        {product.brand?.name || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        R$ {parseFloat(product.price).toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={product.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                        }
                      >
                        {product.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-600 hover:text-red-800"
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={deleteProductMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Nenhum produto encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {products && products.length === limit && (
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
