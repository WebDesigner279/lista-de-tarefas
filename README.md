# Lista de tarefas

Aplicação Next.js com App Router, server actions e Prisma usando PostgreSQL local.

## Como rodar

1. Instale as dependências com `npm install`.
2. Garanta que o PostgreSQL local esteja disponível com a base usada em `DATABASE_URL`.
3. Rode `npm run dev`.
4. Acesse `http://localhost:3000` no computador.

## Testes

1. Rode `npm run test` para executar a suíte uma vez.
2. Rode `npm run test:watch` para acompanhar alterações em tempo real.

Os testes atuais cobrem as partes puras da feature de tarefas, com foco em validação e helpers de estado.

O script de desenvolvimento sobe o Next.js com `--hostname 0.0.0.0`, então a aplicação também fica acessível na rede local para testes em outros dispositivos.

## Testar no celular

1. Conecte o celular e o computador na mesma rede Wi-Fi.
2. Descubra o IP local do computador com `ipconfig` no Windows.
3. Abra `http://SEU_IP_LOCAL:3000` no navegador do celular.

Exemplo: `http://192.168.18.111:3000`

## Observações sobre o back-end

- O front-end conversa com o back-end por server actions do próprio Next.js.
- O banco continua local no computador via `DATABASE_URL`, o que é suficiente para teste pelo celular porque as consultas são executadas no servidor Next.js, não no aparelho.
- Não há mais configuração de túnel neste projeto.
