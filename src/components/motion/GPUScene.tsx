import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { AdditiveBlending, Color, type Group } from 'three';
import gsap from 'gsap';

export interface SceneControls {
  mode: number;
  pulse: number;
  scroll: number;
  pointer: { x: number; y: number };
  frames: number;
}
interface Props { active: boolean; compact: boolean; mode: number; controls: RefObject<SceneControls>; onReady: () => void; onLost: () => void }

const vertexShader = `
attribute vec3 aSeed;
uniform float uTime, uMorph, uPulse, uSize;
varying vec3 vColor;
varying float vAlpha;
const float TAU = 6.28318530718;
vec3 knot(vec3 s) {
  float u=s.x*TAU, v=s.y*TAU;
  float r=1.0+.38*cos(3.0*u);
  vec3 p=vec3(r*cos(2.0*u),r*sin(2.0*u),.5*sin(3.0*u));
  float tube=.13+.06*sin(u*3.0+uTime*.35);
  p+=vec3(cos(v)*cos(2.0*u),cos(v)*sin(2.0*u),sin(v))*tube;
  return p;
}
vec3 orbit(vec3 s) {
  float angle=s.x*TAU+uTime*(.05+floor(s.z*5.0)*.015);
  float ring=floor(s.z*5.0), tilt=ring*.55-.9, r=1.1+ring*.11;
  vec3 p=vec3(cos(angle)*r,sin(angle)*r,0.0);
  p.yz=mat2(cos(tilt),-sin(tilt),sin(tilt),cos(tilt))*p.yz;
  return p+vec3(s.y-.5,s.z-.5,s.y-.5)*.055;
}
vec3 wave(vec3 s) {
  vec3 p=vec3((s.x-.5)*3.0,0.0,(s.y-.5)*3.0);
  p.y=.38*sin(p.x*2.4+uTime*.65)*cos(p.z*2.0-uTime*.32);
  p.y+=(s.z-.5)*.035;
  return p;
}
void main(){
  vec3 a=knot(aSeed), b=orbit(aSeed), c=wave(aSeed);
  vec3 p=uMorph<1.0?mix(a,b,smoothstep(0.0,1.0,uMorph)):mix(b,c,smoothstep(1.0,2.0,uMorph));
  float radius=length(p);
  p*=1.0+.12*sin(radius*7.0-uPulse*12.0)*uPulse;
  p.z+=.025*sin(aSeed.x*24.0+uTime*.5);
  vec4 mv=modelViewMatrix*vec4(p,1.0);
  gl_Position=projectionMatrix*mv;
  gl_PointSize=clamp(uSize*(5.0/-mv.z),1.0,13.0);
  float accent=step(.83,aSeed.z);
  vColor=mix(vec3(.16,.65,1.0),vec3(.64,.43,1.0),accent)*1.8;
  vAlpha=.25+.65*aSeed.y;
}`;
const fragmentShader = `
varying vec3 vColor;
varying float vAlpha;
void main(){
 float d=length(gl_PointCoord-.5)*2.0;
 if(d>1.0) discard;
 float core=exp(-d*d*14.0), halo=exp(-d*d*4.0)*.18;
 gl_FragColor=vec4(vColor,(core+halo)*vAlpha);
}`;

function Field({ active, compact, mode, controls, onReady }: Omit<Props, 'onLost'>) {
  const group = useRef<Group>(null);
  const { invalidate, gl } = useThree();
  const lastMode = useRef(-1);
  const lastPulse = useRef(0);
  const tween = useRef<gsap.core.Tween | null>(null);
  const count = compact ? 7000 : 24000;
  const seeds = useMemo(() => {
    const array = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      array[i * 3] = i / count;
      array[i * 3 + 1] = (i * .61803398875) % 1;
      array[i * 3 + 2] = (i * .41421356237) % 1;
    }
    return array;
  }, [count]);
  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uMorph: { value: 0 }, uPulse: { value: 0 }, uSize: { value: compact ? 3.4 : 4.2 } }), [compact]);

  useEffect(() => {
    invalidate();
    onReady();
    return () => { tween.current?.kill(); };
  }, [invalidate, onReady]);
  useEffect(() => { if (!active) tween.current?.pause(); else tween.current?.resume(); invalidate(); }, [active, mode, invalidate]);
  useFrame((state, delta) => {
    const control = controls.current;
    const dt = Math.min(delta, .05);
    if (control.mode !== lastMode.current) {
      tween.current?.kill();
      lastMode.current = control.mode;
      if (active) tween.current = gsap.to(uniforms.uMorph, { value: control.mode, duration: 1.7, ease: 'power3.inOut', onUpdate: invalidate });
      else uniforms.uMorph.value = control.mode;
    }
    if (active) {
      uniforms.uTime.value += dt;
      if (control.pulse !== lastPulse.current) { uniforms.uPulse.value = 1; lastPulse.current = control.pulse; }
      uniforms.uPulse.value = Math.max(0, uniforms.uPulse.value - dt * .65);
    }
    if (group.current) {
      const t = uniforms.uTime.value;
      const turn = active ? control.pointer.x * .22 : 0;
      group.current.rotation.y += ((t * .07 + turn + control.scroll * .8) - group.current.rotation.y) * .04;
      group.current.rotation.x += ((-.28 + (active ? control.pointer.y * .18 : 0) - control.scroll * .2) - group.current.rotation.x) * .04;
    }
    state.camera.position.z = 5.4 - control.scroll * .7;
    control.frames++;
    gl.domElement.dataset.frames = String(control.frames);
    gl.domElement.dataset.mode = String(control.mode);
    gl.domElement.dataset.morph = uniforms.uMorph.value.toFixed(3);
    if (active) invalidate();
  });
  return <group ref={group}>
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 3]} />
      </bufferGeometry>
      <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} transparent depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
    </points>
    {[0, 1, 2].map(i => <mesh key={i} rotation={[i * .78, i * .5, i * .3]}>
      <torusGeometry args={[1.75, .0016, 4, 180]} />
      <meshBasicMaterial color={new Color('#39758c')} transparent opacity={.23} depthWrite={false} />
    </mesh>)}
  </group>;
}

export default function GPUScene(props: Props) {
  const onLost = props.onLost;
  return <Canvas frameloop="demand" dpr={props.compact ? 1 : [1, 1.5]} camera={{ position: [0, 0, 5.4], fov: 44 }} gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }} onCreated={({ gl }) => {
    gl.setClearColor('#080d18', 0);
    gl.domElement.addEventListener('webglcontextlost', onLost, { once: true });
  }}>
    <Field {...props} />
    {!props.compact && <EffectComposer multisampling={0}><Bloom intensity={.8} luminanceThreshold={.7} luminanceSmoothing={.45} mipmapBlur /></EffectComposer>}
  </Canvas>;
}
