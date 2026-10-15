// Original procedural ambient score. Everything is synthesized locally.
export function createMusic() {
  let context, master, music, water, compressor, timer, nextTime=0, step=0, enabled=false;
  const notes=[72,76,79,83,79,76,74,79,71,74,78,81,78,74,69,74,69,72,76,79,76,72,67,72,67,71,74,79,74,71,69,74];
  const chords=[[48,55,60,64],[47,54,59,62],[45,52,57,60],[43,50,55,59]];
  const hz=n=>440*2**((n-69)/12);
  function tone(note,time,duration,volume,pad=false){
    const envelope=context.createGain();envelope.gain.setValueAtTime(0,time);envelope.gain.linearRampToValueAtTime(volume,time+(pad?.9:.012));envelope.gain.exponentialRampToValueAtTime(.0001,time+duration);
    const pan=context.createStereoPanner();pan.pan.value=Math.sin(note*1.7)*.38;envelope.connect(pan).connect(music);
    for(const [multiple,level] of (pad?[[1,.6],[2,.13]]:[[1,.75],[2,.13],[3,.035]])){
      const osc=context.createOscillator(),gain=context.createGain();osc.type='sine';osc.frequency.value=hz(note)*multiple;gain.gain.value=level;osc.connect(gain).connect(envelope);osc.start(time);osc.stop(time+duration+.05);osc.onended=()=>{osc.disconnect();gain.disconnect()};
    }
    setTimeout(()=>{envelope.disconnect();pan.disconnect()},Math.max(0,(time-context.currentTime+duration+.2)*1000));
  }
  function schedule(){
    if(nextTime<context.currentTime-.3)nextTime=context.currentTime+.05;
    while(nextTime<context.currentTime+.25){const position=step%32;if(step%8===0)for(const n of chords[Math.floor(position/8)])tone(n,nextTime,7,.035,true);if(step%2===0||position%8===5)tone(notes[position],nextTime,3.8,.15);if(step%4===2)tone(notes[position]-12,nextTime+.13,2.8,.045);nextTime+=.72;step++}
  }
  async function init(){
    context=new AudioContext();master=context.createGain();master.gain.value=0;music=context.createGain();water=context.createGain();music.gain.value=.7;water.gain.value=.025;
    compressor=context.createDynamicsCompressor();compressor.threshold.value=-17;compressor.ratio.value=3;compressor.attack.value=.01;compressor.release.value=.3;
    music.connect(compressor);water.connect(compressor);compressor.connect(master).connect(context.destination);
    const delay=context.createDelay(2),feedback=context.createGain(),wet=context.createGain(),filter=context.createBiquadFilter();delay.delayTime.value=.432;feedback.gain.value=.24;wet.gain.value=.23;filter.type='lowpass';filter.frequency.value=3600;music.connect(delay).connect(filter).connect(wet).connect(compressor);filter.connect(feedback).connect(delay);
    const reverb=context.createConvolver();const impulse=context.createBuffer(2,context.sampleRate*2.8,context.sampleRate);for(let c=0;c<2;c++){const data=impulse.getChannelData(c);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/data.length,3)*.45}reverb.buffer=impulse;const reverbGain=context.createGain();reverbGain.gain.value=.18;music.connect(reverb).connect(reverbGain).connect(compressor);
    const buffer=context.createBuffer(2,context.sampleRate*6,context.sampleRate);for(let c=0;c<2;c++){const data=buffer.getChannelData(c);let smooth=0;for(let i=0;i<data.length;i++){smooth=(smooth+(Math.random()*2-1)*.05)/1.025;data[i]=smooth}}
    const source=context.createBufferSource();source.buffer=buffer;source.loop=true;const lowpass=context.createBiquadFilter();lowpass.type='lowpass';lowpass.frequency.value=1400;source.connect(lowpass).connect(water);source.start();
    nextTime=context.currentTime+.1;
    timer=setInterval(()=>{if(context.state==='running')schedule()},100);
  }
  return {
    async toggle(){if(!context)await init();await context.resume();enabled=!enabled;master.gain.setTargetAtTime(enabled?.65:0,context.currentTime,.45);return enabled},
    volume(value){if(master)master.gain.setTargetAtTime(enabled?value*.85:0,context.currentTime,.12)},
    setWater(value){if(water)water.gain.setTargetAtTime(value?.025:0,context.currentTime,.2)},
    get enabled(){return enabled},
    dispose(){clearInterval(timer);context?.close()}
  };
}
