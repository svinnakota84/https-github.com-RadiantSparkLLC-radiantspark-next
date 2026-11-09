/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeGlobeSceneProps {
  className?: string;
  variant?: 'global' | 'india' | 'usa' | 'sparkdeals';
}

interface FlyingMicrochip {
  group: THREE.Group;
  velocity: THREE.Vector3;
  rotVelocity: THREE.Vector3;
  age: number;
  maxAge: number;
  active: boolean;
}

export const ThreeGlobeScene: React.FC<ThreeGlobeSceneProps> = ({
  className = '',
  variant = 'global',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL to normalize performance
    const isSoftwareGl = (() => {
      try {
        const testCanvas = document.createElement('canvas');
        const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // Scene setup
    const scene = new THREE.Scene();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 550;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1200);
    camera.position.set(0, 0, 320);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      });
    } catch {
      container.style.background = 'radial-gradient(ellipse at center, rgba(37,99,235,.25), transparent 65%)';
      return;
    }
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    container.appendChild(renderer.domElement);

    // Studio Lighting Rig for Realistic Metallic Silicon Microchip Reflections
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfbbf24, 2.8); // Warm gold key light
    keyLight.position.set(140, 160, 200);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.2); // Cool cyan rim light
    rimLight.position.set(-160, -90, -120);
    scene.add(rimLight);

    // Group for the entire rotating celestial globe system
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Globe Radius
    const GLOBE_RADIUS = 100;

    // Palette Colors matching image_75289c42.png
    const goldColor = new THREE.Color('#f59e0b');
    const goldLightColor = new THREE.Color('#fbbf24');
    const tealColor = new THREE.Color('#38bdf8');
    const darkBlueColor = new THREE.Color('#1e3a8a');

    // 1. Latitude and Longitude Wireframe Rings
    const ringsGroup = new THREE.Group();
    globeGroup.add(ringsGroup);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: goldColor,
      transparent: true,
      opacity: 0.38,
      linewidth: 1,
    });

    const equatorMaterial = new THREE.LineBasicMaterial({
      color: goldLightColor,
      transparent: true,
      opacity: 0.65,
      linewidth: 1.5,
    });

    // Latitude rings (-75 to +75 degrees in steps of 15)
    for (let lat = -75; lat <= 75; lat += 15) {
      const phi = (90 - lat) * (Math.PI / 180);
      const ringRadius = GLOBE_RADIUS * Math.sin(phi);
      const ringY = GLOBE_RADIUS * Math.cos(phi);

      const segments = 64;
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * ringRadius, ringY, Math.sin(theta) * ringRadius));
      }
      const ringGeo = new THREE.BufferGeometry().setFromPoints(points);
      const ringMesh = new THREE.Line(ringGeo, lat === 0 ? equatorMaterial : lineMaterial);
      ringsGroup.add(ringMesh);
    }

    // Longitude rings (12 meridians around the globe)
    for (let i = 0; i < 12; i++) {
      const theta = (i / 12) * Math.PI * 2;
      const segments = 64;
      const points: THREE.Vector3[] = [];
      for (let j = 0; j <= segments; j++) {
        const phi = (j / segments) * Math.PI * 2;
        const x = GLOBE_RADIUS * Math.sin(phi) * Math.cos(theta);
        const y = GLOBE_RADIUS * Math.cos(phi);
        const z = GLOBE_RADIUS * Math.sin(phi) * Math.sin(theta);
        points.push(new THREE.Vector3(x, y, z));
      }
      const meridianGeo = new THREE.BufferGeometry().setFromPoints(points);
      const meridianMesh = new THREE.Line(meridianGeo, lineMaterial);
      ringsGroup.add(meridianMesh);
    }

    // 2. Glowing Nodes / Vertices on the Sphere Surface
    const nodeCount = 380;
    const nodePositions = new Float32Array(nodeCount * 3);
    const nodeColors = new Float32Array(nodeCount * 3);

    for (let i = 0; i < nodeCount; i++) {
      // Golden Spiral / Fibonacci sphere distribution
      const phi = Math.acos(1 - (2 * (i + 0.5)) / nodeCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const x = GLOBE_RADIUS * Math.sin(phi) * Math.cos(theta);
      const y = GLOBE_RADIUS * Math.cos(phi);
      const z = GLOBE_RADIUS * Math.sin(phi) * Math.sin(theta);

      nodePositions[i * 3] = x;
      nodePositions[i * 3 + 1] = y;
      nodePositions[i * 3 + 2] = z;

      const isTeal = Math.random() < 0.12;
      const color = isTeal ? tealColor : Math.random() > 0.4 ? goldLightColor : goldColor;

      nodeColors[i * 3] = color.r;
      nodeColors[i * 3 + 1] = color.g;
      nodeColors[i * 3 + 2] = color.b;
    }

    const nodeGeometry = new THREE.BufferGeometry();
    nodeGeometry.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
    nodeGeometry.setAttribute('color', new THREE.BufferAttribute(nodeColors, 3));

    const createCircleTexture = () => {
      const size = 64;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(251, 191, 36, 0.9)');
        gradient.addColorStop(0.7, 'rgba(245, 158, 11, 0.4)');
        gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const nodeTexture = createCircleTexture();
    const nodeMaterial = new THREE.PointsMaterial({
      size: 4.5,
      map: nodeTexture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const nodesMesh = new THREE.Points(nodeGeometry, nodeMaterial);
    globeGroup.add(nodesMesh);

    // 3. Coordinate Hubs (Atlanta, USA & Andhra Pradesh / India)
    const latLongToVector3 = (lat: number, lon: number, radius: number): THREE.Vector3 => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    };

    const atlantaPos = latLongToVector3(33.749, -84.388, GLOBE_RADIUS);
    const indiaPos = latLongToVector3(16.506, 80.648, GLOBE_RADIUS);

    const createHubMarker = (pos: THREE.Vector3, colorHex: string) => {
      const hubGroup = new THREE.Group();
      hubGroup.position.copy(pos);

      const coreGeo = new THREE.SphereGeometry(2.2, 16, 16);
      const coreMat = new THREE.MeshBasicMaterial({ color: colorHex });
      const core = new THREE.Mesh(coreGeo, coreMat);
      hubGroup.add(core);

      const ringGeo = new THREE.RingGeometry(3, 4.2, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      hubGroup.add(ring);

      return hubGroup;
    };

    const usaHub = createHubMarker(atlantaPos, '#38bdf8');
    const indiaHub = createHubMarker(indiaPos, '#f59e0b');
    globeGroup.add(usaHub);
    globeGroup.add(indiaHub);

    // 4. Connecting Flight / Data Arc between USA and India
    const createConnectingArc = (v1: THREE.Vector3, v2: THREE.Vector3) => {
      const distance = v1.distanceTo(v2);
      const midPoint = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
      const midLength = midPoint.length();
      midPoint.normalize();
      midPoint.multiplyScalar(midLength + distance * 0.45);

      const curve = new THREE.QuadraticBezierCurve3(v1, midPoint, v2);
      const arcPoints = curve.getPoints(50);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPoints);

      const arcMat = new THREE.LineBasicMaterial({
        color: '#fbbf24',
        transparent: true,
        opacity: 0.8,
        linewidth: 2,
      });

      const arcLine = new THREE.Line(arcGeo, arcMat);
      return { arcLine, curve };
    };

    const { arcLine, curve: connectionCurve } = createConnectingArc(atlantaPos, indiaPos);
    globeGroup.add(arcLine);

    const packetGeo = new THREE.SphereGeometry(2.2, 16, 16);
    const packetMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
    const packetMesh = new THREE.Mesh(packetGeo, packetMat);
    globeGroup.add(packetMesh);

    // =========================================================================
    // 5. REALISTIC 3D SILICON MICROCHIP EMITTER SYSTEM ("Throws Chips Every Second")
    // =========================================================================
    const chipPoolGroup = new THREE.Group();
    scene.add(chipPoolGroup);

    // Reusable Materials for PBR Microchips
    const substrateMat = new THREE.MeshStandardMaterial({
      color: 0x090f1d, // Dark ceramic silicon substrate
      metalness: 0.82,
      roughness: 0.28,
    });

    const dieMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Polished gold silicon die
      metalness: 0.96,
      roughness: 0.14,
    });

    const pinMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24, // Gold plated metallic contact pins
      metalness: 0.92,
      roughness: 0.18,
    });

    const notchMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8, // Laser marker pin-1 notch
    });

    // Shared Geometries for Microchip Components
    const substrateGeo = new THREE.BoxGeometry(6.4, 0.65, 6.4);
    const dieGeo = new THREE.BoxGeometry(3.6, 0.35, 3.6);
    const pinGeo = new THREE.BoxGeometry(0.55, 0.22, 0.85);
    const notchGeo = new THREE.SphereGeometry(0.35, 8, 8);

    // Microchip builder function
    const buildRealisticMicrochip = (): THREE.Group => {
      const chip = new THREE.Group();

      // Main ceramic substrate package
      const substrate = new THREE.Mesh(substrateGeo, substrateMat);
      chip.add(substrate);

      // Center gold die / heat spreader
      const die = new THREE.Mesh(dieGeo, dieMat);
      die.position.y = 0.45;
      chip.add(die);

      // Pin-1 orientation notch
      const notch = new THREE.Mesh(notchGeo, notchMat);
      notch.position.set(-2.2, 0.45, -2.2);
      chip.add(notch);

      // 16 Gold Contact Pins along the 4 edges (4 per side)
      const pinOffsets = [-1.8, -0.6, 0.6, 1.8];
      pinOffsets.forEach((offset) => {
        // North side pins
        const pinN = new THREE.Mesh(pinGeo, pinMat);
        pinN.position.set(offset, 0, 3.5);
        chip.add(pinN);

        // South side pins
        const pinS = new THREE.Mesh(pinGeo, pinMat);
        pinS.position.set(offset, 0, -3.5);
        chip.add(pinS);

        // East side pins
        const pinE = new THREE.Mesh(pinGeo, pinMat);
        pinE.rotation.y = Math.PI / 2;
        pinE.position.set(3.5, 0, offset);
        chip.add(pinE);

        // West side pins
        const pinW = new THREE.Mesh(pinGeo, pinMat);
        pinW.rotation.y = Math.PI / 2;
        pinW.position.set(-3.5, 0, offset);
        chip.add(pinW);
      });

      chip.visible = false;
      return chip;
    };

    // Instantiate Chip Pool (24 chips)
    const MAX_CHIPS = 24;
    const flyingChips: FlyingMicrochip[] = [];

    for (let i = 0; i < MAX_CHIPS; i++) {
      const chipGroup = buildRealisticMicrochip();
      chipPoolGroup.add(chipGroup);
      flyingChips.push({
        group: chipGroup,
        velocity: new THREE.Vector3(),
        rotVelocity: new THREE.Vector3(),
        age: 0,
        maxAge: 6.5,
        active: false,
      });
    }

    // Function to launch/throw a microchip outward into space
    const throwMicrochip = () => {
      // Find an inactive chip
      const chip = flyingChips.find((c) => !c.active);
      if (!chip) return;

      // Spawn on perimeter of the globe at random latitude/longitude
      const phi = Math.random() * Math.PI;
      const theta = Math.random() * Math.PI * 2;
      const spawnRadius = GLOBE_RADIUS * (0.85 + Math.random() * 0.3);

      const spawnX = spawnRadius * Math.sin(phi) * Math.cos(theta);
      const spawnY = spawnRadius * Math.cos(phi);
      const spawnZ = spawnRadius * Math.sin(phi) * Math.sin(theta);

      chip.group.position.set(spawnX, spawnY, spawnZ);

      // Outward ballistic velocity throwing the chip into space and towards camera
      const outwardDir = new THREE.Vector3(spawnX, spawnY, spawnZ).normalize();
      // Add impulse towards the front/camera (+Z) and outward lateral spread
      outwardDir.x += (Math.random() - 0.5) * 0.6;
      outwardDir.y += (Math.random() - 0.5) * 0.5;
      outwardDir.z += Math.random() * 0.7 + 0.3; // bias towards viewer for dramatic 3D presence
      outwardDir.normalize();

      const speed = Math.random() * 28 + 32; // Units per second
      chip.velocity.copy(outwardDir).multiplyScalar(speed);

      // Tumbling angular velocity
      chip.rotVelocity.set(
        (Math.random() - 0.5) * 2.8,
        (Math.random() - 0.5) * 2.4,
        (Math.random() - 0.5) * 2.0
      );

      chip.age = 0;
      chip.maxAge = Math.random() * 2.0 + 5.5; // 5.5 to 7.5 seconds flight time
      chip.active = true;
      chip.group.visible = true;
      chip.group.scale.setScalar(0.2); // scale in
    };

    // Pre-populate a few active chips so the scene has immediate depth on first render
    for (let i = 0; i < 6; i++) {
      throwMicrochip();
      const c = flyingChips[i];
      if (c && c.active) {
        c.age = (i + 1) * 0.8;
        c.group.position.addScaledVector(c.velocity, c.age);
        c.group.scale.setScalar(Math.min(1.0, 0.2 + c.age * 0.3));
      }
    }

    // 6. Ambient Space Debris Particles for Cosmic Depth
    const spaceDustCount = 55;
    const dustGroup = new THREE.Group();
    scene.add(dustGroup);

    interface DustParticle {
      mesh: THREE.Mesh;
      basePos: THREE.Vector3;
      speed: number;
      rotSpeed: number;
      driftAngle: number;
    }

    const dustParticles: DustParticle[] = [];

    for (let i = 0; i < spaceDustCount; i++) {
      const isRect = Math.random() > 0.5;
      const sizeX = Math.random() * 2.2 + 1.2;
      const sizeY = isRect ? sizeX * (Math.random() * 1.4 + 0.8) : sizeX;
      const dustGeo = new THREE.PlaneGeometry(sizeX, sizeY);

      const randColor = Math.random();
      const color =
        randColor < 0.45
          ? goldLightColor
          : randColor < 0.75
          ? tealColor
          : Math.random() > 0.5
          ? darkBlueColor
          : new THREE.Color('#94a3b8');

      const dustMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: Math.random() * 0.55 + 0.25,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(dustGeo, dustMat);
      const dist = Math.random() * 120 + 120;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      mesh.position.set(
        dist * Math.cos(phi) * Math.cos(theta),
        dist * Math.sin(phi) + (Math.random() - 0.5) * 40,
        dist * Math.cos(phi) * Math.sin(theta)
      );

      dustGroup.add(mesh);
      dustParticles.push({
        mesh,
        basePos: mesh.position.clone(),
        speed: Math.random() * 0.003 + 0.001,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        driftAngle: Math.random() * Math.PI * 2,
      });
    }

    // Mouse Interaction & Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetMouseX = x * 0.85;
      targetMouseY = y * 0.65;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || window.innerWidth;
      const newHeight = container.clientHeight || 550;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(newWidth, newHeight);
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // 7. Animation Loop with Exact 1-Second Microchip Throw Interval
    let animationFrameId: number;
    const clock = new THREE.Clock();
    let packetProgress = 0;
    let lastThrowTime = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const time = clock.getElapsedTime();

      // Lerp mouse tracking
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Rotate celestial globe
      globeGroup.rotation.y = time * 0.12 + mouseX * 0.75;
      globeGroup.rotation.x = 0.22 + mouseY * 0.45;

      // Pulse hubs
      const scaleUsa = 1 + Math.sin(time * 3) * 0.18;
      const scaleIndia = 1 + Math.sin(time * 3 + Math.PI) * 0.18;
      usaHub.scale.set(scaleUsa, scaleUsa, scaleUsa);
      indiaHub.scale.set(scaleIndia, scaleIndia, scaleIndia);

      // Packet traveling between USA and India
      packetProgress = (packetProgress + delta * 0.35) % 1;
      const currentPoint = connectionCurve.getPoint(packetProgress);
      packetMesh.position.copy(currentPoint);

      // =========================================================================
      // DYNAMIC MICROCHIP EMITTER: Throws a realistic silicon microchip every 1.0s
      // =========================================================================
      if (time - lastThrowTime >= 1.0) {
        throwMicrochip();
        lastThrowTime = time;
      }

      // Update flying microchips
      flyingChips.forEach((chip) => {
        if (!chip.active) return;

        chip.age += delta;

        // Position update
        chip.group.position.addScaledVector(chip.velocity, delta);

        // Tumbling 3D rotation
        chip.group.rotation.x += chip.rotVelocity.x * delta;
        chip.group.rotation.y += chip.rotVelocity.y * delta;
        chip.group.rotation.z += chip.rotVelocity.z * delta;

        // Realistic scale growth as it leaves the globe into space
        const scaleProgress = Math.min(1.0, chip.age / 0.8);
        const currentScale = 0.2 + scaleProgress * 0.8;
        chip.group.scale.setScalar(currentScale);

        // Recycle when lifespan exceeded or flew too far
        if (chip.age >= chip.maxAge || chip.group.position.length() > 450) {
          chip.active = false;
          chip.group.visible = false;
        }
      });

      // Animate subtle ambient space dust
      dustParticles.forEach((p) => {
        p.driftAngle += p.speed;
        p.mesh.position.y = p.basePos.y + Math.sin(p.driftAngle) * 8;
        p.mesh.position.x = p.basePos.x + Math.cos(p.driftAngle) * 5;
        p.mesh.rotation.z += p.rotSpeed;
      });

      dustGroup.rotation.y = -time * 0.03 + mouseX * 0.2;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      // Memory Disposal
      nodeGeometry.dispose();
      nodeMaterial.dispose();
      nodeTexture.dispose();
      lineMaterial.dispose();
      equatorMaterial.dispose();
      packetGeo.dispose();
      packetMat.dispose();

      substrateGeo.dispose();
      dieGeo.dispose();
      pinGeo.dispose();
      notchGeo.dispose();
      substrateMat.dispose();
      dieMat.dispose();
      pinMat.dispose();
      notchMat.dispose();

      dustParticles.forEach((p) => {
        p.mesh.geometry.dispose();
        if (Array.isArray(p.mesh.material)) {
          p.mesh.material.forEach((m) => m.dispose());
        } else {
          p.mesh.material.dispose();
        }
      });

      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [variant]);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-[480px] sm:h-[550px] lg:h-[620px] pointer-events-none select-none overflow-hidden ${className}`}
      aria-hidden="true"
    />
  );
};
