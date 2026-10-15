import * as THREE from 'three';

export function createMermaid() {
  const group=new THREE.Group();group.name='aquarium-mermaid';
  const skin=new THREE.MeshPhysicalMaterial({color:0xe8b594,roughness:.57,clearcoat:.1});
  const hairMaterial=new THREE.MeshStandardMaterial({color:0x8e4b2c,roughness:.65});
  const topMaterial=new THREE.MeshPhysicalMaterial({color:0x9373b2,roughness:.42,clearcoat:.3});
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=512;const c=canvas.getContext('2d');
  const gradient=c.createLinearGradient(0,0,0,512);gradient.addColorStop(0,'#79d3b5');gradient.addColorStop(.5,'#409b98');gradient.addColorStop(1,'#386d94');c.fillStyle=gradient;c.fillRect(0,0,256,512);
  for(let y=0;y<530;y+=17)for(let x=-10;x<270;x+=22){c.strokeStyle='rgba(209,255,224,.35)';c.lineWidth=1.5;c.beginPath();c.arc(x+(y%34?11:0),y,12,.15,Math.PI-.15);c.stroke()}
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
  const tailMaterial=new THREE.MeshPhysicalMaterial({map,color:0xe3fff5,roughness:.32,metalness:.12,clearcoat:.65,iridescence:.45});
  const finMaterial=new THREE.MeshPhysicalMaterial({color:0x62b9b4,roughness:.35,transparent:true,opacity:.82,side:THREE.DoubleSide,depthWrite:false,iridescence:.35});
  function mesh(geometry,material,x=0,y=0,z=0,parent=group){const o=new THREE.Mesh(geometry,material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
  function oval(x,y,z,rx,ry,rz,material,parent=group){const o=mesh(new THREE.SphereGeometry(1,24,20),material,x,y,z,parent);o.scale.set(rx,ry,rz);return o}
  function curve(points,radius,material,parent=group){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),24,radius,8,false),material,0,0,0,parent)}
  // Fitted bodice, shoulders, neck, and a small expressive face.
  const torso=mesh(new THREE.LatheGeometry([[.17,.04],[.145,.18],[.16,.32],[.21,.48],[.235,.59],[.17,.68],[.075,.72]].map(p=>new THREE.Vector2(...p)),28),topMaterial);torso.scale.z=.62;
  oval(0,.73,0,.067,.10,.067,skin);oval(0,.94,.005,.155,.205,.14,skin);
  oval(0,.97,-.018,.163,.19,.15,hairMaterial);
  oval(0,.92,.045,.142,.17,.125,skin);
  const eyeWhite=new THREE.MeshStandardMaterial({color:0xf3eadd,roughness:.45}),iris=new THREE.MeshPhysicalMaterial({color:0x2c5d5c,roughness:.18}),lip=new THREE.MeshStandardMaterial({color:0xad6865});
  for(const side of [-1,1]){oval(side*.059,.955,.156,.032,.018,.009,eyeWhite);oval(side*.059,.954,.165,.012,.014,.005,iris);curve([[side*.025,.985,.15],[side*.058,.997,.153],[side*.092,.983,.14]],.005,hairMaterial);oval(side*.151,.93,.015,.025,.04,.023,skin)}
  oval(0,.916,.164,.019,.032,.025,skin);curve([[-.038,.86,.151],[0,.851,.166],[.038,.86,.151]],.006,lip);
  // Hair is grouped separately so long locks trail behind her while swimming.
  const hair=new THREE.Group();group.add(hair);
  for(let i=0;i<11;i++){const x=(i-5)*.028;curve([[x,1.09,-.05],[x*1.4,.94,-.14],[x*1.8,.64,-.19],[x*1.65,.38,-.28]],.028,hairMaterial,hair)}
  const arms=[];
  for(const side of [-1,1]){const arm=new THREE.Group();arm.position.set(side*.218,.60,0);arm.rotation.z=side*.22;group.add(arm);oval(0,-.13,0,.058,.17,.058,skin,arm);const elbow=new THREE.Group();elbow.position.y=-.28;arm.add(elbow);elbow.rotation.x=-.25;oval(0,-.12,0,.044,.145,.047,skin,elbow);oval(0,-.275,.01,.042,.065,.024,skin,elbow);for(let f=0;f<4;f++)oval(-.026+f*.017,-.33,.012,.009,.032,.012,skin,elbow);arms.push({arm,elbow,side})}
  // A tapered scaled tail with a hinged lower section and paired sweeping flukes.
  const tail=new THREE.Group();tail.position.y=.07;group.add(tail);
  const upper=mesh(new THREE.LatheGeometry([[.045,-.64],[.09,-.5],[.15,-.27],[.185,-.06],[.17,.06]].map(p=>new THREE.Vector2(...p)),32),tailMaterial,0,0,0,tail);upper.scale.z=.7;
  const flukes=new THREE.Group();flukes.position.y=-.63;tail.add(flukes);
  for(const side of [-1,1]){const shape=new THREE.Shape();shape.moveTo(0,0);shape.bezierCurveTo(side*.13,-.12,side*.36,-.12,side*.44,-.37);shape.bezierCurveTo(side*.2,-.31,side*.05,-.24,0,-.13);shape.closePath();mesh(new THREE.ShapeGeometry(shape,24),finMaterial,0,0,0,flukes);for(let i=1;i<=4;i++)curve([[0,-.03,.003],[side*.12,-.13,.003],[side*(.14+i*.055),-.17-i*.04,.003]],.0025,tailMaterial,flukes)}
  group.scale.setScalar(1.2);group.traverse(o=>o.layers.set(1));
  return {group,update(t,feeding=false){const a=t*.16;group.position.set(Math.sin(a)*1.65,2.05+Math.sin(t*.65)*.14+(feeding?.3:0),.8+Math.cos(a)*.55);group.rotation.y=Math.atan2(Math.cos(a)*1.65,-Math.sin(a)*.55);group.rotation.z=Math.sin(t*.65)*.045;tail.rotation.x=Math.sin(t*2.1)*.22;tail.rotation.z=Math.sin(t*1.4)*.06;flukes.rotation.x=Math.sin(t*2.1-.6)*.3;hair.rotation.x=Math.sin(t*1.2)*.06;hair.rotation.z=Math.sin(t*.8)*.045;for(const {arm,elbow,side} of arms){arm.rotation.z=side*(.22+Math.sin(t*1.6+side)*.08);arm.rotation.x=Math.sin(t*1.2+side)*.12;elbow.rotation.x=-.25+Math.sin(t*1.5+side)*.1}}};
}
