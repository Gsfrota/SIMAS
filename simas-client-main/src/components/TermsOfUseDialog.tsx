import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export function TermsOfUseDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-primary hover:underline font-medium">
          termos de uso
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            TERMOS DE USO DO SOFTWARE
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm text-muted-foreground">
            <section>
              <h3 className="font-semibold text-foreground mb-2">1. Aceitação dos Termos</h3>
              <p>
                Ao utilizar este software ("Aplicativo"), o usuário declara ter lido, compreendido
                e aceitado integralmente as condições estabelecidas neste Termo de Uso. Caso
                não concorde com algum dos termos aqui descritos, o usuário deverá se abster
                de utilizar a aplicação.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">2. Objeto</h3>
              <p>
                O presente Termo regula o uso do software concedido pela PROCESS.AI, que
                visa automatizar fluxos jurídicos.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">3. Privacidade e Coleta de Dados</h3>
              <p className="mb-2">O software respeita integralmente a privacidade do usuário.</p>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>
                  Não acessamos, coletamos ou armazenamos informações pessoais
                  sensíveis, como mensagens, ligações, contatos ou dados de aplicativos de
                  terceiros (incluindo, mas não se limitando a, WhatsApp, Telegram ou
                  similares).
                </li>
                <li>
                  As informações eventualmente solicitadas pelo software têm finalidade
                  estritamente funcional, e seu tratamento segue a Lei Geral de Proteção de
                  Dados (Lei nº 13.709/2018).
                </li>
              </ol>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">4. Responsabilidade pelo Uso</h3>
              <p className="mb-2">A utilização do software é de responsabilidade exclusiva do usuário.</p>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>
                  A PROCESS.AI não se responsabiliza por danos, perdas ou prejuízos
                  decorrentes do mau uso da aplicação, configurações incorretas,
                  incompatibilidades de dispositivos ou falhas externas que impeçam o
                  funcionamento adequado.
                </li>
                <li>
                  Caso a entrega ou resultado esperado não seja satisfatório devido a tais
                  fatores, o usuário reconhece que não caberá indenização, reembolso ou
                  compensação de qualquer natureza.
                </li>
              </ol>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">5. Suporte e Atendimento</h3>
              <p className="mb-2">
                A PROCESS.AI disponibiliza suporte integral aos usuários para dúvidas,
                dificuldades de operação e orientações de uso, através dos canais oficiais de
                atendimento informados no site ou na aplicação.
              </p>
              <p>
                O suporte não inclui correção de falhas ocasionadas por mau uso ou alterações
                indevidas no sistema.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">6. Atualizações e Modificações</h3>
              <p>
                Os presentes termos poderão ser alterados a qualquer momento para adequação
                técnica, legal ou de segurança. A versão atualizada será sempre disponibilizada
                ao usuário no próprio software ou em meio eletrônico equivalente.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">7. Disposições Finais</h3>
              <p className="mb-2">
                Este Termo é regido pelas leis da República Federativa do Brasil.
              </p>
              <p>
                Qualquer controvérsia decorrente de sua interpretação ou execução será
                dirimida no foro da comarca de Mossoró/RN, renunciando-se expressamente a
                qualquer outro, por mais privilegiado que seja.
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
