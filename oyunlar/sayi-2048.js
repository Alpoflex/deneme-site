// ===== 2048 =====
import { cal, bip, rekorKaydet, rekorOku } from '/assets/ortak.js';

const N = 4;
const tahtaEl = document.getElementById('tahta');
const oSkor = document.getElementById('skor');
const oEnIyi = document.getElementById('eniyi');
const oTas = document.getElementById('entas');
const sonuc = document.getElementById('sonuc');

let hucre = [];
let skor = 0;
let bittiMi = false;
let kazandiBildirildi = false;

function enIyiGoster() {
    const r = rekorOku('2048');
    oEnIyi.textContent = r === null ? '0' : r;
}

function bosIndeksler() {
    const b = [];
    hucre.forEach((v, i) => { if (v === 0) b.push(i); });
    return b;
}

function tasEkle() {
    const bos = bosIndeksler();
    if (!bos.length) return;
    const i = bos[Math.floor(Math.random() * bos.length)];
    hucre[i] = Math.random() < 0.9 ? 2 : 4;
    return i;
}

function ciz(yeniIndeks) {
    tahtaEl.innerHTML = '';
    let enBuyuk = 0;
    hucre.forEach((v, i) => {
        const d = document.createElement('div');
        d.className = 'tas' + (v ? ` d${v}` : ' bos') + (i === yeniIndeks ? ' yeni' : '');
        d.textContent = v || '';
        if (v) d.setAttribute('aria-label', String(v));
        tahtaEl.appendChild(d);
        if (v > enBuyuk) enBuyuk = v;
    });
    oSkor.textContent = skor;
    oTas.textContent = enBuyuk || '—';
}

/** Tek bir sırayı sola doğru sıkıştırıp birleştirir. */
function sikistir(sira) {
    const dolu = sira.filter(v => v !== 0);
    const cikti = [];
    for (let i = 0; i < dolu.length; i++) {
        if (dolu[i] === dolu[i + 1]) {
            cikti.push(dolu[i] * 2);
            skor += dolu[i] * 2;
            i++;
        } else {
            cikti.push(dolu[i]);
        }
    }
    while (cikti.length < N) cikti.push(0);
    return cikti;
}

/** yon: 'sol' | 'sag' | 'yukari' | 'asagi' */
function siraAl(yon, k) {
    const s = [];
    for (let i = 0; i < N; i++) {
        if (yon === 'sol') s.push(hucre[k * N + i]);
        else if (yon === 'sag') s.push(hucre[k * N + (N - 1 - i)]);
        else if (yon === 'yukari') s.push(hucre[i * N + k]);
        else s.push(hucre[(N - 1 - i) * N + k]);
    }
    return s;
}

function siraYaz(yon, k, s) {
    for (let i = 0; i < N; i++) {
        if (yon === 'sol') hucre[k * N + i] = s[i];
        else if (yon === 'sag') hucre[k * N + (N - 1 - i)] = s[i];
        else if (yon === 'yukari') hucre[i * N + k] = s[i];
        else hucre[(N - 1 - i) * N + k] = s[i];
    }
}

function hamleVarMi() {
    if (bosIndeksler().length) return true;
    for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
            const v = hucre[r * N + c];
            if (c + 1 < N && hucre[r * N + c + 1] === v) return true;
            if (r + 1 < N && hucre[(r + 1) * N + c] === v) return true;
        }
    }
    return false;
}

function oyna(yon) {
    if (bittiMi) return;
    const once = hucre.join(',');
    for (let k = 0; k < N; k++) siraYaz(yon, k, sikistir(siraAl(yon, k)));
    if (hucre.join(',') === once) return;

    const yeni = tasEkle();
    ciz(yeni);
    cal(1.1, 0.25);

    if (!kazandiBildirildi && hucre.includes(2048)) {
        kazandiBildirildi = true;
        bitir(true);
        return;
    }
    if (!hamleVarMi()) bitir(false);
}

function unvan(enB) {
    if (enB >= 2048) return 'Efsane';
    if (enB >= 1024) return 'Çok iyi';
    if (enB >= 512) return 'İyi seviye';
    if (enB >= 256) return 'Fena değil';
    return 'Daha iyisi var';
}

function bitir(kazandi) {
    const enB = Math.max(...hucre);
    document.getElementById('sonuc-baslik').textContent = kazandi ? '2048!' : 'Hamle kalmadı';
    document.getElementById('sonuc-skor').textContent = `${skor} puan`;
    document.getElementById('sonuc-unvan').textContent = unvan(enB);
    document.getElementById('sonuc-detay').textContent =
        kazandi ? 'Hedefe ulaştın. "Devam et" ile daha yükseğe çıkabilirsin.' : `En büyük taşın ${enB} oldu.`;
    const yeni = rekorKaydet('2048', skor);
    document.getElementById('sonuc-rekor').hidden = !yeni;
    document.getElementById('devam').hidden = !kazandi;
    enIyiGoster();
    if (!kazandi) { bittiMi = true; bip(120, 0.3, 0.14, 'sawtooth'); }
    sonuc.hidden = false;
}

function yeniOyun() {
    hucre = new Array(N * N).fill(0);
    skor = 0;
    bittiMi = false;
    kazandiBildirildi = false;
    tasEkle();
    tasEkle();
    ciz();
    sonuc.hidden = true;
    enIyiGoster();
}

const TUSLAR = {
    ArrowLeft: 'sol', ArrowRight: 'sag', ArrowUp: 'yukari', ArrowDown: 'asagi',
    a: 'sol', d: 'sag', w: 'yukari', s: 'asagi'
};

window.addEventListener('keydown', e => {
    const yon = TUSLAR[e.key] || TUSLAR[e.key.toLowerCase?.()];
    if (!yon) return;
    e.preventDefault();
    oyna(yon);
}, { passive: false });

// Dokunmatik kaydırma
let bx = 0, by = 0;
tahtaEl.addEventListener('touchstart', e => {
    bx = e.changedTouches[0].clientX;
    by = e.changedTouches[0].clientY;
}, { passive: true });

tahtaEl.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - bx;
    const dy = e.changedTouches[0].clientY - by;
    if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
    oyna(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'sag' : 'sol') : (dy > 0 ? 'asagi' : 'yukari'));
}, { passive: true });

document.querySelectorAll('[data-yon]').forEach(b =>
    b.addEventListener('click', () => oyna(b.dataset.yon)));

document.getElementById('yeni').addEventListener('click', yeniOyun);
document.getElementById('tekrar').addEventListener('click', yeniOyun);
document.getElementById('devam').addEventListener('click', () => { sonuc.hidden = true; });

yeniOyun();
