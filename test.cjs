// Run with XRAY_PLAYWRIGHT_PATH pointing to an installed playwright package,
// or install Playwright outside the deployable app and use node test.cjs.
const {chromium}=require(process.env.XRAY_PLAYWRIGHT_PATH || 'playwright');
const path=require('node:path');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const http=require('node:http');
(async()=>{
let leakedRequests=0;
const server=http.createServer((request,response)=>{if(request.url.includes('/blocked/'))leakedRequests++;const name=new URL(request.url,'http://localhost').pathname.replace('/classroom/xrayOz/','')||'index.html';if(!['index.html','app.js','app.css','logo.jfif'].includes(name)){response.writeHead(404);response.end();return;}response.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html');response.end(fs.readFileSync(path.join(__dirname,name)));});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true,channel:'msedge'});
const page=await browser.newPage({viewport:{width:1500,height:1100}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(`http://127.0.0.1:${server.address().port}/classroom/xrayOz/`);
const frame=page.frameLocator('#preview');
assert.equal(await page.locator('.brand-logo').evaluate(e=>e.complete&&e.naturalWidth>0),true);
const widths=await page.evaluate(()=>[document.querySelector('.split-upload').getBoundingClientRect().width,document.querySelector('#sample').getBoundingClientRect().width]);assert.equal(widths[0],widths[1]);
await page.locator('#upload-menu-toggle').click();assert.equal(await page.locator('#upload-css').isVisible(),true);assert.equal(await page.locator('#upload-js').isVisible(),true);await page.keyboard.press('Escape');assert.equal(await page.locator('#upload-menu').isVisible(),false);
await page.locator('#theme').click();assert.equal(await page.locator('#theme').textContent(),'Dark mode');await page.locator('#theme').click();assert.equal(await page.locator('#theme').textContent(),'Light mode');
await frame.locator('h1').click();
await page.waitForFunction(()=>document.querySelector('#selection').textContent==='<h1>');
assert((await page.locator('#html .selected').allTextContents()).join('').includes('</h1>'));
await frame.locator('b').click();
assert.equal(await page.locator('#selection').textContent(),'<b>');
assert((await page.locator('#html .selected').allTextContents()).join('').includes('</b>'));
await page.locator('#html [data-id]').filter({hasText:'<h2>'}).first().click();
await page.waitForFunction(()=>document.querySelector('#selection').textContent==='<h2>');
await page.selectOption('#example','interactive');
await frame.locator('#change-text').click();
await page.waitForFunction(()=>document.querySelector('#js .selected'));
assert.equal(await frame.locator('h1').textContent(),'Meatball is the BEST boy!');
await frame.locator('#change-color').click();
assert.equal(await frame.locator('h1').evaluate(e=>getComputedStyle(e).color),'rgb(182, 83, 57)');
await frame.locator('#counter').click();await frame.locator('#counter').click();
assert.equal(await frame.locator('#counter').textContent(),'Give a treat · 2');
await frame.locator('h1').click();
await page.waitForFunction(()=>document.querySelector('#css .selected')?.textContent.includes('h1'));
assert((await page.locator('#style-info').textContent()).includes('rgb(182, 83, 57)'));
await page.locator('#css .rule').filter({hasText:'p, li'}).click();
await page.waitForFunction(()=>document.querySelector('#explanation').textContent.includes('6 elements'));
await page.locator('#js [data-line]').filter({hasText:'function changeText'}).click();
await page.waitForFunction(()=>document.querySelector('#selection').textContent==='<button>');
await page.locator('#reset').click();assert.equal(await page.locator('.selected').count(),0);
const original=await page.locator('#preview').getAttribute('srcdoc');
await frame.locator('a').click();assert.equal(await page.locator('#preview').getAttribute('srcdoc'),original);
await frame.locator('h1').click();await page.screenshot({path:path.join(__dirname,'screenshot-desktop.png'),fullPage:true});
async function upload(content,name='student.html'){await page.locator('#file').setInputFiles({name,mimeType:'text/html',buffer:Buffer.from(content)});await frame.locator('body').waitFor();}
const exporterPath=path.join(__dirname,'../output/snap-redesign/html-playset/index.html');
if(fs.existsSync(exporterPath)) {
  const exporter=await browser.newPage();await exporter.goto('file:///'+exporterPath.replaceAll('\\','/'));
  const exported=await exporter.evaluate(()=>pageSource());await exporter.close();
  await upload(exported,'my-website.html');await frame.locator('h1').first().click();await page.waitForFunction(()=>document.querySelector('#selection').textContent==='<h1>');console.log('PASS: real HTMeatbaL pageSource() export.');
}
await upload('<!doctype html><html><head><style>p {color:red} b {color:blue}</style></head><body><h1>My HTMeatbaL site</h1><p>Hello <b>nested</b></p><script>document.body.dataset.executed="yes";</script></body></html>');
await frame.locator('b').click();await page.waitForFunction(()=>document.querySelector('#selection').textContent==='<b>');
assert.equal(await frame.locator('body').getAttribute('data-executed'),null);
await page.locator('#scripts').check();await frame.locator('body[data-executed="yes"]').waitFor();
await upload('<h1>Broken<p>Still here<b>Nested');await frame.locator('b').click();await page.waitForFunction(()=>document.querySelector('#selection').textContent==='<b>');
await upload('<h1>Plain</h1><p>No CSS or JS</p>');await frame.locator('h1').click();assert((await page.locator('#css').textContent()).includes('No custom CSS found'));
await upload('<h1>Isolation</h1><script>try {parent.document.body.innerHTML="hacked"} catch(e) {document.querySelector("h1").textContent="Isolated"}</script>');await page.locator('#scripts').check();await frame.locator('h1').filter({hasText:'Isolated'}).waitFor();assert.equal(await page.locator('#upload').textContent(),'Upload My HTML');
const blocked=`http://127.0.0.1:${server.address().port}/blocked/`;
await upload('<h1>Companion files</h1><button id="companion">Click me</button>');
await page.locator('#css-file').setInputFiles({name:'styles.css',mimeType:'text/css',buffer:Buffer.from('h1 { color: rgb(10, 20, 30); }')});
await frame.locator('h1').click();assert.equal(await frame.locator('h1').evaluate(e=>getComputedStyle(e).color),'rgb(10, 20, 30)');
await page.locator('#js-file').setInputFiles({name:'behavior.js',mimeType:'text/javascript',buffer:Buffer.from("document.getElementById('companion').addEventListener('click', function companionClick() { document.querySelector('h1').textContent = 'Companion works'; });")});
await page.waitForFunction(()=>document.querySelector('#js').textContent.includes('companionClick'));assert.equal(await page.locator('#scripts').isChecked(),false);
await page.locator('#scripts').check();await frame.locator('#companion').click();assert.equal(await frame.locator('h1').textContent(),'Companion works');assert.equal(await frame.locator('h1').evaluate(e=>getComputedStyle(e).color),'rgb(10, 20, 30)');
console.log('PASS: logo, matching split-button width, dropdown, theme labels, CSS and JavaScript companion uploads.');
await upload(`<h1>Network isolation</h1><img src="${blocked}image.png"><style>@import url(${blocked}style.css);</style><script>fetch("${blocked}data").catch(()=>{});</script>`);await page.locator('#scripts').check();await frame.locator('h1').click();assert.equal(leakedRequests,0);
await page.setViewportSize({width:390,height:844});await page.selectOption('#example','basic');await frame.locator('h1').waitFor();await page.screenshot({path:path.join(__dirname,'screenshot-mobile.png'),fullPage:true});
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
assert.deepEqual(errors,[]);
console.log('PASS: sample, HTML forward/reverse, nested selection, CSS forward/reverse, JavaScript interactions/reverse, clear, links, upload, paused scripts, malformed markup, plain HTML, isolation, responsive layout.');
await browser.close();
server.close();
})().catch(error=>{console.error(error);process.exit(1)});

