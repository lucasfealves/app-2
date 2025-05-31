import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Star, Truck, Shield, CreditCard } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <ShoppingCart className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">E-Commerce</h1>
          </div>
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Sua loja online completa
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Descubra uma experiência de compra excepcional com os melhores produtos, 
            preços competitivos e entrega rápida.
          </p>
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            onClick={() => window.location.href = "/api/login"}
          >
            Entrar na sua conta
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Por que escolher nossa plataforma?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="text-center material-shadow-1 hover:material-shadow-2 transition-shadow">
            <CardHeader>
              <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <CardTitle>Produtos de Qualidade</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Selecionamos cuidadosamente os melhores produtos para você
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center material-shadow-1 hover:material-shadow-2 transition-shadow">
            <CardHeader>
              <Truck className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <CardTitle>Entrega Rápida</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Entregamos seus pedidos de forma rápida e segura
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center material-shadow-1 hover:material-shadow-2 transition-shadow">
            <CardHeader>
              <Shield className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <CardTitle>Compra Segura</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Seus dados estão protegidos com nossa tecnologia de segurança
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center material-shadow-1 hover:material-shadow-2 transition-shadow">
            <CardHeader>
              <CreditCard className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <CardTitle>Múltiplas Formas de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                PIX, cartão, Google Pay, Apple Pay e muito mais
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">
            Pronto para começar?
          </h3>
          <p className="text-xl mb-8">
            Junte-se a milhares de clientes satisfeitos
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg"
            onClick={() => window.location.href = "/api/login"}
          >
            Criar conta agora
          </Button>
        </div>
      </div>
    </div>
  );
}
