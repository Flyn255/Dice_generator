// ---------- Dados e estado ----------
const TIPOS = [6, 8, 10, 12, 20, 100];   // array com os tipos de dado
const MAX_POR_TIPO = 10;
const CHAVE_HISTORICO = "historicoDados";

const quantidades = {};                   // quantos de cada dado
for (let i = 0; i < TIPOS.length; i++) {
  quantidades[TIPOS[i]] = 0;
}

let rolando = false;

// ---------- Elementos ----------
const elControles = document.getElementById("controles");
const elTotal = document.getElementById("total-selecionado");
const elCaixa = document.getElementById("caixa");
const elMensagem = document.getElementById("mensagem");
const elResultado = document.getElementById("resultado");
const elLista = document.getElementById("lista-resultado");
const elSoma = document.getElementById("soma");
const elHistorico = document.getElementById("historico");
const btnRolar = document.getElementById("btn-rolar");

// ---------- Painel de escolha ----------
function criarControles() {
  for (let i = 0; i < TIPOS.length; i++) {
    const lados = TIPOS[i];

    const linha = document.createElement("div");
    linha.className = "linha-dado";
    linha.innerHTML =
      '<span class="nome">d' + lados + '</span>' +
      '<div class="contador">' +
      '<button data-lados="' + lados + '" data-acao="menos">−</button>' +
      '<span class="qtd" id="qtd-' + lados + '">0</span>' +
      '<button data-lados="' + lados + '" data-acao="mais">+</button>' +
      '</div>';
    elControles.appendChild(linha);
  }
}

elControles.addEventListener("click", function (e) {
  const botao = e.target.closest("button");
  if (!botao || rolando) return;

  const lados = Number(botao.dataset.lados);
  if (botao.dataset.acao === "mais" && quantidades[lados] < MAX_POR_TIPO) {
    quantidades[lados]++;
  } else if (botao.dataset.acao === "menos" && quantidades[lados] > 0) {
    quantidades[lados]--;
  }
  atualizarPainel();
});

document.getElementById("btn-limpar").addEventListener("click", function () {
  if (rolando) return;
  for (let i = 0; i < TIPOS.length; i++) {
    quantidades[TIPOS[i]] = 0;
  }
  atualizarPainel();
});

function totalDeDados() {
  let total = 0;
  for (let i = 0; i < TIPOS.length; i++) {
    total += quantidades[TIPOS[i]];
  }
  return total;
}

function atualizarPainel() {
  for (let i = 0; i < TIPOS.length; i++) {
    document.getElementById("qtd-" + TIPOS[i]).textContent = quantidades[TIPOS[i]];
  }
  const total = totalDeDados();
  if (total === 0) {
    elTotal.textContent = "Nenhum dado selecionado";
  } else {
    elTotal.textContent = total + (total === 1 ? " dado selecionado" : " dados selecionados");
  }
}

// ---------- Rolagem ----------
function rolarUm(lados) {
  return Math.floor(Math.random() * lados) + 1;
}

// Botão principal: usa if/else para decidir o que fazer
btnRolar.addEventListener("click", function () {
  const total = totalDeDados();

  if (total === 0) {
    elMensagem.textContent = "Escolha pelo menos um dado no painel da esquerda!";
  } else if (rolando) {
    elMensagem.textContent = "Aguarde os dados caírem...";
  } else {
    elMensagem.textContent = "";
    iniciarRolagem();
  }
});

function iniciarRolagem() {
  rolando = true;
  btnRolar.disabled = true;
  elResultado.hidden = true;
  elCaixa.innerHTML = "";

  // monta a lista de dados com laço
  const dados = [];
  for (let i = 0; i < TIPOS.length; i++) {
    const lados = TIPOS[i];
    for (let j = 0; j < quantidades[lados]; j++) {
      dados.push({ lados: lados, valor: rolarUm(lados) });
    }
  }

  // posições na caixa (grade com um pouco de aleatoriedade)
  const tamanho = 56;
  const largura = elCaixa.clientWidth;
  const altura = elCaixa.clientHeight;
  const colunas = Math.max(1, Math.min(dados.length, Math.floor(largura / (tamanho + 14))));
  const linhas = Math.ceil(dados.length / colunas);
  const celulaL = largura / colunas;
  const celulaA = altura / linhas;

  const elementos = [];
  for (let i = 0; i < dados.length; i++) {
    const d = dados[i];
    const el = document.createElement("div");
    el.className = "dado formato-d" + d.lados;
    el.textContent = rolarUm(d.lados);

    const col = i % colunas;
    const lin = Math.floor(i / colunas);
    const folgaL = Math.max(0, celulaL - tamanho - 6);
    const folgaA = Math.max(0, celulaA - tamanho - 6);
    const x = col * celulaL + 3 + Math.random() * folgaL;
    const y = lin * celulaA + 3 + Math.random() * folgaA;

    el.style.left = x + "px";
    el.style.top = "-80px";
    el.style.transform = "rotate(" + (Math.random() * 360) + "deg)";
    elCaixa.appendChild(el);
    elementos.push({ el: el, y: y });
  }

  // força o navegador a registrar a posição inicial antes de animar
  void elCaixa.offsetWidth;

  for (let i = 0; i < elementos.length; i++) {
    const item = elementos[i];
    item.el.style.transitionDelay = (i * 60) + "ms";
    item.el.style.top = item.y + "px";
    item.el.style.transform = "rotate(" + (Math.random() * 720 - 360) + "deg)";
  }

  // números embaralhando durante a queda
  const tempoQueda = 900 + dados.length * 60;
  const embaralhar = setInterval(function () {
    for (let i = 0; i < dados.length; i++) {
      elementos[i].el.textContent = rolarUm(dados[i].lados);
    }
  }, 70);

  setTimeout(function () {
    clearInterval(embaralhar);
    for (let i = 0; i < dados.length; i++) {
      elementos[i].el.textContent = dados[i].valor;
      elementos[i].el.style.transform = "rotate(" + (Math.random() * 20 - 10) + "deg)";
    }
    mostrarResultado(dados);
    rolando = false;
    btnRolar.disabled = false;
  }, tempoQueda + 150);
}

// ---------- Resultado ----------
function mostrarResultado(dados) {
  // ordem crescente pelo valor tirado
  const ordenados = dados.slice().sort(function (a, b) {
    return a.valor - b.valor;
  });

  elLista.innerHTML = "";
  let soma = 0;
  for (let i = 0; i < ordenados.length; i++) {
    const item = document.createElement("div");
    item.className = "item-resultado";
    item.innerHTML = "<strong>" + ordenados[i].valor + "</strong> <small>(d" + ordenados[i].lados + ")</small>";
    elLista.appendChild(item);
    soma += ordenados[i].valor;
  }

  elSoma.textContent = "Soma total: " + soma;
  elResultado.hidden = false;

  salvarNoHistorico(ordenados, soma);
}

// ---------- Histórico (localStorage) ----------
function lerHistorico() {
  try {
    const salvo = localStorage.getItem(CHAVE_HISTORICO);
    return salvo ? JSON.parse(salvo) : [];
  } catch (e) {
    return [];
  }
}

function salvarNoHistorico(ordenados, soma) {
  const historico = lerHistorico();

  const valores = [];
  for (let i = 0; i < ordenados.length; i++) {
    valores.push(ordenados[i].valor);
  }

  // junta os tipos usados, ex: "2d6 + 1d20"
  const contagem = {};
  for (let i = 0; i < ordenados.length; i++) {
    const chave = "d" + ordenados[i].lados;
    contagem[chave] = (contagem[chave] || 0) + 1;
  }
  const partes = [];
  for (const chave in contagem) {
    partes.push(contagem[chave] + chave);
  }

  historico.unshift({
    dados: partes.join(" + "),
    valores: valores.join(", "),
    soma: soma
  });

  if (historico.length > 8) historico.length = 8;

  try {
    localStorage.setItem(CHAVE_HISTORICO, JSON.stringify(historico));
  } catch (e) { /* sem armazenamento disponível */ }

  mostrarHistorico();
}

function mostrarHistorico() {
  const historico = lerHistorico();
  elHistorico.innerHTML = "";

  if (historico.length === 0) {
    elHistorico.innerHTML = "<li>Nenhuma rolagem ainda.</li>";
    return;
  }

  for (let i = 0; i < historico.length; i++) {
    const h = historico[i];
    const li = document.createElement("li");
    li.innerHTML = "<strong>" + h.dados + "</strong> = " + h.soma +
      "<span>" + h.valores + "</span>";
    elHistorico.appendChild(li);
  }
}

document.getElementById("btn-limpar-historico").addEventListener("click", function () {
  try {
    localStorage.removeItem(CHAVE_HISTORICO);
  } catch (e) { /* ignora */ }
  mostrarHistorico();
});

// ---------- Início ----------
criarControles();
atualizarPainel();
mostrarHistorico();
