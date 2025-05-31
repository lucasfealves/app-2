import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package, Users, ShoppingCart, DollarSign, AlertCircle } from "lucide-react";

export default function StatsOverview() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['/api/admin/stats'],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar estatísticas. Tente novamente.
        </AlertDescription>
      </Alert>
    );
  }

  const statsData = [
    {
      title: "Total de Produtos",
      value: stats?.totalProducts || 0,
      icon: <Package className="h-4 w-4 text-blue-600" />,
      description: "Produtos ativos no catálogo"
    },
    {
      title: "Usuários Ativos",
      value: stats?.totalUsers || 0,
      icon: <Users className="h-4 w-4 text-green-600" />,
      description: "Usuários registrados"
    },
    {
      title: "Pedidos Hoje",
      value: stats?.todayOrders || 0,
      icon: <ShoppingCart className="h-4 w-4 text-yellow-600" />,
      description: "Pedidos realizados hoje"
    },
    {
      title: "Receita Hoje",
      value: `R$ ${stats?.todayRevenue || "0.00"}`,
      icon: <DollarSign className="h-4 w-4 text-green-600" />,
      description: "Faturamento do dia"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => (
        <Card key={index} className="material-shadow-1 hover:material-shadow-2 transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value}
            </div>
            <p className="text-xs text-gray-500">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
