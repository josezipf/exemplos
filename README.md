# Card de NOC para Grafana Business Text

Card simples para monitoramento de um link no Grafana usando dados do Zabbix e o painel **Business Text**.

## Métricas esperadas

- Disponibilidade
- Latência
- Perda de pacote
- Tráfego RX
- Tráfego TX

O tráfego recebido em bytes por segundo é convertido para `bps`, `Kbps`, `Mbps`, `Gbps` ou `Tbps`.

## Instalação no Business Text

1. Configure as cinco consultas no painel.
2. Selecione **Render template: All data**.
3. Cole `card.html` em **Content**.
4. Cole `card.css` em **Styles**.
5. Cole `card.js` em **After Content Ready**.
6. No começo de `card.js`, altere `CONFIG.linkName` e os limiares, se necessário.

## Limiares padrão

- Link degradado por latência: `100 ms` ou mais.
- Link degradado por perda: `5%` ou mais.
- Disponibilidade igual ou superior a `1`: online.

## Observação

Os nomes dos campos podem conter ou não acentos. O JavaScript procura automaticamente por `Disponibilidade`, `Latência`, `Perda`, `Tráfego RX` e `Tráfego TX`.
