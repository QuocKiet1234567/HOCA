import * as THREE from 'three';

// Repeatable, local textures: no external asset requests.
export function texture(kind, colors, size = 512) {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
  const c = canvas.getContext('2d'); let seed = 791;
  const random = () => { seed = seed * 16807 % 2147483647; return (seed - 1) / 2147483646; };
  c.fillStyle = colors[0]; c.fillRect(0, 0, size, size);
  if (kind === 'wood') {
    for (let i = 0; i < 2300; i++) { c.strokeStyle = colors[1]; c.globalAlpha = random() * .22; c.lineWidth = random() * 2 + .3; const y = random() * size; c.beginPath(); c.moveTo(0, y); c.bezierCurveTo(size * .3, y + random() * 12, size * .6, y - random() * 12, size, y); c.stroke(); }
    c.globalAlpha = .25; c.fillStyle = '#33261b'; for (let y = 0; y < size; y += size / 5) c.fillRect(0, y, size, 1);
  } else {
    for (let i = 0; i < 39000; i++) { c.globalAlpha = random() * .5; c.fillStyle = colors[Math.floor(random() * colors.length)]; const r = kind === 'stone' ? random() * 6 : random() * 1.5; c.fillRect(random() * size, random() * size, r + .5, r + .5); }
    if (kind === 'stone') { for (let i = 0; i < 24; i++) { c.globalAlpha = .14; c.strokeStyle = '#c2c2a6'; c.lineWidth = random() * 3; c.beginPath(); c.moveTo(random() * size, 0); c.lineTo(random() * size, size); c.stroke(); } }
  }
  const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace; map.wrapS = map.wrapT = THREE.RepeatWrapping; map.anisotropy = 4; return map;
}

export function fishTexture(index, species) {
  const palettes = [['#e9dab5','#d97f31','#a74322'],['#eee8d7','#b9b5a2','#4c514b'],['#b3d5c0','#438a8a','#214647'],['#d9bd73','#bb783d','#764b35']];
  const p = species?.colors || palettes[index % 4]; const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 256; const c = canvas.getContext('2d');
  const gradient = c.createLinearGradient(0,0,0,256); gradient.addColorStop(0,p[2]); gradient.addColorStop(.35,p[1]); gradient.addColorStop(.65,p[0]); gradient.addColorStop(1,'#f3e7ca'); c.fillStyle=gradient;c.fillRect(0,0,512,256);
  c.strokeStyle='#fff7db';c.lineWidth=.7;c.globalAlpha=.22;
  for(let y=12;y<250;y+=11)for(let x=0;x<525;x+=13){c.beginPath();c.arc(x+(y%22?6:0),y,7,-1.1,1.1);c.stroke()}
  c.globalAlpha=.65;
  if(index%4===1){c.fillStyle='#343d3b';for(let x=55;x<512;x+=91){c.beginPath();c.ellipse(x,82,12,84,.12,0,Math.PI*2);c.fill()}}
  if(index%4===2){c.fillStyle='#97dfd9';c.fillRect(0,109,512,11);c.fillStyle='#c26348';c.fillRect(200,135,312,14)}
  if(index%4===0){c.fillStyle='#f5ebd2';for(const [x,y,r] of [[74,92,32],[235,72,29],[386,106,35]]){c.beginPath();c.ellipse(x,y,r,r*.8,.3,0,Math.PI*2);c.fill()}}
  c.globalAlpha=.85;
  if(species?.id==='neon'){c.fillStyle='#43e8e1';c.fillRect(0,104,512,15);c.fillStyle='#c94436';c.fillRect(235,126,277,22)}
  if(species?.id==='angelfish'){c.fillStyle='#3c433c';for(let x=52;x<512;x+=114){c.beginPath();c.ellipse(x,105,13,110,.12,0,Math.PI*2);c.fill()}}
  if(species?.id==='koi'){c.fillStyle='#bc432d';for(const [x,y,r] of [[95,80,42],[280,105,38],[430,72,47]]){c.beginPath();c.ellipse(x,y,r,r*.85,.3,0,Math.PI*2);c.fill()}}
  if(species?.id==='discus'){c.strokeStyle='#b1dfcb';c.lineWidth=3;c.globalAlpha=.7;for(let y=15;y<250;y+=12){c.beginPath();for(let x=0;x<515;x+=4){const yy=y+Math.sin(x*.07+y)*7;if(x===0)c.moveTo(x,yy);else c.lineTo(x,yy)}c.stroke()}}
  if(species?.id==='cory'){c.fillStyle='#514b40';for(let i=0;i<65;i++){c.beginPath();c.ellipse((i*79)%512,40+(i*37)%170,4+(i%3),3,0,0,Math.PI*2);c.fill()}}
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;return map;
}

export function causticMaterial(material, clock) {
  material.onBeforeCompile = shader => {
    shader.uniforms.waterTime = clock;
    shader.vertexShader = 'varying vec3 vWaterWorld;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWaterWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    shader.fragmentShader = 'uniform float waterTime; varying vec3 vWaterWorld;\n' + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
      vec2 p = vWaterWorld.xz * 3.4;
      float a = sin(p.x + sin(p.y*1.7 + waterTime*.6)) * cos(p.y + sin(p.x*1.2-waterTime*.4));
      float b = sin(p.x*1.9 - waterTime*.5) * cos(p.y*1.3+waterTime*.3);
      float ripple = pow(max(0.0, 1.0-abs(a+b)*2.3), 9.0);
      diffuseColor.rgb *= .92 + ripple*.42;`);
  };
  return material;
}
