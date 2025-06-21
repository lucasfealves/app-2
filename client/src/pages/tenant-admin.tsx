import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  domain?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TenantAdmin() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTenant, setNewTenant] = useState({
    name: "",
    slug: "",
    description: "",
    primaryColor: "#1f2937",
    secondaryColor: "#f3f4f6",
    domain: "",
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ["/api/tenants"],
  });

  const createTenantMutation = useMutation({
    mutationFn: async (data: typeof newTenant) => {
      return apiRequest("/api/tenants", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenants"] });
      setIsCreateDialogOpen(false);
      setNewTenant({
        name: "",
        slug: "",
        description: "",
        primaryColor: "#1f2937",
        secondaryColor: "#f3f4f6",
        domain: "",
      });
      toast({
        title: "Sucesso",
        description: "Tenant criado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar tenant",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenant.name || !newTenant.slug) {
      toast({
        title: "Erro",
        description: "Nome e slug são obrigatórios",
        variant: "destructive",
      });
      return;
    }
    createTenantMutation.mutate(newTenant);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleNameChange = (name: string) => {
    setNewTenant(prev => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando tenants...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Tenants</h1>
          <p className="text-muted-foreground">Configure e gerencie lojas virtuais</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Criar Novo Tenant</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Tenant</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Loja</Label>
                <Input
                  id="name"
                  value={newTenant.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: Minha Loja Virtual"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  value={newTenant.slug}
                  onChange={(e) => setNewTenant(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="minha-loja-virtual"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={newTenant.description}
                  onChange={(e) => setNewTenant(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição da loja"
                />
              </div>
              
              <div>
                <Label htmlFor="domain">Domínio (opcional)</Label>
                <Input
                  id="domain"
                  value={newTenant.domain}
                  onChange={(e) => setNewTenant(prev => ({ ...prev, domain: e.target.value }))}
                  placeholder="minhaloja.com"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Cor Primária</Label>
                  <Input
                    id="primaryColor"
                    type="color"
                    value={newTenant.primaryColor}
                    onChange={(e) => setNewTenant(prev => ({ ...prev, primaryColor: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="secondaryColor">Cor Secundária</Label>
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={newTenant.secondaryColor}
                    onChange={(e) => setNewTenant(prev => ({ ...prev, secondaryColor: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={createTenantMutation.isPending}
                  className="flex-1"
                >
                  {createTenantMutation.isPending ? "Criando..." : "Criar Tenant"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tenants.map((tenant: Tenant) => (
          <Card key={tenant.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{tenant.name}</CardTitle>
                <div 
                  className="w-4 h-4 rounded-full border" 
                  style={{ backgroundColor: tenant.primaryColor }}
                />
              </div>
              <CardDescription>{tenant.slug}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {tenant.description && (
                  <p className="text-muted-foreground">{tenant.description}</p>
                )}
                
                {tenant.domain && (
                  <div>
                    <strong>Domínio:</strong> {tenant.domain}
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <strong>Cores:</strong>
                  <div 
                    className="w-3 h-3 rounded border"
                    style={{ backgroundColor: tenant.primaryColor }}
                  />
                  <div 
                    className="w-3 h-3 rounded border"
                    style={{ backgroundColor: tenant.secondaryColor }}
                  />
                </div>
                
                <div>
                  <strong>Status:</strong> 
                  <span className={`ml-1 ${tenant.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {tenant.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Criado em: {new Date(tenant.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {tenants.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">Nenhum tenant encontrado</h3>
          <p className="text-muted-foreground mb-4">Crie seu primeiro tenant para começar</p>
        </div>
      )}
    </div>
  );
}