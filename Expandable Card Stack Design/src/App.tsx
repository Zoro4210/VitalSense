import { useState } from 'react'

interface CardData {
  id: number
  heading: string
  body: string
  accent: string
}

const CARDS: CardData[] = [
  {
    id: 0,
    heading: 'On-Device Edge AI',
    body: "All risk inference runs locally on the EFR32xG26's AI accelerator. No internet needed, no cloud costs, no latency — data never leaves the device.",
    accent: '#0d9488',
  },
  {
    id: 1,
    heading: 'Continuous Posture Tracking',
    body: "The Smart Belt's IMU continuously detects whether the patient is on their left side, supine, or right — triggering pressure checks only when needed.",
    accent: '#7c3aed',
  },
  {
    id: 2,
    heading: '4-Zone Pressure Mapping',
    body: 'Four repositionable FSR plates map pressure distribution, weight concentration, and micro-movement across the bed surface with granular precision.',
    accent: '#0284c7',
  },
  {
    id: 3,
    heading: 'Real-Time Risk Alerts',
    body: 'Low / Medium / High risk scores are pushed instantly to the mobile app or hospital dashboard — flagging high-risk patients before damage begins.',
    accent: '#dc2626',
  },
  {
    id: 4,
    heading: 'Home Care Ready',
    body: 'Designed for family caregivers managing a bedridden patient at home. Simple installation, affordable price point, and a mobile-first experience.',
    accent: '#059669',
  },
  {
    id: 5,
    heading: 'Hospital Dashboard',
    body: 'Centralized multi-bed monitoring for small hospitals. High-risk patients are automatically surfaced — no expensive proprietary infrastructure required.',
    accent: '#d97706',
  },
]

const CARD_H = 72
const PEEK = 12        // how much of each stacked card peeks below
const OPEN_H = 220     // height of an open card
const LIFT = OPEN_H - CARD_H + 16

export default function App() {
  const [openId, setOpenId] = useState<number | null>(null)

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#f2f2f7', fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      {/* Phone shell */}
      <div
        style={{
          width: 390,
          minHeight: 844,
          background: '#f2f2f7',
          borderRadius: 50,
          boxShadow: '0 30px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Status bar */}
        <div className="flex items-center justify-between px-8 pt-4 pb-1" style={{ fontSize: 15, fontWeight: 600 }}>
          <span>12:22</span>
          <div className="flex items-center gap-1.5">
            {/* Signal */}
            <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
              <rect x="0" y="6" width="3" height="6" rx="0.8" opacity="0.4"/>
              <rect x="4.5" y="4" width="3" height="8" rx="0.8" opacity="0.6"/>
              <rect x="9" y="2" width="3" height="10" rx="0.8" opacity="0.8"/>
              <rect x="13.5" y="0" width="3" height="12" rx="0.8"/>
            </svg>
            {/* WiFi */}
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <path d="M8 9.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" fill="currentColor"/>
              <path d="M2.5 5.5C4.1 3.9 5.9 3 8 3s3.9.9 5.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              <path d="M0 2.5C2.2.9 4.9 0 8 0s5.8.9 8 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4"/>
              <path d="M5 8a4.3 4.3 0 0 1 6 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
            </svg>
            {/* Battery */}
            <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
              <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="currentColor" strokeOpacity="0.35"/>
              <rect x="22.5" y="3.5" width="2" height="5" rx="1" fill="currentColor" fillOpacity="0.4"/>
              <rect x="2" y="2" width="16" height="8" rx="1.5" fill="currentColor"/>
            </svg>
          </div>
        </div>

        {/* Top nav */}
        <div className="flex items-center justify-between px-6 pt-3 pb-4">
          {/* Avatar */}
          <button style={{ width: 32, height: 32, borderRadius: '50%', background: '#e5e5ea', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="1.8" strokeLinecap="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </button>

          <h1 style={{ fontSize: 17, fontWeight: 700, color: '#000', letterSpacing: -0.4 }}>Cards</h1>

          <div className="flex items-center gap-3">
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="1.8" strokeLinecap="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Card stack area */}
        <div className="flex-1 px-5 pb-4 overflow-hidden">
          <div
            className="relative"
            style={{
              height: CARDS.length * PEEK + (openId !== null ? OPEN_H : CARD_H) + (CARDS.length - 1) * 2,
              transition: 'height 0.45s cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            {CARDS.map((card, i) => {
              const isOpen = openId === card.id
              const isBelowOpen = openId !== null && i > CARDS.findIndex(c => c.id === openId)
              const openIdx = CARDS.findIndex(c => c.id === openId)

              // Base position: cards fan below top card
              let topBase = i * PEEK
              if (isBelowOpen) {
                topBase += LIFT
              }

              return (
                <div
                  key={card.id}
                  onClick={() => setOpenId(isOpen ? null : card.id)}
                  className="absolute left-0 right-0 cursor-pointer"
                  style={{
                    top: topBase,
                    zIndex: isOpen ? 30 : CARDS.length - i + (isBelowOpen ? 0 : 5),
                    transition: 'top 0.45s cubic-bezier(0.34,1.1,0.64,1)',
                  }}
                >
                  {/* Card */}
                  <div
                    style={{
                      borderRadius: 22,
                      background: '#ffffff',
                      boxShadow: isOpen
                        ? `0 20px 60px rgba(0,0,0,0.18), 0 6px 20px ${card.accent}22`
                        : i === 0
                        ? '0 4px 20px rgba(0,0,0,0.10)'
                        : '0 2px 8px rgba(0,0,0,0.06)',
                      overflow: 'hidden',
                      border: isOpen ? `1.5px solid ${card.accent}28` : '1.5px solid rgba(0,0,0,0.04)',
                      transition: 'box-shadow 0.4s ease, border-color 0.3s ease',
                    }}
                  >
                    {/* Accent stripe */}
                    <div
                      style={{
                        height: 4,
                        background: card.accent,
                        opacity: isOpen ? 1 : 0,
                        transition: 'opacity 0.35s ease',
                      }}
                    />

                    {/* Heading row */}
                    <div
                      className="flex items-center justify-between px-5"
                      style={{ height: CARD_H - (isOpen ? 4 : 0), minHeight: 64 }}
                    >
                      <span
                        style={{
                          fontSize: 16,
                          fontWeight: 600,
                          color: isOpen ? card.accent : '#1c1c1e',
                          letterSpacing: -0.3,
                          transition: 'color 0.3s ease',
                        }}
                      >
                        {card.heading}
                      </span>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: isOpen ? card.accent + '15' : '#f2f2f7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'background 0.3s ease, transform 0.35s ease',
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                          stroke={isOpen ? card.accent : '#8e8e93'} strokeWidth="2.5" strokeLinecap="round">
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </div>
                    </div>

                    {/* Body */}
                    <div
                      style={{
                        maxHeight: isOpen ? 200 : 0,
                        overflow: 'hidden',
                        transition: 'max-height 0.42s cubic-bezier(0.4,0,0.2,1)',
                      }}
                    >
                      <p
                        className="px-5 pb-6 pt-1"
                        style={{
                          fontSize: 14,
                          lineHeight: 1.6,
                          color: '#3c3c43',
                          margin: 0,
                        }}
                      >
                        {card.body}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom tab bar */}
        <div
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(20px)',
            borderTop: '0.5px solid rgba(0,0,0,0.12)',
            paddingBottom: 28,
            paddingTop: 10,
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
          }}
        >
          {/* Deleted */}
          <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="1.6" strokeLinecap="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
            <span style={{ fontSize: 10, color: '#8e8e93', fontWeight: 500 }}>Deleted</span>
          </button>

          {/* Cards (active) */}
          <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer' }}>
            <div style={{ width: 48, height: 36, background: '#000', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
                <rect x="1" y="5" width="20" height="12" rx="3" stroke="white" strokeWidth="1.6"/>
                <rect x="4" y="1" width="14" height="10" rx="2.5" stroke="white" strokeWidth="1.6"/>
              </svg>
            </div>
          </button>

          {/* Captures */}
          <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="1.6" strokeLinecap="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            <span style={{ fontSize: 10, color: '#8e8e93', fontWeight: 500 }}>Captures</span>
          </button>
        </div>
      </div>
    </div>
  )
}
