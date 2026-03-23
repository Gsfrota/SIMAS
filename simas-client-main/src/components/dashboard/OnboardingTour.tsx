import { useEffect, useCallback } from 'react';
import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

const TOUR_STORAGE_KEY = 'simas_tour_completed';

interface OnboardingTourProps {
  isDataLoaded: boolean;
}

export function OnboardingTour({ isDataLoaded }: OnboardingTourProps) {
  const startTour = useCallback(() => {
    // Check if user has already seen the tour
    if (localStorage.getItem(TOUR_STORAGE_KEY) === 'true') {
      return;
    }

    const steps: DriveStep[] = [
      {
        // Step 1 - Welcome (no element, center screen)
        popover: {
          title: 'Bem-vindo ao SIMAS',
          description: 'Sua plataforma de gestão de procedimentos judiciais. Vamos fazer um tour rápido pela interface.',
        }
      },
      {
        element: '#tour-upload-zone',
        popover: {
          title: 'Upload Inteligente',
          description: 'Arraste suas intimações (PDF) aqui. A IA extrai automaticamente data, hora e dados do processo.',
        }
      },
      {
        element: '#tour-stats-cards',
        popover: {
          title: 'Indicadores de Desempenho',
          description: 'Acompanhe procedimentos pendentes, atrasados e concluídos em tempo real.',
        }
      },
      {
        element: '#tour-data-table',
        popover: {
          title: 'Gestão de Procedimentos',
          description: 'Visualize, edite e acompanhe o status de todos os seus procedimentos.',
        }
      }
    ];

    const driverObj = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      steps,
      popoverClass: 'simas-tour-popover',
      nextBtnText: 'Próximo',
      prevBtnText: 'Anterior',
      doneBtnText: 'Concluir',
      progressText: '{{current}} de {{total}}',
      onDestroyed: () => {
        // Mark as completed (skip or finish)
        localStorage.setItem(TOUR_STORAGE_KEY, 'true');
      }
    });

    // Small delay to ensure elements are rendered
    setTimeout(() => {
      driverObj.drive();
    }, 500);
  }, []);

  useEffect(() => {
    if (isDataLoaded) {
      startTour();
    }
  }, [isDataLoaded, startTour]);

  return null; // Component doesn't render anything visible
}
