import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Store, Palette, Globe, ShoppingBag, Package, Users } from "lucide-react";

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

interface Product {
  id: number;
  name: string;
  price: string;
  imageUrl?: string;
  description?: string;
  stock: number;
  isActive: boolean;
}

export default function TenantStore() {
  const [match, params] = useRoute("/store/:slug");
  const slug = params?.slug;
  const { toast } = useToast();
  const [tenantTheme, setTenantTheme] = useState<{ primary: string; secondary: string } | null>(null);

  // Buscar dados do tenant
  const { data: tenant, isLoading: tenantLoading, error: tenantError } = useQuery({
    queryKey: [`/api/tenants/${slug}`],
    enabled: !!slug,
  });

  // Buscar produtos do tenant
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      return apiRequest(`/api/products?tenantId=${tenant.id}`);
    },
    enabled: !!tenant?.id,
  });

  // Aplicar tema do tenant
  useEffect(() => {
    if (tenant) {
      setTenantTheme({
        primary: tenant.primaryColor,
        secondary: tenant.secondaryColor,
      });
      
      // Aplicar cores CSS customizadas
      document.documentElement.style.setProperty('--tenant-primary', tenant.primaryColor);
      document.documentElement.style.setProperty('--tenant-secondary', tenant.secondaryColor);
    }

    return () => {
      // Limpar cores quando sair da página
      document.documentElement.style.removeProperty('--tenant-primary');
      document.documentElement.style.removeProperty('--tenant-secondary');
    };
  }, [tenant]);

  if (tenantLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando loja...</div>
        </div>
      </div>
    );
  }

  if (tenantError || !tenant) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <Store className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Loja não encontrada</h2>
          <p className="text-muted-foreground mb-4">
            A loja "{slug}" não existe ou não está ativa.
          </p>
          <Button onClick={() => window.location.href = "/"}>
            Voltar ao início
          </Button>
        </div>
      </div>
    );
  }

  if (!tenant.isActive) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <Store className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Loja temporariamente indisponível</h2>
          <p className="text-muted-foreground mb-4">
            A loja "{tenant.name}" está temporariamente fora do ar.
          </p>
          <Button onClick={() => window.location.href = "/"}>
            Voltar ao início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: `${tenant.secondaryColor}20` }}>
      {/* Header da Loja */}
      <div 
        className="py-16 px-4 text-white"
        style={{ 
          backgroundColor: tenant.primaryColor,
          background: `linear-gradient(135deg, ${tenant.primaryColor} 0%, ${tenant.primaryColor}dd 100%)`
        }}
      >
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <div 
              className="w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center text-3xl font-bold mr-6"
              style={{ backgroundColor: `${tenant.secondaryColor}40` }}
            >
              {tenant.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold mb-2">{tenant.name}</h1>
              <p className="text-lg opacity-90">/{tenant.slug}</p>
            </div>
          </div>
          
          {tenant.description && (
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              {tenant.description}
            </p>
          )}

          <div className="flex items-center justify-center gap-6 mt-8 text-sm opacity-80">
            {tenant.domain && (
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {tenant.domain}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              {products.length} produtos
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="container mx-auto py-12 px-4">
        {/* Estatísticas da Loja */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">produtos ativos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paleta de Cores</CardTitle>
              <Palette className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: tenant.primaryColor }}
                />
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: tenant.secondaryColor }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">tema personalizado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status da Loja</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge variant="default" className="mb-2">Ativa</Badge>
              <p className="text-xs text-muted-foreground">funcionando normalmente</p>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />

        {/* Lista de Produtos */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Produtos da Loja</h2>
            <Badge variant="outline">{products.length} itens</Badge>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product: Product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription>
                      <span className="text-lg font-semibold" style={{ color: tenant.primaryColor }}>
                        R$ {product.price}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {product.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <Badge variant={product.stock > 0 ? "default" : "secondary"}>
                          {product.stock > 0 ? `${product.stock} em estoque` : "Esgotado"}
                        </Badge>
                        
                        <Button 
                          size="sm" 
                          disabled={product.stock === 0}
                          style={{ backgroundColor: tenant.primaryColor }}
                          className="text-white hover:opacity-90"
                        >
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          Comprar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum produto encontrado</h3>
              <p className="text-muted-foreground">
                Esta loja ainda não possui produtos cadastrados.
              </p>
            </div>
          )}
        </div>

        {/* Informações da Loja */}
        <Separator className="my-12" />
        
        <div className="text-center space-y-4">
          <h3 className="text-lg font-medium">Sobre {tenant.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground max-w-2xl mx-auto">
            <div>
              <strong>Criada em:</strong> {new Date(tenant.createdAt).toLocaleDateString('pt-BR')}
            </div>
            <div>
              <strong>Última atualização:</strong> {new Date(tenant.updatedAt).toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}