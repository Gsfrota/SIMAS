import { useState } from 'react';
import { 
  BookOpen, 
  Upload, 
  Send, 
  MessageCircle, 
  Settings, 
  CheckCircle2,
  ChevronRight,
  Play,
  FileSpreadsheet,
  Clock,
  AlertTriangle,
  LayoutDashboard,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'intro',
    title: 'Introdução ao SIMAS',
    description: 'Conheça o sistema de gestão de procedimentos judiciais',
    icon: BookOpen,
    content: (
      <div className="space-y-4">
        <p>
          O <strong>SIMAS</strong> (Sistema Integrado de Mensagens e Agendamentos) é uma plataforma 
          desenvolvida para facilitar a gestão de perícias e procedimentos judiciais.
        </p>
        <div className="grid gap-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Gestão de Perícias</p>
              <p className="text-sm text-muted-foreground">
                Importe, acompanhe e gerencie todas as suas perícias em um só lugar
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Envio Automático via WhatsApp</p>
              <p className="text-sm text-muted-foreground">
                Notifique clientes automaticamente sobre datas e informações das perícias
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Dashboard Inteligente</p>
              <p className="text-sm text-muted-foreground">
                Visualize estatísticas, alertas críticos e status de todas as perícias
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'upload',
    title: 'Como Importar Perícias',
    description: 'Aprenda a fazer upload da planilha de perícias',
    icon: Upload,
    content: (
      <div className="space-y-4">
        <p>
          O primeiro passo para usar o SIMAS é importar sua planilha de perícias. 
          Siga o passo a passo abaixo:
        </p>
        
        <div className="space-y-4">
          <div className="flex gap-4 items-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold text-sm">
              1
            </div>
            <div>
              <p className="font-medium">Acesse a seção de Procedimentos</p>
              <p className="text-sm text-muted-foreground">
                Na sidebar, clique em "Procedimentos" para acessar o dashboard principal
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 items-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold text-sm">
              2
            </div>
            <div>
              <p className="font-medium">Localize o card de Upload</p>
              <p className="text-sm text-muted-foreground">
                Role a página até encontrar o card "Importar Planilha" com o ícone de upload
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 items-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold text-sm">
              3
            </div>
            <div>
              <p className="font-medium">Selecione o arquivo Excel</p>
              <p className="text-sm text-muted-foreground">
                Clique no botão ou arraste sua planilha .xlsx ou .xls para a área indicada
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 items-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold text-sm">
              4
            </div>
            <div>
              <p className="font-medium">Aguarde o processamento</p>
              <p className="text-sm text-muted-foreground">
                O sistema irá processar a planilha e importar automaticamente todas as perícias
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-warning/20 bg-warning/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
            <div>
              <p className="font-medium text-warning">Formato da Planilha</p>
              <p className="text-sm text-muted-foreground">
                Certifique-se de que sua planilha contém as colunas obrigatórias: 
                Data, Nome do Cliente, Telefone, e demais informações da perícia
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'whatsapp',
    title: 'Conectando o WhatsApp',
    description: 'Configure a integração com WhatsApp Business',
    icon: MessageCircle,
    content: (
      <div className="space-y-4">
        <p>
          Para enviar mensagens automáticas, você precisa conectar seu WhatsApp ao SIMAS:
        </p>
        
        <div className="space-y-4">
          <div className="flex gap-4 items-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold text-sm">
              1
            </div>
            <div>
              <p className="font-medium">Acesse a seção WhatsApp</p>
              <p className="text-sm text-muted-foreground">
                Na sidebar, clique em "WhatsApp" para acessar a página de conexão
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 items-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold text-sm">
              2
            </div>
            <div>
              <p className="font-medium">Digite seu número de telefone</p>
              <p className="text-sm text-muted-foreground">
                Informe o número com DDD que será usado para enviar as mensagens
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 items-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold text-sm">
              3
            </div>
            <div>
              <p className="font-medium">Receba o código de pareamento</p>
              <p className="text-sm text-muted-foreground">
                Um código de 6 dígitos será exibido na tela
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 items-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold text-sm">
              4
            </div>
            <div>
              <p className="font-medium">Digite o código no seu celular</p>
              <p className="text-sm text-muted-foreground">
                No WhatsApp do celular: Configurações → Aparelhos conectados → Conectar aparelho → Digite o código
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-accent/20 bg-accent/5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
            <div>
              <p className="font-medium text-accent">Conexão Segura</p>
              <p className="text-sm text-muted-foreground">
                Sua conexão é criptografada e segura. O SIMAS nunca armazena suas mensagens pessoais.
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'dashboard',
    title: 'Usando o Dashboard',
    description: 'Entenda todas as funcionalidades do painel principal',
    icon: LayoutDashboard,
    content: (
      <div className="space-y-4">
        <p>
          O Dashboard é o centro de controle do SIMAS. Aqui você pode visualizar e gerenciar todas as suas perícias:
        </p>
        
        <div className="grid gap-3">
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-3 mb-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              <p className="font-medium">Cards de Resumo</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Na parte superior, veja o total de perícias, quantas foram enviadas, pendentes e com erro
            </p>
          </div>
          
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <p className="font-medium">Alertas Críticos</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Receba alertas sobre perícias vencidas ou com problemas que precisam de atenção
            </p>
          </div>
          
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-5 w-5 text-accent" />
              <p className="font-medium">Tabela de Perícias</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Visualize todas as perícias em uma tabela com filtros por data, status, cliente e mais
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Use os filtros disponíveis para encontrar rapidamente as perícias que você precisa gerenciar.
        </p>
      </div>
    ),
  },
  {
    id: 'envios',
    title: 'Enviando Mensagens',
    description: 'Como enviar notificações para os clientes',
    icon: Send,
    content: (
      <div className="space-y-4">
        <p>
          Após conectar o WhatsApp e importar as perícias, você pode enviar mensagens para os clientes:
        </p>
        
        <div className="space-y-4">
          <div className="flex gap-4 items-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold text-sm">
              1
            </div>
            <div>
              <p className="font-medium">Localize a perícia na tabela</p>
              <p className="text-sm text-muted-foreground">
                Use os filtros para encontrar as perícias que deseja notificar
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 items-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold text-sm">
              2
            </div>
            <div>
              <p className="font-medium">Clique no botão de envio</p>
              <p className="text-sm text-muted-foreground">
                Cada linha da tabela tem um botão para enviar a mensagem individualmente
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 items-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold text-sm">
              3
            </div>
            <div>
              <p className="font-medium">Confirme o envio</p>
              <p className="text-sm text-muted-foreground">
                Revise a prévia da mensagem e confirme o envio
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 items-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold text-sm">
              4
            </div>
            <div>
              <p className="font-medium">Acompanhe o status</p>
              <p className="text-sm text-muted-foreground">
                O status da perícia será atualizado automaticamente após o envio
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-success/20 bg-success/5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
            <div>
              <p className="font-medium text-success">Mensagens Personalizadas</p>
              <p className="text-sm text-muted-foreground">
                As mensagens são automaticamente personalizadas com os dados da perícia, 
                incluindo data, horário e informações do cliente.
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

export default function Tutorial() {
  const [activeStep, setActiveStep] = useState<string>('intro');

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <div className="rounded-md bg-accent p-1.5 sm:p-2">
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-accent-foreground" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-foreground truncate">
              Tutorial do SIMAS
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Aprenda a usar todas as funcionalidades
            </p>
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 mb-6 sm:mb-8">
        {tutorialSteps.map((step) => (
          <Button
            key={step.id}
            variant={activeStep === step.id ? "default" : "outline"}
            className={cn(
              "h-auto flex-col items-center gap-1.5 sm:gap-2 p-2 sm:p-3 md:p-4",
              activeStep === step.id && "bg-accent text-accent-foreground"
            )}
            onClick={() => setActiveStep(step.id)}
          >
            <step.icon className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-[10px] sm:text-xs text-center leading-tight line-clamp-2">{step.title}</span>
          </Button>
        ))}
      </div>

      {/* Active Step Content */}
      <Card className="mb-6 sm:mb-8">
        {tutorialSteps.filter(s => s.id === activeStep).map((step) => (
          <div key={step.id}>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="rounded-md bg-accent/10 p-1.5 sm:p-2 shrink-0">
                  <step.icon className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-base sm:text-lg md:text-xl">{step.title}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">{step.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0 text-sm sm:text-base">
              {step.content}
            </CardContent>
          </div>
        ))}
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          className="text-xs sm:text-sm"
          onClick={() => {
            const currentIndex = tutorialSteps.findIndex(s => s.id === activeStep);
            if (currentIndex > 0) {
              setActiveStep(tutorialSteps[currentIndex - 1].id);
            }
          }}
          disabled={activeStep === tutorialSteps[0].id}
        >
          Anterior
        </Button>
        <Button
          size="sm"
          className="gap-1.5 sm:gap-2 text-xs sm:text-sm"
          onClick={() => {
            const currentIndex = tutorialSteps.findIndex(s => s.id === activeStep);
            if (currentIndex < tutorialSteps.length - 1) {
              setActiveStep(tutorialSteps[currentIndex + 1].id);
            }
          }}
          disabled={activeStep === tutorialSteps[tutorialSteps.length - 1].id}
        >
          Próximo
          <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
      </div>

      {/* FAQ Section */}
      <div className="mt-8 sm:mt-12">
        <h2 className="text-lg sm:text-xl font-serif font-semibold mb-3 sm:mb-4">Perguntas Frequentes</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="faq-1">
            <AccordionTrigger className="text-sm sm:text-base text-left">Posso usar o SIMAS em múltiplos dispositivos?</AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm">
              Sim! O SIMAS é uma aplicação web que pode ser acessada de qualquer dispositivo 
              com navegador. Basta fazer login com suas credenciais.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="faq-2">
            <AccordionTrigger className="text-sm sm:text-base text-left">O que acontece se minha conexão WhatsApp cair?</AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm">
              Se a conexão cair, você receberá um alerta no sistema. Basta ir à seção WhatsApp 
              e reconectar usando o mesmo processo de pareamento.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="faq-3">
            <AccordionTrigger className="text-sm sm:text-base text-left">Posso editar uma perícia após importar?</AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm">
              Sim, você pode editar os dados de qualquer perícia clicando no ícone de edição 
              na tabela de perícias. As alterações são salvas automaticamente.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="faq-4">
            <AccordionTrigger className="text-sm sm:text-base text-left">Como posso ver o histórico de mensagens enviadas?</AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm">
              Cada perícia mantém um histórico de envios. Clique na perícia para expandir 
              os detalhes e ver todas as mensagens enviadas, incluindo data e hora.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="faq-5">
            <AccordionTrigger className="text-sm sm:text-base text-left">O SIMAS funciona offline?</AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm">
              Não, o SIMAS requer conexão com a internet para funcionar, pois todas as 
              operações são sincronizadas com o servidor em tempo real.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
