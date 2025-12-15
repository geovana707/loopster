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

// NOVOS ELEMENTOS
const inimigoTerrestre = document.getElementById('inimigoTerrestre');
const inimigoAereo = document.getElementById('inimigoAereo');

let loop;             
let scoreInterval;    
let score = 0;
let gameRunning = false;
let recorde = 0;

let tiroAtivo = false;
let marioAbaixado = false; // NOVA VARIÁVEL para controlar se o Mario está abaixado

// NOVOS: Intervalos de aparição dos inimigos
let intervaloInimigoTerrestre;
let intervaloInimigoAereo;
let inimigoAtivoNoMomento = false; // Controla se há um inimigo ativo na tela

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
  if (marioAbaixado) return; // Não pode pular se estiver abaixado
  
  mario.classList.add('pulo');
  setTimeout(() => mario.classList.remove('pulo'), 500);
}

// NOVA FUNÇÃO: Abaixar o Mario
function abaixar() {
  if (!gameRunning) return;
  if (mario.classList.contains('pulo')) return; // Não pode abaixar se estiver pulando
  if (marioAbaixado) return; // Já está abaixado
  
  marioAbaixado = true;
  mario.classList.add('abaixado');
}

// NOVA FUNÇÃO: Levantar o Mario
function levantar() {
  if (!marioAbaixado) return;
  
  marioAbaixado = false;
  mario.classList.remove('abaixado');
}

// NOVA FUNÇÃO: Ativar inimigo terrestre temporariamente
function ativarInimigoTerrestre() {
  // Não ativa se já houver um inimigo na tela
  if (inimigoAtivoNoMomento) return;
  
  inimigoAtivoNoMomento = true;
  inimigoTerrestre.style.animation = 'inimigoTerrestre 1.8s infinite linear';
  inimigoTerrestre.style.animationPlayState = 'running';
  inimigoTerrestre.style.opacity = '1';
  
  // Desativar após completar a animação
  setTimeout(() => {
    inimigoTerrestre.style.opacity = '0';
    inimigoTerrestre.style.animationPlayState = 'paused';
    inimigoAtivoNoMomento = false; // Libera para próximo inimigo
  }, 1800);
}

// NOVA FUNÇÃO: Ativar inimigo aéreo temporariamente
function ativarInimigoAereo() {
  // Não ativa se já houver um inimigo na tela
  if (inimigoAtivoNoMomento) return;
  
  inimigoAtivoNoMomento = true;
  inimigoAereo.style.animation = 'inimigoAereo 2.2s infinite linear';
  inimigoAereo.style.animationPlayState = 'running';
  inimigoAereo.style.opacity = '1';
  
  // Desativar após completar a animação
  setTimeout(() => {
    inimigoAereo.style.opacity = '0';
    inimigoAereo.style.animationPlayState = 'paused';
    inimigoAtivoNoMomento = false; // Libera para próximo inimigo
  }, 2200);
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
  marioAbaixado = false;
  inimigoAtivoNoMomento = false; // Resetar controle de inimigos

  telaAbertura.style.display = 'none';
  telaAbertura.setAttribute('aria-hidden','true');

  telaFinal.style.display = 'none';
  telaFinal.setAttribute('aria-hidden','true');

  // Obstáculo original mais rápido (0.5s)
  obstaculos.style.animation = 'obstaculos 1.7s infinite linear';
  obstaculos.style.animationPlayState = 'running';

  nuvens.style.animation = 'nuvens 18s infinite linear';
  nuvens.style.animationPlayState = 'running';

  moeda.style.opacity = '1';

  // INICIAR INIMIGOS OCULTOS
  inimigoTerrestre.style.opacity = '0';
  inimigoTerrestre.style.animationPlayState = 'paused';
  
  inimigoAereo.style.opacity = '0';
  inimigoAereo.style.animationPlayState = 'paused';

  // NOVO SISTEMA: Inimigos aparecem a cada X segundos
  // Inimigo Terrestre aparece a cada 12 segundos
  intervaloInimigoTerrestre = setInterval(() => {
    ativarInimigoTerrestre();
  }, 12000);

  // Inimigo Aéreo aparece a cada 15 segundos
  intervaloInimigoAereo = setInterval(() => {
    ativarInimigoAereo();
  }, 15000);

  // Ativar primeiro inimigo terrestre após 5 segundos
  setTimeout(() => {
    ativarInimigoTerrestre();
  }, 5000);

  // Ativar primeiro inimigo aéreo após 8 segundos
  setTimeout(() => {
    ativarInimigoAereo();
  }, 8000);

  recorde = carregarRecorde();
  atualizarRecordeNaTela(recorde);

  loop = setInterval(() => {
    const tuboposi = obstaculos.offsetLeft;
    const marioposi = +window.getComputedStyle(mario).bottom.replace('px','');

    // COLISÃO COM OBSTÁCULO ORIGINAL
    if (tuboposi <= 130 && tuboposi > 0 && marioposi < 70) {
      gameOver(tuboposi, marioposi);
    }

    // COLISÃO COM INIMIGO TERRESTRE (somente se estiver visível)
    const terrestrePos = inimigoTerrestre.offsetLeft;
    const terrestreVisivel = inimigoTerrestre.style.opacity === '1';
    if (terrestreVisivel && terrestrePos <= 130 && terrestrePos > 0 && marioposi < 80) {
      gameOver(terrestrePos, marioposi);
    }

    // COLISÃO COM INIMIGO AÉREO (somente se estiver visível)
    const aereoPos = inimigoAereo.offsetLeft;
    const aereoVisivel = inimigoAereo.style.opacity === '1';
    const aereoBottom = 120; // Altura do inimigo aéreo
    
    if (aereoVisivel && aereoPos <= 130 && aereoPos > 0) {
      // Se Mario está no chão (não pulando) e não está abaixado, colidiu
      if (marioposi < aereoBottom + 30 && !marioAbaixado) {
        gameOver(aereoPos, marioposi);
      }
      // Se Mario está pulando, verifica se atingiu o inimigo aéreo
      if (marioposi >= aereoBottom && marioposi <= aereoBottom + 60) {
        gameOver(aereoPos, marioposi);
      }
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
  
  // LIMPAR INTERVALOS DOS INIMIGOS
  clearInterval(intervaloInimigoTerrestre);
  clearInterval(intervaloInimigoAereo);
  
  gameRunning = false;
  inimigoAtivoNoMomento = false; // Resetar controle de inimigos

  obstaculos.style.animationPlayState = 'paused';
  obstaculos.style.left = `${tuboposi}px`;

  nuvens.style.animationPlayState = 'paused';

  // PAUSAR NOVOS INIMIGOS
  inimigoTerrestre.style.animationPlayState = 'paused';
  inimigoAereo.style.animationPlayState = 'paused';

  mario.classList.remove('pulo');
  mario.classList.remove('abaixado');
  marioAbaixado = false;
  
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
  mario.classList.remove('abaixado');
  marioAbaixado = false;

  obstaculos.style.animation = 'none';
  obstaculos.offsetHeight; // reflow
  obstaculos.style.animation = 'obstaculos 1.7s infinite linear';
  obstaculos.style.animationPlayState = 'paused';
  obstaculos.style.left = '';

  nuvens.style.animation = 'none';
  nuvens.offsetHeight;
  nuvens.style.animation = 'nuvens 18s infinite linear';
  nuvens.style.animationPlayState = 'paused';

  // RESETAR NOVOS INIMIGOS
  inimigoTerrestre.style.animation = 'none';
  inimigoTerrestre.offsetHeight;
  inimigoTerrestre.style.animation = 'inimigoTerrestre 1.8s infinite linear';
  inimigoTerrestre.style.animationPlayState = 'paused';
  inimigoTerrestre.style.left = '';

  inimigoAereo.style.animation = 'none';
  inimigoAereo.offsetHeight;
  inimigoAereo.style.animation = 'inimigoAereo 2.2s infinite linear';
  inimigoAereo.style.animationPlayState = 'paused';
  inimigoAereo.style.left = '';

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
  
  // NOVO COMANDO: Abaixar com Seta para Baixo ou tecla S
  if (e.code === 'ArrowDown' || e.key.toLowerCase() === 's') {
    abaixar();
  }
  
  if (e.key.toLowerCase() === 'z') {
    criarTiro();
  }
});

// NOVO EVENTO: Levantar quando soltar a tecla
document.addEventListener('keyup', (e) => {
  if (e.code === 'ArrowDown' || e.key.toLowerCase() === 's') {
    levantar();
  }
});

