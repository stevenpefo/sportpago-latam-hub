// Real Chromium UI tests against a local preview with a MOCKED Supabase REST API.
// Never writes to the actual Colombia/USA database.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as pause } from 'node:timers/promises';
import { chromium } from 'playwright';

const PORT = 4178;
const HOST = `http://127.0.0.1:${PORT}`;
const token = 'a'.repeat(64);
const server = spawn('npm', ['run','dev','--','--host','127.0.0.1','--port',String(PORT),'--strictPort'], {
  stdio: ['ignore','pipe','pipe'],
  env: {
    ...process.env,
    VITE_DEPLOY_TARGET:'preview-shared',
    VITE_ENABLE_CLUB_INVITES:'true',
    VITE_SUPABASE_PROJECT_ID:'myqrrmtubfqlnnqdoams',
    VITE_SUPABASE_URL:'https://myqrrmtubfqlnnqdoams.supabase.co',
    // Dummy public key used ONLY with intercepted network traffic.
    VITE_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_QA_MOCK_ONLY_DO_NOT_DEPLOY_12345',
  },
});
let logs='';
server.stdout.on('data', b => { logs += b.toString(); });
server.stderr.on('data', b => { logs += b.toString(); });

async function waitForServer() {
  for(let i=0;i<65;i++){
    if(server.exitCode!==null) throw new Error('Vite exited: '+logs.slice(-1500));
    try {const r=await fetch(HOST);if(r.status===200)return;}catch{}
    await pause(500);
  }
  throw new Error('Timed out starting app: '+logs.slice(-1500));
}

function createMockResponder(calls){
  return async route => {
    const req=route.request();
    const url=new URL(req.url());
    calls.push({path:url.pathname,method:req.method(),data:req.postData()});
    const headers={'access-control-allow-origin':'*','access-control-allow-headers':'*'};
    if(req.method()==='OPTIONS')return route.fulfill({status:204,headers});
    if(url.pathname.endsWith('/rpc/get_club_join_info'))
      return route.fulfill({status:200,contentType:'application/json',headers,body:JSON.stringify({club_name:'QA Sports Club'})});
    if(url.pathname.endsWith('/rpc/submit_club_join_request'))
      return route.fulfill({status:200,contentType:'application/json',headers,body:JSON.stringify('00000000-0000-0000-0000-000000000001')});
    if(url.pathname.includes('/auth/v1/'))
      return route.fulfill({status:200,contentType:'application/json',headers,body:'{"user":null}'});
    return route.fulfill({status:200,contentType:'application/json',headers,body:'[]'});
  };
}
async function newPage(browser,locale='en-US',mobile=false) {
  const ctx=await browser.newContext({
    locale,viewport:mobile?{width:390,height:844}:{width:1200,height:800},
    isMobile:mobile,hasTouch:mobile,serviceWorkers:'block'
  });
  const calls=[];
  await ctx.route('**/*.supabase.co/**',createMockResponder(calls));
  const page=await ctx.newPage();
  return {ctx,page,calls};
}
async function runCheck(name,fn){
  try {await fn();console.log('PASS:',name);}
  catch(err){console.error('FAIL:',name,err);process.exitCode=1;}
}

let browser;
try{
  await waitForServer();
  browser=await chromium.launch({headless:true});
  const langs=[
    ['en-US','Join your sports club','en'],
    ['es-CO','Inscripción al club','es'],
    ['fr-FR','Rejoindre votre club','fr'],
    ['pt-BR','Entre no seu clube','pt'],
  ];
  for(const [locale,title,lang] of langs){
    await runCheck(`/join uses ${lang} from ${locale} browser settings`,async()=>{
      const {ctx,page}=await newPage(browser,locale);
      try {
        await page.goto(`${HOST}/join/${token}`,{waitUntil:'domcontentloaded'});
        await page.getByText('QA Sports Club',{exact:true}).waitFor({timeout:15000});
        assert.equal((await page.locator('html').getAttribute('lang')),lang);
        assert.ok((await page.getByText(title,{exact:true}).count())>0,`Missing title ${title}`);
      }finally{await ctx.close();}
    });
  }
  await runCheck('Invalid invitation renders a safe unavailable state',async()=>{
    const {ctx,page}=await newPage(browser);
    try{
      await page.goto(`${HOST}/join/notvalid`);
      await page.getByText('Link unavailable',{exact:true}).waitFor({timeout:15000});
    }finally{await ctx.close();}
  });
  await runCheck('Parent form submits only to request RPC, preserving club token',async()=>{
    const {ctx,page,calls}=await newPage(browser,'en-US',true);
    try {
      await page.goto(`${HOST}/join/${token}`);
      await page.getByText('QA Sports Club',{exact:true}).waitFor({timeout:15000});
      await page.locator('#join-athlete').fill('QA Athlete');
      await page.locator('#join-sport').fill('Soccer');
      await page.locator('#join-contact').fill('QA Guardian');
      await page.locator('#join-email').fill('qa@example.invalid');
      await page.getByRole('checkbox').nth(0).click();
      await page.getByRole('checkbox').nth(1).click();
      await page.getByRole('button',{name:'Submit request'}).click();
      await page.getByText('Request received',{exact:true}).waitFor({timeout:15000});
      const rpc=calls.find(x=>x.path.endsWith('/rpc/submit_club_join_request'));
      assert.ok(rpc,'Expected submit_club_join_request RPC call');
      const payload=JSON.parse(rpc.data);
      assert.equal(payload.p_token,token);
      assert.equal(payload.p_acepta_privacidad,true);
      assert.equal(payload.p_es_acudiente,true);
      assert.ok(!calls.some(x=>x.path.endsWith('/athletes')),'Must not directly write to athletes');
      const overflows=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2);
      assert.equal(overflows,false,'Mobile UI has horizontal overflow');
    }finally{await ctx.close();}
  });
  await runCheck('Browser language is overridden by a saved user choice',async()=>{
    const {ctx,page}=await newPage(browser,'en-US');
    try {
      await page.addInitScript(()=>localStorage.setItem('sportpago-language','fr'));
      await page.goto(`${HOST}/join/${token}`);
      await page.getByText('Rejoindre votre club',{exact:true}).waitFor({timeout:15000});
      assert.equal(await page.locator('html').getAttribute('lang'),'fr');
    }finally{await ctx.close();}
  });
}finally{
  if(browser)await browser.close();
  server.kill('SIGTERM');
}
process.exit(process.exitCode || 0);
