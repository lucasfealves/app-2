import { useAuth } from "@/hooks/useAuth";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, TrendingUp, Package, Heart, Truck, Shield } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();
  const { data: siteSettings } = useSiteSettings();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-dynamic-primary">
            {siteSettings?.heroTitle || (user ? `Bem-vindo de volta, ${user.firstName || 'Cliente'}!` : 'Bem-vindo à nossa loja')}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {siteSettings?.heroDescription || 'Descubra os melhores produtos e ofertas especiais para você'}
          </p>
          <Link href="/catalog">
            <Button 
              size="lg" 
              className="bg-dynamic-primary hover:bg-dynamic-secondary text-white border-dynamic-primary transition-colors duration-200"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Explorar Catálogo
            </Button>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="cursor-pointer hover:material-shadow-2 transition-shadow">
            <Link href="/catalog">
              <CardHeader className="text-center">
                <Package className="h-12 w-12 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Navegar Produtos</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Explore nossa seleção completa de produtos
                </CardDescription>
              </CardContent>
            </Link>
          </Card>

          <Card className="cursor-pointer hover:material-shadow-2 transition-shadow">
            <Link href="/cart">
              <CardHeader className="text-center">
                <ShoppingCart className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Meu Carrinho</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Veja os itens salvos no seu carrinho
                </CardDescription>
              </CardContent>
            </Link>
          </Card>

          <Card className="cursor-pointer hover:material-shadow-2 transition-shadow">
            <Link href="/orders">
              <CardHeader className="text-center">
                <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Meus Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Acompanhe seus pedidos e histórico
                </CardDescription>
              </CardContent>
            </Link>
          </Card>

          <Card className="cursor-pointer hover:material-shadow-2 transition-shadow">
            <CardHeader className="text-center">
              <Heart className="h-12 w-12 text-red-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Lista de Desejos</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Produtos salvos para comprar depois
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Featured Categories */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Categorias em Destaque
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="overflow-hidden hover:material-shadow-2 transition-shadow cursor-pointer">
              <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600"></div>
              <CardHeader>
                <CardTitle>Eletrônicos</CardTitle>
                <CardDescription>
                  Smartphones, laptops, fones de ouvido e mais
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="overflow-hidden hover:material-shadow-2 transition-shadow cursor-pointer">
              <div className="h-48 bg-gradient-to-br from-green-400 to-green-600"></div>
              <CardHeader>
                <CardTitle>Casa e Jardim</CardTitle>
                <CardDescription>
                  Decoração, móveis e utensílios domésticos
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="overflow-hidden hover:material-shadow-2 transition-shadow cursor-pointer">
              <div className="h-48 bg-gradient-to-br from-purple-400 to-purple-600"></div>
              <CardHeader>
                <CardTitle>Moda e Beleza</CardTitle>
                <CardDescription>
                  Roupas, acessórios e produtos de beleza
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {(siteSettings?.features || ['Entrega rápida', 'Produtos de qualidade', 'Suporte 24/7']).slice(0, 3).map((feature, index) => {
            const icons = [Truck, Shield, Heart];
            const Icon = icons[index];
            const colors = [
              { bg: 'bg-dynamic-primary-light', text: 'text-dynamic-primary' },
              { bg: 'bg-green-100', text: 'text-green-600' },
              { bg: 'bg-dynamic-primary-medium', text: 'text-dynamic-secondary' }
            ];
            
            return (
              <div key={index} className="text-center p-6 bg-white rounded-lg material-shadow-1">
                <div className={`w-16 h-16 ${colors[index].bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`h-8 w-8 ${colors[index].text}`} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature}</h3>
                <p className="text-gray-600">
                  {index === 0 && 'Receba seus produtos rapidamente'}
                  {index === 1 && 'Produtos selecionados com qualidade garantida'}
                  {index === 2 && 'Suporte sempre disponível para você'}
                </p>
              </div>
            );
          })}
        </div>

        {/* Special Offers */}
        <div 
          className="rounded-lg p-8 text-primary-foreground text-center"
          style={{ 
            background: `linear-gradient(to right, ${siteSettings?.primaryColor || '#2563eb'}, ${siteSettings?.secondaryColor || '#7c3aed'})` 
          }}
        >
          <h2 className="text-3xl font-bold mb-4">Ofertas Especiais</h2>
          <p className="text-xl mb-6">
            Até 50% de desconto em produtos selecionados
          </p>
          <Link href="/catalog">
            <Button variant="secondary" size="lg">
              Ver Ofertas
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
