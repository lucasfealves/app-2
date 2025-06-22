import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard, 
  Smartphone, 
  Wallet, 
  AlertCircle, 
  Truck,
  Clock,
  MapPin,
  Check,
  ArrowLeft,
  QrCode,
  Zap,
  Shield
} from "lucide-react";
import { Link, useLocation } from "wouter";

const shippingSchema = z.object({
  fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  zipCode: z.string().regex(/^\d{8}$/, "CEP deve ter 8 dígitos"),
  state: z.string().min(2, "Estado é obrigatório"),
  city: z.string().min(2, "Cidade é obrigatória"),
  address: z.string().min(5, "Endereço é obrigatório"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, "Bairro é obrigatório"),
});

const creditCardSchema = z.object({
  cardNumber: z.string().regex(/^\d{16}$/, "Número do cartão deve ter 16 dígitos"),
  holderName: z.string().min(2, "Nome do portador é obrigatório"),
  expiryDate: z.string().regex(/^\d{2}\/\d{2}$/, "Data deve estar no formato MM/AA"),
  cvv: z.string().regex(/^\d{3,4}$/, "CVV deve ter 3 ou 4 dígitos"),
});

export default function Checkout() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [pixCode, setPixCode] = useState("");
  const [orderStep, setOrderStep] = useState(1); // 1: shipping, 2: payment, 3: confirmation

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Acesso negado",
        description: "Faça login para continuar",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const shippingForm = useForm<z.infer<typeof shippingSchema>>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      fullName: "",
      zipCode: "",
      state: "",
      city: "",
      address: "",
      number: "",
      complement: "",
      neighborhood: "",
    },
  });

  const creditCardForm = useForm<z.infer<typeof creditCardSchema>>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: {
      cardNumber: "",
      holderName: "",
      expiryDate: "",
      cvv: "",
    },
  });

  const { data: cart, isLoading, error } = useQuery({
    queryKey: ['/api/cart'],
    enabled: isAuthenticated,
    retry: false,
  });

  // Simulate shipping calculation
  const { data: shippingOptions, isLoading: shippingLoading } = useQuery({
    queryKey: ['/api/shipping', shippingForm.watch('zipCode')],
    queryFn: async () => {
      const zipCode = shippingForm.getValues('zipCode');
      if (zipCode.length !== 8) return null;
      
      // Simulate API call - replace with real shipping API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return [
        {
          id: 'standard',
          name: 'Entrega Padrão',
          description: '5-7 dias úteis',
          price: 15.90,
          estimatedDays: '5-7',
          icon: <Truck className="h-4 w-4" />
        },
        {
          id: 'express',
          name: 'Entrega Expressa',
          description: '2-3 dias úteis',
          price: 25.90,
          estimatedDays: '2-3',
          icon: <Zap className="h-4 w-4" />
        },
        {
          id: 'same-day',
          name: 'Entrega no Mesmo Dia',
          description: 'Até 19h (apenas SP)',
          price: 39.90,
          estimatedDays: '0',
          icon: <Clock className="h-4 w-4" />
        }
      ];
    },
    enabled: !!shippingForm.watch('zipCode') && shippingForm.watch('zipCode').length === 8,
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      return await apiRequest('POST', '/api/orders', orderData);
    },
    onSuccess: (data) => {
      console.log('Order created successfully:', data);
      console.log('Payment method:', paymentMethod);
      
      if (paymentMethod === 'pix') {
        console.log('Setting PIX code:', data.pixCode);
        const code = data.pixCode || "00020126360014BR.GOV.BCB.PIX0114+55119999999990204000053039865802BR5925LOJA EXEMPLO6009SAO PAULO61080540900062070503***6304";
        setPixCode(code);
        console.log('PIX code set to:', code);
      } else {
        // For non-PIX payments, redirect to orders
        setTimeout(() => {
          setLocation("/orders");
        }, 2000);
      }
      
      toast({
        title: "Pedido criado!",
        description: paymentMethod === 'pix' ? "Finalize o pagamento via PIX" : "Processando pagamento...",
      });
      
      // Don't invalidate cart immediately for PIX to prevent UI flash
      if (paymentMethod !== 'pix') {
        queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      }
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Sessão expirada",
          description: "Faça login novamente",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro no pedido",
        description: "Tente novamente",
        variant: "destructive",
      });
    },
  });

  const onShippingSubmit = (data: z.infer<typeof shippingSchema>) => {
    setOrderStep(2);
  };

  const onPaymentSubmit = () => {
    const shippingData = shippingForm.getValues();
    const selectedShipping = shippingOptions?.find(option => option.id === shippingMethod);
    
    const orderData = {
      shippingAddress: shippingData,
      paymentMethod,
      shippingMethod: selectedShipping,
      ...(paymentMethod === 'credit' ? { creditCard: creditCardForm.getValues() } : {}),
    };

    createOrderMutation.mutate(orderData);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar checkout. Tente novamente.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const cartItems = cart?.items || [];
  
  // Don't show empty cart if we're waiting for PIX payment
  if (cartItems.length === 0 && !pixCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="bg-white rounded-2xl material-shadow-1 p-12 max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Carrinho vazio</h1>
            <p className="text-gray-600 mb-6">Adicione produtos antes de finalizar a compra.</p>
            <Link href="/catalog">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continuar Comprando
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = cartItems.reduce((total, item) => total + (parseFloat(item.product.price) * item.quantity), 0);
  const selectedShipping = shippingOptions?.find(option => option.id === shippingMethod);
  const shippingCost = selectedShipping?.price || 0;
  const total = subtotal + shippingCost;

  const paymentOptions = [
    {
      id: "pix",
      name: "PIX",
      description: "Pagamento instantâneo • Desconto de 5%",
      discount: 0.05,
      icon: <QrCode className="h-6 w-6" />,
      features: ["Aprovação instantânea", "Sem taxas", "Desconto de 5%"]
    },
    {
      id: "credit",
      name: "Cartão de Crédito",
      description: "Visa, Mastercard, Elo • Parcelamento até 12x",
      discount: 0,
      icon: <CreditCard className="h-6 w-6" />,
      features: ["Até 12x sem juros", "Aprovação rápida", "Seguro"]
    },
    {
      id: "google-pay",
      name: "Google Pay",
      description: "Pagamento rápido e seguro",
      discount: 0,
      icon: <Wallet className="h-6 w-6" />,
      features: ["Um toque para pagar", "Dados protegidos", "Rápido"]
    },
    {
      id: "apple-pay",
      name: "Apple Pay",
      description: "Touch ID ou Face ID",
      discount: 0,
      icon: <Smartphone className="h-6 w-6" />,
      features: ["Biometria", "Privacidade total", "Instantâneo"]
    },
  ];

  const selectedPayment = paymentOptions.find(option => option.id === paymentMethod);
  const finalTotal = total * (1 - (selectedPayment?.discount || 0));

  // PIX Payment Success Screen
  if (pixCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card className="bg-white rounded-2xl material-shadow-1">
              <CardContent className="p-8 text-center">
                <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-6">
                  <QrCode className="h-8 w-8 text-green-600" />
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Pedido Criado!</h1>
                <p className="text-gray-600 mb-6">Finalize o pagamento escaneando o QR Code PIX</p>
                
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
                  <div className="text-xs font-mono break-all text-gray-600 bg-gray-50 p-3 rounded">
                    {pixCode}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Código PIX Copia e Cola</p>
                </div>

                <div className="text-left space-y-2 mb-6">
                  <div className="flex justify-between">
                    <span>Valor:</span>
                    <span className="font-semibold">R$ {finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Desconto PIX:</span>
                    <span>-R$ {(total * 0.05).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={() => navigator.clipboard.writeText(pixCode)}
                    variant="outline" 
                    className="w-full"
                  >
                    Copiar Código PIX
                  </Button>
                  <Button 
                    onClick={() => {
                      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
                      setLocation("/orders");
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Ver Meus Pedidos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className={`flex items-center space-x-2 ${orderStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${orderStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                {orderStep > 1 ? <Check className="h-4 w-4" /> : '1'}
              </div>
              <span className="text-sm font-medium">Entrega</span>
            </div>
            <div className={`w-12 h-0.5 ${orderStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center space-x-2 ${orderStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${orderStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                {orderStep > 2 ? <Check className="h-4 w-4" /> : '2'}
              </div>
              <span className="text-sm font-medium">Pagamento</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {orderStep === 1 && (
              <>
                {/* Shipping Address */}
                <Card className="bg-white rounded-2xl material-shadow-1">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5" />
                      <span>Endereço de Entrega</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...shippingForm}>
                      <form onSubmit={shippingForm.handleSubmit(onShippingSubmit)} className="space-y-4">
                        <FormField
                          control={shippingForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome completo</FormLabel>
                              <FormControl>
                                <Input placeholder="Seu nome completo" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={shippingForm.control}
                            name="zipCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CEP</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="00000000" 
                                    maxLength={8}
                                    {...field} 
                                    onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={shippingForm.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Estado</FormLabel>
                                <FormControl>
                                  <Input placeholder="SP" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={shippingForm.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cidade</FormLabel>
                                <FormControl>
                                  <Input placeholder="Sua cidade" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={shippingForm.control}
                            name="neighborhood"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bairro</FormLabel>
                                <FormControl>
                                  <Input placeholder="Seu bairro" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={shippingForm.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Endereço</FormLabel>
                              <FormControl>
                                <Input placeholder="Rua, Avenida, etc." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={shippingForm.control}
                            name="number"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Número</FormLabel>
                                <FormControl>
                                  <Input placeholder="123" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={shippingForm.control}
                            name="complement"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Complemento</FormLabel>
                                <FormControl>
                                  <Input placeholder="Apartamento, bloco, etc." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                          Continuar para Frete
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>

                {/* Shipping Options */}
                {shippingOptions && (
                  <Card className="bg-white rounded-2xl material-shadow-1">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Truck className="h-5 w-5" />
                        <span>Opções de Entrega</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                        <div className="space-y-3">
                          {shippingOptions.map((option) => (
                            <div key={option.id} className="flex items-center space-x-3 p-4 border rounded-xl hover:bg-blue-50 transition-colors">
                              <RadioGroupItem value={option.id} id={option.id} />
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center space-x-3">
                                  {option.icon}
                                  <div>
                                    <Label htmlFor={option.id} className="font-medium cursor-pointer">
                                      {option.name}
                                    </Label>
                                    <p className="text-sm text-gray-600">{option.description}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold">R$ {option.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                  <p className="text-sm text-gray-600">{option.estimatedDays} dias</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                      
                      <Button 
                        onClick={() => setOrderStep(2)}
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                        disabled={!shippingMethod}
                      >
                        Continuar para Pagamento
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {shippingLoading && (
                  <Card className="bg-white rounded-2xl material-shadow-1">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3">
                        <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full" />
                        <span>Calculando frete...</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {orderStep === 2 && (
              <>
                {/* Payment Method */}
                <Card className="bg-white rounded-2xl material-shadow-1">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5" />
                      <span>Forma de Pagamento</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      <div className="space-y-4">
                        {paymentOptions.map((option) => (
                          <div key={option.id} className="border rounded-xl overflow-hidden">
                            <div className="flex items-center space-x-3 p-4 hover:bg-blue-50 transition-colors">
                              <RadioGroupItem value={option.id} id={option.id} />
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center space-x-3">
                                  {option.icon}
                                  <div>
                                    <Label htmlFor={option.id} className="font-medium cursor-pointer">
                                      {option.name}
                                    </Label>
                                    <p className="text-sm text-gray-600">{option.description}</p>
                                  </div>
                                </div>
                                {option.discount > 0 && (
                                  <Badge className="bg-green-100 text-green-800 border-green-200">
                                    -{Math.round(option.discount * 100)}%
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="px-4 pb-4">
                              <div className="flex flex-wrap gap-2">
                                {option.features.map((feature, index) => (
                                  <div key={index} className="flex items-center space-x-1 text-xs text-gray-600">
                                    <Check className="h-3 w-3 text-green-600" />
                                    <span>{feature}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Credit Card Form */}
                {paymentMethod === 'credit' && (
                  <Card className="bg-white rounded-2xl material-shadow-1">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Shield className="h-5 w-5" />
                        <span>Dados do Cartão</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Form {...creditCardForm}>
                        <div className="space-y-4">
                          <FormField
                            control={creditCardForm.control}
                            name="cardNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Número do Cartão</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="1234567890123456" 
                                    maxLength={16}
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={creditCardForm.control}
                            name="holderName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome no Cartão</FormLabel>
                                <FormControl>
                                  <Input placeholder="NOME COMO NO CARTÃO" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={creditCardForm.control}
                              name="expiryDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Validade</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="MM/AA" 
                                      maxLength={5}
                                      {...field}
                                      onChange={(e) => {
                                        let value = e.target.value.replace(/\D/g, '');
                                        if (value.length >= 2) {
                                          value = value.substring(0, 2) + '/' + value.substring(2, 4);
                                        }
                                        field.onChange(value);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={creditCardForm.control}
                              name="cvv"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>CVV</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="123" 
                                      maxLength={4}
                                      type="password"
                                      {...field}
                                      onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </Form>
                    </CardContent>
                  </Card>
                )}

                {/* PIX Payment Details */}
                {paymentMethod === 'pix' && (
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 rounded-2xl material-shadow-1">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-green-800">
                        <QrCode className="h-5 w-5" />
                        <span>Pagamento PIX</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="bg-green-100 rounded-full p-2">
                              <Zap className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-green-800">Pagamento Instantâneo</h4>
                              <p className="text-sm text-green-600">Aprovação em segundos</p>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm text-green-700">
                            <div className="flex items-center space-x-2">
                              <Check className="h-4 w-4" />
                              <span>Desconto de 5% no valor total</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Check className="h-4 w-4" />
                              <span>Sem taxas adicionais</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Check className="h-4 w-4" />
                              <span>Disponível 24h por dia</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <h4 className="font-medium text-green-800 mb-2">Como funciona:</h4>
                          <ol className="text-sm text-green-700 space-y-1">
                            <li>1. Finalize seu pedido</li>
                            <li>2. Escaneie o QR Code PIX</li>
                            <li>3. Confirme o pagamento no seu banco</li>
                            <li>4. Receba a confirmação instantânea</li>
                          </ol>
                        </div>
                        
                        <div className="bg-green-100 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <span className="text-green-800 font-medium">Valor com desconto:</span>
                            <span className="text-green-800 font-bold text-lg">
                              R$ {(finalTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="text-xs text-green-600 mt-1">
                            Economia de R$ {(total * 0.05).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex space-x-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setOrderStep(1)}
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                  </Button>
                  <Button 
                    onClick={onPaymentSubmit}
                    disabled={createOrderMutation.isPending || (paymentMethod === 'credit' && !creditCardForm.formState.isValid)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {createOrderMutation.isPending ? "Processando..." : "Finalizar Pedido"}
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="bg-white rounded-2xl material-shadow-1">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {item.product.imageUrl ? (
                          <img 
                            src={item.product.imageUrl} 
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-gray-400 text-xs">IMG</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                        <p className="text-sm text-gray-600">Qtd: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium">
                        R$ {(parseFloat(item.product.price) * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  
                  {selectedShipping && (
                    <div className="flex justify-between text-sm">
                      <span>Frete ({selectedShipping.name})</span>
                      <span>R$ {shippingCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  
                  {selectedPayment?.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Desconto {selectedPayment.name}</span>
                      <span>-R$ {(total * selectedPayment.discount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>R$ {finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}