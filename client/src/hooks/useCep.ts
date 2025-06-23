import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface CepData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

interface CepResult {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
}

export function useCep() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const searchCep = async (cep: string): Promise<CepResult | null> => {
    // Remove caracteres não numéricos e valida formato
    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) {
      toast({
        title: "CEP inválido",
        description: "O CEP deve conter 8 dígitos",
        variant: "destructive",
      });
      return null;
    }

    setIsLoading(true);

    try {
      // Usar ViaCEP que é gratuita e confiável
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      
      if (!response.ok) {
        throw new Error('Erro na consulta do CEP');
      }

      const data: CepData = await response.json();

      // ViaCEP retorna erro: true quando CEP não existe
      if ('erro' in data) {
        toast({
          title: "CEP não encontrado",
          description: "O CEP informado não foi encontrado na base dos Correios",
          variant: "destructive",
        });
        return null;
      }

      // Validar se os dados essenciais existem
      if (!data.localidade || !data.uf) {
        toast({
          title: "CEP inválido",
          description: "CEP encontrado mas com dados incompletos",
          variant: "destructive",
        });
        return null;
      }

      const result: CepResult = {
        street: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade,
        state: data.uf,
        cep: data.cep.replace('-', '')
      };

      toast({
        title: "CEP encontrado",
        description: `Endereço preenchido automaticamente para ${result.city}/${result.state}`,
      });

      return result;

    } catch (error) {
      console.error('Erro ao consultar CEP:', error);
      toast({
        title: "Erro na consulta",
        description: "Não foi possível consultar o CEP. Verifique sua conexão e tente novamente",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    searchCep,
    isLoading
  };
}