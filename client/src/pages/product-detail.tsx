import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Star,
  Plus,
  Minus,
  Truck,
  Shield,
  RotateCcw,
  CreditCard
} from "lucide-react";

export default function ProductDetail() {
  const params = useParams();
  const productId = params.id;
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['/api/products', productId],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) throw new Error('Product not found');
      return response.json();
    },
    enabled: !!productId,
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/cart/items', {
        productId: parseInt(productId!),
        quantity
      });
    },
    onSuccess: () => {
      toast({
        title: "Produto adicionado!",
        description: `${quantity}x ${product?.name} adicionado ao carrinho`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Faça login",
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

  const discountPercentage = product?.originalPrice 
    ? Math.round(((parseFloat(product.originalPrice) - parseFloat(product.price)) / parseFloat(product.originalPrice)) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
            <div className="space-y-4">
              <Skeleton className="aspect-square w-full rounded-2xl" />
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-1/3" />
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="bg-card rounded-2xl material-shadow-1 p-12 max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-card-foreground mb-4">Produto não encontrado</h1>
            <p className="text-muted-foreground mb-6">O produto que você está procurando não existe ou foi removido.</p>
            <Link href="/catalog">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Catálogo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Navbar />
      
      {/* Mobile Header */}
      <div className="sticky top-16 z-40 bg-card/95 backdrop-blur-sm border-b border-border lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/catalog">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="p-2">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb - Desktop only */}
        <div className="hidden lg:flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary">Início</Link>
          <span>/</span>
          <Link href="/catalog" className="hover:text-primary">Catálogo</Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-card rounded-2xl material-shadow-1 overflow-hidden group">
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <ShoppingCart className="h-20 w-20" />
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col space-y-2">
                {discountPercentage > 0 && (
                  <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-primary-foreground border-0 font-semibold">
                    -{discountPercentage}%
                  </Badge>
                )}
                {product.stock <= 5 && product.stock > 0 && (
                  <Badge variant="outline" className="bg-material-orange/10 text-material-orange border-material-orange/20">
                    Últimas unidades
                  </Badge>
                )}
              </div>
              
              {/* Desktop Actions */}
              <div className="absolute top-4 right-4 hidden lg:flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="secondary" className="bg-card/95 hover:bg-card shadow-lg">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="secondary" className="bg-card/95 hover:bg-card shadow-lg">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-3">
              {product.brand && (
                <Badge variant="outline" className="text-primary border-primary/20 bg-primary/10">
                  {product.brand.name}
                </Badge>
              )}
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                {product.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center space-x-3">
                <div className="flex text-material-amber">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(4.8) · 127 avaliações</span>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Descrição</h3>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Price */}
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-6 space-y-3">
              <div className="flex items-baseline space-x-3">
                <span className="text-3xl sm:text-4xl font-bold text-foreground">
                  R$ {parseFloat(product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    R$ {parseFloat(product.originalPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  12x de R$ {(parseFloat(product.price) / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} sem juros
                </p>
                <p className="flex items-center text-material-green font-medium">
                  <Truck className="h-4 w-4 mr-2" />
                  Frete grátis para todo o Brasil
                </p>
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Quantidade:</span>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="h-10 w-10 rounded-xl"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="h-10 w-10 rounded-xl"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || addToCartMutation.isPending}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-xl h-auto"
                >
                  {addToCartMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Adicionando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <ShoppingCart className="h-5 w-5" />
                      <span>Adicionar ao Carrinho</span>
                    </div>
                  )}
                </Button>
                <Button variant="outline" className="py-3 rounded-xl h-auto">
                  <Heart className="h-5 w-5 mr-2" />
                  Favoritar
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-card rounded-xl material-shadow-1">
                <div className="bg-material-green/10 p-2 rounded-lg">
                  <Truck className="h-5 w-5 text-material-green" />
                </div>
                <div>
                  <p className="font-medium text-card-foreground text-sm">Frete Grátis</p>
                  <p className="text-xs text-muted-foreground">Entrega rápida</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-card rounded-xl material-shadow-1">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-card-foreground text-sm">Garantia</p>
                  <p className="text-xs text-muted-foreground">12 meses</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-card rounded-xl material-shadow-1">
                <div className="bg-purple-500/10 p-2 rounded-lg">
                  <RotateCcw className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium text-card-foreground text-sm">Troca</p>
                  <p className="text-xs text-muted-foreground">30 dias</p>
                </div>
              </div>
            </div>

            {/* Stock Status */}
            <div className="bg-card rounded-xl p-4 material-shadow-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-card-foreground">Estoque:</span>
                <span className={`font-medium ${product.stock > 10 ? 'text-material-green' : product.stock > 0 ? 'text-material-orange' : 'text-material-red'}`}>
                  {product.stock > 0 ? `${product.stock} disponíveis` : 'Fora de estoque'}
                </span>
              </div>
              {product.stock > 0 && product.stock <= 10 && (
                <div className="mt-2">
                  <div className="bg-material-orange/20 rounded-full h-2">
                    <div 
                      className="bg-material-orange h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(product.stock / 10) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-material-orange mt-1">Estoque baixo - compre logo!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 lg:hidden z-50">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Preço:</p>
            <p className="text-xl font-bold text-card-foreground">
              R$ {parseFloat(product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || addToCartMutation.isPending}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 py-3 rounded-xl"
          >
            {addToCartMutation.isPending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5" />
                <span>Comprar</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}