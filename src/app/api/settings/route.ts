import { existsSync } from 'node:fs';import {resolve} from 'node:path';
export const runtime='nodejs';
export async function GET(){return Response.json({semgrep:existsSync(resolve(process.env.SEMGREP_BIN||'.venv/bin/semgrep')),gitlab:!!process.env.GITLAB_TOKEN,duo:!!(process.env.GITLAB_TOKEN&&process.env.GITLAB_FLOW_CONSUMER_ID&&process.env.GITLAB_PROJECT_ID),gitlabUrl:process.env.GITLAB_URL||'https://gitlab.com',storage:'SQLite · local persistent workspace',accessProtected:!!process.env.ACCESS_TOKEN});}
