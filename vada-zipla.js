import { cal, bip, rekorOku, rekorKaydet } from '/assets/ortak.js';

const tuval = document.getElementById('tuval');
const c = tuval.getContext('2d');
const puanEl = document.getElementById('puan');
const rekorEl = document.getElementById('rekor');
const giris = document.getElementById('giris');
const sonuc = document.getElementById('sonuc');
const sonucPuan = document.getElementById('sonuc-puan');
const sonucRekor = document.getElementById('sonuc-rekor');

// Oyun dünyası sabit 800x300 birim; tuval ekrana göre ölçeklenir
// Dar ekranlarda dünya daralır, böylece her şey telefonda da büyük görünür
let G = 800;
const Y = 300, ZEMIN = 250;
const vadaResim = new Image();
vadaResim.src = '/vada.webp';

let olcek = 1;
function boyutla() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = tuval.clientWidth;
    G = w < 600 ? 520 : 800;
    olcek = w / G;
    tuval.width = Math.round(w * dpr);
    tuval.height = Math.round(Y * olcek * dpr);
    c.setTransform(olcek * dpr, 0, 0, olcek * dpr, 0, 0);
    if (!oyunda) ciz();
}

const vada = { x: 90, y: ZEMIN, vy: 0, w: 54, h: 54, yerde: true };
let engeller = [];
let yildizlar = [];
let hiz, mesafe, sonrakiEngel, oyunda = false, son = 0, raf = 0, zipBasili = false;

function rekorYaz() {
    const r = rekorOku('vada-zipla');
    rekorEl.textContent = r === null ? '—' : r;
}

function sifirla() {
    vada.y = ZEMIN; vada.vy = 0; vada.yerde = true;
    engeller = [];
    hiz = 330;
    mesafe = 0;
    sonrakiEngel = 500;
    yildizlar = Array.from({ length: 28 }, () => ({ x: Math.random() * G, y: Math.random() * 190, r: Math.random() * 1.6 + 0.4 }));
}

function zipla() {
    if (!oyunda) return;
    if (vada.yerde) {
        vada.vy = -760;
        vada.yerde = false;
        bip(520, 0.08, 0.12);
    }
}

function engelEkle() {
    const tip = Math.random();
    if (mesafe > 1500 && tip < 0.22) {
        // Havada uçan hoparlör: altından geçilmez, üstünden atlanır
        engeller.push({ x: G + 20, y: ZEMIN - 34, w: 34, h: 34, tur: 'kutu' });
    } else if (mesafe > 800 && tip < 0.45) {
        engeller.push({ x: G + 20, y: ZEMIN, w: 22, h: 46, tur: 'direk' });
        engeller.push({ x: G + 50, y: ZEMIN, w: 22, h: 34, tur: 'direk' });
    } else {
        const h = 30 + Math.random() * 28;
        engeller.push({ x: G + 20, y: ZEMIN, w: 24, h, tur: 'direk' });
    }
}

function guncelle(dt) {
    hiz = Math.min(330 + mesafe * 0.06, 720);
    mesafe += hiz * dt / 10;

    // Yerçekimi: tuş basılı tutulursa daha yükseğe zıplar
    const yercekimi = zipBasili && vada.vy < 0 ? 1700 : 2900;
    vada.vy += yercekimi * dt;
    vada.y += vada.vy * dt;
    if (vada.y >= ZEMIN) { vada.y = ZEMIN; vada.vy = 0; vada.yerde = true; }

    engeller.forEach(e => e.x -= hiz * dt);
    engeller = engeller.filter(e => e.x + e.w > -20);

    sonrakiEngel -= hiz * dt;
    if (sonrakiEngel <= 0) {
        engelEkle();
        sonrakiEngel = 260 + Math.random() * 320 + hiz * 0.35;
    }

    yildizlar.forEach(s => { s.x -= hiz * dt * 0.08; if (s.x < 0) s.x += G; });

    // Çarpışma (hitbox biraz küçük tutuldu, adil olsun diye)
    const vx = vada.x + 10, vy = vada.y - vada.h + 8, vw = vada.w - 20, vh = vada.h - 12;
    for (const e of engeller) {
        if (vx < e.x + e.w && vx + vw > e.x && vy < e.y && vy + vh > e.y - e.h) return bitir();
    }

    const p = Math.floor(mesafe / 10);
    if (p > 0 && p % 100 === 0 && p !== guncelle.sonBip) { guncelle.sonBip = p; cal(1.5, 0.35); }
    puanEl.textContent = p;
}

function ciz() {
    c.clearRect(0, 0, G, Y);
    c.fillStyle = 'rgba(255,255,255,0.6)';
    yildizlar.forEach(s => { c.beginPath(); c.arc(s.x, s.y, s.r, 0, 7); c.fill(); });

    // Zemin
    c.strokeStyle = '#9b51e0';
    c.lineWidth = 2;
    c.shadowColor = '#9b51e0';
    c.shadowBlur = 12;
    c.beginPath(); c.moveTo(0, ZEMIN + 1); c.lineTo(G, ZEMIN + 1); c.stroke();
    c.shadowBlur = 0;
    c.strokeStyle = 'rgba(155,81,224,0.25)';
    c.lineWidth = 1;
    const kayma = (mesafe * 10) % 40;
    for (let x = -kayma; x < G; x += 40) { c.beginPath(); c.moveTo(x, ZEMIN + 1); c.lineTo(x - 30, Y); c.stroke(); }

    // Engeller
    engeller.forEach(e => {
        c.fillStyle = e.tur === 'kutu' ? '#ffd700' : '#00f0ff';
        c.shadowColor = c.fillStyle;
        c.shadowBlur = 14;
        if (e.tur === 'kutu') {
            c.fillRect(e.x, e.y - e.h, e.w, e.h);
            c.shadowBlur = 0;
            c.fillStyle = '#120c1b';
            c.beginPath(); c.arc(e.x + e.w / 2, e.y - e.h / 2, 9, 0, 7); c.fill();
        } else {
            c.fillRect(e.x, e.y - e.h, e.w, e.h);
        }
        c.shadowBlur = 0;
    });

    // Vada
    const egim = vada.yerde ? Math.sin(mesafe / 3) * 0.06 : Math.max(-0.35, Math.min(0.35, vada.vy / 2400));
    c.save();
    c.translate(vada.x + vada.w / 2, vada.y - vada.h / 2);
    c.rotate(egim);
    if (vadaResim.complete && vadaResim.naturalWidth) {
        c.drawImage(vadaResim, -vada.w / 2 - 6, -vada.h / 2 - 8, vada.w + 12, vada.h + 12);
    } else {
        c.fillStyle = '#9b51e0';
        c.fillRect(-vada.w / 2, -vada.h / 2, vada.w, vada.h);
    }
    c.restore();
}

function dongu(t) {
    const dt = Math.min((t - son) / 1000, 0.034);
    son = t;
    guncelle(dt);
    ciz();
    if (oyunda) raf = requestAnimationFrame(dongu);
}

function basla() {
    sifirla();
    guncelle.sonBip = 0;
    giris.hidden = true;
    sonuc.hidden = true;
    oyunda = true;
    son = performance.now();
    raf = requestAnimationFrame(dongu);
    tuval.focus();
}

function bitir() {
    oyunda = false;
    cancelAnimationFrame(raf);
    ciz();
    const p = Math.floor(mesafe / 10);
    const yeni = rekorKaydet('vada-zipla', p);
    sonucPuan.textContent = p;
    sonucRekor.hidden = !yeni;
    sonuc.hidden = false;
    rekorYaz();
    cal(0.7);
    document.getElementById('tekrar').focus();
}

const sahne = document.getElementById('sahne');
sahne.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
    e.preventDefault();
    zipBasili = true;
    zipla();
});
window.addEventListener('pointerup', () => zipBasili = false);
window.addEventListener('keydown', e => {
    if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') {
        if (oyunda) e.preventDefault();
        if (!e.repeat) { zipBasili = true; zipla(); }
    }
});
window.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') zipBasili = false; });

document.getElementById('basla').addEventListener('click', basla);
document.getElementById('tekrar').addEventListener('click', basla);
window.addEventListener('resize', boyutla);
vadaResim.onload = () => { if (!oyunda) ciz(); };

sifirla();
rekorYaz();
boyutla();
