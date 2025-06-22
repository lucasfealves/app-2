import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/components/product-card";
import { TenantProductFilters } from "@/components/tenant-product-filters";
import { Store, MapPin, Phone, Mail, Globe } from "lucide-react";

interface Tenant {
  id: number;
  name: string;
  slug: string;
  domain: string | null;
  description: string | null;
  logoUrl: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  isActive: boolean;
  settings: any;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  comparePrice: string | null;
  imageUrl: string | null;
  stock: number;
  isActive: boolean;
  categoryId: number | null;
  brandId: number | null;
  tags: string[] | null;
}

export default function TenantStore() {
  const [location] = useLocation();
  const [filters, setFilters] = useState({
    categoryId: "all" as string,
    brandId: "all" as string,
    search: "",
    minPrice: "" as string,
    maxPrice: "" as string,
    sortBy: "name",
    sortOrder: "asc" as "asc" | "desc",
  });

  // Get current tenant
  const { data: tenant, isLoading: tenantLoading } = useQuery<Tenant>({
    queryKey: ['/api/current-tenant'],
  });

  // Get tenant-specific products
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/tenant-products', filters],
    enabled: !!tenant,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.categoryId && filters.categoryId !== "all") params.append('categoryId', filters.categoryId);
      if (filters.brandId && filters.brandId !== "all") params.append('brandId', filters.brandId);
      if (filters.search) params.append('search', filters.search);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      
      const response = await fetch(`/api/tenant-products?${params}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
  });

  // Get categories for filters
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Get brands for filters
  const { data: brands = [] } = useQuery({
    queryKey: ['/api/brands'],
  });

  // Apply tenant theme colors dynamically
  useEffect(() => {
    if (tenant) {
      const root = document.documentElement;
      
      // Apply primary color
      if (tenant.primaryColor) {
        root.style.setProperty('--primary', tenant.primaryColor);
      }
      
      // Apply secondary color  
      if (tenant.secondaryColor) {
        root.style.setProperty('--secondary', tenant.secondaryColor);
      }
      
      // Apply accent color
      if (tenant.accentColor) {
        root.style.setProperty('--accent', tenant.accentColor);
      }
    }
    
    // Cleanup function to reset colors when component unmounts
    return () => {
      const root = document.documentElement;
      root.style.removeProperty('--primary');
      root.style.removeProperty('--secondary');  
      root.style.removeProperty('--accent');
    };
  }, [tenant]);

  if (tenantLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Carregando loja...</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loja não encontrada</h1>
          <p className="text-gray-600 mb-4">A loja que você está procurando não existe ou está inativa.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header da loja */}
      <div className="relative bg-white shadow-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
            <div className="relative">
              {tenant.logoUrl ? (
                <img
                  src={tenant.logoUrl}
                  alt={tenant.name}
                  className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl object-cover shadow-lg ring-4"
                  style={{
                    borderColor: tenant.primaryColor || '#3b82f6'
                  }}
                />
              ) : (
                <div 
                  className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-white"
                  style={{
                    background: tenant.primaryColor 
                      ? `linear-gradient(135deg, ${tenant.primaryColor}15, ${tenant.primaryColor}30)`
                      : 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
                    borderColor: tenant.primaryColor || '#3b82f6'
                  }}
                >
                  <Store 
                    className="w-12 h-12" 
                    style={{ color: tenant.primaryColor || '#64748b' }}
                  />
                </div>
              )}
              <div className="absolute -bottom-2 -right-2">
                <Badge 
                  variant={tenant.isActive ? "default" : "destructive"} 
                  className="shadow-sm"
                  style={{
                    backgroundColor: tenant.isActive ? (tenant.primaryColor || '#3b82f6') : undefined
                  }}
                >
                  {tenant.isActive ? "Ativa" : "Inativa"}
                </Badge>
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
                  {tenant.name}
                </h1>
                {tenant.description && (
                  <p className="text-lg text-slate-600 mt-3 max-w-2xl leading-relaxed">
                    {tenant.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {tenant.contactEmail && (
                  <div className="flex items-center bg-slate-50 rounded-lg px-3 py-2">
                    <Mail className="h-5 w-5 text-slate-400 mr-3 flex-shrink-0" />
                    <span className="text-sm text-slate-700 font-medium truncate">{tenant.contactEmail}</span>
                  </div>
                )}
                {tenant.contactPhone && (
                  <div className="flex items-center bg-slate-50 rounded-lg px-3 py-2">
                    <Phone className="h-5 w-5 text-slate-400 mr-3 flex-shrink-0" />
                    <span className="text-sm text-slate-700 font-medium">{tenant.contactPhone}</span>
                  </div>
                )}
                {tenant.address && (
                  <div className="flex items-center bg-slate-50 rounded-lg px-3 py-2">
                    <MapPin className="h-5 w-5 text-slate-400 mr-3 flex-shrink-0" />
                    <span className="text-sm text-slate-700 font-medium truncate">{tenant.address}</span>
                  </div>
                )}
                {tenant.domain && (
                  <div className="flex items-center bg-slate-50 rounded-lg px-3 py-2">
                    <Globe className="h-5 w-5 text-slate-400 mr-3 flex-shrink-0" />
                    <span className="text-sm text-slate-700 font-medium truncate">{tenant.domain}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Filtros */}
          <div className="xl:w-80">
            <div className="sticky top-8">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-slate-900">
                    <Store className="h-5 w-5 mr-2 text-slate-600" />
                    Filtros
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Refine sua busca por produtos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TenantProductFilters
                    filters={filters}
                    categories={categories || []}
                    brands={brands || []}
                    onFiltersChange={(newFilters) => {
                      setFilters(prev => ({
                        ...prev,
                        ...newFilters
                      }));
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Produtos */}
          <div className="flex-1">
            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(9)].map((_, i) => (
                  <Card key={i} className="overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <div className="bg-gradient-to-br from-slate-100 to-slate-200 h-56 animate-pulse"></div>
                    <CardContent className="p-6 space-y-3">
                      <div className="bg-slate-200 h-5 rounded-md animate-pulse"></div>
                      <div className="bg-slate-200 h-4 rounded-md w-2/3 animate-pulse"></div>
                      <div className="bg-slate-200 h-7 rounded-md w-1/2 animate-pulse"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products && products.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-slate-900">
                    Produtos ({products.length})
                  </h2>
                  <div className="text-sm text-slate-500 bg-slate-50 px-3 py-1 rounded-full">
                    {tenant?.name} • Loja Online
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {products.map((product) => (
                    <div key={product.id} className="group transform transition-all duration-200 hover:scale-105">
                      <ProductCard
                        product={product}
                        onAddToCart={(productId, quantity) => {
                          console.log(`Added ${quantity} of product ${productId} to cart`);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="text-center py-24">
                  <div className="relative mb-8">
                    <Store className="h-20 w-20 text-slate-300 mx-auto" />
                    <div className="absolute -top-2 -right-2 h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center">
                      <span className="text-slate-400 text-lg">?</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    Nenhum produto encontrado
                  </h3>
                  <p className="text-slate-600 max-w-md mx-auto leading-relaxed mb-8">
                    Esta loja ainda não possui produtos cadastrados ou não há produtos que correspondam aos filtros aplicados.
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => setFilters({
                      categoryId: undefined,
                      brandId: undefined,
                      search: "",
                      minPrice: undefined,
                      maxPrice: undefined,
                      sortBy: "name",
                      sortOrder: "asc",
                    })}
                    className="shadow-sm"
                  >
                    Limpar Filtros
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}