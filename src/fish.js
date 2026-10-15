import * as THREE from 'three';
import { fishTexture } from './materials.js';
import { SPECIES, speciesById } from './species.js';

export function createFish(index, speciesId=SPECIES[index%SPECIES.length].id) {
  const species=speciesById(speciesId),group=new THREE.Group();let seed=391+index*739;
  const range=(a,b)=>{seed=seed*16807%2147483647;return a+(seed-1)/2147483646*(b-a)};
  const map=fishTexture(index,species),swim={value:0};
  const bodyMat=new THREE.MeshPhysicalMaterial({map,roughness:.32,metalness:.025,clearcoat:.55,clearcoatRoughness:.24});
  bodyMat.onBeforeCompile=shader=>{shader.uniforms.swimPhase=swim;shader.vertexShader='uniform float swimPhase;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.z += sin(position.x * 3.0 - swimPhase) * pow(max(0.0, -position.x), 2.0) * .10;')};
  const finColor={neon:0x92b8a8,angelfish:0xabb2a0,discus:0x79b0b6,guppy:0xd89a42,koi:0xccad8a,betta:0x526eae,cory:0x9b8f6f,goldfish:0xd79140}[species.id];
  const finMat=new THREE.MeshPhysicalMaterial({color:finColor,transparent:true,opacity:.68,side:THREE.DoubleSide,roughness:.43,depthWrite:false});
  function mesh(geo,mat,x=0,y=0,z=0,parent=group){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m}
  const [length,height,width]=species.body;
  const body=mesh(new THREE.SphereGeometry(1,40,28),bodyMat);body.scale.set(length,height,width);
  const tail=new THREE.Group();tail.position.x=-length*.84;tail.scale.setScalar(species.tail/.33);group.add(tail);
  const shape=new THREE.Shape();shape.moveTo(.03,0);shape.bezierCurveTo(-.12,.04,-.23,.20,-.34,.23);shape.quadraticCurveTo(-.27,.02,-.34,-.23);shape.bezierCurveTo(-.23,-.20,-.12,-.04,.03,0);
  mesh(new THREE.ShapeGeometry(shape,16),finMat,0,0,0,tail);
  const rayMat=new THREE.LineBasicMaterial({color:0x6c6c50,transparent:true,opacity:.24});
  for(let i=-4;i<=4;i++){const ray=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0),new THREE.Vector3(-.31,i*.05,0)]);tail.add(new THREE.Line(ray,rayMat))}
  const dorsal=new THREE.Shape();dorsal.moveTo(-length*.8,height*.5);dorsal.bezierCurveTo(-length*.6,height+species.dorsal,length*.15,height+species.dorsal*.7,length*.65,height*.55);dorsal.quadraticCurveTo(0,height*.8,-length*.8,height*.5);mesh(new THREE.ShapeGeometry(dorsal,20),finMat);
  if(['angelfish','discus','betta'].includes(species.id)){const lower=mesh(new THREE.ShapeGeometry(dorsal,20),finMat);lower.rotation.x=Math.PI;lower.scale.y=species.id==='angelfish'?1.25:.8}
  const fins=[];
  for(const side of [-1,1]){
    const eyeX=length*.7,eyeY=height*.24,eyeZ=side*width*.77;
    const eyeWhite=mesh(new THREE.SphereGeometry(.032,16,12),new THREE.MeshStandardMaterial({color:0xc4b585,roughness:.35}),eyeX,eyeY,eyeZ);eyeWhite.scale.z=.5;
    const eye=mesh(new THREE.SphereGeometry(.022,16,12),new THREE.MeshPhysicalMaterial({color:0x111c1d,roughness:.08,clearcoat:1}),eyeX+.005,eyeY,eyeZ+side*.012);eye.scale.z=.5;
    mesh(new THREE.SphereGeometry(.006,8,6),new THREE.MeshBasicMaterial({color:0xf2f2df}),eyeX+.012,eyeY+.008,eyeZ+side*.025);
    const pectoral=new THREE.Shape();pectoral.moveTo(0,0);pectoral.quadraticCurveTo(-.12,-.22,-.23,-.12);pectoral.quadraticCurveTo(-.16,-.03,0,0);const fin=mesh(new THREE.ShapeGeometry(pectoral,12),finMat,length*.1,-height*.16,side*width);fin.rotation.y=side*.6;fins.push(fin);
    const gillCurve=new THREE.EllipseCurve(length*.45,0,length*.09,height*.62,-1.2,1.2,false,0);const points=gillCurve.getPoints(20).map(p=>new THREE.Vector3(p.x,p.y,side*width*.92));mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),20,.0025,3,false),new THREE.MeshStandardMaterial({color:0x74694f,transparent:true,opacity:.45}));
    if(species.id==='angelfish'||species.id==='cory'){const filament=new THREE.CatmullRomCurve3([new THREE.Vector3(length*.3,-height*.4,side*.03),new THREE.Vector3(length*.05,-height-.2,side*.05),new THREE.Vector3(-length*.25,-height-.34,side*.08)]);mesh(new THREE.TubeGeometry(filament,14,.006,4,false),finMat)}
  }
  const mouth=mesh(new THREE.SphereGeometry(1,14,10),new THREE.MeshStandardMaterial({color:0xa38d6b,roughness:.6}),length*.98,-height*.07,0);mouth.scale.set(.012,.018,.027);
  group.scale.setScalar(species.size*range(.88,1.12));
  return {group,tail,fins,swim,speciesId:species.id,phase:range(0,6.28),speed:species.speed*range(.85,1.15),radius:range(2.3,4.25),height:species.id==='cory'?range(.45,.65):range(1.2,4),depth:range(.6,2)};
}
