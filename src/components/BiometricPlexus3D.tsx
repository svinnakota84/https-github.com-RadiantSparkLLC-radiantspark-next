/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface BiometricPlexus3DProps {
  className?: string;
  bpm?: number;
}

export const BiometricPlexus3D: React.FC<BiometricPlexus3DProps> = ({
  className = '',
  bpm = 75,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL to cap pixel ratio
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

    const scene = new THREE.Scene();

    const width = container.clientWidth || 240;
    const height = container.clientHeight || 120;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 18);

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

    container.appendChild(renderer.domElement);

    // Root Group
    const plexusGroup = new THREE.Group();
    scene.add(plexusGroup);

    // 1. Outer Wireframe Icosahedron / Polyhedron
    const icosaGeo = new THREE.IcosahedronGeometry(4.2, 1);
    const wireframeGeo = new THREE.WireframeGeometry(icosaGeo);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8, // Cyan neon
      transparent: true,
      opacity: 0.38,
      linewidth: 1,
    });
    const wireframe = new THREE.LineSegments(wireframeGeo, wireMat);
    plexusGroup.add(wireframe);

    // 2. Glowing Nodes at every vertex
    const posAttr = icosaGeo.attributes.position;
    const nodeCount = posAttr.count;
    const nodePositions = new Float32Array(nodeCount * 3);
    const nodeColors = new Float32Array(nodeCount * 3);

    const cyan = new THREE.Color('#38bdf8');
    const gold = new THREE.Color('#fbbf24');
    const rose = new THREE.Color('#f43f5e');

    for (let i = 0; i < nodeCount; i++) {
      nodePositions[i * 3] = posAttr.getX(i);
      nodePositions[i * 3 + 1] = posAttr.getY(i);
      nodePositions[i * 3 + 2] = posAttr.getZ(i);

      const col = i % 3 === 0 ? rose : i % 2 === 0 ? cyan : gold;
      nodeColors[i * 3] = col.r;
      nodeColors[i * 3 + 1] = col.g;
      nodeColors[i * 3 + 2] = col.b;
    }

    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
    nodeGeo.setAttribute('color', new THREE.BufferAttribute(nodeColors, 3));

    // Circular point texture for smooth node glowing
    const createNodeTexture = () => {
      const size = 64;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(56, 189, 248, 0.9)');
        gradient.addColorStop(0.7, 'rgba(56, 189, 248, 0.3)');
        gradient.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const nodeTexture = createNodeTexture();
    const nodeMat = new THREE.PointsMaterial({
      size: 1.8,
      map: nodeTexture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const nodesMesh = new THREE.Points(nodeGeo, nodeMat);
    plexusGroup.add(nodesMesh);

    // 3. Inner Pulsing Cardiac Core (Optical PPG sensor representation)
    const coreGeo = new THREE.SphereGeometry(1.4, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e, // Rose pink pulse
      transparent: true,
      opacity: 0.75,
      wireframe: true,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    plexusGroup.add(coreMesh);

    // 4. Equatorial Optical Ring
    const ringGeo = new THREE.RingGeometry(2.2, 2.5, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24, // Gold
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    plexusGroup.add(ringMesh);

    // Resize observer
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const newWidth = entry.contentRect.width || width;
          const newHeight = entry.contentRect.height || height;
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        }
      });
      resizeObserver.observe(container);
    }

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Continuous 3D rotation
      plexusGroup.rotation.y = time * 0.45;
      plexusGroup.rotation.x = Math.sin(time * 0.3) * 0.3;
      ringMesh.rotation.z = time * 0.8;

      // Realistic cardiac heartbeat pulse based on BPM (75 bpm = ~0.8s period)
      const beatFrequency = (bpm / 60) * Math.PI * 2;
      const rawPulse = Math.sin(time * beatFrequency);
      const cardiacBounce = Math.pow(Math.max(0, rawPulse), 3); // Sharp ventricular contraction beat

      const scale = 1 + cardiacBounce * 0.22;
      coreMesh.scale.set(scale, scale, scale);
      wireframe.scale.set(1 + cardiacBounce * 0.08, 1 + cardiacBounce * 0.08, 1 + cardiacBounce * 0.08);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (resizeObserver) resizeObserver.disconnect();

      icosaGeo.dispose();
      wireframeGeo.dispose();
      wireMat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      nodeTexture.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();

      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [bpm]);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full pointer-events-none select-none overflow-hidden ${className}`}
      aria-hidden="true"
    />
  );
};
