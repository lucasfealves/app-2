import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Package, AlertCircle, MapPin, CreditCard, Truck, QrCode, CheckCircle } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function OrderDetail() {
  const params = useParams();
  const orderId = params.id;
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Não autorizado",
        description: "Você precisa estar logado. Redirecionando...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['/api/orders', orderId],
    queryFn: async () => {
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Order not found');
      return response.json();
    },
    enabled: isAuthenticated && !!orderId,
    retry: false,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-primary/10 text-primary';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'processing':
        return 'Em Andamento';
      case 'shipped':
        return 'Enviado';
      case 'delivered':
        return 'Entregue';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Pedido não encontrado ou erro ao carregar detalhes.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/orders">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Pedidos
            </Button>
          </Link>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Pedido #{order.orderNumber}
              </h1>
              <p className="text-gray-600 mt-1">
                Feito em {new Date(order.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <Badge className={getStatusColor(order.status)}>
              {getStatusText(order.status)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <Card className="material-shadow-1">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Itens do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center space-x-4 py-4 border-b last:border-b-0">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        {item.product.imageUrl ? (
                          <img 
                            src={item.product.imageUrl} 
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.product.name}</h3>
                        <p className="text-sm text-gray-600">
                          Quantidade: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          R$ {parseFloat(item.price).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Total: R$ {(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-600">Nenhum item encontrado</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Summary Card */}
            <Card className="material-shadow-1">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>R$ {parseFloat(order.totalAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-lg pt-3 border-t">
                    <span>Total:</span>
                    <span>R$ {parseFloat(order.totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card className="material-shadow-1">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    {order.paymentMethod === 'pix' && (
                      <div className="bg-green-100 rounded-full p-2">
                        <QrCode className="h-4 w-4 text-green-600" />
                      </div>
                    )}
                    {order.paymentMethod === 'credit' && (
                      <div className="bg-primary/10 rounded-full p-2">
                        <CreditCard className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {order.paymentMethod === 'pix' ? 'PIX' : 
                         order.paymentMethod === 'credit' ? 'Cartão de Crédito' : 
                         order.paymentMethod}
                      </p>
                      {order.paymentMethod === 'pix' && (
                        <p className="text-xs text-green-600">Desconto de 5% aplicado</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge 
                      className={order.paymentStatus === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {order.paymentStatus === 'completed' ? 'Pago' : 'Pendente'}
                    </Badge>
                  </div>

                  {order.paymentMethod === 'pix' && order.paymentStatus === 'pending' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">Aguardando Pagamento PIX</span>
                      </div>
                      <p className="text-xs text-yellow-700">
                        O pagamento via PIX ainda não foi confirmado. Verifique se o pagamento foi realizado no seu banco.
                      </p>
                    </div>
                  )}

                  {order.paymentMethod === 'pix' && order.paymentStatus === 'completed' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Pagamento PIX Confirmado</span>
                      </div>
                      <p className="text-xs text-green-700">
                        Pagamento processado instantaneamente com desconto aplicado.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Info */}
            {order.shippingAddress && (
              <Card className="material-shadow-1">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Endereço de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    <p>{order.shippingAddress.street}, {order.shippingAddress.number}</p>
                    {order.shippingAddress.complement && (
                      <p>{order.shippingAddress.complement}</p>
                    )}
                    <p>{order.shippingAddress.neighborhood}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                    <p>CEP: {order.shippingAddress.zipCode}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}