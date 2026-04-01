// ===== INTRO SEQUENCE =====
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('intro-overlay');
    const mainContent = document.getElementById('main-content');
    const lines = [
        document.getElementById('line1'),
        document.getElementById('line2'),
        document.getElementById('line3'),
        document.getElementById('line4'),
        document.getElementById('line5'),
    ];

    const schedule = [
        { show: 0, hide: 1 },    // "Bir şey olacak..."
        { show: 1, hide: 2 },    // "Hazır mısın?"
        { show: 2, hide: 3 },    // 3
        { show: 3, hide: 4 },    // 2
        { show: 4, hide: 5 },    // 1
    ];

    let delay = 500;
    schedule.forEach((s, i) => {
        setTimeout(() => {
            if (i > 0) lines[i - 1].classList.replace('show', 'hide');
            lines[i].classList.add('show');
        }, delay + s.show * 1000);
    });

    // After last countdown, fade out intro
    setTimeout(() => {
        lines[4].classList.replace('show', 'hide');
    }, delay + 5 * 1000);

    setTimeout(() => {
        overlay.classList.add('fade-out');
        mainContent.classList.remove('hidden');
        mainContent.classList.add('visible');
    }, delay + 5500);

    // Remove overlay from DOM after transition
    setTimeout(() => {
        overlay.remove();
    }, delay + 6500);
});

// ===== PARTICLE SYSTEM =====
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 3;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.015;
        this.size = Math.random() * 6 + 2;
        const colors = ['#ff2d95', '#00f0ff', '#b829dd', '#39ff14', '#ffdd00'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.gravity = 0.08;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.vx *= 0.99;
        this.life -= this.decay;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function spawnParticles(x, y, count = 50) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y));
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateParticles);
}
animateParticles();

// ===== SOUND + PITCH SYSTEM (WEB AUDIO API - ZERO LATENCY) =====
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;
let audioBuffer = null;

// AudioContext oluştur ve dosyayı belleğe yükle
function initAudio() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    fetch('aminake.mp3')
        .then(response => response.arrayBuffer())
        .then(data => audioCtx.decodeAudioData(data))
        .then(buffer => {
            audioBuffer = buffer;
            console.log('✅ aminake.mp3 belleğe yüklendi (0 Gecikme)');
        })
        .catch(err => console.log('⚠️ Ses yüklenemedi:', err));
}
// Sayfa açıldığında çekmeye başla
initAudio();

let currentPitch = 1.0;
const PITCH_INCREMENT = 0.15;
const MAX_PITCH = 3.5;

let countdownInterval = null;
let remainingResetTime = 0;
const pitchTimerEl = document.getElementById('pitch-timer');
const pitchTimeSpan = document.getElementById('pitch-time');

function resetPitch() {
    pitchTimerEl.classList.add('hidden');
    const resetInterval = setInterval(() => {
        currentPitch -= 0.05;
        if (currentPitch <= 1.0) {
            currentPitch = 1.0;
            clearInterval(resetInterval);
        }
    }, 30);
}

function playSound() {
    // İlk tıklamada AudioContext başlatılıyorsa resume et (Tarayıcı politikaları)
    if (!audioCtx) initAudio();
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    currentPitch = Math.min(currentPitch + PITCH_INCREMENT, MAX_PITCH);

    if (countdownInterval) clearInterval(countdownInterval);
    
    if (currentPitch > 1.05) { 
        pitchTimerEl.classList.remove('hidden');
        remainingResetTime = 3;
        pitchTimeSpan.textContent = remainingResetTime;
        
        countdownInterval = setInterval(() => {
            remainingResetTime--;
            if (remainingResetTime > 0) {
                pitchTimeSpan.textContent = remainingResetTime;
            } else {
                clearInterval(countdownInterval);
                resetPitch();
            }
        }, 1000);
    }

    // Gecikmesiz çalma!
    if (audioBuffer && audioCtx) {
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.playbackRate.value = currentPitch;
        source.connect(audioCtx.destination);
        source.start(0);
    } else {
        playSynthFallback();
    }
}

// Fallback sentez ses (mp3 yoksa)
function playSynthFallback() {
    if (!audioCtx) initAudio();
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const p = currentPitch;

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120 * p, now);
    osc.frequency.exponentialRampToValueAtTime(60 * p, now + 0.4 / p);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5 / p);
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start(now);
    osc.stop(now + 0.5 / p);
}

// ===== COUNTER (localStorage) =====
const counterEl = document.getElementById('counter-value');
const counterContainer = document.getElementById('counter-container');
let clickCount = parseInt(localStorage.getItem('aminake-count') || '0', 10);
counterEl.textContent = clickCount.toLocaleString('tr-TR');

function incrementCounter() {
    clickCount++;
    localStorage.setItem('aminake-count', clickCount);
    counterEl.textContent = clickCount.toLocaleString('tr-TR');

    // Bump animation
    counterContainer.classList.remove('bump');
    void counterContainer.offsetWidth; // force reflow
    counterContainer.classList.add('bump');
}

// ===== SCREEN SHAKE =====
function shakeScreen() {
    document.body.classList.remove('shake');
    void document.body.offsetWidth;
    document.body.classList.add('shake');
    setTimeout(() => document.body.classList.remove('shake'), 500);
}

// ===== FLASH EFFECT =====
function flashScreen() {
    const flash = document.createElement('div');
    flash.className = 'flash-overlay';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 500);
}

// ===== FLOATING TEXT =====
const floatingTexts = [
    'AMINAKE!', 'OOFFF', 'SÖYLEDİM Bİ DE YA!', 'EVRİMMİŞ',
    'İNANAMIYORUM!', 'PATLADI!', 'AHAHAHAHA', 'YOK ARTIK!',
    'GÜMBÜR!', '🤯', 'DAYIII!', 'HAYDAAA'
];

function spawnFloatingText(x, y) {
    const el = document.createElement('div');
    el.className = 'floating-text';
    el.textContent = floatingTexts[Math.floor(Math.random() * floatingTexts.length)];
    el.style.left = (x + (Math.random() - 0.5) * 100) + 'px';
    el.style.top = (y - 30) + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1500);
}

// ===== RANDOM BG COLOR FLASH =====
function flashBgColor() {
    const colors = [
        'radial-gradient(circle at center, rgba(255,45,149,0.15), transparent 70%)',
        'radial-gradient(circle at center, rgba(0,240,255,0.15), transparent 70%)',
        'radial-gradient(circle at center, rgba(184,41,221,0.15), transparent 70%)',
        'radial-gradient(circle at center, rgba(57,255,20,0.15), transparent 70%)',
    ];
    const bg = colors[Math.floor(Math.random() * colors.length)];
    document.body.style.background = bg + ', var(--dark-bg)';
    setTimeout(() => {
        document.body.style.background = 'var(--dark-bg)';
    }, 300);
}

// ===== VADAA CHARACTERS =====
function spawnVada() {
    const el = document.createElement('img');
    el.src = 'vada.png';
    el.className = 'vada-character';

    // Vary the speed, size, and vertical position a bit
    const duration = 2.5 + Math.random() * 3; // 2.5s to 5.5s
    const width = 80 + Math.random() * 100; // 80px to 180px
    const bottomPos = 1 + Math.random() * 20; // randomly between 1% and 21% from bottom

    el.style.animationDuration = `${duration}s, 0.3s`;
    el.style.width = `${width}px`;
    el.style.bottom = `${bottomPos}%`;

    // Randomize whether it bounces in sync or differently
    el.style.animationDelay = `0s, ${Math.random() * 0.3}s`;

    document.body.appendChild(el);
    setTimeout(() => el.remove(), duration * 1000);
}

// Periodically spawn a vadaa randomly
setInterval(() => {
    if (Math.random() > 0.6) {
        spawnVada();
    }
}, 2000);

// ===== MAIN BUTTON CLICK =====
const btn = document.getElementById('aminake-btn');

btn.addEventListener('click', (e) => {
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    // All the effects!
    playSound();
    shakeScreen();
    flashScreen();
    flashBgColor();
    spawnParticles(cx, cy, 60);
    spawnFloatingText(cx, cy);
    incrementCounter();
    spawnVada(); // Spawn a Vada on every click!

    // Extra particles from random spots for chaos
    for (let i = 0; i < 2; i++) {
        setTimeout(() => {
            spawnParticles(
                Math.random() * window.innerWidth,
                Math.random() * window.innerHeight,
                20
            );
        }, i * 100);
    }
});

// Allow rapid clicking
btn.addEventListener('mousedown', (e) => e.preventDefault());
