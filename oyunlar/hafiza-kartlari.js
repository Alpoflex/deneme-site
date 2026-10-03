// ===== Hafıza Kartları =====
import { cal, bip, rekorKaydet, rekorOku } from '/assets/ortak.js';

const SIMGELER = ['🔥', '🎯', '🎵', '⚡', '🍉', '🚀', '👾', '🎲', '🧊', '🌙', '🍕', '🦊'];

const tahta = document.getElementById('tahta');
const oHamle = document.getElementById('hamle');
const oSure = document.getElementById('sure');
const oRekor = document.getElementById('rekor');
const basla = document.getElementById('basla');
const sonuc = document.getElementById('sonuc');

let cift = 8;
let acik = [];
let kilit = false;
let hamle = 0;
let eslesen = 0;
let gecen = 0;
let sayac = null;

function anahtar() { return `hafiza-${cift}`; }

function rekorGoster() {
    const r = rekorOku(anahtar());
    oRekor.textContent = r === null ? '—' : `${r} sn`;
}

function karistir(d) {
    for (let i = d.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [d[i], d[j]] = [d[j], d[i]];
    }
    return d;
}

function kur() {
    cift = Number(document.querySelector('[data-cift][aria-pressed="true"]').dataset.cift);
    clearInterval(sayac);
    acik = [];
    kilit = false;
    hamle = 0;
    eslesen = 0;
    gecen = 0;
    oHamle.textContent = '0';
    oSure.textContent = '0';
    rekorGoster();

    const deste = karistir([...SIMGELER.slice(0, cift), ...SIMGELER.slice(0, cift)]);
    tahta.innerHTML = '';
    tahta.style.setProperty('--sutun', cift <= 6 ? 4 : (cift <= 8 ? 4 : 6));
    deste.forEach((s, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'kart';
        b.dataset.simge = s;
        b.setAttribute('aria-label', `Kart ${i + 1}`);
        b.innerHTML = '<span class="on"></span><span class="arka" aria-hidden="true"></span>';
        b.querySelector('.arka').textContent = s;
        b.addEventListener('click', () => cevir(b));
        tahta.appendChild(b);
    });
}

function baslat() {
    kur();
    basla.hidden = true;
    sonuc.hidden = true;
    sayac = setInterval(() => { gecen++; oSure.textContent = gecen; }, 1000);
}

function cevir(b) {
    if (kilit || b.classList.contains('acik') || b.classList.contains('bitti')) return;
    b.classList.add('acik');
    acik.push(b);
    cal(1.2, 0.35);
    if (acik.length < 2) return;

    hamle++;
    oHamle.textContent = hamle;
    const [a, c] = acik;
    if (a.dataset.simge === c.dataset.simge) {
        acik = [];
        a.classList.add('bitti');
        c.classList.add('bitti');
        eslesen++;
        bip(880, 0.1, 0.14, 'triangle');
        if (eslesen === cift) bitir();
    } else {
        kilit = true;
        bip(160, 0.12, 0.1, 'sawtooth');
        setTimeout(() => {
            a.classList.remove('acik');
            c.classList.remove('acik');
            acik = [];
            kilit = false;
        }, 700);
    }
}

function unvan(h) {
    const ideal = cift * 1.4;
    if (h <= ideal) return 'Fotoğrafik hafıza';
    if (h <= ideal * 1.6) return 'Çok iyi';
    if (h <= ideal * 2.2) return 'Ortalama';
    return 'Biraz şansa kaldı';
}

function bitir() {
    clearInterval(sayac);
    document.getElementById('sonuc-sure').textContent = `${gecen} saniye`;
    document.getElementById('sonuc-unvan').textContent = unvan(hamle);
    document.getElementById('sonuc-detay').textContent =
        `${cift} çift · ${hamle} hamle · en az ${cift} hamleyle bitirilebilir`;
    const yeni = rekorKaydet(anahtar(), gecen, true);
    document.getElementById('sonuc-rekor').hidden = !yeni;
    rekorGoster();
    sonuc.hidden = false;
}

document.getElementById('baslat').addEventListener('click', baslat);
document.getElementById('tekrar').addEventListener('click', baslat);
document.querySelectorAll('[data-cift]').forEach(b => {
    b.addEventListener('click', () => {
        document.querySelectorAll('[data-cift]').forEach(x => x.setAttribute('aria-pressed', 'false'));
        b.setAttribute('aria-pressed', 'true');
        kur();
    });
});

kur();
