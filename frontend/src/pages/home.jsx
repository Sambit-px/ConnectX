import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import RestoreIcon from '@mui/icons-material/Restore'
import { Video, ArrowRight, Link2, Plus, LogIn } from 'lucide-react'
import { motion } from 'framer-motion'
import { GridScan } from '../components/GridScan'
import { v4 as uuidv4 } from 'uuid'

const PRI = '#ff6e7f';
const SEC = '#bfe9ff';

function HomeComponent() {
    const navigate = useNavigate()
    const [meetingCode, setMeetingCode] = useState('')
    const [error, setError] = useState('')
    const { addToUserHistory } = useContext(AuthContext)

    const fadeUp = {
        hidden: { opacity: 0, y: 20 },
        visible: (d = 0) => ({
            opacity: 1, y: 0,
            transition: { duration: 0.55, delay: d * 0.1, ease: [0.25, 0.4, 0.25, 1] }
        })
    }

    const handleCreate = async () => {
        const newCode = uuidv4().slice(0, 8)
        try {
            await addToUserHistory(newCode)
        } catch (e) {
            console.warn('History save failed:', e);
        }
        navigate(`/${newCode}`)
    }

    const handleJoin = async () => {
        if (!meetingCode.trim()) return;
        try {
            await addToUserHistory(meetingCode.trim());
        } catch (e) {
            console.warn('History save failed:', e);
        }
        navigate(`/${meetingCode.trim()}`);
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                :root {
                    --pri: ${PRI};
                    --sec: ${SEC};
                    --pri-dim: rgba(255,110,127,0.10);
                    --sec-dim: rgba(191,233,255,0.08);
                    --pri-bd: rgba(255,110,127,0.22);
                    --sec-bd: rgba(191,233,255,0.16);
                    --text: rgba(191,233,255,0.90);
                    --muted: rgba(191,233,255,0.30);
                    --glass: rgba(5,8,15,0.52);
                }

                .hs { min-height:100vh; background:#050810; font-family:'DM Sans',system-ui,sans-serif; color:var(--text); display:flex; flex-direction:column; position:relative; overflow:hidden; }
                .hs-grid { position:fixed; inset:0; z-index:0; }
                .blob { position:fixed; border-radius:50%; pointer-events:none; z-index:0; filter:blur(100px); }
                .blob-a { width:460px; height:340px; background:rgba(255,110,127,0.07); top:-100px; right:-60px; }
                .blob-b { width:400px; height:320px; background:rgba(191,233,255,0.05); bottom:-80px; left:-80px; }

                .hn { position:relative; z-index:10; display:flex; align-items:center; justify-content:space-between; padding:16px 44px; background:rgba(5,8,15,0.70); backdrop-filter:blur(24px) saturate(1.8); border-bottom:1px solid rgba(255,255,255,0.05); }
                .hn-brand { display:flex; align-items:center; gap:10px; }
                .hn-logo { width:34px; height:34px; border-radius:10px; background:var(--sec-dim); border:1px solid var(--sec-bd); display:flex; align-items:center; justify-content:center; }
                .hn-name { font-family:'Fraunces',Georgia,serif; font-size:1.05rem; font-weight:300; color:var(--sec); letter-spacing:-0.01em; }
                .hn-name span { color:var(--pri); font-weight:700; }
                .hn-acts { display:flex; align-items:center; gap:8px; }
                .btn-hist { display:flex; align-items:center; gap:6px; background:var(--sec-dim); border:1px solid var(--sec-bd); border-radius:100px; padding:8px 16px; font-family:'DM Sans',system-ui,sans-serif; font-size:13px; font-weight:500; color:rgba(191,233,255,0.50); cursor:pointer; transition:all 0.2s; }
                .btn-hist:hover { background:rgba(191,233,255,0.13); border-color:rgba(191,233,255,0.28); color:var(--sec); }
                .btn-lout { display:flex; align-items:center; gap:6px; background:var(--pri-dim); border:1px solid var(--pri-bd); border-radius:100px; padding:8px 16px; font-family:'DM Sans',system-ui,sans-serif; font-size:13px; font-weight:500; color:rgba(255,110,127,0.60); cursor:pointer; transition:all 0.2s; }
                .btn-lout:hover { background:rgba(255,110,127,0.16); border-color:rgba(255,110,127,0.32); color:var(--pri); }

                .hm { position:relative; z-index:2; display:flex; align-items:center; padding:0 44px; gap:64px; min-height:calc(100vh - 69px); }
                .hl { flex:1; max-width:500px; }

                .eyebrow { display:inline-flex; align-items:center; gap:7px; background:var(--sec-dim); border:1px solid var(--sec-bd); border-radius:100px; padding:5px 13px; margin-bottom:20px; font-size:11px; font-weight:600; color:rgba(191,233,255,0.45); letter-spacing:0.07em; text-transform:uppercase; }
                .edot { width:5px; height:5px; border-radius:50%; background:var(--sec); opacity:0.6; animation:edp 2s ease-in-out infinite; }
                @keyframes edp { 0%,100%{opacity:0.35;transform:scale(1)} 50%{opacity:0.9;transform:scale(1.4)} }

                .headline { font-family:'Fraunces',Georgia,serif; font-size:clamp(2rem,3.8vw,2.9rem); font-weight:300; line-height:1.12; letter-spacing:-0.03em; color:var(--text); margin-bottom:14px; }
                .headline em { font-style:italic; color:var(--pri); }
                .sub { font-size:14px; color:var(--muted); font-weight:400; line-height:1.65; margin-bottom:34px; max-width:370px; }

                .action-cards { display:flex; flex-direction:column; gap:12px; margin-bottom:32px; }

                .card-create { display:flex; align-items:center; justify-content:space-between; gap:16px; background:rgba(255,110,127,0.06); border:1px solid rgba(255,110,127,0.18); border-radius:18px; padding:20px 22px; cursor:pointer; transition:all 0.22s; }
                .card-create:hover { background:rgba(255,110,127,0.10); border-color:rgba(255,110,127,0.30); transform:translateY(-1px); box-shadow:0 8px 28px rgba(255,110,127,0.12); }
                .card-icon-p { width:42px; height:42px; border-radius:12px; background:rgba(255,110,127,0.12); border:1px solid rgba(255,110,127,0.22); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
                .card-text { flex:1; }
                .card-title { font-size:14px; font-weight:700; color:rgba(255,110,127,0.90); margin-bottom:3px; }
                .card-desc { font-size:12px; color:rgba(191,233,255,0.35); font-weight:400; }
                .card-arrow { color:rgba(255,110,127,0.50); }

                .card-join { background:rgba(191,233,255,0.04); border:1px solid rgba(191,233,255,0.12); border-radius:18px; padding:20px 22px; transition:all 0.22s; }
                .card-join:focus-within { border-color:rgba(191,233,255,0.28); background:rgba(191,233,255,0.07); }
                .card-join-top { display:flex; align-items:center; gap:12px; margin-bottom:14px; }
                .card-icon-s { width:42px; height:42px; border-radius:12px; background:rgba(191,233,255,0.07); border:1px solid rgba(191,233,255,0.16); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
                .card-join-title { font-size:14px; font-weight:700; color:rgba(191,233,255,0.80); }
                .card-join-desc { font-size:12px; color:rgba(191,233,255,0.35); margin-top:2px; }

                .join-row { display:flex; gap:8px; align-items:center; }
                .iwrap { position:relative; flex:1; }
                .iico { position:absolute; left:13px; top:50%; transform:translateY(-50%); color:rgba(191,233,255,0.22); pointer-events:none; display:flex; align-items:center; }
                .hinput { width:100%; background:rgba(191,233,255,0.04); border:1px solid rgba(191,233,255,0.14); border-radius:12px; padding:12px 12px 12px 38px; font-family:'DM Sans',system-ui,sans-serif; font-size:14px; color:rgba(255,255,255,0.80); outline:none; transition:border-color 0.2s,background 0.2s,box-shadow 0.2s; }
                .hinput::placeholder { color:rgba(191,233,255,0.18); }
                .hinput:focus { border-color:rgba(191,233,255,0.34); background:rgba(191,233,255,0.06); box-shadow:0 0 0 3px rgba(191,233,255,0.06); }

                .btn-join-go { padding:12px 20px; border:none; border-radius:12px; cursor:pointer; font-family:'DM Sans',system-ui,sans-serif; font-size:13px; font-weight:700; color:#07090f; background:linear-gradient(115deg,${SEC} 0%,#89d4ff 100%); transition:transform 0.18s,box-shadow 0.18s,filter 0.18s; box-shadow:0 2px 14px rgba(191,233,255,0.20); display:flex; align-items:center; gap:6px; white-space:nowrap; }
                .btn-join-go:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 22px rgba(191,233,255,0.28); filter:brightness(1.08); }
                .btn-join-go:disabled { opacity:0.35; cursor:not-allowed; }

                .err-msg { font-size:11px; color:rgba(255,110,127,0.70); margin-top:8px; padding-left:4px; }

                .or-divider { display:flex; align-items:center; gap:10px; margin:4px 0; }
                .or-line { flex:1; height:1px; background:rgba(191,233,255,0.08); }
                .or-text { font-size:11px; color:rgba(191,233,255,0.20); font-weight:600; letter-spacing:0.05em; text-transform:uppercase; }

                .hstats { display:flex; }
                .hstat { display:flex; flex-direction:column; gap:3px; padding:14px 28px 14px 0; border-right:1px solid rgba(255,255,255,0.06); margin-right:28px; }
                .hstat:last-child { border-right:none; margin-right:0; padding-right:0; }
                .hsv { font-family:'Fraunces',Georgia,serif; font-size:1.5rem; font-weight:300; letter-spacing:-0.02em; }
                .hsv.p { color:var(--pri); } .hsv.s { color:var(--sec); } .hsv.w { color:rgba(191,233,255,0.72); }
                .hsl { font-size:11px; color:var(--muted); font-weight:500; letter-spacing:0.04em; text-transform:uppercase; }

                .hr { flex:1; display:flex; align-items:center; justify-content:center; }
                .vcard { position:relative; width:100%; max-width:400px; background:var(--glass); backdrop-filter:blur(24px) saturate(1.6); border:1px solid rgba(255,255,255,0.08); border-radius:24px; overflow:hidden; box-shadow:0 0 0 1px rgba(191,233,255,0.04),0 32px 80px rgba(0,0,0,0.55); }
                .vcard::before { content:''; position:absolute; top:0; left:20px; right:20px; height:1px; background:linear-gradient(90deg,transparent,rgba(191,233,255,0.26) 35%,rgba(255,110,127,0.20) 70%,transparent); }
                .vprev { aspect-ratio:16/10; position:relative; overflow:hidden; background:rgba(5,8,15,0.68); }
                .vpgrid { position:absolute; inset:0; background-image:linear-gradient(rgba(191,233,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(191,233,255,0.06) 1px,transparent 1px); background-size:32px 32px; }
                .vpscan { position:absolute; left:0; right:0; height:1.5px; background:linear-gradient(90deg,transparent,var(--sec) 25%,var(--pri) 75%,transparent); opacity:0.28; animation:vcs 3.8s ease-in-out infinite; }
                @keyframes vcs { 0%{top:0} 100%{top:100%} }
                .vdot { position:absolute; width:4px; height:4px; border-radius:50%; }
                .vdot.tl{top:10px;left:10px;background:var(--sec);opacity:.35} .vdot.tr{top:10px;right:10px;background:var(--pri);opacity:.35}
                .vdot.bl{bottom:10px;left:10px;background:var(--pri);opacity:.35} .vdot.br{bottom:10px;right:10px;background:var(--sec);opacity:.35}
                .vpc { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:11px; }
                .vring { width:64px; height:64px; border-radius:50%; background:var(--pri-dim); border:1px solid var(--pri-bd); display:flex; align-items:center; justify-content:center; animation:vfloat 3.2s ease-in-out infinite; position:relative; }
                .vring::after { content:''; position:absolute; inset:-7px; border-radius:50%; border:1px solid rgba(255,110,127,0.10); animation:vre 3.2s ease-in-out infinite; }
                @keyframes vre { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.18);opacity:0} }
                @keyframes vfloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
                .vconn { font-size:11px; font-weight:600; color:var(--sec); letter-spacing:0.07em; text-transform:uppercase; opacity:0.48; }
                .vtags { display:flex; gap:7px; padding:0 18px 14px; }
                .vtag { font-size:10px; font-weight:600; letter-spacing:0.04em; border-radius:100px; padding:4px 10px; text-transform:uppercase; }
                .vtag-p { background:var(--pri-dim); border:1px solid var(--pri-bd); color:rgba(255,110,127,0.68); }
                .vtag-s { background:var(--sec-dim); border:1px solid var(--sec-bd); color:rgba(191,233,255,0.55); }
                .vfoot { padding:13px 18px; display:flex; align-items:center; justify-content:space-between; border-top:1px solid rgba(255,255,255,0.05); }
                .vlive { display:flex; align-items:center; gap:7px; }
                .vldot { width:7px; height:7px; border-radius:50%; background:var(--pri); box-shadow:0 0 6px rgba(255,110,127,0.55); animation:vlp 1.5s ease-in-out infinite; }
                @keyframes vlp { 0%,100%{opacity:1} 50%{opacity:.38} }
                .vlt { font-size:11px; font-weight:600; color:rgba(255,110,127,0.60); letter-spacing:0.05em; text-transform:uppercase; }
                .vavs { display:flex; align-items:center; gap:4px; }
                .vavst { display:flex; }
                .vav { width:26px; height:26px; border-radius:50%; border:2px solid rgba(5,8,15,0.75); display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:700; margin-left:-8px; }
                .vav:first-child { margin-left:0; }
                .vav-a { background:linear-gradient(135deg,var(--pri),#ff9aaa); color:#07090f; }
                .vav-b { background:linear-gradient(135deg,var(--sec),#89d4ff); color:#07090f; }
                .vav-c { background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.45); font-size:8px; }
                .vavc { font-size:11px; color:var(--muted); margin-left:6px; }
                .vsig { display:flex; align-items:flex-end; gap:3px; height:16px; }
                .vbar { width:4px; border-radius:2px; background:var(--sec); opacity:0.20; }
                .vbar.on { opacity:0.62; }
                .vbar:nth-child(1){height:5px} .vbar:nth-child(2){height:9px} .vbar:nth-child(3){height:13px} .vbar:nth-child(4){height:16px}

                @media(max-width:780px){
                    .hm{flex-direction:column;padding:36px 24px;gap:40px;min-height:unset;padding-bottom:60px}
                    .hn{padding:14px 24px}
                    .hr{width:100%}
                }
            `}</style>

            <div className="hs">
                <div className="hs-grid">
                    <GridScan
                        sensitivity={0.55} lineThickness={1} linesColor="#392e4e"
                        gridScale={0.1} scanColor={SEC} scanOpacity={0.28}
                        enablePost bloomIntensity={0.5} chromaticAberration={0.002} noiseIntensity={0.01}
                    />
                </div>
                <div className="blob blob-a" />
                <div className="blob blob-b" />

                <nav className="hn">
                    <div className="hn-brand">
                        <div className="hn-logo">
                            <Video size={16} strokeWidth={2.2} color={SEC} />
                        </div>
                        <span className="hn-name">Connect<span>X</span></span>
                    </div>
                    <div className="hn-acts">
                        <button className="btn-hist" onClick={() => navigate('/history')}>
                            <RestoreIcon style={{ fontSize: 15 }} /> History
                        </button>
                        <button className="btn-lout" onClick={() => {
                            localStorage.removeItem('token')
                            navigate('/auth')
                        }}>
                            Logout <ArrowRight size={13} strokeWidth={2.5} />
                        </button>
                    </div>
                </nav>

                <main className="hm">
                    <motion.div className="hl" custom={0} initial="hidden" animate="visible" variants={fadeUp}>

                        <div className="eyebrow">
                            <div className="edot" /> HD Video Calling
                        </div>

                        <h1 className="headline">
                            Quality calls,<br />
                            crystal <em>clear.</em>
                        </h1>

                        <p className="sub">
                            Start a new room instantly or join an existing one with a code.
                        </p>

                        <div className="action-cards">
                            <div className="card-create" onClick={handleCreate}>
                                <div className="card-icon-p">
                                    <Plus size={18} color={PRI} strokeWidth={2.5} />
                                </div>
                                <div className="card-text">
                                    <div className="card-title">New Meeting</div>
                                    <div className="card-desc">Generate a unique room code instantly</div>
                                </div>
                                <div className="card-arrow">
                                    <ArrowRight size={16} strokeWidth={2.2} />
                                </div>
                            </div>

                            <div className="or-divider">
                                <div className="or-line" />
                                <span className="or-text">or join</span>
                                <div className="or-line" />
                            </div>

                            <div className="card-join">
                                <div className="card-join-top">
                                    <div className="card-icon-s">
                                        <LogIn size={18} color={SEC} strokeWidth={2.2} />
                                    </div>
                                    <div>
                                        <div className="card-join-title">Join a Meeting</div>
                                        <div className="card-join-desc">Enter the room code shared with you</div>
                                    </div>
                                </div>
                                <div className="join-row">
                                    <div className="iwrap">
                                        <span className="iico">
                                            <Link2 size={14} strokeWidth={1.9} />
                                        </span>
                                        <input
                                            className="hinput"
                                            type="text"
                                            placeholder="Paste meeting code…"
                                            value={meetingCode}
                                            onChange={e => { setMeetingCode(e.target.value); setError(''); }}
                                            onKeyDown={e => e.key === 'Enter' && handleJoin()}
                                        />
                                    </div>
                                    <button className="btn-join-go" onClick={handleJoin} disabled={!meetingCode.trim()}>
                                        Join <ArrowRight size={13} strokeWidth={2.6} />
                                    </button>
                                </div>
                                {error && <div className="err-msg">{error}</div>}
                            </div>
                        </div>

                        <div className="hstats">
                            <div className="hstat"><span className="hsv p">12k+</span><span className="hsl">Active Users</span></div>
                            <div className="hstat"><span className="hsv s">99.9%</span><span className="hsl">Uptime</span></div>
                            <div className="hstat"><span className="hsv w">HD</span><span className="hsl">Quality</span></div>
                        </div>
                    </motion.div>

                    <motion.div className="hr" custom={1} initial="hidden" animate="visible" variants={fadeUp}>
                        <div className="vcard">
                            <div className="vprev">
                                <div className="vpgrid" />
                                <div className="vpscan" />
                                <div className="vdot tl" /><div className="vdot tr" />
                                <div className="vdot bl" /><div className="vdot br" />
                                <div className="vpc">
                                    <div className="vring">
                                        <Video size={26} strokeWidth={1.6} color="rgba(255,110,127,0.78)" />
                                    </div>
                                    <span className="vconn">Ready to connect</span>
                                </div>
                            </div>
                            <div className="vtags">
                                <span className="vtag vtag-p">● Live</span>
                                <span className="vtag vtag-s">◈ Encrypted</span>
                                <span className="vtag vtag-s">◎ HD Ready</span>
                            </div>
                            <div className="vfoot">
                                <div className="vlive"><div className="vldot" /><span className="vlt">Live now</span></div>
                                <div className="vavs">
                                    <div className="vavst">
                                        <div className="vav vav-a">A</div>
                                        <div className="vav vav-b">B</div>
                                        <div className="vav vav-c">+3</div>
                                    </div>
                                    <span className="vavc">5 online</span>
                                </div>
                                <div className="vsig">
                                    <div className="vbar on" /><div className="vbar on" />
                                    <div className="vbar on" /><div className="vbar" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </main>
            </div>
        </>
    )
}

export default withAuth(HomeComponent) 