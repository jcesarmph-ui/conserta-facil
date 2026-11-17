# Conserta Fácil

Chatbot de atendimento para uma assistência técnica fictícia de celulares. O cliente pode solicitar orçamento, consultar o pedido pelo protocolo, agendar a entrega, consultar informações da loja e solicitar atendimento humano.

## Executar localmente

É preciso ter Node.js 24 instalado. Na pasta do projeto, execute:

```powershell
node bot.mjs
```

O fluxo guiado usa os recursos do Node.js e roda sem dependências adicionais ou credenciais. Digite `menu` para voltar ao início em qualquer etapa ou `0` para encerrar.

## Roteiro de demonstração

Digite uma resposta por vez.

| Cena | O que digitar | O que mostrar |
| --- | --- | --- |
| Solicitar orçamento | `1`, `Galaxy A54`, `1`, `A tela acende, mas o toque parou após a queda`, `1` | O cliente revisa o resumo e recebe um protocolo de solicitação para avaliação. |
| Acompanhar reparo | `2`, depois o número do protocolo do orçamento salvo | O bot mostra o status, o modelo e a descrição do mesmo pedido. |
| Agendar entrega | `3`, `1`, `1`, `3` | A reserva recebe um protocolo e o horário confirmado some da próxima lista de opções. Digite `menu` para voltar. |
| Ver endereço e horário | `4` | O bot mostra um ponto real no mapa como referência da demonstração e o horário fictício da loja. |
| Falar com a equipe | `5`, `Quero esclarecer uma dúvida sobre garantia`, `1` | O bot registra um pedido de atendimento humano com o assunto informado. |

Orçamentos e solicitações para a equipe ficam no arquivo local `pedidos.jsonl`. Reservas ficam em `agenda-demo/`. Esses arquivos e as credenciais do `.env` ficam fora do Git.

## O papel da IA

Com uma credencial da OpenAI configurada, a mensagem “Meu A54 caiu, a tela acende, mas o toque parou” pode levar direto ao resumo de orçamento. A IA identifica o modelo e o problema no texto. O bot solicita os dados faltantes e registra o orçamento somente após a confirmação. O valor fica para avaliação da assistência.

A conversa guiada funciona localmente. A integração com a IA foi testada com respostas simuladas e ainda precisa ser verificada com a API real.

## Do portfólio ao cliente

O servidor `whatsapp.mjs` recebe mensagens da Cloud API e responde usando os mesmos fluxos do terminal. A integração foi verificada com eventos simulados. Para fazer o primeiro teste ao vivo com um número de teste da Meta, siga o [guia de configuração do WhatsApp](WHATSAPP.md).

Para usar o projeto em uma assistência real, conecte os registros de reparo, a agenda e a fila que a equipe usa para atender. O encaminhamento atual grava a solicitação localmente.
