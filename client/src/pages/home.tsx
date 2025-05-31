import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, TrendingUp, Package, Heart } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bem-vindo de volta, {user?.firstName || 'Cliente'}!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Descubra os melhores produtos e ofertas especiais para você
          </p>
          <Link href="/catalog">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
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
                <Package className="h-12 w-12 text-blue-600 mx-auto mb-2" />
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

        {/* Special Offers */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white text-center">
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
