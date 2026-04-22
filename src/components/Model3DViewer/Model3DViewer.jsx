import React, { Suspense, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, Center } from '@react-three/drei';
import './Model3DViewer.css';

/* ─────────────────────────────────────────────────
   Error Boundary — falls back to static image if
   the GLB fails to load (missing file / 404 / etc.)
───────────────────────────────────────────────── */
class ModelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: false };
  }
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? this.props.fallback : this.props.children;
  }
}

/* ─────────────────────────────────────────────────
   Animated loading rings shown while GLTF resolves
───────────────────────────────────────────────── */
function LoadingRings() {
  const outer = useRef();
  const inner = useRef();
  const dot   = useRef();

  useFrame((_, dt) => {
    if (outer.current) outer.current.rotation.z += dt * 1.2;
    if (inner.current) inner.current.rotation.z -= dt * 2.0;
    if (dot.current)   dot.current.rotation.y   += dt * 3.0;
  });

  return (
    <group>
      <mesh ref={outer}>
        <torusGeometry args={[1.0, 0.025, 16, 80]} />
        <meshStandardMaterial color="#FF6A00" emissive="#FF6A00" emissiveIntensity={0.8} />
      </mesh>
      <mesh ref={inner}>
        <torusGeometry args={[0.65, 0.015, 16, 60]} />
        <meshStandardMaterial color="#FF8C38" emissive="#FF8C38" emissiveIntensity={0.6} />
      </mesh>
      <mesh ref={dot}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#FF6A00" emissive="#FF6A00" emissiveIntensity={1} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────────
   The actual GLTF model — suspended until loaded
───────────────────────────────────────────────── */
function Model({ url }) {
  const { scene } = useGLTF(url);
  return (
    <Center>
      <primitive object={scene} dispose={null} />
    </Center>
  );
}

/* ─────────────────────────────────────────────────
   Full scene: lights + model + controls
───────────────────────────────────────────────── */
function Scene({ url, onInteractStart, onInteractEnd }) {
  return (
    <>
      {/* Base lighting */}
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[6, 10, 6]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Orange accent lights — matches design system */}
      <pointLight position={[-5, 4,  4]} color="#FF6A00" intensity={3.5} distance={14} decay={2} />
      <pointLight position={[ 4, -3, -4]} color="#FF4500" intensity={1.8} distance={10} decay={2} />
      <pointLight position={[ 0,  6,  0]} color="#FFB347" intensity={1.0} distance={12} decay={2} />

      {/* Hemisphere for ambient colour fill */}
      <hemisphereLight skyColor="#1a0800" groundColor="#000000" intensity={0.6} />

      {/* Environment reflections */}
      <Environment preset="city" />

      {/* Model */}
      <Suspense fallback={<LoadingRings />}>
        <Model url={url} />
      </Suspense>

      {/* Orbit controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate={true}
        autoRotateSpeed={1.4}
        onStart={onInteractStart}
        onEnd={onInteractEnd}
        makeDefault
      />
    </>
  );
}

/* ─────────────────────────────────────────────────
   Drag hint — fades out after first interaction
───────────────────────────────────────────────── */
function DragHint({ visible }) {
  return (
    <div className={`model-drag-hint ${visible ? 'model-drag-hint--visible' : ''}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 3H5a2 2 0 00-2 2v4M9 3h6M9 3v4M21 3h-4M21 3v4M21 3h-4a2 2 0 00-2 2M3 9v6M3 15v2a2 2 0 002 2h4M21 9v6M21 15v2a2 2 0 01-2 2h-4M9 21h6"/>
      </svg>
      <span>Drag to rotate</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Public component — wrap with error boundary
───────────────────────────────────────────────── */
export default function Model3DViewer({ url, fallbackImage, alt }) {
  const [hintVisible, setHintVisible] = useState(true);

  const handleInteractStart = useCallback(() => {
    setHintVisible(false);
  }, []);

  const fallback = (
    <img src={fallbackImage} alt={alt} className="pd-hero__image" />
  );

  return (
    <ModelErrorBoundary fallback={fallback}>
      <Canvas
        className="model-canvas"
        camera={{ position: [0, 0.8, 4.5], fov: 42 }}
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Scene
          url={url}
          onInteractStart={handleInteractStart}
          onInteractEnd={() => {}}
        />
      </Canvas>

      <DragHint visible={hintVisible} />
    </ModelErrorBoundary>
  );
}
