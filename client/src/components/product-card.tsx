import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Eye, Heart, Star } from "lucide-react";
import { Link } from "wouter";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: string;
    originalPrice?: string;
    imageUrl?: string;
    shortDescription?: string;
    stock: number;
    brand?: {
      name: string;
    };
    category?: {
      name: string;
    };
  };
  onAddToCart?: (productId: number, quantity: number) => void;
  tenantColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
}

function ProductCard({ product, onAddToCart, tenantColors = {} }: ProductCardProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/cart/items', {
        productId: product.id,
        quantity: 1
      });
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Produto adicionado ao carrinho",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não autorizado",
          description: "Você precisa estar logado. Redirecionando...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro",
        description: "Falha ao adicionar produto ao carrinho",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    addToCartMutation.mutate();
  };

  const discountPercentage = product.originalPrice 
    ? Math.round(((parseFloat(product.originalPrice) - parseFloat(product.price)) / parseFloat(product.originalPrice)) * 100)
    : 0;

  return (
    <Card className="group bg-white rounded-2xl material-shadow-1 hover:material-shadow-3 transition-all duration-300 overflow-hidden border-0">
      {/* Product Image */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ShoppingCart className="h-12 w-12" />
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 font-semibold px-2 py-1 text-xs">
              -{discountPercentage}%
            </Badge>
          </div>
        )}

        {/* Stock Status */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-lg px-4 py-2">
              <span className="text-gray-900 font-medium">Fora de Estoque</span>
            </div>
          </div>
        )}

        {/* Quick Actions - Mobile Friendly */}
        <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <Button size="icon" variant="secondary" className="bg-white/95 hover:bg-white shadow-lg border-0 w-9 h-9">
            <Heart className="h-4 w-4 text-gray-700" />
          </Button>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Brand & Category */}
        {product.brand && (
          <div className="flex items-center justify-between">
            <Badge 
              variant="outline" 
              className="text-xs font-medium"
              style={{
                color: tenantColors.primary || '#2563eb',
                borderColor: `${tenantColors.primary}40` || '#dbeafe',
                backgroundColor: `${tenantColors.primary}10` || '#eff6ff'
              }}
            >
              {product.brand.name}
            </Badge>
            {product.stock > 0 && product.stock <= 5 && (
              <span className="text-xs text-orange-600 font-medium">Últimas unidades</span>
            )}
          </div>
        )}

        {/* Product Info */}
        <div>
          <Link href={`/product/${product.id}`}>
            <h3 className="text-base font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer">
              {product.name}
            </h3>
          </Link>
          {product.shortDescription && (
            <p className="text-sm text-gray-600 line-clamp-2 mt-1 leading-relaxed">
              {product.shortDescription}
            </p>
          )}
        </div>

        {/* Rating & Reviews */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" />
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">(127)</span>
          </div>
          <span className="text-xs text-green-600 font-medium">Frete Grátis</span>
        </div>

        {/* Price */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">
              R$ {parseFloat(product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                R$ {parseFloat(product.originalPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-600">
            ou 12x de R$ {(parseFloat(product.price) / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} sem juros
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2 space-y-2">
          <Button 
            onClick={handleAddToCart}
            disabled={product.stock === 0 || addToCartMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-colors"
            size="sm"
          >
            {addToCartMutation.isPending ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Adicionando...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-4 w-4" />
                <span>Adicionar ao Carrinho</span>
              </div>
            )}
          </Button>
          <Link href={`/product/${product.id}`} className="block">
            <Button variant="outline" className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl">
              Ver Detalhes
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Export both named and default exports to support different import styles
export { ProductCard };
export default ProductCard;
