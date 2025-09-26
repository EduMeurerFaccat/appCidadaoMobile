#!/usr/bin/env node
/**
 * Script de preparação para submissão no F-Droid.
 * - Verifica versão e incrementa versionCode se necessário (Expo gera a partir da versão, então aqui só avisamos)
 * - Lista dependências potencialmente problemáticas
 * - Gera checklist no console
 */
const fs = require('fs');
const path = require('path');

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const appJsonPath = path.join(__dirname, '..', 'app.json');
const pkgPath = path.join(__dirname, '..', 'package.json');

const appJson = readJSON(appJsonPath);
const pkg = readJSON(pkgPath);

const suspicious = [
  'firebase', 'crashlytics', 'analytics', 'sentry', 'appcenter', 'facebook', 'ads', 'tracking'
];

const deps = Object.keys(pkg.dependencies || {});
const flagged = deps.filter(d => suspicious.some(s => d.toLowerCase().includes(s)));

console.log('==== PREPARE F-DROID REPORT ====');
console.log('App Name:', appJson.expo.name);
console.log('Version (package.json):', pkg.version);
console.log('Version (app.json):', appJson.expo.version);
console.log('Android package:', appJson.expo.android && appJson.expo.android.package);
console.log('Dependências:', deps.length);
if (flagged.length) {
  console.log('ATENÇÃO: Dependências potencialmente sensíveis encontradas:', flagged);
} else {
  console.log('Nenhuma dependência suspeita listada.');
}
console.log('\nChecklist sugerido:');
console.log('- [ ] Tag criada: v' + pkg.version);
console.log('- [ ] Metadata YAML: metadata/' + (appJson.expo.android.package || 'br.com.appcidadao') + '.yml');
console.log('- [ ] Build local OK: ./gradlew assembleRelease');
console.log('- [ ] Sem libs proprietárias');
console.log('- [ ] LICENSE presente (MIT)');
console.log('- [ ] README com descrição');
console.log('- [ ] Sem binários pré-compilados estranhos');
console.log('- [ ] Verificar se não há expo-updates proprietário (se usar)');
console.log('================================');
