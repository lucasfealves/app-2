
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Plus, AlertCircle, Tag, Building } from "lucide-react";

export default function CategoriesBrandsTable() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("categories");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Categories queries
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    }
  });

  // Brands queries
  const { data: brands, isLoading: brandsLoading, error: brandsError } = useQuery({
    queryKey: ['/api/brands'],
    queryFn: async () => {
      const response = await fetch('/api/brands');
      if (!response.ok) throw new Error('Failed to fetch brands');
      return response.json();
    }
  });

  // Mutations for categories
  const createCategoryMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      await apiRequest('POST', '/api/categories', data);
    },
    onSuccess: () => {
      toast({
        title: "Categoria criada",
        description: "Categoria criada com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setIsAddDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao criar categoria",
        variant: "destructive",
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name: string; description?: string } }) => {
      await apiRequest('PUT', `/api/categories/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Categoria atualizada",
        description: "Categoria atualizada com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setEditingItem(null);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar categoria",
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/categories/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Categoria excluída",
        description: "Categoria excluída com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao excluir categoria",
        variant: "destructive",
      });
    },
  });

  // Mutations for brands
  const createBrandMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      await apiRequest('POST', '/api/brands', data);
    },
    onSuccess: () => {
      toast({
        title: "Marca criada",
        description: "Marca criada com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/brands'] });
      setIsAddDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao criar marca",
        variant: "destructive",
      });
    },
  });

  const updateBrandMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name: string; description?: string } }) => {
      await apiRequest('PUT', `/api/brands/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Marca atualizada",
        description: "Marca atualizada com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/brands'] });
      setEditingItem(null);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar marca",
        variant: "destructive",
      });
    },
  });

  const deleteBrandMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/brands/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Marca excluída",
        description: "Marca excluída com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/brands'] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao excluir marca",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    if (editingItem) {
      if (activeTab === 'categories') {
        updateCategoryMutation.mutate({ id: editingItem.id, data: { name, description } });
      } else {
        updateBrandMutation.mutate({ id: editingItem.id, data: { name, description } });
      }
    } else {
      if (activeTab === 'categories') {
        createCategoryMutation.mutate({ name, description });
      } else {
        createBrandMutation.mutate({ name, description });
      }
    }
  };

  const handleDelete = (id: number) => {
    if (confirm(`Tem certeza que deseja excluir este ${activeTab === 'categories' ? 'categoria' : 'marca'}?`)) {
      if (activeTab === 'categories') {
        deleteCategoryMutation.mutate(id);
      } else {
        deleteBrandMutation.mutate(id);
      }
    }
  };

  const FormDialog = ({ children }: { children: React.ReactNode }) => (
    <Dialog open={isAddDialogOpen || !!editingItem} onOpenChange={(open) => {
      if (!open) {
        setIsAddDialogOpen(false);
        setEditingItem(null);
      }
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingItem ? 'Editar' : 'Adicionar'} {activeTab === 'categories' ? 'Categoria' : 'Marca'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              defaultValue={editingItem?.name || ''}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={editingItem?.description || ''}
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              setEditingItem(null);
            }}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingItem ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );

  const isLoading = activeTab === 'categories' ? categoriesLoading : brandsLoading;
  const error = activeTab === 'categories' ? categoriesError : brandsError;
  const data = activeTab === 'categories' ? categories : brands;

  return (
    <Card className="material-shadow-1">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Gerenciar Categorias e Marcas</CardTitle>
          <FormDialog>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar {activeTab === 'categories' ? 'Categoria' : 'Marca'}
            </Button>
          </FormDialog>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="categories" className="flex items-center">
              <Tag className="h-4 w-4 mr-2" />
              Categorias
            </TabsTrigger>
            <TabsTrigger value="brands" className="flex items-center">
              <Building className="h-4 w-4 mr-2" />
              Marcas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Erro ao carregar categorias. Tente novamente.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Produtos</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data && data.length > 0 ? (
                      data.map((category: any) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell className="text-gray-600">
                            {category.description || 'Sem descrição'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {category._count?.products || 0} produtos
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => setEditingItem(category)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-red-600 hover:text-red-800"
                                onClick={() => handleDelete(category.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                          Nenhuma categoria encontrada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="brands">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Erro ao carregar marcas. Tente novamente.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Produtos</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data && data.length > 0 ? (
                      data.map((brand: any) => (
                        <TableRow key={brand.id}>
                          <TableCell className="font-medium">{brand.name}</TableCell>
                          <TableCell className="text-gray-600">
                            {brand.description || 'Sem descrição'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {brand._count?.products || 0} produtos
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => setEditingItem(brand)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-red-600 hover:text-red-800"
                                onClick={() => handleDelete(brand.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                          Nenhuma marca encontrada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <FormDialog>
        <div />
      </FormDialog>
    </Card>
  );
}
