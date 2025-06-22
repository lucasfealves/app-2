import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Heart, Trash2, ShoppingCart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface FavoriteItem {
  id: number;
  userId: string;
  productId: number;
  createdAt: string;
  product: {
    id: number;
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    price: string;
    originalPrice: string;
    stock: number;
    categoryId: number;
    brandId: number;
    imageUrl: string;
    images: string[];
    specifications: any;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export default function FavoritesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery<FavoriteItem[]>({
    queryKey: ['/api/favorites'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/favorites', {
        credentials: 'include',
        headers,
      });
      if (!response.ok) {
        throw new Error('Erro ao buscar favoritos');
      }
      return response.json();
    },
    enabled: !!user,
  });

  const removeFromFavoritesMutation = useMutation({
    mutationFn: async (productId: number) => {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/favorites/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers,
      });
      if (!response.ok) {
        throw new Error('Erro ao remover dos favoritos');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Removido dos favoritos",
        description: "O produto foi removido da sua lista de favoritos.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível remover o produto dos favoritos.",
        variant: "destructive",
      });
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async (productId: number) => {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });
      if (!response.ok) {
        throw new Error('Erro ao adicionar ao carrinho');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Adicionado ao carrinho",
        description: "O produto foi adicionado ao seu carrinho.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o produto ao carrinho.",
        variant: "destructive",
      });
    },
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Faça login para ver seus favoritos</h1>
          <Link href="/login">
            <Button>Fazer Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Meus Favoritos</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-8"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Catálogo
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold">Meus Favoritos</h1>
          </div>
        </div>
        <Link href="/cart">
          <Button>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Ver Carrinho
          </Button>
        </Link>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            Nenhum favorito ainda
          </h2>
          <p className="text-gray-500 mb-6">
            Adicione produtos aos seus favoritos para vê-los aqui
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/">
              <Button>Explorar Produtos</Button>
            </Link>
            <Link href="/cart">
              <Button variant="outline">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Ver Carrinho
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => (
            <Card key={favorite.id} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="relative mb-4">
                  <img
                    src={favorite.product.imageUrl || "/placeholder-product.jpg"}
                    alt={favorite.product.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    onClick={() => removeFromFavoritesMutation.mutate(favorite.product.id)}
                    disabled={removeFromFavoritesMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>

                <Link href={`/product/${favorite.product.slug}`}>
                  <h3 className="font-semibold text-lg mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                    {favorite.product.name}
                  </h3>
                </Link>

                {favorite.product.shortDescription && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {favorite.product.shortDescription}
                  </p>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-green-600">
                      R$ {favorite.product.price}
                    </span>
                    {favorite.product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        R$ {favorite.product.originalPrice}
                      </span>
                    )}
                  </div>
                  {favorite.product.stock <= 0 && (
                    <span className="text-sm text-red-500 font-medium">
                      Fora de estoque
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => addToCartMutation.mutate(favorite.product.id)}
                    disabled={favorite.product.stock <= 0 || addToCartMutation.isPending}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {favorite.product.stock <= 0 ? "Fora de estoque" : "Adicionar ao Carrinho"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}