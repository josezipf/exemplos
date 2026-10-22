# Aula 01 — Do Ubuntu zerado à stack NOC completa

Um único playbook Ansible instala Docker e sobe **Zabbix 7.0 LTS + PostgreSQL**, **Grafana**, **n8n** e **Ansible Semaphore** num Ubuntu recém-instalado.

## Pré-requisitos

- Ubuntu Server 22.04 ou 24.04 LTS limpo, com usuário sudo
- Recomendado para o lab: 4 vCPU, 8 GB RAM, 40 GB de disco
- Acesso à internet (APT e Docker Hub)
- Portas liberadas: 8080, 3000, 5678, 30000 e 10051

## Arquivos

```
aula-01-stack-noc/
├── hosts.ini                    # inventário local
└── playbooks/
    └── provisiona_noc.yml       # o playbook mãe
```

## Passo a passo

**Tarefa 1 — Bootstrap**

```bash
sudo apt update && sudo apt install -y ansible git
```

**Tarefa 2 — Estrutura e inventário**

```bash
sudo mkdir -p /opt/noto-lab/playbooks
sudo chown -R $USER:$USER /opt/noto-lab
cd /opt/noto-lab
git init
echo -e "[local]\nlocalhost ansible_connection=local" | sudo tee hosts.ini
```

**Tarefa 3 — O playbook**

Copie `playbooks/provisiona_noc.yml` desta pasta para `/opt/noto-lab/playbooks/`.

**Tarefa 4 — Execução**

```bash
cd /opt/noto-lab
sudo ansible-playbook -i hosts.ini playbooks/provisiona_noc.yml
```

Rode uma segunda vez: o resultado deve ser `changed=0` (o playbook é idempotente).

**Tarefa 5 — Validação**

```bash
sudo docker ps    # 7 containers com status "Up"
```

| Serviço | Endereço | Login inicial |
|---|---|---|
| Zabbix | `http://IP:8080` | Admin / zabbix |
| Grafana | `http://IP:3000` | admin / admin (pede troca) |
| n8n | `http://IP:5678` | cria a conta owner no 1º acesso |
| Semaphore | `http://IP:30000` | admin / admin |

## Problemas comuns

| Sintoma | Causa e correção |
|---|---|
| `git init`: Permission denied | Faltou o `chown` da Tarefa 2 |
| Grafana ou n8n reiniciando em loop | Dono errado nas pastas de volume (o playbook já trata: UID 472 e 1000) |
| n8n reclama de cookie seguro | Acesso sem HTTPS: o playbook já define `N8N_SECURE_COOKIE=false` (somente lab) |
| `docker ps`: permission denied | Use `sudo`, ou `sudo usermod -aG docker $USER` e faça login de novo |

> ⚠️ **Lab:** a senha `pg_pass` está em texto no playbook. Em produção, use Ansible Vault e troque as senhas padrão.
