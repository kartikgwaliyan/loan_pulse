import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const FintechHero3D = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth || 440;
    const height = currentMount.clientHeight || 380;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2, 26);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    currentMount.appendChild(renderer.domElement);

    // 2. Lighting - Clean fintech studio key + fill + rim
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.6);
    dirLight.position.set(12, 20, 15);
    scene.add(dirLight);

    const softFillLight = new THREE.PointLight(0x2563eb, 2.0, 45);
    softFillLight.position.set(-14, -10, 10);
    scene.add(softFillLight);

    const rimLight = new THREE.PointLight(0x94a3b8, 1.2, 40);
    rimLight.position.set(0, -15, -10);
    scene.add(rimLight);

    // 3. Central Interactive Group
    const heroGroup = new THREE.Group();
    scene.add(heroGroup);

    // --- Helper: Canvas Texture for Central Rupee (₹) Emblem ---
    const createRupeeTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      // Crisp background
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 512, 512);

      // Outer ring
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(256, 256, 236, 0, Math.PI * 2);
      ctx.stroke();

      // Dotted security ring
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.arc(256, 256, 210, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Inner subtle circle
      ctx.fillStyle = '#eff6ff';
      ctx.beginPath();
      ctx.arc(256, 256, 190, 0, Math.PI * 2);
      ctx.fill();

      // Prominent Rupee Symbol ₹
      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'bold 220px "Inter", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('₹', 256, 250);

      // Sub-label on coin
      ctx.fillStyle = '#2563eb';
      ctx.font = 'bold 24px "Inter", sans-serif';
      ctx.letterSpacing = '4px';
      ctx.fillText('LOANPULSE', 256, 385);

      const texture = new THREE.CanvasTexture(canvas);
      texture.anisotropy = 4;
      return texture;
    };

    const rupeeTexture = createRupeeTexture();

    // 3a. Central Lending Rupee Medallion / Coin
    const coinGeo = new THREE.CylinderGeometry(4.6, 4.6, 0.7, 64);
    const coinSideMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      metalness: 0.85,
      roughness: 0.25
    });
    const coinFaceMat = new THREE.MeshStandardMaterial({
      map: rupeeTexture,
      metalness: 0.2,
      roughness: 0.3
    });

    const coinMaterials = [coinSideMat, coinFaceMat, coinFaceMat];
    const coinMesh = new THREE.Mesh(coinGeo, coinMaterials);
    coinMesh.rotation.x = Math.PI / 2; // face forward
    heroGroup.add(coinMesh);

    // 3b. Outer Protective Security Shield Ring
    const shieldRingGeo = new THREE.TorusGeometry(6.6, 0.08, 16, 100);
    const shieldRingMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      metalness: 0.7,
      roughness: 0.3
    });
    const shieldRing = new THREE.Mesh(shieldRingGeo, shieldRingMat);
    heroGroup.add(shieldRing);

    // 3c. Floating 3D Credit Facility Card
    const createCardTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 320;
      const ctx = canvas.getContext('2d');

      // Card Body
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 512, 320);

      // Subtle gradient highlight
      const grad = ctx.createLinearGradient(0, 0, 512, 320);
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(4, 4, 504, 312);

      // Gold Chip
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(44, 90, 60, 48);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.strokeRect(44, 90, 60, 48);

      // Brand
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px "Inter", sans-serif';
      ctx.fillText('LoanPulse', 44, 55);

      // Card Number & Status
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 22px monospace';
      ctx.fillText('•••• •••• •••• 8912', 44, 195);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 18px "Inter", sans-serif';
      ctx.fillText('APPROVED SANCTION: ₹5,00,000', 44, 255);

      const texture = new THREE.CanvasTexture(canvas);
      texture.anisotropy = 4;
      return texture;
    };

    const cardTexture = createCardTexture();
    const cardGeo = new THREE.BoxGeometry(5.4, 3.4, 0.12);
    const cardFaceMat = new THREE.MeshPhysicalMaterial({
      map: cardTexture,
      metalness: 0.5,
      roughness: 0.25,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1
    });
    const cardMesh = new THREE.Mesh(cardGeo, cardFaceMat);
    cardMesh.position.set(5.5, -2.4, 3.5);
    cardMesh.rotation.set(0.3, -0.5, 0.15);
    heroGroup.add(cardMesh);

    // 3d. Ascending Credit Risk & Analytics Growth Pillars
    const pillarGroup = new THREE.Group();
    const pillarHeights = [2.2, 3.4, 4.8, 6.2];
    const pillarMeshes = [];

    pillarHeights.forEach((h, idx) => {
      const pGeo = new THREE.BoxGeometry(0.8, h, 0.8);
      const pMat = new THREE.MeshStandardMaterial({
        color: idx === 3 ? 0x2563eb : 0x94a3b8,
        metalness: 0.6,
        roughness: 0.3
      });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.position.set(-6.5 + idx * 1.1, -4.5 + h / 2, -2.5 + idx * 0.4);
      pillarGroup.add(pMesh);
      pillarMeshes.push({ mesh: pMesh, baseH: h, idx });
    });
    heroGroup.add(pillarGroup);

    // 3e. Orbiting Currency Tokens (Micro Rupee Discs)
    const tokens = [];
    for (let i = 0; i < 3; i++) {
      const tGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.22, 32);
      const tMat = new THREE.MeshStandardMaterial({
        map: rupeeTexture,
        metalness: 0.6,
        roughness: 0.25
      });
      const tMesh = new THREE.Mesh(tGeo, tMat);
      tMesh.rotation.x = Math.PI / 3;
      heroGroup.add(tMesh);
      tokens.push({
        mesh: tMesh,
        angle: (i * Math.PI * 2) / 3,
        radius: 8.2,
        speed: 0.018 + i * 0.006,
        yOffset: (i - 1) * 2.2
      });
    }

    // 3f. Outer Gyroscopic Loan Lifecycle Orbit
    const orbitTorusGeo = new THREE.TorusGeometry(10.5, 0.05, 16, 120);
    const orbitTorusMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      metalness: 0.8,
      roughness: 0.2
    });
    const orbitTorus = new THREE.Mesh(orbitTorusGeo, orbitTorusMat);
    orbitTorus.rotation.x = Math.PI / 3.2;
    orbitTorus.rotation.y = Math.PI / 8;
    heroGroup.add(orbitTorus);

    // 4. Subtle Ambient Particle Stars
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 45;
      particlePositions[i + 1] = (Math.random() - 0.5) * 45;
      particlePositions[i + 2] = (Math.random() - 0.5) * 35;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.14,
      transparent: true,
      opacity: 0.35
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 5. Interactive Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event) => {
      const rect = currentMount.getBoundingClientRect();
      const clientX = event.clientX - rect.left;
      const clientY = event.clientY - rect.top;
      mouseX = (clientX / width - 0.5) * 2;
      mouseY = (clientY / height - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 6. Resizing
    const handleResize = () => {
      if (!currentMount) return;
      const w = currentMount.clientWidth;
      const h = currentMount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 7. Animation Loop
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Mouse damping
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      // Group rotation and tilt
      heroGroup.rotation.y = elapsed * 0.2 + targetX * 0.35;
      heroGroup.rotation.x = Math.sin(elapsed * 0.35) * 0.1 - targetY * 0.25;

      // Central Rupee coin spin & float
      coinMesh.rotation.z = elapsed * 0.35;
      coinMesh.position.y = Math.sin(elapsed * 1.5) * 0.35;

      // Shield ring gentle wobble
      shieldRing.rotation.z = -elapsed * 0.2;

      // Floating card levitation
      cardMesh.position.y = -2.4 + Math.sin(elapsed * 1.8 + 1) * 0.35;
      cardMesh.rotation.y = -0.5 + Math.sin(elapsed * 0.8) * 0.15;

      // Pillar undulation (Financial growth animation)
      pillarMeshes.forEach(p => {
        const factor = 1 + Math.sin(elapsed * 2.0 + p.idx * 0.8) * 0.12;
        p.mesh.scale.set(1, factor, 1);
      });

      // Orbiting micro-tokens
      tokens.forEach(t => {
        t.angle += t.speed;
        t.mesh.position.x = Math.cos(t.angle) * t.radius;
        t.mesh.position.z = Math.sin(t.angle) * t.radius;
        t.mesh.position.y = t.yOffset + Math.sin(t.angle * 2) * 0.7;
        t.mesh.rotation.y += 0.02;
      });

      // Orbit torus rotation
      orbitTorus.rotation.z = elapsed * 0.1;

      // Particles subtle spin
      particles.rotation.y = elapsed * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      coinGeo.dispose();
      coinSideMat.dispose();
      coinFaceMat.dispose();
      shieldRingGeo.dispose();
      shieldRingMat.dispose();
      cardGeo.dispose();
      cardFaceMat.dispose();
      orbitTorusGeo.dispose();
      orbitTorusMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      rupeeTexture.dispose();
      cardTexture.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        cursor: 'grab'
      }}
    />
  );
};

export default FintechHero3D;
