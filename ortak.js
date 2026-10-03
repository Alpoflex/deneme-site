// ===== Oyunların ortak yardımcıları: ses + kişisel rekorlar =====

// --- Ses (Web Audio, gecikmesiz, perde ayarlı) ---
const AC = window.AudioContext || window.webkitAudioContext;
let ctx = null;
let tampon = null;
let yukleniyor = null;
let sessiz = false;

try { sessiz = localStorage.getItem('aminake-sessiz') === '1'; } catch (_) { }

function hazirla() {
    if (!AC) return Promise.resolve();
    if (!ctx) ctx = new AC();
    if (!yukleniyor) {
        yukleniyor = fetch('/aminake.mp3')
            .then(r => r.arrayBuffer())
            .then(d => ctx.decodeAudioData(d))
            .then(b => { tampon = b; })
            .catch(() => { });
    }
    return yukleniyor;
}

/** Sesi çalar. perde: 1 = normal, 2 = iki kat ince. ses: 0–1 */
export function cal(perde = 1, ses = 1) {
    if (sessiz || !AC) return;
    hazirla();
    if (ctx.state === 'suspended') ctx.resume();
    const kazanc = ctx.createGain();
    kazanc.gain.value = ses;
    kazanc.connect(ctx.destination);
    if (tampon) {
        const k = ctx.createBufferSource();
        k.buffer = tampon;
        k.playbackRate.value = perde;
        k.connect(kazanc);
        k.start(0);
    } else {
        bip(220 * perde, 0.12, ses * 0.3);
    }
}

/** Kısa bir sentez bip sesi (efektler için) */
export function bip(frekans = 440, sure = 0.1, ses = 0.2, tip = 'square') {
    if (sessiz || !AC) return;
    hazirla();
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = tip;
    o.frequency.setValueAtTime(frekans, t);
    g.gain.setValueAtTime(ses, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + sure);
}

export function sessizMi() { return sessiz; }
export function sessizAyarla(d) {
    sessiz = d;
    try { localStorage.setItem('aminake-sessiz', d ? '1' : '0'); } catch (_) { }
}

// İlk dokunuşta sesi hazırla (tarayıcılar ses için kullanıcı etkileşimi ister)
['pointerdown', 'keydown'].forEach(ev =>
    window.addEventListener(ev, () => hazirla(), { once: true, passive: true }));

// --- Kişisel rekorlar (sadece bu tarayıcıda saklanır) ---
const ANAHTAR = 'aminake-rekorlar';

function hepsi() {
    try { return JSON.parse(localStorage.getItem(ANAHTAR)) || {}; } catch (_) { return {}; }
}

export function rekorOku(oyun) {
    const r = hepsi()[oyun];
    return typeof r === 'number' ? r : null;
}

/**
 * Yeni skoru kaydeder. dahaAzIyi=true ise küçük skor daha iyidir (ör. reaksiyon süresi).
 * Yeni rekorsa true döner.
 */
export function rekorKaydet(oyun, skor, dahaAzIyi = false) {
    const r = hepsi();
    const eski = r[oyun];
    const yeni = typeof eski !== 'number' || (dahaAzIyi ? skor < eski : skor > eski);
    if (yeni) {
        r[oyun] = skor;
        try { localStorage.setItem(ANAHTAR, JSON.stringify(r)); } catch (_) { }
    }
    return yeni;
}

// --- Ses aç/kapat düğmesi (sayfada #ses-dugmesi varsa) ---
const sesBtn = document.getElementById('ses-dugmesi');
if (sesBtn) {
    const yaz = () => {
        sesBtn.textContent = sessiz ? '🔇 Ses kapalı' : '🔊 Ses açık';
        sesBtn.setAttribute('aria-pressed', String(!sessiz));
    };
    yaz();
    sesBtn.addEventListener('click', () => { sessizAyarla(!sessiz); yaz(); });
}
