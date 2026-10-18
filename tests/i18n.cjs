// Entrada única para QA de localización (sin las capturas, que tienen comando propio).
const {spawnSync}=require('node:child_process'),path=require('node:path');
const scripts=['i18n-core.cjs','i18n-catalogs.cjs','i18n-browser.cjs','i18n-lan.cjs','i18n-saves.cjs'];
for(const file of scripts){const result=spawnSync(process.execPath,[path.join(__dirname,file)],{stdio:'inherit'});if(result.status!==0)process.exitCode=1;}
const audit=spawnSync(process.execPath,[path.join(__dirname,'../tools/i18n-audit.cjs'),'--check'],{stdio:'inherit'});if(audit.status!==0)process.exitCode=1;
