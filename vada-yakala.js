import { cal, bip, rekorOku, rekorKaydet } from '/assets/ortak.js';

const SURE = 30;
const izgara = document.getElementById('izgara');
const puanEl = document.getElementById('puan');
const kalanEl = document.getElementById('kalan');
const komboEl = document.getElementById('kombo');
const rekorEl = document.getElementById('rekor');
const giris = document.getElementById('giris');
const sonuc = document.getElementById('sonuc');
const sonucPuan = document.getElementById('sonuc-puan');
const sonucDetay = document.getElementById('sonuc-detay');
const sonucRekor = document.getElementById('sonuc-rekor');

const delikler = [];
for (let i = 0; i < 9; i++) {
    const b = document.createElement('button');
    b.className = 'delik';
    b.type = 'button';
    b.setAttribute('aria-label', `Delik ${i + 1}`);
    b.innerHTML = '<span class="cikan"></span>';
    b.addEventListener('pointerdown', e => { e.preventDefault(); vur(i); });
    izgara.appendChild(b);
    delikler.push({ el: b, tip: null, zaman: 0 });
}

let puan = 0, kombo = 0, enIyiKombo = 0, yakalanan = 0, kacan = 0;
let bitis = 0, oyunda = false, sonrakiCikis = 0, raf = 0;

function rekorYaz() {
    const r = rekorOku('vada-yakala');
    rekorEl.textContent = r === null ? '—' : r;
}

function yaz() {
    puanEl.textContent = puan;
    komboEl.textContent = `x${kombo}`;
}

function gizle(i) {
    const d = delikler[i];
    d.tip = null;
    d.el.classList.remove('vada', 'bomba', 'acik', 'vuruldu');
}

function cikar(i, tip, omur) {
    const d = delikler[i];
    d.tip = tip;
    d.zaman = performance.now() + omur;
    d.el.classList.remove('vada', 'bomba', 'vuruldu');
    d.el.classList.add(tip, 'acik');
}

function vur(i) {
    if (!oyunda) return;
    const d = delikler[i];
    if (!d.tip || d.el.classList.contains('vuruldu')) return;
    if (d.tip === 'vada') {
        kombo++;
        enIyiKombo = Math.max(enIyiKombo, kombo);
        yakalanan++;
        puan += kombo >= 5 ? 2 : 1;
        cal(Math.min(1 + kombo * 0.08, 2.6), 0.6);
    } else {
        puan = Math.max(0, puan - 3);
        kombo = 0;
        bip(90, 0.35, 0.35, 'sawtooth');
        izgara.classList.remove('salla');
        void izgara.offsetWidth;
        izgara.classList.add('salla');
    }
    d.el.classList.add('vuruldu');
    d.tip = null;
    setTimeout(() => { if (!d.tip) gizle(i); }, 160);
    yaz();
}

function dongu(t) {
    const kalan = Math.max(0, (bitis - t) / 1000);
    kalanEl.textContent = Math.ceil(kalan);
    if (kalan <= 0) return bitir();

    // Zaman geçtikçe hızlanır
    const ilerleme = 1 - kalan / SURE;
    const omur = 1100 - ilerleme * 550;
    const aralik = 750 - ilerleme * 420;

    delikler.forEach((d, i) => {
        if (d.tip && t > d.zaman) {
            if (d.tip === 'vada') { kombo = 0; kacan++; yaz(); }
            gizle(i);
        }
    });

    if (t > sonrakiCikis) {
        const bos = delikler.map((d, i) => (!d.el.classList.contains('acik') ? i : -1)).filter(i => i >= 0);
        if (bos.length) {
            const i = bos[Math.floor(Math.random() * bos.length)];
            cikar(i, Math.random() < 0.18 + ilerleme * 0.1 ? 'bomba' : 'vada', omur);
        }
        // Son 10 saniyede bazen aynı anda iki tane çıkar
        if (ilerleme > 0.66 && Math.random() < 0.35 && bos.length > 1) {
            const j = bos[Math.floor(Math.random() * bos.length)];
            if (!delikler[j].tip) cikar(j, 'vada', omur);
        }
        sonrakiCikis = t + aralik * (0.7 + Math.random() * 0.6);
    }
    raf = requestAnimationFrame(dongu);
}

function basla() {
    puan = 0; kombo = 0; enIyiKombo = 0; yakalanan = 0; kacan = 0;
    delikler.forEach((_, i) => gizle(i));
    yaz();
    giris.hidden = true;
    sonuc.hidden = true;
    oyunda = true;
    const t = performance.now();
    bitis = t + SURE * 1000;
    sonrakiCikis = t + 400;
    raf = requestAnimationFrame(dongu);
}

function bitir() {
    oyunda = false;
    cancelAnimationFrame(raf);
    delikler.forEach((_, i) => gizle(i));
    const yeni = rekorKaydet('vada-yakala', puan);
    sonucPuan.textContent = puan;
    sonucDetay.textContent = `${yakalanan} Vada yakaladın, ${kacan} tanesi kaçtı. En uzun kombo: ${enIyiKombo}.`;
    sonucRekor.hidden = !yeni;
    sonuc.hidden = false;
    rekorYaz();
    cal(0.75);
    document.getElementById('tekrar').focus();
}

// Klavye: numpad düzeninde 7-8-9 / 4-5-6 / 1-2-3
const TUS = { '7': 0, '8': 1, '9': 2, '4': 3, '5': 4, '6': 5, '1': 6, '2': 7, '3': 8 };
window.addEventListener('keydown', e => { if (e.key in TUS) vur(TUS[e.key]); });

document.getElementById('basla').addEventListener('click', basla);
document.getElementById('tekrar').addEventListener('click', basla);
rekorYaz();
yaz();
kalanEl.textContent = SURE;
