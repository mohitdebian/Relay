'use client';

import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export default function RelayMotionDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State for prefers-reduced-motion
  const [reducedMotion, setReducedMotion] = useState(false);

  useGSAP(() => {
    // Check reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setReducedMotion(true);
      return;
    }

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 });

    // Initial resets
    gsap.set('.req-node', { x: -300, opacity: 0 });
    gsap.set('.scene-1-text', { opacity: 0, y: 20 });
    gsap.set('.relay-gateway', { opacity: 0, scale: 0.95 });
    gsap.set('.relay-states > div', { opacity: 0, y: 10, position: 'absolute' });
    gsap.set('.upstream-node', { opacity: 0, x: 20 });
    gsap.set('.route-out-req', { opacity: 0, scale: 0.5 });
    gsap.set('.auth-panel', { opacity: 0, y: 30, scale: 0.95 });
    gsap.set('.auth-check', { opacity: 0, x: -10 });
    gsap.set('.dashboard-view', { opacity: 0, scale: 1.05, display: 'none' });
    gsap.set('.log-row-anim', { opacity: 0, x: -20 });
    gsap.set('.log-expanded', { height: 0, opacity: 0, overflow: 'hidden', paddingBottom: 0, paddingTop: 0 });
    gsap.set('.brand-frame', { opacity: 0, display: 'none' });
    gsap.set('.topology-view', { opacity: 1, scale: 1, x: 0, y: 0, display: 'flex' });
    gsap.set('.continuous-flow-req', { opacity: 0 });
    gsap.set('.gateway-ring', { scale: 0.8, opacity: 0 });

    // SCENE 01: The Traffic (0 - 3s)
    tl.addLabel('scene1', 0);
    // Inbound requests appear
    tl.to('.req-node', { x: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: 'power3.out' }, 'scene1');
    tl.to('.scene-1-text', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, 'scene1+=0.4');
    
    // Requests move towards center (Gateway)
    tl.to('.req-node', { x: 260, opacity: 0, duration: 1, stagger: 0.1, ease: 'power2.in' }, 'scene1+=2.5');
    tl.to('.scene-1-text', { opacity: 0, y: -10, duration: 0.8 }, 'scene1+=2.6');

    // SCENE 02: Relay (3 - 6s)
    tl.addLabel('scene2', 3.5);
    // Gateway powers on
    tl.to('.relay-gateway', { opacity: 1, scale: 1, duration: 1, ease: 'elastic.out(1, 0.7)' }, 'scene2');
    tl.to('.gateway-ring', { scale: 1.5, opacity: 0, duration: 1.5, ease: 'power2.out' }, 'scene2');
    
    // State indicators (ROUTE, AUTH, POLICY)
    tl.to('.relay-state-route', { opacity: 1, y: 0, duration: 0.4 }, 'scene2+=0.8');
    tl.to('.relay-state-route', { opacity: 0, y: -10, duration: 0.3 }, 'scene2+=1.5');
    
    tl.to('.relay-state-auth', { opacity: 1, y: 0, duration: 0.4 }, 'scene2+=1.6');
    tl.to('.relay-state-auth', { opacity: 0, y: -10, duration: 0.3 }, 'scene2+=2.3');
    
    tl.to('.relay-state-policy', { opacity: 1, y: 0, duration: 0.4 }, 'scene2+=2.4');
    
    // SCENE 03: Routing (6 - 9s)
    tl.addLabel('scene3', 6.5);
    tl.to('.relay-state-policy', { opacity: 0, y: -10, duration: 0.3 }, 'scene3');
    
    // Upstream APIs fade in
    tl.to('.upstream-node', { opacity: 1, x: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' }, 'scene3');
    
    // Routed requests shoot out
    tl.to('.route-out-req.r1', { opacity: 1, scale: 1, duration: 0.1 }, 'scene3+=0.5');
    tl.to('.route-out-req.r1', { x: 300, y: -120, duration: 1.0, ease: 'power2.inOut' }, 'scene3+=0.5');
    tl.to('.route-out-req.r1', { opacity: 0, duration: 0.2 }, 'scene3+=1.4');
    
    tl.to('.route-out-req.r2', { opacity: 1, scale: 1, duration: 0.1 }, 'scene3+=1.0');
    tl.to('.route-out-req.r2', { x: 300, y: 120, duration: 1.0, ease: 'power2.inOut' }, 'scene3+=1.0');
    tl.to('.route-out-req.r2', { opacity: 0, duration: 0.2 }, 'scene3+=1.9');

    // SCENE 04: Auth + Policy Zoom (9 - 13s)
    tl.addLabel('scene4', 9.5);
    // Dramatic zoom in to Gateway, pushing Upstreams out of view
    tl.to('.topology-view', { scale: 2.2, x: 50, y: 0, duration: 1.8, ease: 'power3.inOut' }, 'scene4');
    
    // Reveal high-contrast Auth panel
    tl.to('.auth-panel', { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out' }, 'scene4+=1.2');
    
    // Sequence security checks
    tl.to('.auth-check.c1', { opacity: 1, x: 0, duration: 0.4 }, 'scene4+=1.8');
    tl.to('.auth-check.c1 .status-text', { textContent: 'verified ✓', color: '#34d399', duration: 0.1 }, 'scene4+=2.1');
    
    tl.to('.auth-check.c2', { opacity: 1, x: 0, duration: 0.4 }, 'scene4+=2.4');
    tl.to('.auth-check.c2 .status-text', { textContent: 'Production ✓', color: '#34d399', duration: 0.1 }, 'scene4+=2.7');
    
    tl.to('.auth-check.c3', { opacity: 1, x: 0, duration: 0.4 }, 'scene4+=3.0');
    tl.to('.auth-check.c3 .status-text', { textContent: '184 / 1000 ✓', color: '#34d399', duration: 0.1 }, 'scene4+=3.3');

    // SCENE 05: Observability Dashboard (14 - 18s)
    tl.addLabel('scene5', 14.5);
    // Zoom out fast, dissolve network to reveal UI
    tl.to('.auth-panel', { opacity: 0, scale: 0.95, duration: 0.5, y: -20 }, 'scene5');
    tl.to('.topology-view', { opacity: 0, scale: 4, duration: 1.2, ease: 'power3.in' }, 'scene5+=0.2');
    tl.set('.topology-view', { display: 'none' });
    tl.set('.dashboard-view', { display: 'flex' }, 'scene5+=1.4');
    tl.to('.dashboard-view', { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out' }, 'scene5+=1.4');
    
    // Animate dashboard numbers
    tl.to('.metric-val.reqs', { textContent: '48.2', roundProps: 'textContent', duration: 1.5, ease: 'power2.out' }, 'scene5+=2.2');
    tl.to('.metric-val.succ', { textContent: '99.8', roundProps: 'textContent', duration: 1.5, ease: 'power2.out' }, 'scene5+=2.2');
    tl.to('.metric-val.lat', { textContent: '42', roundProps: 'textContent', duration: 1.5, ease: 'power2.out' }, 'scene5+=2.2');
    tl.to('.metric-val.keys', { textContent: '11', roundProps: 'textContent', duration: 1.5, ease: 'power2.out' }, 'scene5+=2.2');
    
    // Logs cascade in
    tl.to('.log-row-anim', { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out' }, 'scene5+=2.6');
    
    // Expand a specific log row to show detailed JSON body
    tl.to('.log-expanded', { height: 160, paddingTop: 16, paddingBottom: 16, opacity: 1, duration: 0.7, ease: 'power3.inOut' }, 'scene5+=3.8');

    // SCENE 06: The Whole System (19 - 22s)
    tl.addLabel('scene6', 20);
    // Dissolve Dashboard back to Topology view
    tl.to('.dashboard-view', { opacity: 0, scale: 0.95, duration: 0.8, ease: 'power2.inOut' }, 'scene6');
    tl.set('.dashboard-view', { display: 'none' });
    tl.set('.topology-view', { display: 'flex' });
    // Pull back to see entire system
    tl.to('.topology-view', { opacity: 1, scale: 0.75, x: 0, y: 0, duration: 1.5, ease: 'power3.inOut' }, 'scene6+=0.8');
    
    // Continuous stream of requests flowing through the system
    tl.to('.continuous-flow-req.r1', { opacity: 1, duration: 0.2 }, 'scene6+=2.0');
    tl.to('.continuous-flow-req.r1', { x: 700, duration: 2.5, ease: 'none', repeat: 1 }, 'scene6+=2.0');
    
    tl.to('.continuous-flow-req.r2', { opacity: 1, duration: 0.2 }, 'scene6+=2.5');
    tl.to('.continuous-flow-req.r2', { x: 700, duration: 2.5, ease: 'none', repeat: 1 }, 'scene6+=2.5');

    // SCENE 07: Brand End Frame (23 - 26s)
    tl.addLabel('scene7', 24);
    tl.to('.topology-view', { opacity: 0, scale: 0.6, duration: 1.2, ease: 'power2.in' }, 'scene7');
    tl.set('.topology-view', { display: 'none' });
    tl.set('.brand-frame', { display: 'flex' }, 'scene7+=1.2');
    tl.to('.brand-frame', { opacity: 1, duration: 1.5, ease: 'power2.out' }, 'scene7+=1.2');
    
    // Stagger in brand elements
    tl.fromTo('.brand-logo', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }, 'scene7+=1.5');
    tl.fromTo('.brand-subtitle', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, 'scene7+=1.9');
    tl.fromTo('.brand-tags', { opacity: 0 }, { opacity: 1, duration: 1 }, 'scene7+=2.4');
    tl.fromTo('.brand-cta', { opacity: 0, y: 10, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'back.out(1.5)' }, 'scene7+=2.8');

  }, { scope: containerRef });

  if (reducedMotion) {
    return (
      <div className="w-full h-full min-h-[600px] flex items-center justify-center bg-[#050505] text-[#ededed] font-sans">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4 font-pixel tracking-widest">RELAY_</h1>
          <p className="text-xl text-[#a1a1aa] mb-8 font-medium">API infrastructure for teams shipping fast.</p>
          <button className="px-6 py-3 bg-white text-black rounded-lg font-semibold shadow-lg">Get started &rarr;</button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full min-h-[700px] overflow-hidden bg-[#000000] text-[#ededed] font-sans flex items-center justify-center selection:bg-[#333]"
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 50%, #111111 0%, #000000 70%)'
      }}
    >
      <style>{`
        .font-pixel { font-family: 'Silkscreen', monospace; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        
        /* Premium Glows & Borders */
        .premium-border { border: 1px solid rgba(255,255,255,0.1); }
        .premium-panel { background: rgba(15, 15, 15, 0.95); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 1), 0 0 0 1px rgba(0,0,0,1); }
        
        /* Particles */
        .req-particle { background: #fff; width: 6px; height: 6px; border-radius: 50%; box-shadow: 0 0 10px #fff, 0 0 20px #fff; }
        .req-particle-blue { background: #60a5fa; box-shadow: 0 0 10px #60a5fa, 0 0 20px #3b82f6; }
        .req-particle-green { background: #34d399; box-shadow: 0 0 10px #34d399, 0 0 20px #10b981; }

        /* Scene Layouts */
        .topology-view {
          width: 1200px;
          height: 800px;
          position: absolute;
          left: 50%;
          top: 50%;
          margin-left: -600px;
          margin-top: -400px;
          display: flex;
          align-items: center;
          justify-content: center;
          /* Ensure z-index bounds */
          z-index: 10;
        }

        .dashboard-view {
          width: 1000px;
          height: 600px;
          position: absolute;
          left: 50%;
          top: 50%;
          margin-left: -500px;
          margin-top: -300px;
          background: #0a0a0a;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.05), 0 30px 60px rgba(0,0,0,1);
          overflow: hidden;
          z-index: 20;
        }
      `}</style>

      {/* --- TOPOLOGY VIEW (Scenes 01-04, 06) --- */}
      <div className="topology-view">
        
        {/* Intro Text */}
        <div className="scene-1-text absolute top-32 text-2xl font-medium tracking-wide text-[#ededed] drop-shadow-lg">
          Every API request has a path.
        </div>

        {/* Incoming Requests */}
        <div className="absolute left-[8%] top-[38%] flex flex-col gap-8">
          <div className="req-node flex items-center gap-4 bg-[#111] premium-border px-4 py-2 rounded-lg">
            <span className="font-mono text-sm text-[#34d399] font-bold">POST</span> 
            <span className="font-mono text-sm text-[#ededed]">/v1/users</span>
            <div className="req-particle ml-4" />
          </div>
          <div className="req-node flex items-center gap-4 bg-[#111] premium-border px-4 py-2 rounded-lg">
            <span className="font-mono text-sm text-[#60a5fa] font-bold">GET</span> 
            <span className="font-mono text-sm text-[#ededed]">/v1/orders</span>
            <div className="req-particle-blue ml-4" />
          </div>
          <div className="req-node flex items-center gap-4 bg-[#111] premium-border px-4 py-2 rounded-lg">
            <span className="font-mono text-sm text-[#34d399] font-bold">POST</span> 
            <span className="font-mono text-sm text-[#ededed]">/v1/payments</span>
            <div className="req-particle ml-4" />
          </div>
          <div className="req-node flex items-center gap-4 bg-[#111] premium-border px-4 py-2 rounded-lg">
            <span className="font-mono text-sm text-[#60a5fa] font-bold">GET</span> 
            <span className="font-mono text-sm text-[#ededed]">/v1/notifications</span>
            <div className="req-particle-blue ml-4" />
          </div>
        </div>

        {/* Central Gateway */}
        <div className="relative flex items-center justify-center z-10">
          <div className="gateway-ring absolute w-64 h-64 border border-[#333] rounded-full" />
          <div className="relay-gateway relative w-56 h-56 bg-[#0a0a0a] premium-border rounded-2xl flex flex-col items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.05)]">
            <div className="font-pixel text-3xl mb-2 text-white drop-shadow-md">RELAY_</div>
            <div className="font-mono text-xs text-[#a1a1aa] tracking-[0.2em]">GATEWAY</div>
            
            <div className="relay-states absolute bottom-8 flex justify-center w-full h-6 font-mono text-sm font-bold text-[#34d399]">
              <div className="relay-state-route">ROUTE</div>
              <div className="relay-state-auth">AUTH</div>
              <div className="relay-state-policy">POLICY</div>
            </div>
          </div>
        </div>

        {/* Auth Zoom Panel (Scene 04) */}
        {/* Notice absolute positioning directly in center to pop OVER the gateway */}
        <div className="auth-panel absolute z-50 w-80 premium-panel rounded-xl p-6">
          <div className="text-xs font-mono text-[#a1a1aa] mb-5 tracking-[0.15em] border-b border-white/10 pb-3">SECURITY LAYER</div>
          
          <div className="auth-check c1 mb-4 flex justify-between items-end">
            <div>
              <div className="text-[10px] text-[#71717a] font-mono uppercase mb-1">API KEY</div>
              <div className="text-sm font-mono text-[#ededed]">sk_live_••••••••</div>
            </div>
            <div className="status-text text-xs text-[#71717a] font-mono">checking...</div>
          </div>

          <div className="auth-check c2 mb-4 flex justify-between items-center">
            <div className="text-sm text-[#ededed]">Environment</div>
            <div className="status-text text-xs text-[#71717a] font-mono">checking...</div>
          </div>

          <div className="auth-check c3 flex justify-between items-center">
            <div className="text-sm text-[#ededed]">Rate limit</div>
            <div className="status-text text-xs text-[#71717a] font-mono">checking...</div>
          </div>
        </div>

        {/* Outgoing Requests (Scene 03) */}
        <div className="absolute z-0">
          <div className="route-out-req r1 absolute w-3 h-3 bg-white rounded-full shadow-[0_0_15px_#fff]" />
          <div className="route-out-req r2 absolute w-3 h-3 bg-white rounded-full shadow-[0_0_15px_#fff]" />
        </div>

        {/* Upstream Services */}
        <div className="absolute right-[8%] top-[50%] -mt-[140px] flex flex-col gap-24 z-0">
          <div className="upstream-node bg-[#111] premium-border p-5 rounded-xl w-48 shadow-lg">
            <div className="font-mono text-sm text-white mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#34d399]" />
              payments-api
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#a1a1aa]">Latency</span>
              <span className="text-[#ededed]">42ms</span>
            </div>
          </div>
          <div className="upstream-node bg-[#111] premium-border p-5 rounded-xl w-48 shadow-lg">
            <div className="font-mono text-sm text-white mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#34d399]" />
              notifications
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#a1a1aa]">Latency</span>
              <span className="text-[#ededed]">28ms</span>
            </div>
          </div>
        </div>

        {/* Continuous Flow (Scene 06) */}
        <div className="absolute left-[5%] top-[40%] flex flex-col gap-10 z-0 pointer-events-none">
          <div className="continuous-flow-req r1 absolute top-0 left-0 w-2 h-2 bg-[#60a5fa] rounded-full shadow-[0_0_12px_#60a5fa]" />
          <div className="continuous-flow-req r2 absolute top-[60px] left-0 w-2 h-2 bg-[#34d399] rounded-full shadow-[0_0_12px_#34d399]" />
        </div>
      </div>

      {/* --- DASHBOARD VIEW (Scene 05) --- */}
      <div className="dashboard-view">
        {/* Dashboard Header */}
        <div className="h-14 border-b border-white/10 flex items-center px-8 justify-between bg-[#050505]">
          <div className="flex items-center gap-6">
            <div className="font-pixel text-xl text-white">RELAY_</div>
            <div className="px-3 py-1 rounded bg-[#111] text-xs font-mono text-[#a1a1aa] border border-white/10">production</div>
          </div>
          <div className="flex items-center gap-4 text-sm text-[#a1a1aa]">
            <div>Overview</div>
            <div className="text-white">Logs</div>
            <div>Settings</div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-8 flex-1 flex flex-col gap-8 bg-[#0a0a0a]">
          
          {/* Metrics */}
          <div className="flex gap-6">
            <div className="flex-1 bg-[#111] premium-border rounded-xl p-5 shadow-md">
              <div className="text-xs text-[#a1a1aa] font-mono mb-2 tracking-wide">REQUESTS</div>
              <div className="text-4xl font-mono text-white flex items-baseline gap-1"><span className="metric-val reqs">0.0</span><span className="text-xl text-[#71717a]">K</span></div>
            </div>
            <div className="flex-1 bg-[#111] premium-border rounded-xl p-5 shadow-md">
              <div className="text-xs text-[#a1a1aa] font-mono mb-2 tracking-wide">SUCCESS RATE</div>
              <div className="text-4xl font-mono text-[#34d399] flex items-baseline gap-1"><span className="metric-val succ">0.0</span><span className="text-xl">%</span></div>
            </div>
            <div className="flex-1 bg-[#111] premium-border rounded-xl p-5 shadow-md">
              <div className="text-xs text-[#a1a1aa] font-mono mb-2 tracking-wide">P95 LATENCY</div>
              <div className="text-4xl font-mono text-white flex items-baseline gap-1"><span className="metric-val lat">0</span><span className="text-xl text-[#71717a]">ms</span></div>
            </div>
            <div className="flex-1 bg-[#111] premium-border rounded-xl p-5 shadow-md">
              <div className="text-xs text-[#a1a1aa] font-mono mb-2 tracking-wide">ACTIVE KEYS</div>
              <div className="text-4xl font-mono text-white"><span className="metric-val keys">0</span></div>
            </div>
          </div>

          {/* Logs */}
          <div className="flex-1 premium-border rounded-xl bg-[#0f0f0f] overflow-hidden flex flex-col shadow-lg">
            <div className="h-12 border-b border-white/10 bg-[#161616] flex items-center px-6 text-xs font-mono text-[#71717a] tracking-wide">
              <div className="w-20">STATUS</div>
              <div className="w-20">METHOD</div>
              <div className="flex-1">PATH</div>
              <div className="w-20 text-right">LATENCY</div>
            </div>
            
            <div className="p-3 flex flex-col gap-2 overflow-hidden">
              <div className="log-row-anim flex items-center px-3 py-3 text-sm font-mono rounded-lg bg-[#141414] border border-transparent">
                <div className="w-20 text-[#34d399]">200</div>
                <div className="w-20 text-[#60a5fa]">GET</div>
                <div className="flex-1 text-[#ededed]">/v1/users</div>
                <div className="w-20 text-right text-[#a1a1aa]">38ms</div>
              </div>
              
              <div className="log-row-anim flex items-center px-3 py-3 text-sm font-mono rounded-lg bg-[#141414] border border-transparent">
                <div className="w-20 text-[#34d399]">200</div>
                <div className="w-20 text-[#34d399]">POST</div>
                <div className="flex-1 text-[#ededed]">/v1/payments</div>
                <div className="w-20 text-right text-[#a1a1aa]">42ms</div>
              </div>

              {/* Expanded Log Row */}
              <div className="log-row-anim rounded-lg bg-[#1a1a1a] border border-white/10 overflow-hidden shadow-md">
                <div className="flex items-center px-3 py-3 text-sm font-mono cursor-pointer bg-[#222]">
                  <div className="w-20 text-[#f87171]">429</div>
                  <div className="w-20 text-[#34d399]">POST</div>
                  <div className="flex-1 text-white font-medium">/v1/payments</div>
                  <div className="w-20 text-right text-[#a1a1aa]">92ms</div>
                </div>
                <div className="log-expanded px-6 bg-[#1a1a1a] flex gap-12 border-t border-white/10">
                  <div className="flex-1">
                    <div className="text-xs text-[#71717a] font-mono mb-3 tracking-widest">RESPONSE BODY</div>
                    <div className="text-sm font-mono text-[#fca5a5] bg-[#222] p-4 rounded border border-[#f87171]/20">
                      &#123;<br/>
                      &nbsp;&nbsp;"error": "Rate limit exceeded",<br/>
                      &nbsp;&nbsp;"retry_after": 3600<br/>
                      &#125;
                    </div>
                  </div>
                  <div className="w-56">
                    <div className="text-xs text-[#71717a] font-mono mb-3 tracking-widest">METADATA</div>
                    <div className="flex justify-between text-sm font-mono mb-2 text-[#ededed]"><span>Region</span><span className="text-[#a1a1aa]">iad1</span></div>
                    <div className="flex justify-between text-sm font-mono mb-2 text-[#ededed]"><span>Cache</span><span className="text-[#a1a1aa]">MISS</span></div>
                    <div className="flex justify-between text-sm font-mono text-[#ededed]"><span>Key</span><span className="text-[#a1a1aa]">sk_live_...</span></div>
                  </div>
                </div>
              </div>

              <div className="log-row-anim flex items-center px-3 py-3 text-sm font-mono rounded-lg bg-[#141414] border border-transparent">
                <div className="w-20 text-[#34d399]">200</div>
                <div className="w-20 text-[#60a5fa]">GET</div>
                <div className="flex-1 text-[#ededed]">/v1/orders</div>
                <div className="w-20 text-right text-[#a1a1aa]">41ms</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- BRAND END FRAME (Scene 07) --- */}
      <div className="brand-frame absolute inset-0 flex items-center justify-center bg-[#000000] z-50">
        <div className="text-center">
          <h1 className="brand-logo text-7xl font-bold mb-6 font-pixel tracking-widest text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">RELAY_</h1>
          <p className="brand-subtitle text-2xl text-[#a1a1aa] mb-10 font-medium">API infrastructure for teams shipping fast.</p>
          
          <div className="brand-tags flex gap-6 justify-center text-sm text-[#71717a] font-mono mb-14">
            <span>Routing</span>
            <span>&middot;</span>
            <span>Auth</span>
            <span>&middot;</span>
            <span>Observability</span>
          </div>
          
          <button className="brand-cta px-10 py-4 bg-white text-black rounded-lg font-bold text-lg hover:bg-[#ededed] transition-colors shadow-[0_0_30px_rgba(255,255,255,0.3)]">
            Get started &rarr;
          </button>
        </div>
      </div>

    </div>
  );
}
