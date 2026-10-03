// ===== Nişan Testi =====
import { cal, bip, rekorKaydet, rekorOku } from '/assets/ortak.js';

const alan = document.getElementById('alan');
const hedef = document.getElementById('hedef');
const basla = document.getElementById('basla');
const sonuc = document.getElementById('sonuc');
const oKalan = document.getElementById('kalan');
const oOrtalama = document.getElementById('ortalama');
const oRekor = document.getElementById('rekor');

let adet = 30;
let kalan = 0;
let sureler = [];
let iska = 0;
let sonDogus = 0;
let oynuyor = false;

function anahtar() { return `aim-${adet}`; }

function rekorGoster() {
    const r = rekorOku(anahtar());
    oRekor.textContent = r === null ? '—' : `${r} ms`;
}

function hedefYerlestir() {
    const a = alan.getBoundingClientRect();
    const b = hedef.offsetWidth || 50;
    const x = Math.random() * Math.max(0, a.width - b);
    const y = Math.random() * Math.max(0, a.height - b);
    hedef.style.left = `${x}px`;
    hedef.style.top = `${y}px`;
    hedef.hidden = false;
    // Yeniden doğan hedefin büyüme animasyonunu baştan oynat
    hedef.classList.remove('dogdu');
    void hedef.offsetWidth;
    hedef.classList.add('dogdu');
    sonDogus = performance.now();
}

function basladi() {
    adet = Number(document.querySelector('[data-adet][aria-pressed="true"]').dataset.adet);
    kalan = adet;
    sureler = [];
    iska = 0;
    oynuyor = true;
    basla.hidden = true;
    sonuc.hidden = true;
    oKalan.textContent = kalan;
    oOrtalama.textContent = '—';
    rekorGoster();
    hedefYerlestir();
}

function vuruldu(e) {
    if (!oynuyor) return;
    e.stopPropagation();
    sureler.push(performance.now() - sonDogus);
    kalan--;
    oKalan.textContent = kalan;
    const ort = Math.round(sureler.reduce((a, b) => a + b, 0) / sureler.length);
    oOrtalama.textContent = ort;
    cal(1 + sureler.length * 0.03, 0.5);
    if (kalan <= 0) bitir();
    else hedefYerlestir();
}

function kacirdi() {
    if (!oynuyor) return;
    iska++;
    bip(130, 0.08, 0.12, 'sawtooth');
    alan.classList.remove('iska');
    void alan.offsetWidth;
    alan.classList.add('iska');
}

function unvan(ms) {
    if (ms < 380) return 'Keskin nişancı';
    if (ms < 480) return 'Çok hızlı';
    if (ms < 600) return 'İyi seviye';
    if (ms < 780) return 'Ortalama';
    return 'Isınman lazım';
}

function bitir() {
    oynuyor = false;
    hedef.hidden = true;
    const ort = Math.round(sureler.reduce((a, b) => a + b, 0) / sureler.length);
    const isabet = Math.round((adet / (adet + iska)) * 100);
    document.getElementById('sonuc-ms').textContent = `${ort} ms`;
    document.getElementById('sonuc-unvan').textContent = unvan(ort);
    document.getElementById('sonuc-detay').textContent =
        `${adet} hedef · isabet oranı %${isabet} · ${iska} ıska`;
    const yeni = rekorKaydet(anahtar(), ort, true);
    document.getElementById('sonuc-rekor').hidden = !yeni;
    rekorGoster();
    sonuc.hidden = false;
}

hedef.addEventListener('pointerdown', vuruldu);
alan.addEventListener('pointerdown', kacirdi);
document.getElementById('baslat').addEventListener('click', basladi);
document.getElementById('tekrar').addEventListener('click', basladi);

document.querySelectorAll('[data-adet]').forEach(b => {
    b.addEventListener('click', () => {
        document.querySelectorAll('[data-adet]').forEach(x => x.setAttribute('aria-pressed', 'false'));
        b.setAttribute('aria-pressed', 'true');
        adet = Number(b.dataset.adet);
        oKalan.textContent = adet;
        rekorGoster();
    });
});

oKalan.textContent = adet;
rekorGoster();
