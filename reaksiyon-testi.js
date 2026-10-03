import { cal, bip, rekorOku, rekorKaydet } from '/assets/ortak.js';

const TUR = 5;
const alan = document.getElementById('alan');
const baslik = document.getElementById('alan-baslik');
const aciklama = document.getElementById('alan-aciklama');
const turEl = document.getElementById('tur');
const sonEl = document.getElementById('son');
const rekorEl = document.getElementById('rekor');
const listeEl = document.getElementById('sureler');

// durumlar: hazir, bekle, simdi, sonuc, erken, bitti
let durum = 'hazir';
let zamanlayici = 0;
let yesilAni = 0;
let sureler = [];

function rekorYaz() {
    const r = rekorOku('reaksiyon');
    rekorEl.textContent = r === null ? '—' : `${r} ms`;
}

function goster(sinif, b, a) {
    alan.dataset.durum = sinif;
    baslik.textContent = b;
    aciklama.textContent = a;
}

function listeYaz() {
    listeEl.innerHTML = '';
    sureler.forEach((s, i) => {
        const li = document.createElement('li');
        li.textContent = `${i + 1}. tur: ${s} ms`;
        listeEl.appendChild(li);
    });
}

function turBaslat() {
    durum = 'bekle';
    turEl.textContent = `${sureler.length + 1}/${TUR}`;
    goster('bekle', 'Bekle…', 'Ekran yeşile dönünce bas.');
    const bekleme = 1200 + Math.random() * 2800;
    zamanlayici = setTimeout(() => {
        durum = 'simdi';
        yesilAni = performance.now();
        goster('simdi', 'ŞİMDİ!', '');
    }, bekleme);
}

function etkilesim() {
    switch (durum) {
        case 'hazir':
        case 'bitti':
            sureler = [];
            listeYaz();
            sonEl.textContent = '—';
            turBaslat();
            break;
        case 'bekle':
            clearTimeout(zamanlayici);
            durum = 'erken';
            bip(110, 0.25, 0.25, 'sawtooth');
            goster('erken', 'Erken bastın', 'Bu tur sayılmadı. Tekrar denemek için dokun.');
            break;
        case 'erken':
            turBaslat();
            break;
        case 'simdi': {
            const ms = Math.round(performance.now() - yesilAni);
            sureler.push(ms);
            sonEl.textContent = `${ms} ms`;
            listeYaz();
            cal(ms < 250 ? 1.4 : 1, 0.7);
            if (sureler.length >= TUR) {
                bitir();
            } else {
                durum = 'sonuc';
                goster('sonuc', `${ms} ms`, 'Sonraki tur için dokun.');
            }
            break;
        }
        case 'sonuc':
            turBaslat();
            break;
    }
}

function yorum(ort) {
    if (ort < 200) return 'Pilot refleksi. İnanılmaz hızlı.';
    if (ort < 250) return 'Ortalamanın üstünde, çok iyi.';
    if (ort < 300) return 'Tam ortalama bir insan refleksi.';
    if (ort < 400) return 'Biraz yavaş. Uykun mu var?';
    return 'Telefon mu çaldı arada?';
}

function bitir() {
    durum = 'bitti';
    const ort = Math.round(sureler.reduce((a, b) => a + b, 0) / sureler.length);
    const yeni = rekorKaydet('reaksiyon', ort, true);
    goster('bitti', `Ortalama ${ort} ms`, `${yorum(ort)}${yeni ? ' Yeni rekor!' : ''} Tekrar oynamak için dokun.`);
    turEl.textContent = `${TUR}/${TUR}`;
    rekorYaz();
}

alan.addEventListener('pointerdown', e => { e.preventDefault(); etkilesim(); });
alan.addEventListener('keydown', e => {
    if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); etkilesim(); }
});

rekorYaz();
goster('hazir', 'Başlamak için dokun', `${TUR} tur oynanır, ortalaman hesaplanır. Klavyede boşluk tuşu da çalışır.`);
