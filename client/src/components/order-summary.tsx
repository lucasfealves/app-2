import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Truck, Gift } from "lucide-react";

interface OrderSummaryProps {
  items: Array<{
    id: number;
    quantity: number;
    product: {
      id: number;
      name: string;
      price: string;
      imageUrl?: string;
    };
  }>;
}

export default function OrderSummary({ items }: OrderSummaryProps) {
  const subtotal = items.reduce((sum, item) => {
    return sum + (parseFloat(item.product.price) * item.quantity);
  }, 0);

  const shipping = 0; // Free shipping
  const discount = subtotal > 100 ? subtotal * 0.05 : 0; // 5% discount for orders over R$100
  const total = subtotal - discount + shipping;

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card className="material-shadow-1">
      <CardHeader>
        <CardTitle className="text-lg">Resumo do Pedido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items Preview */}
        <div className="space-y-3">
          {items.slice(0, 3).map((item) => (
            <div key={item.id} className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                {item.product.imageUrl ? (
                  <img 
                    src={item.product.imageUrl} 
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-xs">-</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.product.name}
                </p>
                <p className="text-xs text-gray-500">
                  Qty: {item.quantity}
                </p>
              </div>
              <span className="text-sm font-medium text-gray-900">
                R$ {(parseFloat(item.product.price) * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
          
          {items.length > 3 && (
            <p className="text-sm text-gray-500 text-center py-2">
              e mais {items.length - 3} {items.length - 3 === 1 ? 'item' : 'itens'}
            </p>
          )}
        </div>

        <Separator />

        {/* Summary */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'itens'})
            </span>
            <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 flex items-center">
              <Truck className="h-4 w-4 mr-1" />
              Frete
            </span>
            <span className="font-medium text-green-600">
              Grátis
            </span>
          </div>
          
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 flex items-center">
                <Gift className="h-4 w-4 mr-1" />
                Desconto (5%)
              </span>
              <span className="font-medium text-green-600">
                -R$ {discount.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium text-gray-900">Total</span>
          <span className="text-2xl font-bold text-primary">
            R$ {total.toFixed(2)}
          </span>
        </div>

        {/* Benefits */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center text-sm text-green-600">
            <Truck className="h-4 w-4 mr-2" />
            Frete grátis incluído
          </div>
          {discount > 0 && (
            <div className="flex items-center text-sm text-green-600">
              <Gift className="h-4 w-4 mr-2" />
              Desconto aplicado
            </div>
          )}
          <div className="text-xs text-gray-500 mt-2">
            Em até 12x de R$ {(total / 12).toFixed(2)} sem juros
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
