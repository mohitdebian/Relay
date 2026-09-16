'use client';

import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export default function AntigravityAd() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useGSAP(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setReducedMotion(true);
      return;
    }

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 });
    
    // Initial Setup
    gsap.set('.ag-world', { rotationX: 0, rotationZ: 0, scale: 1 });
    gsap.set('.ag-centered', { left: '50%', top: '50%', xPercent: -50, yPercent: -50 });
    gsap.set('.ag-node', { z: 0, opacity: 0, scale: 0.8 });
    gsap.set('.ag-auth-panel', { z: -100, opacity: 0, scale: 0.8 });
    gsap.set('.ag-particle', { opacity: 0 });
    gsap.set('.ag-bg-grid', { opacity: 0, scale: 2 });
    gsap.set('.ag-brand-frame', { opacity: 0, display: 'none' });
    gsap.set('.ag-title', { opacity: 0, y: 50 });

    // SCENE 1: Introduction (Flat) (0 - 3s)
    tl.addLabel('scene1', 0);
    tl.to('.ag-bg-grid', { opacity: 0.15, scale: 1, duration: 2, ease: 'power3.out' }, 'scene1');
    tl.to('.ag-title', { opacity: 1, y: 0, duration: 1.5, ease: 'power3.out' }, 'scene1+=0.5');
    
    // Nodes appear flat
    tl.to('.ag-node.gateway', { opacity: 1, scale: 1, duration: 1, ease: 'back.out(1.5)' }, 'scene1+=1');
    tl.to('.ag-node.upstream', { opacity: 1, scale: 1, duration: 1, stagger: 0.1, ease: 'back.out(1.5)' }, 'scene1+=1.2');

    // SCENE 2: Isometric Antigravity Lift (3 - 6s)
    tl.addLabel('scene2', 4);
    tl.to('.ag-title', { opacity: 0, y: -50, duration: 0.8 }, 'scene2');
    
    // The Snap to Isometric
    tl.to('.ag-world', { rotationX: 60, rotationZ: -45, scale: 0.8, y: 50, duration: 2, ease: 'power4.inOut' }, 'scene2');
    
    // Nodes lift on Z-axis (Antigravity effect)
    tl.to('.ag-node.gateway', { z: 80, duration: 1.5, ease: 'power3.out' }, 'scene2+=1');
    tl.to('.ag-node.upstream', { z: 40, duration: 1.5, stagger: 0.1, ease: 'power3.out' }, 'scene2+=1.2');
    
    // Add idle floating animations (yoyo)
    gsap.to('.ag-node.gateway', { z: 95, duration: 3, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 2.5 });
    gsap.to('.ag-node.upstream.u1', { z: 50, duration: 2.5, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 2.7 });
    gsap.to('.ag-node.upstream.u2', { z: 50, duration: 2.8, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 2.9 });

    // SCENE 3: Glassmorphism Auth Panel Appears (6 - 10s)
    tl.addLabel('scene3', 7);
    tl.to('.ag-auth-panel', { opacity: 1, scale: 1, z: 200, duration: 1.5, ease: 'back.out(1.2)' }, 'scene3');
    gsap.to('.ag-auth-panel', { z: 220, duration: 4, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 8.5 });

    // Auth states verify
    tl.to('.ag-check.c1', { opacity: 1, x: 0, duration: 0.5 }, 'scene3+=0.5');
    tl.to('.ag-check.c1 .status', { textContent: 'verified ✓', color: '#34d399', duration: 0.1 }, 'scene3+=0.8');
    tl.to('.ag-check.c2', { opacity: 1, x: 0, duration: 0.5 }, 'scene3+=1.0');
    tl.to('.ag-check.c2 .status', { textContent: 'production ✓', color: '#34d399', duration: 0.1 }, 'scene3+=1.3');

    // SCENE 4: Routing Data Flow (10 - 14s)
    tl.addLabel('scene4', 11);
    // Particles shoot across the isometric plane (adjusting X/Y but since world is rotated, it looks 3D)
    tl.set('.ag-particle', { opacity: 1, scale: 0, x: -100, y: -100, z: 80 });
    
    tl.to('.ag-particle.p1', { scale: 1, duration: 0.2 }, 'scene4');
    tl.to('.ag-particle.p1', { x: 300, y: -200, z: 40, duration: 1.2, ease: 'power2.inOut' }, 'scene4');
    tl.to('.ag-particle.p1', { scale: 0, duration: 0.2 }, 'scene4+=1');

    tl.to('.ag-particle.p2', { scale: 1, duration: 0.2 }, 'scene4+=0.4');
    tl.to('.ag-particle.p2', { x: 300, y: 200, z: 40, duration: 1.2, ease: 'power2.inOut' }, 'scene4+=0.4');
    tl.to('.ag-particle.p2', { scale: 0, duration: 0.2 }, 'scene4+=1.4');

    // SCENE 5: Camera Pan (14 - 18s)
    tl.addLabel('scene5', 14);
    // Pan the camera around the 3D scene
    tl.to('.ag-world', { rotationZ: -15, rotationX: 50, scale: 0.9, x: -100, duration: 4, ease: 'sine.inOut' }, 'scene5');

    // SCENE 6: Brand End Frame (18 - 22s)
    tl.addLabel('scene6', 18);
    // Flatten back to 2D
    tl.to('.ag-world', { rotationX: 0, rotationZ: 0, z: 0, scale: 2, opacity: 0, duration: 1.5, ease: 'power4.in' }, 'scene6');
    tl.set('.ag-world', { display: 'none' });
    
    tl.set('.ag-brand-frame', { display: 'flex' }, 'scene6+=1.5');
    tl.to('.ag-brand-frame', { opacity: 1, duration: 1.5, ease: 'power2.out' }, 'scene6+=1.5');
    tl.fromTo('.ag-brand-logo', { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.5, ease: 'back.out(1.5)' }, 'scene6+=1.5');

  }, { scope: containerRef });

  if (reducedMotion) {
    return (
      <div className="w-full h-full min-h-[700px] flex items-center justify-center bg-[#050505] text-[#ededed] font-sans">
        <h1 className="text-5xl font-bold font-pixel">RELAY_</h1>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full min-h-[700px] overflow-hidden bg-[#000000] text-[#ededed] font-sans flex items-center justify-center selection:bg-[#333]"
      style={{ perspective: '2000px' }}
    >
      <style>{`
        .font-pixel { font-family: 'Silkscreen', monospace; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        
        .ag-bg-grid {
          position: absolute;
          inset: -100%;
          background-image: 
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 50px 50px;
          transform-style: preserve-3d;
        }

        .ag-world {
          width: 800px;
          height: 800px;
          position: absolute;
          transform-style: preserve-3d;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Glassmorphism Classes */
        .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 30px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1);
          border-radius: 16px;
          transform-style: preserve-3d;
        }
        
        .glass-panel-heavy {
          background: rgba(20, 20, 20, 0.6);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 50px 100px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2);
          border-radius: 20px;
          transform-style: preserve-3d;
        }

        .ag-particle {
          width: 8px;
          height: 8px;
          background: #34d399;
          border-radius: 50%;
          box-shadow: 0 0 20px #34d399, 0 0 40px #10b981;
          position: absolute;
          transform-style: preserve-3d;
        }
      `}</style>

      {/* 3D World Container */}
      <div className="ag-world ag-centered">
        <div className="ag-bg-grid" />
        
        <div className="ag-title absolute top-[10%] left-0 right-0 text-center text-4xl font-medium tracking-wide text-white drop-shadow-2xl z-50" style={{ transform: 'translateZ(100px)' }}>
          Weightless API Infrastructure.
        </div>

        {/* Central Gateway */}
        <div className="ag-centered ag-node gateway glass-panel absolute w-64 h-64 flex flex-col items-center justify-center">
          <div className="font-pixel text-4xl mb-3 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">RELAY_</div>
          <div className="font-mono text-xs text-[#a1a1aa] tracking-[0.2em] bg-black/40 px-3 py-1 rounded border border-white/5">GATEWAY</div>
          
          {/* Inner glowing core */}
          <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_50px_rgba(52,211,153,0.1)] pointer-events-none" />
        </div>

        {/* Floating Auth Panel */}
        {/* We position it centered, GSAP translates Z to float it above */}
        <div className="ag-centered ag-auth-panel glass-panel-heavy absolute w-[340px] p-8 flex flex-col gap-5">
          <div className="text-xs font-mono text-[#a1a1aa] tracking-[0.15em] border-b border-white/10 pb-3 flex items-center justify-between">
            SECURITY LAYER
            <div className="w-2 h-2 rounded-full bg-[#34d399] shadow-[0_0_10px_#34d399]" />
          </div>
          
          <div className="ag-check c1 flex justify-between items-center opacity-0 -translate-x-4">
            <div>
              <div className="text-[10px] text-[#71717a] font-mono uppercase mb-1">API KEY</div>
              <div className="text-sm font-mono text-[#ededed]">sk_live_••••••••</div>
            </div>
            <div className="status text-xs text-[#71717a] font-mono">checking...</div>
          </div>

          <div className="ag-check c2 flex justify-between items-center opacity-0 -translate-x-4">
            <div className="text-sm font-medium text-[#ededed]">Environment</div>
            <div className="status text-xs text-[#71717a] font-mono">checking...</div>
          </div>
        </div>

        {/* Upstream APIs */}
        <div className="ag-centered ag-node upstream u1 glass-panel absolute w-56 p-5 ml-[250px] mt-[-120px]">
          <div className="font-mono text-sm text-white mb-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#34d399] shadow-[0_0_8px_#34d399]" />
            payments-api
          </div>
          <div className="flex justify-between text-xs font-mono border-t border-white/10 pt-3">
            <span className="text-[#a1a1aa]">Latency</span>
            <span className="text-white">42ms</span>
          </div>
        </div>

        <div className="ag-centered ag-node upstream u2 glass-panel absolute w-56 p-5 ml-[250px] mt-[120px]">
          <div className="font-mono text-sm text-white mb-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#34d399] shadow-[0_0_8px_#34d399]" />
            notifications
          </div>
          <div className="flex justify-between text-xs font-mono border-t border-white/10 pt-3">
            <span className="text-[#a1a1aa]">Latency</span>
            <span className="text-white">28ms</span>
          </div>
        </div>

        {/* Particles */}
        <div className="ag-particle p1" />
        <div className="ag-particle p2 bg-[#60a5fa] shadow-[0_0_20px_#60a5fa]" />

      </div>

      {/* Brand End Frame */}
      <div className="ag-brand-frame absolute inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
        <div className="relative text-center z-10">
          <div className="ag-brand-logo font-pixel text-8xl text-white mb-6 drop-shadow-[0_0_40px_rgba(255,255,255,0.3)]">RELAY_</div>
          <div className="text-xl font-mono text-[#a1a1aa] tracking-widest uppercase mb-10">Antigravity Architecture</div>
        </div>
      </div>

    </div>
  );
}
