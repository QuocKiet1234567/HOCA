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
  box(42,.25,40,oak,0,-3.55,0);
  box(42,13,.25,wall,0,2.9,-16);box(.25,13,40,wall,-21,2.9,0);box(.25,13,40,wall,21,2.9,0);
  const ceiling=new THREE.Mesh(new THREE.PlaneGeometry(42,40),material(0xc8cec5));ceiling.position.y=9.4;ceiling.rotation.x=Math.PI/2;group.add(ceiling);
  // Dark oak cabinet gives the aquarium a believable weight and support.
  box(10.9,3.1,6.15,oak,0,-1.91,0);box(11.05,.17,6.3,dark,0,-.32,0);
  for(const x of [-3.58,0,3.58]){box(3.49,2.78,.06,oak,x,-1.85,3.09);box(.5,.04,.055,material(0x989e91,.25),x,-.7,3.14)}
  box(10.4,.15,5.6,dark,0,-3.44,0);
  // Floor-to-ceiling windows, mullions, blinds, and a quiet skyline outside.
  const sky = new THREE.MeshBasicMaterial({color:0xbcd6dd});
  box(25,9.5,.08,sky,3,3,-15.8);
  const city=material(0x7c989e,1);
  for(let i=0;i<13;i++){const h=2+(i*7%11)*.45;box(1.5,h,.1,city,-8+i*1.8,-1+h/2,-15.65)}
  for(let x=-9;x<17;x+=4.2)box(.13,10,.2,dark,x,3,-15.3);
  for(const y of [-1.8,7.8])box(25.5,.15,.25,dark,3,y,-15.25);
  const blindMat=material(0xe1e0cc,.8);for(let y=5.4;y<7.8;y+=.22)box(25,.07,.35,blindMat,3,y,-15.05);
  // Workstations with screens, keyboards, mugs and articulated task chairs.
  const screenMat=new THREE.MeshStandardMaterial({color:0x253f48,emissive:0x305562,emissiveIntensity:.45,roughness:.25});
  function desk(x,z,rotation=0){const d=new THREE.Group();d.position.set(x,0,z);d.rotation.y=rotation;group.add(d);box(5.7,.16,2.7,oak,0,-.75,0,d);for(const px of [-2.5,2.5]){box(.12,2.65,.15,dark,px,-2.15,-1,d);box(.12,2.65,.15,dark,px,-2.15,1,d)}box(1.85,1.2,.1,dark,0,.22,-.6,d);box(1.69,1.04,.02,screenMat,0,.22,-.535,d);box(.12,.36,.12,dark,0,-.49,-.6,d);box(.65,.06,.42,dark,0,-.64,-.6,d);box(1.35,.055,.45,material(0xb4bbb2),0,-.63,.48,d);for(let i=0;i<5;i++)box(1.2,.01,.02,dark,0,-.595,.3+i*.07,d);round(.15,.3,material(0xd6d3be),1.8,-.51,.3,d);box(.65,.04,.85,material(0xd4d6be),-1.9,-.62,.2,d);round(.16,1.2,dark,0,-2.7,2,d);box(1.6,.2,1.5,fabric,0,-2.05,2,d);box(1.6,1.6,.18,fabric,0,-1.35,2.72,d);for(const a of [0,Math.PI/2,Math.PI/4,-Math.PI/4]){const foot=box(2,.06,.1,dark,0,-3.28,2,d);foot.rotation.y=a}}
  desk(-9,-10);desk(-1.5,-10);desk(7,-10);desk(-14,1,Math.PI/2);desk(14,-2,-Math.PI/2);
  // Shelves and books add recognisable everyday office detail.
  for(const y of [-2.5,0,2.5])box(4.8,.15,1.2,oak,-17,y,-13);
  for(const x of [-19.4,-14.6])box(.15,7,1.3,oak,x,-.1,-13);
  for(let i=0;i<20;i++){const color=[0x647e73,0xb3ab8c,0x7d7065,0x667a87][i%4];box(.18+(i%3)*.08,1.2+(i%4)*.16,.75,material(color),-19+i*.21,i<10?-1.7:.8,-13)}
  function plant(x,z){const potMat=material(0x777265);round(.58,.95,potMat,x,-2.95,z);const stemMat=material(0x557046);round(.07,3.4,stemMat,x,-1.2,z);for(let i=0;i<12;i++){const angle=i*2.4;const leaf=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),material(i%2?0x5e7950:0x73865b));leaf.scale.set(.65,.07,.3);leaf.position.set(x+Math.cos(angle)*.38,-2.1+i*.27,z+Math.sin(angle)*.38);leaf.rotation.set(.3,angle,.3);group.add(leaf)}}
  plant(-18,-6);plant(17,-12);plant(11,6);
  const glow=new THREE.MeshBasicMaterial({color:0xfff4d9});
  for(const x of [-10,3,14])for(const z of [-9,4]){box(5,.08,.6,dark,x,8.8,z);box(4.8,.035,.45,glow,x,8.74,z)}
  const fill=new THREE.PointLight(0xffe8cd,100,35,2);fill.position.set(-8,6,3);scene.add(fill);
  const walkers=[];
  for(let i=0;i<4;i++){const p=createOfficePerson(i);group.add(p.group);walkers.push(p)}
  let moving=true;
  return {
    setMoving(value){moving=value;},
    update(t){if(!moving)return;for(const w of walkers){const a=t*(.09+w.index*.012)+w.index*1.7;const x=Math.sin(a)*15;const z=-5.7-Math.cos(a)*1.3-w.index*.55;w.group.position.x=x;w.group.position.z=z;w.group.rotation.y=Math.atan2(Math.cos(a)*15,Math.sin(a)*1.3);const gait=t*(3.6+w.index*.2)+w.index;w.group.position.y=-3.43+Math.abs(Math.sin(gait))*.045;for(const limb of w.limbs){const phase=gait+(limb.side===1?Math.PI:0);limb.leg.rotation.x=Math.sin(phase)*.38;limb.knee.rotation.x=Math.max(0,-Math.sin(phase))*.48;limb.arm.rotation.x=-Math.sin(phase)*.25;limb.elbow.rotation.x=-.15-Math.max(0,Math.sin(phase))*.15}}},
    setNight(value){group.visible=!value;fill.intensity=value?0:140;glow.color.set(value?0x000000:0xfff4d9);sky.color.set(value?0x000000:0xc9e0e6);screenMat.emissiveIntensity=value?0:.45;}
  };
}
