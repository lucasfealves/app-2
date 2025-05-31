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
}

export default function ProductCard({ product }: ProductCardProps) {
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
    <Card className="group material-shadow-1 hover:material-shadow-2 transition-all duration-300 overflow-hidden">
      {/* Product Image */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ShoppingCart className="h-16 w-16" />
          </div>
        )}
        
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <Badge className="absolute top-2 left-2 bg-green-500 text-white">
            {discountPercentage}% OFF
          </Badge>
        )}

        {/* Stock Status */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Badge variant="destructive" className="text-lg py-2 px-4">
              Fora de Estoque
            </Badge>
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
          <Button size="icon" variant="secondary" className="bg-white/90 hover:bg-white">
            <Heart className="h-4 w-4" />
          </Button>
          <Link href={`/product/${product.id}`}>
            <Button size="icon" variant="secondary" className="bg-white/90 hover:bg-white">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Product Info */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 line-clamp-2 mb-1">
            {product.name}
          </h3>
          {product.brand && (
            <p className="text-sm text-gray-600">{product.brand.name}</p>
          )}
          {product.shortDescription && (
            <p className="text-sm text-gray-500 line-clamp-2 mt-1">
              {product.shortDescription}
            </p>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center space-x-1">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <span className="text-sm text-gray-600">(4.5)</span>
        </div>

        {/* Price */}
        <div className="space-y-1">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-blue-600">
              R$ {parseFloat(product.price).toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-lg text-gray-500 line-through">
                R$ {parseFloat(product.originalPrice).toFixed(2)}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">
            Em até 12x de R$ {(parseFloat(product.price) / 12).toFixed(2)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Link href={`/product/${product.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              <Eye className="mr-2 h-4 w-4" />
              Ver Detalhes
            </Button>
          </Link>
          <Button 
            onClick={handleAddToCart}
            disabled={product.stock === 0 || addToCartMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
