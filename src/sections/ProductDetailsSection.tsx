import { useRef, useEffect, useMemo, Suspense, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import ScrollTriggerEntrance from '@/components/ScrollTriggerEntrance';

gsap.registerPlugin(ScrollTrigger);

const PRODUCT_IMAGES = [
  '/assets/bottle-cutout.png',
  '/assets/gallery-steel.png',
  '/assets/bottle-lifestyle-kitchen.jpg',
  '/assets/gallery-silicone.png',
  '/assets/new-feature-travel-strap.png',
  '/assets/gallery-splash.png',
  '/assets/bottle-lifestyle-outdoor.jpg',
  '/assets/gallery-strap.png',
  '/assets/new-feature-bowl-open.png',
];

const SPECS = [
  { label: 'Capacity', value: '10 FL oz' },
  { label: 'Material', value: '304 Stainless Steel, Food-Grade Silicone' },
  { label: 'Dimensions', value: '3.5" x 3.5" x 6"' },
  { label: 'Weight', value: '8 oz (empty)' },
  { label: 'Temperature', value: 'Keeps water cool up to 6 hours' },
  { label: 'Strap', value: 'Braided Paracord with Carabiner' },
  { label: 'Care', value: 'Dishwasher safe (top rack)' },
];

// 3D Gallery Scene
function GalleryScene({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const textures = useTexture(PRODUCT_IMAGES);

  const path = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-6, 0, 2),
      new THREE.Vector3(-2.5, 0, 4),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(2.5, 0, -4),
      new THREE.Vector3(6, 0, -2),
      new THREE.Vector3(6, 0, 2),
      new THREE.Vector3(2.5, 0, 4),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-2.5, 0, -4),
    ]);
  }, []);

  const planePositions = useMemo(() => {
    const positions: THREE.Vector3[] = [];
    for (let i = 0; i < 9; i++) {
      const t = i / 8;
      positions.push(path.getPointAt(t));
    }
    return positions;
  }, [path]);

  useFrame((state) => {
    const progress = scrollProgress.current;
    const time = state.clock.elapsedTime;

    // Move camera along path
    const camT = Math.min(Math.max(progress, 0), 1);
    const camPos = path.getPointAt(camT);
    camera.position.lerp(new THREE.Vector3(camPos.x, camPos.y + 1, camPos.z + 6), 0.05);
    camera.lookAt(camPos.x, camPos.y, camPos.z);

    // Animate planes
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        const planeT = i / 8;
        const undulate = Math.sin(time * 2 - planeT * 5) * 0.15;
        child.position.y = planePositions[i].y + undulate;
        child.rotation.x = Math.sin(time * 2 + i) * 0.1;
        child.rotation.y = Math.cos(time + i) * 0.1 + Math.PI / 6;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {planePositions.map((pos, i) => (
        <mesh key={i} position={[pos.x, pos.y, pos.z]}>
          <planeGeometry args={[2.5, 3.5]} />
          <meshBasicMaterial map={textures[i]} side={THREE.DoubleSide} transparent opacity={0.95} />
        </mesh>
      ))}
    </group>
  );
}

export default function ProductDetailsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const scrollProgress = useRef(0);
  const [bgDark, setBgDark] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          scrollProgress.current = self.progress;
          // Toggle text color and bg based on background (dark at 30-70%)
          if (self.progress > 0.3 && self.progress < 0.7) {
            setBgDark(true);
          } else {
            setBgDark(false);
          }
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section id="specs" ref={sectionRef} className="relative w-full" style={{ height: '400vh' }}>
      {/* Sticky Canvas */}
      <div
        ref={canvasContainerRef}
        className="sticky top-0 w-full h-[100dvh] overflow-hidden"
        style={{
          background: `linear-gradient(to bottom, #FAFAFA 0%, ${scrollProgress.current > 0.3 && scrollProgress.current < 0.7 ? '#0F0F0F' : '#FAFAFA'} 100%)`,
        }}
      >
        <Canvas
          camera={{ position: [0, 1, 6], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          style={{
            background: bgDark ? '#0F0F0F' : '#FAFAFA',
            transition: 'background 0.3s ease',
          }}
        >
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={0.5} />
          <pointLight position={[-10, 5, 10]} intensity={0.3} color="#ffccaa" />
          <Suspense fallback={null}>
            <GalleryScene scrollProgress={scrollProgress} />
          </Suspense>
        </Canvas>

        {/* Overlay Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          <h2
            className="text-h2 text-center text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]"
          >
            Every Angle, Perfected
          </h2>
          <p
            className="mt-3 text-body-large text-center text-[rgba(255,255,255,0.95)] drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]"
          >
            Scroll to explore the design details
          </p>
        </div>
      </div>

      {/* Specifications */}
      <div className="relative z-20 bg-[#F5F5F5] py-20 md:py-[80px] page-padding">
        <ScrollTriggerEntrance className="mx-auto max-w-[600px]" stagger={0.05}>
          <h3 className="stagger-item text-h3 text-charcoal-deep text-center mb-10">
            Specifications
          </h3>
          {SPECS.map((spec) => (
            <div
              key={spec.label}
              className="stagger-item flex items-center justify-between py-4 border-b border-silver"
            >
              <span className="text-label text-charcoal">{spec.label}</span>
              <span className="text-body text-body text-right">{spec.value}</span>
            </div>
          ))}
        </ScrollTriggerEntrance>
      </div>
    </section>
  );
}
