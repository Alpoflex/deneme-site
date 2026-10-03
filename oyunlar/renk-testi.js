// ===== Renk Ayırt Etme Testi =====
import { cal, bip, rekorKaydet, rekorOku } from '/assets/ortak.js';

const izgara = document.getElementById('izgara');
const oSeviye = document.getElementById('seviye');
const oKalan = document.getElementById('kalan');
const oFark = document.getElementById('fark');
const oRekor = document.getElementById('rekor');
const basla = document.getElementById('basla');
const sonuc = document.getElementById('sonuc');

const SURE = 60;
let seviye = 1;
let kalan = SURE;
let sayac = null;
let oynuyor = false;
let suankiFark = 0;

function rekorGoster() {
    const r = rekorOku('renk');
    oRekor.textContent = r === null ? '—' : `${r}. seviye`;
}

/** Seviyeye göre ızgara kenar uzunluğu: 2, 2, 3, 3, 4 ... en fazla 7 */
function kenar(s) {
    return Math.min(7, Math.floor(Math.sqrt(s + 2)) + 1);
}

/** Seviye yükseldikçe iki ton arasındaki fark küçülür (yüzde olarak) */
function farkMiktari(s) {
    return Math.max(1.6, 42 * Math.pow(0.88, s - 1));
}

function tur() {
    const k = kenar(seviye);
    const adet = k * k;
    const h = Math.floor(Math.random() * 360);
    const s = 55 + Math.floor(Math.random() * 25);
    const l = 42 + Math.floor(Math.random() * 18);
    suankiFark = farkMiktari(seviye);
    // Farklı kare daha açık ya da daha koyu olabilsin
    const yon = Math.random() < 0.5 ? 1 : -1;
    const farkliL = Math.min(92, Math.max(8, l + yon * suankiFark));
    const farkliIndeks = Math.floor(Math.random() * adet);

    oSeviye.textContent = seviye;
    oFark.textContent = `%${suankiFark.toFixed(1)}`;
    izgara.style.setProperty('--kenar', k);
    izgara.innerHTML = '';

    for (let i = 0; i < adet; i++) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'kare';
        b.style.background = `hsl(${h} ${s}% ${i === farkliIndeks ? farkliL : l}%)`;
        b.setAttribute('aria-label', i === farkliIndeks ? 'Farklı kare' : 'Kare');
        b.addEventListener('click', () => secildi(i === farkliIndeks, b));
        izgara.appendChild(b);
    }
}

function secildi(dogruMu, b) {
    if (!oynuyor) return;
    if (dogruMu) {
        seviye++;
        cal(1 + seviye * 0.04, 0.45);
        tur();
    } else {
        kalan = Math.max(0, kalan - 3);
        oKalan.textContent = kalan;
        bip(140, 0.12, 0.12, 'sawtooth');
        b.classList.add('yanlis');
        setTimeout(() => b.classList.remove('yanlis'), 300);
        if (kalan <= 0) bitir();
    }
}

function baslat() {
    seviye = 1;
    kalan = SURE;
    oynuyor = true;
    oKalan.textContent = kalan;
    basla.hidden = true;
    sonuc.hidden = true;
    rekorGoster();
    tur();
    clearInterval(sayac);
    sayac = setInterval(() => {
        kalan--;
        oKalan.textContent = kalan;
        if (kalan <= 3 && kalan > 0) bip(660, 0.06, 0.1);
        if (kalan <= 0) bitir();
    }, 1000);
}

function unvan(s) {
    if (s >= 28) return 'Kartal gözü';
    if (s >= 22) return 'Çok keskin';
    if (s >= 16) return 'İyi seviye';
    if (s >= 10) return 'Ortalama';
    return 'Isınma turu';
}

function bitir() {
    oynuyor = false;
    clearInterval(sayac);
    const ulasilan = seviye - 1;
    document.getElementById('sonuc-seviye').textContent = `${ulasilan}. seviye`;
    document.getElementById('sonuc-unvan').textContent = unvan(ulasilan);
    document.getElementById('sonuc-detay').textContent =
        `Son ayırt ettiğin ton farkı %${suankiFark.toFixed(1)} · ızgara ${kenar(seviye)}×${kenar(seviye)}`;
    const yeni = rekorKaydet('renk', ulasilan);
    document.getElementById('sonuc-rekor').hidden = !yeni;
    rekorGoster();
    sonuc.hidden = false;
}

document.getElementById('baslat').addEventListener('click', baslat);
document.getElementById('tekrar').addEventListener('click', baslat);

oKalan.textContent = SURE;
rekorGoster();
tur();
oynuyor = false;
