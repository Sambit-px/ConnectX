import React, { useEffect, useRef, useState } from 'react'
import io from "socket.io-client";
import { Badge, IconButton, TextField } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import ShareIcon from '@mui/icons-material/Share';
import SendIcon from '@mui/icons-material/Send'
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import server from '../environment';

const server_url = server;
var connections = {};
const peerConfigConnections = {
    "iceServers": [{ "urls": "stun:stun.l.google.com:19302" }]
}

const C = {
    pri: '#ff6e7f',
    priDim: 'rgba(255,110,127,0.10)',
    priBd: 'rgba(255,110,127,0.25)',
    priHover: 'rgba(255,110,127,0.18)',
    sec: '#bfe9ff',
    secDim: 'rgba(191,233,255,0.07)',
    secBd: 'rgba(191,233,255,0.18)',
    secHover: 'rgba(191,233,255,0.13)',
    bg: '#050810',
    surface: 'rgba(10,14,26,0.85)',
    glass: 'rgba(5,8,15,0.60)',
    text: '#bfe9ff',
    muted: 'rgba(191,233,255,0.40)',
    border: 'rgba(191,233,255,0.10)',
}

export default function VideoMeetComponent() {
    var socketRef = useRef();
    let socketIdRef = useRef();
    let localVideoref = useRef();

    const usernameRef = useRef('');
    // ── NEW: mirror of usernames state, always fresh inside socket closures ──
    const usernamesRef = useRef({});

    let [videoAvailable, setVideoAvailable] = useState(true);
    let [audioAvailable, setAudioAvailable] = useState(true);
    let [video, setVideo] = useState([]);
    let [audio, setAudio] = useState();
    let [screen, setScreen] = useState();
    let [showModal, setModal] = useState(true);
    let [screenAvailable, setScreenAvailable] = useState();
    let [messages, setMessages] = useState([])
    let [message, setMessage] = useState("");
    let [newMessages, setNewMessages] = useState(0);
    let [askForUsername, setAskForUsername] = useState(true);
    let [username, setUsername] = useState("");
    const videoRef = useRef([])
    let [videos, setVideos] = useState([])
    let [localExpanded, setLocalExpanded] = useState(false);
    let [usernames, setUsernames] = useState({});

    // Timer
    let [callDuration, setCallDuration] = useState(0);
    let callStartRef = useRef(null);

    // ── Helper: update both state and ref together ──
    const updateUsernames = (updater) => {
        setUsernames(prev => {
            const next = typeof updater === 'function'
                ? updater(prev)
                : { ...prev, ...updater };
            usernamesRef.current = next;
            return next;
        });
    };

    useEffect(() => {
        if (askForUsername) return;
        callStartRef.current = Date.now();
        const interval = setInterval(() => {
            setCallDuration(Math.floor((Date.now() - callStartRef.current) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [askForUsername]);

    const formatDuration = (secs) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
    };

    useEffect(() => { getPermissions(); }, [])

    let getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .catch((e) => { console.log(e); setScreen(false); })
            }
        }
    }

    const getPermissions = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setVideoAvailable(stream.getVideoTracks().length > 0);
            setAudioAvailable(stream.getAudioTracks().length > 0);
            setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);
            window.localStream = stream;
            if (localVideoref.current) {
                localVideoref.current.muted = true;
                localVideoref.current.srcObject = stream;
                localVideoref.current.play().catch(e => console.log(e));
            }
        } catch (error) {
            try {
                const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                setVideoAvailable(false);
                setAudioAvailable(true);
                setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);
                window.localStream = audioStream;
                if (localVideoref.current) localVideoref.current.srcObject = audioStream;
            } catch {
                setVideoAvailable(false);
                setAudioAvailable(false);
            }
        }
    };

    useEffect(() => {
        if (video !== undefined && audio !== undefined) getUserMedia();
    }, [video, audio])

    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    }

    let getUserMediaSuccess = (stream) => {
        try { window.localStream.getTracks().forEach(track => track.stop()) } catch (e) { }
        window.localStream = stream;
        localVideoref.current.muted = true;
        localVideoref.current.srcObject = stream;
        localVideoref.current.play().catch(e => console.log(e));
        for (let id in connections) {
            if (id === socketIdRef.current) continue;
            window.localStream.getTracks().forEach(track => {
                connections[id].addTrack(track, window.localStream);
            });
            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description).then(() => {
                    socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                }).catch(e => console.log(e))
            })
        }
        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false); setAudio(false);
            try { localVideoref.current.srcObject.getTracks().forEach(t => t.stop()) } catch (e) { }
            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence();
            localVideoref.current.srcObject = window.localStream;
            for (let id in connections) {
                window.localStream.getTracks().forEach(track => {
                    connections[id].addTrack(track, window.localStream);
                });
                connections[id].createOffer().then((desc) => {
                    connections[id].setLocalDescription(desc).then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    }).catch(e => console.log(e))
                })
            }
        })
    }

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess).catch((e) => console.log(e))
        } else {
            try { localVideoref.current.srcObject.getTracks().forEach(t => t.stop()) } catch (e) { }
        }
    }

    let getDislayMediaSuccess = (stream) => {
        try { window.localStream.getTracks().forEach(track => track.stop()) } catch (e) { }
        window.localStream = stream;
        localVideoref.current.srcObject = stream;
        for (let id in connections) {
            if (id === socketIdRef.current) continue;
            window.localStream.getTracks().forEach(track => {
                connections[id].addTrack(track, window.localStream);
            });
            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description).then(() => {
                    socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                }).catch(e => console.log(e))
            })
        }
        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false);
            try { localVideoref.current.srcObject.getTracks().forEach(t => t.stop()) } catch (e) { }
            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence();
            localVideoref.current.srcObject = window.localStream;
            getUserMedia();
        })
    }

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message);
        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }
            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }

    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false });
        socketRef.current.on('signal', gotMessageFromServer);

        socketRef.current.on('connect', () => {
            const currentUsername = usernameRef.current;
            socketRef.current.emit('join-call', window.location.href, currentUsername);
            socketIdRef.current = socketRef.current.id;

            // Register own name immediately
            updateUsernames({ [socketRef.current.id]: currentUsername });

            socketRef.current.on('chat-message', addMessage);

            // Fallback: individual user-name events
            socketRef.current.on('user-name', (id, name) => {
                if (name) updateUsernames({ [id]: name });
            });

            socketRef.current.on('call-ended', () => {
                try { localVideoref.current.srcObject.getTracks().forEach(t => t.stop()) } catch (e) { }
                window.location.href = "/";
            });

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id));
                // Use setUsernames directly here (delete needs special handling)
                setUsernames(prev => {
                    const updated = { ...prev };
                    delete updated[id];
                    usernamesRef.current = updated;
                    return updated;
                });
            });

            socketRef.current.on('user-joined', (id, clients, usernameMap) => {

                // ── Apply ALL names FIRST before touching peer connections ──
                if (usernameMap && typeof usernameMap === 'object') {
                    updateUsernames(usernameMap);
                }

                clients.forEach((socketListId) => {
                    if (socketListId === socketIdRef.current) return;

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections);

                    connections[socketListId].onicecandidate = (event) => {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    };

                    // ── FIXED: ontrack replaces deprecated onaddstream ──
                    connections[socketListId].ontrack = (event) => {
                        const stream = event.streams[0];
                        if (!stream) return;

                        // Re-apply name from ref at the moment the track arrives
                        const name = usernamesRef.current[socketListId];
                        if (name) updateUsernames({ [socketListId]: name });

                        let videoExists = videoRef.current.find(v => v.socketId === socketListId);
                        if (videoExists) {
                            setVideos(videos => {
                                const updated = videos.map(v =>
                                    v.socketId === socketListId ? { ...v, stream } : v);
                                videoRef.current = updated;
                                return updated;
                            });
                        } else {
                            let newVideo = {
                                socketId: socketListId,
                                stream,
                                autoplay: true,
                                playsinline: true
                            };
                            setVideos(videos => {
                                const updated = [...videos, newVideo];
                                videoRef.current = updated;
                                return updated;
                            });
                        }
                    };

                    // ── FIXED: addTrack replaces deprecated addStream ──
                    if (window.localStream !== undefined && window.localStream !== null) {
                        window.localStream.getTracks().forEach(track =>
                            connections[socketListId].addTrack(track, window.localStream)
                        );
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence();
                        window.localStream.getTracks().forEach(track =>
                            connections[socketListId].addTrack(track, window.localStream)
                        );
                    }
                });

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue;
                        try {
                            window.localStream.getTracks().forEach(track =>
                                connections[id2].addTrack(track, window.localStream)
                            );
                        } catch (e) { }
                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                            }).catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }

    let silence = () => {
        let ctx = new AudioContext();
        let oscillator = ctx.createOscillator();
        let dst = oscillator.connect(ctx.createMediaStreamDestination());
        oscillator.start(); ctx.resume();
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
    }

    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height });
        canvas.getContext('2d').fillRect(0, 0, width, height);
        let stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], { enabled: false });
    }

    let handleVideo = () => setVideo(!video);
    let handleAudio = () => setAudio(!audio);
    useEffect(() => { if (screen !== undefined) getDislayMedia(); }, [screen])
    let handleScreen = () => setScreen(!screen);

    let handleEndCall = () => {
        try { socketRef.current.emit('end-call'); } catch (e) { }
        try { localVideoref.current.srcObject.getTracks().forEach(t => t.stop()) } catch (e) { }
        window.location.href = "/";
    }

    const addMessage = (data, sender, socketIdSender) => {
        setMessages(prev => [...prev, { sender, data, socketIdSender }]);
        if (sender) updateUsernames({ [socketIdSender]: sender });
        if (socketIdSender !== socketIdRef.current) setNewMessages(p => p + 1);
    };

    let sendMessage = () => {
        socketRef.current.emit('chat-message', message, usernameRef.current || username);
        setMessage("");
    }

    let connect = () => {
        if (!usernameRef.current.trim()) return;
        setAskForUsername(false);
        getMedia();
    }

    /* ── LOBBY ── */
    if (askForUsername) return (
        <div style={{
            minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontFamily: "'DM Sans', system-ui, sans-serif",
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
                .lobby-input .MuiOutlinedInput-root { color: ${C.sec} !important; }
                .lobby-input .MuiOutlinedInput-notchedOutline { border-color: ${C.secBd} !important; }
                .lobby-input .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline { border-color: rgba(191,233,255,0.35) !important; }
                .lobby-input .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline { border-color: ${C.sec} !important; }
                .lobby-input .MuiInputLabel-root { color: ${C.muted} !important; }
                .lobby-input .MuiInputLabel-root.Mui-focused { color: ${C.sec} !important; }
            `}</style>

            <div style={{
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 24, padding: '48px 40px', width: '100%', maxWidth: 440,
                backdropFilter: 'blur(24px)', boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: C.priDim, border: `1px solid ${C.priBd}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <VideocamIcon style={{ color: C.pri, fontSize: 20 }} />
                    </div>
                    <span style={{ fontSize: '1.1rem', fontWeight: 600, color: C.sec, letterSpacing: '-0.01em' }}>
                        Connect<span style={{ color: C.pri, fontWeight: 700 }}>X</span>
                    </span>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: C.sec, marginBottom: 6 }}>
                        Enter the Lobby
                    </h2>
                    <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
                        Set a display name to join the call
                    </p>
                </div>

                <div style={{
                    width: '100%', borderRadius: 16, overflow: 'hidden',
                    border: `1px solid ${C.border}`, background: 'rgba(5,8,15,0.8)',
                    aspectRatio: '16/9', position: 'relative',
                }}>
                    <video ref={localVideoref} autoPlay muted
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <div style={{
                        position: 'absolute', bottom: 10, left: 10,
                        background: 'rgba(5,8,15,0.70)', backdropFilter: 'blur(8px)',
                        border: `1px solid ${C.secBd}`, borderRadius: 100,
                        padding: '3px 10px', fontSize: 10, fontWeight: 600,
                        color: C.muted, letterSpacing: '0.05em', textTransform: 'uppercase',
                        display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.pri, display: 'inline-block' }} />
                        Preview
                    </div>
                </div>

                <TextField
                    className="lobby-input"
                    fullWidth
                    label="Your name"
                    variant="outlined"
                    value={username}
                    onChange={e => {
                        setUsername(e.target.value);
                        usernameRef.current = e.target.value;
                    }}
                    onKeyDown={e => e.key === 'Enter' && username.trim() && connect()}
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />

                <button onClick={connect} disabled={!username.trim()} style={{
                    width: '100%', padding: '13px 0', border: 'none', borderRadius: 100,
                    background: username.trim()
                        ? `linear-gradient(115deg, ${C.pri} 0%, #ff9aaa 100%)`
                        : C.priDim,
                    color: username.trim() ? '#07090f' : C.muted,
                    fontSize: 14, fontWeight: 700, cursor: username.trim() ? 'pointer' : 'not-allowed',
                    fontFamily: 'inherit', transition: 'all 0.2s',
                    boxShadow: username.trim() ? `0 2px 20px rgba(255,110,127,0.30)` : 'none',
                }}>
                    Join Call
                </button>
            </div>
        </div>
    )

    /* ── MEET ROOM ── */
    return (
        <div style={{
            minHeight: '100vh', background: C.bg, display: 'flex',
            fontFamily: "'DM Sans', system-ui, sans-serif", overflow: 'hidden',
            position: 'relative', flexDirection: 'column',
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
                .chat-input .MuiOutlinedInput-root { color: ${C.sec} !important; border-radius: 12px !important; }
                .chat-input .MuiOutlinedInput-notchedOutline { border-color: ${C.secBd} !important; }
                .chat-input .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline { border-color: rgba(191,233,255,0.32) !important; }
                .chat-input .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline { border-color: ${C.sec} !important; }
                .chat-input .MuiInputLabel-root { color: ${C.muted} !important; }
                .chat-input .MuiInputLabel-root.Mui-focused { color: ${C.sec} !important; }
                .ctrl-btn { transition: background 0.18s, transform 0.15s !important; }
                .ctrl-btn:hover { transform: scale(1.08) !important; }
                video { background: #050810; }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: ${C.secBd}; border-radius: 4px; }
                @keyframes timerPulse { 0%,100%{opacity:1} 50%{opacity:0.2} }
            `}</style>

            {/* TOP BAR */}
            <div style={{
                height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 20px', background: C.surface,
                borderBottom: `1px solid ${C.border}`, backdropFilter: 'blur(24px)',
                zIndex: 10, flexShrink: 0,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: C.priDim, border: `1px solid ${C.priBd}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <VideocamIcon style={{ color: C.pri, fontSize: 14 }} />
                    </div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: C.sec, letterSpacing: '-0.01em' }}>
                        Connect<span style={{ color: C.pri }}>X</span>
                    </span>
                </div>

                <div style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    background: C.secDim, border: `1px solid ${C.secBd}`,
                    borderRadius: 100, padding: '5px 14px',
                    fontSize: 13, fontWeight: 700, color: C.muted, letterSpacing: '0.06em',
                    fontFamily: "'DM Mono', 'Courier New', monospace",
                }}>
                    <span style={{
                        width: 6, height: 6, borderRadius: '50%', background: C.pri,
                        display: 'inline-block', animation: 'timerPulse 1.5s ease-in-out infinite', flexShrink: 0,
                    }} />
                    {formatDuration(callDuration)}
                </div>

                <div style={{
                    fontSize: 11, fontWeight: 600, color: C.muted,
                    background: C.secDim, border: `1px solid ${C.secBd}`,
                    borderRadius: 100, padding: '4px 12px', letterSpacing: '0.04em',
                }}>
                    {videos.length + 1} participant{videos.length !== 0 ? 's' : ''}
                </div>
            </div>

            {/* BODY */}
            <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>

                {/* VIDEO AREA */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <div style={{
                        flex: 1, display: 'grid', padding: 16, gap: 12, overflow: 'auto',
                        gridTemplateColumns: videos.length <= 1 ? '1fr' : videos.length <= 4 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                        alignContent: 'start',
                        opacity: localExpanded ? 0.25 : 1,
                        transition: 'opacity 0.3s ease',
                        pointerEvents: localExpanded ? 'none' : 'auto',
                    }}>
                        {videos.length === 0 && (
                            <div style={{
                                borderRadius: 16, border: `1px dashed ${C.border}`,
                                background: 'rgba(10,14,26,0.5)', aspectRatio: '16/9',
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center', gap: 10,
                            }}>
                                <VideocamIcon style={{ color: C.muted, fontSize: 36, opacity: 0.3 }} />
                                <p style={{ fontSize: 13, color: C.muted, letterSpacing: '0.02em' }}>
                                    Waiting for others to join…
                                </p>
                            </div>
                        )}

                        {videos.map((v) => (
                            <div key={v.socketId} style={{
                                borderRadius: 16, overflow: 'hidden', position: 'relative',
                                border: `1px solid ${C.border}`, background: 'rgba(10,14,26,0.9)', aspectRatio: '16/9',
                            }}>
                                <video
                                    data-socket={v.socketId}
                                    ref={ref => { if (ref && v.stream) ref.srcObject = v.stream; }}
                                    autoPlay
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                />
                                {/* ── Name label: reads from state with ref as fallback ── */}
                                <div style={{
                                    position: 'absolute', bottom: 10, left: 10,
                                    background: 'rgba(5,8,15,0.65)', backdropFilter: 'blur(8px)',
                                    border: `1px solid ${C.secBd}`, borderRadius: 100,
                                    padding: '3px 10px', fontSize: 11, fontWeight: 600,
                                    color: C.sec, letterSpacing: '0.04em',
                                }}>
                                    {usernames[v.socketId]
                                        || usernamesRef.current[v.socketId]
                                        || `User-${v.socketId.slice(0, 4)}`}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CONTROL BAR */}
                    <div style={{
                        height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: 10, background: C.surface, borderTop: `1px solid ${C.border}`,
                        backdropFilter: 'blur(24px)', flexShrink: 0,
                    }}>
                        <IconButton className="ctrl-btn" onClick={handleVideo} style={{
                            background: video ? C.secDim : C.priDim,
                            border: `1px solid ${video ? C.secBd : C.priBd}`,
                            color: video ? C.sec : C.pri, borderRadius: 14, width: 46, height: 46,
                        }}>
                            {video ? <VideocamIcon fontSize="small" /> : <VideocamOffIcon fontSize="small" />}
                        </IconButton>

                        <IconButton className="ctrl-btn" onClick={handleAudio} style={{
                            background: audio ? C.secDim : C.priDim,
                            border: `1px solid ${audio ? C.secBd : C.priBd}`,
                            color: audio ? C.sec : C.pri, borderRadius: 14, width: 46, height: 46,
                        }}>
                            {audio ? <MicIcon fontSize="small" /> : <MicOffIcon fontSize="small" />}
                        </IconButton>

                        <IconButton className="ctrl-btn" onClick={handleEndCall} style={{
                            background: C.pri, color: '#07090f', borderRadius: 14, width: 52, height: 52,
                            boxShadow: `0 4px 20px rgba(255,110,127,0.40)`,
                        }}>
                            <CallEndIcon />
                        </IconButton>

                        {screenAvailable && (
                            <IconButton className="ctrl-btn" onClick={handleScreen} style={{
                                background: screen ? C.priDim : C.secDim,
                                border: `1px solid ${screen ? C.priBd : C.secBd}`,
                                color: screen ? C.pri : C.sec, borderRadius: 14, width: 46, height: 46,
                            }}>
                                {screen ? <ScreenShareIcon fontSize="small" /> : <StopScreenShareIcon fontSize="small" />}
                            </IconButton>
                        )}

                        <Badge badgeContent={newMessages} max={99}
                            sx={{ '& .MuiBadge-badge': { background: C.pri, color: '#07090f', fontWeight: 700, fontSize: 10 } }}>
                            <IconButton className="ctrl-btn"
                                onClick={() => { setModal(!showModal); setNewMessages(0); }}
                                style={{
                                    background: showModal ? C.priDim : C.secDim,
                                    border: `1px solid ${showModal ? C.priBd : C.secBd}`,
                                    color: showModal ? C.pri : C.sec, borderRadius: 14, width: 46, height: 46,
                                }}>
                                <ChatIcon fontSize="small" />
                            </IconButton>
                        </Badge>

                        <IconButton className="ctrl-btn" onClick={async () => {
                            const meetUrl = window.location.href;
                            if (navigator.share) {
                                await navigator.share({ title: 'Join my ConnectX meeting', text: 'Join my video call on ConnectX!', url: meetUrl }).catch(() => { });
                            } else {
                                await navigator.clipboard.writeText(meetUrl);
                                const toast = document.createElement('div');
                                toast.innerText = 'Link copied!';
                                Object.assign(toast.style, {
                                    position: 'fixed', bottom: '90px', left: '50%', transform: 'translateX(-50%)',
                                    background: 'rgba(191,233,255,0.12)', border: '1px solid rgba(191,233,255,0.25)',
                                    color: C.sec, padding: '8px 20px', borderRadius: '100px', fontSize: '13px',
                                    fontWeight: '600', zIndex: '9999', backdropFilter: 'blur(12px)', transition: 'opacity 0.3s',
                                });
                                document.body.appendChild(toast);
                                setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 2000);
                            }
                        }} style={{
                            background: C.secDim, border: `1px solid ${C.secBd}`,
                            color: C.sec, borderRadius: 14, width: 46, height: 46,
                        }}>
                            <ShareIcon fontSize="small" />
                        </IconButton>
                    </div>
                </div>

                {/* LOCAL PIP */}
                <div
                    onClick={() => setLocalExpanded(e => !e)}
                    style={{
                        position: 'fixed',
                        ...(localExpanded ? {
                            top: 52, left: 0, right: showModal ? 320 : 0, bottom: 72,
                            width: 'auto', borderRadius: 0,
                        } : {
                            bottom: 90, right: showModal ? 356 : 20, width: 180, borderRadius: 14,
                        }),
                        overflow: 'hidden', border: `1px solid ${C.secBd}`,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                        transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                        zIndex: localExpanded ? 15 : 20, background: 'rgba(5,8,15,0.9)', cursor: 'pointer',
                    }}
                >
                    <video ref={localVideoref} autoPlay muted
                        style={{
                            width: '100%', height: '100%', display: 'block',
                            aspectRatio: localExpanded ? undefined : '16/9', objectFit: 'cover'
                        }} />

                    {!audio && (
                        <div style={{
                            position: 'absolute', top: 7, right: 7, background: C.priDim,
                            border: `1px solid ${C.priBd}`, borderRadius: '50%', width: 24, height: 24,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <MicOffIcon style={{ fontSize: 13, color: C.pri }} />
                        </div>
                    )}

                    <div style={{
                        position: 'absolute', top: 7, left: 7,
                        background: 'rgba(5,8,15,0.55)', backdropFilter: 'blur(6px)',
                        border: `1px solid ${C.secBd}`, borderRadius: '50%', width: 24, height: 24,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.7,
                    }}>
                        {localExpanded
                            ? <CloseFullscreenIcon style={{ fontSize: 12, color: C.sec }} />
                            : <OpenInFullIcon style={{ fontSize: 12, color: C.sec }} />
                        }
                    </div>

                    <div style={{
                        position: 'absolute', bottom: 6, left: 8,
                        fontSize: 9, fontWeight: 700, color: C.sec,
                        letterSpacing: '0.05em', textTransform: 'uppercase',
                        background: 'rgba(5,8,15,0.65)', borderRadius: 100,
                        padding: '2px 7px', backdropFilter: 'blur(6px)',
                    }}>
                        {usernameRef.current || username || 'You'} (You)
                    </div>
                </div>

                {/* CHAT PANEL */}
                {showModal && (
                    <div style={{
                        width: 320, display: 'flex', flexDirection: 'column',
                        background: C.surface, borderLeft: `1px solid ${C.border}`,
                        backdropFilter: 'blur(24px)',
                    }}>
                        <div style={{
                            padding: '18px 20px', borderBottom: `1px solid ${C.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: C.sec, letterSpacing: '-0.01em' }}>Chat</span>
                            <div style={{
                                fontSize: 10, fontWeight: 600, color: C.muted,
                                background: C.secDim, border: `1px solid ${C.secBd}`,
                                borderRadius: 100, padding: '2px 8px', letterSpacing: '0.04em',
                            }}>
                                {messages.length} msg{messages.length !== 1 ? 's' : ''}
                            </div>
                        </div>

                        <div style={{
                            flex: 1, overflowY: 'auto', padding: '16px 16px 8px',
                            display: 'flex', flexDirection: 'column', gap: 12,
                        }}>
                            {messages.length === 0 ? (
                                <div style={{
                                    flex: 1, display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center', gap: 8,
                                }}>
                                    <ChatIcon style={{ color: C.muted, fontSize: 32, opacity: 0.4 }} />
                                    <p style={{ fontSize: 12, color: C.muted, textAlign: 'center' }}>No messages yet</p>
                                </div>
                            ) : messages.map((item, index) => {
                                const isOwn = item.socketIdSender === socketIdRef.current;
                                return (
                                    <div key={index} style={{
                                        background: isOwn ? C.secDim : C.priDim,
                                        border: `1px solid ${isOwn ? C.secBd : C.priBd}`,
                                        borderRadius: 12, padding: '10px 13px',
                                    }}>
                                        <p style={{
                                            fontSize: 11, fontWeight: 700,
                                            color: isOwn ? C.sec : C.pri,
                                            marginBottom: 4, letterSpacing: '0.02em',
                                        }}>
                                            {isOwn ? `${usernameRef.current || username} (You)` : item.sender}
                                        </p>
                                        <p style={{ fontSize: 13, color: C.sec, lineHeight: 1.5 }}>{item.data}</p>
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{
                            padding: '12px 14px', borderTop: `1px solid ${C.border}`,
                            display: 'flex', gap: 8, alignItems: 'center',
                        }}>
                            <TextField
                                className="chat-input" fullWidth size="small"
                                label="Message" variant="outlined"
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && message.trim() && sendMessage()}
                            />
                            <IconButton onClick={sendMessage} disabled={!message.trim()} style={{
                                background: message.trim() ? `linear-gradient(135deg, ${C.pri}, #ff9aaa)` : C.priDim,
                                color: message.trim() ? '#07090f' : C.muted,
                                borderRadius: 12, width: 40, height: 40, flexShrink: 0,
                            }}>
                                <SendIcon fontSize="small" />
                            </IconButton>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}