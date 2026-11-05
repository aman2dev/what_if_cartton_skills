"""Synthesizes the 5 clips the episode needs that no library clip covers, in numpy (free, no voices, no credit),
and writes each at the exact path clip_path() hashes, so sfx.py treats them as cached library clips.
Audio model: mono 44.1 kHz, peak-normalized, like every library clip."""
import sys
sys.path.insert(0, '/mnt/D05AC7DA5AC7BC0A/cartoon/.claude/skills/what-if-animation/scripts')
import numpy as np
import wi

rng = np.random.default_rng(7)
SR = wi.SR

def norm(x):
    return x / max(1e-9, np.abs(x).max()) * 0.9

def env_hann(n, f_in=0.15, f_out=0.4):
    e = np.ones(n)
    a, b = int(f_in * n), int(f_out * n)
    e[:a] = np.linspace(0, 1, a) ** 2
    e[-b:] = np.linspace(1, 0, b) ** 2
    return e

def lowpass(x, k=0.05):
    w = int(k * SR)
    y = np.copy(x)
    for _ in range(2):
        y = np.convolve(y, np.ones(w) / w, mode='same')
    return y

def brown(n):
    c = np.cumsum(rng.normal(0, 1, n))
    c -= np.linspace(c[0], c[-1], n)
    return c / max(1e-9, np.abs(c).max())

def plink(t0, f0, f1, gain, dur=0.35, n=None):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = f0 * (f1 / f0) ** np.minimum(t / (dur * 0.6), 1)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 22)
    splash = lowpass(rng.normal(0, 1, n), 0.04) * np.exp(-t * 14) * 0.35
    return t0, (body + splash) * gain

# ---------------------------------------------------------------- hab_hum: the base's life support, 13 s
n = int(13.0 * SR)
rumble = brown(n) * 0.4
drone = np.sin(2 * np.pi * 55 * np.arange(n) / SR) * 0.25
drone += np.sin(2 * np.pi * 55.9 * np.arange(n) / SR) * 0.18  # slow beating
hiss = lowpass(rng.normal(0, 1, n), 0.01) * 0.16
wob = 1 + 0.1 * np.sin(2 * np.pi * 0.13 * np.arange(n) / SR)
hab = lowpass((rumble + drone + hiss) * wob, 0.04) * env_hann(n)

ALL = {}
ALL['hab_hum'] = ("quiet life-support hum inside a spaceship habitat module, soft air circulation and distant machinery, no voices", 13.0, hab)

# ---------------------------------------------------------------- drip_water: two plinks into a pool, 1.6 s
n = int(1.6 * SR)
buf = np.zeros(n)
t1, x1 = plink(0.05, 1250, 420, 1.0)
t2, x2 = plink(1.12, 1100, 380, 0.8)
i = int(t1 * SR)
buf[i:i + len(x1)] += x1[:len(buf) - i]
i = int(t2 * SR)
buf[i:i + len(x2)] += x2[:len(buf) - i]
ALL['drip_water'] = ("two water drips falling into a small pool of water on metal, soft liquid plinks, close up, cartoon", 1.6, buf * env_hann(n, 0.02, 0.1))

# ---------------------------------------------------------------- o2_hum: compressor pulse, 6 s
n = int(6.0 * SR)
t = np.arange(n) / SR
pulse = (1 + np.sign(np.sin(2 * np.pi * 2.3 * t))) / 2
hum = np.sin(2 * np.pi * 92 * t) * 0.5 + brown(n) * 0.45
o2 = lowpass(hum * (0.35 + 0.65 * pulse), 0.03) * env_hann(n)
ALL['o2_hum'] = ("a small oxygen machine compressor humming a steady mechanical pulse inside a metal room, no voices", 6.0, o2)

# ---------------------------------------------------------------- breath: long relieved inhale, 1.0 s
n = int(1.0 * SR)
t = np.arange(n) / SR
mid = n // 2
inh = lowpass(rng.normal(0, 1, mid), 0.004) * np.exp(-((t[:mid] - 0.28) ** 2) / 0.02)
exh = lowpass(rng.normal(0, 1, n - mid), 0.01) * np.exp(-np.arange(n - mid) / SR * 5) * 0.5
br = np.concatenate([inh, exh]) * 1.2
ALL['breath'] = ("a single long relieved breath in through the nose, soft and close, no voices", 1.0, norm(br) * env_hann(n, 0.05, 0.15))

# ---------------------------------------------------------------- storm_wind: gusts on the glass, 7 s
n = int(7.0 * SR)
t = np.arange(n) / SR
base = brown(n)
sp = lowpass(base, 0.02)
gust_env = 0.55 + 0.45 * np.sin(2 * np.pi * 0.22 * t + 1.2) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.09 * t))
sw = sp * gust_env * 1.4 + base * 0.12
storm = lowpass(sw, 0.035) * env_hann(n, 0.25, 0.6)
ALL['storm_wind'] = ("a dry dust storm gusting against a sealed window, low rumbling wind swelling, no voices", 7.0, storm)

for name, (prompt, secs, x) in ALL.items():
    p = wi.clip_path(name, prompt, secs)
    if p.exists():
        print(f'{name}: already in the library, skipping')
        continue
    tmp = p.with_suffix('.wav')
    wi.write_wav(tmp, norm(x))
    import subprocess
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(tmp), '-b:a', '128k', '-ar', str(SR), '-ac', '1', str(p)], check=True)
    tmp.unlink()
    print(f'{name}: written to {p.name} ({secs} s)')
