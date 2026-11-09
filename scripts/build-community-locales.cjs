/* Extract PO copy and merge the approved supplemental Community UI translations. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const acorn=require('acorn');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const source='from-po/goi-community-giao-dev/04-MAN-HINH-PROTOTYPE';
const translations={vi:{}},patterns=[],seen=new Set(),sources=[];
let languages;
function literal(node){
  if(!node)return undefined;
  if(node.type==='Literal')return node.value;
  if(node.type==='TemplateLiteral'&&!node.expressions.length)return node.quasis[0].value.cooked;
  if(node.type==='ArrayExpression')return node.elements.map(literal);
  if(node.type==='ObjectExpression')return Object.fromEntries(node.properties.filter(p=>p.type==='Property'&&!p.computed).map(p=>[p.key.name??p.key.value,literal(p.value)]));
}
const unadorn=value=>value.replace(/^[\p{Extended_Pictographic}\uFE0F\u200D＋+✦✧✓←→⌄\s]+/u,'').trim();
function pair(vi,en){if(typeof vi==='string'&&typeof en==='string'&&vi.trim()&&en.trim()&&vi!==en){translations.vi[en.trim()]=vi.trim();if(unadorn(vi)&&unadorn(en))translations.vi[unadorn(en)]=unadorn(vi);}}
function paired(vi,en){
  if(typeof vi==='string'&&typeof en==='string')pair(vi,en);
  else if(vi&&en&&typeof vi==='object'&&typeof en==='object')for(const key of Object.keys(en))paired(vi[key],en[key]);
}
function template(node,code){
  if(node?.type==='Literal'&&typeof node.value==='string')return {text:node.value,expressions:[]};
  if(node?.type!=='TemplateLiteral')return null;
  return {text:node.quasis.map((part,i)=>part.value.cooked+(i<node.expressions.length?'{{'+i+'}}':'')).join(''),expressions:node.expressions.map(e=>code.slice(e.start,e.end))};
}
function collect(code){
  let tree;try{tree=acorn.parse(code,{ecmaVersion:'latest',sourceType:'script',allowReturnOutsideFunction:true});}catch{return;}
  function walk(node){
    if(!node||typeof node!=='object')return;
    if(node.type==='VariableDeclarator'&&node.id.name==='NX_TRANSLATIONS')Object.assign(translations,literal(node.init));
    if(node.type==='VariableDeclarator'&&node.id.name==='nxLanguages')languages=literal(node.init);
    if(node.type==='ObjectExpression'){
      const data=literal(node);
      if(data?.vi!==undefined&&data?.en!==undefined)paired(data.vi,data.en);
    }
    if(node.type==='CallExpression'||node.type==='ArrayExpression'){
      const values=node.type==='CallExpression'?node.arguments:node.elements;
      for(let i=0;i<values.length-1;i++){
        const a=literal(values[i]),b=literal(values[i+1]);
        if(node.type==='ArrayExpression'&&values.length===3&&/^[a-z]{2}(?:-[A-Za-z]+)?$/.test(literal(values[0])||'')&&/^[A-Z]{2}$/.test(literal(values[1])||''))continue;
        if(typeof a==='string'&&typeof b==='string'){
          if(/[\u00c0-\u1ef9]/.test(a)&&!/[\u00c0-\u1ef9]/.test(b))pair(a,b);
          else if(!/[\u00c0-\u1ef9]/.test(a)&&/[\u00c0-\u1ef9]/.test(b))pair(b,a);
        }
      }
    }
    if(node.type==='CallExpression'&&['tx','t','F','T','notice','toast'].includes(node.callee.name)&&node.arguments.length>=2){
      const a=template(node.arguments[0],code),b=template(node.arguments[1],code);
      if(a&&b){
        if(!a.expressions.length&&!b.expressions.length){if(!/[\u00c0-\u1ef9]/.test(a.text)&&/[\u00c0-\u1ef9]/.test(b.text))pair(b.text,a.text);else pair(a.text,b.text);}
        else if(b.expressions.length&&a.expressions.every(e=>b.expressions.includes(e))&&b.text.replace(/\{\{\d+\}\}/g,'').trim().length>=4){
          const vi=a.text.replace(/\{\{(\d+)\}\}/g,(_,i)=>'{{'+b.expressions.indexOf(a.expressions[Number(i)])+'}}');
          patterns.push({en:b.text,vi});
        }
      }
    }
    for(const value of Object.values(node))if(Array.isArray(value))value.forEach(walk);else if(value&&typeof value==='object'&&value.type)walk(value);
  }
  walk(tree);
}
function html(text,name){
  const hash=crypto.createHash('sha256').update(text).digest('hex');if(seen.has(hash))return;seen.add(hash);sources.push({file:name,sha256:hash});
  for(const match of text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
    const [,attrs,code]=match;
    if(/id=["']module-/.test(attrs)){try{const decoded=Buffer.from(code.trim(),'base64').toString('utf8');if(decoded.includes('<html'))html(decoded,name+'#'+attrs.match(/id=["']([^"']+)/)?.[1]);}catch{}}
    else if(!/\bsrc=/.test(attrs)&&(!/\btype=/.test(attrs)||/javascript|module["']/.test(attrs)))collect(code);
  }
}
for(const file of ['shell-community.html','jobs.html','realestate.html','food.html'])html(fs.readFileSync(path.join(root,source,file),'utf8'),source+'/'+file);
const related='from-po/goi-community-giao-dev/06-GOI-LIEN-QUAN';
for(const file of fs.readdirSync(path.join(root,related)).filter(name=>name.endsWith('.zip'))){
  const archive=path.join(root,related,file),entries=execFileSync('unzip',['-Z1',archive],{encoding:'utf8'}).trim().split('\n');
  for(const entry of entries.filter(name=>name.endsWith('.html')))html(execFileSync('unzip',['-p',archive,entry],{encoding:'utf8',maxBuffer:8000000}),related+'/'+file+'#'+entry);
}
const navRoot='from-po/goi-community-giao-dev/03-MA-NGUON/nexora-community/frontend/src/shared/i18n';
paired(JSON.parse(fs.readFileSync(path.join(root,navRoot,'nav.vi.json'))),JSON.parse(fs.readFileSync(path.join(root,navRoot,'nav.en.json'))));
if(translations.vi.Create)translations.vi['Create content']=translations.vi.Create;
// Reuse the existing bilingual UI copy for later Community controls, without replacing PO terms.
const existing=fs.readFileSync(path.join(root,'html/v3.1/community/nexora-community-i18n.js'),'utf8');
for(const [name,reverse]of [['communityPairs',false],['connectPairs',true]]){
  const block=existing.match(new RegExp('const '+name+'\\s*=\\s*`([\\s\\S]*?)`\\.trim'))?.[1]||'';
  for(const line of block.split('\n')){const parts=line.split('\t');if(parts.length!==2)continue;const [en,vi]=reverse?parts:[parts[1],parts[0]];if(!Object.hasOwn(translations.vi,en))translations.vi[en]=vi;}
}
const extra=JSON.parse(fs.readFileSync(path.join(root,'html/v3.1/community/community-language-extra.json'),'utf8'));
for(const [en,...values]of extra.copy)extra.locales.forEach((locale,index)=>{if(!Object.hasOwn(translations[locale],en))translations[locale][en]=values[index];});
if(languages?.length!==7)throw Error('The PO language list is missing.');
const data={languages,translations,patterns:Array.from(new Map(patterns.map(row=>[row.en, row])).values()),sources};
const output=path.join(root,'html/v3.1/community/community-locales.js');
fs.writeFileSync(output,'/* PO copy plus approved UI supplements. Regenerate with scripts/build-community-locales.cjs. */\nwindow.NEXORA_COMMUNITY_LOCALES='+JSON.stringify(data)+';\n');
console.log('PO languages:',languages.map(row=>row[0]).join(', '));
console.log('PO translation entries:',Object.fromEntries(Object.entries(translations).map(([lang,rows])=>[lang,Object.keys(rows).length])));
