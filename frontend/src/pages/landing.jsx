import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SoftAurora from '../components/SoftAurora';
import { Video, Users, Shield, Zap, ArrowRight, MonitorSmartphone, Globe, Mic, Link2 } from 'lucide-react';
import { motion } from 'framer-motion';

const PRI = '#ff6e7f';
const SEC = '#bfe9ff';

export default function LandingPage() {
    const router = useNavigate();
    const [showJoinModal, setShowJoinModal] = React.useState(false);
    const [joinCode, setJoinCode] = React.useState('');
    const isLoggedIn = !!localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        router('/');
    };

    const fadeUp = {
        hidden: { opacity: 0, y: 24 },
        visible: (custom = 0) => ({
            opacity: 1, y: 0,
            transition: { duration: 0.75, delay: custom * 0.12, ease: [0.25, 0.4, 0.25, 1] }
        })
    };

    const handleJoin = () => {
        if (joinCode.trim()) router(`/${joinCode.trim()}`);
    };

    return (
        <>
            <style>{`
                .ff-display { font-family: 'Fraunces', Georgia, serif; }
                .ff-body    { font-family: 'DM Sans', system-ui, sans-serif; }

                .grad-bg { background: linear-gradient(115deg, ${PRI} 0%, ${SEC} 100%); }

                .glass-nav {
                    background: rgba(5, 8, 15, 0.38);
                    backdrop-filter: blur(32px);
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                }
                .glass-card {
                    background: rgba(5, 8, 15, 0.58);
                    backdrop-filter: blur(32px);
                    border: 1px solid rgba(255,255,255,0.08);
                    box-shadow: 0 12px 40px rgba(0,0,0,0.30);
                }
                .glass-pill {
                    background: rgba(5, 8, 15, 0.35);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(255,255,255,0.07);
                    transition: all 0.2s ease;
                }
                .glass-pill:hover {
                    border-color: rgba(255,110,127,0.30);
                    background: rgba(255,110,127,0.06);
                }
                .glass-stats {
                    background: rgba(5, 8, 15, 0.38);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 14px;
                    overflow: hidden;
                }
                .glass-window {
                    background: rgba(5, 8, 15, 0.48);
                    backdrop-filter: blur(24px);
                    border: 1px solid rgba(255,255,255,0.09);
                    box-shadow: 0 40px 80px rgba(0,0,0,0.55), 0 8px 24px rgba(0,0,0,0.30);
                }
                .glass-titlebar {
                    background: rgba(5, 8, 15, 0.42);
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .glass-toolbar {
                    background: rgba(5, 8, 15, 0.55);
                    backdrop-filter: blur(28px);
                    border: 1px solid rgba(255,255,255,0.07);
                }
                .glass-feature {
                    background: rgba(5, 8, 15, 0.28);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 20px;
                }
                .glass-feature-item {
                    border-radius: 14px;
                    transition: background 0.2s ease;
                }
                .glass-feature-item:hover { background: rgba(255,255,255,0.02); }

                .logo-mark {
                    background: rgba(191,233,255,0.08);
                    border: 1px solid rgba(191,233,255,0.18);
                    transition: all 0.3s ease;
                }
                .logo-mark:hover {
                    background: rgba(255,110,127,0.12);
                    border-color: rgba(255,110,127,0.28);
                }

                .nav-pill-group {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.06);
                    backdrop-filter: blur(16px);
                }

                .btn-nav {
                    background: transparent; border: none; cursor: pointer;
                    font-family: 'DM Sans', system-ui, sans-serif;
                    font-size: 13.5px; font-weight: 500;
                    padding: 8px 18px; border-radius: 100px;
                    color: ${SEC}; transition: all 0.22s ease;
                }
                .btn-nav:hover { background: rgba(255,110,127,0.10); color: ${PRI}; }

                .btn-signin {
                    background: rgba(191,233,255,0.08);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(191,233,255,0.18);
                    color: ${SEC};
                    font-family: 'DM Sans', system-ui, sans-serif;
                    font-size: 13px; font-weight: 600; cursor: pointer;
                    border-radius: 100px; transition: all 0.22s ease;
                    display: inline-flex; align-items: center; gap: 6px;
                    padding: 8px 20px;
                }
                .btn-signin:hover {
                    background: rgba(255,110,127,0.12);
                    border-color: rgba(255,110,127,0.30);
                    color: ${PRI}; transform: translateY(-1px);
                }

                .btn-primary-cta {
                    position: relative; transition: transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s;
                    box-shadow: 0 2px 12px rgba(255,110,127,0.22), 0 1px 4px rgba(0,0,0,0.28);
                }
                .btn-primary-cta::before {
                    content: ''; position: absolute; inset: -18px -22px; border-radius: 100px;
                    background: radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,110,127,0.30) 0%, rgba(191,233,255,0.12) 48%, transparent 72%);
                    filter: blur(18px); z-index: -1; animation: bloom-breathe 4s ease-in-out infinite;
                }
                .btn-primary-cta::after {
                    content: ''; position: absolute; inset: -4px -6px; border-radius: 100px;
                    background: radial-gradient(ellipse 90% 70% at 50% 60%, rgba(255,110,127,0.24) 0%, rgba(255,110,127,0.06) 55%, transparent 75%);
                    filter: blur(8px); z-index: -1; animation: bloom-breathe 4s ease-in-out infinite; animation-delay: 0.3s;
                }
                @keyframes bloom-breathe {
                    0%, 100% { opacity: 0.75; transform: scale(1); }
                    50%       { opacity: 1;    transform: scale(1.06); }
                }
                .btn-primary-cta:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 6px 28px rgba(255,110,127,0.30), 0 2px 8px rgba(191,233,255,0.12); }
                .btn-primary-cta:active { transform: scale(0.97); }

                .btn-ghost {
                    background: rgba(191,233,255,0.06); backdrop-filter: blur(16px);
                    border: 1px solid rgba(191,233,255,0.14); color: ${SEC};
                    transition: all 0.22s ease; cursor: pointer;
                    font-family: 'DM Sans', system-ui, sans-serif;
                    font-size: 14px; font-weight: 500;
                }
                .btn-ghost:hover { border-color: rgba(255,110,127,0.75); color: ${PRI}; transform: translateY(-1px); }
                .btn-ghost:active { transform: scale(0.97); }

                .ctrl-tool {
                    background: rgba(191,233,255,0.06); border: none; cursor: pointer;
                    border-radius: 10px; transition: all 0.15s ease; color: ${SEC};
                    display: flex; align-items: center; justify-content: center;
                }
                .ctrl-tool:hover { background: rgba(255,110,127,0.10); color: ${PRI}; transform: scale(1.05); }

                .ctrl-tool-end {
                    background: rgba(255,110,127,0.80); border: none; border-radius: 10px;
                    cursor: pointer; color: white;
                    font-family: 'DM Sans', system-ui, sans-serif; font-size: 13px; font-weight: 600;
                    display: flex; align-items: center; justify-content: center; gap: 6px;
                    transition: all 0.15s ease; box-shadow: 0 2px 12px rgba(255,110,127,0.28);
                }
                .ctrl-tool-end:hover { background: rgba(255,110,127,0.95); transform: scale(1.03); }

                .stat-div { width: 1px; background: rgba(255,255,255,0.06); align-self: stretch; }

                @keyframes ping-dot { 0%{ transform: scale(1); opacity: 0.75; } 100%{ transform: scale(2.6); opacity: 0; } }
                .ping-dot { animation: ping-dot 1.6s cubic-bezier(0,0,0.2,1) infinite; }

                @keyframes float-a { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
                @keyframes float-b { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
                .float-a { animation: float-a 3.8s ease-in-out infinite; }
                .float-b { animation: float-b 4.4s ease-in-out infinite; animation-delay: 1.2s; }

                @keyframes rec-blink { 0%,100%{opacity:1} 50%{opacity:0.25} }
                .rec-dot { animation: rec-blink 1.9s ease-in-out infinite; }

                /* Join Modal */
                .join-modal-overlay {
                    position: fixed; inset: 0; z-index: 200;
                    background: rgba(0,0,0,0.70);
                    backdrop-filter: blur(8px);
                    display: flex; align-items: center; justify-content: center;
                    padding: 0 16px;
                    animation: fadeIn 0.18s ease;
                }
                @keyframes fadeIn { from{opacity:0} to{opacity:1} }
                .join-modal-card {
                    @media (max-width: 768px) {
                        .glass-nav { padding: 12px 16px; }
                        .glass-feature { display: none; }
                        .join-modal-card { padding: 24px 18px 20px; }
                    }
                    background: rgba(5,8,15,0.96);
                    border: 1px solid rgba(191,233,255,0.14);
                    border-radius: 22px;
                    padding: 34px 30px 28px;
                    width: 100%; max-width: 420px;
                    box-shadow: 0 40px 80px rgba(0,0,0,0.65);
                    position: relative;
                    animation: slideUp 0.22s cubic-bezier(0.16,1,0.3,1);
                }
                .join-modal-card::before {
                    content: '';
                    position: absolute; top: 0; left: 24px; right: 24px; height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(191,233,255,0.25) 40%, rgba(255,110,127,0.18) 70%, transparent);
                }
                @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
                .join-modal-input {
                    width: 100%;
                    background: rgba(191,233,255,0.05);
                    border: 1px solid rgba(191,233,255,0.18);
                    border-radius: 13px;
                    padding: 13px 13px 13px 42px;
                    font-family: 'DM Sans', system-ui, sans-serif;
                    font-size: 14px;
                    color: rgba(255,255,255,0.85);
                    outline: none;
                    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
                    box-sizing: border-box;
                }
                .join-modal-input::placeholder { color: rgba(191,233,255,0.22); }
                .join-modal-input:focus {
                    border-color: rgba(191,233,255,0.38);
                    background: rgba(191,233,255,0.07);
                    box-shadow: 0 0 0 3px rgba(191,233,255,0.07);
                }

                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: #05080f; }
                ::-webkit-scrollbar-thumb { background: rgba(255,110,127,0.18); border-radius: 2px; }
            `}</style>

            <div className="ff-body relative min-h-screen bg-[#05080f] overflow-x-hidden">

                <div className="fixed inset-0 z-0">
                    <SoftAurora
                        speed={0.42} scale={1.75} brightness={1}
                        color1={PRI} color2={SEC}
                        noiseFrequency={2.1} noiseAmplitude={1.2}
                        bandHeight={0.45} bandSpread={1.1}
                        octaveDecay={0.14} layerOffset={0} colorSpeed={0.82}
                        enableMouseInteraction mouseInfluence={0.40}
                    />
                </div>

                {/* ── NAV ── */}
                <motion.nav
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65, ease: 'easeOut' }}
                    className="glass-nav fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-16 py-4">

                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => router('/')}>
                        <div className="logo-mark w-9 h-9 rounded-[11px] flex items-center justify-center">
                            <Video size={17} strokeWidth={2.2} style={{ color: SEC }} />
                        </div>
                        <span className="ff-display text-[1.15rem] font-normal tracking-tight" style={{ color: SEC }}>
                            Connect<span style={{ color: PRI, fontWeight: 700 }}>X</span>
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-2">
                        {isLoggedIn ? (
                            <>
                                <button onClick={() => router('/home')} className="btn-nav">Home</button>
                                <button onClick={handleLogout} className="btn-signin">
                                    Logout <ArrowRight size={13} strokeWidth={2.2} />
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-0.5 nav-pill-group rounded-full">
                                    <button onClick={() => router('/auth')} className="btn-nav">Register</button>
                                </div>
                                <button onClick={() => router('/auth')} className="btn-signin">
                                    Sign In <ArrowRight size={13} strokeWidth={2.2} />
                                </button>
                            </>
                        )}
                    </div>
                </motion.nav>

                {/* ── HERO ── */}
                <div className="relative z-10 min-h-screen flex items-center pt-10 pb-16 lg:pt-24 lg:pb-20 px-6 lg:px-16">
                    <div className="max-w-[1360px] mx-auto w-full flex flex-col lg:flex-row items-center gap-14 lg:gap-10">

                        {/* LEFT */}
                        <div className="flex-1 text-center lg:text-left flex flex-col gap-6 z-20">

                            <motion.h1
                                custom={1} initial="hidden" animate="visible" variants={fadeUp}
                                className="ff-display font-light leading-[1.06] tracking-tight text-5xl sm:text-6xl lg:text-7xl xl:text-[4.8rem]"
                                style={{ color: SEC, textShadow: '0 2px 40px rgba(0,0,0,0.50)' }}>
                                <span className="block mb-1">Distance means</span>
                                <span className="italic block" style={{ color: PRI, textShadow: `0 2px 30px rgba(255,110,127,0.18)` }}>
                                    absolutely nothing.
                                </span>
                            </motion.h1>

                            <motion.p
                                custom={2} initial="hidden" animate="visible" variants={fadeUp}
                                className="text-lg lg:text-[1.15rem] font-light max-w-[460px] mx-auto lg:mx-0 leading-relaxed"
                                style={{ color: 'rgba(191,233,255,0.55)', textShadow: '0 1px 16px rgba(0,0,0,0.40)' }}>
                                Crystal-clear, secure video conferences.
                                Connect with{' '}
                                <span style={{ color: 'rgba(191,233,255,0.75)', fontWeight: 500 }}>loved ones or teammates</span>
                                {' '}from anywhere — zero friction.
                            </motion.p>

                            {/* CTAs */}
                            <motion.div
                                custom={3} initial="hidden" animate="visible" variants={fadeUp}
                                className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                                <Link to={localStorage.getItem('token') ? '/home' : '/auth'}
                                    className="btn-primary-cta grad-bg w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-slate-900 text-[14.5px] font-bold no-underline">
                                    Start a meeting
                                    <ArrowRight size={16} strokeWidth={2.6} />
                                </Link>
                                <button
                                    onClick={() => { setJoinCode(''); setShowJoinModal(true); }}
                                    className="btn-ghost w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full">
                                    Join existing room
                                </button>
                            </motion.div>

                            {/* Stats */}
                            <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp}
                                className="glass-stats flex items-stretch w-fit self-center lg:self-start">
                                {[
                                    { val: '10M+', lbl: 'Users' },
                                    { val: '99.9%', lbl: 'Uptime' },
                                    { val: '4K', lbl: 'Quality' },
                                    { val: '150ms', lbl: 'Latency' },
                                ].map(({ val, lbl }, i, arr) => (
                                    <React.Fragment key={lbl}>
                                        <div className="flex flex-col items-center justify-center px-5 py-3">
                                            <span className="ff-display text-[1.05rem] font-light" style={{ color: 'rgba(248,250,252,0.80)' }}>{val}</span>
                                            <span style={{ fontSize: '8.5px', fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'rgba(191,233,255,0.35)', marginTop: 2 }}>
                                                {lbl}
                                            </span>
                                        </div>
                                        {i < arr.length - 1 && <div className="stat-div" />}
                                    </React.Fragment>
                                ))}
                            </motion.div>
                        </div>

                        {/* RIGHT: App window */}
                        <motion.div
                            custom={2} initial="hidden" animate="visible" variants={fadeUp}
                            className="flex-1 w-full max-w-2xl lg:max-w-none relative z-10 mt-6 lg:mt-0">

                            <div className="absolute pointer-events-none"
                                style={{
                                    inset: '-8%', borderRadius: '50%',
                                    background: `radial-gradient(ellipse, rgba(255,110,127,0.10) 0%, rgba(191,233,255,0.05) 55%, transparent 72%)`,
                                    filter: 'blur(55px)',
                                }} />

                            <motion.div
                                animate={{ y: [-7, 7, -7] }}
                                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                                className="glass-window relative rounded-2xl overflow-hidden">

                                {/* Titlebar */}
                                <div className="glass-titlebar flex items-center gap-2 px-4 py-3">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: PRI, opacity: 0.6 }} />
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 opacity-50" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 opacity-50" />
                                    <div className="mx-auto flex items-center gap-1.5" style={{ fontSize: '10.5px', fontWeight: 500, color: 'rgba(191,233,255,0.40)' }}>
                                        <Shield size={10} style={{ color: 'rgba(191,233,255,0.50)' }} />
                                        End-to-end Encrypted · Room #A7K2
                                    </div>
                                    <div className="flex items-center gap-1.5" style={{ fontSize: '10px', color: 'rgba(191,233,255,0.40)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: 100 }}>
                                        <span className="rec-dot w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'rgba(255,110,127,0.70)' }} />
                                        04:23:11
                                    </div>
                                </div>

                                {/* Video area */}
                                <div className="relative bg-slate-950" style={{ aspectRatio: '16/9' }}>
                                    <img
                                        src="https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&w=1080&q=85"
                                        alt="Video call"
                                        className="w-full h-full object-cover brightness-75 saturate-75"
                                    />
                                    <div className="absolute inset-0 pointer-events-none"
                                        style={{ background: 'linear-gradient(180deg, rgba(5,8,15,0.32) 0%, transparent 30%, transparent 60%, rgba(5,8,15,0.65) 100%)' }} />

                                    {/* PiP */}
                                    <div className="absolute top-3 right-3 overflow-hidden rounded-[9px] border border-white/10 shadow-lg"
                                        style={{ width: '21%', aspectRatio: '4/3' }}>
                                        <img
                                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80"
                                            alt="You"
                                            className="w-full h-full object-cover brightness-75 saturate-75"
                                        />
                                        <div className="absolute bottom-1.5 left-2" style={{ fontSize: '9px', fontWeight: 500, color: 'rgba(191,233,255,0.60)', background: 'rgba(5,8,15,0.60)', backdropFilter: 'blur(8px)', padding: '2px 6px', borderRadius: 100 }}>
                                            You
                                        </div>
                                    </div>

                                    {/* Speaking label */}
                                    <div className="absolute bottom-14 left-4" style={{ fontSize: '10.5px', fontWeight: 500, color: 'rgba(191,233,255,0.55)', background: 'rgba(5,8,15,0.55)', backdropFilter: 'blur(8px)', padding: '4px 12px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.06)' }}>
                                        Priya S. · Speaking…
                                    </div>

                                    {/* Toolbar */}
                                    <div className="glass-toolbar absolute bottom-3.5 z-10 flex items-center gap-1.5 px-3.5 py-2 rounded-xl"
                                        style={{ left: '50%', transform: 'translateX(-50%)' }}>
                                        {[
                                            { Icon: Mic, dim: false },
                                            { Icon: Video, dim: false },
                                            { Icon: MonitorSmartphone, dim: true },
                                        ].map(({ Icon, dim }, i) => (
                                            <button key={i} className="ctrl-tool w-9 h-9" style={{ opacity: dim ? 0.35 : 1 }}>
                                                <Icon size={16} strokeWidth={1.9} />
                                            </button>
                                        ))}
                                        <div className="w-px h-6 mx-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
                                        <button className="ctrl-tool-end px-4 h-9 gap-1.5">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
                                                <line x1="22" x2="2" y1="2" y2="22" />
                                            </svg>
                                            Leave
                                        </button>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Float card 1 */}
                            <div className="glass-card float-a absolute z-20 flex items-center gap-3 px-4 py-3.5 rounded-2xl"
                                style={{ top: '-16px', left: '-44px', minWidth: '175px' }}>
                                <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.20)' }}>
                                    <Users size={18} strokeWidth={1.8} style={{ color: 'rgba(52,211,153,0.75)' }} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(248,250,252,0.80)' }}>Sarah joined</p>
                                    <p style={{ fontSize: '11px', color: 'rgba(191,233,255,0.35)', marginTop: 2 }}>Just now</p>
                                </div>
                            </div>

                            {/* Float card 2 */}
                            <div className="glass-card float-b absolute z-20 flex items-center gap-3 px-4 py-3.5 rounded-2xl"
                                style={{ top: '50%', right: '-48px', transform: 'translateY(-50%)', minWidth: '162px' }}>
                                <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: 'rgba(191,233,255,0.08)', border: `1px solid rgba(191,233,255,0.16)` }}>
                                    <Shield size={18} strokeWidth={1.8} style={{ color: 'rgba(191,233,255,0.65)' }} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(248,250,252,0.80)' }}>Encrypted</p>
                                    <p style={{ fontSize: '11px', color: 'rgba(191,233,255,0.35)', marginTop: 2 }}>End-to-end</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* ── FEATURE BAR ── */}
                <motion.div custom={6} initial="hidden" animate="visible" variants={fadeUp}
                    className="relative z-10 max-w-[1360px] mx-auto px-6 lg:px-16 pb-14">
                    <div className="glass-feature grid grid-cols-1 md:grid-cols-3 gap-0 p-1">
                        {[
                            { Icon: Globe, iconColor: 'rgba(255,110,127,0.60)', bg: 'rgba(255,110,127,0.08)', bd: 'rgba(255,110,127,0.14)', title: 'Global Network', sub: 'Ultra-low latency worldwide' },
                            { Icon: Zap, iconColor: 'rgba(191,233,255,0.60)', bg: 'rgba(191,233,255,0.08)', bd: 'rgba(191,233,255,0.14)', title: '4K Quality', sub: 'Crystal clear video & audio' },
                            { Icon: Shield, iconColor: 'rgba(191,233,255,0.60)', bg: 'rgba(191,233,255,0.08)', bd: 'rgba(191,233,255,0.14)', title: '100% Secure', sub: 'End-to-end encryption' },
                        ].map(({ Icon, iconColor, bg, bd, title, sub }) => (
                            <div key={title} className="glass-feature-item flex items-center gap-3 p-3.5">
                                <div className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: bg, border: `1px solid ${bd}` }}>
                                    <Icon size={20} strokeWidth={1.8} style={{ color: iconColor }} />
                                </div>
                                <div>
                                    <h3 style={{ color: 'rgba(248,250,252,0.75)', fontWeight: 600, fontSize: '14px' }}>{title}</h3>
                                    <p style={{ color: 'rgba(191,233,255,0.40)', fontSize: '12.5px', marginTop: 2 }}>{sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* ── JOIN MODAL ── */}
                {showJoinModal && (
                    <div
                        className="join-modal-overlay"
                        onClick={() => setShowJoinModal(false)}
                    >
                        <div
                            className="join-modal-card"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div style={{ marginBottom: 22 }}>
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 7,
                                    background: 'rgba(191,233,255,0.07)', border: '1px solid rgba(191,233,255,0.14)',
                                    borderRadius: 100, padding: '4px 12px', marginBottom: 12,
                                    fontSize: 11, fontWeight: 600, color: 'rgba(191,233,255,0.45)',
                                    letterSpacing: '0.07em', textTransform: 'uppercase',
                                }}>
                                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: SEC, opacity: 0.6, display: 'inline-block', animation: 'edp 2s ease-in-out infinite' }} />
                                    Join a room
                                </div>
                                <h2 style={{
                                    fontFamily: "'Fraunces', Georgia, serif",
                                    fontSize: '1.55rem', fontWeight: 300, lineHeight: 1.15,
                                    color: 'rgba(248,250,252,0.90)', letterSpacing: '-0.02em', marginBottom: 6,
                                }}>
                                    Enter meeting code
                                </h2>
                                <p style={{ fontSize: 13, color: 'rgba(191,233,255,0.38)', lineHeight: 1.6 }}>
                                    Paste the code shared with you to jump straight in.
                                </p>
                            </div>

                            {/* Input */}
                            <div style={{ position: 'relative', marginBottom: 14 }}>
                                <span style={{
                                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                                    color: 'rgba(191,233,255,0.28)', display: 'flex', alignItems: 'center', pointerEvents: 'none',
                                }}>
                                    <Link2 size={15} strokeWidth={1.9} />
                                </span>
                                <input
                                    autoFocus
                                    className="join-modal-input"
                                    type="text"
                                    placeholder="e.g. a1b2c3d4"
                                    value={joinCode}
                                    onChange={e => setJoinCode(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && joinCode.trim()) handleJoin();
                                        if (e.key === 'Escape') setShowJoinModal(false);
                                    }}
                                />
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button
                                    onClick={() => setShowJoinModal(false)}
                                    style={{
                                        flex: 1, padding: '12px 0', borderRadius: 100,
                                        background: 'rgba(191,233,255,0.06)',
                                        border: '1px solid rgba(191,233,255,0.14)',
                                        color: 'rgba(191,233,255,0.55)',
                                        fontSize: 14, fontWeight: 600,
                                        cursor: 'pointer',
                                        fontFamily: "'DM Sans', system-ui, sans-serif",
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(191,233,255,0.10)'; e.currentTarget.style.color = SEC; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(191,233,255,0.06)'; e.currentTarget.style.color = 'rgba(191,233,255,0.55)'; }}
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={!joinCode.trim()}
                                    onClick={handleJoin}
                                    style={{
                                        flex: 1, padding: '12px 0', borderRadius: 100, border: 'none',
                                        background: joinCode.trim()
                                            ? `linear-gradient(115deg, ${PRI} 0%, ${SEC} 100%)`
                                            : 'rgba(255,110,127,0.12)',
                                        color: joinCode.trim() ? '#07090f' : 'rgba(255,110,127,0.35)',
                                        fontSize: 14, fontWeight: 700,
                                        cursor: joinCode.trim() ? 'pointer' : 'not-allowed',
                                        fontFamily: "'DM Sans', system-ui, sans-serif",
                                        transition: 'all 0.2s',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                    }}
                                >
                                    Join <ArrowRight size={14} strokeWidth={2.6} />
                                </button>
                            </div>

                            {/* Close hint */}
                            <p style={{ textAlign: 'center', marginTop: 14, fontSize: 11, color: 'rgba(191,233,255,0.20)' }}>
                                Press <kbd style={{ background: 'rgba(191,233,255,0.07)', border: '1px solid rgba(191,233,255,0.12)', borderRadius: 4, padding: '1px 5px', fontSize: 10, color: 'rgba(191,233,255,0.35)' }}>Esc</kbd> to close
                            </p>
                        </div>
                    </div>
                )}

            </div>
        </>
    );
}