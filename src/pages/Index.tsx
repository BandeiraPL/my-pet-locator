/**
 * Pet Tag - Página principal
 * 
 * Para personalizar:
 * - Substitua src/assets/pet.jpg pela foto do seu pet
 * - Substitua src/assets/background.png por outro fundo se desejar
 * - Altere o nome inicial e telefone nas variáveis de estado abaixo
 */

import { useState } from "react";
import { MapPin, Phone, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Imagens - substitua estes arquivos para personalizar
import backgroundImage from "@/assets/background.png";
import defaultPetImage from "@/assets/pet.jpg";

const MAX_IMAGE_SIZE = 800; // Limite de resolução: 800x800px

const Index = () => {
  const { toast } = useToast();
  
  // ========== CONFIGURAÇÕES EDITÁVEIS ==========
  // Altere os valores iniciais aqui:
  const [petName, setPetName] = useState("Bella");
  const [phoneNumber, setPhoneNumber] = useState("+55 11 95194-9435");
  // =============================================

  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [petImageUrl, setPetImageUrl] = useState<string>(defaultPetImage);

  // Processa e redimensiona imagem para máximo 800x800px
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        // Redimensiona mantendo proporção se maior que 800px
        if (width > MAX_IMAGE_SIZE || height > MAX_IMAGE_SIZE) {
          if (width > height) {
            height = (height / width) * MAX_IMAGE_SIZE;
            width = MAX_IMAGE_SIZE;
          } else {
            width = (width / height) * MAX_IMAGE_SIZE;
            height = MAX_IMAGE_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const resizedUrl = canvas.toDataURL("image/jpeg", 0.9);
        setPetImageUrl(resizedUrl);
        
        toast({
          title: "Foto atualizada!",
          description: `Imagem redimensionada para ${Math.round(width)}x${Math.round(height)}px`,
        });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Normaliza o telefone removendo caracteres não numéricos
  const normalizePhone = (phone: string): string => {
    return phone.replace(/\D/g, "");
  };

  // Abre WhatsApp com mensagem
  const openWhatsApp = (message: string) => {
    const normalizedPhone = normalizePhone(phoneNumber);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  // Envia localização ao dono
  const handleSendLocation = async () => {
    setIsLoadingLocation(true);

    // Verifica se geolocalização está disponível
    if (!navigator.geolocation) {
      toast({
        title: "Erro",
        description: "Geolocalização não suportada neste navegador.",
        variant: "destructive",
      });
      setIsLoadingLocation(false);
      return;
    }

    // Solicita permissão e obtém localização
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const message = `Encontrei o pet ${petName}. Localização: https://maps.google.com/?q=${latitude},${longitude}`;
        openWhatsApp(message);
        setIsLoadingLocation(false);
        
        toast({
          title: "Sucesso!",
          description: "Abrindo WhatsApp com a localização...",
        });
      },
      (error) => {
        setIsLoadingLocation(false);
        let errorMessage = "Não foi possível obter a localização.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permissão de localização negada. Por favor, permita o acesso à localização.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Localização indisponível. Tente novamente.";
            break;
          case error.TIMEOUT:
            errorMessage = "Tempo esgotado ao obter localização. Tente novamente.";
            break;
        }

        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  // Abre WhatsApp com mensagem padrão
  const handleOpenWhatsApp = () => {
    const message = `Olá, sobre o pet ${petName}`;
    openWhatsApp(message);
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex flex-col items-center justify-start py-8 px-4"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Container principal */}
      <main className="w-full max-w-sm flex flex-col items-center gap-6 pt-4">
        
        {/* Título - Nome do Pet (editável) */}
        <h1 className="w-full text-center">
          <input
            type="text"
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            className="w-full text-center text-5xl md:text-6xl font-serif font-semibold text-foreground bg-transparent border-none outline-none focus:ring-0 text-shadow-soft"
            placeholder="Nome do Pet"
            aria-label="Nome do pet"
          />
        </h1>

        {/* Avatar circular do pet - com upload de foto */}
        <div className="relative">
          <label className="cursor-pointer block">
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden avatar-ring relative group">
              <img
                src={petImageUrl}
                alt={`Foto do pet ${petName}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-sm font-serif">Trocar foto</span>
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              aria-label="Selecionar foto do pet"
            />
          </label>
        </div>

        {/* Telefone do dono (editável) */}
        <div className="flex items-center gap-2 text-foreground">
          <Phone className="w-6 h-6 text-foreground/70" />
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="text-2xl md:text-3xl font-serif text-center bg-transparent border-none outline-none focus:ring-0 text-foreground"
            placeholder="+55 00 00000-0000"
            aria-label="Telefone do dono"
          />
        </div>

        {/* Botão de enviar localização */}
        <button
          onClick={handleSendLocation}
          disabled={isLoadingLocation}
          className="w-full max-w-xs flex items-center justify-center gap-3 px-6 py-4 bg-accent hover:bg-accent/90 text-accent-foreground rounded-3xl shadow-md transition-all duration-200 hover:shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          aria-label="Enviar localização ao dono via WhatsApp"
        >
          <MapPin className={`w-6 h-6 ${isLoadingLocation ? 'animate-pulse-soft' : ''}`} />
          <span className="text-lg font-serif font-medium">
            {isLoadingLocation ? "Obtendo localização..." : "Enviar localização ao dono"}
          </span>
        </button>

        {/* Botão de abrir WhatsApp */}
        <button
          onClick={handleOpenWhatsApp}
          className="w-full max-w-xs flex items-center justify-center gap-3 px-6 py-4 bg-whatsapp hover:bg-whatsapp/90 text-white rounded-3xl shadow-md transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
          aria-label="Abrir conversa no WhatsApp"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-lg font-serif font-medium">
            Abrir WhatsApp do dono
          </span>
        </button>

        {/* Informações adicionais (opcional) */}
        <div className="mt-4 text-center text-sm text-muted-foreground font-serif">
          <p>Escaneou este QR code?</p>
          <p>Ajude a reunir este pet com seu dono!</p>
        </div>
      </main>
    </div>
  );
};

export default Index;

/**
 * ========== INSTRUÇÕES DE USO ==========
 * 
 * 1. IMAGENS:
 *    - Substitua src/assets/pet.jpg pela foto do seu pet
 *    - Substitua src/assets/background.png por outro fundo se desejar
 * 
 * 2. CONFIGURAÇÃO INICIAL:
 *    - Altere o nome do pet na linha: useState("Bella")
 *    - Altere o telefone na linha: useState("+55 31 98765-4321")
 * 
 * 3. FUNCIONALIDADES:
 *    - O nome e telefone são editáveis diretamente na tela
 *    - "Enviar localização ao dono" solicita permissão GPS e abre WhatsApp
 *    - "Abrir WhatsApp do dono" abre conversa com mensagem padrão
 * 
 * 4. PARA USAR COMO QR CODE:
 *    - Publique o projeto e gere um QR code com a URL
 *    - Cole o QR code na coleira/tag do pet
 * 
 * =======================================
 */
