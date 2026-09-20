const BFXR_PARAM_KEYS = [
  "attackTime",
  "bitCrush",
  "bitCrushSweep",
  "compressionAmount",
  "decayTime",
  "dutySweep",
  "flangerOffset",
  "flangerSweep",
  "frequency_acceleration",
  "frequency_slide",
  "frequency_start",
  "hpFilterCutoff",
  "hpFilterCutoffSweep",
  "lpFilterCutoff",
  "lpFilterCutoffSweep",
  "lpFilterResonance",
  "masterVolume",
  "min_frequency_relative_to_starting_frequency",
  "overtoneFalloff",
  "overtones",
  "pitch_jump_2_amount",
  "pitch_jump_amount",
  "pitch_jump_onset2_percent",
  "pitch_jump_onset_percent",
  "pitch_jump_repeat_speed",
  "repeatSpeed",
  "squareDuty",
  "sustainPunch",
  "sustainTime",
  "vibratoDepth",
  "vibratoSpeed",
  "waveType",
]

const HIT_PARAMS = parse_bfxr_sfx("Bfxr~Hit2~0.04~0~0~0~0.1668613138686131~0~0~0~0.11~-0.5~0.78~0.11952756440102924~0~1~0~0~0.52~0~0~0~0.03~-0.01~0~0~0~0~0.792~0~0.01313868613138686~0~0~0")
const FIRE_PARAMS = parse_bfxr_sfx("Bfxr~Hit~0.16~0~0~0.11~0.68~0~0~0~-0.4~-0.37~0.84~0.21154488383646405~0~1~0~0~0.5~0.29~1~0.15~-0.21~0.52~0~0~0~0~0~0~0.28~0.11~0.29~8")

const bfxr_param_info = {
  param_min() { return 0 },
  param_max(name) { return name === "min_frequency_relative_to_starting_frequency" ? 0.99 : 1 },
}

let sfx_ctx
let fire_buffer

function parse_bfxr_sfx(sfx) {
  const entries = sfx.split("~")
  const params = {}
  for (let i = 0; i < BFXR_PARAM_KEYS.length; i++) {
    params[BFXR_PARAM_KEYS[i]] = parseFloat(entries[i + 2])
  }
  return params
}

function sfx_context() {
  if (!sfx_ctx) sfx_ctx = new AudioContext()
  if (sfx_ctx.state === "suspended") sfx_ctx.resume()
  return sfx_ctx
}

function unlock_sfx() {
  sfx_context()
  document.removeEventListener("pointerdown", unlock_sfx)
  document.removeEventListener("keydown", unlock_sfx)
}

document.addEventListener("pointerdown", unlock_sfx)
document.addEventListener("keydown", unlock_sfx)

function synthesize_bfxr(params) {
  const dsp = new Bfxr_DSP({ ...params }, bfxr_param_info)
  dsp.generate_sound()
  return dsp.buffer
}

function play_buffer(samples) {
  if (!samples || !samples.length) return
  const ctx = sfx_context()
  const buffer = ctx.createBuffer(1, samples.length, 44100)
  buffer.getChannelData(0).set(samples)
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.connect(ctx.destination)
  source.start()
}

function play_fire() {
  if (!fire_buffer) fire_buffer = synthesize_bfxr(FIRE_PARAMS)
  play_buffer(fire_buffer)
}

function play_hit(damage = 1) {
  const t = Math.max(0, Math.min(1, Number(damage) / 8 || 0))
  play_buffer(synthesize_bfxr({ ...HIT_PARAMS, squareDuty: HIT_PARAMS.squareDuty * (1 - 0.9 * t) }))
}
