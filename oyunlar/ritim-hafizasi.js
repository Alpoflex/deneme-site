import { cal, bip, rekorOku, rekorKaydet } from '/assets/ortak.js';

const PERDELER = [0.75, 1, 1.3, 1.7];
const pedlar = [...document.querySelectorAll('.ped')];
const seviyeEl = document.getElementById('seviye');
const rekorEl = document.getElementById('rekor');
const mesaj = document.getElementById('mesaj');
const giris = document.getElementById('giris');
const sonuc = document.getElementById('sonuc');
const sonucSeviye = document.getElementById('sonuc-seviye');
const sonucRekor = document.getElementById('sonuc-rekor');

let dizi = [];
let sira = 0;
let dinliyor = false;

const bekle = ms => new Promise(r => setTimeout(r, ms));

function rekorYaz() {
    const r = rekorOku('ritim');
    rekorEl.textContent = r === null ? '—' : r;
}

function yak(i, ms = 320) {
    const p = pedlar[i];
    p.classList.add('yanik');
    cal(PERDELER[i], 0.8);
    setTimeout(() => p.classList.remove('yanik'), ms);
}

async function sirayiCal() {
    dinliyor = false;
    pedlar.forEach(p => p.disabled = true);
    mesaj.textContent = 'Dinle…';
    await bekle(650);
    // Seviye arttıkça tempo hızlanır
    const aralik = Math.max(260, 620 - dizi.length * 25);
    for (const i of dizi) {
        yak(i, aralik * 0.6);
        await bekle(aralik);
    }
    sira = 0;
    dinliyor = true;
    pedlar.forEach(p => p.disabled = false);
    mesaj.textContent = 'Senin sıran';
}

function yeniTur() {
    dizi.push(Math.floor(Math.random() * 4));
    seviyeEl.textContent = dizi.length;
    sirayiCal();
}

function bas(i) {
    if (!dinliyor) return;
    yak(i, 200);
    if (i !== dizi[sira]) return yanlis();
    sira++;
    if (sira === dizi.length) {
        dinliyor = false;
        mesaj.textContent = 'Doğru!';
        setTimeout(yeniTur, 500);
    }
}

function yanlis() {
    dinliyor = false;
    pedlar.forEach(p => p.disabled = true);
    bip(80, 0.5, 0.35, 'sawtooth');
    const ulasilan = dizi.length - 1;
    const yeni = rekorKaydet('ritim', ulasilan);
    sonucSeviye.textContent = ulasilan;
    sonucRekor.hidden = !yeni;
    sonuc.hidden = false;
    rekorYaz();
    document.getElementById('tekrar').focus();
}

function basla() {
    dizi = [];
    giris.hidden = true;
    sonuc.hidden = true;
    yeniTur();
}

pedlar.forEach((p, i) => p.addEventListener('pointerdown', e => { e.preventDefault(); bas(i); }));
const TUS = { '1': 0, '2': 1, '3': 2, '4': 3, 'ArrowUp': 0, 'ArrowRight': 1, 'ArrowDown': 2, 'ArrowLeft': 3 };
window.addEventListener('keydown', e => {
    if (e.key in TUS && !e.repeat) { e.preventDefault(); bas(TUS[e.key]); }
});

document.getElementById('basla').addEventListener('click', basla);
document.getElementById('tekrar').addEventListener('click', basla);
pedlar.forEach(p => p.disabled = true);
rekorYaz();
