import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HistoryIcon from '@mui/icons-material/History';
import VideocamIcon from '@mui/icons-material/Videocam';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TagIcon from '@mui/icons-material/Tag';

const PRI = '#ff6e7f';
const SEC = '#bfe9ff';

export default function History() {
    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const [activeMeetings, setActiveMeetings] = useState({});
    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(history);
                const token = localStorage.getItem('token');
                const statusMap = {};
                await Promise.all(history.map(async (e) => {
                    try {
                        const res = await fetch(
                            `${import.meta.env.VITE_SERVER_URL || 'http://localhost:8000'}/api/v1/users/check_meeting_active?meeting_code=${e.meetingCode}&token=${token}`
                        );
                        const data = await res.json();
                        statusMap[e.meetingCode] = data.active;
                    } catch { statusMap[e.meetingCode] = false; }
                }));
                setActiveMeetings(statusMap);
            } catch { }
        }
        fetchHistory();
    }, [])

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    return (
        <div style={{ minHeight: '100vh', background: '#050810', fontFamily: "'DM Sans', system-ui, sans-serif", color: SEC }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(191,233,255,0.15); border-radius: 4px; }

                .meeting-card {
                    background: rgba(10,14,26,0.80);
                    border: 1px solid rgba(191,233,255,0.10);
                    border-radius: 16px; padding: 20px 22px;
                    display: flex; align-items: center; justify-content: space-between; gap: 16px;
                    flex-wrap: wrap;
                    transition: border-color 0.2s, background 0.2s, transform 0.2s;
                }
                .meeting-card:hover {
                    border-color: rgba(191,233,255,0.22);
                    background: rgba(191,233,255,0.04);
                    transform: translateY(-2px);
                }
                .back-btn {
                    display: flex; align-items: center; gap: 7px;
                    background: rgba(191,233,255,0.07); border: 1px solid rgba(191,233,255,0.18);
                    border-radius: 100px; padding: 8px 16px;
                    color: rgba(191,233,255,0.60); font-family: inherit; font-size: 13px; font-weight: 500;
                    cursor: pointer; transition: all 0.2s;
                }
                .back-btn:hover { background: rgba(191,233,255,0.12); border-color: rgba(191,233,255,0.30); color: ${SEC}; }

                .rejoin-btn {
                    background: rgba(255,110,127,0.10); border: 1px solid rgba(255,110,127,0.25);
                    border-radius: 100px; padding: 6px 16px;
                    color: rgba(255,110,127,0.75); font-family: inherit; font-size: 12px; font-weight: 600;
                    cursor: pointer; transition: all 0.2s; white-space: nowrap;
                }
                .rejoin-btn:hover { background: rgba(255,110,127,0.18); border-color: rgba(255,110,127,0.40); color: ${PRI}; }
            `}</style>

            {/* NAV */}
            <nav style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px clamp(16px, 4vw, 44px)',
                background: 'rgba(5,8,15,0.70)', backdropFilter: 'blur(24px)',
                borderBottom: '1px solid rgba(191,233,255,0.07)',
                position: 'sticky', top: 0, zIndex: 10,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(191,233,255,0.07)', border: '1px solid rgba(191,233,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <VideocamIcon style={{ color: SEC, fontSize: 16 }} />
                    </div>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700, color: SEC, letterSpacing: '-0.01em' }}>
                        Connect<span style={{ color: PRI }}>X</span>
                    </span>
                </div>
                <button className="back-btn" onClick={() => routeTo('/home')}>
                    <ArrowBackIcon style={{ fontSize: 15 }} /> Back to Home
                </button>
            </nav>

            {/* CONTENT */}
            <div style={{ maxWidth: 680, margin: '0 auto', padding: 'clamp(24px, 5vw, 48px) 16px' }}>

                <div style={{ marginBottom: 36 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 7,
                        background: 'rgba(191,233,255,0.07)', border: '1px solid rgba(191,233,255,0.16)',
                        borderRadius: 100, padding: '4px 12px', marginBottom: 14,
                        fontSize: 11, fontWeight: 600, color: 'rgba(191,233,255,0.50)',
                        letterSpacing: '0.07em', textTransform: 'uppercase',
                    }}>
                        <HistoryIcon style={{ fontSize: 13 }} /> Meeting History
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: SEC, letterSpacing: '-0.02em', marginBottom: 6 }}>
                        Past Meetings
                    </h1>
                    <p style={{ fontSize: 13, color: 'rgba(191,233,255,0.40)', lineHeight: 1.6 }}>
                        {meetings.length > 0
                            ? `You have attended ${meetings.length} meeting${meetings.length !== 1 ? 's' : ''}`
                            : 'No meetings recorded yet'}
                    </p>
                </div>

                {meetings.length === 0 ? (
                    <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        gap: 12, padding: '64px 0',
                        border: '1px dashed rgba(191,233,255,0.12)', borderRadius: 20,
                    }}>
                        <HistoryIcon style={{ color: 'rgba(191,233,255,0.18)', fontSize: 40 }} />
                        <p style={{ fontSize: 14, color: 'rgba(191,233,255,0.30)' }}>No meeting history found</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {meetings.map((e, i) => (
                            <div className="meeting-card" key={i}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                                    background: 'rgba(255,110,127,0.10)', border: '1px solid rgba(255,110,127,0.22)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 12, fontWeight: 700, color: 'rgba(255,110,127,0.70)',
                                }}>
                                    {String(i + 1).padStart(2, '0')}
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <TagIcon style={{ fontSize: 13, color: 'rgba(191,233,255,0.35)' }} />
                                        <span style={{ fontSize: 13, fontWeight: 600, color: SEC, letterSpacing: '0.01em' }}>
                                            {e.meetingCode}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <CalendarTodayIcon style={{ fontSize: 12, color: 'rgba(191,233,255,0.30)' }} />
                                        <span style={{ fontSize: 12, color: 'rgba(191,233,255,0.40)' }}>
                                            {formatDate(e.date)}
                                        </span>
                                    </div>
                                </div>
                                {activeMeetings[e.meetingCode] ? (
                                    <button className="rejoin-btn" onClick={() => routeTo(`/${e.meetingCode}`)}>
                                        Rejoin →
                                    </button>
                                ) : (
                                    <span style={{
                                        fontSize: 11, fontWeight: 600, color: 'rgba(191,233,255,0.20)',
                                        letterSpacing: '0.03em', padding: '6px 12px',
                                        border: '1px solid rgba(191,233,255,0.08)', borderRadius: 100,
                                    }}>
                                        Ended
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}