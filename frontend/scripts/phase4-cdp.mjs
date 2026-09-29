import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';

const [url, name, widthArg = '1280', heightArg = '1000', action = 'none'] = process.argv.slice(2);
const width = Number(widthArg);
const height = Number(heightArg);
const root = new URL('../../', import.meta.url).pathname.replace(/^\/(.:)/, '$1');
const outputDir = `${root}.qa-phase4`;
const browserPath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9600 + Math.floor(Math.random() * 300);

await mkdir(outputDir, { recursive: true });
const browser = spawn(browserPath, [
  '--headless=new', '--no-sandbox', '--disable-gpu-sandbox',
  '--disable-features=VizDisplayCompositor,UseSkiaRenderer,WebGPU',
  '--use-angle=swiftshader', '--use-gl=angle', '--hide-scrollbars',
  '--no-first-run', '--disable-default-apps',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${root}.qa-phase4-profile-${name}`,
  `--window-size=${width},${height}`, url,
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let target;
for (let attempt = 0; attempt < 60; attempt += 1) {
  try {
    const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then((response) => response.json());
    target = targets.find((entry) => entry.type === 'page');
    if (target) break;
  } catch {}
  await sleep(250);
}
if (!target) throw new Error('Unable to connect to Chrome');

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

let sequence = 0;
const pending = new Map();
const failures = [];
const httpErrors = [];
const consoleMessages = [];
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.method === 'Network.loadingFailed') failures.push({ url: message.params?.requestId, error: message.params?.errorText });
  if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) {
    httpErrors.push({ status: message.params.response.status, url: message.params.response.url });
  }
  if (message.method === 'Runtime.consoleAPICalled') {
    const text = message.params.args.map((arg) => arg.value ?? arg.description ?? '').join(' ');
    if (['error', 'warning'].includes(message.params.type)) consoleMessages.push({ type: message.params.type, text });
  }
  if (message.method === 'Runtime.exceptionThrown') consoleMessages.push({ type: 'exception', text: message.params.exceptionDetails?.text });
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  message.error ? reject(new Error(message.error.message)) : resolve(message.result);
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++sequence;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result.value;

await send('Page.enable');
await send('Runtime.enable');
await send('Network.enable');
await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 });
if (process.env.QA_AUTH_B64) {
  const auth = JSON.parse(Buffer.from(process.env.QA_AUTH_B64, 'base64').toString('utf8'));
  await evaluate(`localStorage.setItem('sands_token', ${JSON.stringify(auth.token)}); localStorage.setItem('sands_current_user', ${JSON.stringify(JSON.stringify(auth.user))}); true`);
  await send('Page.reload', { ignoreCache: true });
}
await sleep(8000);

const actions = {
  gifting: `(() => { const el=[...document.querySelectorAll('a,button')].find(n=>n.offsetParent&&n.textContent.trim()==='GIFTING'); if(!el)return false; ['mouseenter','mouseover'].forEach(t=>el.dispatchEvent(new MouseEvent(t,{bubbles:true}))); return true; })()`,
  mobileMenu: `(() => { const el=[...document.querySelectorAll('button')].find(n=>n.offsetParent&&n.querySelector('svg.lucide-menu')); el?.click(); return Boolean(el); })()`,
  mobileFilter: `(() => { const el=[...document.querySelectorAll('button')].find(n=>n.offsetParent&&n.textContent.trim().toUpperCase()==='FILTER'); el?.click(); return Boolean(el); })()`,
  addFirst: `(() => { const el=[...document.querySelectorAll('button')].find(n=>n.offsetParent&&n.textContent.trim().toUpperCase()==='ADD TO CART'); el?.click(); return Boolean(el); })()`,
  removeGoldChild: `(() => { const el=document.querySelector('button[title="Remove Gold Colour filter"]'); el?.click(); return Boolean(el); })()`,
  removeSilverChild: `(() => { const el=document.querySelector('button[title="Remove Silver Type filter"]'); el?.click(); return Boolean(el); })()`,
  removeDiamondChild: `(() => { const el=document.querySelector('button[title="Remove Diamond Type filter"]'); el?.click(); return Boolean(el); })()`,
  removeMetal: `(() => { const el=document.querySelector('button[title="Remove Jewellery Type filter"]'); const found=el?.outerHTML || null; el?.click(); return {found, immediateUrl:location.href}; })()`,
};
let actionResult = null;
if (actions[action]) {
  actionResult = await evaluate(actions[action]);
  await sleep(1800);
}

const metrics = await evaluate(`(() => {
  const visible = (el) => Boolean(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  const cards = [...document.querySelectorAll('a[href^="/product/"]')].filter(visible);
  const brokenImages = [...document.images].filter(img => visible(img) && img.complete && img.naturalWidth === 0).map(img => img.currentSrc || img.src).slice(0, 10);
  const overflowingControls = [...document.querySelectorAll('button,a,input,select')].filter(visible).map(el => ({ text:(el.textContent||el.value||el.getAttribute('aria-label')||'').trim().slice(0,60), r:el.getBoundingClientRect() })).filter(({r}) => r.left < -1 || r.right > innerWidth + 1).slice(0, 20).map(({text,r})=>({text,left:Math.round(r.left),right:Math.round(r.right)}));
  return {
    url: location.href,
    title: document.title,
    viewport: [innerWidth, innerHeight],
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
    productLinks: cards.length,
    brokenImages,
    overflowingControls,
    bodyText: document.body.innerText.slice(0, 1800),
  };
})()`);
const screenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
await writeFile(`${outputDir}/${name}.png`, Buffer.from(screenshot.data, 'base64'));
const report = { ...metrics, action, actionResult, failures: failures.slice(0, 20), httpErrors: httpErrors.slice(0, 20), consoleMessages: consoleMessages.slice(0, 30) };
await writeFile(`${outputDir}/${name}.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
socket.close();
browser.kill();
