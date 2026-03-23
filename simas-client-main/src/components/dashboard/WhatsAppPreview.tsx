import { parseLocalDate } from '@/lib/utils';
import { CheckCheck, User } from 'lucide-react';
import type { Pericia } from '@/lib/apiClient';

interface WhatsAppPreviewProps {
  pericia: Pericia;
  companyName?: string;
  profileImageUrl?: string;
}

export function WhatsAppPreview({ pericia, companyName, profileImageUrl }: WhatsAppPreviewProps) {
  const formattedDate = pericia.data 
    ? parseLocalDate(pericia.data).toLocaleDateString('pt-BR')
    : '[data]';
  const formattedTime = pericia.horario?.substring(0, 5) || '[horário]';
  const serviceName = pericia.servico || 'Perícia';
  const location = pericia.endereco || 'INSS';
  const empresa = companyName || 'Sua Empresa';
  const clientName = pericia.periciado || '[nome]';

  const messageText = `Olá ${clientName}, tudo bem? 👋

Sua ${serviceName} foi agendada!

Confira os detalhes abaixo:

📅 Data: ${formattedDate}
🕒 Horário: ${formattedTime}
📍 Local: ${location}

⚠️ É muito importante comparecer na data e horário informados, levando documento com foto e seus laudos médicos.

Atenciosamente,
Equipe Administrativa - ${empresa}`;

  return (
    <div className="flex flex-col items-center p-4">
      {/* Phone Frame */}
      <div className="w-full max-w-[320px] bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
        <div className="bg-white rounded-[2rem] overflow-hidden">
          
          {/* WhatsApp Header */}
          <div className="bg-[#075E54] text-white px-4 py-3 flex items-center gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden flex-shrink-0">
              {profileImageUrl && profileImageUrl.startsWith('https://') ? (
                <img src={profileImageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="h-5 w-5 text-white" />
              )}
            </div>
            {/* Company Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{empresa}</p>
              <p className="text-xs text-white/70">Conta Comercial</p>
            </div>
          </div>
          
          {/* Chat Body */}
          <div 
            className="min-h-[420px] p-3"
            style={{ backgroundColor: '#E5DDD5' }}
          >
            {/* Message Bubble - Outbound (right side) */}
            <div className="flex justify-end">
              <div 
                className="rounded-lg rounded-tr-none p-3 max-w-[85%] shadow-sm"
                style={{ backgroundColor: '#D9FDD3' }}
              >
                <p className="text-[14px] text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {messageText}
                </p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[11px] text-gray-500">
                    {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <CheckCheck className="h-4 w-4 text-[#34B7F1]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground text-center mt-4 max-w-[280px]">
        Esta é a mensagem que será enviada ao cliente via WhatsApp
      </p>
    </div>
  );
}