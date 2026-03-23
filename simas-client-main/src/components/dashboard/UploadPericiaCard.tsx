import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadPericiaPDF } from "@/lib/apiClient";
import { showSuccessToast, showErrorToast, showWarningToast, extractErrorMessage } from "@/lib/toast-helpers";
import { Upload, FileText, X, FileSearch, UserSearch, CalendarCheck, Check, Sparkles } from "lucide-react";

interface UploadPericiaCardProps {
  onSuccess: () => void;
}

const uploadSteps = [
  { id: 1, label: "Escaneando PDF...", icon: FileSearch },
  { id: 2, label: "Extraindo dados do paciente...", icon: UserSearch },
  { id: 3, label: "Agendando lembrete...", icon: CalendarCheck },
];

export function UploadPericiaCard({ onSuccess }: UploadPericiaCardProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [contato, setContato] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Animate through steps during upload
  useEffect(() => {
    if (!isUploading) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < uploadSteps.length) {
          return prev + 1;
        }
        return prev;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isUploading]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type !== "application/pdf") {
        showWarningToast("Formato inválido", "Apenas arquivos PDF são aceitos");
      } else if (file.size > 10 * 1024 * 1024) {
        showWarningToast("Arquivo muito grande", "O PDF deve ter no máximo 10 MB");
      } else {
        setSelectedFile(file);
      }
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type !== "application/pdf") {
        showWarningToast("Formato inválido", "Apenas arquivos PDF são aceitos");
      } else if (file.size > 10 * 1024 * 1024) {
        showWarningToast("Arquivo muito grande", "O PDF deve ter no máximo 10 MB");
      } else {
        setSelectedFile(file);
      }
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedFile) {
      showWarningToast("Arquivo necessário", "Por favor, selecione um arquivo PDF");
      return;
    }

    setIsUploading(true);
    setCurrentStep(1);

    try {
      await uploadPericiaPDF(selectedFile, contato, localizacao);

      showSuccessToast("Perícia registrada", "O documento foi processado com sucesso");

      setSelectedFile(null);
      setContato("");
      setLocalizacao("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      onSuccess();
    } catch (error: any) {
      if (error.status === 401) {
        showErrorToast("Sessão expirada", "Faça login novamente para continuar");
        return;
      }
      showErrorToast("Erro no upload", extractErrorMessage(error, "Erro ao processar perícia"));
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, contato, localizacao, onSuccess]);

  return (
    <Card id="tour-upload-zone" className="border-border/50 card-premium overflow-hidden">
      <CardHeader className="p-5 sm:p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-accent/10 p-2.5">
            <Sparkles className="h-5 w-5 text-accent" />
          </div>
          <div>
            <CardTitle className="text-xl font-sans sm:text-2xl font-bold">Processar nova perícia</CardTitle>
            <CardDescription className="text-sm mt-1">
              Envie o PDF e deixe a IA extrair automaticamente os dados
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 pt-0 space-y-5">
        {/* Upload Area */}
        <div className="space-y-2">
          <Label htmlFor="file-upload" className="text-sm font-medium">
            Documento da perícia (PDF)
          </Label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`
              relative flex flex-col items-center justify-center
              min-h-[200px] sm:min-h-[240px] rounded-lg border-2 border-dashed
              transition-all duration-200
              ${isUploading ? "cursor-default" : "cursor-pointer"}
              ${
                isDragging
                  ? "border-accent bg-accent/5 scale-[1.01]"
                  : "border-border hover:border-accent/50 hover:bg-secondary/30"
              }
              ${selectedFile && !isUploading ? "bg-secondary/30 border-accent/30" : ""}
            `}
          >
            <input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />

            {isUploading ? (
              /* Step-by-step progress animation */
              <div className="flex flex-col items-center gap-6 p-6 w-full max-w-sm">
                <div className="flex items-center justify-between w-full">
                  {uploadSteps.map((step, index) => (
                    <div key={step.id} className="flex items-center flex-1">
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`
                            w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                            ${
                              currentStep > index
                                ? "bg-success text-success-foreground"
                                : currentStep === index + 1
                                  ? "bg-accent text-accent-foreground animate-pulse-ring"
                                  : "bg-muted text-muted-foreground"
                            }
                          `}
                        >
                          {currentStep > index ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                        </div>
                        <span
                          className={`text-xs text-center max-w-[80px] ${
                            currentStep >= index + 1 ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                      {index < uploadSteps.length - 1 && (
                        <div
                          className={`h-0.5 flex-1 mx-2 mt-[-24px] transition-colors duration-300 ${
                            currentStep > index + 1 ? "bg-success" : "bg-border"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : selectedFile ? (
              <div className="flex flex-col items-center gap-4 p-6">
                <div className="rounded-full bg-accent/10 p-4">
                  <FileText className="h-10 w-10 text-accent" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-foreground truncate max-w-[280px]">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile();
                  }}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="h-4 w-4 mr-1" />
                  Remover arquivo
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 p-8 text-center">
                <div className={`rounded-full p-4 transition-colors ${isDragging ? "bg-accent/10" : "bg-muted"}`}>
                  <Upload className={`h-10 w-10 ${isDragging ? "text-accent" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <p className="font-medium text-foreground">Arraste o PDF aqui</p>
                  <p className="text-sm text-muted-foreground mt-1">ou clique para selecionar</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form fields */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contato" className="text-sm font-medium">
              Contato (WhatsApp)
            </Label>
            <Input
              id="contato"
              type="tel"
              placeholder="5584999999999"
              value={contato}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 13);
                setContato(value);
              }}
              disabled={isUploading}
              maxLength={13}
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">Formato: 55 + DDD + número</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="localizacao" className="text-sm font-medium">
              Localização / Órgão
            </Label>
            <Input
              id="localizacao"
              type="text"
              placeholder="Ex.: INSS MOSSORÓ"
              value={localizacao}
              onChange={(e) => setLocalizacao(e.target.value)}
              disabled={isUploading}
              className="h-10"
            />
          </div>
        </div>

        {/* Submit button */}
        <Button
          onClick={handleSubmit}
          disabled={!selectedFile || isUploading}
          className="w-full h-11 text-base font-medium"
          size="lg"
        >
          {isUploading ? (
            "Processando..."
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Processar perícia
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
