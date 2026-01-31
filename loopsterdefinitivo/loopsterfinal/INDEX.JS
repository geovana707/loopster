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

const inimigoTerrestre = document.getElementById('inimigoTerrestre');
const inimigoAereo = document.getElementById('inimigoAereo');

let loop;             
let scoreInterval;    
let score = 0;
let gameRunning = false;
let recorde = 0;

let tiroAtivo = false;
let marioAbaixado = false;

let velocidadeObstaculo = 1.7; 
let velocidadeInimigoTerrestre = 1.8;
let velocidadeInimigoAereo = 2.2;

let obstaculoAtivo = false;
let inimigoTerrestreAtivo = false;
let inimigoAereoAtivo = false;

let intervaloSorteio;

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
  if (marioAbaixado) return;
  
  mario.classList.add('pulo');
  setTimeout(() => mario.classList.remove('pulo'), 700); 
}

function abaixar() {
  if (!gameRunning) return;
  if (mario.classList.contains('pulo')) return;
  if (marioAbaixado) return;
  
  marioAbaixado = true;
  mario.classList.add('abaixado');
}

function levantar() {
  if (!marioAbaixado) return;
  
  marioAbaixado = false;
  mario.classList.remove('abaixado');
}

function ativarObstaculo() {
  if (obstaculoAtivo || inimigoTerrestreAtivo || inimigoAereoAtivo) return;
  
  obstaculoAtivo = true;
  obstaculos.style.left = '100%';
  obstaculos.style.animation = 'none';
  obstaculos.offsetHeight; // força reflow
  obstaculos.style.animation = `obstaculos ${velocidadeObstaculo}s linear`;
  obstaculos.style.animationPlayState = 'running';
  
  setTimeout(() => {
    obstaculos.style.left = '100%';
    obstaculoAtivo = false;
  }, velocidadeObstaculo * 1000);
}

function ativarInimigoTerrestre() {
  if (obstaculoAtivo || inimigoTerrestreAtivo || inimigoAereoAtivo) return;
  
  inimigoTerrestreAtivo = true;
  inimigoTerrestre.style.left = '100%';
  inimigoTerrestre.style.animation = 'none';
  inimigoTerrestre.offsetHeight; 
  inimigoTerrestre.style.animation = `inimigoTerrestre ${velocidadeInimigoTerrestre}s linear`;
  inimigoTerrestre.style.animationPlayState = 'running';
  inimigoTerrestre.style.opacity = '1';
  
  setTimeout(() => {
    inimigoTerrestre.style.opacity = '0';
    inimigoTerrestre.style.animationPlayState = 'paused';
    inimigoTerrestre.style.left = '100%';
    inimigoTerrestreAtivo = false;
  }, velocidadeInimigoTerrestre * 1000);
}

function ativarInimigoAereo() {
  if (obstaculoAtivo || inimigoTerrestreAtivo || inimigoAereoAtivo) return;
  
  inimigoAereoAtivo = true;
  inimigoAereo.style.left = '100%';
  inimigoAereo.style.animation = 'none';
  inimigoAereo.offsetHeight; 
  inimigoAereo.style.animation = `inimigoAereo ${velocidadeInimigoAereo}s linear`;
  inimigoAereo.style.animationPlayState = 'running';
  inimigoAereo.style.opacity = '1';
  
  setTimeout(() => {
    inimigoAereo.style.opacity = '0';
    inimigoAereo.style.animationPlayState = 'paused';
    inimigoAereo.style.left = '100%';
    inimigoAereoAtivo = false;
  }, velocidadeInimigoAereo * 1000);
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

  let tiroJaAcertou = false; 

  const intervaloColisao = setInterval(() => {
    if (tiroJaAcertou) return; 
    
    const tiroRect = tiro.getBoundingClientRect();
    
    if (inimigoTerrestreAtivo && inimigoTerrestre.style.opacity === '1') {
      const terrestreRect = inimigoTerrestre.getBoundingClientRect();
      if (
        tiroRect.left + tiroRect.width > terrestreRect.left &&
        tiroRect.left < terrestreRect.right &&
        tiroRect.top + tiroRect.height > terrestreRect.top &&
        tiroRect.top < terrestreRect.bottom
      ) {
        score += 30;
        updateScoreDisplay();
        inimigoTerrestre.style.opacity = '0';
        inimigoTerrestre.style.animationPlayState = 'paused';
        inimigoTerrestreAtivo = false;
        
        tiroJaAcertou = true;
        clearInterval(intervaloColisao);
        tiro.remove();
        tiroAtivo = false;
        return;
      }
    }
    
    if (inimigoAereoAtivo && inimigoAereo.style.opacity === '1') {
      const aereoRect = inimigoAereo.getBoundingClientRect();
      if (
        tiroRect.left + tiroRect.width > aereoRect.left &&
        tiroRect.left < aereoRect.right &&
        tiroRect.top + tiroRect.height > aereoRect.top &&
        tiroRect.top < aereoRect.bottom
      ) {
        score += 30;
        updateScoreDisplay();
        inimigoAereo.style.opacity = '0';
        inimigoAereo.style.animationPlayState = 'paused';
        inimigoAereoAtivo = false;
        
        tiroJaAcertou = true;
        clearInterval(intervaloColisao);
        tiro.remove();
        tiroAtivo = false;
        return;
      }
    }
    
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
      
      tiroJaAcertou = true;
      clearInterval(intervaloColisao);
      tiro.remove();
      tiroAtivo = false;
      
      setTimeout(() => {
        moeda.style.opacity = '1';
      }, 10000);
      return;
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
    if (tiro && !tiroJaAcertou) {
      tiro.remove();
      clearInterval(intervaloColisao);
      tiroAtivo = false;
    }
  }, 400);
}

function iniciarJogo() {
  if (gameRunning) return;
  gameRunning = true;
  score = 0;
  updateScoreDisplay();
  marioAbaixado = false;
  
  velocidadeObstaculo = 1.7;
  velocidadeInimigoTerrestre = 1.8;
  velocidadeInimigoAereo = 2.2;
  
  obstaculoAtivo = false;
  inimigoTerrestreAtivo = false;
  inimigoAereoAtivo = false;

  telaAbertura.style.display = 'none';
  telaAbertura.setAttribute('aria-hidden','true');

  telaFinal.style.display = 'none';
  telaFinal.setAttribute('aria-hidden','true');

  obstaculos.style.animation = `obstaculos ${velocidadeObstaculo}s infinite linear`;
  obstaculos.style.animationPlayState = 'paused'; // Começa pausado, será ativado pelo intervalo

  nuvens.style.animation = 'nuvens 18s infinite linear';
  nuvens.style.animationPlayState = 'running';

  moeda.style.opacity = '1';

  inimigoTerrestre.style.opacity = '0';
  inimigoTerrestre.style.animationPlayState = 'paused';
  
  inimigoAereo.style.opacity = '0';
  inimigoAereo.style.animationPlayState = 'paused';

  let intervaloSorteio = setInterval(() => {
    if (!obstaculoAtivo && !inimigoTerrestreAtivo && !inimigoAereoAtivo) {
      const sorteio = Math.random();
      
      if (sorteio < 0.4) {
        ativarObstaculo();
      } else if (sorteio < 0.7) {
        ativarInimigoTerrestre();
      } else {
        ativarInimigoAereo();
      }
    }
  }, 1100);
  
  setTimeout(() => {
    ativarObstaculo();
  }, 1500);

  recorde = carregarRecorde();
  atualizarRecordeNaTela(recorde);

  loop = setInterval(() => {
    const tuboposi = obstaculos.offsetLeft;
    const marioposi = +window.getComputedStyle(mario).bottom.replace('px','');

    if (tuboposi <= 150 && tuboposi > -50 && marioposi < 90) {
      gameOver(tuboposi, marioposi);
    }

    const terrestrePos = inimigoTerrestre.offsetLeft;
    if (inimigoTerrestreAtivo && inimigoTerrestre.style.opacity === '1' && terrestrePos <= 130 && terrestrePos > 0 && marioposi < 80) {
      gameOver(terrestrePos, marioposi);
    }

    const aereoPos = inimigoAereo.offsetLeft;
    const aereoBottom = 120;
    
    if (inimigoAereoAtivo && inimigoAereo.style.opacity === '1' && aereoPos <= 130 && aereoPos > 0) {
      if (marioposi < aereoBottom + 30 && !marioAbaixado) {
        gameOver(aereoPos, marioposi);
      }
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
  
  clearInterval(intervaloSorteio);
  
  gameRunning = false;
  obstaculoAtivo = false;
  inimigoTerrestreAtivo = false;
  inimigoAereoAtivo = false;

  obstaculos.style.animationPlayState = 'paused';
  obstaculos.style.left = `${tuboposi}px`;

  nuvens.style.animationPlayState = 'paused';

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
  obstaculos.offsetHeight;
  obstaculos.style.animation = `obstaculos ${velocidadeObstaculo}s infinite linear`;
  obstaculos.style.animationPlayState = 'paused';
  obstaculos.style.left = '';

  nuvens.style.animation = 'none';
  nuvens.offsetHeight;
  nuvens.style.animation = 'nuvens 18s infinite linear';
  nuvens.style.animationPlayState = 'paused';

  inimigoTerrestre.style.animation = 'none';
  inimigoTerrestre.offsetHeight;
  inimigoTerrestre.style.animation = `inimigoTerrestre ${velocidadeInimigoTerrestre}s infinite linear`;
  inimigoTerrestre.style.animationPlayState = 'paused';
  inimigoTerrestre.style.left = '';

  inimigoAereo.style.animation = 'none';
  inimigoAereo.offsetHeight;
  inimigoAereo.style.animation = `inimigoAereo ${velocidadeInimigoAereo}s infinite linear`;
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
  
  if (e.code === 'ArrowDown' || e.key.toLowerCase() === 's') {
    abaixar();
  }
  
  if (e.key.toLowerCase() === 'z') {
    criarTiro();
  }
});

document.addEventListener('keyup', (e) => {
  if (e.code === 'ArrowDown' || e.key.toLowerCase() === 's') {
    levantar();
  }
});

