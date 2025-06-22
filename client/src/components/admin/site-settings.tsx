import { useState } from "react";
import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Palette, Globe, FileText } from "lucide-react";

interface SiteSettings {
  siteName: string;
  primaryColor: string;
  secondaryColor: string;
  heroTitle: string;
  heroDescription: string;
  features: string[];
}

export default function SiteSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery<SiteSettings>({
    queryKey: ['/api/admin/site-settings'],
    retry: false,
  });

  const [formData, setFormData] = useState<SiteSettings>({
    siteName: 'E-Commerce',
    primaryColor: '#2563eb',
    secondaryColor: '#7c3aed',
    heroTitle: 'Bem-vindo à nossa loja',
    heroDescription: 'Encontre os melhores produtos com os melhores preços',
    features: [
      'Entrega rápida',
      'Produtos de qualidade',
      'Suporte 24/7'
    ]
  });

  // Update form data when settings are loaded
  React.useEffect(() => {
    if (settings) {
      setFormData({
        siteName: settings.siteName || 'E-Commerce',
        primaryColor: settings.primaryColor || '#2563eb',
        secondaryColor: settings.secondaryColor || '#7c3aed',
        heroTitle: settings.heroTitle || 'Bem-vindo à nossa loja',
        heroDescription: settings.heroDescription || 'Encontre os melhores produtos com os melhores preços',
        features: settings.features || ['Entrega rápida', 'Produtos de qualidade', 'Suporte 24/7']
      });
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: SiteSettings) => {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao salvar configurações');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Configurações salvas",
        description: "As configurações do site foram atualizadas com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/site-settings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/site-settings'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao salvar configurações",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: keyof SiteSettings, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({
      ...prev,
      features: newFeatures
    }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      features: newFeatures
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando configurações...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Site Identity */}
      <Card className="material-shadow-1">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Identidade do Site
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="siteName">Nome do Site</Label>
            <Input
              id="siteName"
              value={formData.siteName}
              onChange={(e) => handleInputChange('siteName', e.target.value)}
              placeholder="Nome da sua loja"
            />
          </div>
        </CardContent>
      </Card>

      {/* Color Scheme */}
      <Card className="material-shadow-1">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="h-5 w-5 mr-2" />
            Esquema de Cores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primaryColor">Cor Primária</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={formData.primaryColor}
                  onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                  placeholder="#2563eb"
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="secondaryColor">Cor Secundária</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={formData.secondaryColor}
                  onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                  placeholder="#7c3aed"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Preview:</p>
            <div className="flex space-x-2">
              <div 
                className="w-16 h-8 rounded border"
                style={{ backgroundColor: formData.primaryColor }}
              />
              <div 
                className="w-16 h-8 rounded border"
                style={{ backgroundColor: formData.secondaryColor }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Card className="material-shadow-1">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Conteúdo Principal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="heroTitle">Título Principal</Label>
            <Input
              id="heroTitle"
              value={formData.heroTitle}
              onChange={(e) => handleInputChange('heroTitle', e.target.value)}
              placeholder="Título que aparece na página inicial"
            />
          </div>
          <div>
            <Label htmlFor="heroDescription">Descrição Principal</Label>
            <Textarea
              id="heroDescription"
              value={formData.heroDescription}
              onChange={(e) => handleInputChange('heroDescription', e.target.value)}
              placeholder="Descrição que aparece na página inicial"
              rows={3}
            />
          </div>
          <div>
            <Label>Características do Site</Label>
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder={`Característica ${index + 1}`}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeFeature(index)}
                    disabled={formData.features.length <= 1}
                  >
                    Remover
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFeature}
                disabled={formData.features.length >= 6}
              >
                Adicionar Característica
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={updateSettingsMutation.isPending}
          className="w-full md:w-auto"
        >
          {updateSettingsMutation.isPending ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </form>
  );
}