import { cal, rekorOku, rekorKaydet } from '/assets/ortak.js';

const btn = document.getElementById('tik');
const kalanEl = document.getElementById('kalan');
const tikEl = document.getElementById('tiklar');
const rekorEl = document.getElementById('rekor');
const sonuc = document.getElementById('sonuc');
const sonucCps = document.getElementById('sonuc-cps');
const sonucUnvan = document.getElementById('sonuc-unvan');
const sonucDetay = document.getElementById('sonuc-detay');
const sonucRekor = document.getElementById('sonuc-rekor');
const tekrar = document.getElementById('tekrar');
const sureBtnler = document.querySelectorAll('[data-sure]');

let sure = 5;
let tiklar = 0;
let baslangic = 0;
let calisiyor = false;
let bitti = false;
let raf = 0;

const anahtar = () => `cps-${sure}`;

function rekorYaz() {
    const r = rekorOku(anahtar());
    rekorEl.textContent = r === null ? '—' : r.toFixed(1);
}

function sifirla() {
    cancelAnimationFrame(raf);
    tiklar = 0;
    calisiyor = false;
    bitti = false;
    kalanEl.textContent = sure.toFixed(1);
    tikEl.textContent = '0';
    btn.querySelector('.ust').textContent = 'BAŞLA';
    btn.querySelector('.alt').textContent = 'ilk tık süreyi başlatır';
    sonuc.hidden = true;
    rekorYaz();
}

function unvan(cps) {
    if (cps >= 14) return ['🤖 Makine', 'Bu hız insanüstü. Otomatik tıklayıcı mı var yoksa?'];
    if (cps >= 10) return ['⚡ Şimşek', 'Çok az kişi bu hıza çıkabiliyor.'];
    if (cps >= 8) return ['🔥 Ateşli parmak', 'Ortalamanın epey üstündesin.'];
    if (cps >= 6) return ['👍 Sağlam', 'Ortalama bir oyuncudan hızlısın.'];
    if (cps >= 4) return ['🙂 Normal', 'Çoğu insan bu aralıkta.'];
    return ['🐢 Kaplumbağa', 'Isınma turuydu, tekrar dene.'];
}

function dongu() {
    const gecen = (performance.now() - baslangic) / 1000;
    const kalan = Math.max(0, sure - gecen);
    kalanEl.textContent = kalan.toFixed(1);
    if (kalan <= 0) return bitir();
    raf = requestAnimationFrame(dongu);
}

function bitir() {
    calisiyor = false;
    bitti = true;
    const cps = tiklar / sure;
    const [u, d] = unvan(cps);
    const yeni = rekorKaydet(anahtar(), Math.round(cps * 10) / 10);
    sonucCps.textContent = `${cps.toFixed(1)} CPS`;
    sonucUnvan.textContent = u;
    sonucDetay.textContent = `${sure} saniyede ${tiklar} tık. ${d}`;
    sonucRekor.hidden = !yeni;
    sonuc.hidden = false;
    rekorYaz();
    cal(0.8);
    tekrar.focus();
}

function tikla(e) {
    if (e) e.preventDefault();
    if (bitti) return;
    if (!calisiyor) {
        calisiyor = true;
        baslangic = performance.now();
        btn.querySelector('.alt').textContent = 'bas bas bas';
        raf = requestAnimationFrame(dongu);
    }
    tiklar++;
    tikEl.textContent = tiklar;
    btn.querySelector('.ust').textContent = tiklar;
    cal(Math.min(1 + tiklar * 0.03, 3), 0.55);
    btn.classList.remove('vur');
    void btn.offsetWidth;
    btn.classList.add('vur');
}

// pointerdown, click'ten daha hızlı tepki verir
btn.addEventListener('pointerdown', tikla);
btn.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) tikla(e); });
btn.addEventListener('click', e => e.preventDefault());

sureBtnler.forEach(b => b.addEventListener('click', () => {
    sure = Number(b.dataset.sure);
    sureBtnler.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    sifirla();
}));

tekrar.addEventListener('click', () => { sifirla(); btn.focus(); });
sifirla();
