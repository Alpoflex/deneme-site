// ===== Yazma Hızı Testi (WPM) =====
import { bip, rekorKaydet, rekorOku } from '/assets/ortak.js';

const METINLER = [
    'Sabah erken kalkıp pencereyi açtığında şehrin henüz uyanmadığını fark etti. Sokak lambaları hâlâ yanıyordu ve kaldırımlar ıslaktı. Bir fincan kahve koydu, masaya oturdu ve gün boyunca yapması gerekenleri tek tek yazdı. Liste uzundu ama hiçbiri acele etmesini gerektirmiyordu.',
    'Klavyede hızlı yazmanın sırrı parmakları doğru tuşlara yerleştirmekten geçer. Sol elin parmakları fileci tuşlarına, sağ elin parmakları ise diğer yarıya oturur. Başlangıçta yavaş gitmek canını sıkabilir ama kasların alışması için sabır gerekir. Birkaç hafta sonra ellerine bakmadan yazdığını göreceksin.',
    'Deniz kıyısındaki küçük kasabada herkes birbirini tanırdı. Balıkçılar sabahın ilk ışıklarıyla açılır, öğlene doğru ağlarını dolu getirirlerdi. Çocuklar iskelenin ucunda oturup ayaklarını suya sarkıtır, geçen tekneleri sayarlardı. Yaz bitince kasaba yeniden sessizliğine gömülürdü.',
    'Bilgisayarın hafızası iki ana parçadan oluşur. Geçici hafıza çalışırken kullanılan verileri tutar ve cihaz kapandığında içeriği silinir. Kalıcı depolama ise dosyaları elektrik gitse bile korur. Bir programı açtığında dosyalar kalıcı depolamadan okunup geçici hafızaya taşınır, bu yüzden ilk açılış biraz daha uzun sürer.',
    'Yürüyüş yapmak için özel bir ekipmana ihtiyacın yok. Rahat bir ayakkabı, bir şişe su ve biraz zaman yeterli. Düzenli yürüyen insanların uyku kalitesi artar, gün içindeki gerginlikleri azalır. Önemli olan tempoyu abartmadan, konuşabilecek kadar rahat bir hızda ilerlemektir.'
];

const metinEl = document.getElementById('metin');
const giris = document.getElementById('giris');
const oKalan = document.getElementById('kalan');
const oWpm = document.getElementById('wpm');
const oDogruluk = document.getElementById('dogruluk');
const oRekor = document.getElementById('rekor');
const basla = document.getElementById('basla');
const sonuc = document.getElementById('sonuc');

let sure = 60;
let metin = '';
let harfler = [];
let kalan = 0;
let sayac = null;
let basladiMi = false;
let baslangicAni = 0;
let bitti = false;
let enCokYazilan = 0;

function anahtar() { return `yazma-${sure}`; }

function rekorGoster() {
    const r = rekorOku(anahtar());
    oRekor.textContent = r === null ? '—' : `${r} WPM`;
}

function metinKur() {
    metin = METINLER[Math.floor(Math.random() * METINLER.length)];
    metinEl.innerHTML = '';
    harfler = [...metin].map(h => {
        const s = document.createElement('span');
        // Boşluklarda satır kırılmasın diye normal boşluk bırakıyoruz
        s.textContent = h;
        metinEl.appendChild(s);
        return s;
    });
    if (harfler[0]) harfler[0].className = 'simdi';
}

function hazirla() {
    sure = Number(document.querySelector('[data-sure][aria-pressed="true"]').dataset.sure);
    clearInterval(sayac);
    basladiMi = false;
    bitti = false;
    kalan = sure;
    enCokYazilan = 0;
    giris.value = '';
    giris.disabled = false;
    oKalan.textContent = kalan;
    oWpm.textContent = '0';
    oDogruluk.textContent = '—';
    metinKur();
    rekorGoster();
}

function baslat() {
    hazirla();
    basla.hidden = true;
    sonuc.hidden = true;
    giris.focus();
}

function olc() {
    const yazilan = giris.value;
    let dogru = 0;
    harfler.forEach((s, i) => {
        const h = yazilan[i];
        s.className = h === undefined ? '' : (h === metin[i] ? 'dogru' : 'yanlis');
        if (h !== undefined && h === metin[i]) dogru++;
    });
    const imlec = harfler[yazilan.length];
    if (imlec) imlec.className = 'simdi';
    enCokYazilan = Math.max(enCokYazilan, yazilan.length);
    // Geçen süreyi gerçek saatten al; sayaç tam saniyelerle ilerlediği için
    // tek başına kullanıldığında WPM kaba çıkıyor.
    const gecen = Math.min(sure, Math.max(0.5, (performance.now() - baslangicAni) / 1000));
    const wpm = Math.round((dogru / 5) / (gecen / 60));
    oWpm.textContent = wpm;
    oDogruluk.textContent = yazilan.length ? `%${Math.round((dogru / yazilan.length) * 100)}` : '—';
    return { dogru, yazilan: yazilan.length, wpm };
}

function unvan(w) {
    if (w >= 80) return 'Profesyonel';
    if (w >= 60) return 'Çok hızlı';
    if (w >= 40) return 'İyi seviye';
    if (w >= 25) return 'Ortalama';
    return 'Yeni başlıyorsun';
}

function bitir() {
    bitti = true;
    clearInterval(sayac);
    giris.disabled = true;
    const { dogru, yazilan, wpm } = olc();
    const dogruluk = yazilan ? Math.round((dogru / yazilan) * 100) : 0;
    document.getElementById('sonuc-wpm').textContent = `${wpm} WPM`;
    document.getElementById('sonuc-unvan').textContent = unvan(wpm);
    document.getElementById('sonuc-detay').textContent =
        `${dogru} doğru karakter · doğruluk %${dogruluk} · ${sure} saniye`;
    const yeni = rekorKaydet(anahtar(), wpm);
    document.getElementById('sonuc-rekor').hidden = !yeni;
    rekorGoster();
    sonuc.hidden = false;
}

giris.addEventListener('input', () => {
    if (bitti) return;
    if (!basladiMi) {
        basladiMi = true;
        baslangicAni = performance.now();
        sayac = setInterval(() => {
            kalan--;
            oKalan.textContent = kalan;
            if (kalan <= 3 && kalan > 0) bip(660, 0.06, 0.1);
            if (kalan <= 0) bitir();
        }, 1000);
    }
    olc();
    // Metnin sonuna gelindiyse erken bitir
    if (giris.value.length >= metin.length) bitir();
});

giris.addEventListener('paste', e => e.preventDefault());

document.getElementById('baslat').addEventListener('click', baslat);
document.getElementById('tekrar').addEventListener('click', baslat);
document.querySelectorAll('[data-sure]').forEach(b => {
    b.addEventListener('click', () => {
        document.querySelectorAll('[data-sure]').forEach(x => x.setAttribute('aria-pressed', 'false'));
        b.setAttribute('aria-pressed', 'true');
        hazirla();
        // Başlangıç ekranı hâlâ duruyorsa kutu kapalı kalsın
        if (!basla.hidden) giris.disabled = true;
    });
});

hazirla();
giris.disabled = true;
