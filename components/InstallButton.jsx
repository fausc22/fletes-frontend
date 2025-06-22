import { useState, useEffect } from 'react';

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar si ya está instalado
    const checkIfInstalled = () => {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return;
      }
      
      // Para iOS Safari
      if (window.navigator && window.navigator.standalone) {
        setIsInstalled(true);
        return;
      }
    };

    // Manejar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Manejar cuando la app se instala
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    checkIfInstalled();

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstalled(true);
    }
  };

  // Solo mostrar si hay deferredPrompt disponible y no está instalado
  if (!deferredPrompt || isInstalled) {
    return null;
  }

  // Mostrar siempre el botón (con diferentes estilos para desktop/mobile)
  return (
    <button
      onClick={handleInstall}
      className="
        bg-gradient-to-r from-blue-600 to-blue-700 
        hover:from-blue-700 hover:to-blue-800 
        text-white 
        px-3 py-2 md:px-4 md:py-2 
        rounded-lg 
        text-xs md:text-sm 
        font-medium 
        flex items-center space-x-1 md:space-x-2 
        transition-all duration-300 
        transform hover:scale-105 
        shadow-md hover:shadow-lg
        border border-blue-500
        whitespace-nowrap
      "
      title="Instalar VERTIMAR como aplicación"
    >
      <svg 
        className="w-3 h-3 md:w-4 md:h-4" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
        />
      </svg>
      <span className="hidden sm:inline">Instalar App</span>
      <span className="sm:hidden">App</span>
    </button>
  );
}