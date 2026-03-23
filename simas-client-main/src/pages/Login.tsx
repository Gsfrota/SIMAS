import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Activity } from 'lucide-react';
import { loginSchema, registerSchema } from '@/lib/validation-schemas';
import { TermsOfUseDialog } from '@/components/TermsOfUseDialog';

export default function Login() {
  const navigate = useNavigate();
  const { accessToken, nome, signIn, register } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerCode, setRegisterCode] = useState('');

  useEffect(() => {
    if (accessToken) {
      navigate('/dashboard', { replace: true });
    }
  }, [accessToken, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate with Zod schema
    const result = loginSchema.safeParse({
      email: loginEmail,
      password: loginPassword,
    });
    
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    try {
      await signIn(result.data.email, result.data.password);
      navigate('/dashboard');
    } catch (error: any) {
      // Error is already handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate with Zod schema
    const result = registerSchema.safeParse({
      name: registerName,
      email: registerEmail,
      password: registerPassword,
      confirmPassword: registerConfirmPassword,
      code: registerCode,
    });
    
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    try {
      await register(result.data.name, result.data.email, result.data.password, result.data.code);
      
      // After successful registration, user is automatically logged in
      // and will be redirected by the useEffect above
      navigate('/dashboard');
    } catch (error: any) {
      // Error is already handled in AuthContext with toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-secondary to-background p-3 sm:p-4">
      <Card className="w-full max-w-md p-4 sm:p-6 md:p-8 shadow-lg">
        <div className="mb-6 sm:mb-8 text-center">
          <div className="mb-3 sm:mb-4 flex justify-center">
            <div className="rounded-full bg-primary/10 p-2 sm:p-3">
              <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
          </div>
          <h1 className="mb-2 text-2xl sm:text-3xl font-bold">SIMAS</h1>
          <p className="text-xs sm:text-sm text-muted-foreground px-2">
            Sistema Inteligente para Monitoramento de Avaliações de Perícias Médicas
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'register')}>
          <TabsList className="grid w-full grid-cols-2 h-9 sm:h-10">
            <TabsTrigger value="login" className="text-xs sm:text-sm">Entrar</TabsTrigger>
            <TabsTrigger value="register" className="text-xs sm:text-sm">Criar conta</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="login-email" className="text-xs sm:text-sm">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  disabled={isLoading}
                  className="h-9 sm:h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="login-password" className="text-xs sm:text-sm">Senha</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-9 sm:h-10 text-sm"
                />
              </div>

              <Button type="submit" className="w-full h-9 sm:h-10 text-sm" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Entrar
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-3 sm:space-y-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="register-name" className="text-xs sm:text-sm">Nome completo</Label>
                <Input
                  id="register-name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  disabled={isLoading}
                  className="h-9 sm:h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="register-email" className="text-xs sm:text-sm">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  disabled={isLoading}
                  className="h-9 sm:h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="register-password" className="text-xs sm:text-sm">Senha</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="••••••••"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-9 sm:h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="register-confirm-password" className="text-xs sm:text-sm">Confirmar senha</Label>
                <Input
                  id="register-confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-9 sm:h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="register-code" className="text-xs sm:text-sm">Código de convite</Label>
                <Input
                  id="register-code"
                  type="text"
                  placeholder="ABC123"
                  value={registerCode}
                  onChange={(e) => setRegisterCode(e.target.value.toUpperCase())}
                  disabled={isLoading}
                  className="h-9 sm:h-10 text-sm"
                />
              </div>

              <Button type="submit" className="w-full h-9 sm:h-10 text-sm" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar conta
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Ao fazer login você concorda com os <TermsOfUseDialog />
        </p>
      </Card>
    </div>
  );
}
