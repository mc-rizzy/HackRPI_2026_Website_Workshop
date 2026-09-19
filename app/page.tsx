'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [targetCount, setTargetCount] = useState<number>(5);
  const [betAmount, setBetAmount] = useState<number>(1);
  const [balance, setBalance] = useState<number>(10);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [geminiResponse, setGeminiResponse] = useState<string>('');
  const [actualCount, setActualCount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Wheel animation states
  const [dots, setDots] = useState<string>('.');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (loading) {
      document.title = '🌀 Spinning... | Dookie Roulette';
    } else if (gameResult) {
      document.title = '🎰 Game Over | Dookie Roulette';
    } else {
      document.title = '🎰 Gemini Dookie Roulette';
    }
  }, [loading, gameResult]);

  // Dynamic Multipliers & Payouts (Strictly Rounded Integers, Low Scaling)
  const calculateMultiplier = (count: number) => {
    if (count <= 3) return 1; // 1x payout (breakeven)
    if (count <= 10) return Math.floor(count * 0.5); // 2x to 5x
    if (count <= 25) return Math.floor(count * 1.2); // 6x to 30x
    return 40; // Cap at 40x
  };

  const currentMultiplier = Math.floor(calculateMultiplier(targetCount));
  const potentialPayout = Math.floor(betAmount * currentMultiplier);

  // Quick adjust target count helper
  const adjustTargetCount = (delta: number) => {
    setTargetCount((prev) => Math.max(1, Math.min(500, prev + delta)));
  };

  // Quick adjust bet amount helper
  const adjustBetAmount = (delta: number) => {
    setBetAmount((prev) => Math.max(1, Math.min(Math.floor(balance), prev + delta)));
  };

  // Loading dots animation loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setDots((prev) => (prev.length >= 3 ? '.' : prev + '.'));
      }, 150);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handlePlay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (betAmount <= 0 || betAmount > balance) {
      alert('Invalid bet amount!');
      return;
    }

    setLoading(true);
    setGameResult(null);
    setGeminiResponse('');
    setActualCount(null);

    const prompt = `Write a creative short story or sentence about a silly dog, and try to include the word "dookie" roughly ${targetCount} times throughout your response.`;

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (res.ok) {
        const text = data.text || '';
        setGeminiResponse(text);

        const matches = text.match(/dookie/gi);
        const count = matches ? matches.length : 0;
        setActualCount(count);

        if (count === Number(targetCount)) {
          setBalance((prev) => Math.floor(prev + potentialPayout));
          setGameResult(`🎉 IMPOSSIBLE WIN! Gemini said "dookie" exactly ${count} times! Won $${potentialPayout} (${currentMultiplier}x payout)!`);
        } else {
          setBalance((prev) => Math.floor(prev - betAmount));
          setGameResult(`💥 HOUSE WINS! Gemini said "dookie" ${count} times instead of ${targetCount}. Lost $${Math.floor(betAmount)}.`);
        }
      } else {
        setGameResult(`API Error: ${data.error}`);
      }
    } catch (err) {
      setGameResult('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: '1000px', margin: '40px auto', padding: '28px', backgroundColor: '#09090b', color: '#f4f4f5', borderRadius: '16px', fontFamily: 'sans-serif', border: '1px solid #27272a', boxShadow: '0 20px 40px rgba(0,0,0,0.8)' }}>
      
      {/* DESCRIPTIVE TITLE */}
      <h1 style={{ textAlign: 'center', marginBottom: '4px', color: '#facc15', fontSize: '32px', letterSpacing: '-0.5px' }}>
        🎰 Gemini Dookie Roulette: High-Stakes AI Precision Betting
      </h1>
      <p style={{ textAlign: 'center', color: '#a1a1aa', fontSize: '15px', marginBottom: '32px' }}>
        Test your odds against Large Language Model randomness in real-time.
      </p>

      {/* TWO-COLUMN GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: GAME BOARD & CONTROLS */}
        <div style={{ backgroundColor: '#18181b', padding: '24px', borderRadius: '12px', border: '1px solid #27272a' }}>
          
          {/* ENLARGED 280px WHEEL WITH LIGHTS AND RED/WHITE STRIPES */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '16px 0 28px' }}>
            <div style={{ position: 'relative', width: '320px', height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              
              {/* Casino Pointer */}
              <div style={{ position: 'absolute', top: '-10px', left: '142px', zIndex: 10, fontSize: '40px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.9))' }}>
                👇
              </div>

              {/* Outer Ring with Animated Lights */}
              <div
                style={{
                  position: 'relative',
                  width: '310px',
                  height: '310px',
                  borderRadius: '50%',
                  backgroundColor: '#18181b',
                  border: '6px solid #eab308',
                  boxShadow: '0 0 30px rgba(234, 179, 8, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* 12 Outer Perimeter Lights */}
                {mounted && [...Array(12)].map((_, i) => {
                const angle = (i * 30 * Math.PI) / 180;
                const radius = 142;
                const x = radius * Math.cos(angle);
                const y = radius * Math.sin(angle);
                return (
                  <div
                    key={i}
                    className={`casino-bulb ${loading ? 'blinking' : ''}`}
                    style={{
                      position: 'absolute',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      transform: `translate(${x}px, ${y}px)`,
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                );
              })}

                {/* Red & White Striped Spinning Wheel */}
                <div
                  style={{
                    width: '260px',
                    height: '260px',
                    borderRadius: '50%',
                    border: '4px solid #09090b',
                    // 12 Alternating Red (#dc2626) and White (#f8fafc) Conic Segments
                    background: 'conic-gradient(#dc2626 0deg 30deg, #f8fafc 30deg 60deg, #dc2626 60deg 90deg, #f8fafc 90deg 120deg, #dc2626 120deg 150deg, #f8fafc 150deg 180deg, #dc2626 180deg 210deg, #f8fafc 210deg 240deg, #dc2626 240deg 270deg, #f8fafc 270deg 300deg, #dc2626 300deg 330deg, #f8fafc 330deg 360deg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: loading ? 'casinoSpin 1.2s linear infinite' : 'none',
                  }}
                >
                  {/* Wheel Center Badge */}
                  <div style={{ width: '100px', height: '100px', backgroundColor: '#09090b', borderRadius: '50%', border: '4px solid #facc15', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#facc15', fontWeight: 'bold', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8)' }}>
                    <span style={{ fontSize: '11px', color: '#a1a1aa' }}>PAYOUT</span>
                    <span style={{ fontSize: '24px' }}>{currentMultiplier}x</span>
                  </div>
                </div>
              </div>
            </div>

            {loading && (
              <p style={{ marginTop: '20px', fontWeight: 'bold', color: '#facc15', fontSize: '16px' }}>
                Gemini is generating response{dots}
              </p>
            )}
          </div>

          {/* STATS & BALANCE BOARD */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', backgroundColor: '#09090b', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #27272a', textAlign: 'center' }}>
            <div>
              <span style={{ fontSize: '12px', color: '#a1a1aa', display: 'block' }}>BALANCE</span>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#4ade80' }}>${Math.floor(balance)}</span>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#a1a1aa', display: 'block' }}>MULTIPLIER</span>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#facc15' }}>{currentMultiplier}x</span>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#a1a1aa', display: 'block' }}>POTENTIAL WIN</span>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#38bdf8' }}>${potentialPayout}</span>
            </div>
          </div>

          {/* BETTING FORM & BUTTONS */}
          <form onSubmit={handlePlay} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* TARGET COUNT CUSTOM BUTTONS */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '14px', color: '#d4d4d8' }}>Target "Dookie" Count:</label>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#facc15' }}>{targetCount}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
                <button type="button" onClick={() => adjustTargetCount(-100)} style={btnStyle}>-100</button>
                <button type="button" onClick={() => adjustTargetCount(-10)} style={btnStyle}>-10</button>
                <button type="button" onClick={() => adjustTargetCount(-1)} style={btnStyle}>-1</button>
                <button type="button" onClick={() => adjustTargetCount(1)} style={btnStyle}>+1</button>
                <button type="button" onClick={() => adjustTargetCount(10)} style={btnStyle}>+10</button>
                <button type="button" onClick={() => adjustTargetCount(100)} style={btnStyle}>+100</button>
              </div>
            </div>

            {/* BET AMOUNT CUSTOM BUTTONS */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '14px', color: '#d4d4d8' }}>Bet Amount ($):</label>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#4ade80' }}>${Math.floor(betAmount)}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
                <button type="button" onClick={() => adjustBetAmount(-50)} style={btnStyle}>-$50</button>
                <button type="button" onClick={() => adjustBetAmount(-10)} style={btnStyle}>-$10</button>
                <button type="button" onClick={() => adjustBetAmount(-1)} style={btnStyle}>-$1</button>
                <button type="button" onClick={() => adjustBetAmount(1)} style={btnStyle}>+$1</button>
                <button type="button" onClick={() => adjustBetAmount(10)} style={btnStyle}>+$10</button>
                <button type="button" onClick={() => adjustBetAmount(50)} style={btnStyle}>+$50</button>
              </div>
            </div>

            {/* MAIN PLAY BUTTON */}
            <button
              type="submit"
              disabled={loading || balance <= 0}
              style={{
                padding: '16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: loading ? '#3f3f46' : '#2563eb',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '18px',
                cursor: loading || balance <= 0 ? 'not-allowed' : 'pointer',
                marginTop: '8px',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
              }}
            >
              {loading ? 'Spinning Wheel...' : `Bet $${Math.floor(betAmount)} to Win $${potentialPayout}`}
            </button>
          </form>

          {/* OUTCOME DISPLAY */}
          {gameResult && (
            <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#09090b', borderRadius: '12px', border: '1px solid #27272a' }}>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '16px', color: actualCount === targetCount ? '#4ade80' : '#f87171' }}>
                {gameResult}
              </p>

              {geminiResponse && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #27272a' }}>
                  <span style={{ fontSize: '12px', color: '#a1a1aa', display: 'block', marginBottom: '4px' }}>
                    Gemini's Raw Output:
                  </span>
                  <p style={{ margin: 0, fontFamily: 'monospace', backgroundColor: '#18181b', padding: '12px', borderRadius: '8px', wordBreak: 'break-word', color: '#38bdf8', fontSize: '14px' }}>
                    "{geminiResponse}"
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: SIDEBAR INSTRUCTIONS */}
        <aside style={{ backgroundColor: '#18181b', padding: '24px', borderRadius: '12px', border: '1px solid #27272a' }}>
          <h2 style={{ fontSize: '18px', color: '#facc15', marginTop: 0, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📖 How to Play
          </h2>
          
          <ol style={{ paddingLeft: '20px', margin: 0, color: '#d4d4d8', fontSize: '14px', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li>
              <strong>Set Your Target Count:</strong> Predict the exact number of times Gemini will utter the word "dookie" in its response.
            </li>
            <li>
              <strong>Place Your Bet:</strong> Choose your bet amount from your bankroll. You start with <strong>$10</strong>.
            </li>
            <li>
              <strong>Understand the Odds:</strong> Higher target counts increase output variability, scaling your payout multiplier up to <strong>40x</strong>.
            </li>
            <li>
              <strong>Spin & Evaluate:</strong> Click spin to prompt Gemini. If the raw text match count equals your target exactly, you collect the payout!
            </li>
          </ol>

          <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#09090b', borderRadius: '8px', border: '1px solid #3f3f46' }}>
            <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
              ⚠️ House Edge Warning:
            </span>
            <p style={{ margin: 0, fontSize: '12px', color: '#a1a1aa', lineHeight: '1.4' }}>
              Gemini outputs with high randomness (temperature 1.0). Perfect hits are extremely rare!
            </p>
          </div>
        </aside>

      </div>

      {/* CSS KEYFRAMES FOR WHEEL SPIN */}
      <style jsx global>{`
        @keyframes casinoSpin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '10px 0',
  backgroundColor: '#27272a',
  border: '1px solid #3f3f46',
  color: '#f4f4f5',
  borderRadius: '6px',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontSize: '13px',
};

<style jsx global>{`
  @keyframes casinoSpin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .casino-bulb {
    background-color: #facc15;
    box-shadow: 0 0 8px #facc15, 0 0 16px #facc15;
  }

  @keyframes bulbGlow {
    0%, 100% {
      background-color: #facc15;
      box-shadow: 0 0 10px #facc15, 0 0 20px #facc15;
    }
    50% {
      background-color: #ef4444;
      box-shadow: 0 0 10px #ef4444, 0 0 20px #ef4444;
    }
  }

  .casino-bulb.blinking {
    animation: bulbGlow 0.6s infinite ease-in-out;
  }
`}</style>