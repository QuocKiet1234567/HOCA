import * as THREE from 'three';
import { texture } from './materials.js';
import { createOfficePerson } from './human.js';

export function createOffice(scene) {
  const group = new THREE.Group(); scene.add(group);
  const material = (color, roughness=.6) => new THREE.MeshStandardMaterial({color,roughness});
  const oakMap = texture('wood',['#887458','#3c3024']); oakMap.repeat.set(2,5);
  const oak = new THREE.MeshStandardMaterial({map:oakMap,roughness:.5});
  const wall = material(0xbfc5bb,.95), dark = material(0x353d3b,.4), fabric=material(0x526361,.95);
  function box(w,h,d,mat,x,y,z,parent=group){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
  function round(r,h,mat,x,y,z,parent=group){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,16),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
  box(64,.25,60,oak,0,-3.55,-3);
  box(64,13,.25,wall,0,2.9,-28);box(.25,13,60,wall,-32,2.9,-3);box(.25,13,60,wall,32,2.9,-3);
  const ceiling=new THREE.Mesh(new THREE.PlaneGeometry(64,60),material(0xc8cec5));ceiling.position.set(0,9.4,-3);ceiling.rotation.x=Math.PI/2;group.add(ceiling);
  // Dark oak cabinet gives the aquarium a believable weight and support.
  box(10.9,3.1,6.15,oak,0,-1.91,0);box(11.05,.17,6.3,dark,0,-.32,0);
  for(const x of [-3.58,0,3.58]){box(3.49,2.78,.06,oak,x,-1.85,3.09);box(.5,.04,.055,material(0x989e91,.25),x,-.7,3.14)}
  box(10.4,.15,5.6,dark,0,-3.44,0);
  // Floor-to-ceiling windows, mullions, blinds, and a quiet skyline outside.
  const sky = new THREE.MeshBasicMaterial({color:0xbcd6dd});
  box(47,9.5,.08,sky,3,3,-27.8);
  const city=material(0x7c989e,1);
  for(let i=0;i<24;i++){const h=2+(i*7%11)*.45;box(1.5,h,.1,city,-19+i*1.8,-1+h/2,-27.65)}
  for(let x=-20;x<27;x+=4.2)box(.13,10,.2,dark,x,3,-27.3);
  for(const y of [-1.8,7.8])box(47,.15,.25,dark,3,y,-27.25);
  const blindMat=material(0xe1e0cc,.8);for(let y=5.4;y<7.8;y+=.22)box(47,.07,.35,blindMat,3,y,-27.05);
  // Workstations with screens, keyboards, mugs and articulated task chairs.
  const screenCanvas=document.createElement('canvas');screenCanvas.width=512;screenCanvas.height=320;const screenContext=screenCanvas.getContext('2d');const screenMap=new THREE.CanvasTexture(screenCanvas);screenMap.colorSpace=THREE.SRGBColorSpace;
  const screenMat=new THREE.MeshStandardMaterial({map:screenMap,emissiveMap:screenMap,emissive:0xffffff,emissiveIntensity:.25,roughness:.8});
  function desk(x,z,rotation=0){const d=new THREE.Group();d.position.set(x,0,z);d.rotation.y=rotation;group.add(d);box(5.7,.16,2.7,oak,0,-.75,0,d);for(const px of [-2.5,2.5]){box(.12,2.65,.15,dark,px,-2.15,-1,d);box(.12,2.65,.15,dark,px,-2.15,1,d)}box(1.85,1.2,.1,dark,0,.22,-.6,d);box(1.69,1.04,.02,screenMat,0,.22,-.535,d);box(.12,.36,.12,dark,0,-.49,-.6,d);box(.65,.06,.42,dark,0,-.64,-.6,d);box(1.35,.055,.45,material(0xb4bbb2),0,-.63,.48,d);for(let i=0;i<5;i++)box(1.2,.01,.02,dark,0,-.595,.3+i*.07,d);round(.15,.3,material(0xd6d3be),1.8,-.51,.3,d);box(.65,.04,.85,material(0xd4d6be),-1.9,-.62,.2,d);round(.16,1.2,dark,0,-2.7,2,d);box(1.6,.2,1.5,fabric,0,-2.05,2,d);box(1.6,1.6,.18,fabric,0,-1.35,2.72,d);for(const a of [0,Math.PI/2,Math.PI/4,-Math.PI/4]){const foot=box(2,.06,.1,dark,0,-3.28,2,d);foot.rotation.y=a}}
  const seated=[];
  function workstation(x,z,rotation=0,index=0){
    // desk() appends a self-contained group; keep the worker in that local space.
    desk(x,z,rotation);const station=group.children[group.children.length-1];const person=createOfficePerson(index+8);station.add(person.group);person.group.position.set(0,-4.8,2.15);person.group.rotation.y=Math.PI;
    for(const limb of person.limbs){limb.leg.rotation.x=-1.48;limb.knee.rotation.x=1.5;limb.arm.rotation.x=-1.13;limb.elbow.rotation.x=-.68}seated.push(person);
  }
  let workerIndex=0;for(const z of [-13,-23])for(const x of [-16,-8,0,8,16])workstation(x,z,0,workerIndex++);
  workstation(-23,1,Math.PI/2,workerIndex++);workstation(23,-1,-Math.PI/2,workerIndex++);
  // Meeting table and visitor chairs in the wider side wing.
  box(5,.18,7,oak,24,-.75,-16);for(const x of [22,26])for(const z of [-18,-14]){box(1.5,.2,1.4,fabric,x,-2,z);box(1.5,1.5,.15,fabric,x,-1.3,z+.65);round(.13,1.2,dark,x,-2.7,z)}
  // Shelves and books add recognisable everyday office detail.
  for(const y of [-2.5,0,2.5])box(4.8,.15,1.2,oak,-17,y,-13);
  for(const x of [-19.4,-14.6])box(.15,7,1.3,oak,x,-.1,-13);
  for(let i=0;i<20;i++){const color=[0x647e73,0xb3ab8c,0x7d7065,0x667a87][i%4];box(.18+(i%3)*.08,1.2+(i%4)*.16,.75,material(color),-19+i*.21,i<10?-1.7:.8,-13)}
  function plant(x,z){const potMat=material(0x777265);round(.58,.95,potMat,x,-2.95,z);const stemMat=material(0x557046);round(.07,3.4,stemMat,x,-1.2,z);for(let i=0;i<12;i++){const angle=i*2.4;const leaf=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),material(i%2?0x5e7950:0x73865b));leaf.scale.set(.65,.07,.3);leaf.position.set(x+Math.cos(angle)*.38,-2.1+i*.27,z+Math.sin(angle)*.38);leaf.rotation.set(.3,angle,.3);group.add(leaf)}}
  plant(-28,-6);plant(28,-22);plant(13,6);plant(-20,-24);plant(20,-24);
  const glow=new THREE.MeshBasicMaterial({color:0xfff4d9});
  for(const x of [-20,-7,7,20])for(const z of [-22,-11,4]){box(5,.08,.6,dark,x,8.8,z);box(4.8,.035,.45,glow,x,8.74,z)}
  const fill=new THREE.PointLight(0xffe8cd,100,35,2);fill.position.set(-8,6,3);scene.add(fill);
  const walkers=[];
  for(let i=0;i<8;i++){const p=createOfficePerson(i);group.add(p.group);walkers.push(p)}
  function drawScreen(t){const c=screenContext;c.fillStyle='#16272d';c.fillRect(0,0,512,320);c.fillStyle='#304a50';c.fillRect(0,0,512,30);c.fillStyle='#91b9ac';c.font='15px sans-serif';c.fillText('BINH TAN  |  WORKSPACE',16,21);c.fillStyle='#253d43';c.fillRect(12,43,95,263);for(let i=0;i<7;i++){c.fillStyle=i===2?'#8daea1':'#4f7073';c.fillRect(23,57+i*29,65,8)}c.fillStyle='#c1cec3';c.fillRect(126,50,212,10);for(let i=0;i<9;i++){c.fillStyle=i%3===0?'#6f9d91':'#48696d';c.fillRect(126,83+i*21,140+(i*37%185),6)}c.fillStyle='#a9c3b3';c.fillRect(127+Math.floor(t*3)%22*8,277,3,14);screenMap.needsUpdate=true}
  let screenTick=-1;
  let moving=true;
  return {
    setMoving(value){moving=value;},
    update(t){if(!moving)return;if(Math.floor(t*2)!==screenTick){screenTick=Math.floor(t*2);drawScreen(t)}for(const p of seated){for(const limb of p.limbs){const beat=t*7+p.index+limb.side;limb.arm.rotation.x=-1.13+Math.sin(beat)*.018;limb.elbow.rotation.x=-.68+Math.sin(beat*1.3)*.045}p.group.rotation.z=Math.sin(t*.7+p.index)*.008}for(const w of walkers){const a=t*(.055+w.index*.004)+w.index*1.7;const x=Math.sin(a)*23;const z=-6.1-Math.cos(a)*1.1-w.index*.33;w.group.position.x=x;w.group.position.z=z;w.group.rotation.y=Math.atan2(Math.cos(a)*23,Math.sin(a)*1.1);const gait=t*(3.6+w.index*.12)+w.index;w.group.position.y=-3.43+Math.abs(Math.sin(gait))*.045;for(const limb of w.limbs){const phase=gait+(limb.side===1?Math.PI:0);limb.leg.rotation.x=Math.sin(phase)*.38;limb.knee.rotation.x=Math.max(0,-Math.sin(phase))*.48;limb.arm.rotation.x=-Math.sin(phase)*.25;limb.elbow.rotation.x=-.15-Math.max(0,Math.sin(phase))*.15}}},
    setNight(value){group.visible=true;fill.intensity=value?12:75;glow.color.set(value?0x343e49:0xb8b8a5);sky.color.set(value?0x142132:0x9eb7c2);screenMat.emissiveIntensity=value?.32:.2;}
  };
}
