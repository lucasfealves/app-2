import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navbar from "@/components/navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  Shield,
  BarChart3,
  Package,
  Users,
  ShoppingCart,
  CreditCard,
  Plus,
  Download,
} from "lucide-react";

// Import admin components
import StatsOverview from "@/components/admin/stats-overview";
import ProductsTable from "@/components/admin/products-table";
import OrdersTable from "@/components/admin/orders-table";
import UsersTable from "@/components/admin/users-table";
import PaymentsOverview from "@/components/admin/payments-overview";
import CategoriesBrandsTable from "@/components/admin/categories-brands-table";
import AnalyticsDashboard from "@/components/admin/analytics-dashboard";
import PaymentSettings from "@/components/admin/payment-settings";
import SiteSettings from "@/components/admin/site-settings";

export default function Admin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Acesso negado",
        description: "Faça login para continuar",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Você precisa estar logado para acessar o painel administrativo.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-xl mr-4">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Painel Administrativo
              </h1>
              <p className="text-gray-600">
                Gerencie sua loja e acompanhe métricas
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-9 bg-white rounded-xl p-1 material-shadow-1">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Package className="h-4 w-4 mr-2" />
              Produtos
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Package className="h-4 w-4 mr-2" />
              Categorias
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Users className="h-4 w-4 mr-2" />
              Usuários
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Pagamentos
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Análises
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Shield className="h-4 w-4 mr-2" />
              Config. Pag.
            </TabsTrigger>
            <TabsTrigger
              value="site-settings"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Package className="h-4 w-4 mr-2" />
              Site
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <StatsOverview />
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <ProductsTable />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <UsersTable />
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <OrdersTable />
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <CategoriesBrandsTable />
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <PaymentsOverview />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <PaymentSettings />
          </TabsContent>
          
          <TabsContent value="site-settings" className="space-y-6">
            <SiteSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
