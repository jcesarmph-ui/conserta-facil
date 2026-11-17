# Testar a Conserta Fácil no WhatsApp

O primeiro teste usa um número de teste da Meta e o seu celular como destinatário. A Meta recebe as mensagens do WhatsApp e as entrega ao bot em um endereço HTTPS chamado webhook. O bot usa a API da Meta para responder.

## 1. Enviar a primeira mensagem da Meta para o celular

1. Abra o [painel Meta for Developers](https://developers.facebook.com/apps/) e crie um aplicativo com o caso de uso **Conectar com clientes pelo WhatsApp**.
2. Em **Configuração da API**, selecione o número de teste, adicione seu próprio WhatsApp como destinatário e envie a mensagem de teste pelo painel. Confira se ela chegou.
3. Na mesma tela, guarde o token temporário, o **Phone Number ID** do número de teste e a versão da API que aparece no exemplo de envio. Em **Configurações do app → Básico**, obtenha o **segredo do aplicativo**.

## 2. Ligar nosso bot

Crie um arquivo local chamado `.env` na pasta do projeto, com os valores do painel. Para o token de verificação, escolha um valor aleatório seu. Ele deve ser igual no arquivo e no painel da Meta.

```dotenv
META_ACCESS_TOKEN=
META_APP_SECRET=
META_VERIFY_TOKEN=
META_PHONE_NUMBER_ID=
META_GRAPH_VERSION=
PORT=3000
```

No PowerShell, na pasta do projeto, inicie o servidor com `node --env-file=.env whatsapp.mjs`. Se o seu PowerShell ainda não reconhecer `node`, use `& "CAMINHO_DO_NODE_EXE" --env-file=.env whatsapp.mjs`, com o mesmo executável usado para abrir o bot no terminal.

Para um teste no computador, exponha a porta 3000 por um túnel HTTPS temporário. Por exemplo, com o [Cloudflare Quick Tunnel](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/trycloudflare/) instalado, rode `cloudflared tunnel --url http://localhost:3000` em outro terminal e copie o endereço HTTPS gerado. Mantenha as duas janelas abertas durante o teste.

Em **Configuração** do caso de uso do WhatsApp na Meta, informe esse endereço com `/webhook` no final e preencha o mesmo token de verificação. Inscreva o webhook no campo `messages`. Veja o [guia oficial da Meta](https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started/).

## 3. Fazer a conversa de ponta a ponta

No seu celular, mande **Oi** para o número de teste. Escolha **1**, preencha modelo e defeito, confirme e guarde o protocolo. Escolha **2** e informe o protocolo para consultar o mesmo pedido. Digite **menu** em qualquer etapa para voltar ao início.

O fluxo guiado funciona sem a OpenAI. Para habilitar a interpretação de texto livre, adicione `OPENAI_API_KEY` ao arquivo local e reinicie o servidor. Mantenha os tokens no ambiente local ou no gerenciador de segredos da hospedagem.

## Para uso em uma empresa

O teste usa uma instância do bot. As conversas em andamento ficam em memória, os pedidos ficam em arquivo local e a fila humana apenas registra solicitações. Em uma implantação comercial, use hospedagem contínua com HTTPS estável, credenciais adequadas para produção, banco persistente e a agenda e a fila de atendimento da empresa. Troque a referência de mapa pelo endereço da empresa antes de disponibilizar o bot para clientes.
