# Brevo SMTP Setup

Use este passo a passo para habilitar envio real de e-mail no ambiente local e no deploy.

## 1. Criar ou acessar a conta

1. Acesse o painel da Brevo.
2. Crie a conta ou faça login.
3. Valide o e-mail e, de preferencia, configure um dominio proprio para remetente.

## 2. Gerar credenciais SMTP

1. No painel, abra a area de SMTP/API.
2. Gere uma chave SMTP ou copie o usuario e a senha SMTP disponiveis.
3. Guarde os valores com cuidado; a senha nao deve ir para o repositorio.

## 3. Preencher o ambiente local

Crie ou ajuste o arquivo `.env.local` com estes valores:

```env
APP_URL="http://localhost:3000"
SMTP_HOST="smtp-relay.brevo.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_REQUIRE_TLS="true"
SMTP_USER="SEU_LOGIN_SMTP"
SMTP_PASS="SUA_CHAVE_SMTP"
SMTP_FROM_EMAIL="Lista de Tarefas <no-reply@seu-dominio.com>"
SMTP_REPLY_TO_EMAIL="suporte@seu-dominio.com"
SMTP_CONNECTION_TIMEOUT_MS="15000"
SMTP_GREETING_TIMEOUT_MS="10000"
SMTP_SOCKET_TIMEOUT_MS="20000"
SMTP_TLS_SERVERNAME="smtp-relay.brevo.com"
```

## 4. Validar localmente

1. Reinicie o `npm run dev`.
2. Entre na aplicacao.
3. Abra `/configuracoes`.
4. Verifique se o card de SMTP mostra configuracao ativa.
5. Clique em `Enviar e-mail de teste`.
6. Confirme o recebimento do e-mail na caixa da conta logada.

## 5. Replicar no deploy

Na Vercel, configure as mesmas variaveis:

1. `APP_URL`: URL HTTPS publica do projeto.
2. `SMTP_HOST`
3. `SMTP_PORT`
4. `SMTP_SECURE`
5. `SMTP_REQUIRE_TLS`
6. `SMTP_USER`
7. `SMTP_PASS`
8. `SMTP_FROM_EMAIL`
9. `SMTP_REPLY_TO_EMAIL`
10. `SMTP_TLS_SERVERNAME`

## 6. Checklist final

1. Cadastro envia e-mail de validacao real.
2. Login so funciona apos validacao do e-mail.
3. Recuperacao envia e-mail de redefinicao real.
4. O mesmo comportamento funciona em local e producao.
