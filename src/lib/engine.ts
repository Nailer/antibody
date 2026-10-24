import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, writeFile, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { parse } from 'yaml';
import { getAntibody, updateAntibody } from './store';
import type { Finding } from './model';
const execute=promisify(execFile);
export function validateRuleText(rule:string) {
 const parsed=parse(rule, {maxAliasCount:20});
 if(!Array.isArray(parsed?.rules)||parsed.rules.length!==1)throw new Error('Provide exactly one Semgrep rule.');
 const r=parsed.rules[0];
 if(!r.id || !Array.isArray(r.languages) || r.languages.some((l:string)=>l!=='python'))throw new Error('This version supports Python rules only.');
 if(r.fix || r['fix-regex'])throw new Error('Automatic source rewriting is not allowed in a detection pack.');
 if(r.mode && r.mode!=='search')throw new Error('Only search rules are supported.');
 return String(r.id);
}
export async function runSemgrep(rule:string, files:{path:string;content:string}[]):Promise<Finding[]> {
 validateRuleText(rule);
 const root=await mkdtemp(join(tmpdir(),'antibody-'));
 try {
 await writeFile(join(root,'rule.yml'),rule,{mode:0o600});
 const target=join(root,'target'); await mkdir(target);
 for(const file of files){ const dest=resolve(target,file.path); if(!dest.startsWith(target+'/'))throw new Error('Invalid file path'); await mkdir(dirname(dest),{recursive:true});await writeFile(dest,file.content,{mode:0o600}); }
 const binary=resolve(process.env.SEMGREP_BIN || '.venv/bin/semgrep');
 const {stdout}=await execute(binary,['scan','--config',join(root,'rule.yml'),'--json','--metrics=off','--disable-version-check','--no-git-ignore','--timeout','10',target],{timeout:60000,maxBuffer:4*1024*1024,env:{...process.env,SEMGREP_SEND_METRICS:'off'}});
 const data=JSON.parse(stdout);
 if(data.errors?.length)throw new Error('Semgrep could not parse or inspect all supplied files. Check Python syntax and rule validity.');
 return (data.results||[]).map((f:{path:string;start:{line:number};extra:{message:string};check_id:string})=>({path:f.path.replace(target+'/',''),line:f.start.line,message:f.extra.message,ruleId:f.check_id}));
 } finally { await rm(root,{recursive:true,force:true}); }
}
export async function validateAntibody(id:string) {
 const a=getAntibody(id);if(!a)throw new Error('Antibody not found');
 if(a.status==='approved')throw new Error('Approved packs are immutable. Create a new antibody to revise a rule.');
 updateAntibody(id,x=>{x.status='running';x.error=undefined;x.checks=[];x.findings=[];x.events.push({at:new Date().toISOString(),message:'Validation started: bad and fixed fixtures.'});});
 try {
 const bad=await runSemgrep(a.rule,[{path:'bad.py',content:a.badCode}]);
 updateAntibody(id,x=>{x.checks.push({name:'Known failure detected',passed:bad.length>0,detail:`${bad.length} finding(s) in the incident fixture.`});});
 const fixed=await runSemgrep(a.rule,[{path:'fixed.py',content:a.fixedCode}]);
 updateAntibody(id,x=>{x.checks.push({name:'Known fix accepted',passed:fixed.length===0,detail:`${fixed.length} finding(s) in the corrected fixture.`});});
 const findings=a.files.length ? await runSemgrep(a.rule,a.files):[];
 return updateAntibody(id,x=>{x.findings=findings;x.status=x.checks.every(c=>c.passed)?'validated':'failed';x.events.push({at:new Date().toISOString(),message:`Validation ${x.status==='validated'?'passed':'failed'}; scanned ${a.files.length} supplied Python file(s).`});});
 } catch(error) { return updateAntibody(id,x=>{x.status='failed';x.error=error instanceof Error && /ENOENT/.test(error.message)?'Semgrep is not installed. Run the documented setup script.':'Validation could not complete. Check rule syntax, Python fixtures, and Semgrep installation.';x.events.push({at:new Date().toISOString(),message:'Validation stopped with an execution error.'});}); }
}
