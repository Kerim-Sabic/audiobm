/**
 * Zvučni motor online testa sluha (Web Audio API).
 *
 * Sigurnost sluha:
 *  - tvrdi plafon glasnoće (DBFS_PLAFON) — ton nikad nije glasniji
 *  - mekane rampe (30 ms) — bez „pucketanja" i naglih udara
 *  - zvuk se pokreće ISKLJUČIVO nakon korisnikove interakcije (bez autoplaya)
 *
 * Ton je pulsirajući „warble" (blago talasanje frekvencije ±4%) — ugodniji je
 * i lakše ga je prepoznati od kontinuiranog čistog tona.
 */

import { DBFS_PLAFON } from '@/lib/test-sluha'

export type Kanal = 'lijevo' | 'desno' | 'oba'

const dbUAmplitudu = (dbfs: number) => Math.pow(10, Math.min(dbfs, DBFS_PLAFON) / 20)

export class ZvucniMotor {
  private ctx: AudioContext | null = null
  private aktivnoZaustavljanje: (() => void) | null = null

  /** Pokreće/odmrzava AudioContext — pozvati iz klika korisnika. */
  async pokreni(): Promise<boolean> {
    try {
      this.ctx ??= new AudioContext()
      if (this.ctx.state === 'suspended') await this.ctx.resume()
      return this.ctx.state === 'running'
    } catch {
      return false
    }
  }

  /**
   * Pušta pulsirajući warble ton (3 pulsa ≈ 1,5 s). Razrješava se kad ton završi.
   * `tisina: true` — kontrolni (catch) pokušaj: ista pauza, bez zvuka.
   */
  pustiTon({
    frekvencija,
    dbfs,
    kanal,
    tisina = false,
  }: {
    frekvencija: number
    dbfs: number
    kanal: Kanal
    tisina?: boolean
  }): Promise<void> {
    const ctx = this.ctx
    if (!ctx || ctx.state !== 'running') return Promise.resolve()

    const TRAJANJE_PULSA = 0.3
    const PAUZA = 0.18
    const BROJ_PULSEVA = 3
    const ukupno = BROJ_PULSEVA * TRAJANJE_PULSA + (BROJ_PULSEVA - 1) * PAUZA

    if (tisina) {
      return new Promise((resolve) => {
        const t = setTimeout(resolve, ukupno * 1000)
        this.aktivnoZaustavljanje = () => {
          clearTimeout(t)
          resolve()
        }
      })
    }

    const sada = ctx.currentTime + 0.05
    const amplituda = dbUAmplitudu(dbfs)

    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = frekvencija

    // warble: spora modulacija frekvencije ±4%
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 5
    const lfoDubina = ctx.createGain()
    lfoDubina.gain.value = frekvencija * 0.04
    lfo.connect(lfoDubina)
    lfoDubina.connect(osc.frequency)

    const omotac = ctx.createGain()
    omotac.gain.value = 0

    const panner = ctx.createStereoPanner()
    panner.pan.value = kanal === 'lijevo' ? -1 : kanal === 'desno' ? 1 : 0

    osc.connect(omotac)
    omotac.connect(panner)
    panner.connect(ctx.destination)

    // raspored pulseva sa mekim rampama
    for (let i = 0; i < BROJ_PULSEVA; i++) {
      const start = sada + i * (TRAJANJE_PULSA + PAUZA)
      omotac.gain.setValueAtTime(0, start)
      omotac.gain.linearRampToValueAtTime(amplituda, start + 0.03)
      omotac.gain.setValueAtTime(amplituda, start + TRAJANJE_PULSA - 0.03)
      omotac.gain.linearRampToValueAtTime(0, start + TRAJANJE_PULSA)
    }

    osc.start(sada)
    lfo.start(sada)
    const kraj = sada + ukupno + 0.05
    osc.stop(kraj)
    lfo.stop(kraj)

    return new Promise((resolve) => {
      let gotovo = false
      const zavrsi = () => {
        if (gotovo) return
        gotovo = true
        try {
          osc.disconnect()
          lfo.disconnect()
          omotac.disconnect()
          panner.disconnect()
        } catch {
          /* već prekinuto */
        }
        resolve()
      }
      osc.onended = zavrsi
      this.aktivnoZaustavljanje = () => {
        try {
          osc.stop()
          lfo.stop()
        } catch {
          /* već zaustavljeno */
        }
        zavrsi()
      }
    })
  }

  /** Prekida ton koji trenutno svira (npr. izlazak iz testa). */
  zaustavi() {
    this.aktivnoZaustavljanje?.()
    this.aktivnoZaustavljanje = null
  }

  async zatvori() {
    this.zaustavi()
    try {
      await this.ctx?.close()
    } catch {
      /* već zatvoren */
    }
    this.ctx = null
  }
}

/**
 * Mjerenje ambijentalne buke mikrofonom (~2,5 s). Vraća približan RMS u dBFS
 * ili null ako pristup nije odobren/moguć. Zvuk se NIGDJE ne snima niti šalje —
 * očitava se samo trenutni nivo i odmah odbacuje.
 */
export async function izmjeriBuku(): Promise<number | null> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return null
  let stream: MediaStream | null = null
  let ctx: AudioContext | null = null
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    })
    ctx = new AudioContext()
    const izvor = ctx.createMediaStreamSource(stream)
    const analizator = ctx.createAnalyser()
    analizator.fftSize = 2048
    izvor.connect(analizator)

    const uzorak = new Float32Array(analizator.fftSize)
    let suma = 0
    const BROJ = 24
    for (let i = 0; i < BROJ; i++) {
      await new Promise((r) => setTimeout(r, 100))
      analizator.getFloatTimeDomainData(uzorak)
      let kvadrati = 0
      for (let j = 0; j < uzorak.length; j++) kvadrati += uzorak[j] * uzorak[j]
      suma += Math.sqrt(kvadrati / uzorak.length)
    }
    const rms = suma / BROJ
    return 20 * Math.log10(rms + 1e-8)
  } catch {
    return null
  } finally {
    stream?.getTracks().forEach((t) => t.stop())
    try {
      await ctx?.close()
    } catch {
      /* ignorisano */
    }
  }
}
