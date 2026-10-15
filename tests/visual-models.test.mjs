import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SPECIES, speciesById } from '../src/species.js';
import { createFish } from '../src/fish.js';
import { createOfficePerson } from '../src/human.js';

test('eight fish species produce distinct valid meshes and animation uniforms',()=>{
  // Canvas drawing is stubbed; mesh construction and geometry are actual Three.js.
  const original=globalThis.document;
  const context=new Proxy({createLinearGradient:()=>({addColorStop(){}})},{get:(target,key)=>target[key]||(()=>{}),set:(target,key,value)=>{target[key]=value;return true}});
  globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>context})};
  try{
    assert.equal(new Set(SPECIES.map(s=>s.id)).size,8);
    const dimensions=new Set();
    for(let i=0;i<SPECIES.length;i++){
      const fish=createFish(i,SPECIES[i].id);
      assert.equal(fish.speciesId,SPECIES[i].id);assert.equal(fish.fins.length,2);
      dimensions.add(fish.group.children[0].scale.toArray().join(','));
      fish.group.traverse(m=>{if(m.geometry){for(const n of m.geometry.attributes.position.array)assert.ok(Number.isFinite(n));m.geometry.dispose()}if(m.material){m.material.map?.dispose();m.material.dispose()}});
      const shader={uniforms:{},vertexShader:'#include <begin_vertex>'};fish.group.children[0].material.onBeforeCompile(shader);
      assert.equal(shader.uniforms.swimPhase,fish.swim);assert.ok(shader.vertexShader.includes('transformed.z'));
    }
    assert.equal(dimensions.size,8);assert.equal(speciesById('bad-id').id,'goldfish');
    assert.equal(createFish(0,'cory').height<1,true);
  }finally{globalThis.document=original}
});

test('office characters have four articulated limbs and finite geometry',()=>{
  for(let i=0;i<4;i++){
    const p=createOfficePerson(i);assert.equal(p.limbs.length,2);
    for(const limb of p.limbs)for(const part of ['leg','knee','arm','elbow'])assert.ok(limb[part].isGroup);
    p.group.traverse(m=>{if(m.geometry){for(const n of m.geometry.attributes.position.array)assert.ok(Number.isFinite(n));m.geometry.dispose()}m.material?.dispose()});
  }
});
