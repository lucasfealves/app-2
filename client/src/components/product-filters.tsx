import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";

interface ProductFiltersProps {
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

function ProductFilters({ 
  filters, 
  categories, 
  brands, 
  onFiltersChange 
}: ProductFiltersProps) {
  
  const handleClearFilters = () => {
    onFiltersChange({
      categoryId: "all",
      brandId: "all",
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
    <Card className="material-shadow-1 mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </CardTitle>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <Label htmlFor="search" className="text-sm font-medium text-gray-700">
              Buscar
            </Label>
            <div className="relative mt-1">
              <Input
                id="search"
                type="text"
                placeholder="Nome, marca, modelo..."
                value={filters.search}
                onChange={(e) => onFiltersChange({ search: e.target.value })}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Category */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Categoria
            </Label>
            <Select 
              value={filters.categoryId} 
              onValueChange={(value) => onFiltersChange({ categoryId: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Brand */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Marca
            </Label>
            <Select 
              value={filters.brandId} 
              onValueChange={(value) => onFiltersChange({ brandId: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as marcas</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id.toString()}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Ordenar por
            </Label>
            <Select 
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onValueChange={(value) => {
                const [sortBy, sortOrder] = value.split('-');
                onFiltersChange({ sortBy, sortOrder });
              }}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Nome A-Z</SelectItem>
                <SelectItem value="name-desc">Nome Z-A</SelectItem>
                <SelectItem value="price-asc">Menor preço</SelectItem>
                <SelectItem value="price-desc">Maior preço</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Faixa de Preço
            </Label>
            <div className="flex space-x-2 mt-1">
              <Input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => onFiltersChange({ minPrice: e.target.value })}
                className="text-sm"
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => onFiltersChange({ maxPrice: e.target.value })}
                className="text-sm"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Export both named and default exports to support different import styles
export { ProductFilters };
export default ProductFilters;
