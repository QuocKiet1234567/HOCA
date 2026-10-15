import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './style.css';
import './office-ui.css';
import { createOffice } from './office.js';
import { texture, causticMaterial } from './materials.js';
import { createFish } from './fish.js';
import { SPECIES, speciesById } from './species.js';
import { createMusic } from './music.js';
import { LIGHTING } from './lighting.js';
import './aquarium-controls.css';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';


const $ = id => document.getElementById(id);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8d9d9a);
scene.fog = new THREE.FogExp2(0x8d9d9a, .003);
const renderer = new THREE.WebGLRenderer({canvas:$('scene'),antialias:true,alpha:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.22;
const pmrem=new THREE.PMREMGenerator(renderer);const reflectionRoom=new RoomEnvironment();
scene.environment=pmrem.fromScene(reflectionRoom,.04).texture;scene.environmentIntensity=.4;reflectionRoom.dispose();pmrem.dispose();
const office=createOffice(scene);
const waterTime={value:0};
const camera=new THREE.PerspectiveCamera(37,1,.1,100);
const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;controls.minDistance=10;controls.maxDistance=32;controls.maxPolarAngle=1.64;controls.minPolarAngle=1.34;controls.minAzimuthAngle=-Infinity;controls.maxAzimuthAngle=Infinity;controls.enablePan=false;
function resetView(){camera.position.set(7,5.1,window.innerWidth<800?25:17);controls.target.set(0,2,0);controls.update()}
resetView();
const ambient=new THREE.HemisphereLight(0xe6f0ef,0x746b54,1.5);scene.add(ambient);
const sun=new THREE.DirectionalLight(0xfff4d7,2.6);sun.position.set(-8,11,-9);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-.0003;sun.shadow.normalBias=.025;Object.assign(sun.shadow.camera,{left:-22,right:22,top:18,bottom:-18});scene.add(sun);
const aquaLight=new THREE.PointLight(0x63eacb,28,16);aquaLight.position.set(2,4,-2);scene.add(aquaLight);
// Aquarium-only lights keep the fish readable without illuminating the office.
const tankFill=new THREE.DirectionalLight(0xf4fbff,2.1);tankFill.position.set(2,4,8);tankFill.layers.set(1);scene.add(tankFill);
aquaLight.layers.set(1);ambient.layers.enable(1);camera.layers.enable(1);
const mat=(color,roughness=.65)=>new THREE.MeshStandardMaterial({color,roughness});
function mesh(geo,material,x=0,y=0,z=0,parent=scene){const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.layers.set(1);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
const tank=new THREE.Group();scene.add(tank);
mesh(new THREE.BoxGeometry(10.6,.3,5.9),mat(0x142c2c,.3),0,-.17,0,tank);
mesh(new THREE.BoxGeometry(10.2,.22,5.5),mat(0x8d9880),0,.02,0,tank);
const glass=new THREE.MeshPhysicalMaterial({color:0xf2fff8,transmission:.96,thickness:.045,ior:1.46,transparent:true,opacity:1,roughness:.035,metalness:0,clearcoat:1,envMapIntensity:.8,side:THREE.DoubleSide,depthWrite:false});
mesh(new THREE.BoxGeometry(10.4,5.4,.035),glass,0,2.65,-2.8,tank);
mesh(new THREE.BoxGeometry(.035,5.4,5.6),glass,-5.2,2.65,0,tank);
mesh(new THREE.BoxGeometry(.035,5.4,5.6),glass,5.2,2.65,0,tank);
const clearFront=new THREE.MeshPhysicalMaterial({color:0xffffff,transparent:true,opacity:.025,roughness:.025,metalness:0,clearcoat:.25,envMapIntensity:.12,side:THREE.DoubleSide,depthWrite:false});
const frontGlass=mesh(new THREE.PlaneGeometry(10.4,5.4),clearFront,0,2.65,2.8,tank);frontGlass.castShadow=false;
for(const child of tank.children)if(child.material===glass)child.castShadow=false;
const rimMaterial=mat(0x303c38,.28);
for(const z of [-2.83,2.83])mesh(new THREE.BoxGeometry(10.55,.08,.07),rimMaterial,0,5.36,z,tank);
for(const x of [-5.23,5.23])mesh(new THREE.BoxGeometry(.07,.08,5.6),rimMaterial,x,5.36,0,tank);
mesh(new THREE.BoxGeometry(8.2,.10,.52),mat(0x323c39,.3),0,5.95,-.3,tank);
const led=mesh(new THREE.PlaneGeometry(7.9,.4),new THREE.MeshBasicMaterial({color:0xe8ffe4}),0,5.89,-.3,tank);led.rotation.x=Math.PI/2;
const tankLamp=new THREE.SpotLight(0xe4ffdf,90,14,Math.PI*.44,.65,1.5);tankLamp.position.set(0,5.8,0);tankLamp.target.position.set(0,0,0);scene.add(tankLamp,tankLamp.target);
tankLamp.layers.set(1);
const edgeMat=new THREE.LineBasicMaterial({color:0xb6e7d5,transparent:true,opacity:.25});
const edges=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(10.4,5.4,5.6)),edgeMat);edges.position.y=2.65;tank.add(edges);
const waterGeo=new THREE.PlaneGeometry(10.35,5.55,44,24);
const water=mesh(waterGeo,new THREE.MeshPhysicalMaterial({color:0xc6e2d9,transparent:true,opacity:.08,roughness:.08,metalness:.05,clearcoat:.5,envMapIntensity:.35,side:THREE.DoubleSide,depthWrite:false}),0,5.23,0,tank);water.rotation.x=-Math.PI/2;water.castShadow=false;
const sandMap=texture('sand',['#b9aa87','#d2c19c','#897d64','#c8b99a']);sandMap.repeat.set(4,3);
const stoneMap=texture('stone',['#6e756b','#8c8f7c','#515e58','#b0aa91']);
// A gently undulating sand bed, with a seeded layout for a consistent aquarium.
let seed=391;function rand(){seed=(seed*16807)%2147483647;return(seed-1)/2147483646}function range(a,b){return a+rand()*(b-a)}
const sandGeo=new THREE.PlaneGeometry(10.15,5.45,65,35);sandGeo.rotateX(-Math.PI/2);
const sandPos=sandGeo.attributes.position;for(let i=0;i<sandPos.count;i++){const x=sandPos.getX(i),z=sandPos.getZ(i);sandPos.setY(i,.16+.07*Math.sin(x*2+z)+.16*Math.max(0,-z)/3)}sandGeo.computeVertexNormals();mesh(sandGeo,causticMaterial(new THREE.MeshStandardMaterial({map:sandMap,bumpMap:sandMap,bumpScale:.035,roughness:.95}),waterTime),0,0,0,tank);
const pebbleGeo=new THREE.IcosahedronGeometry(1,1),stoneMats=[mat(0x6e8074),mat(0x8c9480),mat(0x536e65),mat(0xc2b99b)];
for(let i=0;i<200;i++){const s=range(.025,.10);const p=mesh(pebbleGeo,stoneMats[i%4],range(-5,5),.2,range(-2.65,2.65),tank);p.scale.set(s*1.4,s*.55,s)}
for(const [x,y,z,s] of [[-2.5,.75,-.9,1.3],[-1.3,.5,-1.4,.9],[3.4,.65,-1.3,1.1],[2.8,.35,-.4,.65],[-3.5,.4,.4,.6]]){const geo=new THREE.IcosahedronGeometry(s,3);const p=geo.attributes.position;for(let i=0;i<p.count;i++){const vx=p.getX(i),vy=p.getY(i),vz=p.getZ(i);const f=1+.09*Math.sin(vx*8+vz*3)*Math.cos(vy*6);p.setXYZ(i,vx*f,vy*f,vz*f)}geo.computeVertexNormals();const rock=mesh(geo,causticMaterial(new THREE.MeshStandardMaterial({map:stoneMap,bumpMap:stoneMap,bumpScale:.06,roughness:.9}),waterTime),x,y,z,tank);rock.scale.set(1,.9,.7);rock.rotation.set(.2,x,.3)}
const plantGroup=new THREE.Group();tank.add(plantGroup);const plants=[];
const greens=[0x39754a,0x56984a,0x77a858,0x2c6c50,0x9cb65f];
for(let i=0;i<85;i++){const x=range(-4.8,4.8),z=i<65?range(-2.5,-1.2):range(-2.2,2);if(Math.abs(x)<1.8&&z>-.8)continue;const h=range(.65,2.9);const g=new THREE.Group();g.position.set(x,.24,z);g.rotation.y=range(0,6);plantGroup.add(g);plants.push(g);const color=greens[i%greens.length];for(let j=0;j<5;j++){const leafGeo=new THREE.PlaneGeometry(range(.12,.32),h*(.7+j*.07),1,10);const pos=leafGeo.attributes.position;for(let k=0;k<pos.count;k++){const yy=pos.getY(k)+h*(.7+j*.07)/2;pos.setY(k,yy);pos.setZ(k,Math.sin(yy/h*2)*.26);pos.setX(k,pos.getX(k)*(Math.sin(yy/h*Math.PI)*.8+.2))}leafGeo.computeVertexNormals();const leaf=mesh(leafGeo,new THREE.MeshStandardMaterial({color,side:THREE.DoubleSide,roughness:.7}),0,0,0,g);leaf.rotation.y=j*2.4;leaf.rotation.z=(j-2)*.13}}
// Driftwood branches, reaching naturally across the planted bed.
const wood=mat(0x534e36);function branch(a,b,r){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),d=end.clone().sub(start);const m=mesh(new THREE.CylinderGeometry(r*.45,r,d.length(),9),wood,...start.clone().add(end).multiplyScalar(.5).toArray(),tank);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize())}
branch([-3,.3,-.7],[.6,1.3,-1.1],.22);branch([-1.4,.85,-.9],[-.3,2.7,-1.5],.14);branch([-.5,1.5,-1.2],[1.1,2.2,-1.4],.09);branch([-2.5,.4,-.7],[-3.1,1.8,-1.3],.13);
const fishes=[];
function updateFishCount(){$('fish-count').textContent=fishes.length;if($('remove-fish'))$('remove-fish').disabled=fishes.length===0}
function makeFish(speciesId){if(fishes.length>=24){toast('Hồ đã đủ 24 người bạn rồi!');return false}const fish=createFish(fishes.length,speciesId);fish.group.traverse(o=>o.layers.set(1));tank.add(fish.group);fishes.push(fish);updateFishCount();save();return true}
function removeFish(){const fish=fishes.pop();if(!fish)return;const geometries=new Set(),materials=new Set(),textures=new Set();tank.remove(fish.group);fish.group.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material)});for(const m of materials)for(const value of Object.values(m))if(value?.isTexture)textures.add(value);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());updateFishCount();save();toast(`Đã bớt một chú cá. Trong hồ còn ${fishes.length} chú.`)}
function save(){try{localStorage.setItem('aqua-save',JSON.stringify({count:fishes.length,species:fishes.map(f=>f.speciesId),night,plants:plantGroup.visible}))}catch{}}
let night=false;let tankBrightness=1;try{const stored=Number(localStorage.getItem('aqua-brightness'));if(Number.isFinite(stored)&&stored>0)tankBrightness=THREE.MathUtils.clamp(stored,.5,1.4)}catch{}let saved;try{saved=JSON.parse(localStorage.getItem('aqua-save'))}catch{}const initialFishCount=Number.isInteger(saved?.count)?THREE.MathUtils.clamp(saved.count,0,24):8;for(let i=0;i<initialFishCount;i++)makeFish(Array.isArray(saved?.species)?saved.species[i]:undefined);updateFishCount();
const bubbles=[];const bubblemat=new THREE.MeshPhysicalMaterial({color:0xb9efe5,transparent:true,opacity:.26,roughness:0,metalness:.35});for(let i=0;i<35;i++){const b=mesh(new THREE.SphereGeometry(range(.015,.05),8,8),bubblemat,range(-4.8,4.8),range(.3,5.1),range(-2.5,2.5),tank);bubbles.push(b)}
// Subtle suspended particles give the water a sense of depth.
const dustGeo=new THREE.BufferGeometry();const dust=[];for(let i=0;i<200;i++)dust.push(range(-5,5),range(.3,5),range(-2.6,2.6));dustGeo.setAttribute('position',new THREE.Float32BufferAttribute(dust,3));tank.add(new THREE.Points(dustGeo,new THREE.PointsMaterial({color:0xd6ead5,size:.018,transparent:true,opacity:.4})));
const food=[];let feedingUntil=0,lastFeed=-20;const startedAt=performance.now();const timer={getElapsedTime:()=>(performance.now()-startedAt)/1000};let toastTimeout;
function toast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>$('toast').classList.remove('show'),3200)}
function feed(){const now=timer.getElapsedTime();if(now-lastFeed<9){toast('Các bạn nhỏ đang ăn, chờ một chút nhé.');return}lastFeed=now;feedingUntil=now+12;for(let i=0;i<24;i++){const p=mesh(new THREE.SphereGeometry(.027,6,6),mat(0xb38447),range(-1,1),range(4.8,5.1),range(-.7,.7),tank);food.push(p)}toast('Đến giờ ăn rồi! Nhìn các bạn nhỏ bơi lại nào.');$('health').textContent='Đang thưởng thức';setTimeout(()=>$('health').textContent='Đang rất tốt',12000)}
$('feed').onclick=feed;
function setLight(value){night=value;const p=night?LIGHTING.night:LIGHTING.day;office.setNight(value);$('app').classList.toggle('night-mode',night);$('light-label').textContent=night?'Đêm · văn phòng dịu':'Ngày · sáng dịu';$('light').setAttribute('aria-pressed',night);ambient.intensity=p.ambient;sun.intensity=p.sun;aquaLight.color.set(0xe1f0ec);aquaLight.intensity=p.aqua*tankBrightness;tankFill.intensity=p.tankFill*tankBrightness;tankLamp.color.set(0xeaf3e7);tankLamp.intensity=p.lamp*tankBrightness;renderer.toneMappingExposure=p.exposure;scene.environmentIntensity=p.environment;glass.envMapIntensity=p.glassReflection;scene.background.set(p.background);scene.fog.color.copy(scene.background);scene.fog.density=p.fog;save()}
$('light').onclick=()=>setLight(!night);$('plants').onclick=()=>{plantGroup.visible=!plantGroup.visible;$('plant-label').textContent=plantGroup.visible?'Đang hiển thị':'Đang ẩn';save()};if(saved?.plants===false){plantGroup.visible=false;$('plant-label').textContent='Đang ẩn'}setLight(saved?.night===true);
$('reset').onclick=()=>{resetView();toast('Đã trở về góc nhìn ban đầu.')};$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('app').requestFullscreen()}catch{toast('Trình duyệt chưa hỗ trợ chế độ toàn màn hình.')}};
$('capture').onclick=()=>{renderer.render(scene,camera);const a=document.createElement('a');a.download='AQUA-khoanh-khac.png';a.href=renderer.domElement.toDataURL('image/png');a.click();toast('Đã lưu ảnh hồ cá của bạn.')};
function setupAudio(){
  const music=createMusic();
  const panel=document.createElement('section');panel.className='music-panel';panel.hidden=true;
  panel.innerHTML='<div class="panel-heading"><div><small>ÂM NHẠC THƯ GIÃN</small><h2>Trong veo giữa ngày.</h2></div><button id="close-music" aria-label="Đóng bảng nhạc">×</button></div><p>Giai điệu phím nhẹ, chuông ngân và không gian stereo.</p><button id="music-play" class="panel-primary">Phát nhạc ♫</button><label for="music-volume">Âm lượng</label><input id="music-volume" type="range" min="0" max="100" value="65"><label class="water-option"><input id="water-sound" type="checkbox" checked> Thêm tiếng nước thật nhẹ</label><small>Nhạc tổng hợp tại chỗ, không cần mạng.</small>';
  $('app').append(panel);
  $('sound').title='Nhạc thư giãn';$('sound').setAttribute('aria-label','Mở nhạc thư giãn');$('sound').setAttribute('aria-expanded','false');
  $('sound').onclick=()=>{panel.hidden=!panel.hidden;$('sound').setAttribute('aria-expanded',!panel.hidden)};
  $('close-music').onclick=()=>{panel.hidden=true;$('sound').setAttribute('aria-expanded','false')};
  $('music-play').onclick=async()=>{try{const on=await music.toggle();music.volume(Number($('music-volume').value)/100);music.setWater($('water-sound').checked);$('music-play').textContent=on?'Tạm tắt nhạc Ⅱ':'Phát nhạc ♫';$('music-play').setAttribute('aria-pressed',on);$('sound').style.color=on?'#d1edbc':''}catch{toast('Không bật được âm thanh. Hãy thử lại trên trình duyệt hỗ trợ Web Audio.')}};
  $('music-volume').oninput=e=>music.volume(Number(e.target.value)/100);$('water-sound').onchange=e=>music.setWater(e.target.checked);
  window.addEventListener('pagehide',()=>music.dispose(),{once:true});
}
setupAudio();
window.addEventListener('keydown',e=>{if(e.code==='KeyF'&&!e.repeat&&!/INPUT|TEXTAREA/.test(e.target.tagName))$('feed').click()});
function resize(){const w=$('app').clientWidth,h=$('app').clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.fov=w<800?53:43;camera.updateProjectionMatrix()}window.addEventListener('resize',resize);resize();
let lastFrame=0;
function animate(){
  requestAnimationFrame(animate);const t=timer.getElapsedTime();const dt=Math.min(.05,t-lastFrame);lastFrame=t;
  const blend=1-Math.exp(-2.4*dt);controls.update(dt);office.update(t);waterTime.value=t;
  for(const fish of fishes){
    const angle=t*fish.speed+fish.phase;
    const target=new THREE.Vector3(Math.cos(angle)*fish.radius,fish.height+Math.sin(t*.55+fish.phase)*.32,Math.sin(angle)*fish.depth);
    if(t<feedingUntil){target.x*=.35;target.z*=.4;target.y=3.9+Math.sin(t+fish.phase)*.35}
    const old=fish.group.position.clone();fish.group.position.lerp(target,blend);
    const direction=fish.group.position.clone().sub(old);
    if(direction.lengthSq()>.0000001){const yaw=Math.atan2(-direction.z,direction.x);let delta=yaw-fish.group.rotation.y;delta=Math.atan2(Math.sin(delta),Math.cos(delta));fish.group.rotation.y+=delta*(1-Math.exp(-4*dt));fish.group.rotation.z=THREE.MathUtils.lerp(fish.group.rotation.z,Math.atan2(direction.y,Math.hypot(direction.x,direction.z))*.6,blend)}
    fish.swim.value=t*(7+fish.speed*5)+fish.phase;
    const beat=Math.sin(fish.swim.value);fish.tail.rotation.y=beat*.32;
    for(let i=0;i<fish.fins.length;i++)fish.fins[i].rotation.y=(i===0?-.6:.6)+Math.sin(t*5+fish.phase)*.22;
  }
  for(let i=0;i<plants.length;i++)plants[i].rotation.z=Math.sin(t*.65+i)*.028;
  for(const b of bubbles){b.position.y+=dt*.4;b.position.x+=Math.sin(t+b.position.y)*dt*.04;if(b.position.y>5.2)b.position.y=.3}
  for(let i=food.length-1;i>=0;i--){food[i].position.y-=dt*.25;if(food[i].position.y<3.5||t>feedingUntil){tank.remove(food[i]);food[i].geometry.dispose();food[i].material.dispose();food.splice(i,1)}}
  const wp=waterGeo.attributes.position;for(let i=0;i<wp.count;i++)wp.setZ(i,Math.sin(wp.getX(i)*3+t)*Math.cos(wp.getY(i)*3+t*.7)*.018);wp.needsUpdate=true;waterGeo.computeVertexNormals();renderer.render(scene,camera);
}
setInterval(()=>$('clock').textContent=new Date().toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}),1000);
tank.traverse(object=>object.layers.set(1));
animate();$('loading').classList.add('hidden');

const officeTools=document.createElement('div');officeTools.className='office-tools';
officeTools.innerHTML='<button id="camera-mode" aria-pressed="false">◎ <span>Ngắm gần hồ</span></button><button id="people-motion" aria-pressed="true"><i class="walk-status"></i><span>Văn phòng đang hoạt động</span></button><button id="immersive-mode" aria-pressed="false">⛶ <span>Ẩn thông tin</span></button>';
document.querySelector('main').append(officeTools);
let closeView=false,peopleMoving=true,immersive=false;
$('camera-mode').onclick=()=>{closeView=!closeView;if(closeView){camera.position.set(7,4.5,13);controls.target.set(0,2.2,0)}else{camera.position.set(16,9,28);controls.target.set(0,1,-6)}controls.update();$('camera-mode').setAttribute('aria-pressed',closeView);$('camera-mode').querySelector('span').textContent=closeView?'Xem toàn văn phòng':'Ngắm gần hồ'};
$('people-motion').onclick=()=>{peopleMoving=!peopleMoving;office.setMoving(peopleMoving);$('people-motion').setAttribute('aria-pressed',peopleMoving);$('people-motion').querySelector('span').textContent=peopleMoving?'Văn phòng đang hoạt động':'Tiếp tục người đi lại'};
function setImmersive(value){immersive=value;$('app').classList.toggle('office-immersive',immersive);$('immersive-mode').setAttribute('aria-pressed',immersive);document.querySelector('header').inert=immersive;document.querySelector('main').inert=immersive;if(immersive){document.querySelectorAll('.species-panel,.music-panel').forEach(panel=>panel.hidden=true);$('add').setAttribute('aria-expanded','false');$('sound').setAttribute('aria-expanded','false');$('restore-interface').focus()}else $('immersive-mode').focus()}
$('immersive-mode').querySelector('span').textContent='Ẩn toàn bộ giao diện';$('immersive-mode').onclick=()=>setImmersive(true);
const restoreInterface=document.createElement('button');restoreInterface.id='restore-interface';restoreInterface.className='restore-interface';restoreInterface.textContent='☷ Hiện điều khiển';restoreInterface.title='Hiện lại giao diện (Esc hoặc H)';restoreInterface.onclick=()=>setImmersive(false);$('app').append(restoreInterface);
window.addEventListener('keydown',event=>{if(event.repeat||/INPUT|TEXTAREA|SELECT/.test(event.target.tagName)||event.target.isContentEditable)return;if(event.code==='KeyH'){event.preventDefault();setImmersive(!immersive)}else if(event.code==='Escape'&&immersive)setImmersive(false)});
const brightnessControl=document.createElement('label');brightnessControl.className='brightness-control';brightnessControl.htmlFor='tank-brightness';brightnessControl.innerHTML='Độ sáng hồ <output id="brightness-value"></output><input id="tank-brightness" type="range" min="50" max="140" step="5" aria-label="Độ sáng riêng của hồ cá">';officeTools.append(brightnessControl);$('tank-brightness').value=Math.round(tankBrightness*100);$('brightness-value').textContent=$('tank-brightness').value+'%';$('tank-brightness').oninput=e=>{tankBrightness=Number(e.target.value)/100;$('brightness-value').textContent=e.target.value+'%';setLight(night);try{localStorage.setItem('aqua-brightness',tankBrightness)}catch{}};
const orbitButton=document.createElement('button');orbitButton.id='auto-orbit';orbitButton.textContent='↻ Tự xoay 360°';orbitButton.setAttribute('aria-pressed','false');officeTools.insertBefore(orbitButton,brightnessControl);controls.autoRotateSpeed=.45;orbitButton.onclick=()=>{controls.autoRotate=!controls.autoRotate;orbitButton.setAttribute('aria-pressed',controls.autoRotate);orbitButton.textContent=controls.autoRotate?'Ⅱ Dừng tự xoay':'↻ Tự xoay 360°'};
document.querySelector('.hint small').textContent='Kéo để xoay 360° · Cuộn để phóng to';
document.querySelector('.eyebrow').textContent='MỘT KHOẢNG NGHỈ GIỮA NGÀY LÀM VIỆC';
document.querySelector('h1').innerHTML='Ban Quản lý dự án<br><em>phường Bình tân</em>';
document.querySelector('.intro p').textContent='Ngắm cá bơi, nghe tiếng nước và nghỉ tay một chút.';

const speciesPanel=document.createElement('section');speciesPanel.className='species-panel';speciesPanel.hidden=true;
speciesPanel.innerHTML='<div class="panel-heading"><div><small>CHỌN NGƯỜI BẠN MỚI</small><h2>Một thế giới dưới nước.</h2></div><button id="close-species" aria-label="Đóng bảng chọn cá">×</button></div><p>Mỗi loài có dáng thân, vây và nhịp bơi riêng.</p><div id="species-grid"></div><div class="species-bottom"><span id="species-selected">Cá vàng</span><button id="release-fish" class="panel-primary">Thả vào hồ +</button></div><small>Hồ mô phỏng tự do · tối đa 24 cá. Không dùng phối loài này làm hướng dẫn nuôi cá thật.</small>';
$('app').append(speciesPanel);let selectedSpecies=SPECIES[0].id;
for(const species of SPECIES){const button=document.createElement('button');button.className='species-card';button.type='button';button.setAttribute('aria-pressed',species.id===selectedSpecies);const icon=document.createElement('span');icon.className='fish-symbol '+species.id;icon.style.setProperty('--fish-color',species.colors[1]);icon.textContent='';const name=document.createElement('strong');name.textContent=species.name;const desc=document.createElement('small');desc.textContent=species.description;button.append(icon,name,desc);button.onclick=()=>{selectedSpecies=species.id;for(const b of $('species-grid').children)b.setAttribute('aria-pressed',b===button);$('species-selected').textContent=species.name};$('species-grid').append(button)}
$('add').setAttribute('aria-expanded','false');$('add').onclick=()=>{speciesPanel.hidden=!speciesPanel.hidden;$('add').setAttribute('aria-expanded',!speciesPanel.hidden)};
$('close-species').onclick=()=>{speciesPanel.hidden=true;$('add').setAttribute('aria-expanded','false')};
$('release-fish').onclick=()=>{if(makeFish(selectedSpecies))toast(`Đã thả một chú ${speciesById(selectedSpecies).name.toLowerCase()} vào hồ.`)};
const removeButton=document.createElement('button');removeButton.id='remove-fish';removeButton.title='Bớt một chú cá khỏi hồ';removeButton.innerHTML='<span>−</span><div>Bớt cá<small>Giảm một chú cá</small></div>';removeButton.onclick=removeFish;$('add').after(removeButton);updateFishCount();
