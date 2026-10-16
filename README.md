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

## Importar o dashboard pronto no Grafana

Se preferir, use o dashboard já montado:
[`TESTE-CARD-1792181310720.json`](TESTE-CARD-1792181310720.json).

### Requisitos

- Grafana 12.x (exportado no 12.4.0)
- Plugin **Zabbix** (`alexanderzobnin-zabbix-datasource`), configurado com uma fonte de dados
- Plugin **Business Text** (`marcusolsson-dynamictext-panel`)

### Como baixar

- Abra o arquivo aqui no GitHub e clique em **Download raw file**, ou
- Pelo terminal:

```bash
curl -LO https://raw.githubusercontent.com/josezipf/exemplos/main/TESTE-CARD-1792181310720.json
```

### Como importar

1. No Grafana, vá em **Dashboards → New → Import**.
2. Clique em **Upload dashboard JSON file** e escolha o arquivo baixado
   (ou cole o conteúdo do JSON na caixa de texto).
3. Em **Zabbix**, selecione a sua fonte de dados do Zabbix.
4. Clique em **Import**.
5. Ajuste as consultas (host/itens) para o seu ambiente.
