import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Package, MapPin, CreditCard, Clock, User, AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      toast({
        title: "Acesso negado",
        description: "Você precisa ser administrador para acessar esta página.",
        variant: "destructive",
      });
    }
  }, [user, authLoading, toast]);

  const { data: order, isLoading, error } = useQuery({
    queryKey: [`/api/orders/${id}`],
    enabled: !!id && !!user?.isAdmin,
    retry: false,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 py-4">
                      <Skeleton className="h-16 w-16" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-48 mb-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Admin
            </Button>
          </Link>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar pedido. Verifique se o ID está correto e tente novamente.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Acesso negado. Você precisa ser administrador para visualizar esta página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Admin
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Pedido #{order.orderNumber}</h1>
            <p className="text-gray-600">
              Criado em {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
        <Badge className={getStatusColor(order.status)}>
          {getStatusText(order.status)}
        </Badge>
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
                      <p className="text-sm text-gray-600">
                        Preço unitário: R$ {parseFloat(item.price).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        R$ {(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total do Pedido:</span>
                    <span>R$ {parseFloat(order.totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Details */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card className="material-shadow-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Informações do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>ID do Cliente:</strong> {order.userId}</p>
                <p><strong>Número do Pedido:</strong> #{order.orderNumber}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card className="material-shadow-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Informações de Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Método:</span>
                  <span className="capitalize">{order.paymentMethod || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge 
                    className={order.paymentStatus === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {order.paymentStatus === 'completed' ? 'Pago' : 'Pendente'}
                  </Badge>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>Total:</span>
                  <span>R$ {parseFloat(order.totalAmount).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <Card className="material-shadow-1">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Endereço de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p>{order.shippingAddress.street}, {order.shippingAddress.number}</p>
                  {order.shippingAddress.complement && (
                    <p>{order.shippingAddress.complement}</p>
                  )}
                  <p>{order.shippingAddress.neighborhood}</p>
                  <p>{order.shippingAddress.city} - {order.shippingAddress.state}</p>
                  <p>CEP: {order.shippingAddress.zipCode}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Timeline */}
          <Card className="material-shadow-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Timeline do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Pedido criado</span>
                  <span className="text-xs text-gray-500 ml-auto">
                    {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                {order.updatedAt !== order.createdAt && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Status atualizado</span>
                    <span className="text-xs text-gray-500 ml-auto">
                      {new Date(order.updatedAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}