import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useThemeColors } from "@/hooks/useThemeColors";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Home from "@/pages/home";
import Catalog from "@/pages/catalog";
import ProductDetail from "@/pages/product-detail";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import Orders from "@/pages/orders";
import OrderDetail from "@/pages/order-detail";
import FavoritesPage from "@/pages/favorites";
import Admin from "@/pages/admin";
import AdminOrderDetail from "@/pages/admin/order-detail";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Apply dynamic colors
  useThemeColors();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/catalog" component={Catalog} />
          <Route path="/product/:id" component={ProductDetail} />
          <Route path="/cart" component={Cart} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/orders" component={Orders} />
          <Route path="/orders/:id" component={OrderDetail} />
          <Route path="/favorites" component={FavoritesPage} />
          <Route path="/admin" component={Admin} />
          <Route path="/admin/orders/:id" component={AdminOrderDetail} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
