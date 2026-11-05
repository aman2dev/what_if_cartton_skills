import React from 'react';
import { rnd } from '../anim';
import { makeRoom, Box } from '../room';
import { RoomShell, FloorShadow, WallLight } from '../furnish';
import { Glow, LightVeil, Dust, WallTexture } from '../light';
import { FONT } from '../fonts';

// The Mars base: a habitat module at dusk — a long back window onto the red desert with the small pale sun,
// a work bench under it, an oxygen machine and a console of blinking instruments on the right, supply shelves
// on the left, two dome lamps over head, pipes and floor rings. Characters stand on the floor (stand(MARS, u, w)).
// `storm` (0..1) dims the sun and reddens the sky; `dark` (0..1) kills the dome lamps and leaves the console and
// its blue glow. The window vista: butterscotch sky, far mesas, a red ground, rocks, and a pale blue dot (Earth).

export const MARS = makeRoom({ x: 960, y: 500 }, { x0: 480, x1: 1440, y0: 320, y1: 745 }, 3.4);
const K = {
  wall: '#45424E',
  side: '#37343F',
  floor: '#26222C',
  metal: '#8A8494',
  metalDark: '#66606E',
  metalEdge: '#4A4450',
  steelTop: '#9A94A2',
  steelEdge: '#68626E',
  console: '#2E3240',
  live: '#8FD9FF',
  orange: '#E8863C',
  rust: '#C96A4A',
  earth: '#9FC8FF',
};

export const MARSWIN: { x0: number; x1: number; y0: number; y1: number; sun: { x: number; y: number } } = {
  x0: 640, x1: 1010, y0: 384, y1: 560, sun: { x: 870, y: 492 },
};
const BENCH_TOP = 0.66; // the bench's v

/** A point on the bench's top, to put things on it: u across, d 0 (at the wall) to 1 (front edge). */
export const benchTop = (u: number, d: number) => MARS.P(u, BENCH_TOP - 0.02, 0.06 + 0.1 * d);

/** The vista through the window: Mars at dusk. storm 0..1 dims the sun and reddens everything. */
export const MarsWindow: React.FC<{ id: string; storm?: number }> = ({ id, storm = 0 }) => {
  const { x0, x1, y0, y1 } = MARSWIN;
  const s = MARSWIN.sun;
  const horizon = y1 - 26;
  const rocks: { x: number; y: number; r: number; c: string }[] = [];
  for (let i = 0; i < 9; i++) {
    rocks.push({ x: x0 + 14 + rnd(11, i) * (x1 - x0 - 28), y: y1 - 4 - rnd(12, i) * 14, r: 5 + rnd(13, i) * 14, c: ['#7E3426', '#67281E', '#92422E'][i % 3] });
  }
  return (
    <g>
      <defs>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D08A5E" />
          <stop offset="45%" stopColor="#B85A48" />
          <stop offset="80%" stopColor="#7E3230" />
          <stop offset="100%" stopColor="#5E2422" />
        </linearGradient>
        <radialGradient id={`${id}halo`}>
          <stop offset="0%" stopColor="#FFF6E8" stopOpacity={0.9} />
          <stop offset="30%" stopColor="#FFE8C4" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#FFE8C4" stopOpacity={0} />
        </radialGradient>
      </defs>
      <g clipPath={`url(#${id}clip)`}>
        <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill={`url(#${id}sky)`} />
        {/* far mesas, then a haze band, then hills */}
        <path d={`M ${x0 - 10} ${horizon - 34} L ${x0 + 70} ${horizon - 44} L ${x0 + 130} ${horizon - 12} L ${x0 - 10} ${horizon - 10} Z`} fill="#4A2028" opacity={0.95} />
        <path d={`M ${x1 - 150} ${horizon} L ${x1 - 110} ${horizon - 52} L ${x1 - 40} ${horizon - 58} L ${x1 + 10} ${horizon} Z`} fill="#4E222A" />
        <path d={`M ${x0 + 160} ${horizon} L ${x0 + 210} ${horizon - 30} L ${x0 + 300} ${horizon - 18} L ${x0 + 350} ${horizon} Z`} fill="#57272C" opacity={0.9} />
        <rect x={x0} y={horizon - 16} width={x1 - x0} height={16} fill="#C47858" opacity={0.35} />
        {/* the ground: red regolith with a dust scatter */}
        <rect x={x0} y={horizon} width={x1 - x0} height={y1 - horizon} fill="#8A3B2C" />
        <rect x={x0} y={horizon} width={x1 - x0} height={y1 - horizon} fill="#A44A34" opacity={0.35} />
        {rocks.map((r, i) => (
          <g key={`r${i}`}>
            <ellipse cx={r.x} cy={r.y} rx={r.r} ry={r.r * 0.5} fill={r.c} />
            <ellipse cx={r.x} cy={r.y - r.r * 0.34} rx={r.r * 0.86} ry={r.r * 0.36} fill="#B45738" opacity={0.6} />
          </g>
        ))}
        {/* the small pale sun with its dusty halo; Earth, the pale blue dot, high right */}
        <circle cx={s.x} cy={s.y} r={88} fill={`url(#${id}halo)`} opacity={0.75 - storm * 0.7} />
        <circle cx={s.x} cy={s.y} r={26} fill="#FFF3E0" opacity={1 - storm * 0.9} />
        <circle cx={s.x + 66} cy={s.y + 10} r={92} fill="#FFC27A" opacity={0.18 * (1 - storm)} style={{ mixBlendMode: 'screen' }} />
        <circle cx={x0 + 58} cy={y0 + 26} r={4.5} fill={K.earth} style={{ filter: 'drop-shadow(0 0 6px #9FC8FF)' }} />
        {/* a storm rolls dust over it all */}
        {storm > 0 ? (
          <g>
            <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="#7E2E22" opacity={0.45 * storm} />
            {Array.from({ length: 14 }).map((_, i) => {
              const yy = y0 + ((rnd(21, i) * (y1 - y0) + Math.sin(t0(storm) * 0.7) * 6) % (y1 - y0));
              const xx = x0 + ((rnd(22, i) * (x1 - x0) - storm * 700) % (x1 - x0));
              return <rect key={`d${i}`} x={xx} y={yy} width={26 + rnd(23, i) * 40} height={3 + rnd(24, i) * 5} fill="#B4523A" opacity={0.5 * storm} />;
            })}
          </g>
        ) : null}
        <Dust t={t0(storm)} seed={7} x0={x0 + 10} y0={y0 + 10} w={x1 - x0 - 20} h={y1 - y0 - 20} n={16} o={0.3} />
        {storm > 0 ? <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="#3A0E0C" opacity={0.3 * storm} style={{ mixBlendMode: 'multiply' }} /> : null}
      </g>
    </g>
  );
};
const t0 = (s: number) => s * 23;

/**
 * The habitat interior. Draw order: shell, window, fittings left and right, bench, floor, lamps, veil, glows.
 * `dark` 0..1 kills the dome lamps (the console glow and the storm light stay); `veil` is the contrast pass.
 */
export const MarsBase: React.FC<{ t: number; id?: string; veil?: number; storm?: number; dark?: number }> = ({ t, id = 'mars', veil = 0.42, storm = 0, dark = 0 }) => {
  const R = MARS;
  const { P, Q } = R;
  const B = BENCH_TOP;
  const lampsOn = 1 - dark;
  // the console's blinking instrument lights
  const lights: React.ReactNode[] = [];
  for (let i = 0; i < 12; i++) {
    const c = P(0.68 + (i % 3) * 0.05, 0.34 + Math.floor(i / 3) * 0.07, 0.014);
    const on = rnd(5, i) > 0.3;
    const tw = 0.55 + 0.45 * Math.sin(t / 7 + i * 1.3);
    lights.push(<circle key={`c${i}`} cx={c.x} cy={c.y} r={4} fill={on ? ['#FFC46A', K.live, '#FF7A5A'][i % 3] : '#3A3A46'} opacity={on ? 0.5 + 0.5 * tw : 0.6} />);
  }
  // the oxygen machine against the right wall, its tank and a gauge
  const om = P(0.92, B - 0.02, 0.06);
  return (
    <g>
      <RoomShell r={R} id={id} floor="boards" wall={K.wall} side={K.side} floorC={K.floor} lines="#191522" />
      <WallTexture rect={[480, 320, 960, 130]} />
      {/* the window: vista, then the metal frame with bolts and a sill */}
      {(() => {
        const { x0, x1, y0, y1 } = MARSWIN;
        const f = 14;
        return (
          <g>
            <defs>
              <clipPath id={`${id}clip`}>
                <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} />
              </clipPath>
            </defs>
            <MarsWindow id={`${id}vista`} storm={storm} />
            <rect x={x0 - f - 4} y={y0 - f - 4} width={x1 - x0 + 2 * f + 8} height={y1 - y0 + 2 * f + 8} fill="none" stroke={K.metalEdge} strokeWidth={f + 8} />
            <rect x={x0 - 4} y={y0 - 4} width={x1 - x0 + 8} height={y1 - y0 + 8} fill="none" stroke={K.metal} strokeWidth={8} />
            {[[x0, y0], [x1, y0], [x0, y1], [x1, y1]].map(([bx, by], i) => (
              <circle key={`b${i}`} cx={bx - 4} cy={by - 4} r={5} fill={K.metalDark} stroke="#2A2530" strokeWidth={2} />
            ))}
            <rect x={x0 - 10} y={y1 + 4} width={x1 - x0 + 20} height={10} fill={K.metalEdge} />
          </g>
        );
      })()}
      {/* pipework along the ceiling and down the back wall */}
      <path d={`M ${P(0.05, 0.1, 0.01).x} ${P(0.05, 0.1, 0.01).y} Q ${960} ${P(0.5, 0.08, 0.01).y - 30} ${P(0.98, 0.1, 0.01).x} ${P(0.98, 0.1, 0.01).y}`} stroke="#575062" strokeWidth={10} fill="none" strokeLinecap="round" />
      <path d={`M ${P(0.66, 0.16, 0.02).x} ${P(0.66, 0.16, 0.02).y} L ${P(0.66, 0.16, 0.02).x} ${P(0.66, 0.64, 0.02).y}`} stroke="#575062" strokeWidth={8} fill="none" />
      {Array.from({ length: 5 }).map((_, i) => {
        const c = P(0.06 + i * 0.045, 0.12, 0.02);
        return <rect key={`p${i}`} x={c.x - 8} y={c.y} width={16} height={12} rx={3} fill="#4A4550" />;
      })}
      {/* supply shelves on the left with packs and jars, one with a green sprout */}
      {[0.22, 0.36].map((v, si) => (
        <polygon key={`sh${si}`} points={Q([[0.015, v, 0], [0.23, v, 0], [0.23, v, 0.035], [0.015, v, 0.035]])} fill={K.metalDark} />
      ))}
      {Array.from({ length: 4 }).map((_, k) => {
        const p = P(0.03 + k * 0.05, 0.215, 0.02);
        const h = 40 + rnd(31, k) * 20;
        const c = [K.orange, '#7FA6B8', '#C9B48A', '#8E9468'][k];
        return (
          <g key={`pack${k}`}>
            <rect x={p.x} y={p.y - h} width={34} height={h} rx={4} fill={c} />
            <rect x={p.x + 4} y={p.y - h - 5} width={26} height={6} rx={3} fill="#2A2530" />
            <rect x={p.x + 6} y={p.y - h + 8} width={5} height={h - 16} fill="#FFFFFF" opacity={0.18} />
          </g>
        );
      })}
      {Array.from({ length: 3 }).map((_, k) => {
        const p = P(0.06 + k * 0.05, 0.355, 0.02);
        const h = 22 + rnd(37, k) * 8;
        return (
          <g key={`jar${k}`}>
            <rect x={p.x} y={p.y - h} width={22} height={h} rx={4} fill="#93A8A0" opacity={0.9} />
            {k === 1 ? <path d={`M ${p.x + 11} ${p.y - 4} q 0 ${-h * 0.6} 5 ${-h * 0.75}`} stroke="#7FBF7A" strokeWidth={3} fill="none" strokeLinecap="round" /> : null}
            <rect x={p.x - 1} y={p.y - h - 3} width={24} height={5} rx={2} fill="#2A2530" />
          </g>
        );
      })}
      {/* the bench along the back wall under the window, with bolts on its face */}
      <FloorShadow r={R} u={[0.06, 0.58]} w={[0.02, 0.16]} />
      <Box r={R} u={[0.06, 0.58]} v={[B, 1]} w={[0, 0.13]} front={K.metal} side={K.metalDark} />
      <Box r={R} u={[0.055, 0.585]} v={[B - 0.03, B]} w={[0, 0.15]} front={K.steelEdge} top={K.steelTop} side={K.steelEdge} rim />
      {Array.from({ length: 7 }).map((_, k) => {
        const c = P(0.08 + k * 0.07, B, 0.135);
        return <circle key={`bt${k}`} cx={c.x} cy={c.y - 7} r={3} fill="#5A525C" />;
      })}
      {/* things on the bench: a flask of clear water, a minirover, a spanner */}
      {(() => {
        const fl = benchTop(0.12, 0.6);
        const rv = benchTop(0.3, 0.4);
        const sp = benchTop(0.45, 0.7);
        return (
          <g>
            <ellipse cx={fl.x} cy={fl.y + 2} rx={16} ry={5} fill="#000" opacity={0.35} />
            <path d={`M ${fl.x - 11} ${fl.y - 42} Q ${fl.x - 11} ${fl.y - 4} ${fl.x} ${fl.y} Q ${fl.x + 11} ${fl.y - 4} ${fl.x + 11} ${fl.y - 42}`} fill="#DDEEF8" opacity={0.92} />
            <rect x={fl.x - 12} y={fl.y - 48} width={24} height={7} rx={2} fill="#4A5A64" />
            <rect x={fl.x - 9} y={fl.y - 38} width={10} height={26} rx={3} fill="#EDF6FC" />
            <ellipse cx={rv.x} cy={rv.y + 2} rx={22} ry={6} fill="#000" opacity={0.35} />
            <rect x={rv.x - 22} y={rv.y - 16} width={44} height={14} rx={4} fill="#B8503A" />
            <rect x={rv.x - 16} y={rv.y - 22} width={26} height={7} rx={3} fill="#8A3A2C" />
            <circle cx={rv.x - 13} cy={rv.y + 2} r={6} fill="#2A2530" />
            <circle cx={rv.x + 13} cy={rv.y + 2} r={6} fill="#2A2530" />
            <rect x={sp.x - 22} y={sp.y - 4} width={44} height={6} rx={3} fill="#8A9298" transform={`rotate(-18 ${sp.x} ${sp.y})`} />
          </g>
        );
      })()}
      {/* the console wall on the right: panel, instruments, an alarm strip */}
      <Box r={R} u={[0.63, 0.985]} v={[0.24, 0.72]} w={[0, 0.04]} front={K.console} side="#232634" />
      <rect x={P(0.645, 0.26, 0).x} y={P(0.645, 0.26, 0).y} width={P(0.96, 0.26, 0).x - P(0.645, 0.26, 0).x} height={P(0.645, 0.7, 0).y - P(0.645, 0.26, 0).y} fill="#242836" />
      {lights}
      <polygon points={Q([[0.66, 0.62, 0.005], [0.95, 0.62, 0.005], [0.95, 0.66, 0.005], [0.66, 0.66, 0.005]])} fill={dark > 0.5 ? '#E0503C' : '#3A3E4C'} />
      {dark > 0.5 ? <Glow x={P(0.8, 0.64, 0).x} y={P(0.8, 0.64, 0).y} r={200} kind="red" o={0.25} /> : null}
      {/* the oxygen machine on the far right: tank, compressor, a round gauge with a needle */}
      <FloorShadow r={R} u={[0.9, 1]} w={[0.02, 0.14]} />
      <Box r={R} u={[0.9, 0.995]} v={[B + 0.06, 1]} w={[0, 0.12]} front="#6A7480" side="#525A64" top="#7A848E" />
      <g>
        <rect x={om.x - 16} y={om.y - 150} width={32} height={64} rx={8} fill="#7A9098" />
        <circle cx={om.x} cy={om.y - 138} r={7} fill="#4A6A72" />
        <circle cx={om.x} cy={om.y - 104} r={5} fill="#4A6A72" />
      </g>
      <circle cx={om.x} cy={om.y - 46} r={26} fill="#20242E" stroke="#8A9298" strokeWidth={5} />
      <path d={`M ${om.x} ${om.y - 46} L ${om.x + 14} ${om.y - 60}`} stroke="#FFD7A0" strokeWidth={5} strokeLinecap="round" />
      {/* a hanging suit on the left wall: the hero's lifeline, waiting for him */}
      {(() => {
        const s = P(0, 0.44, 0.3);
        return (
          <g>
            <ellipse cx={s.x - 10} cy={s.y + 118} rx={46} ry={9} fill="#000" opacity={0.4} />
            <path d={`M ${s.x - 26} ${s.y - 20} Q ${s.x} ${s.y - 34} ${s.x + 26} ${s.y - 20} L ${s.x + 22} ${s.y + 96} Q ${s.x} ${s.y + 108} ${s.x - 22} ${s.y + 96} Z`} fill="#D98A3E" />
            <circle cx={s.x} cy={s.y - 52} r={34} fill="#E8E4DC" transform={`translate(0 6)`} />
            <rect x={s.x - 34} y={s.y - 56} width={68} height={30} rx={6} fill="#C8C4BC" />
            <circle cx={s.x} cy={s.y - 40} r={16} fill="#2A2436" />
            <rect x={s.x + 26} y={s.y - 12} width={30} height={26} rx={6} fill="#B8B4AC" transform={`rotate(24 ${s.x + 26} ${s.y - 12})`} />
            <path d={`M ${s.x - 4} ${s.y - 20} L ${s.x - 4} ${s.y + 30}`} stroke="#8A5220" strokeWidth={6} />
            <circle cx={s.x} cy={s.y + 44} r={9} fill="#C2553E" />
          </g>
        );
      })()}
      <WallLight r={R} u={0} v={0.55} w={0.55} o={0.4 * lampsOn} />
      {/* the two dome lamps overhead; blue console glow on the right; the storm's red spill from the window */}
      <LightVeil
        id={`${id}veil`}
        lights={[
          ...(lampsOn > 0
            ? ([
                [P(0.34, 0, 0.5).x, P(0.34, 0, 0.5).y + 40, 300],
                [P(0.68, 0, 0.5).x, P(0.68, 0, 0.5).y + 40, 280],
              ] as [number, number, number][])
            : []),
          [MARSWIN.sun.x - 30, MARSWIN.sun.y - 40, 380 - storm * 160] as [number, number, number],
          [P(0.85, 0.42, 0.06).x, P(0.85, 0.42, 0.06).y, 240] as [number, number, number],
        ]}
        o={veil}
      />
      {lampsOn > 0 ? (
        <g>
          {[
            [0.34, 0.5],
            [0.68, 0.5],
          ].map(([u, w], i) => {
            const c = P(u, 0.07, w);
            return (
              <g key={`d${i}`}>
                <rect x={c.x - 26} y={c.y - 4} width={52} height={12} rx={6} fill="#575062" />
                <ellipse cx={c.x} cy={c.y + 10} rx={24} ry={9} fill="#FFF0D2" />
                <Glow x={c.x} y={c.y + 40} r={280} o={0.3} />
              </g>
            );
          })}
        </g>
      ) : null}
      {storm > 0 ? <rect x={-1500} y={-1500} width={5000} height={4500} fill="#5A1608" opacity={0.3 * storm} style={{ mixBlendMode: 'multiply' }} /> : null}
      <Dust t={t} seed={93} x0={700} y0={380} w={520} h={300} n={26} o={0.4 * (1 - storm * 0.5)} />
    </g>
  );
};
/** Days alive, a hand-tall counter on the console: SOL {n}. */
export const SolChip: React.FC<{ x: number; y: number; sol: number; size?: number }> = ({ x, y, sol, size = 30 }) => (
  <g>
    <rect x={x - 3.2 * size} y={y - size * 0.72} width={6.4 * size} height={size * 1.44} rx={5} fill="#151821" opacity={0.92} />
    <text x={x} y={y + size * 0.36} textAnchor="middle" fontFamily={FONT.ui} fontSize={size} fill="#FFC46A" letterSpacing={2}>
      {`SOL ${sol}`}
    </text>
  </g>
);
