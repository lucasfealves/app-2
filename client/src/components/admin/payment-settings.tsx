import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  CreditCard, 
  QrCode, 
  Smartphone, 
  Settings, 
  CheckCircle, 
  XCircle,
  Eye,
  EyeOff
} from "lucide-react";

interface PaymentSettings {
  pix: {
    enabled: boolean;
    pixKey: string;
    merchantName: string;
    merchantCity: string;
    discount: number;
  };
  creditCard: {
    enabled: boolean;
    processor: string;
    publicKey: string;
    secretKey: string;
    webhookUrl: string;
  };
  applePay: {
    enabled: boolean;
    merchantId: string;
    domainName: string;
  };
  googlePay: {
    enabled: boolean;
    merchantId: string;
    gatewayMerchantId: string;
  };
}

export default function PaymentSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/admin/payment-settings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/payment-settings');
      return response as PaymentSettings;
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<PaymentSettings>) => {
      return await apiRequest('PUT', '/api/admin/payment-settings', data);
    },
    onSuccess: () => {
      toast({
        title: "Configurações salvas",
        description: "As configurações de pagamento foram atualizadas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-settings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Erro ao salvar configurações",
        variant: "destructive",
      });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async (provider: string) => {
      return await apiRequest('POST', `/api/admin/payment-settings/${provider}/test`);
    },
    onSuccess: (data, provider) => {
      toast({
        title: "Conexão testada",
        description: `Conexão com ${provider} funcionando corretamente.`,
      });
    },
    onError: (error: any, provider) => {
      toast({
        title: "Erro na conexão",
        description: `Falha ao conectar com ${provider}: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const toggleSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveSettings = (section: string, data: any) => {
    updateSettingsMutation.mutate({ [section]: data });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Configurações de Pagamento</h2>
        <p className="text-gray-600">Configure os métodos de pagamento e integrações disponíveis na loja.</p>
      </div>

      <Tabs defaultValue="pix" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pix" className="flex items-center space-x-2">
            <QrCode className="h-4 w-4" />
            <span>PIX</span>
          </TabsTrigger>
          <TabsTrigger value="credit-card" className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>Cartão</span>
          </TabsTrigger>
          <TabsTrigger value="apple-pay" className="flex items-center space-x-2">
            <Smartphone className="h-4 w-4" />
            <span>Apple Pay</span>
          </TabsTrigger>
          <TabsTrigger value="google-pay" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Google Pay</span>
          </TabsTrigger>
        </TabsList>

        {/* PIX Configuration */}
        <TabsContent value="pix">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <QrCode className="h-5 w-5" />
                  <span>Configuração PIX</span>
                  {settings?.pix?.enabled ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ativo
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="h-3 w-3 mr-1" />
                      Inativo
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Configure sua chave PIX e informações do estabelecimento
                </CardDescription>
              </div>
              <Switch 
                checked={settings?.pix?.enabled || false}
                onCheckedChange={(enabled) => handleSaveSettings('pix', { ...settings?.pix, enabled })}
              />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pixKey">Chave PIX</Label>
                  <Input
                    id="pixKey"
                    value={settings?.pix?.pixKey || ""}
                    onChange={(e) => handleSaveSettings('pix', { ...settings?.pix, pixKey: e.target.value })}
                    placeholder="email@exemplo.com ou CPF/CNPJ"
                  />
                </div>
                <div>
                  <Label htmlFor="merchantName">Nome do Estabelecimento</Label>
                  <Input
                    id="merchantName"
                    value={settings?.pix?.merchantName || ""}
                    onChange={(e) => handleSaveSettings('pix', { ...settings?.pix, merchantName: e.target.value })}
                    placeholder="Minha Loja LTDA"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="merchantCity">Cidade</Label>
                  <Input
                    id="merchantCity"
                    value={settings?.pix?.merchantCity || ""}
                    onChange={(e) => handleSaveSettings('pix', { ...settings?.pix, merchantCity: e.target.value })}
                    placeholder="São Paulo"
                  />
                </div>
                <div>
                  <Label htmlFor="pixDiscount">Desconto PIX (%)</Label>
                  <Input
                    id="pixDiscount"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={settings?.pix?.discount || 0}
                    onChange={(e) => handleSaveSettings('pix', { ...settings?.pix, discount: parseFloat(e.target.value) })}
                    placeholder="5.0"
                  />
                </div>
              </div>

              <Alert>
                <QrCode className="h-4 w-4" />
                <AlertDescription>
                  O PIX é processado automaticamente pelo sistema brasileiro de pagamentos instantâneos. 
                  Certifique-se de que a chave PIX está correta e ativa em sua conta bancária.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Credit Card Configuration */}
        <TabsContent value="credit-card">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Configuração Cartão de Crédito</span>
                  {settings?.creditCard?.enabled ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ativo
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="h-3 w-3 mr-1" />
                      Inativo
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Configure o processador de pagamentos para cartões de crédito
                </CardDescription>
              </div>
              <Switch 
                checked={settings?.creditCard?.enabled || false}
                onCheckedChange={(enabled) => handleSaveSettings('creditCard', { ...settings?.creditCard, enabled })}
              />
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="processor">Processador</Label>
                <select 
                  id="processor"
                  className="w-full p-2 border rounded-md"
                  value={settings?.creditCard?.processor || "stripe"}
                  onChange={(e) => handleSaveSettings('creditCard', { ...settings?.creditCard, processor: e.target.value })}
                >
                  <option value="stripe">Stripe</option>
                  <option value="mercadopago">Mercado Pago</option>
                  <option value="pagseguro">PagSeguro</option>
                  <option value="cielo">Cielo</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="publicKey">Chave Pública</Label>
                  <Input
                    id="publicKey"
                    value={settings?.creditCard?.publicKey || ""}
                    onChange={(e) => handleSaveSettings('creditCard', { ...settings?.creditCard, publicKey: e.target.value })}
                    placeholder="pk_live_..."
                  />
                </div>
                <div>
                  <Label htmlFor="secretKey">Chave Secreta</Label>
                  <div className="relative">
                    <Input
                      id="secretKey"
                      type={showSecrets.secretKey ? "text" : "password"}
                      value={settings?.creditCard?.secretKey || ""}
                      onChange={(e) => handleSaveSettings('creditCard', { ...settings?.creditCard, secretKey: e.target.value })}
                      placeholder="sk_live_..."
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleSecret('secretKey')}
                    >
                      {showSecrets.secretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="webhookUrl">URL do Webhook</Label>
                <Input
                  id="webhookUrl"
                  value={settings?.creditCard?.webhookUrl || ""}
                  onChange={(e) => handleSaveSettings('creditCard', { ...settings?.creditCard, webhookUrl: e.target.value })}
                  placeholder="https://meusite.com/api/webhooks/payment"
                />
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={() => testConnectionMutation.mutate('credit-card')}
                  disabled={testConnectionMutation.isPending}
                  variant="outline"
                >
                  Testar Conexão
                </Button>
              </div>

              <Alert>
                <CreditCard className="h-4 w-4" />
                <AlertDescription>
                  Configure as credenciais do seu processador de pagamentos. As chaves secretas são criptografadas e armazenadas com segurança.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Apple Pay Configuration */}
        <TabsContent value="apple-pay">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Smartphone className="h-5 w-5" />
                  <span>Configuração Apple Pay</span>
                  {settings?.applePay?.enabled ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ativo
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="h-3 w-3 mr-1" />
                      Inativo
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Configure o Apple Pay para dispositivos iOS
                </CardDescription>
              </div>
              <Switch 
                checked={settings?.applePay?.enabled || false}
                onCheckedChange={(enabled) => handleSaveSettings('applePay', { ...settings?.applePay, enabled })}
              />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="appleMerchantId">Merchant ID</Label>
                  <Input
                    id="appleMerchantId"
                    value={settings?.applePay?.merchantId || ""}
                    onChange={(e) => handleSaveSettings('applePay', { ...settings?.applePay, merchantId: e.target.value })}
                    placeholder="merchant.com.exemplo.loja"
                  />
                </div>
                <div>
                  <Label htmlFor="domainName">Nome do Domínio</Label>
                  <Input
                    id="domainName"
                    value={settings?.applePay?.domainName || ""}
                    onChange={(e) => handleSaveSettings('applePay', { ...settings?.applePay, domainName: e.target.value })}
                    placeholder="minhaloja.com"
                  />
                </div>
              </div>

              <Alert>
                <Smartphone className="h-4 w-4" />
                <AlertDescription>
                  Para usar o Apple Pay, você precisa ter um certificado válido da Apple e configurar o domínio no Apple Developer Console.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Google Pay Configuration */}
        <TabsContent value="google-pay">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Configuração Google Pay</span>
                  {settings?.googlePay?.enabled ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ativo
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="h-3 w-3 mr-1" />
                      Inativo
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Configure o Google Pay para Android e web
                </CardDescription>
              </div>
              <Switch 
                checked={settings?.googlePay?.enabled || false}
                onCheckedChange={(enabled) => handleSaveSettings('googlePay', { ...settings?.googlePay, enabled })}
              />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="googleMerchantId">Merchant ID</Label>
                  <Input
                    id="googleMerchantId"
                    value={settings?.googlePay?.merchantId || ""}
                    onChange={(e) => handleSaveSettings('googlePay', { ...settings?.googlePay, merchantId: e.target.value })}
                    placeholder="12345678901234567890"
                  />
                </div>
                <div>
                  <Label htmlFor="gatewayMerchantId">Gateway Merchant ID</Label>
                  <Input
                    id="gatewayMerchantId"
                    value={settings?.googlePay?.gatewayMerchantId || ""}
                    onChange={(e) => handleSaveSettings('googlePay', { ...settings?.googlePay, gatewayMerchantId: e.target.value })}
                    placeholder="gateway_merchant_id"
                  />
                </div>
              </div>

              <Alert>
                <Settings className="h-4 w-4" />
                <AlertDescription>
                  Configure o Google Pay através do Google Pay Console. O Gateway Merchant ID deve corresponder ao seu processador de pagamentos.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}