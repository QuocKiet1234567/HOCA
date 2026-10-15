import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createAquariumServer } from '../server.mjs';

test('independent tanks, accepted friendships, visits, gift transfer and restart persistence', async () => {
  const dataDirectory=mkdtempSync(path.join(tmpdir(),'aqua-test-'));
  let server;
  async function start(){server=createAquariumServer({dataDirectory});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));return `http://127.0.0.1:${server.address().port}`}
  let base=await start();
  async function call(route,body,token){const r=await fetch(base+'/api/'+route,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:`Bearer ${token}`}:{})},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,...await r.json()}}
  const close=()=>new Promise(resolve=>server.close(resolve));
  try{
    const a=await call('register',{name:'An'}),b=await call('register',{name:'Bình'}),c=await call('register',{name:'Châu'});
    assert.equal(a.status,201);assert.notEqual(a.player.code,b.player.code);
    assert.equal((await call('me')).status,401);
    assert.equal((await call('me',null,'0'.repeat(64))).status,401);
    assert.equal((await call('visit?code='+b.player.code,null,a.token)).status,403);
    assert.equal((await call('gift',{code:b.player.code},a.token)).status,403);
    await call('action',{action:'add'},a.token);
    assert.equal((await call('me',null,a.token)).player.count,9);
    assert.equal((await call('me',null,b.token)).player.count,8);
    await call('friend-request',{code:b.player.code},a.token);
    assert.equal((await call('me',null,b.token)).requests[0].name,'An');
    assert.equal((await call('friend-response',{code:a.player.code,accept:true},c.token)).status,400);
    await call('friend-response',{code:a.player.code,accept:true},b.token);
    assert.equal((await call('visit?code='+b.player.code,null,a.token)).player.name,'Bình');
    assert.equal((await call('me',null,b.token)).friends[0].code,a.player.code);
    await call('action',{action:'light'},a.token);
    assert.equal((await call('me',null,a.token)).player.night,true);
    assert.equal((await call('me',null,b.token)).player.night,false);
    assert.equal((await call('action',{action:'feed'},a.token)).status,200);
    assert.equal((await call('action',{action:'feed'},a.token)).status,400);
    assert.equal((await call('gift',{code:b.player.code},a.token)).status,200);
    assert.equal((await call('me',null,a.token)).player.count,8);
    const received=await call('me',null,b.token);
    assert.equal(received.player.count,9);assert.equal(received.gifts[0].from,'An');
    assert.equal((await call('gift',{code:b.player.code},a.token)).status,400);
    assert.equal((await call('friend-request',{code:a.player.code},a.token)).status,400);
    assert.equal((await call('friend-request',{code:'BADCODE'},a.token)).status,404);
    for(let i=0;i<15;i++)await call('action',{action:'add'},b.token);
    assert.equal((await call('action',{action:'add'},b.token)).status,400);
    const foreign=await fetch(base+'/api/action',{method:'POST',headers:{Origin:'https://example.com','Content-Type':'application/json',Authorization:`Bearer ${a.token}`},body:JSON.stringify({action:'add'})});
    assert.equal(foreign.status,403);
    await close();base=await start();
    const restored=await call('me',null,b.token);
    assert.equal(restored.player.count,24);assert.equal(restored.friends[0].code,a.player.code);assert.equal(restored.gifts[0].from,'An');
    assert.equal('token' in restored.player,false);assert.equal('token' in restored.friends[0],false);
  }finally{await close();rmSync(dataDirectory,{recursive:true,force:true})}
});
