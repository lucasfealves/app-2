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
import FavoriteButton from "@/components/favorite-button";

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
    <Card className="group bg-card rounded-2xl material-shadow-1 hover:material-shadow-3 transition-all duration-300 overflow-hidden border-0">
      {/* Product Image */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-muted/50 to-muted overflow-hidden">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
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
            <div className="bg-card rounded-lg px-4 py-2">
              <span className="text-card-foreground font-medium">Fora de Estoque</span>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute top-3 right-3">
          <FavoriteButton 
            productId={product.id} 
            className="bg-card/90 hover:bg-card shadow-lg border-0"
          />
        </div>


      </div>

      <CardContent className="p-4 space-y-3">
        {/* Brand & Category */}
        {product.brand && (
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs font-medium text-primary border-primary/20 bg-primary/10">
              {product.brand.name}
            </Badge>
            {product.stock > 0 && product.stock <= 5 && (
              <span className="text-xs text-material-orange font-medium">Últimas unidades</span>
            )}
          </div>
        )}

        {/* Product Info */}
        <div>
          <Link href={`/product/${product.id}`}>
            <h3 className="text-base font-semibold text-card-foreground line-clamp-2 hover:text-primary transition-colors cursor-pointer">
              {product.name}
            </h3>
          </Link>
          {product.shortDescription && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
              {product.shortDescription}
            </p>
          )}
        </div>

        {/* Rating & Reviews */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <div className="flex text-material-amber">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" />
              ))}
            </div>
            <span className="text-xs text-muted-foreground ml-1">(127)</span>
          </div>
          <span className="text-xs text-material-green font-medium">Frete Grátis</span>
        </div>

        {/* Price */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-card-foreground">
              R$ {parseFloat(product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                R$ {parseFloat(product.originalPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            ou 12x de R$ {(parseFloat(product.price) / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} sem juros
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2 space-y-2">
          <Button 
            onClick={handleAddToCart}
            disabled={product.stock === 0 || addToCartMutation.isPending}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-xl transition-colors"
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
            <Button variant="outline" className="w-full rounded-xl">
              Ver Detalhes
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
