import { useState } from 'react';
import { Volume2, VolumeX, Eye, EyeOff, Play, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useVoiceAssistantContext } from '@/contexts/VoiceAssistantContext';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { VoiceActivationModal } from './VoiceActivationModal';

interface AccessibilitySettingsProps {
  dashboardSummary?: string;
}

export function AccessibilitySettings({ dashboardSummary }: AccessibilitySettingsProps) {
  const {
    voice_enabled,
    voice_autoplay_dashboard,
    voice_privacy_mode,
    voice_rate,
    voice_has_user_gesture,
    updatePreference,
    setUserGesture,
  } = useVoiceAssistantContext();

  const { speak, stop, isSupported, isSpeaking } = useVoiceAssistant({ rate: voice_rate });
  const [showActivationModal, setShowActivationModal] = useState(false);

  const handleToggleAssistant = (enabled: boolean) => {
    if (enabled && !voice_has_user_gesture) {
      // Show modal for first-time activation
      setShowActivationModal(true);
    } else {
      updatePreference('voice_enabled', enabled);
      if (!enabled) {
        stop();
      }
    }
  };

  const handleActivationConfirm = () => {
    setUserGesture();
    updatePreference('voice_enabled', true);
    setShowActivationModal(false);
  };

  const handleActivationCancel = () => {
    setShowActivationModal(false);
  };

  const handleRepeatSummary = () => {
    stop();
    if (dashboardSummary) {
      speak(dashboardSummary);
    } else {
      speak('Acesse o painel para ouvir o resumo das suas informações.');
    }
  };

  const handleRateChange = (value: number[]) => {
    updatePreference('voice_rate', value[0]);
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <VolumeX className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <CardTitle className="text-base sm:text-lg">Acessibilidade</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Assistente de voz</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Seu navegador não suporta síntese de voz. Tente usar um navegador mais recente como
              Chrome, Firefox ou Edge.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Volume2 className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <CardTitle className="text-base sm:text-lg">Acessibilidade</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Assistente de voz para navegação
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0 space-y-4">
          {/* Toggle: Assistente de voz */}
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Label className="font-medium text-sm">Assistente de voz</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Ativa a narração automática de informações
              </p>
            </div>
            <Switch
              checked={voice_enabled}
              onCheckedChange={handleToggleAssistant}
              aria-label="Ativar assistente de voz"
            />
          </div>

          {voice_enabled && (
            <>
              <Separator />

              {/* Toggle: Falar automaticamente */}
              <div className="flex items-start sm:items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <Label className="font-medium text-sm">Falar ao abrir o painel</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Narra o resumo automaticamente ao acessar o dashboard
                  </p>
                </div>
                <Switch
                  checked={voice_autoplay_dashboard}
                  onCheckedChange={(v) => updatePreference('voice_autoplay_dashboard', v)}
                  aria-label="Falar automaticamente ao abrir o painel"
                />
              </div>

              <Separator />

              {/* Toggle: Modo privacidade */}
              <div className="flex items-start sm:items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {voice_privacy_mode ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Label className="font-medium text-sm">Modo privacidade</Label>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Não falar nomes ou informações pessoais
                  </p>
                </div>
                <Switch
                  checked={voice_privacy_mode}
                  onCheckedChange={(v) => updatePreference('voice_privacy_mode', v)}
                  aria-label="Ativar modo privacidade"
                />
              </div>

              <Separator />

              {/* Slider: Velocidade da fala */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-medium text-sm">Velocidade da fala</Label>
                  <span className="text-xs text-muted-foreground font-sans">
                    {voice_rate.toFixed(1)}x
                  </span>
                </div>
                <Slider
                  value={[voice_rate]}
                  onValueChange={handleRateChange}
                  min={0.8}
                  max={1.2}
                  step={0.1}
                  className="w-full"
                  aria-label="Ajustar velocidade da fala"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-sans">
                  <span>Lento (0.8x)</span>
                  <span>Normal (1.0x)</span>
                  <span>Rápido (1.2x)</span>
                </div>
              </div>

              <Separator />

              {/* Botão: Repetir resumo */}
              <Button
                variant="outline"
                className="w-full sm:w-auto gap-2"
                onClick={handleRepeatSummary}
                disabled={isSpeaking}
                aria-label="Repetir resumo do painel"
              >
                <Play className="h-4 w-4" />
                {isSpeaking ? 'Narrando...' : 'Repetir resumo'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <VoiceActivationModal
        open={showActivationModal}
        onActivate={handleActivationConfirm}
        onCancel={handleActivationCancel}
      />
    </>
  );
}
