import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2 } from "lucide-react";

interface CartItemProps {
  item: {
    id: number;
    quantity: number;
    product: {
      id: number;
      name: string;
      price: string;
      imageUrl?: string;
      brand?: {
        name: string;
      };
    };
    variant?: {
      name: string;
      value: string;
    };
  };
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onRemove: (itemId: number) => void;
  isUpdating: boolean;
  isRemoving: boolean;
}

export default function CartItem({ 
  item, 
  onUpdateQuantity, 
  onRemove, 
  isUpdating, 
  isRemoving 
}: CartItemProps) {
  
  const itemTotal = parseFloat(item.product.price) * item.quantity;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  return (
    <Card className="material-shadow-1">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          {/* Product Image */}
          <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
            {item.product.imageUrl ? (
              <img 
                src={item.product.imageUrl} 
                alt={item.product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span className="text-xs">Sem imagem</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">
              {item.product.name}
            </h3>
            {item.product.brand && (
              <p className="text-sm text-gray-600">{item.product.brand.name}</p>
            )}
            {item.variant && (
              <Badge variant="secondary" className="mt-1">
                {item.variant.name}: {item.variant.value}
              </Badge>
            )}
            <p className="text-sm text-gray-500 mt-1">
              R$ {parseFloat(item.product.price).toFixed(2)} cada
            </p>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center border border-gray-300 rounded-md">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={item.quantity <= 1 || isUpdating}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="px-3 py-1 text-gray-900 min-w-[3rem] text-center">
                {item.quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={isUpdating}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Item Total */}
          <div className="text-right">
            <p className="text-lg font-medium text-gray-900">
              R$ {itemTotal.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">
              {item.quantity} {item.quantity === 1 ? 'item' : 'itens'}
            </p>
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(item.id)}
            disabled={isRemoving}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
