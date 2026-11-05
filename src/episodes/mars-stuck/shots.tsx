import React from 'react';
import {
  Hero, Pose, basePose, poseAt, faceAt, kf, clamp, easeOut, easeIn, rnd, camT, LOOKS, LEG_LEN, HEAD, joints, toWorld,
  MarsBase, MARS, benchTop, SolChip, Tabletop, LightVeil, Glow, Glow as GlowC,
  Schematic, SCH, Arrow, SchLabel, CountUp, DrawOn, Foreground, Gauge, TitleCard, Dial, FocusRings, ShotProps,
} from '../../engine';

// "What if you were stuck on Mars?" Thirteen shots: the habitat (marsbase.tsx) carries the demos, the console screen
// carries the dust sweep, the schematic carries the 26-month window. Every shot is a pure function of its clock t.

const PIP = LOOKS.pipHood;
const LIVE = '#8FD9FF';
const RUST = '#C96A4A';

// ---------- S1 medium: Pip at the bench, shows the ice chunk, knocks it down on "Dig" ----------
export const S1: React.FC<ShotProps> = ({ t, len }) => {
  const kp = MARS.P(0.34, 1, 0.3);
  const pose = poseAt(t, [
    { f: 0, p: { x: kp.x, y: kp.y - LEG_LEN * 0.3, scale: 1.05, yaw: 0.35, look: 0.6, armR: { a: 84, b: 52 }, armL: { a: 12, b: -8 }, headTilt: 4 } },
    { f: 8, p: { armR: { a: 94, b: 54 }, look: 0.9 } },
    { f: 26, p: {}, ease: easeOut },
    { f: 34, p: { armR: { a: 118, b: 6 }, squash: 0.03, headTilt: -2 }, ease: easeOut }, // the knock
    { f: 38, p: { armR: { a: 124, b: 14 }, squash: -0.04 }, ease: easeOut }, // crack
    { f: 46, p: { armR: { a: 90, b: 44 }, squash: 0, look: 0.7 } },
    { f: 70, p: { look: 0.2, headTilt: 4 }, ease: easeOut },
  ]);
  const face = faceAt(t, [[0, 'neutral'], [30, 'smug'], [48, 'happy'], [74, 'worried']]);
  const j = joints(pose);
  const hand = toWorld(pose, j.armR.end);  const ice = () => (
    <g>
      <path d={`M 0 -18 L 26 -6 L 30 14 L 10 30 L -16 24 L -26 2 Z`} fill="#BDE3F2" stroke="#5E86A8" strokeWidth={6} strokeLinejoin="round" />
      <path d="M -8 -12 L 12 8 M 2 -14 L -14 10" stroke="#9CC6DE" strokeWidth={4} fill="none" />
      {t > 37 ? <path d="M -2 -20 L 4 -4 L -2 6 L 6 18" stroke="#7FAECC" strokeWidth={5} fill="none" /> : null}
      {t > 37 ? <path d="M 18 -12 L 8 2" stroke="#7FAECC" strokeWidth={4} fill="none" /> : null}
    </g>
  );
  return (
    <g transform={camT(kf(t, [[0, 880], [len, 900]]), 620, kf(t, [[0, 1.6], [len, 1.66]]))}>
      <MarsBase t={t + 40} id="m1" />
      <Hero look={PIP} pose={{ ...pose, ...face }} rimId="rimR" shadow={0.55} />
      {(() => {
        // the ice in his mitten, above the bench; a shovel leaning on the bench end
        const sp = benchTop(0.2, 0.4);
        return (
          <g>
            <g transform={`translate(${hand.x + 26} ${hand.y - 46}) rotate(${kf(t, [[0, -8], [34, 30], [38, -12], [46, -4]])})`} filter="url(#rimR)">
              {ice()}
            </g>
            <ellipse cx={sp.x} cy={sp.y + 2} rx={26} ry={6} fill="#000" opacity={0.4} />
            <path d={`M ${sp.x - 20} ${sp.y} L ${sp.x - 34} ${sp.y - 96} L ${sp.x - 26} ${sp.y - 98} L ${sp.x - 10} ${sp.y - 4} Z`} fill="#8A9298" />
            <path d={`M ${sp.x - 38} ${sp.y - 110} L ${sp.x - 12} ${sp.y - 118} L ${sp.x - 22} ${sp.y - 96} Z`} fill="#6A7278" />
          </g>
        );
      })()}
      <SolChip x={170} y={96} sol={34} size={16} />
      <Foreground blur={10}>
        <path d="M 1540 1080 Q 1400 860 1470 640 Q 1560 860 1620 1080 Z" fill="#0B0812" />
      </Foreground>
    </g>
  );
};

// ---------- S2 macro insert, the bench top: the heat lamp melts the chunk into the flask ----------
export const S2: React.FC<ShotProps> = ({ t, len }) => {
  const melt = clamp(t / 50);
  const level = 40 + 150 * easeOut(melt);
  const drop = (d: number) => {
    const p = clamp((t - d) / 16);
    return p <= 0 || p >= 1 ? null : { y: 320 + 300 * p, x: 830 - 8 * p };
  };
  const d1 = drop(9);
  const d2 = drop(42);
  const poolW = 130 + 70 * melt;
  return (
    <g transform={camT(960, kf(t, [[0, 520], [len, 535]]), kf(t, [[0, 1.02], [len, 1.08]]))}>
      <Tabletop edge={820} wood="#565060" grain="#4A4454" lip="#3A3442" kind="stone" floor="#1A1620" floorLines="#120F18" />
      {/* the heat lamp above left, its warm cone, its pool on the tray */}
      <rect x={520} y={-70} width={120} height={70} rx={10} fill="#3A3644" />
      <ellipse cx={580} cy={2} rx={50} ry={14} fill="#FFE2B0" />
      <path d={`M 500 60 Q 580 120 660 60 L 900 980 L 360 980 Z`} fill="url(#g3cone)" opacity={0.4} style={{ mixBlendMode: 'screen' }} />
      <Glow x={640} y={240} r={480} o={0.45} />
      {/* the tray with the shrinking chunk and the growing melt pool */}
      <ellipse cx={740} cy={860} rx={420} ry={130} fill="url(#g3fadeDown)" opacity={0.7} />
      <path d={`M 480 760 L 1000 760 Q 1030 776 1000 790 L 480 790 Q 450 776 480 760 Z`} fill="#6A6478" />
      <path d={`M 468 770 L 1012 770 L 1002 786 Q 990 798 972 798 L 508 798 Q 490 798 478 786 Z`} fill="#565060" />
      <path d="M 470 772 L 1010 772" stroke="#7E788A" strokeWidth={8} opacity={0.7} />
      {/* melt pool spreading on the tray */}
      <path d={`M ${740 - poolW} 794 Q 740 776 ${740 + poolW} 794 Q 740 810 ${740 - poolW} 794 Z`} fill="#9ECFE8" />
      <g transform={`translate(740 ${776 - 10 * melt}) scale(${1 - 0.5 * melt}, ${1 - 0.5 * melt})`}>
        <path d={`M 0 -30 L 44 -10 L 50 24 L 17 50 L -27 40 L -44 3 Z`} fill="#BDE3F2" stroke="#5E86A8" strokeWidth={9} strokeLinejoin="round" />
        <path d="M -14 -20 L 20 13 M 3 -23 L -24 17" stroke="#9CC6DE" strokeWidth={6} fill="none" />
      </g>
      {/* drips falling from the tray's edge into the flask */}
      {d1 ? <ellipse cx={d1.x} cy={d1.y} rx={10} ry={15} fill="#D6EEFA" /> : null}
      {d2 ? <ellipse cx={d2.x} cy={d2.y} rx={10} ry={15} fill="#D6EEFA" /> : null}
      {/* the flask big at right, the level rising; a spanner and a rag as dressing */}
      <ellipse cx={1240} cy={910} rx={110} ry={26} fill="#000" opacity={0.4} />
      <path d={`M 1136 430 Q 1128 898 1240 906 Q 1352 898 1344 430 Z`} fill="#DDEEF8" opacity={0.94} />
      <rect x={1284} y={428} width={80} height={22} rx={5} fill="#4A5A64" />
      <path d={`M 1176 ${886 - level} Q 1186 ${886 - level} 1200 ${886 - level} L 1200 ${884 - level} Q 1240 ${886 - level - 20} 1280 ${884 - level} Z`} fill="#9ECFE8" />
      <rect x={1120} y={882 - level} width={240} height={level + 20} fill="#8FC4E4" opacity={0.55} />
      <path d="M 1120 882 L 1360 882 L 1360 896 L 1120 896 Z" fill="#5E86A8" opacity={0.4} />
      <ellipse cx={760} cy={940} rx={90} ry={18} fill="#000" opacity={0.3} />
      <rect x={640} y={916} width={240} height={16} rx={8} fill="#C8A050" transform="rotate(-14 760 924)" />
    </g>
  );
};

// ---------- S3 medium: the oxygen machine; the row goes green and the needle swings ----------
export const S3: React.FC<ShotProps> = ({ t, len }) => {
  const kp = MARS.P(0.62, 1, 0.3);
  const pose = poseAt(t, [
    { f: 0, p: { x: kp.x, y: kp.y - LEG_LEN * 0.3, scale: 1.05, yaw: -0.5, look: -0.4, armL: { a: 16, b: -8 }, armR: { a: 20, b: 6 } } },
    { f: 16, p: { armL: { a: 60, b: 24 } }, ease: easeOut },
    { f: 34, p: { headTilt: 6 }, ease: easeOut },
    { f: 44, p: { headTilt: -2 } },
  ]);
  const face = faceAt(t, [[0, 'neutral'], [18, 'worried'], [40, 'happy']]);
  const om = MARS.P(0.95, 1, 0.06);
  const gy = om.y - 46;
  const gl = MARS.P(0.955, 0.34, 0.06);
  const sweep = kf(t, [[0, -70], [26, -150], [34, -108]]);
  return (
    <g transform={camT(kf(t, [[0, 1150], [len, 1120]]), 560, kf(t, [[0, 1.75], [len, 1.95]]))}>
      <MarsBase t={t + 220} id="m3" />
      {/* the oxygen machine close up: gauge, three status lamps, the tank */}
      <g>
        <rect x={om.x - 60} y={om.y - 210} width={130} height={210} rx={10} fill="#6A7480" />
        <rect x={om.x - 50} y={om.y - 200} width={110} height={100} rx={6} fill="#242836" />
        <circle cx={om.x + 5} cy={gy} r={34} fill="#20242E" stroke="#8A9298" strokeWidth={5} />
        <path d={`M ${om.x + 5} ${gy} L ${om.x + 5 + 26 * Math.cos((sweep * Math.PI) / 180)} ${gy + 26 * Math.sin((sweep * Math.PI) / 180)}`} stroke="#FFD7A0" strokeWidth={5} strokeLinecap="round" />
        {[0, 1, 2, 3, 4].map((i) => {
          const on = t > 8 + i * 6;
          return <circle key={`g${i}`} cx={gl.x - 34 + i * 17} cy={gl.y} r={6} fill={on ? '#7FBF7A' : '#3A3E4C'} style={on ? { filter: 'drop-shadow(0 0 6px #7FBF7A)' } : undefined} />;
        })}
        <rect x={om.x - 30} y={om.y - 262} width={26} height={54} rx={8} fill="#7A9098" />
        <rect x={om.x + 4} y={om.y - 262} width={26} height={54} rx={8} fill="#7A9098" />
      </g>
      <Hero look={PIP} pose={{ ...pose, ...face, expr: t > 40 ? 'happy' : 'neutral' }} rimId="rimL" shadow={0.55} />
      <Glow x={om.x} y={gy} r={260} kind="cool" o={0.2} />
      <Foreground blur={6}>
        <path d="M 480 1080 Q 520 880 470 720 Q 430 900 380 1080 Z" fill="#0C0A12" />
      </Foreground>
    </g>
  );
};

// ---------- S4 close-up: the first long breath, the blue console light on his hood ----------
export const S4: React.FC<ShotProps> = ({ t, len }) => {
  const sc = 3.8 * (1 + 0.04 * clamp(t / len));
  const breathe = Math.sin(clamp(t / 20) * Math.PI);
  const head = { x: 960, y: 640 };
  const pose: Pose = { ...basePose, x: head.x, y: head.y - HEAD.y * sc, scale: sc, yaw: 0.1, look: -0.4, armL: { a: 14, b: -6 }, armR: { a: 14, b: -6 }, squash: 0.02 * breathe, ...faceAt(t, [[0, 'worried'], [8, 'cool'], [22, 'happy']]) };
  return (
    <g>
      <g filter="url(#blur16)">
        <g transform="translate(300 -240) scale(1.7)">
          <MarsBase t={t + 266} id="m4" storm={0} dark={0} veil={0.4} />
        </g>
      </g>
      <rect x={0} y={0} width={1920} height={1080} fill="#08101E" opacity={0.2} />
      <Hero look={PIP} pose={pose} rimId="rimBlueL" shadow={0} />
      <GlowC x={1580} y={620} r={420} kind="cool" o={0.25} />
    </g>
  );
};

// ---------- S5 wide: the storm lands; the sun drowns behind dust ----------
export const S5: React.FC<ShotProps> = ({ t, len }) => {
  const kp = MARS.P(0.4, 1, 0.24);
  const pose = poseAt(t, [
    { f: 0, p: { x: kp.x, y: kp.y - LEG_LEN * 0.3, scale: 0.95, yaw: 0.15, look: -0.2, armL: { a: 14, b: -6 }, armR: { a: 30, b: 10 } } },
    { f: 4, p: { look: -1, headTilt: -6, armR: { a: 10, b: -10 } }, ease: easeOut },
  ]);
  return (
    <g transform={camT(kf(t, [[0, 980], [len, 950]]), kf(t, [[0, 520], [len, 545]]), kf(t, [[0, 0.98], [len, 1.02]]))}>
      <MarsBase t={t + 300} id="m5" storm={0.65 + 0.35 * clamp(t / 10)} dark={0} veil={0.34} />
      <Hero look={PIP} pose={{ ...pose, ...faceAt(t, [[0, 'neutral'], [4, 'shock']]) }} rimId="rimR" shadow={0.55} />
      <Dial x={1740} y={120} p={Math.max(0.03, 1 - easeIn(clamp(t / len)))} readout={`${Math.max(0, Math.round(100 - 100 * easeIn(clamp(t / len))))}%`} size={34} />
    </g>
  );
};

// ---------- S6 insert: the console screen — the array feed, crusted red, the output bar flat ----------
export const S6: React.FC<ShotProps> = ({ t, len }) => {
  const flick = rnd(Math.floor(t / 2), 6) > 0.12;
  const p = 0.07 * (1 + 0.06 * Math.sin(t / 4));
  return (
    <g transform={camT(kf(t, [[0, 960], [len, 950]]), 540, kf(t, [[0, 0.86], [len, 0.92]]))}>
      <rect x={-300} y={-300} width={2520} height={1680} fill="#0A0D16" />
      {/* the screen bezel on the wall of the room, faint behind the feed */}
      <g filter="url(#blur16)">
        <g transform="translate(-200 -420) scale(1.5)">
          <MarsBase t={t + 360} id="m6" storm={0.8} dark={0.2} veil={0.4} />
        </g>
      </g>
      <rect x={0} y={0} width={1920} height={1080} fill="#07040C" opacity={0.4} />
      <rect x={210} y={90} width={1500} height={900} rx={26} fill="#10121C" />
      <rect x={252} y={128} width={1416} height={790} fill={flick ? '#0D1524' : '#0B1220'} />
      {flick ? (
        <g>
          {/* the feed: the array, blue under a crusted layer of rust dust; the sun a dim disc */}
          {[0, 1, 2].map((row) =>
            [0, 1, 2, 3, 4, 5].map((col) => {
              const px2 = 320 + col * 225;
              const py2 = 300 + row * 230;
              const dust = 0.45 + 0.3 * rnd(9, row * 6 + col);
              return (
                <g key={`p${row}-${col}`} transform={`translate(${px2} ${py2}) rotate(-5)`}>
                  <ellipse cx={4} cy={110} rx={84} ry={11} fill="#000" opacity={0.4} />
                  <rect x={-78} y={0} width={156} height={22} fill="#2E2836" />
                  <rect x={-70} y={-78} width={140} height={78} fill="#23305A" />
                  {[0, 1, 2, 3].map((k) => (
                    <rect key={`l${k}`} x={-64 + k * 34} y={-72} width={28} height={66} fill="#37477E" />
                  ))}
                  <rect x={-70} y={-78} width={140} height={78} fill="#B4523A" opacity={dust} />
                  <rect x={-70} y={-78} width={64} height={78} fill="#C96A4A" opacity={dust * 0.5} />
                  <path d="M -70 -78 L 70 -78" stroke="#5E3630" strokeWidth={5} opacity={dust} />
                </g>
              );
            }),
          )}
          <circle cx={1500} cy={240} r={62} fill="#8A4230" opacity={0.9} />
          <circle cx={1500} cy={240} r={26} fill="#B4644A" opacity={0.9} />
          {Array.from({ length: 10 }).map((_, i) => {
            const dx = 252 + ((rnd(3, i) * 1416 + t * 22 * (0.6 + rnd(4, i))) % 1416);
            return <rect key={`d${i}`} x={dx} y={200 + rnd(5, i) * 620} width={30 + rnd(6, i) * 60} height={4 + rnd(7, i) * 4} fill="#B4523A" opacity={0.5} />;
          })}
          <SchLabel x={470} y={884} t={t - 10} text="ARRAY 07 · FEED" size={30} color="#52617E" />
          <Gauge x={1430} y={840} w={430} p={p} label="OUTPUT" />
        </g>
      ) : null}
    </g>
  );
};

// ---------- S7 macro insert: the wiper sweeps the feed; the cleared band glints; the bar jumps ----------
export const S7: React.FC<ShotProps> = ({ t }) => {
  const sw = easeIn(clamp(t / 16));
  const px = -300 + sw * 2500;
  return (
    <g transform={`translate(960 540) scale(${kf(t, [[0, 1.35], [25, 1.5]])}) translate(-960 -540)`}>
      <rect x={-300} y={-300} width={2520} height={1680} fill="#0B1220" />
      {Array.from({ length: 10 }).map((_, i) => {
        const col = i % 5;
        const row = Math.floor(i / 5);
        const cx2 = 160 + col * 380;
        const py2 = 260 + row * 300;
        const clean = cx2 < px;
        return (
          <g key={`p${i}`} transform={`translate(${cx2} ${py2}) rotate(-6)`}>
            <rect x={-140} y={0} width={280} height={26} fill="#2E2836" transform={`skewX(-8)`} />
            <rect x={-130} y={-110} width={260} height={110} fill="#23305A" />
            {Array.from({ length: 5 }).map((_, k) => (
              <rect key={`l${k}`} x={-124 + k * 52} y={-104} width={46} height={98} fill="#37477E" />
            ))}
            {clean ? <path d="M -130 -110 L 130 -110" stroke="#FFE8C4" strokeWidth={6} opacity={0.9} /> : <rect x={-130} y={-110} width={260} height={110} fill="#B4523A" opacity={0.62} />}
          </g>
        );
      })}
      {/* the wiper: a dark arm with a lit rubber edge riding across, dust boiling off it */}
      {px < 2400 ? (
        <g>
          {Array.from({ length: 7 }).map((_, i) => {
            const dy = 200 + rnd(12, i) * 640;
            const dx = px - 30 - rnd(13, i) * 130 + Math.sin(t / 2 + i) * 8;
            return <rect key={`w${i}`} x={dx} y={dy} width={26 + rnd(14, i) * 44} height={5 + rnd(15, i) * 6} fill="#8A4A32" opacity={0.5} />;
          })}
          <path d={`M ${px + 8} ${170} L ${px + 8 - 60} ${1000}`} stroke="#12161E" strokeWidth={40} transform={`skewX(-14)`} />
          <rect x={px} y={140} width={90} height={880} fill="#232833" transform={`skewX(-14)`} />
          <rect x={px + 74} y={140} width={18} height={880} fill="#E8E4DC" transform={`skewX(-14)`} />
          <path d="M -300 130 L 2200 104" stroke="#3A3E4C" strokeWidth={6} opacity={0.8} />
          <circle cx={px + 40} cy={130} r={26} fill="#2A2E3A" stroke="#6A7278" strokeWidth={6} />
        </g>
      ) : null}
      <Gauge x={1440} y={880} w={420} p={0.07 + 0.7 * easeOut(clamp((t - 14) / 8))} label="OUTPUT" />
      <rect x={-300} y={-300} width={2520} height={1680} fill="#07040C" opacity={0.16} />
    </g>
  );
};

// ---------- S8 medium, low angle: the breaker, the lamps come back ----------
export const S8: React.FC<ShotProps> = ({ t, len }) => {
  const kp = MARS.P(0.72, 1, 0.22);
  const bx = MARS.P(0.8, 0.34, 0.02);
  const pose = poseAt(t, [
    { f: 0, p: { x: kp.x, y: kp.y - LEG_LEN * 0.22, scale: 1.02, yaw: 0.55, look: 0.4, armR: { a: 60, b: -20, }, armL: { a: 16, b: -6 } } },
    { f: 8, p: { armR: { a: 96, b: -30 }, squash: 0.04 }, ease: easeOut },
    { f: 12, p: { armR: { a: 138, b: 30 }, squash: -0.05 }, ease: easeOut }, // the throw
    { f: 16, p: { armR: { a: 132, b: 40 }, squash: 0 } },
    { f: 24, p: { look: -0.6, armR: { a: 70, b: 20 }, headTilt: -4 }, ease: easeOut },
  ]);
  const face = faceAt(t, [[0, 'worried'], [13, 'shock'], [22, 'happy']]);
  const dark = t < 12 ? 0.6 : 0;
  return (
    <g transform={camT(bx.x + 140, 620, kf(t, [[0, 1.35], [len, 1.42]]))}>
      <MarsBase t={t + 400} id="m8" storm={0.72} dark={dark} veil={0.4} />
      <Hero look={PIP} pose={{ ...pose, ...face }} rimId={t > 12 ? 'rimR' : 'rimBlueL'} shadow={0.5} />
      {/* the breaker with its big lever */}
      <g>
        <rect x={bx.x - 40} y={bx.y - 120} width={80} height={140} rx={8} fill="#2E3240" stroke="#45424E" strokeWidth={5} />
        <rect x={bx.x - 12} y={bx.y - 96 + 46 * (dark ? 0 : 1)} width={24} height={64} rx={8} fill={dark ? '#C2553E' : '#7FBF7A'} />
        <circle cx={bx.x} cy={bx.y - 76 + 46 * (dark ? 0 : 1)} r={9} fill="#151821" />
      </g>
      <Foreground blur={10}>
        <path d="M 300 1080 Q 380 900 320 720 Q 260 900 200 1080 Z" fill="#0B0812" />
      </Foreground>
    </g>
  );
};

// ---------- S9 title, wide: the habitat at dusk, the title over it ----------
export const S9: React.FC<ShotProps> = ({ t, len }) => {
  const kp = MARS.P(0.52, 1, 0.2);
  const pose = poseAt(t, [
    { f: 0, p: { x: kp.x, y: kp.y - LEG_LEN * 0.34, scale: 0.9, yaw: 0, look: 0, armL: { a: 20, b: 8 }, armR: { a: 20, b: 8 } } },
    { f: 30, p: { armL: { a: 130, b: 20 }, armR: { a: 130, b: 20 }, look: -0.4 }, ease: easeOut },
  ]);
  return (
    <g transform={camT(960, kf(t, [[0, 530], [len, 560]]), kf(t, [[0, 0.95], [len, 1.04]]))}>
      <MarsBase t={t} id="m9" storm={0.5 + 0.15 * clamp(t / 40)} dark={0.15} veil={0.3} />
      <Hero look={PIP} pose={{ ...pose, ...faceAt(t, [[0, 'happy'], [28, 'worried']]) }} rimId="rimR" shadow={0.5} />
      <TitleCard t={t} lines={['WHAT IF YOU WERE', 'STUCK ON MARS?']} accent="MARS" accentT={40} size={96} y={150} />
    </g>
  );
};

// ---------- S10 schematic: two orbits, the planets, the transfer arc drawing on ----------
const EARTH_C = '#7FB2E8';
const MARS_C = '#E8863C';
export const S10: React.FC<ShotProps> = ({ t, len }) => {
  const aE = 0.02 + 0.003 * t;
  const aM = 1.21 * Math.PI - 0.0026 * t;
  const c = { x: 960, y: 520 };
  const re = 560, rm = 760;
  const earth = { x: c.x + re * Math.cos(aE), y: c.y + 0.42 * re * Math.sin(aE) };
  const mars = { x: c.x + rm * Math.cos(aM), y: c.y + 0.42 * rm * Math.sin(aM) };
  return (
    <g transform={`translate(960 540) scale(${kf(t, [[0, 1], [len, 1.04]])}) translate(-960 -540)`}>
      <Schematic t={t} id="sch10" />
      {(() => {
        const sun = c;
        return (
          <g>
            <circle cx={sun.x} cy={sun.y} r={34} fill="#FFD98F" style={{ filter: `drop-shadow(0 0 26px ${SCH.glow})` }} />
            <DrawOn d={`M ${sun.x} ${sun.y} m ${-re} 0 a ${re} ${0.42 * re} 0 1 0 ${2 * re} 0 a ${re} ${0.42 * re} 0 1 0 ${-2 * re} 0`} t={t - 6} dur={18} color={SCH.dim} width={4} />
            <DrawOn d={`M ${sun.x} ${sun.y} m ${-rm} 0 a ${rm} ${0.42 * rm} 0 1 0 ${2 * rm} 0 a ${rm} ${0.42 * rm} 0 1 0 ${-2 * rm} 0`} t={t - 12} dur={18} color={SCH.dim} width={4} />
            <circle cx={earth.x} cy={earth.y} r={30} fill={EARTH_C} />
            <circle cx={mars.x} cy={mars.y} r={26} fill={MARS_C} />
            {mars.x < earth.x ? <Arrow x0={earth.x - 30} y0={earth.y - 30} x1={mars.x + 34} y1={mars.y + 20} t={t - 34} dur={12} bend={0.16} /> : null}
            <SchLabel x={earth.x} y={earth.y + 74} t={t - 16} text="EARTH" size={44} color={EARTH_C} />
            <SchLabel x={mars.x} y={mars.y - 48} t={t - 20} text="MARS" size={44} color={MARS_C} />
            <SchLabel x={960} y={180} t={t - 38} text="ONE WINDOW" size={62} color={SCH.live} />
          </g>
        );
      })()}
    </g>
  );
};

// ---------- S11 schematic: the count between two windows, 26 months ----------
export const S11: React.FC<ShotProps> = ({ t, len }) => {
  const v = 26 * easeIn(clamp((t - 10) / 30)) ** 0.7;
  return (
    <g>
      <Schematic t={t + 62} id="sch11" />
      <SchLabel x={960} y={230} t={t - 4} text="MARS MEETS EARTH AGAIN IN" size={44} color={SCH.dim} />
      <CountUp x={960} y={470} t={t - 8} to={26} dur={30} size={190} format={(p) => `${Math.round(p)}`} />
      <SchLabel x={960} y={570} t={t - 20} text="MONTHS" size={72} color={SCH.live} />
      <SchLabel x={960} y={700} t={t - 30} text="ONE LAP OF THE SUN BETWEEN THEM" size={34} color={SCH.dim} />
      <DrawOn d="M 560 760 L 1360 760" t={t - 34} dur={10} color={SCH.grid} width={2} />
      <Dial x={1560} y={880} p={v / 26} readout={`${Math.round(v)} / 26`} size={40} />
    </g>
  );
};

// ---------- S12 extreme close-up: "That's real." ----------
export const S12: React.FC<ShotProps> = ({ t, len }) => {
  const sc = 6.8 * (1 + 0.04 * clamp(t / len));
  const head = { x: 960, y: 720 };
  const red = 0.4 * clamp(t / len);
  const pose: Pose = { ...basePose, x: head.x, y: head.y - HEAD.y * sc, scale: sc, yaw: -0.12, look: -0.2, armL: { a: 14, b: -6 }, armR: { a: 14, b: -6 }, headTilt: -3, ...faceAt(t, [[0, 'worried'], [20, 'shock']]) };
  return (
    <g>
      <g filter="url(#blur16)">
        <g transform="translate(540 -420) scale(1.8)">
          <MarsBase t={t + 200} id="m12" storm={0.95} dark={0.55} veil={0.4} />
        </g>
      </g>
      <rect x={0} y={0} width={1920} height={1080} fill="#180404" opacity={0.2 + red * 0.2} />
      <Hero look={PIP} pose={pose} rimId={t > len * 0.6 ? 'rimRed' : 'rimRed'} shadow={0} />
    </g>
  );
};

// ---------- S13 wide, low angle: the storm takes the window; he looks at the suit ----------
export const S13: React.FC<ShotProps> = ({ t, len }) => {
  const kp = MARS.P(0.24, 1, 0.3);
  const pose = poseAt(t, [
    { f: 0, p: { x: kp.x, y: kp.y - LEG_LEN * 0.3, scale: 1.05, yaw: 0.6, look: 0.8, armL: { a: 18, b: -8 }, armR: { a: 24, b: 8 } } },
    { f: 20, p: {}, ease: easeOut },
    { f: 46, p: { headTilt: 6, look: 0.9 }, ease: easeOut },
  ]);
  const face = faceAt(t, [[0, 'worried'], [30, 'shock']]);
  return (
    <g transform={camT(kf(t, [[0, 940], [len, 960]]), kf(t, [[0, 600], [len, 640]]), kf(t, [[0, 1.06], [len, 1.2]]))}>
      <MarsBase t={t + 230} id="m13" storm={1} dark={0.8} veil={0.46} />
      <Hero look={PIP} pose={{ ...pose, ...face }} rimId="rimRed" shadow={0.55} />
      {(() => {
        const s = MARS.P(0, 0.44, 0.3);
        return (
          <g>
            <Glow x={s.x} y={s.y - 60} r={300} o={0.3} />
            <FocusRings x={s.x + 40} y={s.y - 40} t={t - 40} r0={56} />
          </g>
        );
      })()}
    </g>
  );
};
