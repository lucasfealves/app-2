import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface TenantProductFiltersProps {
  filters: {
    categoryId: string;
    brandId: string;
    search: string;
    minPrice: string;
    maxPrice: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
  };
  categories: Array<{ id: number; name: string }>;
  brands: Array<{ id: number; name: string }>;
  onFiltersChange: (filters: any) => void;
}

export function TenantProductFilters({ 
  filters, 
  categories, 
  brands, 
  onFiltersChange 
}: TenantProductFiltersProps) {
  
  const handleClearFilters = () => {
    onFiltersChange({
      categoryId: "",
      brandId: "",
      search: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "name",
      sortOrder: "asc"
    });
  };

  const hasActiveFilters = filters.categoryId || filters.brandId || filters.search || 
                          filters.minPrice || filters.maxPrice;

  return (
    <div className="space-y-6">
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="text-xs shadow-sm"
          >
            <X className="h-3 w-3 mr-1" />
            Limpar Filtros
          </Button>
        </div>
      )}

      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search" className="text-sm font-medium text-slate-700">
          Buscar produtos
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            id="search"
            type="text"
            placeholder="Nome do produto..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">Categoria</Label>
        <Select 
          value={filters.categoryId} 
          onValueChange={(value) => onFiltersChange({ categoryId: value })}
        >
          <SelectTrigger className="bg-slate-50 border-slate-200 focus:bg-white">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas as categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Brand Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">Marca</Label>
        <Select 
          value={filters.brandId} 
          onValueChange={(value) => onFiltersChange({ brandId: value })}
        >
          <SelectTrigger className="bg-slate-50 border-slate-200 focus:bg-white">
            <SelectValue placeholder="Todas as marcas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas as marcas</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id.toString()}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">Faixa de preço</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Input
              type="number"
              placeholder="Mín"
              value={filters.minPrice}
              onChange={(e) => onFiltersChange({ minPrice: e.target.value })}
              className="bg-slate-50 border-slate-200 focus:bg-white text-sm"
            />
          </div>
          <div>
            <Input
              type="number"
              placeholder="Máx"
              value={filters.maxPrice}
              onChange={(e) => onFiltersChange({ maxPrice: e.target.value })}
              className="bg-slate-50 border-slate-200 focus:bg-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">Ordenar por</Label>
        <Select 
          value={`${filters.sortBy}-${filters.sortOrder}`} 
          onValueChange={(value) => {
            const [sortBy, sortOrder] = value.split('-');
            onFiltersChange({ sortBy, sortOrder });
          }}
        >
          <SelectTrigger className="bg-slate-50 border-slate-200 focus:bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Nome (A-Z)</SelectItem>
            <SelectItem value="name-desc">Nome (Z-A)</SelectItem>
            <SelectItem value="price-asc">Preço (menor)</SelectItem>
            <SelectItem value="price-desc">Preço (maior)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default TenantProductFilters;