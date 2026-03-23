import { useEffect, useRef, useCallback, useState } from 'react';
import { Volume2, VolumeX, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoiceAssistantContext } from '@/contexts/VoiceAssistantContext';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { useAuth } from '@/contexts/AuthContext';
import { parseLocalDate } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DashboardVoiceNarratorProps {
  summaryGlobal: {
    total_aguardando: number;
    total_enviadas: number;
    total_com_erro: number;
    total_atrasadas: number;
  } | null;
  pericias?: Array<{ data: string; enviado: boolean }>;
  isDataLoaded: boolean;
  onFilterOverdue?: () => void;
  onFilterPending?: () => void;
  onFilterCompleted?: () => void;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

// Pluralization helper for Brazilian Portuguese
function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural}`;
}

export function DashboardVoiceNarrator({ 
  summaryGlobal, 
  pericias = [],
  isDataLoaded,
  onFilterOverdue,
  onFilterPending,
  onFilterCompleted,
}: DashboardVoiceNarratorProps) {
  const auth = useAuth();
  const {
    voice_enabled,
    voice_autoplay_dashboard,
    voice_privacy_mode,
    voice_rate,
    voice_has_user_gesture,
  } = useVoiceAssistantContext();

  const { speak, stop, isSupported, isSpeaking } = useVoiceAssistant({ rate: voice_rate });
  const hasSpokenThisSessionRef = useRef(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('');

  // Calculate counts from pericias array (same logic as SummaryCards)
  const calculateCounts = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pendingCount = pericias.filter((p) => {
      const periciaDate = parseLocalDate(p.data);
      periciaDate.setHours(0, 0, 0, 0);
      return periciaDate >= today && !p.enviado;
    }).length;

    const overdueCount = pericias.filter((p) => {
      const periciaDate = parseLocalDate(p.data);
      periciaDate.setHours(0, 0, 0, 0);
      return periciaDate < today && !p.enviado;
    }).length;

    const completedCount = summaryGlobal?.total_enviadas || 0;

    return { pendingCount, overdueCount, completedCount };
  }, [pericias, summaryGlobal]);

  const buildSummaryText = useCallback((includeShortcuts: boolean = false): string => {
    if (!summaryGlobal) return '';

    const { pendingCount, overdueCount, completedCount } = calculateCounts();

    const greeting = getGreeting();
    const userName = auth.nome || 'usuário';
    
    const parts: string[] = [];

    // Greeting with optional name
    if (voice_privacy_mode) {
      parts.push(`${greeting}.`);
    } else {
      parts.push(`${greeting}, ${userName}.`);
    }

    // ALERT if there are overdue items - this comes FIRST
    if (overdueCount > 0) {
      parts.push(
        `Atenção: você tem ${pluralize(overdueCount, 'perícia atrasada', 'perícias atrasadas')}. ` +
        `Essas perícias já passaram da data agendada.`
      );
    }

    // Complete summary with correct counts
    parts.push(
      `Você tem ${pluralize(pendingCount, 'aguardando envio', 'aguardando envio')}, ` +
      `${pluralize(overdueCount, 'atrasada', 'atrasadas')} e ` +
      `${pluralize(completedCount, 'concluída', 'concluídas')}.`
    );

    // Help hint
    parts.push('Você pode clicar em Repetir resumo quando quiser.');

    // Keyboard shortcuts hint (only on first narration)
    if (includeShortcuts) {
      parts.push(
        'Atalhos disponíveis: Alt mais R para repetir, Alt mais S para parar, ' +
        'Alt mais A para atrasadas, Alt mais P para pendentes, Alt mais C para concluídas.'
      );
    }

    return parts.join(' ');
  }, [summaryGlobal, auth.nome, voice_privacy_mode, calculateCounts]);

  // Announce filter changes via aria-live
  const announceFilterChange = useCallback((filterName: string, count?: number) => {
    const message = count !== undefined 
      ? `Filtro aplicado: ${filterName}. ${count} resultado${count !== 1 ? 's' : ''}.`
      : `Filtro aplicado: ${filterName}.`;
    setLiveAnnouncement(message);
    
    // Clear after announcement
    setTimeout(() => setLiveAnnouncement(''), 1000);
  }, []);

  // Auto-narrate on dashboard load
  useEffect(() => {
    if (
      isDataLoaded &&
      summaryGlobal &&
      voice_enabled &&
      voice_autoplay_dashboard &&
      voice_has_user_gesture &&
      isSupported &&
      !hasSpokenThisSessionRef.current
    ) {
      // Include shortcuts hint only on first auto-narration
      const summaryText = buildSummaryText(true);
      
      // Small delay to ensure the page has rendered
      const timeoutId = setTimeout(() => {
        speak(summaryText);
        hasSpokenThisSessionRef.current = true;
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [
    isDataLoaded,
    summaryGlobal,
    voice_enabled,
    voice_autoplay_dashboard,
    voice_has_user_gesture,
    isSupported,
    buildSummaryText,
    speak,
  ]);

  // Keyboard shortcuts handler
  useEffect(() => {
    if (!voice_enabled || !voice_has_user_gesture || !isSupported) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if focus is on an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (!e.altKey) return;

      const { pendingCount, overdueCount, completedCount } = calculateCounts();

      switch (e.key.toLowerCase()) {
        case 'r':
          e.preventDefault();
          stop();
          speak(buildSummaryText(false));
          break;
        case 's':
          e.preventDefault();
          stop();
          break;
        case 'a':
          e.preventDefault();
          if (onFilterOverdue) {
            onFilterOverdue();
            announceFilterChange('Atrasadas', overdueCount);
          }
          break;
        case 'p':
          e.preventDefault();
          if (onFilterPending) {
            onFilterPending();
            announceFilterChange('Aguardando envio', pendingCount);
          }
          break;
        case 'c':
          e.preventDefault();
          if (onFilterCompleted) {
            onFilterCompleted();
            announceFilterChange('Concluídas', completedCount);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    voice_enabled,
    voice_has_user_gesture,
    isSupported,
    stop,
    speak,
    buildSummaryText,
    calculateCounts,
    onFilterOverdue,
    onFilterPending,
    onFilterCompleted,
    announceFilterChange,
  ]);

  const handleRepeatSummary = useCallback(() => {
    stop();
    const summaryText = buildSummaryText(false);
    if (summaryText) {
      speak(summaryText);
    }
  }, [stop, speak, buildSummaryText]);

  const handleStop = useCallback(() => {
    stop();
  }, [stop]);

  // Don't render if not supported or not enabled
  if (!isSupported || !voice_enabled || !voice_has_user_gesture) {
    return null;
  }

  return (
    <>
      {/* Aria-live region for filter announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {liveAnnouncement}
      </div>

      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 bg-card/95 backdrop-blur-sm border rounded-lg shadow-lg p-1">
                {isSpeaking ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleStop}
                    className="gap-2 h-9"
                    aria-label="Parar narração. Atalho: Alt mais S"
                  >
                    <VolumeX className="h-4 w-4" />
                    <span className="hidden sm:inline">Parar</span>
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRepeatSummary}
                    className="gap-2 h-9"
                    aria-label="Repetir resumo do painel. Atalho: Alt mais R"
                  >
                    <Volume2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Repetir resumo</span>
                  </Button>
                )}
                <div className="hidden sm:flex items-center gap-1 px-2 border-l text-xs text-muted-foreground">
                  <Keyboard className="h-3 w-3" />
                  <span>Alt+R</span>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <div className="space-y-1 text-xs">
                <p className="font-medium">Atalhos de teclado:</p>
                <p>Alt+R: Repetir resumo</p>
                <p>Alt+S: Parar narração</p>
                <p>Alt+A: Filtrar atrasadas</p>
                <p>Alt+P: Filtrar pendentes</p>
                <p>Alt+C: Filtrar concluídas</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </>
  );
}
