# Synka demobutiken från laptopen

Demobutiken på `10.80.1.11` är en egen kopia av kassan. `./scripts/deploy-prod-rsync.sh` i affärssystemet uppdaterar den inte. Det scriptet går till MiniPC (`192.168.32.11`) och ThinkCentre (`192.168.32.10`).

| | |
|---|---|
| SSH | `claes@10.80.1.11` |
| Kod | `/home/claes/demo/affarssystem` |
| Tjänst | `demobutik.service` (user), port 8080 |
| Publik adress | https://demo.kassapaplats.se |

Kör kommandona nedan från WSL på laptopen, i katalogen där kassans kod ligger (`~/projects/affarssystem` är källan).

## Nyckel

SSH använder nyckeln `~/.ssh/id_ed25519` (`claes@LAPTOP`). Den är låst med lösenfras. I en terminal som har läst `~/.bashrc` pekar `SSH_AUTH_SOCK` oftast redan på Windows-agenten. Annars:

```bash
export SSH_AUTH_SOCK="$HOME/.ssh/agent.sock"
ssh-add -l
```

`ssh-add -l` ska visa `claes@LAPTOP`. Om inloggningen ändå nekas, lägg tillbaka nyckeln på demoservern (logga in med lösenord via `ssh 10.80.1.11`):

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINtSuM+E+y6xo9fGijjaj3iTlQylT/YksPIlOzHtsnDp claes@LAPTOP' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

## Synka koden

`.env`, `storage` och sqlite-filer (butiksdatabas, demoregister och besökarnas egna butiker) kopieras inte och raderas inte.

```bash
export SSH_AUTH_SOCK="$HOME/.ssh/agent.sock"

rsync -az --delete --info=stats2 \
  -e "ssh -o BatchMode=yes -o IdentitiesOnly=yes -i $HOME/.ssh/id_ed25519" \
  --exclude .env \
  --exclude .deploy-prod.local.env \
  --exclude vendor \
  --exclude node_modules \
  --exclude .git \
  --exclude .cursor \
  --exclude public/hot \
  --exclude public/build \
  --exclude public/storage \
  --exclude storage \
  --exclude bootstrap/cache \
  --exclude vendor-private \
  --exclude '*.sqlite' \
  --exclude '*.sqlite-journal' \
  --exclude '*.sqlite-wal' \
  --exclude '*.sqlite-shm' \
  --exclude docs/skv1509 \
  --exclude '*.docx' \
  --exclude '*:Zone.Identifier' \
  /home/claes/projects/affarssystem/ \
  claes@10.80.1.11:demo/affarssystem/
```

## Bygg, migrera och starta om

På demoservern, i samma körning härifrån:

```bash
ssh -o BatchMode=yes -o IdentitiesOnly=yes -i ~/.ssh/id_ed25519 claes@10.80.1.11 'bash -s' << 'EOS'
set -euo pipefail
cd ~/demo/affarssystem
composer install --no-dev --no-interaction --prefer-dist
npm ci
npm run build
php artisan migrate --force --no-interaction
php artisan optimize:clear
systemctl --user restart demobutik.service
EOS
```

`demo:reset` ingår inte. Det tömmer demobutiken. Nattlig återställning ligger redan i cron på servern.

## Kontroll

```bash
ssh -o BatchMode=yes -o IdentitiesOnly=yes -i ~/.ssh/id_ed25519 claes@10.80.1.11 \
  'systemctl --user is-active demobutik.service cloudflared-demobutik.service'
curl -fsS -o /dev/null -w "%{http_code}\n" https://demo.kassapaplats.se/login
```

Båda tjänsterna ska vara `active`, och adressen ska svara `200`.
