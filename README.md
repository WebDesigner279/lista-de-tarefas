# Lista de tarefas

Aplicação Next.js com App Router, server actions e Prisma usando PostgreSQL.

## Como rodar

1. Instale as dependências com `npm install`.
2. Crie um arquivo `.env.local` com base em `.env.example`.
3. Defina em `DATABASE_URL` qual banco o seu desenvolvimento local deve usar.
4. Configure `APP_URL` e as variaveis `SMTP_*`. O fluxo de cadastro, validacao e recuperacao depende de envio real de e-mail em qualquer ambiente.
5. Rode `npm run dev`.
6. Acesse `http://localhost:3000` no computador.

Não é necessário alternar manualmente entre ambiente local e produção. O ambiente local lê `.env.local`, enquanto a Vercel usa as variáveis configuradas no painel do projeto.

## Ambientes

- `.env.example`: modelo sem segredos para mostrar o formato esperado das variáveis.
- `.env.local`: arquivo real da sua máquina para desenvolvimento local.
- Vercel: usa as Environment Variables configuradas no dashboard, sem depender do arquivo local.

### Desenvolvimento local com banco local

Use uma `DATABASE_URL` local em `.env.local`.

### Desenvolvimento local com banco cloud

Se quiser desenvolver localmente usando Neon ou outro banco remoto, basta colocar a URL remota em `.env.local`.

### Produção na Vercel

Configure a `DATABASE_URL` no painel da Vercel. Isso não exige mudar o `.env.local` da sua máquina.

## Testes

1. Rode `npm run test` para executar a suíte uma vez.
2. Rode `npm run test:watch` para acompanhar alterações em tempo real.
3. Rode `npm run lint` para validar o código.

Os testes atuais cobrem as partes puras da feature de tarefas, com foco em validação e helpers de estado.

O script de desenvolvimento sobe o Next.js com `--hostname 0.0.0.0`, então a aplicação também fica acessível na rede local para testes em outros dispositivos.

## Testar no celular

1. Conecte o celular e o computador na mesma rede Wi-Fi.
2. Descubra o IP local do computador com `ipconfig` no Windows.
3. Abra `http://SEU_IP_LOCAL:3000` no navegador do celular.

Exemplo: `http://192.168.18.111:3000`

## Observações sobre o back-end

- O front-end conversa com o back-end por server actions do próprio Next.js.
- Em desenvolvimento, o banco usado depende do valor de `DATABASE_URL` em `.env.local`.
- Em produção na Vercel, `DATABASE_URL` deve apontar para um PostgreSQL acessível pela internet.
- A sincronização da lista usa polling no cliente, evitando dependência de estado em memória do servidor.
- A autenticacao usa sessoes em cookie httpOnly com persistencia no banco.
- A confirmacao de e-mail e a recuperacao de acesso dependem de SMTP configurado tanto localmente quanto em producao.

## Fluxo de autenticacao

Rotas publicas:

- `/login`
- `/cadastro`
- `/recuperar-acesso`
- `/redefinir-acesso`
- `/validar-acesso`

Rotas protegidas:

- `/dashboard`
- `/home`
- `/perfil`
- `/configuracoes`

No primeiro acesso, se ainda nao existir nenhum usuario no banco, a raiz redireciona automaticamente para cadastro. O login so e liberado apos confirmacao do e-mail.

Arquitetura atual de autenticacao:

- Sessao propria com cookie httpOnly e persistencia no banco.
- Isolamento multiusuario nas operacoes de tarefas por `userId`.
- Tokens de verificacao e redefinicao armazenados apenas por hash.
- Rotas protegidas reforcadas tanto no proxy quanto no servidor.
- Dashboard, perfil e configuracoes separados para facilitar manutencao e evolucao do produto.

## SMTP obrigatorio

As variaveis `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` e `SMTP_FROM_EMAIL` precisam estar configuradas em `.env.local` e tambem no deploy. Sem isso, o cadastro com validacao e a recuperacao de acesso falham de forma explicita.

Configuracao recomendada para producao:

1. Use um provedor transacional, preferencialmente Brevo SMTP ou Resend SMTP.
2. Use um remetente com dominio proprio, por exemplo `no-reply@seu-dominio.com`.
3. Mantenha o mesmo conjunto de variaveis em `.env.local` e na Vercel para evitar divergencia de comportamento.
4. Em producao, defina `APP_URL` com HTTPS.
5. Mantenha `SMTP_REQUIRE_TLS=true` e, quando o provedor pedir, defina `SMTP_TLS_SERVERNAME`.

Fluxo recomendado para validar localmente:

1. Preencha as variaveis `SMTP_*` em `.env.local` com um provedor real.
2. Rode `npm run dev`.
3. Entre com o usuario demo ou com sua conta.
4. Abra `/configuracoes`.
5. Use o botao de teste SMTP para enviar um e-mail real para a conta logada.

Provedores que funcionam bem para validar local e producao:

1. Mailtrap SMTP: bom para ambiente de teste sem entregar para caixas reais externas.
2. Brevo SMTP: simples para entrega real com boa aderencia a projetos pequenos.
3. Resend SMTP: bom quando voce quer migrar depois para API dedicada sem trocar fornecedor.
4. Gmail SMTP: funciona para testes, mas costuma ser a opcao menos robusta para producao.

### Exemplo pronto para Brevo SMTP

Use estes valores como base em `.env.local` e depois replique no deploy:

```env
APP_URL="http://localhost:3000"
SMTP_HOST="smtp-relay.brevo.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_REQUIRE_TLS="true"
SMTP_USER="seu-login-smtp"
SMTP_PASS="sua-chave-smtp"
SMTP_FROM_EMAIL="Lista de Tarefas <no-reply@seu-dominio.com>"
SMTP_REPLY_TO_EMAIL="suporte@seu-dominio.com"
SMTP_CONNECTION_TIMEOUT_MS="15000"
SMTP_GREETING_TIMEOUT_MS="10000"
SMTP_SOCKET_TIMEOUT_MS="20000"
SMTP_TLS_SERVERNAME="smtp-relay.brevo.com"
```

Na Vercel, troque apenas `APP_URL` para a URL HTTPS real do projeto.

## Seed de usuario demo

1. Configure `DATABASE_URL` em `.env.local`.
2. Opcionalmente ajuste `DEMO_USER_NAME`, `DEMO_USER_EMAIL` e `DEMO_USER_PASSWORD`.
3. Rode `npm run db:seed`.

O seed cria ou atualiza um usuario demo ja com e-mail verificado e adiciona algumas tarefas iniciais para acelerar testes locais.

## Melhorias recentes

- A carga inicial de `/home` agora busca as tarefas no servidor para reduzir a latencia percebida na primeira renderizacao.
- As operacoes principais da lista usam atualizacao otimista no cliente para reduzir a sensacao de atraso com banco remoto.
- O modal de edicao foi reduzido para uma unica instancia compartilhada, diminuindo o custo de abrir e fechar em listas maiores.
- O projeto agora suporta cadastro, login, validacao de e-mail, recuperacao de senha e area autenticada por usuario.
- Os e-mails transacionais usam template visual unico e SMTP real, com comportamento consistente entre local e producao.

## Deploy na Vercel

1. Configure `DATABASE_URL` no projeto da Vercel.
2. Garanta que o banco tenha o schema do Prisma aplicado antes do primeiro tráfego.
3. Escolha a regiao do projeto Vercel o mais proxima possivel da regiao do banco. O host atual do Neon indica `us-east-1`, entao a regiao principal da Vercel deve ficar no mesmo eixo geografico.
4. Rode `npm run db:migrate:deploy` no ambiente alvo quando houver migrations versionadas.
5. O script `postinstall` já executa `prisma generate`, então o Prisma Client é gerado automaticamente no install.

### Checklist antes do commit e push

1. Rode `npm run lint`.
2. Rode `npm run test`.
3. Rode `npm run build`.
4. Confirme que `.env.local` nao foi incluido no commit.
5. Confirme que as migrations novas em `prisma/migrations` estao versionadas junto com qualquer alteracao de schema.
6. Confirme na Vercel se `DATABASE_URL`, `APP_URL` e todas as variaveis `SMTP_*` estao configuradas.

### Compatibilidade atual com deploy automatico

- O projeto gera build de producao normalmente com `next build`.
- O uso de Prisma depende de migrations versionadas, o que ja foi preparado neste repositorio.
- O fluxo de e-mail depende de `APP_URL` com HTTPS em producao.
- O deploy automatico da Vercel pode atualizar a aplicacao apos push, desde que as variaveis de ambiente e o banco estejam alinhados.

### Seguranca e manutencao

- Cookies de sessao usam `httpOnly`, `sameSite=lax` e `secure` em producao.
- As tarefas ficam segregadas por usuario no repositorio e no service layer.
- Tokens sensiveis de verificacao e redefinicao nao sao persistidos em texto puro.
- O codigo esta separado em camadas simples: `actions`, `lib`, `features`, `components` e `app`, o que facilita manutencao por dev humano.
- Se alguma credencial foi exposta fora do ambiente seguro, rotacione `DATABASE_URL`, `SMTP_PASS` e segredos relacionados antes de consolidar o deploy.

### Riscos residuais nao bloqueantes

- Ainda nao existe rate limiting para login, reenvio de validacao e recuperacao de senha; isso e recomendavel antes de ampliar o uso publico.
- A observabilidade ainda depende principalmente de logs do servidor e da Vercel; se o projeto crescer, vale adicionar monitoramento de erros e eventos de auth.

## Banco de dados e migrations

- O schema atual está em `prisma/schema.prisma`.
- Para um banco novo, mantenha migrations versionadas em `prisma/migrations`.
- Se o banco atual foi criado manualmente, faça um baseline das migrations antes de depender de `prisma migrate deploy` em produção.

## Fluxo recomendado com Neon

### Alteracoes normais de codigo

1. Mantenha a `DATABASE_URL` de `.env.local` apontando para o Neon.
2. Rode `npm run dev`.
3. Teste normalmente a aplicacao.

### Alteracoes de schema Prisma

1. Edite `prisma/schema.prisma`.
2. Gere a migration localmente com `npx prisma migrate dev --name nome-da-mudanca`.
3. Revise os arquivos criados em `prisma/migrations`.
4. Rode `npm run test` e `npm run build`.
5. Commit as mudancas de schema e migration.
6. Aplique no banco remoto com `npm run db:migrate:deploy` quando quiser atualizar o banco usado pelo projeto.

### O que evitar

- Evite usar `npx prisma db push` como fluxo padrao deste projeto.
- Evite comandos destrutivos como reset no banco remoto.
- Evite alterar o banco remoto manualmente sem registrar migration no repositorio.
