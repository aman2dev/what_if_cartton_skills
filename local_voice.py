"""local_voice.py — the voice step for this episode, with edge-tts (Microsoft's free neural voices) instead of
ElevenLabs, because the account's free tier is currently blocked at ElevenLabs. Mirrors voice.py's outputs so the
rest of the pipeline (plan.py, sfx.py, master.py) can't tell the difference:

    python local_voice.py <slug> [--force]
Reads  src/episodes/<slug>/episode.json  (script, gaps)
Writes public/<slug>/voice_raw.mp3, public/<slug>/voice.wav (tightened), src/episodes/<slug>/words.json,
       out/<slug>/words_raw.json, voice_meta.json
No API key, no credits; appends a free "voice" line to the costs ledger.
Cached by a hash of text + voice settings, so re-running to retune gaps is free.
Set ELEVENLABS_* nothing: tell voice in LOC['voice'] below.
"""
import asyncio, hashlib, json, re, sys, time

import numpy as np
import edge_tts

sys.path.insert(0, '/mnt/D05AC7DA5AC7BC0A/cartoon/.claude/skills/what-if-animation/scripts')
import wi

SLASH = sys.argv[1] if len(sys.argv) > 1 else 'mars-stuck'
FORCE = '--force' in sys.argv
slug = SLASH
LOC = {
    'voice': 'en-US-GuyNeural',      # young male narrator, close to the genre's read
    'rate': '+10%',                  # the genre speaks fast; the tightening pass can't add pauses
    'pitch': '-2Hz',
}
ep = wi.load_episode(slug)
text = ' '.join(b['text'].strip() for b in ep['script'])
sig = hashlib.sha1(json.dumps([text, LOC], sort_keys=True).encode()).hexdigest()[:12]
raw_mp3 = wi.pub_dir(slug) / 'voice_raw.mp3'
raw_words = wi.out_dir(slug) / 'words_raw.json'
meta = wi.load_json(wi.out_dir(slug) / 'voice_meta.json', {})

async def gen():
    c = edge_tts.Communicate(text, LOC['voice'], rate=LOC['rate'], pitch=LOC['pitch'], boundary='WordBoundary')
    audio, words = [], []
    tick = 1e7  # edge reports offsets in 100 ns ticks
    async for chunk in c.stream():
        if chunk['type'] == 'audio':
            audio.append(chunk['data'])
        elif chunk['type'] == 'WordBoundary':
            words.append({'text': chunk['text'], 's': chunk['offset'] / tick, 'e': (chunk['offset'] + chunk['duration']) / tick})
    raw_mp3.write_bytes(b''.join(audio))
    return words

if FORCE or meta.get('sig') != sig or not raw_mp3.exists() or not raw_words.exists():
    print(f'{len(text)} characters to edge-tts ({LOC["voice"]}, no credits)')
    t0 = time.time()
    boundary = asyncio.run(gen())
    print(f'generated in {time.time() - t0:.1f} s: {len(boundary)} word boundaries')

    # pair the boundaries with the cleaned words, carry punctuation through like voice.py does
    tokens = []
    cur = None
    for ch in text:
        if re.match(r"[\w'’]", ch):
            cur = {'w': '', 'p': ''} if cur is None else cur
            cur['w'] += ch
        else:
            if cur is not None:
                tokens.append(cur)
                cur = None
            if tokens and ch.strip():
                tokens[-1]['p'] += ch
    if cur:
        tokens.append(cur)
    if len(tokens) != len(boundary):
        print(f'WARNING: {len(tokens)} tokens but {len(boundary)} boundaries; aligning by order')
    raw = []
    ti = 0
    clean = lambda s: re.sub(r"[’']", "'", re.sub(r"[^A-Za-z0-9'’]", '', s)).lower()
    for b in boundary:
        acc, consumed = '', []
        while ti < len(tokens) and len(consumed) < 5:
            consumed.append(tokens[ti])
            acc += clean(tokens[ti]['w'])
            ti += 1
            if acc == clean(b['text']) or (not acc and clean(b['text'])):
                break
        if not consumed:
            print(f'  note: boundary "{b["text"]}" has no token left')
            continue
        first, lastt = consumed[0], consumed[-1]
        merged = {'w': ' '.join(tk['w'] for tk in consumed), 's': round(b['s'], 3), 'e': round(b['e'], 3), 'p': lastt['p']}
        if clean(merged['w'].replace(' ', '')) != clean(b['text']):
            print(f'  note: token "{first["w"]}" vs boundary "{b["text"]}"')
        raw.append(merged)
    wi.save_json(raw_words, raw)
    wi.save_json(wi.out_dir(slug) / 'voice_meta.json', {'sig': sig, 'chars': len(text), 'engine': 'edge-tts', 'voice': LOC['voice']})
else:
    print('Voice unchanged since the last call: reusing it.')
raw = wi.load_json(raw_words)

# ---------------------------------------------------------------- tighten the pauses (same rules as voice.py)
G = {'word': 0.12, 'comma': 0.2, 'sentence': 0.3, 'question': 0.45, 'pairs': {}}
G.update(ep.get('gaps', {}))
x = wi.decode(raw_mp3)
cuts = []
bare = lambda w: re.sub(r'[^\w]', '', w)
for a, b in zip(raw, raw[1:]):
    gap = b['s'] - a['e']
    key = bare(a['w']) + '|' + bare(b['w'])
    if key in G['pairs']:
        keep = G['pairs'][key]
    elif '?' in a['p'] or '!' in a['p']:
        keep = G['question']
    elif '.' in a['p'] or ':' in a['p'] or ';' in a['p'] or '…' in a['p']:
        keep = G['sentence']
    elif ',' in a['p'] or '—' in a['p'] or '-' in a['p'] or '–' in a['p']:
        keep = G['comma']
    else:
        keep = G['word']
    if gap > keep:
        mid = (a['e'] + b['s']) / 2
        rm = gap - keep
        cuts.append((mid - rm / 2, mid + rm / 2))
parts, last = [], 0.0
for s, e in cuts:
    parts.append(x[int(last * wi.SR):int(s * wi.SR)])
    last = e
parts.append(x[int(last * wi.SR):])
fade = int(0.004 * wi.SR)
for i, part in enumerate(parts):
    part = part.copy()
    if i > 0 and len(part) > fade:
        part[:fade] *= np.linspace(0, 1, fade)
    if i < len(parts) - 1 and len(part) > fade:
        part[-fade:] *= np.linspace(1, 0, fade)
    parts[i] = part
y = np.concatenate(parts)
wi.write_wav(wi.pub_dir(slug) / 'voice.wav', y)

shift = lambda t: t - sum(min(e, t) - s for s, e in cuts if t > s)
out = [{'w': w['w'], 's': round(shift(w['s']), 3), 'e': round(shift(w['e']), 3), 'p': w.get('p', '')} for w in raw]
wi.save_json(wi.ep_dir(slug) / 'words.json', out)
print(f'Tightened {len(cuts)} pauses, removed {sum(e - s for s, e in cuts):.2f} s: {len(x) / wi.SR:.2f} s -> {len(y) / wi.SR:.2f} s')
print(' '.join(f"{w['w']}@{w['s']}" for w in out))
wi.log_cost(slug, 'voice', 0, 'edge-tts (Microsoft free neural voice; no ElevenLabs credits; not part of the ElevenLabs ledger normally)')
