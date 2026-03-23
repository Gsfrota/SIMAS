import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface PairCodeDisplayProps {
  code: string;
  isExpired?: boolean;
}

export function PairCodeDisplay({ code, isExpired = false }: PairCodeDisplayProps) {
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (isExpired) return;

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isExpired]);

  // Dividir o código em caracteres individuais
  const characters = code.split('');

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6">
      {/* Código com caracteres em caixinhas */}
      <div className="flex items-center gap-1 sm:gap-2">
        {characters.map((char, index) => {
          const isSeparator = char === '-';
          
          if (isSeparator) {
            return (
              <span key={index} className="text-lg sm:text-2xl text-muted-foreground mx-0.5 sm:mx-1 font-bold">
                -
              </span>
            );
          }

          return (
            <div
              key={index}
              className="flex items-center justify-center w-10 h-12 sm:w-14 sm:h-16 bg-primary/5 border-2 border-primary/20 rounded-lg text-lg sm:text-2xl font-bold text-foreground animate-pulse"
              style={{
                animationDelay: `${index * 0.1}s`,
                animationDuration: '2s',
              }}
            >
              {char}
            </div>
          );
        })}
      </div>

      {/* Indicador de tempo estimado */}
      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
        <span>
          {isExpired 
            ? 'Código expirado, gerando novo...' 
            : `Código válido por aproximadamente ${countdown}s`}
        </span>
      </div>
    </div>
  );
}
