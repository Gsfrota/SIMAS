import { Settings, User, Bell, Shield, Palette } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/ThemeProvider';
export default function Configuracoes() {
  const auth = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <div className="rounded-md bg-accent p-1.5 sm:p-2">
            <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-accent-foreground" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-foreground truncate">
              Configurações
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Gerencie as preferências do sistema
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Perfil */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <CardTitle className="text-base sm:text-lg">Perfil</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Informações da sua conta</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0 space-y-4">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="min-w-0">
                <Label className="text-muted-foreground text-xs sm:text-sm">Nome</Label>
                <p className="font-medium text-sm sm:text-base truncate">{auth.nome || 'Não informado'}</p>
              </div>
              <div className="min-w-0">
                <Label className="text-muted-foreground text-xs sm:text-sm">Email</Label>
                <p className="font-medium text-sm sm:text-base truncate">{auth.email || 'Não informado'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Aparência */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <Palette className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <CardTitle className="text-base sm:text-lg">Aparência</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Personalize a interface</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <Label className="font-medium text-sm">Tema</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Escolha entre tema claro ou escuro
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('light')}
                  className="text-xs sm:text-sm px-3"
                >
                  Claro
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('dark')}
                  className="text-xs sm:text-sm px-3"
                >
                  Escuro
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('system')}
                  className="text-xs sm:text-sm px-3"
                >
                  Sistema
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <CardTitle className="text-base sm:text-lg">Notificações</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Configure alertas e avisos</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0 space-y-4">
            <div className="flex items-start sm:items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <Label className="font-medium text-sm">Alertas de perícias vencidas</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Notificações sobre perícias que passaram da data
                </p>
              </div>
              <Switch defaultChecked className="shrink-0" />
            </div>
            <Separator />
            <div className="flex items-start sm:items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <Label className="font-medium text-sm">Alertas de erros de envio</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Notificações sobre falhas no envio
                </p>
              </div>
              <Switch defaultChecked className="shrink-0" />
            </div>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <CardTitle className="text-base sm:text-lg">Segurança</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Opções de segurança da conta</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0 space-y-4">
            <Button variant="outline" className="w-full sm:w-auto text-sm">
              Alterar Senha
            </Button>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Recomendamos alterar sua senha periodicamente para maior segurança.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
