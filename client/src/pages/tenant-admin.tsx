import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Eye, Edit2, Palette, Globe, Calendar, Store, Plus, X } from "lucide-react";

interface Tenant {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  domain?: string;
  settings?: any;
  isActive: boolean;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export default function TenantAdmin() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [editingTenant, setEditingTenant] = useState<Partial<Tenant>>({});
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [newTenant, setNewTenant] = useState({
    name: "",
    slug: "",
    description: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
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
        contactEmail: "",
        contactPhone: "",
        address: "",
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

  const updateTenantMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Tenant> }) => {
      return apiRequest(`/api/tenants/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenants'] });
      setIsEditDialogOpen(false);
      setEditingTenant({});
      toast({
        title: "Sucesso",
        description: "Tenant atualizado com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar tenant. Tente novamente.",
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

  const handleViewDetails = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsDetailsDialogOpen(true);
  };

  const handleEditTenant = (tenant: Tenant) => {
    setEditingTenant({
      name: tenant.name,
      slug: tenant.slug,
      description: tenant.description || "",
      contactEmail: tenant.contactEmail || "",
      contactPhone: tenant.contactPhone || "",
      address: tenant.address || "",
      domain: tenant.domain || "",
      isActive: tenant.isActive,
    });
    setSelectedTenant(tenant);
    setIsEditDialogOpen(true);
  };

  const handleUpdateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTenant) {
      updateTenantMutation.mutate({
        id: selectedTenant.id,
        data: editingTenant
      });
    }
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
        {(tenants as Tenant[]).map((tenant: Tenant) => (
          <Card key={tenant.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{tenant.name}</CardTitle>
                <Badge variant={tenant.isActive ? "default" : "secondary"}>
                  {tenant.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <CardDescription>{tenant.slug}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                {tenant.description && (
                  <p className="text-muted-foreground line-clamp-2">{tenant.description}</p>
                )}
                
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs">Loja Multi-tenant</span>
                </div>

                {tenant.domain && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs">{tenant.domain}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-2">
                  <Badge variant={tenant.isActive ? "default" : "secondary"}>
                    {tenant.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(`/store/${tenant.slug}`, '_blank')}
                      className="flex items-center gap-1"
                      disabled={!tenant.isActive}
                    >
                      <Store className="w-3 h-3" />
                      Visitar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDetails(tenant)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      Detalhes
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditTenant(tenant)}
                      className="flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      Editar
                    </Button>
                  </div>
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

      {/* Modal de Detalhes do Tenant */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Detalhes do Tenant
            </DialogTitle>
          </DialogHeader>
          
          {selectedTenant && (
            <div className="space-y-6">
              {/* Informações Gerais */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg border-2 flex items-center justify-center bg-primary text-primary-foreground font-bold">
                    {selectedTenant.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedTenant.name}</h3>
                    <p className="text-muted-foreground">/{selectedTenant.slug}</p>
                  </div>
                </div>

                {selectedTenant.description && (
                  <div>
                    <Label className="text-sm font-medium">Descrição</Label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedTenant.description}</p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Status e Configurações */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Badge variant={selectedTenant.isActive ? "default" : "secondary"}>
                        Status
                      </Badge>
                    </Label>
                    <p className="text-sm mt-1">
                      {selectedTenant.isActive ? 'Ativo e funcionando' : 'Inativo'}
                    </p>
                  </div>

                  {selectedTenant.domain && (
                    <div>
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Domínio Personalizado
                      </Label>
                      <p className="text-sm mt-1 font-mono bg-muted px-2 py-1 rounded">
                        {selectedTenant.domain}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {selectedTenant.contactEmail && (
                    <div>
                      <Label className="text-sm font-medium">Email de Contato</Label>
                      <p className="text-sm mt-1">{selectedTenant.contactEmail}</p>
                    </div>
                  )}
                  
                  {selectedTenant.contactPhone && (
                    <div>
                      <Label className="text-sm font-medium">Telefone</Label>
                      <p className="text-sm mt-1">{selectedTenant.contactPhone}</p>
                    </div>
                  )}
                  
                  {selectedTenant.address && (
                    <div>
                      <Label className="text-sm font-medium">Endereço</Label>
                      <p className="text-sm mt-1">{selectedTenant.address}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Metadados */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Informações do Sistema
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID:</span>
                      <span className="font-mono text-xs">{selectedTenant.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Criado em:</span>
                      <span>{new Date(selectedTenant.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Última atualização:</span>
                      <span>{new Date(selectedTenant.updatedAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setIsDetailsDialogOpen(false);
                    handleEditTenant(selectedTenant!);
                  }}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Editar Tenant
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDetailsDialogOpen(false)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Edição do Tenant */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5" />
              Editar Tenant
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleUpdateTenant} className="space-y-4">
            <div>
              <Label htmlFor="editName">Nome</Label>
              <Input
                id="editName"
                value={editingTenant.name || ""}
                onChange={(e) => setEditingTenant(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="editSlug">Slug</Label>
              <Input
                id="editSlug"
                value={editingTenant.slug || ""}
                onChange={(e) => setEditingTenant(prev => ({ ...prev, slug: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="editDescription">Descrição</Label>
              <Textarea
                id="editDescription"
                placeholder="Descrição do tenant..."
                value={editingTenant.description || ""}
                onChange={(e) => setEditingTenant(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="editContactEmail">Email de Contato</Label>
              <Input
                id="editContactEmail"
                type="email"
                placeholder="contato@loja.com"
                value={editingTenant.contactEmail || ""}
                onChange={(e) => setEditingTenant(prev => ({ ...prev, contactEmail: e.target.value }))}
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="editContactPhone">Telefone</Label>
                <Input
                  id="editContactPhone"
                  placeholder="(11) 99999-9999"
                  value={editingTenant.contactPhone || ""}
                  onChange={(e) => setEditingTenant(prev => ({ ...prev, contactPhone: e.target.value }))}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="editDomain">Domínio</Label>
                <Input
                  id="editDomain"
                  placeholder="minha-loja.com"
                  value={editingTenant.domain || ""}
                  onChange={(e) => setEditingTenant(prev => ({ ...prev, domain: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="editAddress">Endereço</Label>
              <Textarea
                id="editAddress"
                placeholder="Endereço completo da loja..."
                value={editingTenant.address || ""}
                onChange={(e) => setEditingTenant(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="editIsActive"
                checked={editingTenant.isActive || false}
                onChange={(e) => setEditingTenant(prev => ({ ...prev, isActive: e.target.checked }))}
                className="h-4 w-4"
              />
              <Label htmlFor="editIsActive">Tenant ativo</Label>
            </div>
            
            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={updateTenantMutation.isPending}
                className="flex-1"
              >
                {updateTenantMutation.isPending ? "Atualizando..." : "Atualizar Tenant"}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}