import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package, AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Orders() {
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

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['/api/orders'],
    enabled: isAuthenticated,
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
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar pedidos. Tente novamente.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const ordersList = orders || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Meus Pedidos</h1>
        
        {ordersList.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <CardTitle className="text-xl mb-2">Nenhum pedido encontrado</CardTitle>
              <p className="text-gray-600 mb-6">
                Você ainda não fez nenhum pedido
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Ir para Catálogo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {ordersList.map((order: any) => (
              <Card key={order.id} className="material-shadow-1 hover:material-shadow-2 transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Pedido #{order.orderNumber}
                      </CardTitle>
                      <p className="text-gray-600">
                        Feito em {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Order Summary */}
                    <div className="flex justify-between items-center pt-4 border-t">
                      <div>
                        <p className="font-medium text-lg">
                          Total: R$ {parseFloat(order.totalAmount).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Pagamento: {order.paymentMethod}
                        </p>
                        {order.paymentStatus && (
                          <p className="text-sm text-gray-600">
                            Status do pagamento: {order.paymentStatus}
                          </p>
                        )}
                      </div>
                      <div className="space-x-2">
                        <Link href={`/orders/${order.id}`}>
                          <Button variant="outline" size="sm">
                            Ver Detalhes
                          </Button>
                        </Link>
                        {order.status === 'delivered' && (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            Comprar Novamente
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
