#!/usr/bin/env bash
# Run only after confirming the target project and signing in with gcloud.
set -euo pipefail
: "${1:?Usage: scripts/deploy-cloud-run.sh PROJECT_ID [REGION]}"
task_project="$1"
task_region="${2:-europe-west1}"
task_service=antibody
task_account="antibody-runtime@${task_project}.iam.gserviceaccount.com"
task_image="${task_region}-docker.pkg.dev/${task_project}/antibody/app:$(git rev-parse --short HEAD)"
command -v gcloud >/dev/null
command -v glab >/dev/null
# Never print credentials; glab resolves them from the OS credential store.
glab auth status --hostname gitlab.com >/dev/null 2>&1

gcloud projects describe "$task_project" --format='value(projectId)' >/dev/null
if [ "$(gcloud billing projects describe "$task_project" --format='value(billingEnabled)')" != True ]; then
 printf 'Billing is disabled for %s. Enable billing before deployment.\n' "$task_project" >&2
 exit 1
fi
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com firestore.googleapis.com secretmanager.googleapis.com --project="$task_project"
if ! gcloud artifacts repositories describe antibody --location="$task_region" --project="$task_project" >/dev/null 2>&1; then
 gcloud artifacts repositories create antibody --repository-format=docker --location="$task_region" --project="$task_project"
fi
if ! gcloud firestore databases describe --database=antibody --project="$task_project" >/dev/null 2>&1; then
 gcloud firestore databases create --database=antibody --location="$task_region" --type=firestore-native --project="$task_project"
fi
if ! gcloud iam service-accounts describe "$task_account" --project="$task_project" >/dev/null 2>&1; then
 gcloud iam service-accounts create antibody-runtime --display-name='Antibody runtime' --project="$task_project"
fi
gcloud projects add-iam-policy-binding "$task_project" --member="serviceAccount:${task_account}" --role=roles/datastore.user --condition="expression=resource.name=='projects/${task_project}/databases/antibody',title=antibody-database" --quiet >/dev/null

task_config="${XDG_CONFIG_HOME:-$HOME/.config}/antibody"
mkdir -p "$task_config"
chmod 700 "$task_config"
task_password="${task_config}/${task_project}-workspace-password"
if ! test -f "$task_password"; then
 python3 - "$task_password" <<'PY'
import secrets,sys,os
fd=os.open(sys.argv[1],os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
with os.fdopen(fd,'w') as f:f.write(secrets.token_urlsafe(32))
PY
fi
for task_secret in antibody-access-token antibody-gitlab-token; do
 if ! gcloud secrets describe "$task_secret" --project="$task_project" >/dev/null 2>&1; then
  gcloud secrets create "$task_secret" --replication-policy=automatic --project="$task_project" >/dev/null
 fi
 gcloud secrets add-iam-policy-binding "$task_secret" --member="serviceAccount:${task_account}" --role=roles/secretmanager.secretAccessor --project="$task_project" --quiet >/dev/null
done
gcloud secrets versions add antibody-access-token --data-file="$task_password" --project="$task_project" >/dev/null
printf 'protocol=https\nhost=gitlab.com\n\n' | git credential fill | python3 -c 'import sys; fields=dict(line.rstrip("\n").split("=",1) for line in sys.stdin if "=" in line); token=fields.get("password"); assert token,"GitLab credential missing"; sys.stdout.write(token)' | gcloud secrets versions add antibody-gitlab-token --data-file=- --project="$task_project" >/dev/null

gcloud builds submit --tag="$task_image" --project="$task_project"
gcloud run deploy "$task_service" --image="$task_image" --region="$task_region" --project="$task_project" --service-account="$task_account" --cpu=1 --memory=2Gi --concurrency=1 --max-instances=1 --min-instances=0 --timeout=300 --allow-unauthenticated --set-env-vars="ANTIBODY_STORE=firestore,GOOGLE_CLOUD_PROJECT=${task_project},FIRESTORE_DATABASE_ID=antibody,GITLAB_URL=https://gitlab.com,GITLAB_PROJECT_ID=antibody-group1/Antibody-project" --set-secrets='ACCESS_TOKEN=antibody-access-token:latest,GITLAB_TOKEN=antibody-gitlab-token:latest'
printf 'Workspace username: antibody\nPassword stored privately at: %s\n' "$task_password"
printf 'Duo catalog configuration must be verified separately before synthesis is available.\n'
