// Dados das pessoas para facilitar manutenção
const family = [
	{ name: "Paula", role: "Mãe", video: "videos/paula.mp4" },
	{ name: "Joana", role: "Irmã", video: "videos/joana.mp4" },
	{ name: "Nuno", role: "Irmão", video: "videos/nuno.mp4" },
	{ name: "Sérgio", role: "Cunhado", video: "videos/sergio.mp4" },
	{ name: "Camila", role: "Sobrinha", video: "videos/camila.mp4" }
];

const stageVideo = document.getElementById("stage-video");
const stageTitle = document.getElementById("stage-title");
const stageRole = document.getElementById("stage-role");
const prevButton = document.getElementById("stage-prev");
const nextButton = document.getElementById("stage-next");
const bgCanvas = document.getElementById("bg-canvas");
const bgCtx = bgCanvas.getContext("2d");
let activeIndex = family.findIndex(p => p.name === "Camila");
let pendingPlay = false;

function getInitials(name) {
	return name
		.split(/\s+/)
		.filter(Boolean)
		.map(word => word[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

function showPerson(index) {
	activeIndex = (index + family.length) % family.length;
	const person = family[activeIndex];
	if (!person) return;

	stageTitle.textContent = person.name;
	stageRole.textContent = person.role;

	stageVideo.pause();
	stageVideo.removeAttribute("src");
	stageVideo.load();
	stageVideo.setAttribute("src", person.video);
	stageVideo.setAttribute("autoplay", "");
	stageVideo.muted = false;
	stageVideo.volume = 1;
	stageVideo.load();
	stageVideo.currentTime = 0;
	stageVideo.play().then(() => {
		pendingPlay = false;
	}).catch(() => {
		pendingPlay = true; // se o browser bloquear, tentamos novamente em canplay
	});
}

function goNext() {
	showPerson(activeIndex + 1);
}

function goPrev() {
	showPerson(activeIndex - 1);
}

prevButton.addEventListener("click", goPrev);
nextButton.addEventListener("click", goNext);

// Navegação por teclado
document.addEventListener("keydown", event => {
	if (event.key === "ArrowRight") goNext();
	if (event.key === "ArrowLeft") goPrev();
});

// Se o autoplay falhar, tenta novamente quando o vídeo estiver pronto
stageVideo.addEventListener("canplay", () => {
	if (pendingPlay || stageVideo.paused) {
		stageVideo.play().then(() => {
			pendingPlay = false;
			stageVideo.muted = false;
		}).catch(() => {
			pendingPlay = true;
		});
	}
});

// Animação de fundo foleira com corações/estrelas/fogos
const sparkleSymbols = ["❤️", "💖", "⭐", "✨", "🎇", "💫", "🎈", "🪩"];
const sparkleItems = [];
const maxSparkles = 46;
const dpr = Math.min(window.devicePixelRatio || 1, 2);

function rand(min, max) {
	return Math.random() * (max - min) + min;
}

function resizeCanvas() {
	bgCanvas.width = window.innerWidth * dpr;
	bgCanvas.height = window.innerHeight * dpr;
	bgCanvas.style.width = `${window.innerWidth}px`;
	bgCanvas.style.height = `${window.innerHeight}px`;
	bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function makeSparkle(startFromBottom = false) {
	return {
		x: rand(0, window.innerWidth),
		y: startFromBottom ? window.innerHeight + rand(0, 120) : rand(0, window.innerHeight),
		size: rand(18, 44),
		speed: rand(0.35, 1.4),
		wobble: rand(0.6, 2.4),
		angle: rand(0, Math.PI * 2),
		symbol: sparkleSymbols[Math.floor(rand(0, sparkleSymbols.length))],
		alpha: rand(0.55, 0.95)
	};
}

function initSparkles() {
	sparkleItems.length = 0;
	for (let i = 0; i < maxSparkles; i += 1) {
		sparkleItems.push(makeSparkle());
	}
}

function drawSparkles() {
	bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
	for (const s of sparkleItems) {
		s.y -= s.speed;
		s.x += Math.sin(s.angle) * s.wobble;
		s.angle += 0.012;

		if (s.y < -80 || s.x < -80 || s.x > window.innerWidth + 80) {
			Object.assign(s, makeSparkle(true));
		}

		bgCtx.globalAlpha = s.alpha;
		bgCtx.font = `${s.size}px "Comic Sans MS", "Trebuchet MS", cursive`;
		bgCtx.fillText(s.symbol, s.x, s.y);
	}

	requestAnimationFrame(drawSparkles);
}

resizeCanvas();
initSparkles();
drawSparkles();
window.addEventListener("resize", resizeCanvas);

// Inicializa página com Camila no centro
showPerson(activeIndex >= 0 ? activeIndex : 0);
