# Simulação de conversa — Conserta Fácil

Conversa gerada por `node simulacao.mjs`. Passa pelo webhook com assinatura HMAC, sem chamar a API da Meta.

```text

Cliente: Oi
Bot:
1. Solicitar orçamento
2. Acompanhar reparo
3. Agendar entrega do aparelho
4. Endereço e horário
5. Falar com a equipe
0. Sair
Digite uma opção ou conte o problema do celular.
Digite menu para voltar ao menu inicial.

Cliente: 1
Bot:
QUAL O MODELO DO SEU CELULAR?
Digite menu para voltar ao menu inicial.

Cliente: Galaxy A54
Bot:
Qual é o tipo de problema?
1. Tela ou toque
2. Bateria ou carregamento
3. Contato com líquido
4. Outro problema
Digite menu para voltar ao menu inicial.

Cliente: 1
Bot:
A tela ainda mostra imagem e responde ao toque?
Digite menu para voltar ao menu inicial.

Cliente: A tela trincou depois que o celular caiu no chão
Bot:
Modelo: Galaxy A54
Tipo de problema: Tela ou toque
Descrição: A tela trincou depois que o celular caiu no chão
A equipe precisa avaliar o aparelho para informar o valor.
Digite 1 para registrar, 2 para corrigir ou 3 para cancelar.
Digite menu para voltar ao menu inicial.

Cliente: 1
Bot:
Pedido registrado para avaliação. Protocolo: 83935319
1. Solicitar orçamento
2. Acompanhar reparo
3. Agendar entrega do aparelho
4. Endereço e horário
5. Falar com a equipe
0. Sair
Digite uma opção ou conte o problema do celular.
Digite menu para voltar ao menu inicial.

Cliente: 2
Bot:
Digite somente o número do protocolo que você recebeu.
Digite menu para voltar ao menu inicial.

Cliente: 83935319
Bot:
Protocolo: 83935319
Status: Aguardando avaliação
Modelo: Galaxy A54
Tipo de problema: Tela ou toque
Descrição: A tela trincou depois que o celular caiu no chão

1. Solicitar orçamento
2. Acompanhar reparo
3. Agendar entrega do aparelho
4. Endereço e horário
5. Falar com a equipe
0. Sair
Digite uma opção ou conte o problema do celular.
Digite menu para voltar ao menu inicial.
```
