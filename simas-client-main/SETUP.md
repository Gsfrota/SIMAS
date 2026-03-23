# Setup do SIMAS

Este guia explica como configurar o projeto SIMAS com arquitetura de API única via FastAPI.

## Arquitetura

O SIMAS utiliza uma arquitetura onde:
- **Frontend (React)**: Comunica-se APENAS com a API FastAPI
- **Backend (FastAPI)**: Gerencia toda a lógica de negócio, autenticação e acesso ao banco de dados
- **Supabase**: Usado APENAS pelo backend como banco de dados PostgreSQL e sistema de autenticação

**IMPORTANTE**: O frontend não acessa o Supabase diretamente. Toda comunicação passa pela API FastAPI.

## 1. Variáveis de Ambiente

O frontend precisa apenas de uma variável de ambiente:

```env
# FastAPI Backend URL
VITE_API_BASE_URL=https://376f575e0209.ngrok-free.app
```

### Como configurar:

1. Copie o arquivo `.env.example` para `.env`
2. Atualize `VITE_API_BASE_URL` com a URL do seu backend FastAPI
   - Para desenvolvimento com ngrok: `https://xxxxx.ngrok-free.app`
   - Para produção no Cloud Run: `https://sua-api.run.app`

## 2. Backend FastAPI

O backend deve estar rodando e acessível na URL configurada em `VITE_API_BASE_URL`.

### Endpoints necessários:

#### POST /auth/register
Registra um novo usuário.

**Body:**
```json
{
  "nome": "Nome Completo",
  "email": "usuario@example.com",
  "password": "senha123",
  "codigo_convite": "ABC123"
}
```

**Resposta (200):**
```json
{
  "success": true,
  "message": "Conta criada com sucesso.",
  "access_token": "<JWT>",
  "token_type": "bearer",
  "expires_in": 3600,
  "user_id": "<uuid>",
  "id_cliente": 1,
  "email": "usuario@example.com",
  "nome": "Nome Completo"
}
```

#### POST /auth/login
Autentica um usuário existente.

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "senha123"
}
```

**Resposta (200):**
```json
{
  "success": true,
  "message": "Login realizado com sucesso.",
  "access_token": "<JWT>",
  "token_type": "bearer",
  "expires_in": 3600,
  "user_id": "<uuid>",
  "id_cliente": 1,
  "email": "usuario@example.com",
  "nome": "Nome Completo"
}
```

#### GET /dashboard
Retorna dados do dashboard (requer autenticação).

**Headers:**
- `Authorization: Bearer <jwt_token>`
- `Content-Type: application/json`
- `ngrok-skip-browser-warning: true`

**Query params opcionais:**
- `status`: "enviada" | "pendente" | "erro"
- `nome`: filtro por nome do periciado
- `start`: data inicial (YYYY-MM-DD)
- `end`: data final (YYYY-MM-DD)

**Resposta:**
```json
{
  "summary_global": {
    "total_pericias": 100,
    "total_enviadas": 80,
    "total_pendentes": 15,
    "total_com_erro": 5,
    "total_uploads": 100
  },
  "summary_by_client": [
    {
      "id_cliente": 1,
      "cliente": "Nome Cliente",
      "nome_empresa": "Empresa X",
      "total_pericias": 100,
      "total_enviadas": 80,
      "total_pendentes": 15,
      "total_com_erro": 5
    }
  ],
  "pericias_by_client": {
    "clients": [
      {
        "id_cliente": 1,
        "cliente": "Nome Cliente",
        "nome_empresa": "Empresa X",
        "pericias": [
          {
            "id_pericia": 123,
            "periciado": "Fulano de Tal",
            "numero": "ABC123",
            "data": "2025-11-20",
            "horario": "14:00:00",
            "status": "enviada",
            "cpf": "000.000.000-00",
            "endereco": "Rua X, 123",
            "fileurl": "https://...",
            "upload_at": "2025-11-19T10:00:00Z",
            "enviado": true,
            "data_envio": "2025-11-19T15:00:00Z",
            "adicionado": "2025-11-15T08:00:00Z",
            "updated_at": "2025-11-20T09:00:00Z"
          }
        ]
      }
    ]
  }
}
```

#### PATCH /pericias/{id_pericia}
Atualiza uma perícia (requer autenticação).

**Headers:**
- `Authorization: Bearer <jwt_token>`
- `Content-Type: application/json`
- `ngrok-skip-browser-warning: true`

**Body (todos campos opcionais):**
```json
{
  "periciado": "Novo Nome",
  "data": "2025-11-21",
  "horario": "15:30",
  "data_envio": "2025-11-20T10:00:00Z",
  "enviado": true
}
```

## 3. Configuração do Backend (FastAPI)

O backend FastAPI deve estar configurado com:

### Variáveis de ambiente do backend:
```env
# Supabase (usado pelo backend)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_KEY=sua-service-key

# JWT Secret
JWT_SECRET_KEY=sua-chave-secreta-aqui
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=60
```

### Configuração do Supabase (no backend):

Execute este SQL no SQL Editor do Supabase:

```sql
-- Criar tabela de perfis
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  id_cliente integer not null,
  nome text not null,
  created_at timestamp with time zone default now(),
  
  primary key (id)
);

-- Habilitar RLS
alter table public.profiles enable row level security;

-- Policy: usuários podem ler apenas seu próprio perfil
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Função para criar perfil automaticamente no registro
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public 
as $$
begin
  insert into public.profiles (id, id_cliente, nome)
  values (
    new.id, 
    (new.raw_user_meta_data ->> 'id_cliente')::integer,
    new.raw_user_meta_data ->> 'nome'
  );
  return new;
end;
$$;

-- Trigger para criar perfil ao registrar usuário
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## 4. Rodando o Projeto

```bash
# Instalar dependências
npm install

# Rodar em modo desenvolvimento
npm run dev
```

## 5. Fluxo de Uso

### Registro de Usuário:
1. Usuário acessa `/login` e clica em "Criar conta"
2. Preenche nome, email, senha e código de convite
3. Frontend chama `POST /auth/register` na API FastAPI
4. Backend valida o código de convite e cria o usuário no Supabase Auth
5. Backend retorna `access_token` (JWT)
6. Frontend salva o token no localStorage e redireciona para `/dashboard`

### Login:
1. Usuário acessa `/login` e preenche email e senha
2. Frontend chama `POST /auth/login` na API FastAPI
3. Backend valida as credenciais no Supabase Auth
4. Backend retorna `access_token` (JWT)
5. Frontend salva o token no localStorage e redireciona para `/dashboard`

### Dashboard:
1. Frontend verifica se há `access_token` salvo
2. Se não houver, redireciona para `/login`
3. Se houver, chama `GET /dashboard` com o token no header `Authorization`
4. Backend valida o token JWT e retorna os dados
5. Frontend exibe os dados do dashboard

### Edição de Perícia:
1. Usuário clica em "Editar" em uma perícia
2. Modal abre com os dados atuais
3. Usuário altera os campos desejados e clica em "Salvar"
4. Frontend chama `PATCH /pericias/{id}` com o token no header
5. Backend valida o token e atualiza os dados
6. Frontend atualiza a lista localmente e fecha o modal

## 6. Autenticação e Segurança

### Token JWT:
- O `access_token` retornado pela API é um JWT assinado pelo backend
- O token é salvo no localStorage do navegador
- Todas as requisições protegidas devem incluir: `Authorization: Bearer <token>`
- O backend valida o token em cada requisição

### Expiração:
- Se o token expirar (401/403), o frontend:
  1. Remove o token do localStorage
  2. Redireciona o usuário para `/login`
  3. Exibe mensagem "Sessão expirada"

### Logout:
- Apenas remove o token do localStorage
- Redireciona para `/login`
- Não há necessidade de chamar endpoint de logout (stateless JWT)

## 7. Troubleshooting

### Erro "Missing API_BASE_URL environment variable"
- Certifique-se de que o arquivo `.env` existe
- Verifique se `VITE_API_BASE_URL` está definido
- Reinicie o servidor de desenvolvimento (`npm run dev`)

### Erro 401/403 ao acessar o dashboard
- Verifique se o token JWT não expirou
- Confirme que o backend está validando o token corretamente
- Verifique se o header `Authorization` está sendo enviado

### Backend não recebe requisições
- Confirme que `VITE_API_BASE_URL` aponta para a URL correta
- Se usar ngrok, verifique se a URL ainda está válida (URLs ngrok expiram)
- Verifique se o backend está rodando e acessível

### Erro de CORS
- O backend FastAPI deve ter CORS configurado para aceitar requisições do frontend
- Adicione a origem do frontend na configuração de CORS do FastAPI
