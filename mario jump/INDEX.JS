const mario = document.getElementById('mario');
const obstaculos = document.getElementById('obstaculos');
const nuvens = document.getElementById('nuvens');
const btnIniciar = document.getElementById('btnIniciar');
const telaAbertura = document.getElementById('telaAbertura');
const telaFinal = document.getElementById('telaFinal');
const btnReiniciar = document.getElementById('btnReiniciar');
const scoreEl = document.getElementById('score');
const scoreFinalEl = document.getElementById('scoreFinal');
const recordeEl = document.getElementById('recorde'); 
const moeda = document.getElementById('moeda');

let loop;             
let scoreInterval;    
let score = 0;
let gameRunning = false;
let recorde = 0;

let tiroAtivo = false;  

function carregarRecorde() {
  const recordeSalvo = localStorage.getItem('recordeSuperMarioJump');
  return recordeSalvo ? Number(recordeSalvo) : 0;
}

function salvarRecorde(novoRecorde) {
  localStorage.setItem('recordeSuperMarioJump', novoRecorde);
}

function atualizarRecordeNaTela(recorde) {
  recordeEl.textContent = `Recorde: ${recorde}`;
}

function updateScoreDisplay() {
  scoreEl.textContent = score;
}

function pulo() {
  if (!gameRunning) return;
  if (mario.classList.contains('pulo')) return;
  mario.classList.add('pulo');
  setTimeout(() => mario.classList.remove('pulo'), 500);
}

function criarTiro() {
  if (tiroAtivo) return; 

  tiroAtivo = true;
  const tiro = document.createElement('div');
  tiro.classList.add('tiro');

  const marioBottom = window.getComputedStyle(mario).bottom;
  tiro.style.bottom = marioBottom;

  const marioLeft = mario.offsetLeft + 80; 
  tiro.style.left = marioLeft + 'px';

  document.querySelector('.jogo').appendChild(tiro);

  const intervaloColisao = setInterval(() => {
    const tiroRect = tiro.getBoundingClientRect();
    const moedaRect = moeda.getBoundingClientRect();

    if (
      tiroRect.left + tiroRect.width > moedaRect.left &&
      tiroRect.left < moedaRect.right &&
      tiroRect.top + tiroRect.height > moedaRect.top &&
      tiroRect.top < moedaRect.bottom &&
      moeda.style.opacity !== '0'
    ) {
      score += 50;
      updateScoreDisplay();

      moeda.style.opacity = '0';

      clearInterval(intervaloColisao);
      tiro.remove();
      tiroAtivo = false;

      setTimeout(() => {
        moeda.style.opacity = '1';
      }, 10000);
    }
  }, 20);

  tiro.animate(
    [
      { transform: 'translateX(0)' },
      { transform: 'translateX(350px)' }
    ],
    {
      duration: 400,
      fill: 'forwards',
      easing: 'linear',
    }
  );

  setTimeout(() => {
    if (tiro) tiro.remove();
    clearInterval(intervaloColisao);
    tiroAtivo = false;
  }, 400);
}

function iniciarJogo() {
  if (gameRunning) return;
  gameRunning = true;
  score = 0;
  updateScoreDisplay();

  telaAbertura.style.display = 'none';
  telaAbertura.setAttribute('aria-hidden','true');

  telaFinal.style.display = 'none';
  telaFinal.setAttribute('aria-hidden','true');

  obstaculos.style.animation = 'obstaculos 0.6s infinite linear';
  obstaculos.style.animationPlayState = 'running';

  nuvens.style.animation = 'nuvens 18s infinite linear';
  nuvens.style.animationPlayState = 'running';

  moeda.style.opacity = '1';

  recorde = carregarRecorde();
  atualizarRecordeNaTela(recorde);

  loop = setInterval(() => {
    const tuboposi = obstaculos.offsetLeft;
    const marioposi = +window.getComputedStyle(mario).bottom.replace('px','');

    if (tuboposi <= 130 && tuboposi > 0 && marioposi < 70) {
      gameOver(tuboposi, marioposi);
    }
  }, 10);

  scoreInterval = setInterval(() => {
    score++;
    updateScoreDisplay();
  }, 150);
}

function gameOver(tuboposi, marioposi) {
  clearInterval(loop);
  clearInterval(scoreInterval);
  gameRunning = false;

  obstaculos.style.animationPlayState = 'paused';
  obstaculos.style.left = `${tuboposi}px`;

  nuvens.style.animationPlayState = 'paused';

  mario.classList.remove('pulo');
  mario.style.bottom = `${marioposi}px`;
  mario.style.animationPlayState = 'paused';

  mario.src ='img/1000074723.png'
  mario.style.width = '130px';
  mario.style.left = '55px';

  moeda.style.opacity = '0';

  if(score > recorde) {
    recorde = score;
    salvarRecorde(recorde);
    atualizarRecordeNaTela(recorde);
  }

  scoreFinalEl.textContent = score;
  telaFinal.style.display = 'flex';
  telaFinal.setAttribute('aria-hidden','false');
}

function reiniciarJogo() {
  telaFinal.style.display = 'none';
  telaFinal.setAttribute('aria-hidden','true');

  mario.src = 'img/5.png';
  mario.style.width = '100px';
  mario.style.left = '50px';
  mario.style.bottom = '0';
  mario.style.animationPlayState = '';

  obstaculos.style.animation = 'none';
  obstaculos.offsetHeight; // reflow
  obstaculos.style.animation = 'obstaculos 1s infinite linear';
  obstaculos.style.animationPlayState = 'paused';
  obstaculos.style.left = '';

  nuvens.style.animation = 'none';
  nuvens.offsetHeight;
  nuvens.style.animation = 'nuvens 18s infinite linear';
  nuvens.style.animationPlayState = 'paused';

  moeda.style.opacity = '1';

  score = 0;
  updateScoreDisplay();

  setTimeout(iniciarJogo, 50);
}

btnIniciar.addEventListener('click', iniciarJogo);
btnReiniciar.addEventListener('click', reiniciarJogo);

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    if (!gameRunning && telaAbertura.style.display !== 'none') {
      iniciarJogo();
      return;
    }
    pulo();
  }
  if (e.key.toLowerCase() === 'z') {
    criarTiro();
  }
});
