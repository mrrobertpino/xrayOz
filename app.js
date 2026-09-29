'use strict';
const $ = id => document.getElementById(id);
const escapeHTML = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dog = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="520" height="300" viewBox="0 0 520 300"><rect width="520" height="300" rx="16" fill="#e5eddb"/><circle cx="260" cy="149" r="112" fill="#d0ddc1"/><ellipse cx="260" cy="258" rx="133" ry="13" fill="#bacaaa"/><path d="M191 89 Q139 39 144 145 Q149 204 195 170M327 89 Q379 39 374 145 Q369 204 323 170" fill="#79513b"/><ellipse cx="260" cy="151" rx="80" ry="94" fill="#bf946b"/><path d="M248 61 Q227 134 237 174 L282 174 Q286 133 271 61" fill="#f7e9d3"/><ellipse cx="260" cy="185" rx="54" ry="40" fill="#f7e9d3"/><circle cx="226" cy="138" r="9" fill="#302c28"/><circle cx="295" cy="138" r="9" fill="#302c28"/><circle cx="228" cy="135" r="3" fill="white"/><circle cx="297" cy="135" r="3" fill="white"/><path d="M245 172 Q260 164 275 172 Q276 187 260 193 Q243 186 245 172" fill="#302c28"/><path d="M250 205 Q260 230 272 204" fill="#d67e7b"/><path d="M193 221 Q260 249 327 221 L324 237 Q261 265 196 238" fill="#657d52"/><circle cx="260" cy="249" r="12" fill="#e5be70"/></svg>`);
const basicBody = `<h1 id="heading">Meatball is a good boy.</h1>
<p>A small website for a <b>very good dog.</b></p>
<img src="${dog}" alt="An illustration of Meatball, a floppy-eared brown dog" width="300">
<h2>Meet Meatball</h2>
<p>He is <i>always curious</i> and loves <u>making new friends.</u></p>
<h2>His favorite things</h2>
<ul>
  <li>Long walks in the park</li>
  <li>Snacks (and more snacks)</li>
  <li>Being called a good boy</li>
</ul>
<p>Learn about <a href="https://en.wikipedia.org/wiki/Dog">dogs</a>.</p>`;
const sampleCSS = `body {
  font-family: system-ui, sans-serif;
  color: #304333;
  background: #fafbf5;
  padding: 24px;
  margin: 0;
}
h1 { font-size: 30px; line-height: 1.15; color: #42643b; }
h2 { font-size: 18px; margin-top: 24px; }
p, li { font-size: 14px; line-height: 1.7; }
img { width: 100%; max-width: 520px; height: auto; border-radius: 12px; }
b { color: #8b542f; }
button { background: #dbe9d1; color: #304333; border: 1px solid #aabf9c; padding: 10px; margin: 4px; border-radius: 6px; cursor: pointer; }
a { color: #527945; }`;
const sampleJS = `const heading = document.getElementById('heading');
const textButton = document.getElementById('change-text');
const colorButton = document.getElementById('change-color');
const counterButton = document.getElementById('counter');
let clicks = 0;

textButton.addEventListener('click', function changeText() {
  heading.textContent = 'Meatball is the BEST boy!';
});

colorButton.addEventListener('click', function changeColor() {
  heading.style.color = '#b65339';
});

counterButton.addEventListener('click', function countClick() {
  clicks += 1;
  counterButton.textContent = 'Give a treat · ' + clicks;
});`;
function sample(which) { return `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>Meatball’s fan page</title>\n${which === 'interactive' ? `<style>\n${sampleCSS}\n</style>\n` : ''}</head>\n<body>\n${basicBody}\n${which === 'interactive' ? `<h2>Make something happen</h2>\n<button id="change-text">Say something nice</button>\n<button id="change-color">Change his color</button>\n<button id="counter">Give a treat · 0</button>\n<script>\n${sampleJS}\n</script>\n` : ''}</body>\n</html>`; }
let current = { source:'', elements:[], scripts:[], rules:[], token:'', uploaded:false };
const voidTags = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
// Scan source offsets without reformatting the student's document. The browser still
// repairs malformed markup for rendering; source offsets refer to the original file.
function indexHTML(source) {
  const elements = [], stack = []; let match;
  const tags = /<!--[\s\S]*?(?:-->|$)|<![^>]*>|<\/?([a-zA-Z][\w:-]*)\b(?:"[^"]*"|'[^']*'|[^'">])*>/g;
  while ((match = tags.exec(source))) {
    if (!match[1]) continue;
    const tag = match[1].toLowerCase(), closing = match[0].startsWith('</');
    if (closing) {
      const i = stack.map(e => e.tag).lastIndexOf(tag);
      if (i >= 0) { stack.slice(i).forEach(e => e.end = tags.lastIndex); stack.length = i; }
      continue;
    }
    const e = { id:String(elements.length), tag, start:match.index, openEnd:tags.lastIndex, end:tags.lastIndex };
    elements.push(e);
    if (voidTags.has(tag)) continue;
    if (['script','style','textarea','title'].includes(tag)) {
      const end = new RegExp('</' + tag + '\\s*>', 'ig'); end.lastIndex = tags.lastIndex;
      const found = end.exec(source); e.contentStart = e.openEnd; e.contentEnd = found ? found.index : source.length;
      e.end = found ? end.lastIndex : source.length; tags.lastIndex = e.end;
    } else stack.push(e);
  }
  stack.forEach(e => e.end = source.length);
  return elements;
}
function syntax(source, html = false) {
  const pattern = html ? /<!--[\s\S]*?-->|<[^>]*>/g : /(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|\b(?:const|let|var|function|return|if|else|new|document)\b/g;
  let result = '', last = 0;
  for (const m of source.matchAll(pattern)) { result += escapeHTML(source.slice(last,m.index)) + `<span class="${html ? 'token' : /^["'`]/.test(m[0]) ? 'syntax-string' : 'syntax-keyword'}">${escapeHTML(m[0])}</span>`; last = m.index + m[0].length; }
  return result + escapeHTML(source.slice(last));
}
function cssSyntax(source){let result='',last=0;for(const m of source.matchAll(/([\w-]+)(\s*:\s*)([^;{}\n]+)/g)){result+=escapeHTML(source.slice(last,m.index))+`<span class="css-property">${escapeHTML(m[1])}</span>${escapeHTML(m[2])}<span class="syntax-string">${escapeHTML(m[3])}</span>`;last=m.index+m[0].length;}return result+escapeHTML(source.slice(last));}
function displayHTML() {
  // Each source segment belongs to the deepest source element containing it.
  const boundaries = new Set([0,current.source.length]);
  current.elements.forEach(e => { boundaries.add(e.start); boundaries.add(e.openEnd); boundaries.add(e.end); });
  const points = [...boundaries].sort((a,b) => a-b); let result = '', nextElement=0, active=[];
  for (let i=0; i<points.length-1; i++) {
    const start = points[i], end = points[i+1];
    active=active.filter(e=>e.end>start);
    while(nextElement<current.elements.length&&current.elements[nextElement].start<=start)active.push(current.elements[nextElement++]);
    const owner = active.findLast(e=>e.end>=end);
    const text = current.source.slice(start,end);
    result += text.split('\n').map(part => part ? `<span class="source-element" ${owner ? `data-id="${owner.id}" data-start="${start}" data-end="${end}" role="button" tabindex="0"` : ''}>${syntax(part,true)}</span>` : '').join('\n');
  }
  $('html').innerHTML = result.split('\n').map(line => `<span class="source-line">${line || ' '}</span>`).join('');
}
function displayJS() {
  const text = current.scripts.map(s => s.text).join('\n\n');
  $('js').innerHTML = text ? text.split('\n').map((line,i) => `<span class="source-line" data-line="${i}">${syntax(line)}</span>`).join('') : '<div class="empty"><strong>No JavaScript here. Yet.</strong>This page is made of HTML' + (current.elements.some(e=>e.tag==='style') ? ' and CSS' : '') + '. Try example B to see buttons bring it to life.</div>';
}
function send(type, extra={}) { $('preview').contentWindow.postMessage({xray:current.token,type,...extra},'*'); }
function load(source, name, uploaded=false, assets={}) {
  current = {source,elements:indexHTML(source),scripts:[],rules:[],token:crypto.randomUUID(),uploaded,assets};
  current.elements.filter(e => e.tag==='script').forEach(e => {
    if (e.contentStart !== undefined) current.scripts.push({text:source.slice(e.contentStart,e.contentEnd),id:e.id});
  });
  if(assets.js)current.scripts.push({text:assets.js.text,id:null});
  $('filename').textContent = name; displayHTML(); displayJS(); reset();
  $('css').innerHTML = '<div class="empty">Reading styles…</div>';
  let instrumented = source;
  for (const e of [...current.elements].reverse()) {
    const position = source[e.openEnd-2]==='/' ? e.openEnd-2 : e.openEnd-1;
    instrumented = instrumented.slice(0,position) + ` data-xray-id="${e.id}"` + instrumented.slice(position);
  }
  const doc = new DOMParser().parseFromString(instrumented,'text/html');
  // No network fetches: students' local files and embedded data stay local.
  doc.querySelectorAll('base,meta[http-equiv],iframe,frame,object,embed,link').forEach(e=>e.remove());
  const run = $('scripts').checked;
  doc.querySelectorAll('script').forEach(e=>{if (!run || e.src) e.remove();});
  doc.querySelectorAll('*').forEach(e=>{
    for(const attr of [...e.attributes]) {
      if ((!run && /^on/i.test(attr.name)) || ['srcdoc','ping','autofocus'].includes(attr.name)) e.removeAttribute(attr.name);
    }
  });
  if(assets.css){const style=doc.createElement('style');style.textContent=assets.css.text.replace(/<\/style/gi,'<\\/style');doc.head.append(style);}
  if(assets.js&&run){const script=doc.createElement('script');script.textContent=assets.js.text.replace(/<\/script/gi,'<\\/script');doc.body.append(script);}
  const policy = doc.createElement('meta'); policy.httpEquiv='Content-Security-Policy';
  policy.content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; media-src data: blob:; font-src data:; connect-src 'none'; frame-src 'none'; object-src 'none'; form-action 'none'; base-uri 'none'";
  const bridge = doc.createElement('script'); bridge.textContent = '(' + previewBridge.toString() + ')(' + JSON.stringify(current.token) + ');';
  doc.head.prepend(bridge); doc.head.prepend(policy);
  $('preview').srcdoc='<!doctype html>\n'+doc.documentElement.outerHTML;
  $('status').textContent = uploaded ? 'Opened locally. Remote images, linked stylesheets, and external scripts are blocked. Embed assets in the HTML to include them.' : 'Sample loaded. Links stay inside the investigation; choose example B to explore JavaScript.';
}
// This function is serialized into an opaque-origin sandbox. It has no access to
// the parent application's document, storage, or source file.
function previewBridge(token) {
  const post = (type,data={})=>parent.postMessage({xray:token,type,...data},'*');
  const listeners = new WeakMap(); const nativeAdd = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type,handler,options) {
    if (this instanceof Element && typeof handler==='function') { const entries=listeners.get(this)||[]; entries.push({type,source:Function.prototype.toString.call(handler)}); listeners.set(this,entries); }
    return nativeAdd.call(this,type,handler,options);
  };
  let rules=[],selected=[],overlay,observer;
  const id = e => e && e.getAttribute('data-xray-id');
  const get = key=>[...document.querySelectorAll('[data-xray-id]')].find(e=>id(e)===key);
  function collect(list, context='',active=true) {
    for (const rule of list) {
      if (rule.selectorText && rule.style) rules.push({index:rules.length,selector:rule.selectorText,text:rule.cssText,context,active,properties:[...rule.style].map(p=>({name:p,value:rule.style.getPropertyValue(p),priority:rule.style.getPropertyPriority(p)}))});
      else if (rule.cssRules) {
        let enabled=active;
        if (rule instanceof CSSMediaRule) enabled=enabled&&matchMedia(rule.conditionText).matches;
        if (typeof CSSSupportsRule!=='undefined' && rule instanceof CSSSupportsRule) enabled=enabled&&CSS.supports(rule.conditionText);
        collect(rule.cssRules,context+' '+rule.cssText.split('{')[0],enabled);
      }
    }
  }
  function scan() { rules=[]; for (const sheet of document.styleSheets) { if(sheet.ownerNode===overlay)continue;try{const media=sheet.media.mediaText;collect(sheet.cssRules,media?'@media '+media:'',!sheet.disabled&&(!media||matchMedia(media).matches));}catch{}} post('rules',{rules}); }
  function matches(e,s) {try{return e.matches(s);}catch{return false;}}
  function draw() {
    if(!overlay)return;
    overlay.replaceChildren();
    for(const e of selected) {
      if(!e.isConnected)continue;
      for(const rect of e.getClientRects()) {const box=document.createElement('div');box.style.cssText=`position:fixed;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;border:2px solid #75ae58;background:#99d87518;border-radius:3px;box-sizing:border-box;pointer-events:none`;overlay.append(box);}
    }
  }
  function paint(elements,scroll) {selected=elements.slice(0,300);if(scroll&&selected[0])selected[0].scrollIntoView({block:'center',behavior:'instant'});draw();}
  function describe(e,scroll=false) {
    if(!e)return; paint([e],scroll);
    const direct=rules.filter(r=>r.active&&matches(e,r.selector));
    const inherited=[];let ancestor=e.parentElement;
    while(ancestor){for(const r of rules.filter(r=>r.active&&matches(ancestor,r.selector)))inherited.push({index:r.index,from:ancestor.tagName.toLowerCase(),properties:r.properties.filter(p=>/^(color|font($|-)|line-height|text-align|visibility|cursor|letter-spacing|word-spacing|list-style)/.test(p.name))});ancestor=ancestor.parentElement;}
    const computed=getComputedStyle(e), properties=new Set(['color','font-size','font-family','background-color','display']);
    direct.forEach(r=>r.properties.forEach(p=>properties.add(p.name)));
    if(e.style)for(const p of e.style)properties.add(p);
    const handlers=[...(listeners.get(e)||[])];
    for(const attr of e.attributes)if(/^on/.test(attr.name))handlers.push({type:attr.name.slice(2),source:attr.value,inline:true});
    // Property assignments are observable; delegated handlers cannot be reliably attributed.
    if(typeof e.onclick==='function'&&!e.hasAttribute('onclick'))handlers.push({type:'click',source:e.onclick.toString()});
    post('selection',{id:id(e),tag:e.tagName.toLowerCase(),direct:direct.map(r=>r.index),inherited:inherited.filter(r=>r.properties.length),inline:e.getAttribute('style')||'',computed:[...properties].slice(0,30).map(p=>({name:p,value:computed.getPropertyValue(p)})),handlers});
  }
  nativeAdd.call(window,'click',event=>{
    const target=event.target instanceof Element?event.target:null;if(!target)return;
    if(target.closest('a,area,button[type="submit"],input[type="submit"]'))event.preventDefault();
    const e=target.hasAttribute('data-xray-id')?target:null; if(e){describe(e);setTimeout(()=>describe(e),0);}else{paint([target],false);post('unmapped');}
  },true);
  nativeAdd.call(window,'submit',event=>event.preventDefault(),true);
  nativeAdd.call(window,'message',event=>{
    if(event.source!==parent||event.data?.xray!==token)return;
    const m=event.data;
    if(m.type==='select')describe(get(m.id),true);
    if(m.type==='rule'){const r=rules[m.index];if(r){const elements=[...document.querySelectorAll('[data-xray-id]')].filter(e=>matches(e,r.selector));paint(elements,true);post('rule-result',{count:elements.length});}}
    if(m.type==='clear')paint([],false);
  });
  nativeAdd.call(window,'scroll',draw,true);nativeAdd.call(window,'resize',()=>{scan();draw();});
  nativeAdd.call(window,'error',()=>post('script-error'));
  nativeAdd.call(document,'DOMContentLoaded',()=>{
    overlay=document.createElement('div');overlay.setAttribute('aria-hidden','true');overlay.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:2147483647';document.documentElement.append(overlay);
    scan();post('connections',{connections:[...document.querySelectorAll('[data-xray-id]')].flatMap(e=>(listeners.get(e)||[]).map(h=>({id:id(e),source:h.source,type:h.type})))});post('ready');
    observer=new MutationObserver(()=>draw());observer.observe(document.body,{subtree:true,childList:true,attributes:true,characterData:true});
  });
}
const explanations={h1:'The main heading tells us what this page is about.',h2:'A smaller heading introduces a section.',h3:'A heading introduces a subsection.',p:'A paragraph groups sentences together.',b:'Bold text draws attention to a few words.',strong:'This marks text as important, usually in bold.',i:'Italic text gives these words a different voice.',em:'Emphasis usually appears as italic text.',u:'This marks text with an underline.',img:'An image adds a picture. The alt text describes it.',a:'A link connects to another page. Here, we inspect it without leaving.',ul:'An unordered list groups items with bullets.',ol:'An ordered list numbers its items.',li:'One item in a list.',button:'A button gives someone an action to click.',div:'A container groups parts of a page.',span:'A small container groups text inside another element.',body:'The body holds the visible content of the webpage.',head:'The head contains information about the page.',style:'A style element holds CSS rules.',script:'A script element holds JavaScript instructions.',input:'An input lets someone enter information.',form:'A form groups fields for collecting information.',br:'A line break starts a new line.'};
const effects={'color':'text color','background-color':'background color','font-size':'text size','font-family':'typeface','display':'layout type','padding':'space inside the edge','margin':'space outside the edge','border-radius':'rounded corners','line-height':'space between text lines','width':'element width'};
function highlightHTML(id) {
  const e=current.elements.find(e=>e.id===id);
  document.querySelectorAll('#html .selected').forEach(e=>e.classList.remove('selected'));
  if(!e)return;
  const spans=[...$('html').querySelectorAll('[data-id]')].filter(s=>Number(s.dataset.start)>=e.start&&Number(s.dataset.end)<=e.end);
  spans.forEach(s=>s.classList.add('selected'));
  if(spans[0]){const panel=$('html'),position=spans[0].getBoundingClientRect(),bounds=panel.getBoundingClientRect();if(position.top<bounds.top||position.bottom>bounds.bottom)panel.scrollTop+=position.top-bounds.top-40;panel.scrollLeft=0;}
}
function showSelection(m) {
  highlightHTML(m.id);
  $('selection').textContent='<'+m.tag+'>';
  $('explanation').textContent=explanations[m.tag]||'This element is one of the building blocks of the page.';
  const matched=Array.isArray(m.direct)?m.direct:[];
  [...$('css').querySelectorAll('.rule')].forEach(e=>e.classList.toggle('selected',matched.includes(Number(e.dataset.rule))));
  $('css').querySelector('.selected')?.scrollIntoView({block:'nearest'});
  let detail=matched.map(i=>current.rules[i]).filter(Boolean).map(r=>`<div class="style-row"><code>${escapeHTML(r.selector)}</code> <span class="badge">matches directly</span><br>${r.properties.map(p=>`${escapeHTML(p.name)}: ${escapeHTML(p.value)}${p.priority?' !important':''}`).join('; ')}</div>`).join('');
  if(m.inline)detail+=`<div class="style-row"><b>Inline style</b><code>${escapeHTML(m.inline)}</code></div>`;
  if(!matched.length&&!m.inline)detail+='<div>No custom CSS matches this element directly. It uses inherited styles and browser defaults.</div>';
  for(const r of m.inherited||[])detail+=`<div class="style-row"><span class="badge">Inheritance candidate from ${escapeHTML(r.from)}</span>: ${r.properties.map(p=>escapeHTML(p.name)+': '+escapeHTML(p.value)).join('; ')}</div>`;
  detail+='<div class="style-row"><b>Actual values in the browser</b>'+m.computed.slice(0,12).map(p=>`<div>${escapeHTML(effects[p.name]||p.name)}: <code>${escapeHTML(p.value)}</code></div>`).join('')+'</div><small>Matched rules may override one another. Inherited candidates only apply when the element does not override them.</small>';
  $('style-info').innerHTML=detail;
  $('js').querySelectorAll('.selected').forEach(e=>e.classList.remove('selected'));
  const source=current.scripts.map(s=>s.text).join('\n\n');let connections=[];
  for(const h of m.handlers||[]) {
    const start=source.indexOf(h.source);
    if(start>=0&&h.source.trim()) {
      const from=source.slice(0,start).split('\n').length-1,to=from+h.source.split('\n').length-1;
      for(let i=from;i<=to;i++)$('js').querySelector(`[data-line="${i}"]`)?.classList.add('selected');
      connections.push(`${h.type}: runs the highlighted function attached to this element.`);
    } else if(h.inline) connections.push(`${h.type}: runs an inline handler in this element’s HTML: ${h.source}`);
    else connections.push(`${h.type}: a handler is attached, but its source could not be located reliably.`);
  }
  $('js').querySelector('.selected')?.scrollIntoView({block:'nearest'});
  $('js-info').textContent=connections.length?connections.join(' '):$('scripts').checked?'No relevant JavaScript connection identified. Delegated or indirect interactions may not be discoverable.':source.trim()?'JavaScript is displayed but paused. Turn on Run JavaScript to inspect registered interactions.':'No JavaScript in this document. Try example B to explore interactions.';
  if(!current.uploaded&&connections.length){const element=current.elements.find(e=>e.id===m.id),opening=element?current.source.slice(element.start,element.openEnd):'';const known=[['change-text','Clicking this button runs JavaScript that changes the heading’s text.'],['change-color','Clicking this button runs JavaScript that changes the heading’s color.'],['counter','Clicking this button adds one to the treat counter and updates its label.']].find(([key])=>opening.includes('id="'+key+'"'));if(known)$('js-info').textContent=known[1];}
}
window.addEventListener('message',event=>{
  const m=event.data;if(event.source!==$('preview').contentWindow||!m||m.xray!==current.token)return;
  if(m.type==='rules'&&Array.isArray(m.rules)) {
    current.rules=m.rules;
    const raw=current.elements.filter(e=>e.tag==='style').map(e=>current.source.slice(e.contentStart,e.contentEnd)).concat(current.assets?.css?[current.assets.css.text]:[]).join('\n\n');
    $('css').innerHTML=m.rules.length?m.rules.map(r=>`<button class="rule" data-rule="${r.index}">${escapeHTML(r.context ? r.context+'\n' : '')}${cssSyntax(r.text.replace(/; /g,';\n  ').replace(' { ',' {\n  ').replace(/ }$/,'\n}'))}${r.active?'':'\n/* condition not currently active */'}</button>`).join(''):'<div class="empty"><strong>No custom CSS found in style elements.</strong>The browser uses default and inherited styles, plus any inline style attributes. Compare with example B to see what CSS changes.</div>';
    if(raw)$('css').insertAdjacentHTML('beforeend',`<details class="empty"><summary>Original embedded CSS</summary><pre>${escapeHTML(raw)}</pre></details>`);
  }
  if(m.type==='selection'&&typeof m.tag==='string'&&Array.isArray(m.computed))showSelection(m);
  if(m.type==='connections'&&Array.isArray(m.connections)) {
    const source=current.scripts.map(s=>s.text).join('\n\n');current.connections=[];
    for(const c of m.connections){const start=source.indexOf(c.source);if(start<0)continue;const from=source.slice(0,start).split('\n').length-1,to=from+c.source.split('\n').length-1;current.connections.push({...c,from,to});for(let i=from;i<=to;i++){const line=$('js').querySelector(`[data-line="${i}"]`);if(line){line.tabIndex=0;line.setAttribute('role','button');line.title='Inspect the element connected to this function';}}}
  }
  if(m.type==='rule-result')$('explanation').textContent=`This selector matches ${m.count} element${m.count===1?'':'s'}. All matches are outlined in the website.`;
  if(m.type==='script-error')$('status').textContent='A script in this website reported an error. You can still inspect its HTML and CSS.';
  if(m.type==='unmapped'){document.querySelectorAll('.selected').forEach(e=>e.classList.remove('selected'));$('selection').textContent='New element';$('explanation').textContent='JavaScript or the browser created this element; no exact original HTML range is available.';$('style-info').textContent='Select an original element to inspect its matched styles.';$('js-info').textContent='No reliable source connection is available for this generated element.';}
});
function reset() {document.querySelectorAll('.selected').forEach(e=>e.classList.remove('selected'));$('selection').textContent='Meet the building blocks.';$('explanation').textContent='Try clicking Meatball’s heading in the website panel.';$('style-info').textContent='Select an element to see its styles.';$('js-info').textContent='Select an element to investigate its interactions.';send('clear');}
function selectCode(event) {const target=event.target.closest('[data-id]');if(target)send('select',{id:target.dataset.id});}
$('html').addEventListener('click',selectCode);
$('html').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectCode(e);}});
function selectJS(e){const line=e.target.closest('[data-line]');if(!line)return;const n=Number(line.dataset.line),connection=(current.connections||[]).find(c=>c.from<=n&&c.to>=n);if(connection)send('select',{id:connection.id});else $('js-info').textContent='No reliable element connection is known for this line.';}
$('js').addEventListener('click',selectJS);$('js').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectJS(e);}});
$('css').addEventListener('click',e=>{const target=e.target.closest('[data-rule]');if(!target)return;reset();target.classList.add('selected');const r=current.rules[Number(target.dataset.rule)];$('selection').textContent=r.selector;$('style-info').textContent=r.active?'This selector’s declarations are candidates for each outlined element. Select one element to inspect its actual values.':'The surrounding CSS condition is inactive, so this rule currently has no effect.';send('rule',{index:Number(target.dataset.rule)});});
$('reset').onclick=reset;
$('restart').onclick=()=>load(current.source,$('filename').textContent,current.uploaded,current.assets);
$('scripts').onchange=$('restart').onclick;
function loadExample(){$('scripts').checked=$('example').value==='interactive';load(sample($('example').value),'Meatball · '+($('example').value==='basic'?'Basic HTML':'Interactive website'));}
$('example').onchange=loadExample;$('sample').onclick=loadExample;
$('upload').onclick=()=>$('file').click();
$('file').onchange=async()=>{const file=$('file').files[0];if(!file)return;try{if(file.size>2*1024*1024)throw new Error('Please choose an HTML file smaller than 2 MB.');const text=await file.text();$('scripts').checked=false;load(text,file.name,true);}catch(e){$('status').textContent=e.message||'This file could not be read.';}finally{$('file').value='';}};
$('theme').onclick=()=>{document.body.classList.toggle('light');const label=document.body.classList.contains('light')?'Dark mode':'Light mode';$('theme').textContent=label;$('theme').setAttribute('aria-label','Switch to '+label.toLowerCase());};
function closeUploadMenu(){ $('upload-menu').hidden=true;$('upload-menu-toggle').setAttribute('aria-expanded','false'); }
$('upload-menu-toggle').onclick=()=>{const open=$('upload-menu').hidden;$('upload-menu').hidden=!open;$('upload-menu-toggle').setAttribute('aria-expanded',String(open));};
document.addEventListener('click',e=>{if(!e.target.closest('.upload-control'))closeUploadMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('upload-menu').hidden){closeUploadMenu();$('upload-menu-toggle').focus();}});
for(const [kind,inputId,buttonId] of [['css','css-file','upload-css'],['js','js-file','upload-js']]){
  $(buttonId).onclick=()=>{closeUploadMenu();$(inputId).click();};
  $(inputId).onchange=async()=>{const file=$(inputId).files[0];if(!file)return;try{if(file.size>2*1024*1024)throw new Error('Please choose a file smaller than 2 MB.');const text=await file.text(),assets={...current.assets,[kind]:{text,name:file.name}};if(kind==='js')$('scripts').checked=false;load(current.source,$('filename').textContent,true,assets);$('status').textContent=`Loaded ${file.name} alongside this HTML.${kind==='js'?' Turn on Run JavaScript to run it.':''} Loading new HTML or a sample clears these companion files.`;}catch(e){$('status').textContent=e.message||'This file could not be read.';}finally{$(inputId).value='';}};
}
$('preview-width').oninput=()=>{const preview=Number($('preview-width').value),code=100-preview;document.querySelector('.workspace').style.setProperty('--columns',`${code*.39}fr ${code*.30}fr ${code*.31}fr ${preview}fr`);};
loadExample();
