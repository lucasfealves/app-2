
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  Calendar,
  AlertCircle,
  Download
} from "lucide-react";

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState("30");

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['/api/admin/analytics', period],
    queryFn: async () => {
      const response = await fetch(`/api/admin/analytics?period=${period}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    }
  });

  const StatCard = ({ title, value, change, changeType, icon: Icon, color }) => (
    <Card className="material-shadow-1 hover:material-shadow-2 transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
            {change && (
              <div className={`flex items-center text-sm ${
                changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {changeType === 'positive' ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                <span className="font-medium">{change}</span>
                <span className="text-gray-500 ml-1">vs período anterior</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const TopProductCard = ({ product, rank }) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-sm font-bold text-blue-600">#{rank}</span>
        </div>
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="h-6 w-6 text-gray-400" />
          )}
        </div>
        <div>
          <p className="font-medium text-gray-900">{product.name}</p>
          <p className="text-sm text-gray-600">{product.category?.name}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-green-600">{product.salesCount} vendas</p>
        <p className="text-sm text-gray-600">
          R$ {(product.salesCount * parseFloat(product.price)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Period Selector Skeleton */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar dados de análise. Tente novamente.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Análises e Relatórios</h2>
          <p className="text-gray-600">Insights detalhados sobre o desempenho da sua loja</p>
        </div>
        <div className="flex space-x-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Receita Total"
          value={`R$ ${analytics?.totalRevenue || '0,00'}`}
          change={analytics?.revenueChange || '+0%'}
          changeType={analytics?.revenueChangeType || 'positive'}
          icon={DollarSign}
          color="bg-green-500"
        />
        <StatCard
          title="Pedidos"
          value={analytics?.totalOrders || 0}
          change={analytics?.ordersChange || '+0%'}
          changeType={analytics?.ordersChangeType || 'positive'}
          icon={ShoppingCart}
          color="bg-blue-500"
        />
        <StatCard
          title="Novos Clientes"
          value={analytics?.newCustomers || 0}
          change={analytics?.customersChange || '+0%'}
          changeType={analytics?.customersChangeType || 'positive'}
          icon={Users}
          color="bg-purple-500"
        />
        <StatCard
          title="Produtos Vendidos"
          value={analytics?.productsSold || 0}
          change={analytics?.productsSoldChange || '+0%'}
          changeType={analytics?.productsSoldChangeType || 'positive'}
          icon={Package}
          color="bg-orange-500"
        />
      </div>

      {/* Charts and detailed analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="material-shadow-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Produtos Mais Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics?.topProducts?.length > 0 ? (
              analytics.topProducts.map((product, index) => (
                <TopProductCard key={product.id} product={product} rank={index + 1} />
              ))
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum dado de vendas disponível</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue by Category */}
        <Card className="material-shadow-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Receita por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.revenueByCategory?.length > 0 ? (
              <div className="space-y-4">
                {analytics.revenueByCategory.map((category, index) => {
                  const percentage = ((category.revenue / analytics.totalRevenue) * 100).toFixed(1);
                  return (
                    <div key={category.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">{category.name}</span>
                        <span className="text-sm text-gray-600">
                          R$ {category.revenue.toFixed(2)} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum dado de categoria disponível</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="material-shadow-1">
          <CardHeader>
            <CardTitle className="text-lg">Taxa de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {analytics?.conversionRate || '0'}%
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Visitantes que realizaram compras
            </p>
          </CardContent>
        </Card>

        <Card className="material-shadow-1">
          <CardHeader>
            <CardTitle className="text-lg">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              R$ {analytics?.averageOrderValue || '0,00'}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Valor médio por pedido
            </p>
          </CardContent>
        </Card>

        <Card className="material-shadow-1">
          <CardHeader>
            <CardTitle className="text-lg">Produtos em Estoque Baixo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {analytics?.lowStockProducts || 0}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Produtos com estoque abaixo de 10
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
