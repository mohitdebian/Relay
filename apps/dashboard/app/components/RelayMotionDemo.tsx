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

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });

    // Ensure initial states
    gsap.set('.scene-1-req', { x: -300, opacity: 0 });
    gsap.set('.scene-1-text', { opacity: 0, y: 20 });
    gsap.set('.relay-gateway', { opacity: 0, scale: 0.9 });
    gsap.set('.relay-states > div', { opacity: 0, y: 10, position: 'absolute' });
    gsap.set('.route-out-req', { x: 0, y: 0, opacity: 0, scale: 0.5 });
    gsap.set('.upstream-node', { opacity: 0, x: 20 });
    gsap.set('.auth-panel', { opacity: 0, y: 20, scale: 0.95 });
    gsap.set('.auth-check', { opacity: 0, x: -10 });
    gsap.set('.dashboard-view', { opacity: 0, scale: 1.05, display: 'none' });
    gsap.set('.log-row-anim', { opacity: 0, x: -20 });
    gsap.set('.log-expanded', { height: 0, opacity: 0, overflow: 'hidden' });
    gsap.set('.brand-frame', { opacity: 0, display: 'none' });
    gsap.set('.topology-view', { opacity: 1, scale: 1, x: 0 });
    gsap.set('.continuous-flow-req', { opacity: 0 });

    // SCENE 01: The Traffic (0 - 3s)
    tl.addLabel('scene1', 0);
    tl.to('.scene-1-req', { x: 0, opacity: 1, duration: 1.5, stagger: 0.15, ease: 'power2.out' }, 'scene1');
    tl.to('.scene-1-text', { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, 'scene1+=0.5');
    
    // Move requests closer to center
    tl.to('.scene-1-req', { x: 280, opacity: 0, duration: 1, stagger: 0.1, ease: 'power1.inOut' }, 'scene1+=2.5');
    tl.to('.scene-1-text', { opacity: 0, y: -10, duration: 0.8 }, 'scene1+=2.8');

    // SCENE 02: Relay (3 - 6s)
    tl.addLabel('scene2', 3.5);
    tl.to('.relay-gateway', { opacity: 1, scale: 1, duration: 1, ease: 'back.out(1.5)' }, 'scene2');
    
    // States: ROUTE, AUTH, POLICY
    tl.to('.relay-state-route', { opacity: 1, y: 0, duration: 0.4 }, 'scene2+=0.8');
    tl.to('.relay-state-route', { opacity: 0, y: -10, duration: 0.3 }, 'scene2+=1.5');
    
    tl.to('.relay-state-auth', { opacity: 1, y: 0, duration: 0.4 }, 'scene2+=1.6');
    tl.to('.relay-state-auth', { opacity: 0, y: -10, duration: 0.3 }, 'scene2+=2.3');
    
    tl.to('.relay-state-policy', { opacity: 1, y: 0, duration: 0.4 }, 'scene2+=2.4');
    
    // SCENE 03: Routing (6 - 9s)
    tl.addLabel('scene3', 6.5);
    tl.to('.relay-state-policy', { opacity: 0, y: -10, duration: 0.3 }, 'scene3');
    tl.to('.upstream-node', { opacity: 1, x: 0, duration: 0.8, stagger: 0.2, ease: 'power2.out' }, 'scene3+=0.2');
    
    // Request particles flowing out
    tl.to('.route-out-req.r1', { opacity: 1, scale: 1, duration: 0.2 }, 'scene3+=0.5');
    tl.to('.route-out-req.r1', { x: 250, y: -80, duration: 1.2, ease: 'power1.inOut' }, 'scene3+=0.5');
    tl.to('.route-out-req.r1', { opacity: 0, duration: 0.2 }, 'scene3+=1.6');
    
    tl.to('.route-out-req.r2', { opacity: 1, scale: 1, duration: 0.2 }, 'scene3+=1.0');
    tl.to('.route-out-req.r2', { x: 250, y: 80, duration: 1.2, ease: 'power1.inOut' }, 'scene3+=1.0');
    tl.to('.route-out-req.r2', { opacity: 0, duration: 0.2 }, 'scene3+=2.1');

    // SCENE 04: Auth + Policy (9 - 12s)
    tl.addLabel('scene4', 9.5);
    // Zoom into Gateway
    tl.to('.topology-view', { scale: 1.8, x: -100, y: 50, duration: 1.5, ease: 'power3.inOut' }, 'scene4');
    tl.to('.auth-panel', { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power2.out' }, 'scene4+=0.8');
    
    // Checks sequentially
    tl.to('.auth-check.c1', { opacity: 1, x: 0, duration: 0.3 }, 'scene4+=1.5');
    tl.to('.auth-check.c1 .status-text', { textContent: 'verified ✓', color: '#16a34a', duration: 0.1 }, 'scene4+=1.8');
    
    tl.to('.auth-check.c2', { opacity: 1, x: 0, duration: 0.3 }, 'scene4+=2.0');
    tl.to('.auth-check.c2 .status-text', { textContent: 'Production ✓', color: '#16a34a', duration: 0.1 }, 'scene4+=2.3');
    
    tl.to('.auth-check.c3', { opacity: 1, x: 0, duration: 0.3 }, 'scene4+=2.5');
    tl.to('.auth-check.c3 .status-text', { textContent: '184 / 1000 ✓', color: '#16a34a', duration: 0.1 }, 'scene4+=2.8');

    // SCENE 05: Observability (13 - 17s)
    tl.addLabel('scene5', 13);
    tl.to('.auth-panel', { opacity: 0, scale: 0.95, duration: 0.5 }, 'scene5');
    tl.to('.topology-view', { opacity: 0, scale: 2, duration: 1, ease: 'power2.in' }, 'scene5+=0.2');
    tl.set('.topology-view', { display: 'none' });
    tl.set('.dashboard-view', { display: 'flex' }, 'scene5+=1.2');
    tl.to('.dashboard-view', { opacity: 1, scale: 1, duration: 1, ease: 'power3.out' }, 'scene5+=1.2');
    
    // Metrics count up
    tl.to('.metric-val.reqs', { textContent: '48.2', roundProps: 'textContent', duration: 1.5, ease: 'power1.out' }, 'scene5+=2.0');
    tl.to('.metric-val.succ', { textContent: '99.8', roundProps: 'textContent', duration: 1.5, ease: 'power1.out' }, 'scene5+=2.0');
    tl.to('.metric-val.lat', { textContent: '42', roundProps: 'textContent', duration: 1.5, ease: 'power1.out' }, 'scene5+=2.0');
    
    // Log rows appear
    tl.to('.log-row-anim', { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' }, 'scene5+=2.5');
    
    // Expand row
    tl.to('.log-expanded', { height: 120, opacity: 1, duration: 0.6, ease: 'power2.inOut' }, 'scene5+=3.5');

    // SCENE 06: The Whole System (18 - 21s)
    tl.addLabel('scene6', 18);
    tl.to('.dashboard-view', { opacity: 0, scale: 0.95, duration: 0.8 }, 'scene6');
    tl.set('.dashboard-view', { display: 'none' });
    tl.set('.topology-view', { display: 'flex' });
    tl.set('.relay-gateway', { className: 'relay-gateway full-system' });
    tl.to('.topology-view', { opacity: 1, scale: 0.85, x: 0, y: 0, duration: 1.5, ease: 'power3.inOut' }, 'scene6+=0.8');
    
    // Continuous flow
    tl.to('.continuous-flow-req.r1', { opacity: 1, duration: 0.2 }, 'scene6+=2.0');
    tl.to('.continuous-flow-req.r1', { x: 600, duration: 2.5, ease: 'none', repeat: 1 }, 'scene6+=2.0');
    
    tl.to('.continuous-flow-req.r2', { opacity: 1, duration: 0.2 }, 'scene6+=2.8');
    tl.to('.continuous-flow-req.r2', { x: 600, duration: 2.5, ease: 'none', repeat: 1 }, 'scene6+=2.8');

    // SCENE 07: Brand End Frame (22 - 25s)
    tl.addLabel('scene7', 22.5);
    tl.to('.topology-view', { opacity: 0, duration: 1 }, 'scene7');
    tl.set('.topology-view', { display: 'none' });
    tl.set('.brand-frame', { display: 'flex' }, 'scene7+=1');
    tl.to('.brand-frame', { opacity: 1, duration: 1.5, ease: 'power2.out' }, 'scene7+=1');
    
    // Brand elements
    tl.fromTo('.brand-logo', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, 'scene7+=1.5');
    tl.fromTo('.brand-subtitle', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 'scene7+=2.0');
    tl.fromTo('.brand-tags', { opacity: 0 }, { opacity: 1, duration: 0.8 }, 'scene7+=2.5');
    tl.fromTo('.brand-cta', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 'scene7+=3.0');

  }, { scope: containerRef });

  if (reducedMotion) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a] text-[#f0f0f0] font-sans">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 font-pixel">RELAY_</h1>
          <p className="text-xl text-gray-400 mb-6">API infrastructure for teams shipping fast.</p>
          <div className="flex gap-4 justify-center text-sm text-gray-500 font-mono mb-8">
            <span>Routing</span>
            <span>&middot;</span>
            <span>Auth</span>
            <span>&middot;</span>
            <span>Observability</span>
          </div>
          <button className="px-6 py-2 bg-white text-black rounded font-medium">Get started &rarr;</button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full min-h-[600px] overflow-hidden bg-[#0a0a0a] text-[#f0f0f0] font-sans flex items-center justify-center selection:bg-[#333]"
      style={{
        boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)',
        // Load custom fonts inside this container specifically if not globally available,
        // but since we are in the Relay app, globals.css handles it.
      }}
    >
      <style>{`
        .font-pixel { font-family: 'Silkscreen', monospace; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .node-border { border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
        .glow { box-shadow: 0 0 15px rgba(255,255,255,0.05); }
        .req-particle { background: rgba(255,255,255,0.9); box-shadow: 0 0 8px rgba(255,255,255,0.6); width: 6px; height: 6px; border-radius: 50%; }
        
        .topology-view {
          width: 1000px;
          height: 600px;
          position: absolute;
          left: 50%;
          top: 50%;
          margin-left: -500px;
          margin-top: -300px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dashboard-view {
          width: 900px;
          height: 540px;
          position: absolute;
          left: 50%;
          top: 50%;
          margin-left: -450px;
          margin-top: -270px;
          background: #111;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 50px rgba(0,0,0,0.8);
          overflow: hidden;
        }
      `}</style>

      {/* --- TOPOLOGY SCENES (01 - 04, 06) --- */}
      <div className="topology-view">
        
        {/* Intro Text */}
        <div className="scene-1-text absolute top-20 text-xl font-medium tracking-wide text-gray-300">
          Every API request has a path.
        </div>

        {/* Incoming Requests */}
        <div className="absolute left-[10%] top-[40%] flex flex-col gap-6">
          <div className="scene-1-req flex items-center gap-3 font-mono text-sm text-gray-400">
            <span className="text-green-500 font-bold">POST</span> /v1/users
            <div className="req-particle ml-4" />
          </div>
          <div className="scene-1-req flex items-center gap-3 font-mono text-sm text-gray-400">
            <span className="text-blue-500 font-bold">GET</span> /v1/orders
            <div className="req-particle ml-4" />
          </div>
          <div className="scene-1-req flex items-center gap-3 font-mono text-sm text-gray-400">
            <span className="text-green-500 font-bold">POST</span> /v1/payments
            <div className="req-particle ml-4" />
          </div>
          <div className="scene-1-req flex items-center gap-3 font-mono text-sm text-gray-400">
            <span className="text-blue-500 font-bold">GET</span> /v1/notifications
            <div className="req-particle ml-4" />
          </div>
        </div>

        {/* Central Gateway */}
        <div className="relay-gateway absolute w-48 h-48 bg-[#0f0f0f] node-border rounded-xl flex flex-col items-center justify-center glow relative z-10">
          <div className="font-pixel text-2xl mb-2">RELAY_</div>
          <div className="font-mono text-xs text-gray-500 tracking-widest">GATEWAY</div>
          
          <div className="relay-states absolute bottom-6 flex justify-center w-full h-5 font-mono text-xs font-semibold text-green-400">
            <div className="relay-state-route">ROUTE</div>
            <div className="relay-state-auth">AUTH</div>
            <div className="relay-state-policy">POLICY</div>
          </div>
        </div>

        {/* Auth Zoom Panel (Scene 04) */}
        <div className="auth-panel absolute z-20 w-72 bg-[#161616] node-border rounded-lg p-5 shadow-2xl backdrop-blur-md">
          <div className="text-xs font-mono text-gray-500 mb-4 tracking-widest">AUTHENTICATION</div>
          
          <div className="auth-check c1 mb-3 pb-3 border-b border-gray-800 flex justify-between items-end">
            <div>
              <div className="text-[10px] text-gray-500 font-mono uppercase mb-1">API KEY</div>
              <div className="text-sm font-mono text-gray-300">sk_live_••••••••</div>
            </div>
            <div className="status-text text-xs text-gray-500 font-mono">checking...</div>
          </div>

          <div className="auth-check c2 mb-3 pb-3 border-b border-gray-800 flex justify-between items-center">
            <div className="text-sm text-gray-300">Environment</div>
            <div className="status-text text-xs text-gray-500 font-mono">checking...</div>
          </div>

          <div className="auth-check c3 flex justify-between items-center">
            <div className="text-sm text-gray-300">Rate limit</div>
            <div className="status-text text-xs text-gray-500 font-mono">checking...</div>
          </div>
        </div>

        {/* Outgoing Requests (Scene 03) */}
        <div className="absolute">
          <div className="route-out-req r1 absolute w-3 h-3 bg-white rounded-full shadow-[0_0_10px_#fff]" />
          <div className="route-out-req r2 absolute w-3 h-3 bg-white rounded-full shadow-[0_0_10px_#fff]" />
        </div>

        {/* Upstream Services */}
        <div className="absolute right-[15%] top-[50%] -mt-[100px] flex flex-col gap-12">
          <div className="upstream-node bg-[#0f0f0f] node-border p-4 rounded-lg w-40">
            <div className="font-mono text-sm text-gray-300 mb-2">payments-api</div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-green-500">Healthy</span>
              <span className="text-gray-500">42ms</span>
            </div>
          </div>
          <div className="upstream-node bg-[#0f0f0f] node-border p-4 rounded-lg w-40">
            <div className="font-mono text-sm text-gray-300 mb-2">notifications</div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-green-500">Healthy</span>
              <span className="text-gray-500">28ms</span>
            </div>
          </div>
        </div>

        {/* Continuous Flow (Scene 06) */}
        <div className="absolute left-[10%] top-[40%] flex flex-col gap-6 z-0">
          <div className="continuous-flow-req r1 absolute top-0 left-0 w-2 h-2 bg-blue-400 rounded-full blur-[1px]" />
          <div className="continuous-flow-req r2 absolute top-[40px] left-0 w-2 h-2 bg-green-400 rounded-full blur-[1px]" />
        </div>
      </div>

      {/* --- DASHBOARD SCENE (05) --- */}
      <div className="dashboard-view">
        {/* Dashboard Header */}
        <div className="h-12 border-b border-[rgba(255,255,255,0.1)] flex items-center px-6 justify-between bg-[#141414]">
          <div className="flex items-center gap-4">
            <div className="font-pixel text-lg">RELAY_</div>
            <div className="px-2 py-0.5 rounded bg-gray-800 text-xs font-mono text-gray-400 border border-gray-700">production</div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-8 flex-1 flex flex-col gap-8 bg-[#0a0a0a]">
          
          {/* Metrics */}
          <div className="flex gap-4">
            <div className="flex-1 bg-[#111] border border-gray-800 rounded-lg p-5">
              <div className="text-xs text-gray-500 font-mono mb-2">REQUESTS</div>
              <div className="text-3xl font-mono flex items-baseline gap-1"><span className="metric-val reqs">0.0</span><span className="text-lg text-gray-500">K</span></div>
            </div>
            <div className="flex-1 bg-[#111] border border-gray-800 rounded-lg p-5">
              <div className="text-xs text-gray-500 font-mono mb-2">SUCCESS RATE</div>
              <div className="text-3xl font-mono text-green-400 flex items-baseline gap-1"><span className="metric-val succ">0.0</span><span className="text-lg">%</span></div>
            </div>
            <div className="flex-1 bg-[#111] border border-gray-800 rounded-lg p-5">
              <div className="text-xs text-gray-500 font-mono mb-2">P95 LATENCY</div>
              <div className="text-3xl font-mono flex items-baseline gap-1"><span className="metric-val lat">0</span><span className="text-lg text-gray-500">ms</span></div>
            </div>
            <div className="flex-1 bg-[#111] border border-gray-800 rounded-lg p-5">
              <div className="text-xs text-gray-500 font-mono mb-2">ACTIVE KEYS</div>
              <div className="text-3xl font-mono">11</div>
            </div>
          </div>

          {/* Logs */}
          <div className="flex-1 border border-gray-800 rounded-lg bg-[#111] overflow-hidden flex flex-col">
            <div className="h-10 border-b border-gray-800 bg-[#161616] flex items-center px-4 text-xs font-mono text-gray-500">
              <div className="w-16">STATUS</div>
              <div className="w-16">METHOD</div>
              <div className="flex-1">PATH</div>
              <div className="w-16 text-right">LATENCY</div>
            </div>
            
            <div className="p-2 flex flex-col gap-1">
              <div className="log-row-anim flex items-center px-2 py-2 text-sm font-mono rounded hover:bg-gray-800 transition-colors">
                <div className="w-16 text-green-400">200</div>
                <div className="w-16 text-blue-400">GET</div>
                <div className="flex-1 text-gray-300">/v1/users</div>
                <div className="w-16 text-right text-gray-500">38ms</div>
              </div>
              
              <div className="log-row-anim flex items-center px-2 py-2 text-sm font-mono rounded hover:bg-gray-800 transition-colors">
                <div className="w-16 text-green-400">200</div>
                <div className="w-16 text-green-400">POST</div>
                <div className="flex-1 text-gray-300">/v1/payments</div>
                <div className="w-16 text-right text-gray-500">42ms</div>
              </div>

              {/* Expanded Log Row */}
              <div className="log-row-anim rounded bg-[#1a1a1a] border border-gray-700 overflow-hidden">
                <div className="flex items-center px-2 py-2 text-sm font-mono cursor-pointer bg-[#222]">
                  <div className="w-16 text-red-400">429</div>
                  <div className="w-16 text-green-400">POST</div>
                  <div className="flex-1 text-white font-medium">/v1/payments</div>
                  <div className="w-16 text-right text-gray-400">92ms</div>
                </div>
                <div className="log-expanded px-4 py-3 bg-[#1a1a1a] flex gap-8 border-t border-gray-800">
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 font-mono mb-2">RESPONSE</div>
                    <div className="text-sm font-mono text-red-300">
                      &#123;<br/>
                      &nbsp;&nbsp;"error": "Rate limit exceeded",<br/>
                      &nbsp;&nbsp;"retry_after": 3600<br/>
                      &#125;
                    </div>
                  </div>
                  <div className="w-48">
                    <div className="text-xs text-gray-500 font-mono mb-2">DETAILS</div>
                    <div className="flex justify-between text-sm font-mono mb-1 text-gray-300"><span>Region</span><span className="text-gray-500">iad1</span></div>
                    <div className="flex justify-between text-sm font-mono mb-1 text-gray-300"><span>Cache</span><span className="text-gray-500">MISS</span></div>
                    <div className="flex justify-between text-sm font-mono text-gray-300"><span>Key</span><span className="text-gray-500">sk_live_...</span></div>
                  </div>
                </div>
              </div>

              <div className="log-row-anim flex items-center px-2 py-2 text-sm font-mono rounded hover:bg-gray-800 transition-colors">
                <div className="w-16 text-green-400">200</div>
                <div className="w-16 text-blue-400">GET</div>
                <div className="flex-1 text-gray-300">/v1/orders</div>
                <div className="w-16 text-right text-gray-500">41ms</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- BRAND END FRAME (07) --- */}
      <div className="brand-frame absolute inset-0 flex items-center justify-center bg-[#0a0a0a] z-30">
        <div className="text-center">
          <h1 className="brand-logo text-6xl font-bold mb-6 font-pixel tracking-widest text-white">RELAY_</h1>
          <p className="brand-subtitle text-2xl text-gray-300 mb-8 font-medium">API infrastructure for teams shipping fast.</p>
          
          <div className="brand-tags flex gap-6 justify-center text-sm text-gray-500 font-mono mb-12">
            <span>Routing</span>
            <span>&middot;</span>
            <span>Auth</span>
            <span>&middot;</span>
            <span>Observability</span>
          </div>
          
          <button className="brand-cta px-8 py-3 bg-white text-black rounded font-medium text-lg hover:bg-gray-200 transition-colors">
            Get started &rarr;
          </button>
        </div>
      </div>

    </div>
  );
}
