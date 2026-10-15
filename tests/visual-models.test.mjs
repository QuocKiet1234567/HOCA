import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SPECIES, speciesById } from '../src/species.js';
import { createFish } from '../src/fish.js';
import { createOfficePerson } from '../src/human.js';
import { createOffice } from '../src/office.js';
import { LIGHTING } from '../src/lighting.js';
import * as THREE from 'three';
import { createMermaid } from '../src/mermaid.js';

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

test('mermaid stays inside the aquarium throughout swimming and feeding',()=>{
  const original=globalThis.document;
  const context=new Proxy({createLinearGradient:()=>({addColorStop(){}})},{get:(target,key)=>target[key]||(()=>{}),set:()=>true});
  globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>context})};
  let mermaid;
  try{
    mermaid=createMermaid();assert.equal(mermaid.group.name,'aquarium-mermaid');
    for(const feeding of [false,true])for(let t=0;t<50;t+=2){mermaid.update(t,feeding);mermaid.group.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(mermaid.group);assert.ok(bounds.min.x>-5.1&&bounds.max.x<5.1);assert.ok(bounds.min.y>.3&&bounds.max.y<5.2);assert.ok(bounds.min.z>-2.7&&bounds.max.z<2.7)}
    mermaid.group.traverse(o=>assert.ok(o.layers.isEnabled(1)));
  }finally{mermaid?.group.traverse(m=>{m.geometry?.dispose();m.material?.map?.dispose();m.material?.dispose()});globalThis.document=original}
});

test('360-degree office animates 44 people around the tank and stays present at night',()=>{
  const original=globalThis.document;
  const context=new Proxy({},{get:()=>()=>{},set:()=>true});
  globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>context})};
  const scene=new THREE.Scene();
  try{
    const office=createOffice(scene),people=[];scene.traverse(o=>{if(o.name==='office-person')people.push(o)});
    assert.equal(people.length,44);
    const seated=people.filter(p=>p.userData.activity==='typing');assert.equal(seated.length,28);
    const workers=people.filter(p=>p.userData.activity==='walking');assert.equal(workers.length,12);
    assert.equal(people.filter(p=>p.userData.activity==='paperwork').length,4);
    scene.updateMatrixWorld(true);const locations=seated.map(p=>p.getWorldPosition(new THREE.Vector3()));
    assert.ok(locations.some(p=>p.z>10));assert.ok(locations.some(p=>p.z<-10));
    assert.ok(locations.some(p=>p.x>25));assert.ok(locations.some(p=>p.x<-25));
    office.update(1);const before=workers[0].position.clone();const pose=seated[0].rotation.z;
    office.update(2);assert.ok(workers[0].position.distanceTo(before)>.01);assert.notEqual(seated[0].rotation.z,pose);
    office.setMoving(false);const stopped=workers[0].position.clone();office.update(5);assert.equal(workers[0].position.distanceTo(stopped),0);
    office.setNight(true);assert.equal(scene.children[0].visible,true);
    assert.ok(LIGHTING.night.ambient>0&&LIGHTING.night.ambient<LIGHTING.day.ambient);
    assert.ok(LIGHTING.day.lamp<50&&LIGHTING.day.tankFill<1);
    office.setMoving(true);office.update(6);assert.ok(workers[0].position.distanceTo(stopped)>.01);
    office.setNight(false);assert.equal(scene.children[0].visible,true);
  }finally{scene.traverse(m=>{m.geometry?.dispose();if(m.material){m.material.map?.dispose();m.material.dispose()}});globalThis.document=original}
});
