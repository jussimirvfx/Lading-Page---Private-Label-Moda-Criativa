import { useEffect, useState } from 'react';

type IconProps = {
  className?: string;
};

type CalloutProps = {
  isVisible: boolean;
  onClose: () => void;
  brandName: string;
};

type WhatsAppFloatingButtonScrollProps = {
  formId?: string;
  brandName?: string;
};

const WhatsAppIcon = ({ className = 'w-8 h-8' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.86 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.525 3.687" />
  </svg>
);

const CloseIcon = ({ className = 'w-6 h-6' }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    className={className}
    aria-hidden="true"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const Callout = ({ isVisible, onClose, brandName }: CalloutProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-28 right-4 z-40 max-w-[19rem] rounded-lg border border-gray-200 bg-white p-4 shadow-xl sm:bottom-32 sm:max-w-sm animate-slideInRight">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 transition-colors hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D46A34]"
          aria-label="Fechar aviso do WhatsApp"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
        <p className="flex-1 text-sm font-medium leading-relaxed text-gray-800">
          Clique no botão WhatsApp para ir direto ao formulário e ser um lojista parceiro{' '}
          <span className="font-bold text-green-600">{brandName}</span>!
        </p>
      </div>
      <div className="absolute bottom-0 right-9 h-0 w-0 translate-y-full border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white drop-shadow-lg" />
    </div>
  );
};

export default function WhatsAppFloatingButtonScroll({
  formId = 'cta-form',
  brandName = 'Moda Criativa'
}: WhatsAppFloatingButtonScrollProps) {
  const [showCallout, setShowCallout] = useState(false);

  useEffect(() => {
    const showTimer = window.setTimeout(() => setShowCallout(true), 6000);
    return () => window.clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (!showCallout) return undefined;

    const hideTimer = window.setTimeout(() => setShowCallout(false), 12000);
    return () => window.clearTimeout(hideTimer);
  }, [showCallout]);

  const handleScrollToForm = () => {
    setShowCallout(false);

    const formElement = document.getElementById(formId);
    if (!formElement) return;

    formElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    });

    const firstInput = formElement.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      'input, select, textarea'
    );

    if (firstInput) {
      window.setTimeout(() => firstInput.focus(), 1000);
    }
  };

  return (
    <>
      <Callout isVisible={showCallout} onClose={() => setShowCallout(false)} brandName={brandName} />

      <button
        type="button"
        onClick={handleScrollToForm}
        className="fixed bottom-4 right-4 z-30 rounded-full bg-green-500 p-5 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-500/35 animate-float"
        aria-label={`Ir para formulário de contato ${brandName}`}
      >
        <WhatsAppIcon className="h-8 w-8" />
      </button>
    </>
  );
}
