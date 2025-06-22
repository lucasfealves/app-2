import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface FavoriteButtonProps {
  productId: number;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export default function FavoriteButton({ 
  productId, 
  variant = "outline", 
  size = "icon",
  className = ""
}: FavoriteButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: favoriteStatus, isLoading } = useQuery({
    queryKey: ['/api/favorites/check', productId],
    queryFn: async () => {
      const response = await fetch(`/api/favorites/check/${productId}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Erro ao verificar favorito');
      const data = await response.json();
      return data.isFavorited;
    },
    enabled: !!user,
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      const method = favoriteStatus ? 'DELETE' : 'POST';
      const response = await fetch(`/api/favorites/${productId}`, {
        method,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao alterar favorito');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites/check', productId] });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      
      toast({
        title: favoriteStatus ? "Removido dos favoritos" : "Adicionado aos favoritos",
        description: favoriteStatus 
          ? "O produto foi removido da sua lista de favoritos."
          : "O produto foi adicionado à sua lista de favoritos.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!user) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavoriteMutation.mutate();
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      disabled={isLoading || toggleFavoriteMutation.isPending}
    >
      <Heart
        className={`h-4 w-4 ${
          favoriteStatus 
            ? "fill-red-500 text-red-500" 
            : "text-gray-500 hover:text-red-500"
        } ${toggleFavoriteMutation.isPending ? "animate-pulse" : ""}`}
      />
    </Button>
  );
}