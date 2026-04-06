# Lista de tarefas

Aplicação Next.js com App Router, server actions e Prisma usando PostgreSQL.

## Como rodar

1. Instale as dependências com `npm install`.
2. Crie um arquivo `.env.local` com base em `.env.example`.
3. Defina em `DATABASE_URL` qual banco o seu desenvolvimento local deve usar.
4. Rode `npm run dev`.
5. Acesse `http://localhost:3000` no computador.

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

## Melhorias recentes

- A carga inicial de `/home` agora busca as tarefas no servidor para reduzir a latencia percebida na primeira renderizacao.
- As operacoes principais da lista usam atualizacao otimista no cliente para reduzir a sensacao de atraso com banco remoto.
- O modal de edicao foi reduzido para uma unica instancia compartilhada, diminuindo o custo de abrir e fechar em listas maiores.

## Deploy na Vercel

1. Configure `DATABASE_URL` no projeto da Vercel.
2. Garanta que o banco tenha o schema do Prisma aplicado antes do primeiro tráfego.
3. Escolha a regiao do projeto Vercel o mais proxima possivel da regiao do banco. O host atual do Neon indica `us-east-1`, entao a regiao principal da Vercel deve ficar no mesmo eixo geografico.
4. Rode `npm run db:migrate:deploy` no ambiente alvo quando houver migrations versionadas.
5. O script `postinstall` já executa `prisma generate`, então o Prisma Client é gerado automaticamente no install.

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
