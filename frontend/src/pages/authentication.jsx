import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar } from '@mui/material';
import { Video, ArrowRight, Eye, EyeOff, User, Lock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Hyperspeed from '../components/Hyperspeed';

// ─────────────────────────────────────────────────────────────────────────────
// Stable options at module level — reference never changes.
// ─────────────────────────────────────────────────────────────────────────────
const HYPERSPEED_OPTS = {
    distortion: 'turbulentDistortion',
    length: 400,
    roadWidth: 10,
    islandWidth: 2,
    lanesPerRoad: 3,
    fov: 90,
    fovSpeedUp: 150,
    speedUp: 2,
    carLightsFade: 0.4,
    totalSideLightSticks: 20,
    lightPairsPerRoadWay: 40,
    shoulderLinesWidthPercentage: 0.05,
    brokenLinesWidthPercentage: 0.1,
    brokenLinesLengthPercentage: 0.5,
    lightStickWidth: [0.12, 0.5],
    lightStickHeight: [1.3, 1.7],
    movingAwaySpeed: [60, 80],
    movingCloserSpeed: [-120, -160],
    carLightsLength: [12, 80],
    carLightsRadius: [0.05, 0.14],
    carWidthPercentage: [0.3, 0.5],
    carShiftX: [-0.8, 0.8],
    carFloorSeparation: [0, 5],
    colors: {
        roadColor: 526344,
        islandColor: 657930,
        background: 0,
        shoulderLines: 1250072,
        brokenLines: 1250072,
        leftCars: [14177983, 6770850, 12732332],
        rightCars: [242627, 941733, 3294549],
        sticks: 242627,
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// HyperspeedPortal
//
// WHY this approach:
//   React 18 StrictMode (development) deliberately mounts → unmounts →
//   remounts every component to surface side-effect bugs. This causes
//   Hyperspeed's useEffect cleanup to call dispose() (setting the GL
//   renderer to null), then init() runs again on that null renderer →
//   EffectComposer.addPass() crashes.
//
//   React.memo only skips re-renders due to prop changes — it cannot
//   prevent StrictMode's intentional double-mount.
//
//   The fix: call ReactDOM.createRoot() on a plain div that we own,
//   producing a SEPARATE React tree that is completely outside the app's
//   StrictMode boundary. Hyperspeed is rendered inside that tree and
//   therefore never double-mounted. The hyperRootRef guard ensures we
//   create the root only once even if the outer effect runs twice.
// ─────────────────────────────────────────────────────────────────────────────
function HyperspeedPortal() {
    const containerRef = React.useRef(null);
    const hyperRootRef = React.useRef(null);

    React.useEffect(() => {
        const container = containerRef.current;

        // Guard: if root already created (StrictMode's second mount) skip.
        if (!container || hyperRootRef.current) return;

        // Create an isolated React root — NOT under the app's StrictMode tree.
        hyperRootRef.current = ReactDOM.createRoot(container);
        hyperRootRef.current.render(
            <Hyperspeed effectOptions={HYPERSPEED_OPTS} />
        );

        // No cleanup returned intentionally:
        // Returning a cleanup would let StrictMode unmount Hyperspeed via
        // root.unmount(), which disposes the GL context → same crash.
        // Skipping cleanup means the isolated root (and GL context) persists
        // through StrictMode's artificial unmount/remount cycle.
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div
            ref={containerRef}
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
            }}
        />
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function Authentication() {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [name, setName] = React.useState('');
    const [error, setError] = React.useState('');
    const [message, setMessage] = React.useState('');
    const [formState, setFormState] = React.useState(0); // 0 = login, 1 = register
    const [open, setOpen] = React.useState(false);
    const [showPass, setShowPass] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    const switchTab = (tab) => {
        setFormState(tab);
        setError('');
        setUsername('');
        setPassword('');
        setName('');
    };

    const handleAuth = async () => {
        setLoading(true);
        setError('');
        try {
            if (formState === 0) {
                await handleLogin(username, password);
            } else {
                const result = await handleRegister(name, username, password);
                setMessage(result);
                setOpen(true);
                switchTab(0);
            }
        } catch (err) {
            const msg = err?.response?.data?.message || 'Something went wrong.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleAuth();
    };

    const fadeUp = {
        hidden: { opacity: 0, y: 16 },
        visible: (d = 0) => ({
            opacity: 1, y: 0,
            transition: { duration: 0.55, delay: d * 0.08, ease: [0.25, 0.4, 0.25, 1] },
        }),
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                .auth-shell {
                    position: fixed;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    background: #000;
                    font-family: 'DM Sans', system-ui, sans-serif;
                    isolation: isolate;
                }

                /* Hyperspeed host — plain wrapper, content rendered by isolated root */
                .auth-hyper {
                    position: absolute;
                    inset: 0;
                    z-index: 0;
                    width: 100%;
                    height: 100%;
                }
                .auth-hyper canvas {
                    display: block;
                    position: absolute !important;
                    top: 0 !important; left: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                }

                .auth-vignette {
                    position: absolute;
                    inset: 0;
                    z-index: 1;
                    pointer-events: none;
                    background: radial-gradient(
                        ellipse 70% 80% at 50% 50%,
                        rgba(0,0,0,0.00) 0%,
                        rgba(0,0,0,0.35) 50%,
                        rgba(0,0,0,0.75) 100%
                    );
                }

                .auth-card {
                    position: relative;
                    z-index: 2;
                    width: 100%;
                    max-width: 416px;
                    margin: 0 16px;
                    background: rgba(5, 8, 15, 0.22);
                    backdrop-filter: blur(20px) saturate(1.9) brightness(1.05);
                    -webkit-backdrop-filter: blur(20px) saturate(1.9) brightness(1.05);
                    border: 1px solid rgba(255,255,255,0.13);
                    border-radius: 24px;
                    padding: 36px 36px 30px;
                    box-shadow:
                        0 0 0 1px rgba(255,110,127,0.08),
                        0 32px 72px rgba(0,0,0,0.45),
                        0 8px 24px rgba(0,0,0,0.30),
                        inset 0 1px 0 rgba(255,255,255,0.10);
                }
                .auth-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 24px; right: 24px;
                    height: 1px;
                    background: linear-gradient(90deg,
                        transparent 0%,
                        rgba(255,110,127,0.40) 30%,
                        rgba(191,233,255,0.30) 70%,
                        transparent 100%
                    );
                    border-radius: 1px;
                }

                .auth-tabs {
                    display: flex;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 100px;
                    padding: 3px;
                    gap: 2px;
                }
                .auth-tab {
                    flex: 1;
                    padding: 8px 0;
                    border: none;
                    border-radius: 100px;
                    cursor: pointer;
                    font-family: 'DM Sans', system-ui, sans-serif;
                    font-size: 13px;
                    font-weight: 600;
                    transition: all 0.22s ease;
                    color: rgba(191,233,255,0.32);
                    background: transparent;
                }
                .auth-tab.active {
                    background: linear-gradient(115deg, #ff6e7f 0%, #bfe9ff 100%);
                    color: #0a0f1a;
                }

                .auth-input-wrap {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .auth-input-icon {
                    position: absolute;
                    left: 14px;
                    color: rgba(191,233,255,0.22);
                    pointer-events: none;
                    display: flex;
                    align-items: center;
                }
                .auth-input {
                    width: 100%;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 12px;
                    padding: 12px 14px 12px 40px;
                    font-family: 'DM Sans', system-ui, sans-serif;
                    font-size: 14px;
                    color: rgba(255,255,255,0.80);
                    outline: none;
                    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
                }
                .auth-input::placeholder { color: rgba(255,255,255,0.18); }
                .auth-input:focus {
                    border-color: rgba(255,110,127,0.42);
                    background: rgba(255,110,127,0.04);
                    box-shadow: 0 0 0 3px rgba(255,110,127,0.09);
                }
                .auth-input-pass { padding-right: 42px; }

                .auth-eye {
                    position: absolute;
                    right: 13px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: rgba(191,233,255,0.22);
                    display: flex;
                    align-items: center;
                    padding: 0;
                    transition: color 0.15s;
                }
                .auth-eye:hover { color: rgba(255,110,127,0.65); }

                .auth-btn {
                    position: relative;
                    width: 100%;
                    padding: 13px 0;
                    border: none;
                    border-radius: 100px;
                    cursor: pointer;
                    font-family: 'DM Sans', system-ui, sans-serif;
                    font-size: 14.5px;
                    font-weight: 700;
                    color: #0a0f1a;
                    background: linear-gradient(115deg, #ff6e7f 0%, #bfe9ff 100%);
                    transition: transform 0.22s cubic-bezier(0.16,1,0.3,1), box-shadow 0.22s, opacity 0.2s;
                    box-shadow: 0 2px 16px rgba(255,110,127,0.30);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    overflow: visible;
                }
                .auth-btn::before {
                    content: '';
                    position: absolute;
                    inset: -16px -20px;
                    border-radius: 100px;
                    background: radial-gradient(ellipse 80% 60% at 50% 50%,
                        rgba(255,110,127,0.28) 0%,
                        rgba(191,233,255,0.10) 50%,
                        transparent 72%
                    );
                    filter: blur(16px);
                    z-index: -1;
                    animation: auth-bloom 4s ease-in-out infinite;
                }
                @keyframes auth-bloom {
                    0%,100% { opacity: 0.70; transform: scale(1); }
                    50%     { opacity: 1.00; transform: scale(1.06); }
                }
                .auth-btn:hover:not(:disabled) {
                    transform: translateY(-2px) scale(1.015);
                    box-shadow: 0 6px 30px rgba(255,110,127,0.40);
                }
                .auth-btn:active:not(:disabled) { transform: scale(0.97); }
                .auth-btn:disabled { opacity: 0.52; cursor: not-allowed; }

                .auth-spinner {
                    width: 16px; height: 16px;
                    border: 2px solid rgba(10,15,26,0.28);
                    border-top-color: #0a0f1a;
                    border-radius: 50%;
                    animation: auth-spin 0.7s linear infinite;
                }
                @keyframes auth-spin { to { transform: rotate(360deg); } }

                .auth-error {
                    background: rgba(255,110,127,0.08);
                    border: 1px solid rgba(255,110,127,0.18);
                    border-radius: 10px;
                    padding: 10px 14px;
                    font-size: 12.5px;
                    color: rgba(255,140,150,0.85);
                    font-family: 'DM Sans', system-ui, sans-serif;
                }

                .auth-logo-mark {
                    background: rgba(191,233,255,0.07);
                    border: 1px solid rgba(191,233,255,0.15);
                    border-radius: 12px;
                    width: 38px; height: 38px;
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                }
            `}</style>

            <div className="auth-shell">

                {/* Hyperspeed lives in its own isolated React root — immune to StrictMode */}
                <div className="auth-hyper">
                    <HyperspeedPortal />
                </div>

                <div className="auth-vignette" />

                <motion.div
                    className="auth-card"
                    initial={{ opacity: 0, y: 36, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.65, ease: [0.25, 0.4, 0.25, 1] }}
                >
                    {/* Brand row */}
                    <motion.div
                        custom={0} initial="hidden" animate="visible" variants={fadeUp}
                        style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 26 }}
                    >
                        <div className="auth-logo-mark">
                            <Video size={16} strokeWidth={2.2} color="#bfe9ff" />
                        </div>
                        <span style={{
                            fontFamily: "'Fraunces', Georgia, serif",
                            fontSize: '1.08rem', fontWeight: 300,
                            color: 'rgba(248,250,252,0.88)', letterSpacing: '-0.01em'
                        }}>
                            Connect<span style={{ color: '#ff6e7f', fontWeight: 700 }}>X</span>
                        </span>
                        <div style={{
                            marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5,
                            background: 'rgba(255,110,127,0.08)', border: '1px solid rgba(255,110,127,0.16)',
                            borderRadius: 100, padding: '3px 9px'
                        }}>
                            <Sparkles size={10} color="#ff6e7f" />
                            <span style={{ fontSize: 10, color: 'rgba(255,110,127,0.70)', fontWeight: 600, letterSpacing: '0.04em' }}>2.0</span>
                        </div>
                    </motion.div>

                    {/* Headline */}
                    <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}
                        style={{ marginBottom: 22 }}>
                        <AnimatePresence mode="wait">
                            <motion.h1
                                key={formState}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.28 }}
                                style={{
                                    fontFamily: "'Fraunces', Georgia, serif",
                                    fontSize: '1.6rem', fontWeight: 300, lineHeight: 1.15,
                                    color: 'rgba(248,250,252,0.90)', letterSpacing: '-0.02em'
                                }}
                            >
                                {formState === 0
                                    ? 'Welcome back.'
                                    : <>Join the <span style={{ fontStyle: 'italic', color: 'rgba(255,110,127,0.85)' }}>ride.</span></>
                                }
                            </motion.h1>
                        </AnimatePresence>
                        <p style={{ marginTop: 5, fontSize: 13, color: 'rgba(191,233,255,0.32)', fontWeight: 400 }}>
                            {formState === 0
                                ? 'Sign in to continue your meetings.'
                                : 'Create your account in seconds.'}
                        </p>
                    </motion.div>

                    {/* Tab switcher */}
                    <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}
                        style={{ marginBottom: 20 }}>
                        <div className="auth-tabs">
                            <button className={`auth-tab ${formState === 0 ? 'active' : ''}`}
                                onClick={() => switchTab(0)}>Sign In</button>
                            <button className={`auth-tab ${formState === 1 ? 'active' : ''}`}
                                onClick={() => switchTab(1)}>Register</button>
                        </div>
                    </motion.div>

                    {/* Fields */}
                    <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}
                        style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>

                        <AnimatePresence>
                            {formState === 1 && (
                                <motion.div
                                    key="name-field"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.26 }}
                                    style={{ overflow: 'hidden' }}
                                >
                                    <div className="auth-input-wrap">
                                        <span className="auth-input-icon">
                                            <User size={14} strokeWidth={1.9} />
                                        </span>
                                        <input
                                            className="auth-input"
                                            type="text"
                                            placeholder="Full name"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            autoComplete="name"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="auth-input-wrap">
                            <span className="auth-input-icon">
                                <User size={14} strokeWidth={1.9} />
                            </span>
                            <input
                                className="auth-input"
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoComplete="username"
                            />
                        </div>

                        <div className="auth-input-wrap">
                            <span className="auth-input-icon">
                                <Lock size={14} strokeWidth={1.9} />
                            </span>
                            <input
                                className="auth-input auth-input-pass"
                                type={showPass ? 'text' : 'password'}
                                placeholder="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoComplete={formState === 0 ? 'current-password' : 'new-password'}
                            />
                            <button className="auth-eye" onClick={() => setShowPass(p => !p)} tabIndex={-1}>
                                {showPass
                                    ? <EyeOff size={14} strokeWidth={1.9} />
                                    : <Eye size={14} strokeWidth={1.9} />}
                            </button>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    className="auth-error"
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            className="auth-btn"
                            onClick={handleAuth}
                            disabled={loading}
                            style={{ marginTop: 4 }}
                        >
                            {loading
                                ? <div className="auth-spinner" />
                                : <>
                                    {formState === 0 ? 'Sign In' : 'Create Account'}
                                    <ArrowRight size={15} strokeWidth={2.6} />
                                </>
                            }
                        </button>

                        <p style={{
                            textAlign: 'center', marginTop: 4,
                            fontSize: 12.5, color: 'rgba(191,233,255,0.22)'
                        }}>
                            {formState === 0 ? "Don't have an account? " : 'Already have an account? '}
                            <span
                                onClick={() => switchTab(formState === 0 ? 1 : 0)}
                                style={{
                                    color: 'rgba(255,110,127,0.60)', cursor: 'pointer',
                                    fontWeight: 500, transition: 'color 0.15s',
                                }}
                                onMouseEnter={e => e.target.style.color = '#ff6e7f'}
                                onMouseLeave={e => e.target.style.color = 'rgba(255,110,127,0.60)'}
                            >
                                {formState === 0 ? 'Register' : 'Sign in'}
                            </span>
                        </p>
                    </motion.div>
                </motion.div>
            </div>

            <Snackbar
                open={open}
                autoHideDuration={4000}
                onClose={() => setOpen(false)}
                message={message}
            />
        </>
    );
}