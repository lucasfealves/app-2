import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Heart, Star, Minus, Plus, AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function ProductDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['/api/products', id],
    queryFn: async () => {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      return response.json();
    },
    enabled: !!id
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/cart/items', {
        productId: product.id,
        quantity,
        variantId: selectedVariant
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

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-96 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-1/3" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Produto não encontrado ou erro ao carregar.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const discountPercentage = product.originalPrice 
    ? Math.round(((parseFloat(product.originalPrice) - parseFloat(product.price)) / parseFloat(product.originalPrice)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><Link href="/catalog" className="hover:text-blue-600">Catálogo</Link></li>
            <li>/</li>
            <li className="text-gray-900">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  Sem imagem
                </div>
              )}
            </div>
            
            {product.images && product.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image: string, index: number) => (
                  <div key={index} className="aspect-square bg-gray-100 rounded cursor-pointer overflow-hidden">
                    <img 
                      src={image} 
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <div className="flex items-center mt-2 space-x-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <span className="text-gray-600">(4.5) - 234 avaliações</span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline space-x-4">
                <span className="text-4xl font-bold text-blue-600">
                  R$ {parseFloat(product.price).toFixed(2)}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      R$ {parseFloat(product.originalPrice).toFixed(2)}
                    </span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {discountPercentage}% OFF
                    </Badge>
                  </>
                )}
              </div>
              <p className="text-gray-600">
                Em até 12x de R$ {(parseFloat(product.price) / 12).toFixed(2)} sem juros
              </p>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Variações</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant: any) => (
                    <Button
                      key={variant.id}
                      variant={selectedVariant === variant.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedVariant(variant.id)}
                    >
                      {variant.name}: {variant.value}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Quantidade</h3>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={incrementQuantity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                {product.stock > 0 ? `${product.stock} em estoque` : 'Fora de estoque'}
              </span>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex space-x-4">
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0 || addToCartMutation.isPending}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {addToCartMutation.isPending ? "Adicionando..." : "Adicionar ao Carrinho"}
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
              <Link href="/checkout">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={product.stock <= 0}
                >
                  Comprar Agora
                </Button>
              </Link>
            </div>

            {/* Specifications */}
            {product.specifications && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-medium text-gray-900 mb-4">Especificações</h3>
                  <div className="space-y-2">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-600">{key}:</span>
                        <span className="font-medium">{value as string}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            {product.description && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-medium text-gray-900 mb-4">Descrição do Produto</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
