# Aula 02 — Dominando o Ansible Semaphore

Transformando o Semaphore (instalado na Aula 01) na central de comando da automação: projeto, cofre de chaves, inventários, repositório Git, templates com dry run e agendamento.

> Pré-requisito: ambiente da [Aula 01](../aula-01-stack-noc) rodando.

## Arquivos

```
aula-02-semaphore/
├── inventario-exemplo.ini       # conteúdo do inventário estático
└── playbooks/
    ├── provisiona_noc.yml       # playbook da Aula 01 + 2 ajustes (Tarefa 00)
    └── manutencao.yml           # rotina de manutenção usada no template
```

## Tarefa 00 — Ajuste no compose

O `provisiona_noc.yml` desta pasta traz duas linhas novas no serviço `semaphore`:

```yaml
volumes: ["/opt/noto-lab:/opt/noto-lab:ro"]          # o Semaphore enxerga o repositório
SEMAPHORE_SCHEDULE_TIMEZONE: America/Sao_Paulo       # cron no horário de Brasília (padrão: UTC)
```

Copie para `/opt/noto-lab/playbooks/` e rode de novo:

```bash
cd /opt/noto-lab
sudo ansible-playbook -i hosts.ini playbooks/provisiona_noc.yml
```

## Tarefa 1 — Acesso e projeto

- `http://IP:30000` → admin / admin → troque a senha
- **New Project** → `NOTO-TI-LAB`

## Tarefa 2 — Key Store

Gere a chave no servidor de destino (no lab, o próprio host):

```bash
ssh-keygen -t ed25519 -f ~/.ssh/semaphore -N "" -C semaphore@noc
cat ~/.ssh/semaphore.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/semaphore      # copie inteira para o Key Store
```

| Nome | Tipo | Campos |
|---|---|---|
| `ssh-lab` | SSH Key | seu usuário + chave privada |
| `sudo-lab` | Login with password | seu usuário + senha do sudo |
| `git-none` | None | — |

## Tarefa 3 — Inventário

**New Inventory** → nome `lab-servidores` · User Credentials `ssh-lab` · Sudo Credentials `sudo-lab` · Type `Static`. Conteúdo: veja `inventario-exemplo.ini`.

> Use o **IP do host**, nunca `localhost`: dentro do container do Semaphore, `localhost` é o próprio container.

## Tarefa 4 — Repositório Git

Copie `playbooks/manutencao.yml` para `/opt/noto-lab/playbooks/` e faça o commit:

```bash
cd /opt/noto-lab
git config --global user.name "Seu Nome"
git config --global user.email "voce@exemplo.com"
git add . && git commit -m "rotina de manutenção"
git branch --show-current     # anote: master ou main
```

**New Repository** → nome `noto-lab` · URL `file:///opt/noto-lab` · Branch: a que o git mostrou · Access Key `git-none`.

> Com `file://` o Semaphore clona e atualiza pelo Git: **só roda o que está commitado**.

## Tarefa 5 — Template e dry run

1. **Variable Groups** → nome `lab-vars`, extra variables `{}` (obrigatório, mesmo vazio)
2. **New Template** → nome `Manutenção diária` · Playbook `playbooks/manutencao.yml` · Inventory `lab-servidores` · Repository `noto-lab` · Variable Group `lab-vars`
3. **Run** com **Dry Run** e **Diff** marcados → revise o log → **Run** real

## Tarefa 6 — Agendamento

**Schedule** → **New Schedule** → template `Manutenção diária` · cron `0 2 * * *` (todo dia às 02:00).

## Problemas comuns

| Sintoma | Causa e correção |
|---|---|
| Repositório não encontrado | Volume `/opt/noto-lab` não montado → Tarefa 00 |
| Editei o playbook e nada mudou | Faltou o commit |
| Erro de branch no clone | `git init` criou `master`, não `main` |
| Template não salva | Falta o Variable Group |
| SSH falha no host do lab | Usou `localhost` em vez do IP |
| Cron roda 3 horas antes | Faltou `SEMAPHORE_SCHEDULE_TIMEZONE` |
