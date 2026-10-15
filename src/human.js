import * as THREE from 'three';

export function createOfficePerson(index) {
  const group=new THREE.Group(),limbs=[];
  const mat=(color,roughness=.8)=>new THREE.MeshStandardMaterial({color,roughness});
  const skin=new THREE.MeshPhysicalMaterial({color:[0xd0a385,0xbb896e,0xe0b99a,0xac7b60][index%4],roughness:.62,clearcoat:.05});
  const shirt=mat([0xa9bab8,0xd6d0bf,0x71838d,0xb3a594][index%4]);
  const pants=mat(index%2?0x4e504d:0x37434b),shoe=mat(0x302b28,.35),hair=mat(index%2?0x3c3029:0x282b29,.9);
  const seam=mat(0x7b847e),eyeWhite=mat(0xc7c7b2,.4),iris=mat(0x34332c,.2),lip=mat(0x996d5e);
  function mesh(geo,m,x=0,y=0,z=0,parent=group){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
  function ellipsoid(x,y,z,rx,ry,rz,m,parent=group){const o=mesh(new THREE.SphereGeometry(1,24,20),m,x,y,z,parent);o.scale.set(rx,ry,rz);o.castShadow=Math.max(rx,ry,rz)>.14;return o}
  function cylinder(top,bottom,height,m,x,y,z,parent=group){return mesh(new THREE.CylinderGeometry(top,bottom,height,20),m,x,y,z,parent)}
  function line(points,m,r=.008,parent=group){const o=mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),16,r,5,false),m,0,0,0,parent);o.castShadow=false;return o}
  // A shaped torso, rounded shoulder seams, and an actual collar rather than a sphere body.
  const profile=[[.34,2.65],[.40,2.8],[.38,3.0],[.42,3.3],[.48,3.7],[.49,3.88],[.34,4.03],[.18,4.12]];
  const torso=mesh(new THREE.LatheGeometry(profile.map(([r,y])=>new THREE.Vector2(r,y)),32),shirt);torso.scale.z=.64;
  ellipsoid(0,2.65,0,.42,.27,.26,pants);
  cylinder(.13,.17,.3,skin,0,4.18,0);
  const head=ellipsoid(0,4.67,0,.30,.43,.285,skin);head.rotation.x=-.025;
  ellipsoid(0,4.49,.09,.235,.23,.22,skin);
  const hairCap=mesh(new THREE.SphereGeometry(1,28,20,0,Math.PI*2,0,Math.PI*.48),hair,0,4.69,-.015);hairCap.scale.set(.31,.43,.29);hairCap.rotation.x=-.1;
  if(index%2){ellipsoid(0,4.55,-.23,.30,.38,.14,hair);ellipsoid(0,4.48,-.39,.13,.18,.16,hair)}
  for(const side of [-1,1]){
    ellipsoid(side*.298,4.64,-.005,.055,.095,.05,skin);
    ellipsoid(side*.12,4.73,.248,.067,.031,.026,eyeWhite);
    ellipsoid(side*.12,4.728,.271,.025,.025,.009,iris);
    line([[side*.065,4.79,.25],[side*.12,4.805,.255],[side*.18,4.786,.236]],hair,.011);
    line([[side*.062,4.746,.255],[side*.12,4.76,.273],[side*.18,4.744,.25]],skin,.009);
    const collar=mesh(new THREE.BoxGeometry(.15,.24,.035),shirt,side*.13,4.01,.16);collar.rotation.z=side*.35;collar.rotation.x=.3;
  }
  ellipsoid(0,4.65,.285,.047,.10,.055,skin);ellipsoid(0,4.59,.323,.058,.043,.049,skin);
  line([[-.073,4.484,.263],[0,4.477,.286],[.073,4.484,.263]],lip,.009);
  line([[-.055,4.46,.26],[0,4.451,.273],[.055,4.46,.26]],skin,.011);
  line([[0,2.84,.257],[0,3.35,.271],[0,3.95,.19]],seam,.006);
  for(let y=2.98;y<3.94;y+=.2)ellipsoid(.02,y,.269,.012,.012,.008,mat(0xd4d3bf));
  const belt=mesh(new THREE.TorusGeometry(.393,.027,8,40),mat(0x51443a),0,2.79,0);belt.rotation.x=Math.PI/2;belt.scale.y=.65;
  mesh(new THREE.BoxGeometry(.11,.075,.035),mat(0x9c998b,.3),0,2.79,.27);
  for(const side of [-1,1]){
    const leg=new THREE.Group();leg.position.set(side*.235,2.62,0);group.add(leg);
    cylinder(.21,.16,1.17,pants,0,-.54,0,leg);
    const knee=new THREE.Group();knee.position.y=-1.12;leg.add(knee);ellipsoid(0,0,0,.16,.17,.16,pants,knee);
    cylinder(.158,.115,1.14,pants,0,-.55,0,knee);
    ellipsoid(0,-1.13,.12,.17,.14,.33,shoe,knee);
    const sole=ellipsoid(0,-1.22,.14,.175,.045,.33,mat(0x252925),knee);
    line([[-.12,-1.10,.08],[0,-1.08,.1],[.12,-1.10,.08]],seam,.008,knee);
    const arm=new THREE.Group();arm.position.set(side*.48,3.86,0);group.add(arm);ellipsoid(0,-.04,0,.205,.235,.205,shirt,arm);
    cylinder(.18,.125,.87,shirt,0,-.43,0,arm);
    const elbow=new THREE.Group();elbow.position.y=-.87;arm.add(elbow);ellipsoid(0,0,0,.13,.15,.13,shirt,elbow);
    cylinder(.13,.09,.79,shirt,0,-.37,0,elbow);cylinder(.10,.10,.075,shirt,0,-.77,0,elbow);
    ellipsoid(0,-.89,.015,.095,.14,.05,skin,elbow);
    for(let f=0;f<4;f++)ellipsoid(-.058+f*.039,-1.015,.025,.021,.09-(f===3?.025:0),.024,skin,elbow);
    ellipsoid(side*.09,-.91,.06,.035,.074,.037,skin,elbow);
    if(side===1&&index%2===0)cylinder(.105,.105,.06,mat(0x7a817e,.25),0,-.79,0,elbow);
    limbs.push({leg,knee,arm,elbow,side});
  }
  group.scale.setScalar(1.08+(index%3)*.025);group.position.y=-3.43;
  return {group,limbs,index};
}
