import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navbar from "@/components/navbar";
import ProductCard from "@/components/product-card";
import ProductFilters from "@/components/product-filters";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ShoppingCart } from "lucide-react";

export default function Catalog() {
  const [location] = useLocation();
  const [filters, setFilters] = useState({
    categoryId: "all",
    brandId: "all",
    search: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "name",
    sortOrder: "asc" as "asc" | "desc",
    page: 1,
    limit: 20
  });

  // Monitor URL changes and extract search parameters
  useEffect(() => {
    const updateFiltersFromURL = () => {
      const params = new URLSearchParams(window.location.search);
      const searchParam = params.get('search');
      
      setFilters(prev => ({
        ...prev,
        search: searchParam || ""
      }));
    };

    // Initial load
    updateFiltersFromURL();

    // Listen for URL changes
    const handlePopState = () => {
      updateFiltersFromURL();
    };

    // Listen for programmatic navigation
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args);
      setTimeout(updateFiltersFromURL, 0);
    };

    window.history.replaceState = function(...args) {
      originalReplaceState.apply(window.history, args);
      setTimeout(updateFiltersFromURL, 0);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['/api/products', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
      
      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    }
  });

  const { data: brands } = useQuery({
    queryKey: ['/api/brands'],
    queryFn: async () => {
      const response = await fetch('/api/brands');
      if (!response.ok) throw new Error('Failed to fetch brands');
      return response.json();
    }
  });

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Catálogo de Produtos
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Descubra nossa seleção completa com os melhores preços
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {products ? `${products.length} produtos encontrados` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <ProductFilters
            filters={filters}
            categories={categories || []}
            brands={brands || []}
            onFiltersChange={handleFilterChange}
          />
        </div>

        {/* Content */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar produtos. Verifique sua conexão e tente novamente.
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl p-4 space-y-4 material-shadow-1">
                <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-6 w-1/3" />
                  <div className="space-y-2">
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-2xl material-shadow-1 text-center py-16 px-6">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center">
              <ShoppingCart className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-card-foreground mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Não encontramos produtos que correspondam aos seus filtros. Tente ajustar os critérios de busca.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
