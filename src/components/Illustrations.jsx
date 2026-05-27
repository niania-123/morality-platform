import React from 'react'

// ========== 童趣水彩风 SVG 插画组件 ==========
// 独立文件，精致手绘风格，适合1-2年级小学生

// ── 通用装饰 ──

function WatercolorBg({ colors = ['#FFE5E5', '#E5FFE5', '#E5E5FF'], opacity = 0.15 }) {
  return (
    <g>
      <ellipse cx="100" cy="105" rx="90" ry="72" fill={colors[0]} opacity={opacity}/>
      <ellipse cx={55 + Math.random() * 10} cy={65 + Math.random() * 10} rx="48" ry="36" fill={colors[1]} opacity={opacity * 0.8}/>
      <ellipse cx={148 + Math.random() * 8} cy={75 + Math.random() * 8} rx="42" ry="32" fill={colors[2]} opacity={opacity * 0.7}/>
    </g>
  )
}

function SoftCloud({ x, y, scale = 1, opacity = 0.55 }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`} opacity={opacity}>
      <ellipse cx="0" cy="0" rx="20" ry="11" fill="white"/>
      <ellipse cx="-13" cy="3" rx="13" ry="9" fill="white"/>
      <ellipse cx="15" cy="3" rx="14" ry="9" fill="white"/>
      <ellipse cx="-5" cy="-6" rx="11" ry="8" fill="white"/>
      <ellipse cx="9" cy="-5" rx="12" ry="8" fill="white"/>
    </g>
  )
}

function GrassGround({ y = 178, color = '#C8E6C9' }) {
  return (
    <g>
      <ellipse cx="100" cy={y} rx="98" ry="15" fill={color} opacity="0.35"/>
      <path d={`M15,${y} Q50,${y - 5} 85,${y} Q120,${y - 3} 155,${y} Q175,${y - 2} 190,${y}`} fill="none" stroke={color} strokeWidth="1.5" opacity="0.25"/>
      <ellipse cx="100" cy={y + 3} rx="95" ry="10" fill={color} opacity="0.15"/>
    </g>
  )
}

function Flower({ x, y, color = '#FFB0C8', size = 1 }) {
  return (
    <g transform={`translate(${x},${y}) scale(${size})`}>
      {[0, 60, 120, 180, 240, 300].map((d, i) => (
        <ellipse key={i} cx={5 * Math.cos(d * Math.PI / 180)} cy={5 * Math.sin(d * Math.PI / 180)}
          rx="4" ry="2.8" fill={color} opacity="0.75"
          transform={`rotate(${d}, ${5 * Math.cos(d * Math.PI / 180)}, ${5 * Math.sin(d * Math.PI / 180)})`}/>
      ))}
      <circle cx="0" cy="0" r="3" fill="#FFE082"/>
    </g>
  )
}

function Butterfly({ x, y, color = '#FFB0C8', scale = 1 }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`} opacity="0.7">
      <ellipse cx="-6" cy="-3" rx="7" ry="5" fill={color} opacity="0.8" transform="rotate(-15)"/>
      <ellipse cx="6" cy="-3" rx="7" ry="5" fill={color} opacity="0.8" transform="rotate(15)"/>
      <ellipse cx="-4" cy="3" rx="4.5" ry="3" fill={color} opacity="0.6" transform="rotate(-10)"/>
      <ellipse cx="4" cy="3" rx="4.5" ry="3" fill={color} opacity="0.6" transform="rotate(10)"/>
      <circle cx="-3" cy="-2" r="1.2" fill="white" opacity="0.6"/>
      <circle cx="3" cy="-2" r="1.2" fill="white" opacity="0.6"/>
      <line x1="0" y1="-6" x2="0" y2="7" stroke="#8D6E63" strokeWidth="1.2"/>
    </g>
  )
}

function Sparkle({ x, y, size = 1, color = '#FFE082' }) {
  return (
    <g transform={`translate(${x},${y}) scale(${size})`}>
      <polygon points="0,-6 1.5,-1.5 6,-1.5 2.5,1.2 3.8,6 0,3 -3.8,6 -2.5,1.2 -6,-1.5 -1.5,-1.5" fill={color} opacity="0.7"/>
    </g>
  )
}

// ── 精致小朋友（Q版2头身，大眼睛，圆脸，有头发、腮红、可爱表情）──

function CuteKid({
  x, y,
  hairStyle = 'bob',
  hairColor = '#5D4037',
  skinColor = '#FFCCAA',
  shirtColor = '#FF8FAB',
  skirtColor = null,
  pantsColor = '#64B5F6',
  shoesColor = '#5D4037',
  expression = 'happy',
  scale = 1,
  facing = 1,
  armLeft = 'down',
  armRight = 'down',
}) {
  const f = facing

  const renderFace = () => {
    const blush = (
      <>
        <ellipse cx="-7" cy="3" rx="3.2" ry="1.8" fill="#FFB0B0" opacity="0.45"/>
        <ellipse cx="7" cy="3" rx="3.2" ry="1.8" fill="#FFB0B0" opacity="0.45"/>
      </>
    )
    const eyes = (
      <>
        <ellipse cx="-5" cy="-1" rx="3" ry="3.2" fill="#4E342E"/>
        <ellipse cx="5" cy="-1" rx="3" ry="3.2" fill="#4E342E"/>
        <circle cx="-4" cy="-2.5" r="1.3" fill="white"/>
        <circle cx="4" cy="-2.5" r="1.3" fill="white"/>
        <circle cx="-5.5" cy="0.5" r="0.7" fill="white" opacity="0.6"/>
        <circle cx="5.5" cy="0.5" r="0.7" fill="white" opacity="0.6"/>
      </>
    )
    let mouth
    if (expression === 'happy') {
      mouth = <path d="M-3,5.5 Q0,9.5 3,5.5" fill="none" stroke="#E57373" strokeWidth="1.5" strokeLinecap="round"/>
    } else if (expression === 'excited') {
      mouth = <><ellipse cx="0" cy="6" rx="3" ry="2.5" fill="#E57373" opacity="0.8"/><ellipse cx="0" cy="4.5" rx="3.5" ry="1" fill="white" opacity="0.4"/></>
    } else if (expression === 'think') {
      mouth = <path d="M-2,6 Q0,4.5 2,6" fill="none" stroke="#E57373" strokeWidth="1.2" strokeLinecap="round"/>
    } else if (expression === 'proud') {
      mouth = <path d="M-4,5.5 Q0,10 4,5.5" fill="none" stroke="#E57373" strokeWidth="1.8" strokeLinecap="round"/>
    }

    return <>{blush}{eyes}{mouth}</>
  }

  const renderHair = () => {
    if (hairStyle === 'bob') {
      return (
        <>
          <ellipse cx="0" cy="-5" rx="14.5" ry="13" fill={hairColor}/>
          <path d="M-10,-6 Q-8,-14 0,-14 Q8,-14 10,-6" fill={hairColor}/>
          <ellipse cx="-12" cy="4" rx="4" ry="8" fill={hairColor}/>
          <ellipse cx="12" cy="4" rx="4" ry="8" fill={hairColor}/>
        </>
      )
    } else if (hairStyle === 'short') {
      return (
        <>
          <ellipse cx="0" cy="-5" rx="14" ry="12" fill={hairColor}/>
          <path d="M-9,-5 Q-6,-13 0,-13 Q6,-13 9,-5" fill={hairColor}/>
        </>
      )
    } else if (hairStyle === 'pigtails') {
      return (
        <>
          <ellipse cx="0" cy="-5" rx="14.5" ry="13" fill={hairColor}/>
          <path d="M-10,-6 Q-7,-14 0,-14 Q7,-14 10,-6" fill={hairColor}/>
          <ellipse cx="-14" cy="-4" rx="5" ry="10" fill={hairColor}/>
          <ellipse cx="14" cy="-4" rx="5" ry="10" fill={hairColor}/>
          <circle cx="-13" cy="-10" r="2" fill="#FF8FAB"/>
          <circle cx="13" cy="-10" r="2" fill="#FF8FAB"/>
        </>
      )
    } else if (hairStyle === 'long') {
      return (
        <>
          <ellipse cx="0" cy="-5" rx="14.5" ry="13" fill={hairColor}/>
          <path d="M-10,-6 Q-7,-14 0,-14 Q7,-14 10,-6" fill={hairColor}/>
          <path d="M-14,0 Q-16,18 -12,32" fill="none" stroke={hairColor} strokeWidth="7" strokeLinecap="round"/>
          <path d="M14,0 Q16,18 12,32" fill="none" stroke={hairColor} strokeWidth="7" strokeLinecap="round"/>
        </>
      )
    }
  }

  const armPositions = {
    down:  { lx: -16, ly: 30, rx: 16, ry: 30 },
    up:    { lx: -20, ly: 4, rx: 20, ry: 4 },
    wave:  { lx: -24, ly: 12, rx: 24, ry: 8 },
    side:  { lx: -26, ly: 28, rx: 26, ry: 28 },
  }
  const arm = armPositions[armLeft] || armPositions.down
  const armR = armPositions[armRight] || armPositions.down

  const bottom = skirtColor ? (
    <path d="M-10,36 L-14,54 Q0,56 14,54 L10,36z" fill={skirtColor}/>
  ) : (
    <path d="M-8,36 L-9,52 Q0,54 9,52 L8,36z" fill={pantsColor}/>
  )

  return (
    <g transform={`translate(${x},${y}) scale(${scale * f}, ${scale})`}>
      {renderHair()}
      <ellipse cx="0" cy="0" rx="12.5" ry="11.5" fill={skinColor}/>
      {renderFace()}
      <path d="M-10,11 Q-13,24 -11,38 Q0,42 11,38 Q13,24 10,11 Q0,7 -10,11z" fill={shirtColor}/>
      <path d="M-4,13 L0,17 L4,13" fill="none" stroke="white" strokeWidth="1.2" opacity="0.5"/>
      {bottom}
      <path d={`M-10,18 Q${arm.lx},${arm.ly - 6} ${arm.lx},${arm.ly}`} fill="none" stroke={shirtColor} strokeWidth="6.5" strokeLinecap="round"/>
      <path d={`M10,18 Q${arm.rx},${arm.ry - 6} ${arm.rx},${arm.ry}`} fill="none" stroke={shirtColor} strokeWidth="6.5" strokeLinecap="round"/>
      <circle cx={arm.lx} cy={arm.ly} r="4" fill={skinColor}/>
      <circle cx={arm.rx} cy={arm.ry} r="4" fill={skinColor}/>
      <ellipse cx="-6" cy="55" rx="6.5" ry="3.5" fill={shoesColor} opacity="0.8"/>
      <ellipse cx="6" cy="55" rx="6.5" ry="3.5" fill={shoesColor} opacity="0.8"/>
      <ellipse cx="-5" cy="54" rx="3" ry="1.5" fill="white" opacity="0.2"/>
      <ellipse cx="7" cy="54" rx="3" ry="1.5" fill="white" opacity="0.2"/>
    </g>
  )
}

export function IllustCover({ c1 = '#F8A4B8', c2 = '#FFD580', c3 = '#A8E6C1' }) {
  return (
    <svg viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E3F2FD"/>
          <stop offset="100%" stopColor="#FFF8F0"/>
        </linearGradient>
      </defs>
      <rect width="240" height="200" rx="12" fill="url(#skyG)"/>
      <WatercolorBg colors={[c1, c2, c3]} opacity={0.1}/>
      <SoftCloud x="30" y="22" scale="0.7" opacity="0.4"/>
      <SoftCloud x="190" y="18" scale="0.6" opacity="0.35"/>
      <SoftCloud x="110" y="12" scale="0.5" opacity="0.3"/>
      <circle cx="210" cy="28" r="15" fill="#FFE082" opacity="0.9"/>
      <circle cx="210" cy="28" r="22" fill="#FFE082" opacity="0.12"/>
      {[0,45,90,135,180,225,270,315].map((d,i) => (
        <line key={i} x1={210+18*Math.cos(d*Math.PI/180)} y1={28+18*Math.sin(d*Math.PI/180)}
          x2={210+25*Math.cos(d*Math.PI/180)} y2={28+25*Math.sin(d*Math.PI/180)}
          stroke="#FFE082" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      ))}
      <rect x="38" y="96" width="12" height="55" rx="5" fill="#A1887F"/>
      <rect x="40" y="96" width="4" height="55" rx="2" fill="#8D6E63" opacity="0.4"/>
      <ellipse cx="44" cy="78" rx="32" ry="34" fill="#81C784"/>
      <ellipse cx="28" cy="86" rx="22" ry="24" fill="#A5D6A7" opacity="0.7"/>
      <ellipse cx="58" cy="84" rx="20" ry="22" fill="#C8E6C9" opacity="0.5"/>
      <ellipse cx="44" cy="68" rx="18" ry="18" fill="#66BB6A" opacity="0.5"/>
      <rect x="190" y="112" width="8" height="35" rx="3" fill="#A1887F"/>
      <ellipse cx="194" cy="100" rx="18" ry="22" fill="#81C784"/>
      <ellipse cx="186" cy="106" rx="14" ry="16" fill="#A5D6A7" opacity="0.7"/>
      <GrassGround y={172}/>
      <Flower x="22" y="166" color={c1} size="0.8"/>
      <Flower x="78" y="163" color="#FFD580" size="0.7"/>
      <Flower x="160" y="164" color="#94C5EC" size="0.65"/>
      <Flower x="210" y="168" color="#C5A3FF" size="0.6"/>
      <Flower x="130" y="167" color="#FFB0C8" size="0.55"/>
      <Butterfly x="150" y="55" color="#FFB0C8" scale="0.7"/>
      <Butterfly x="70" y="68" color="#B39DDB" scale="0.5"/>
      <g transform="translate(90, 32)" opacity="0.5">
        <path d="M0,0 Q-5,-7 -10,-2 Q-5,2 0,0" fill="#FFAB91"/>
        <path d="M0,0 Q5,-7 10,-2 Q5,2 0,0" fill="#FFAB91"/>
      </g>
      <CuteKid x="65" y="115" hairStyle="bob" hairColor="#5D4037" skinColor="#FFCCAA" shirtColor={c1} pantsColor="#64B5F6" expression="happy" scale="0.75" armRight="wave"/>
      <CuteKid x="125" y="108" hairStyle="pigtails" hairColor="#3E2723" skinColor="#FFD4B8" shirtColor={c2} skirtColor="#FFE0B2" expression="excited" scale="0.82" armLeft="up" armRight="up"/>
      <CuteKid x="185" y="114" hairStyle="short" hairColor="#8D6E63" skinColor="#FFDAB8" shirtColor={c3} pantsColor="#B39DDB" expression="happy" scale="0.7" armLeft="down"/>
    </svg>
  )
}

export function IllustStory({ c1 = '#FFE5B4', c2 = '#B5EAD7' }) {
  return (
    <svg viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="240" height="200" rx="12" fill="#FFFBF5" opacity="0.5"/>
      <WatercolorBg colors={[c1, c2, '#E8E5FF']} opacity={0.15}/>
      <g transform="translate(120, 100)">
        <ellipse cx="0" cy="38" rx="62" ry="6" fill="#000" opacity="0.04"/>
        <path d="M-5,-42 L-60,-36 L-60,32 L-5,26z" fill="#FFF9E6" stroke="#E8C87A" strokeWidth="1.5"/>
        <path d="M5,-42 L60,-36 L60,32 L5,26z" fill="#FFFFF5" stroke="#E8C87A" strokeWidth="1.5"/>
        <path d="M0,-44 L0,28" stroke="#D4A84A" strokeWidth="2.5"/>
        <rect x="-3" y="-44" width="6" height="72" rx="2" fill="#D4A84A" opacity="0.15"/>
        {[-24,-16,-8,0,8].map((y,i) => (
          <rect key={i} x="-52" y={y} width={34 - i * 3} height="2.5" rx="1.2" fill={i%2===0?"#FFCDD2":"#FFB0C8"} opacity="0.5"/>
        ))}
        {[-24,-16,-8,0,8].map((y,i) => (
          <rect key={i} x="18" y={y} width={32 - i * 2} height="2.5" rx="1.2" fill={i%2===0?"#BBDEFB":"#90CAF9"} opacity="0.5"/>
        ))}
        <circle cx="-36" cy="18" r="8" fill="#C8E6C9" opacity="0.5"/>
        <circle cx="-36" cy="18" r="4" fill="#81C784" opacity="0.4"/>
        <rect x="20" y="14" width="16" height="12" rx="2" fill="#FFE0B2" opacity="0.5"/>
        <path d="M60,-36 Q55,-32 52,-28" fill="none" stroke="#E8C87A" strokeWidth="0.8" opacity="0.5"/>
      </g>
      <Sparkle x="45" y="42" size="0.8" color="#FFE082"/>
      <Sparkle x="195" y="38" size="0.7" color="#FFB0C8"/>
      <Sparkle x="35" y="155" size="0.6" color="#94C5EC"/>
      <Sparkle x="205" y="148" size="0.65" color="#A5DA34"/>
      <CuteKid x="38" y="148" hairStyle="long" hairColor="#5D4037" skinColor="#FFCCAA" shirtColor="#FF8FAB" skirtColor="#B39DDB" expression="happy" scale="0.5" armLeft="side" armRight="side"/>
    </svg>
  )
}

export function IllustThinking({ c1 = '#E8D5F5', c2 = '#FFDDD2' }) {
  return (
    <svg viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="240" height="200" rx="12" fill="#F9F5FF" opacity="0.5"/>
      <WatercolorBg colors={[c1, c2, '#E5F0FF']} opacity={0.15}/>
      <ellipse cx="165" cy="52" rx="38" ry="24" fill="white" stroke="#CE93D8" strokeWidth="1.8" opacity="0.95"/>
      <circle cx="138" cy="72" r="8" fill="white" stroke="#CE93D8" strokeWidth="1.3" opacity="0.9"/>
      <circle cx="126" cy="85" r="5.5" fill="white" stroke="#CE93D8" strokeWidth="1" opacity="0.85"/>
      <circle cx="120" cy="94" r="3.2" fill="white" stroke="#CE93D8" strokeWidth="0.8" opacity="0.8"/>
      <g transform="translate(165, 48)">
        <path d="M0,-12 C-8,-12 -11,-5 -11,0 C-11,4 -8,6 -6,8 L6,8 C8,6 11,4 11,0 C11,-5 8,-12 0,-12z" fill="#FFE082" stroke="#FFC107" strokeWidth="1"/>
        <rect x="-4" y="8" width="8" height="5" rx="1.5" fill="#FFC107"/>
        <line x1="-3" y1="10" x2="3" y2="10" stroke="#FFF" strokeWidth="0.8" opacity="0.5"/>
        {[-90,-45,0,45,90,135,180,225].map((d,i) => (
          <line key={i} x1={14*Math.cos(d*Math.PI/180)} y1={14*Math.sin(d*Math.PI/180)}
            x2={18*Math.cos(d*Math.PI/180)} y2={18*Math.sin(d*Math.PI/180)}
            stroke="#FFE082" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
        ))}
      </g>
      <CuteKid x="95" y="110" hairStyle="bob" hairColor="#5D4037" skinColor="#FFCCAA" shirtColor="#CE93D8" pantsColor="#64B5F6" expression="think" scale="0.8" armLeft="down" armRight="up"/>
      <GrassGround y={180}/>
      <Sparkle x="48" y="35" size="0.6" color="#FFE082"/>
      <Sparkle x="200" y="45" size="0.55" color="#FFB0C8"/>
      <Sparkle x="210" y="130" size="0.5" color="#B39DDB"/>
    </svg>
  )
}

export function IllustDiscussion({ c1 = '#B5EAD7', c2 = '#FFE5B4' }) {
  return (
    <svg viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="240" height="200" rx="12" fill="#F5FFF9" opacity="0.5"/>
      <WatercolorBg colors={[c1, c2, '#E5E5FF']} opacity={0.15}/>
      <rect x="18" y="28" width="75" height="42" rx="16" fill="#FFF5E6" stroke="#FFBA6A" strokeWidth="1.8"/>
      <path d="M42,70 L54,70 L48,84" fill="#FFF5E6" stroke="#FFBA6A" strokeWidth="1" strokeLinejoin="round"/>
      <circle cx="42" cy="46" r="4" fill="#FFE082" opacity="0.6"/>
      <circle cx="58" cy="44" r="3" fill="#FFB0C8" opacity="0.6"/>
      <circle cx="68" cy="50" r="3.5" fill="#94C5EC" opacity="0.6"/>
      <rect x="148" y="34" width="75" height="42" rx="16" fill="#E6F3FF" stroke="#64B5F6" strokeWidth="1.8"/>
      <path d="M176,76 L188,76 L182,90" fill="#E6F3FF" stroke="#64B5F6" strokeWidth="1" strokeLinejoin="round"/>
      <path d="M185,50 C185,47 181,44 178,47 C176,49 178,53 185,57 C192,53 194,49 192,47 C189,44 185,47 185,50z" fill="#FFB0C8" opacity="0.5"/>
      <circle cx="196" cy="48" r="3" fill="#FFE082" opacity="0.5"/>
      <CuteKid x="65" y="110" hairStyle="bob" hairColor="#5D4037" skinColor="#FFCCAA" shirtColor="#FF8FAB" skirtColor="#FFE0B2" expression="happy" scale="0.72" armLeft="side" armRight="wave"/>
      <CuteKid x="175" y="114" hairStyle="short" hairColor="#8D6E63" skinColor="#FFD4B8" shirtColor="#64B5F6" pantsColor="#81C784" expression="excited" scale="0.7" armLeft="wave" armRight="side"/>
      <GrassGround y={182}/>
      <Flower x="30" y="176" color="#FFB0C8" size="0.6"/>
      <Flower x="210" y="178" color="#C5A3FF" size="0.55"/>
    </svg>
  )
}

export function IllustActivity({ c1 = '#FFD5E5', c2 = '#D5F5E3' }) {
  return (
    <svg viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="240" height="200" rx="12" fill="#FFF5FA" opacity="0.5"/>
      <WatercolorBg colors={[c1, c2, '#E5F0FF']} opacity={0.13}/>
      {[{ x: 35, y: 38, color: '#FF8FAB' }, { x: 200, y: 32, color: '#64B5F6' }, { x: 120, y: 25, color: '#FFE082' }].map((b, i) => (
        <g key={i} opacity="0.6">
          <ellipse cx={b.x} cy={b.y} rx="12" ry="15" fill={b.color}/>
          <ellipse cx={b.x - 3} cy={b.y - 3} rx="4" ry="6" fill="white" opacity="0.25"/>
          <path d={`M${b.x},${b.y + 15} Q${b.x - 2},${b.y + 28} ${b.x + 2},${b.y + 45}`} fill="none" stroke={b.color} strokeWidth="1" opacity="0.6"/>
          <polygon points={`${b.x - 2},${b.y + 14} ${b.x + 2},${b.y + 14} ${b.x},${b.y + 17}`} fill={b.color} opacity="0.6"/>
        </g>
      ))}
      <GrassGround y={178}/>
      <Flower x="22" y="172" color="#FFB0C8" size="0.65"/>
      <Flower x="218" y="174" color="#94C5EC" size="0.6"/>
      <Flower x="120" y="174" color="#C5A3FF" size="0.5"/>
      <Butterfly x="180" y="58" color="#FFB0C8" scale="0.6"/>
      <CuteKid x="48" y="108" hairStyle="short" hairColor="#3E2723" skinColor="#FFDAB8" shirtColor="#FFE082" pantsColor="#FF8FAB" expression="excited" scale="0.65" armLeft="up" armRight="up"/>
      <CuteKid x="120" y="100" hairStyle="pigtails" hairColor="#5D4037" skinColor="#FFCCAA" shirtColor="#CE93D8" skirtColor="#64B5F6" expression="excited" scale="0.78" armLeft="up" armRight="up"/>
      <CuteKid x="195" y="106" hairStyle="bob" hairColor="#8D6E63" skinColor="#FFD4B8" shirtColor="#81C784" pantsColor="#FFE0B2" expression="happy" scale="0.62" armLeft="wave" armRight="down"/>
    </svg>
  )
}

export function IllustHome({ c1 = '#FFF3CD', c2 = '#D4EDDA' }) {
  return (
    <svg viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="240" height="200" rx="12" fill="#FFFCF5" opacity="0.5"/>
      <WatercolorBg colors={[c1, c2, '#FFE5E5']} opacity={0.13}/>
      <circle cx="200" cy="30" r="16" fill="#FFE082" opacity="0.85"/>
      <circle cx="200" cy="30" r="23" fill="#FFE082" opacity="0.1"/>
      {[0,45,90,135,180,225,270,315].map((d,i) => (
        <line key={i} x1={200+20*Math.cos(d*Math.PI/180)} y1={30+20*Math.sin(d*Math.PI/180)}
          x2={200+28*Math.cos(d*Math.PI/180)} y2={30+28*Math.sin(d*Math.PI/180)}
          stroke="#FFE082" strokeWidth="2" strokeLinecap="round" opacity="0.45"/>
      ))}
      <ellipse cx="120" cy="168" rx="55" ry="5" fill="#000" opacity="0.04"/>
      <rect x="68" y="88" width="104" height="72" rx="3" fill="#FFF3E0" stroke="#D7CCC8" strokeWidth="1.5"/>
      <polygon points="120,38 56,90 184,90" fill="#FFAB91" stroke="#BF360C" strokeWidth="1" opacity="0.85"/>
      <polygon points="120,38 56,90 184,90" fill="#FFCCBC" opacity="0.3"/>
      <line x1="120" y1="38" x2="120" y2="90" stroke="#E64A19" strokeWidth="0.5" opacity="0.15"/>
      <rect x="150" y="50" width="14" height="25" rx="2" fill="#BCAAA4"/>
      <rect x="148" y="48" width="18" height="5" rx="2" fill="#A1887F"/>
      <circle cx="157" cy="42" r="4" fill="#BDBDBD" opacity="0.2"/>
      <circle cx="162" cy="36" r="5" fill="#BDBDBD" opacity="0.15"/>
      <rect x="102" y="118" width="36" height="42" rx="6" fill="#8D6E63"/>
      <rect x="104" y="120" width="32" height="38" rx="5" fill="#A1887F"/>
      <circle cx="130" cy="140" r="3" fill="#FFE082"/>
      <path d="M106,120 Q120,108 134,120" fill="none" stroke="#8D6E63" strokeWidth="1.5"/>
      <rect x="72" y="100" width="24" height="22" rx="3" fill="#BBDEFB" stroke="#90CAF9" strokeWidth="1.2"/>
      <line x1="84" y1="100" x2="84" y2="122" stroke="#90CAF9" strokeWidth="0.8"/>
      <line x1="72" y1="111" x2="96" y2="111" stroke="#90CAF9" strokeWidth="0.8"/>
      <rect x="144" y="100" width="24" height="22" rx="3" fill="#BBDEFB" stroke="#90CAF9" strokeWidth="1.2"/>
      <line x1="156" y1="100" x2="156" y2="122" stroke="#90CAF9" strokeWidth="0.8"/>
      <line x1="144" y1="111" x2="168" y2="111" stroke="#90CAF9" strokeWidth="0.8"/>
      <rect x="74" y="102" width="9" height="8" rx="1" fill="#FFF9C4" opacity="0.3"/>
      <rect x="146" y="102" width="9" height="8" rx="1" fill="#FFF9C4" opacity="0.3"/>
      <GrassGround y={168}/>
      <Flower x="45" y="163" color="#FFB0C8" size="0.75"/>
      <Flower x="195" y="164" color="#81C784" size="0.7"/>
      <Flower x="58" y="166" color="#FFE082" size="0.55"/>
      <Flower x="182" y="167" color="#94C5EC" size="0.5"/>
      <CuteKid x="38" y="112" hairStyle="bob" hairColor="#5D4037" skinColor="#FFCCAA" shirtColor="#FF8FAB" skirtColor="#FFE0B2" expression="happy" scale="0.5" armLeft="wave"/>
      <CuteKid x="202" y="112" hairStyle="short" hairColor="#8D6E63" skinColor="#FFD4B8" shirtColor="#81C784" pantsColor="#FFD580" expression="happy" scale="0.48" armRight="wave"/>
    </svg>
  )
}

export function IllustReward({ c1 = '#FFF0AA', c2 = '#FFD5E5' }) {
  return (
    <svg viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="240" height="200" rx="12" fill="#FFFDF5" opacity="0.5"/>
      <WatercolorBg colors={[c1, c2, '#E5F0FF']} opacity={0.15}/>
      <path d="M20,40 Q70,28 120,44 Q170,58 220,35" fill="none" stroke="#FF8FAB" strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
      <path d="M15,55 Q65,42 120,60 Q175,76 225,50" fill="none" stroke="#64B5F6" strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
      <path d="M18,70 Q68,58 120,75 Q172,90 222,66" fill="none" stroke="#81C784" strokeWidth="2" strokeLinecap="round" opacity="0.35"/>
      <g transform="translate(120, 95)">
        <path d="M-20,-35 L-24,2 Q-26,14 -10,20 L-10,32 L10,32 L10,20 Q26,14 24,2 L20,-35z" fill="#FFE082" stroke="#FFC107" strokeWidth="1.8"/>
        <path d="M-16,-30 L-18,0 Q-20,10 -8,16 L-8,28 L4,28 L4,16 Q16,10 18,0 L16,-30z" fill="#FFEE58" opacity="0.4"/>
        <path d="M-24,-24 Q-40,-22 -40,-6 Q-40,10 -24,6" fill="none" stroke="#FFC107" strokeWidth="3" strokeLinecap="round"/>
        <path d="M24,-24 Q40,-22 40,-6 Q40,10 24,6" fill="none" stroke="#FFC107" strokeWidth="3" strokeLinecap="round"/>
        <rect x="-14" y="32" width="28" height="7" rx="2.5" fill="#FFC107"/>
        <rect x="-19" y="39" width="38" height="6" rx="2.5" fill="#FFB300"/>
        <polygon points="0,-22 3,-14 11,-14 5,-9 7,-1 0,-6 -7,-1 -5,-9 -11,-14 -3,-14" fill="white" opacity="0.5"/>
        <text x="0" y="-2" fontSize="10" textAnchor="middle" fill="#F57F17" fontWeight="bold">1st</text>
      </g>
      {[[25,42],[210,38],[30,140],[215,135],[55,82],[190,85],[80,148],[160,150]].map(([x,y],i) => (
        <g key={i} transform={`translate(${x},${y}) rotate(${i*45})`} opacity="0.5">
          <rect x="-4" y="-2" width="8" height="4" rx="1" fill={['#FF8FAB','#64B5F6','#81C784','#FFE082','#CE93D8','#FFAB91','#4FC3F7','#AED581'][i]}/>
        </g>
      ))}
      <CuteKid x="52" y="142" hairStyle="pigtails" hairColor="#5D4037" skinColor="#FFCCAA" shirtColor="#FF8FAB" skirtColor="#FFE0B2" expression="excited" scale="0.52" armLeft="up" armRight="up"/>
      <CuteKid x="188" y="144" hairStyle="short" hairColor="#8D6E63" skinColor="#FFD4B8" shirtColor="#64B5F6" pantsColor="#CE93D8" expression="excited" scale="0.5" armLeft="up" armRight="up"/>
    </svg>
  )
}

export function IllustRainbow({ c1 = '#FFE5E5' }) {
  return (
    <svg viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="240" height="200" rx="12" fill="#F5F5FF" opacity="0.4"/>
      {[
        { r: 80, color: '#FF6B6B' },
        { r: 70, color: '#FFBA6A' },
        { r: 60, color: '#FFE066' },
        { r: 50, color: '#81C784' },
        { r: 40, color: '#64B5F6' },
        { r: 30, color: '#B39DDB' },
      ].map(({ r, color }, i) => (
        <path key={i} d={`M${120 - r},145 A${r},${r} 0 0,1 ${120 + r},145`} fill="none" stroke={color} strokeWidth="7" opacity="0.4" strokeLinecap="round"/>
      ))}
      <SoftCloud x="22" y="122" scale="1" opacity="0.7"/>
      <SoftCloud x="210" y="118" scale="0.95" opacity="0.65"/>
      <circle cx="120" cy="40" r="18" fill="#FFE082" opacity="0.8"/>
      <circle cx="120" cy="40" r="26" fill="#FFE082" opacity="0.1"/>
      <Sparkle x="50" y="50" size="0.7" color="#FFE082"/>
      <Sparkle x="190" y="45" size="0.6" color="#FFB0C8"/>
    </svg>
  )
}

export function IllustHonest({ c1 = '#E8F4FF', c2 = '#FFF0F5' }) {
  return (
    <svg viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="240" height="200" rx="12" fill="#F5F9FF" opacity="0.5"/>
      <WatercolorBg colors={[c1, c2, '#FFF5E5']} opacity={0.13}/>
      <g transform="translate(120, 52)">
        <path d="M0,-10 C0,-18 -14,-24 -24,-14 C-30,-6 -16,10 0,24 C16,10 30,-6 24,-14 C14,-24 0,-18 0,-10z" fill="#FF8FAB" opacity="0.75"/>
        <path d="M0,-8 C0,-13 -8,-16 -14,-10 C-18,-5 -10,6 0,15 C10,6 18,-5 14,-10 C8,-16 0,-13 0,-8z" fill="#FFB0C8" opacity="0.4"/>
        <ellipse cx="-10" cy="-10" rx="5" ry="4" fill="white" opacity="0.15"/>
      </g>
      {[-25,25,-35,35,-15,15].map((ox, i) => (
        <Sparkle key={i} x={120 + ox} y={52 + 15 + Math.abs(ox) * 0.3} size="0.5" color="#FFE082"/>
      ))}
      <CuteKid x="62" y="118" hairStyle="bob" hairColor="#5D4037" skinColor="#FFCCAA" shirtColor="#FF8FAB" skirtColor="#FFE0B2" expression="happy" scale="0.68" armLeft="down" armRight="side"/>
      <CuteKid x="178" y="118" hairStyle="long" hairColor="#8D6E63" skinColor="#FFD4B8" shirtColor="#64B5F6" pantsColor="#B39DDB" expression="happy" scale="0.68" armLeft="side" armRight="down"/>
      <path d="M78,132 Q120,120 162,132" fill="none" stroke="#FFCCAA" strokeWidth="4.5" strokeLinecap="round"/>
      <GrassGround y={180}/>
      <Flower x="40" y="175" color="#FFB0C8" size="0.65"/>
      <Flower x="200" y="176" color="#C5A3FF" size="0.6"/>
    </svg>
  )
}

export function IllustSteps({ c1 = '#E8F4FF', c2 = '#FFF9C4', topic = '' }) {
  const isBed = topic && (topic.includes('叠被子') || topic.includes('被子'))
  if (isBed) {
    return (
      <svg viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <rect width="240" height="200" rx="12" fill="#FFFEF5" opacity="0.5"/>
        <WatercolorBg colors={['#FFF9C4', '#E8F4FF', '#FFE5E5']} opacity={0.12}/>
        <text x="120" y="18" fontSize="9" textAnchor="middle" fill="#999" fontWeight="500">叠被子四步法</text>
        {[
          { step: 1, label: '铺平被子', color: '#FFD580', accent: '#FFE082', cx: 65, cy: 72 },
          { step: 2, label: '纵向对折', color: '#FF8FAB', accent: '#FFB0C8', cx: 175, cy: 72 },
          { step: 3, label: '横向对折', color: '#64B5F6', accent: '#90CAF9', cx: 65, cy: 148 },
          { step: 4, label: '整理完成', color: '#81C784', accent: '#A5D6A7', cx: 175, cy: 148 },
        ].map(({ step, label, color, accent, cx, cy }) => (
          <g key={step} transform={`translate(${cx}, ${cy})`}>
            <rect x="-52" y="-42" width="104" height="78" rx="12" fill="white" stroke={color} strokeWidth="1.8" opacity="0.97"/>
            <rect x="-52" y="-42" width="104" height="18" rx="12" fill={color} opacity="0.1"/>
            <circle cx="-34" cy="-33" r="12" fill={color}/>
            <circle cx="-34" cy="-33" r="12" fill={color} opacity="0.8"/>
            <text x="-34" y="-29" fontSize="12" textAnchor="middle" fill="white" fontWeight="bold">{step}</text>
            <text x="8" y="-28" fontSize="11" textAnchor="middle" fill="#555" fontWeight="500">{label}</text>
            {step === 1 && (
              <g transform="translate(0, 12)">
                <rect x="-36" y="-6" width="72" height="22" rx="4" fill="#D7CCC8" stroke="#BCAAA4" strokeWidth="1.2"/>
                <rect x="-36" y="-12" width="72" height="8" rx="3" fill="#BCAAA4"/>
                <rect x="-32" y="-3" width="64" height="16" rx="3" fill={accent} stroke={color} strokeWidth="1"/>
                <line x1="0" y1="-3" x2="0" y2="13" stroke={color} strokeWidth="0.5" opacity="0.3"/>
                <line x1="-16" y1="-3" x2="-16" y2="13" stroke={color} strokeWidth="0.5" opacity="0.2"/>
                <line x1="16" y1="-3" x2="16" y2="13" stroke={color} strokeWidth="0.5" opacity="0.2"/>
                <rect x="-28" y="-8" width="20" height="6" rx="3" fill="white" stroke="#E0E0E0" strokeWidth="0.8"/>
              </g>
            )}
            {step === 2 && (
              <g transform="translate(0, 12)">
                <rect x="-36" y="-6" width="72" height="22" rx="4" fill="#D7CCC8" stroke="#BCAAA4" strokeWidth="1.2"/>
                <rect x="-36" y="-12" width="72" height="8" rx="3" fill="#BCAAA4"/>
                <rect x="-4" y="-3" width="32" height="16" rx="3" fill={accent} stroke={color} strokeWidth="1"/>
                <line x1="0" y1="-8" x2="0" y2="18" stroke="#999" strokeWidth="1.2" strokeDasharray="3,2"/>
                <path d="M-20,5 L-8,5" fill="none" stroke={color} strokeWidth="1.5"/>
                <polygon points="-8,2 -8,8 -3,5" fill={color} opacity="0.6"/>
              </g>
            )}
            {step === 3 && (
              <g transform="translate(0, 12)">
                <rect x="-36" y="-6" width="72" height="22" rx="4" fill="#D7CCC8" stroke="#BCAAA4" strokeWidth="1.2"/>
                <rect x="-4" y="0" width="32" height="10" rx="3" fill={accent} stroke={color} strokeWidth="1"/>
                <line x1="-8" y1="0" x2="28" y2="0" stroke="#999" strokeWidth="1.2" strokeDasharray="3,2"/>
                <path d="M12,-8 L12,0" fill="none" stroke={color} strokeWidth="1.5"/>
                <polygon points="9,-2 15,-2 12,2" fill={color} opacity="0.6"/>
              </g>
            )}
            {step === 4 && (
              <g transform="translate(0, 10)">
                <rect x="-20" y="2" width="40" height="14" rx="3" fill={accent} stroke={color} strokeWidth="1.5"/>
                <rect x="-18" y="0" width="36" height="3" rx="1.5" fill={color} opacity="0.3"/>
                <circle cx="0" cy="-8" r="12" fill="#E8F5E9" stroke={color} strokeWidth="1.5"/>
                <path d="M-6,-8 L-2,-3 L7,-14" fill="none" stroke="#4CAF50" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
                <Sparkle x="-30" y="-5" size="0.5" color={color}/>
                <Sparkle x="30" y="-3" size="0.45" color={color}/>
              </g>
            )}
          </g>
        ))}
        <path d="M120,72 L130,72" stroke="#CCC" strokeWidth="1.5"/>
        <path d="M65,118 L65,128" stroke="#CCC" strokeWidth="1.5"/>
        <path d="M130,148 L120,148" stroke="#CCC" strokeWidth="1.5"/>
      </svg>
    )
  }

  const steps = ['准备好', '按步做', '检查看', '整理好']
  const colors = ['#FFD580', '#FF8FAB', '#64B5F6', '#81C784']
  const accents = ['#FFE082', '#FFB0C8', '#90CAF9', '#A5D6A7']
  return (
    <svg viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="240" height="200" rx="12" fill="#F5FBFF" opacity="0.5"/>
      <WatercolorBg colors={[c1, '#E5FFE5', '#E5E5FF']} opacity={0.12}/>
      {steps.map((s, i) => {
        const col = i % 2, row = Math.floor(i / 2)
        const cx = 68 + col * 112, cy = 72 + row * 80
        return (
          <g key={i} transform={`translate(${cx}, ${cy})`}>
            <rect x="-50" y="-38" width="100" height="68" rx="12" fill="white" stroke={colors[i]} strokeWidth="1.8" opacity="0.97"/>
            <rect x="-50" y="-38" width="100" height="16" rx="12" fill={colors[i]} opacity="0.1"/>
            <circle cx="-32" cy="-30" r="11" fill={colors[i]}/>
            <text x="-32" y="-26" fontSize="11" textAnchor="middle" fill="white" fontWeight="bold">{i + 1}</text>
            <text x="6" y="-26" fontSize="10" textAnchor="middle" fill="#555" fontWeight="500">{s}</text>
            <circle cx="0" cy="6" r="16" fill={accents[i]} opacity="0.25"/>
            <circle cx="0" cy="6" r="10" fill={colors[i]} opacity="0.15"/>
            <text x="0" y="10" fontSize="14" textAnchor="middle" fill={colors[i]} opacity="0.6">✓</text>
          </g>
        )
      })}
    </svg>
  )
}

export { CuteKid as KidCharacter }