import { useState, useEffect } from 'react';
import './slavny-homes.css';

const NAVY  = '#0A1931';
const NAVY2 = '#0d2040';
const RED   = '#C8102E';
const WHITE = '#FFFFFF';
const CREAM = '#F5F4F0';

const RemaxBalloon = ({ size = 40 }) => (
  <svg width={size} height={size * 1.35} viewBox="0 0 80 108" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="40" cy="38" rx="34" ry="34" fill="#CC0000"/>
    <rect x="6" y="28" width="68" height="20" fill="white"/>
    <ellipse cx="40" cy="58" rx="34" ry="14" fill="#003087"/>
    <text x="40" y="42" textAnchor="middle" fill="#003087" fontSize="10" fontWeight="900" fontFamily="Arial,sans-serif">RE/MAX</text>
    <line x1="36" y1="70" x2="33" y2="84" stroke="#8B6914" strokeWidth="1.5"/>
    <line x1="44" y1="70" x2="47" y2="84" stroke="#8B6914" strokeWidth="1.5"/>
    <rect x="29" y="84" width="22" height="14" rx="2" fill="#8B6914"/>
  </svg>
);

const GoldBadge = ({ lines }) => (
  <div style={{
    width: 72, height: 72,
    background: 'radial-gradient(circle at 35% 35%, #f0c040, #a07810)',
    borderRadius: '50%', border: '2px solid #d4a017',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 18px rgba(212,160,23,0.5)',
    padding: 4,
  }}>
    <div style={{ fontSize: 14, lineHeight: 1 }}>⭐</div>
    {lines.map((l, i) => (
      <div key={i} style={{ fontSize: l.length > 5 ? 6 : 7, color: WHITE, fontWeight: 900, textAlign: 'center', lineHeight: 1.1, marginTop: 1, letterSpacing: 0.5 }}>{l}</div>
    ))}
  </div>
);

export default function SlavnyHomes() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled]  = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', type: 'sell' });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const go = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false); };

  const handleSubmit = (e) => { e.preventDefault(); setSent(true); };

  return (
    <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", color: NAVY }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, height: 70,
        background: scrolled ? 'rgba(10,25,49,0.97)' : 'rgba(10,25,49,0.55)',
        backdropFilter: 'blur(12px)',
        borderBottom: scrolled ? `2px solid ${RED}` : '2px solid transparent',
        transition: 'all 0.3s', padding: '0 5%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => go('home')}>
          <RemaxBalloon size={34}/>
          <div>
            <div style={{ fontSize: 17, fontWeight: 900, color: WHITE, letterSpacing: 1, lineHeight: 1 }}>SLAVNY</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: WHITE, letterSpacing: 3, lineHeight: 1 }}>HOMES</div>
          </div>
        </div>

        <div className="nav-links">
          {[['difference','OUR DIFFERENCE'],['listings','LISTINGS'],['contact','CONTACT']].map(([id,lbl]) => (
            <button key={id} onClick={() => go(id)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 11, fontWeight: 700, padding: '8px 14px', letterSpacing: 1,
              color: 'rgba(255,255,255,0.85)', fontFamily: 'inherit',
            }}>{lbl}</button>
          ))}
          <button onClick={() => go('evaluation')} style={{
            background: RED, color: WHITE, border: 'none',
            padding: '10px 20px', fontFamily: 'inherit', fontWeight: 700, fontSize: 11,
            cursor: 'pointer', letterSpacing: 1, marginLeft: 12,
          }}>FREE HOME EVALUATION</button>
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} style={{
          display: 'none', background: 'none', border: 'none', cursor: 'pointer',
          flexDirection: 'column', gap: 5, padding: 4,
        }}>
          {[0,1,2].map(i => <span key={i} style={{ width: 22, height: 2, background: WHITE, display: 'block' }}/>)}
        </button>
      </nav>

      {menuOpen && (
        <div style={{ position: 'fixed', top: 70, left: 0, right: 0, background: NAVY, zIndex: 999, padding: '10px 0 20px', borderBottom: `3px solid ${RED}` }}>
          {[['difference','OUR DIFFERENCE'],['listings','LISTINGS'],['contact','CONTACT'],['evaluation','FREE HOME EVALUATION']].map(([id,lbl]) => (
            <button key={id} onClick={() => go(id)} style={{
              display: 'block', width: '100%', background: 'none', border: 'none',
              padding: '13px 24px', fontSize: 13, fontWeight: 700, color: WHITE,
              textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: 1,
            }}>{lbl}</button>
          ))}
        </div>
      )}

      {/* ── HERO ── */}
      <section id="home" style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        background: NAVY, position: 'relative', overflow: 'hidden', paddingTop: 70,
      }}>
        {/* Split panel: photo + text */}
        <div style={{ flex: 1, display: 'flex', minHeight: 'calc(100vh - 70px - 120px)' }}>

          {/* Left: team photo */}
          <div className="hero-photo" style={{
            flex: '0 0 46%', position: 'relative',
            background: 'linear-gradient(135deg, #0b1e3d 0%, #16305e 60%, #0e2248 100%)',
            overflow: 'hidden',
          }}>
            {/* Right-edge fade into text panel */}
            <div style={{
              position: 'absolute', top: 0, right: 0, bottom: 0, width: '30%',
              background: `linear-gradient(to right, transparent, ${NAVY})`,
              zIndex: 2,
            }}/>
            {/* Photo placeholder */}
            <div style={{
              position: 'absolute', inset: 0, zIndex: 1,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.1)',
            }}>
              <div style={{ fontSize: 100, lineHeight: 1 }}>👨‍👩‍👦</div>
              <div style={{ fontSize: 10, letterSpacing: 3, marginTop: 14, textAlign: 'center' }}>TEAM PHOTO HERE</div>
            </div>
          </div>

          {/* Right: headline text */}
          <div className="hero-text" style={{
            flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
            padding: '40px 6% 40px 3%', position: 'relative', overflow: 'hidden',
          }}>
            {/* Giant "SLAVNY" watermark bleeding left */}
            <div style={{
              position: 'absolute', left: '-15%', right: '-5%', top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 'clamp(100px, 20vw, 260px)', fontWeight: 900,
              color: 'rgba(255,255,255,0.035)', lineHeight: 1,
              letterSpacing: -8, userSelect: 'none', pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}>SLAVNY</div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 'clamp(26px, 3.2vw, 40px)', fontWeight: 900, color: WHITE, letterSpacing: 3, lineHeight: 1 }}>
                SLAVNY
              </div>
              <div style={{ fontSize: 'clamp(18px, 2.2vw, 28px)', fontWeight: 400, color: WHITE, letterSpacing: 6, lineHeight: 1, marginBottom: 14 }}>
                HOMES
              </div>
              {/* #WEKNOWTHE on one line */}
              <div style={{ fontSize: 'clamp(24px, 3.8vw, 52px)', fontWeight: 900, letterSpacing: -1, lineHeight: 1 }}>
                <span style={{ color: RED }}>#WE</span><span style={{ color: WHITE }}>KNOWTHE</span>
              </div>
              {/* MARKET large */}
              <div style={{
                fontSize: 'clamp(40px, 7vw, 96px)', fontWeight: 900, color: WHITE,
                letterSpacing: -3, lineHeight: 0.9, marginTop: 2,
              }}>MARKET</div>
            </div>
          </div>
        </div>

        {/* Bottom strip: badges + stats + CTAs */}
        <div style={{
          background: '#060f1e', borderTop: `3px solid ${RED}`,
          padding: '18px 4%', flexShrink: 0,
        }}>
          <div className="hero-strip" style={{
            maxWidth: 1200, margin: '0 auto',
            display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
          }}>
            {/* Left: CLHMS badges */}
            <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
              <GoldBadge lines={['CERTIFIED','LUXURY HOME','CLHMS','GUILD']}/>
              <GoldBadge lines={['CLHMS','MARKETING','SPECIALIST']}/>
            </div>

            {/* Center: stats + buttons */}
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ display: 'flex', gap: 20, marginBottom: 12, flexWrap: 'wrap' }}>
                {['500+ HOMES SOLD','CERTIFIED LUXURY SPECIALISTS','CLHMS GUILD'].map(s => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 3, height: 14, background: RED, display: 'inline-block', flexShrink: 0 }}/>
                    <span style={{ fontSize: 10, color: WHITE, fontWeight: 700, letterSpacing: 1 }}>{s}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={() => go('evaluation')} style={{
                  background: RED, color: WHITE, border: 'none',
                  padding: '10px 18px', fontFamily: 'inherit', fontWeight: 700,
                  fontSize: 11, cursor: 'pointer', letterSpacing: 1,
                }}>GET YOUR FREE HOME EVALUATION</button>
                <button onClick={() => go('difference')} style={{
                  background: 'rgba(255,255,255,0.08)', color: WHITE,
                  border: '1px solid rgba(255,255,255,0.2)',
                  padding: '10px 16px', fontFamily: 'inherit', fontWeight: 700,
                  fontSize: 11, cursor: 'pointer', letterSpacing: 1,
                }}>SEE WHY WE'RE #1</button>
              </div>
            </div>

            {/* Right: Billion Dollar Guild badge */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <GoldBadge lines={['BILLION','DOLLAR','GUILD']}/>
              <RemaxBalloon size={22}/>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div style={{ background: NAVY2, borderBottom: `3px solid ${RED}`, padding: '28px 5%' }}>
        <div className="stats-grid" style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
          {[
            { val: '500+', lbl: 'HOMES SOLD',         sub: 'A track record built deal by deal, across the GTA.' },
            { val: '#1',   lbl: 'RE/MAX TEAM',         sub: 'Ranked the top performing RE/MAX team in Thornhill for 5+ years.' },
            { val: '98%',  lbl: 'LIST-TO-SALE RATIO',  sub: 'Our clients consistently get asking price — or above — every single time.' },
            { val: '15+',  lbl: 'YEARS OF EXPERTISE',  sub: 'We know what works in this market. We remember when it was being built.' },
          ].map((s, i) => (
            <div key={s.val} style={{ borderRight: i < 3 ? '1px solid rgba(255,255,255,0.1)' : 'none', paddingRight: 16 }}>
              <div style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 900, color: WHITE, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 10, color: RED, fontWeight: 700, letterSpacing: 1, margin: '5px 0 6px' }}>{s.lbl}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.55 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CREDENTIALS BAR ── */}
      <div style={{ background: WHITE, borderBottom: '1px solid #e8e8e8', padding: '14px 5%' }}>
        <div className="creds-bar" style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          {['CLHMS GUILD','CERTIFIED CLHMS','INSTITUTE FOR LUXURY','CLHMS'].map((c, i) => (
            <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 7, height: 7, background: NAVY, borderRadius: '50%', display: 'inline-block', flexShrink: 0 }}/>
              <span style={{ fontSize: 10, fontWeight: 700, color: NAVY, letterSpacing: 2 }}>{c}</span>
            </div>
          ))}
          <div style={{ background: NAVY, color: WHITE, padding: '5px 16px', fontSize: 10, fontWeight: 700, letterSpacing: 2 }}>CLHMS</div>
        </div>
      </div>

      {/* ── RED TICKER ── */}
      <div style={{ background: RED, padding: '11px 0', overflow: 'hidden' }}>
        <div className="ticker" style={{ display: 'flex', gap: 48, whiteSpace: 'nowrap', justifyContent: 'center', flexWrap: 'wrap', padding: '0 24px' }}>
          {['THORNHILL','#1 RE/MAX TEAM','VAUGHAN','RICHMOND HILL','AURORA','BUY · SELL · INVEST'].map(t => (
            <span key={t} style={{ fontSize: 11, fontWeight: 700, color: WHITE, letterSpacing: 2 }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── WHY SLAVNY HOMES ── */}
      <section id="difference" style={{ padding: '90px 5%', background: WHITE }}>
        <div className="difference-grid" style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 70, alignItems: 'start' }}>
          <div>
            <div style={{ fontSize: 11, color: RED, fontWeight: 700, letterSpacing: 3, marginBottom: 14 }}>— WHY SLAVNY HOMES</div>
            <h2 style={{ fontSize: 'clamp(28px, 3.8vw, 46px)', fontWeight: 900, color: NAVY, lineHeight: 1.08, margin: '0 0 22px' }}>
              This market is{' '}
              <span style={{ color: RED, fontStyle: 'italic' }}>our home.</span>
              <br/>We know every street.
            </h2>
            <p style={{ fontSize: 14, color: '#555', lineHeight: 1.8, marginBottom: 34 }}>
              The Slavny Homes team has spent over 15 years mastering the Thornhill, Vaughan, Richmond Hill and Aurora markets. We don't just know the data —{' '}
              <em>we live it, breathe it, and use it</em> to get our clients an edge on every transaction.
            </p>
            <div>
              {[
                { n: '01', t: 'Hyperlocal Market Intelligence', d: 'Neighbourhood-level data, school district performance, micro-market trends — we live here. Our clients receive information no one else has.' },
                { n: '02', t: 'Record-Breaking Sale Prices',    d: 'We consistently achieve the highest prices per square foot in every neighbourhood we serve. Our multi-offer strategy and staging expertise turn listings into bidding wars.' },
                { n: '03', t: 'An Elite Buyer Network',         d: 'Tens of relationships with qualified buyers across our listings often sell before they enter the open market. First-mover advantage for luxury clients.' },
                { n: '04', t: 'Start-to-Close White Glove Service', d: 'Staging. Trades. Negotiation. Experience. We handle every detail in the process to ensure a smooth, thoughtful, and completely stress-free transaction.' },
              ].map(f => (
                <div key={f.n} style={{ display: 'flex', gap: 16, marginBottom: 22, paddingBottom: 22, borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ fontSize: 26, fontWeight: 900, color: '#e4e4e4', lineHeight: 1, flexShrink: 0, minWidth: 30 }}>{f.n}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: NAVY, marginBottom: 5 }}>{f.t}</div>
                    <div style={{ fontSize: 13, color: '#777', lineHeight: 1.65 }}>{f.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { val: '500+', lbl: 'HOMES SOLD',         sub: 'A track record built deal by deal, across the GTA',       border: NAVY },
                { val: '#1',   lbl: 'RE/MAX TEAM — THORNHILL', sub: 'Ranked the top performing RE/MAX team in Thornhill', border: NAVY },
                { val: '98%',  lbl: 'LIST-TO-SALE RATIO', sub: '— achieved on every single listing',                       border: RED  },
                { val: '15+',  lbl: 'YEARS OF EXPERTISE', sub: 'We remember this market before they built most of it',     border: RED  },
              ].map(s => (
                <div key={s.val} style={{ border: `2px solid ${s.border}`, padding: '22px 18px' }}>
                  <div style={{ fontSize: 46, fontWeight: 900, color: NAVY, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: RED, letterSpacing: 1.5, margin: '8px 0 6px' }}>{s.lbl}</div>
                  <div style={{ fontSize: 11, color: '#888', lineHeight: 1.55 }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section style={{ background: NAVY, padding: '80px 5%' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: RED, fontWeight: 700, letterSpacing: 3, marginBottom: 28 }}>— CONSTELLATION CLIENT</div>
          <blockquote style={{ fontSize: 'clamp(18px, 2.8vw, 28px)', fontWeight: 700, color: WHITE, lineHeight: 1.55, fontStyle: 'italic', margin: '0 0 28px' }}>
            "Tatyana and Shayne don't just know the market — they know how to win in it. They negotiated the highest sale price for our lot size in the entire neighbourhood. We couldn't believe it."
          </blockquote>
          <div style={{ fontSize: 12, color: RED, fontWeight: 700, letterSpacing: 2 }}>— FRED · VERIFIED CLIENT · VAUGHAN</div>
          <div style={{ color: '#f0a500', fontSize: 20, marginTop: 12, letterSpacing: 4 }}>★★★★★</div>
        </div>
      </section>

      {/* ── MARKETS ── */}
      <section style={{ padding: '80px 5%', background: CREAM }}>
        <div className="markets-grid" style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, color: RED, fontWeight: 700, letterSpacing: 3, marginBottom: 14 }}>— OUR MARKETS</div>
            <h2 style={{ fontSize: 'clamp(28px, 3.8vw, 46px)', fontWeight: 900, color: NAVY, lineHeight: 1.1, margin: '0 0 18px' }}>
              <span style={{ color: RED, fontStyle: 'italic' }}>Everywhere</span><br/>
              that matters<br/>in the GTA.
            </h2>
            <p style={{ fontSize: 14, color: '#666', lineHeight: 1.75, maxWidth: 360 }}>
              Every neighbourhood has its own micro-market, its own pricing dynamics, its own data points. We know them all — intimately.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
            {[
              { city: 'Thornhill',     sub: 'Our home base' },
              { city: 'Vaughan',       sub: 'Premium communities' },
              { city: 'Richmond Hill', sub: 'Deep local expertise' },
              { city: 'Aurora',        sub: 'Growing luxury market' },
              { city: 'Woodbridge',    sub: 'Family & investment' },
              { city: 'Maple',         sub: 'Emerging hotspot' },
            ].map(m => (
              <div key={m.city} style={{
                background: WHITE, padding: '18px 22px',
                borderLeft: `3px solid ${RED}`,
                transition: 'transform 0.15s',
              }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: NAVY }}>{m.city}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{m.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LISTINGS ── */}
      <section id="listings" style={{ padding: '80px 5%', background: WHITE }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: RED, fontWeight: 700, letterSpacing: 3, marginBottom: 8 }}>— PROPERTIES</div>
              <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 900, color: NAVY, margin: 0 }}>Current &amp; Upcoming Listings</h2>
            </div>
            <button onClick={() => go('contact')} style={{
              background: 'none', color: RED, border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontWeight: 700, fontSize: 12, letterSpacing: 1,
              textDecoration: 'underline',
            }}>VIEW ALL LISTINGS →</button>
          </div>
          <div className="listings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
            {[
              { addr: '105 Ferragine Crescent', city: 'Thornhill', status: 'ACTIVE LISTING', bg: '#e8f4e8', action: 'REQUEST DETAILS' },
              { addr: '41 Cedarpoint Drive',    city: 'Thornhill', status: 'ACTIVE LISTING', bg: '#fce8e8', action: 'REQUEST DETAILS' },
              { addr: '304 Lauderdale Drive',   city: 'Vaughan',   status: 'ACTIVE LISTING', bg: '#e8eef8', action: 'REQUEST DETAILS' },
              { addr: '46 Glover Street',       city: 'Aurora',    status: 'UPCOMING',       bg: '#f8f4e8', action: 'VIEW BROCHURE' },
            ].map(l => (
              <div key={l.addr} style={{ border: '1px solid #e8e8e8', overflow: 'hidden' }}>
                <div style={{ height: 155, background: l.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <span style={{ fontSize: 44, opacity: 0.45 }}>🏠</span>
                  <div style={{ position: 'absolute', top: 10, left: 10, background: NAVY, color: WHITE, fontSize: 8, fontWeight: 700, padding: '3px 8px', letterSpacing: 1 }}>{l.status}</div>
                </div>
                <div style={{ padding: '14px 15px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, lineHeight: 1.3 }}>{l.addr}</div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 3 }}>{l.city}</div>
                  <button onClick={() => go('contact')} style={{
                    marginTop: 11, background: 'none', color: RED,
                    border: `1px solid ${RED}`, padding: '7px 12px',
                    fontSize: 9, fontWeight: 700, cursor: 'pointer',
                    fontFamily: 'inherit', letterSpacing: 1, width: '100%',
                  }}>{l.action}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOME EVALUATION ── */}
      <section id="evaluation" style={{ background: NAVY, padding: '90px 5%' }}>
        <div className="eval-grid" style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'start' }}>
          <div>
            <div style={{ fontSize: 11, color: RED, fontWeight: 700, letterSpacing: 3, marginBottom: 14 }}>— FREE PRICING ANALYSIS</div>
            <h2 style={{ fontSize: 'clamp(26px, 3.8vw, 44px)', fontWeight: 900, color: WHITE, lineHeight: 1.1, margin: '0 0 18px' }}>
              What is your home<br/>
              <span style={{ color: RED, fontStyle: 'italic' }}>worth right now?</span>
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginBottom: 26 }}>
              Find out in 24 hours or less. Our team will analyze your property, run the neighbourhood comparables — not just the Zestimate — and give you a real number based on real deal data.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {[
                "You'll have precise local knowledge — not generic estimates",
                "Response within 24 hours",
                "Absolutely zero obligation",
                "Powered by 500+ transactions of real data",
              ].map(pt => (
                <div key={pt} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ color: RED, fontWeight: 900, fontSize: 12, marginTop: 1 }}>▶</span>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>{pt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div id="contact" style={{ background: WHITE, padding: 32 }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
                <h3 style={{ color: NAVY, fontSize: 22, marginBottom: 10 }}>We'll be in touch!</h3>
                <p style={{ color: '#666', fontSize: 14, lineHeight: 1.75 }}>
                  Thank you for reaching out to Slavny Homes. Expect a response within 24 hours with your personalized home evaluation.
                </p>
                <button onClick={() => setSent(false)} style={{ marginTop: 20, background: RED, color: WHITE, border: 'none', padding: '11px 24px', fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Send Another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ fontSize: 17, fontWeight: 800, color: NAVY, marginBottom: 4 }}>Let's Talk — It's Free</div>
                <div style={{ fontSize: 12, color: '#999', marginBottom: 22 }}>Fill out the form and we'll be in touch within 24 hours</div>
                {[
                  { key: 'name',    label: 'Full Name',         type: 'text',  ph: 'Your name',                  req: true  },
                  { key: 'phone',   label: 'Phone Number',      type: 'tel',   ph: '(416) 555-0000',             req: false },
                  { key: 'email',   label: 'Email Address',     type: 'email', ph: 'you@email.com',              req: true  },
                  { key: 'address', label: 'Property Address',  type: 'text',  ph: '123 Main Street, Thornhill', req: false },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom: 13 }}>
                    <label style={{ fontSize: 10, color: '#888', fontWeight: 700, letterSpacing: 1, display: 'block', marginBottom: 4 }}>
                      {f.label.toUpperCase()}{f.req && ' *'}
                    </label>
                    <input required={f.req} value={form[f.key]} onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))}
                      type={f.type} placeholder={f.ph}
                      style={{ width: '100%', background: CREAM, border: '1px solid #e0e0e0', padding: '10px 12px', fontFamily: 'inherit', fontSize: 14, boxSizing: 'border-box', outline: 'none', borderRadius: 0 }}/>
                  </div>
                ))}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 10, color: '#888', fontWeight: 700, letterSpacing: 1, display: 'block', marginBottom: 4 }}>I'M LOOKING TO</label>
                  <select value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))}
                    style={{ width: '100%', background: CREAM, border: '1px solid #e0e0e0', padding: '10px 12px', fontFamily: 'inherit', fontSize: 14, outline: 'none', borderRadius: 0 }}>
                    <option value="sell">Sell my home</option>
                    <option value="buy">Buy a home</option>
                    <option value="evaluate">Get a free evaluation</option>
                    <option value="invest">Invest in real estate</option>
                    <option value="other">Other inquiry</option>
                  </select>
                </div>
                <button type="submit" style={{
                  width: '100%', background: NAVY, color: WHITE, border: 'none',
                  padding: '14px', fontFamily: 'inherit', fontWeight: 700,
                  fontSize: 13, cursor: 'pointer', letterSpacing: 1,
                }}>GET MY FREE EVALUATION →</button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#060f1e', padding: '50px 5% 24px', borderTop: `3px solid ${RED}` }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 40 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <RemaxBalloon size={30}/>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: WHITE, letterSpacing: 1 }}>SLAVNY HOMES</div>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, marginTop: 1 }}>BE SURE TO DO MORE</div>
                </div>
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, maxWidth: 250 }}>
                Proudly serving Thornhill, Vaughan, Richmond Hill and Aurora markets for over 15 years — with 500+ sales and clients who trust us to win.
              </p>
            </div>
            {[
              { title: 'Services', links: ['Buying a Home','Selling a Home','Luxury Listings','Free Evaluation'] },
              { title: 'Markets',  links: ['Thornhill','Vaughan','Richmond Hill','Aurora'] },
              { title: 'Contact',  links: ['info@slavnyhomes.ca','slavnyhomes.ca','Thornhill, ON','RE/MAX Hallmark'] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: 'rgba(255,255,255,0.35)', marginBottom: 14 }}>{col.title.toUpperCase()}</div>
                {col.links.map(l => (
                  <div key={l} style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 9, cursor: 'pointer' }}
                    onClick={() => l.includes('@') ? window.open(`mailto:${l}`) : null}>{l}</div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>© {new Date().getFullYear()} Slavny Homes. RE/MAX Hallmark. All rights reserved.</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Licensed Real Estate Brokerage · Ontario, Canada · slavnyhomes.ca</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
