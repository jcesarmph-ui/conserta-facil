# Conserta Fácil

Chatbot de atendimento para uma assistência técnica fictícia de celulares. O cliente pode solicitar orçamento, consultar o pedido pelo protocolo, agendar a entrega, consultar informações da loja e solicitar atendimento humano.

## Funcionalidades

| Função | O que o bot faz |
| --- | --- |
| Solicitar orçamento | Registra o modelo e o problema, apresenta um resumo para revisão e gera um protocolo de solicitação para avaliação. |
| Acompanhar reparo | A partir do protocolo, mostra o status, o modelo e a descrição do pedido. |
| Agendar entrega | Reserva um horário com protocolo; o horário confirmado deixa de ser oferecido. |
| Endereço e horário | Mostra a localização no mapa e o horário de atendimento da loja fictícia. |
| Falar com a equipe | Registra um pedido de atendimento humano com o assunto informado. |

Orçamentos, solicitações e reservas são gravados localmente; os registros e as credenciais ficam fora do Git.

## O papel da IA

Com a IA da OpenAI, a mensagem “Meu A54 caiu, a tela acende, mas o toque parou” pode levar direto ao resumo de orçamento. A IA identifica o modelo e o problema no texto. O bot solicita os dados faltantes e registra o orçamento somente após a confirmação. O valor fica para avaliação da assistência.

A conversa guiada funciona localmente. A integração com a IA foi testada com respostas simuladas e ainda precisa ser verificada com a API real.

## Do portfólio ao cliente

O servidor `whatsapp.mjs` recebe mensagens da Cloud API e responde usando os mesmos fluxos do terminal. A integração foi verificada com eventos simulados.

Em uma assistência real, a integração se estende aos registros de reparo, à agenda e à fila de atendimento da equipe. O encaminhamento atual grava a solicitação localmente.
