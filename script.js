// Carregar o histórico de cálculos armazenado no localStorage
let historicoCalculos = JSON.parse(localStorage.getItem("historicoCalculos")) || [];

function salvarHistorico() {
localStorage.setItem("historicoCalculos", JSON.stringify(historicoCalculos));
}

function calcularFrete(precoVenda, peso, planoFrete) {
  // Se o preço de venda for menor que 79, o frete é fixo e sem desconto de plano de frete
  if (precoVenda < 79) {
      return 6; // Frete fixo de R$6,00
  }

  // Array que contém os limites de peso e os respectivos valores de frete
  const faixasFrete = [
      { peso: 0.3, valor: 40.90 },
      { peso: 0.5, valor: 41.90 },
      { peso: 1, valor: 43.90 },
      { peso: 2, valor: 46.90 },
      { peso: 3, valor: 47.90 },
      { peso: 4, valor: 49.90 },
      { peso: 5, valor: 51.90 },
      { peso: 9, valor: 83.90 },
      { peso: 13, valor: 131.90 },
      { peso: 17, valor: 146.90 },
      { peso: 23, valor: 171.90 },
      { peso: 30, valor: 197.90 },
      { peso: 40, valor: 218.90 },
      { peso: 50, valor: 233.90 },
      { peso: 60, valor: 249.90 },
      { peso: 70, valor: 282.90 },
      { peso: 80, valor: 313.90 },
      { peso: 90, valor: 349.90 },
      { peso: 100, valor: 399.90 },
      { peso: 125, valor: 446.90 },
      { peso: 150, valor: 474.90 },
      { peso: Infinity, valor: 498.90 } // Para pesos acima de 150
  ];

  // Variável de desconto com valor padrão (sem desconto)
  let descontoPlano = 1;

  // Verificar o tipo de plano para aplicar o desconto
  if (planoFrete === 'Líder 25%') {
    descontoPlano = 0.75; // 25% de desconto
} else if (planoFrete === 'Líder 50%') {
    descontoPlano = 0.5; // 50% de desconto
}

  // Encontrar o valor do frete com base no peso e aplicar o desconto do plano
  let frete = (faixasFrete.find(faixa => peso <= faixa.peso)?.valor || 498.90) * descontoPlano;

  // Garantir que o frete não fique negativo
  if (frete < 0) {
      frete = 0;
  }

  return frete;
}

function adicionarErroCampo(campo, mensagem) {
  campo.style.border = "2px solid red";  // Adiciona a borda vermelha
  campo.classList.add("campoErroAnimacao"); // Classe CSS para animação
  setTimeout(() => campo.classList.remove("campoErroAnimacao"), 1000); // Remove o destaque após 1s
  const erroDiv = document.createElement("div");
  erroDiv.classList.add("erroMensagem");
  erroDiv.style.color = "red";
  erroDiv.innerText = mensagem;
  campo.parentElement.appendChild(erroDiv); // Adiciona a mensagem de erro abaixo do campo
}

function limparErros() {
  const campos = document.querySelectorAll(".erroMensagem");
  campos.forEach(erro => erro.remove());  // Remove mensagens de erro
  const inputs = document.querySelectorAll("input, select");
  inputs.forEach(input => input.style.border = "");  // Remove borda vermelha
}

function validarEntradas() {
  limparErros(); // Limpar erros anteriores
  
  const precoVenda = parseFloat(document.getElementById("precoVenda").value);
  const desconto = parseFloat(document.getElementById("desconto").value);
  const custoProduto = parseFloat(document.getElementById("custoProduto").value);
  const outrosCustos = parseFloat(document.getElementById("outrosCustos").value);
  const peso = parseFloat(document.getElementById("peso").value);

  if (isNaN(precoVenda) || precoVenda <= 0) {
    adicionarErroCampo(document.getElementById("precoVenda"), "Erro: Preço de venda inválido.");
    return "Erro: Preço de venda inválido.";
  }
  if (isNaN(desconto) || desconto < 0) {
    adicionarErroCampo(document.getElementById("desconto"), "Erro: Desconto inválido.");
    return "Erro: Desconto inválido.";
  }
  if (isNaN(custoProduto) || custoProduto < 0) {
    adicionarErroCampo(document.getElementById("custoProduto"), "Erro: Custo do produto inválido.");
    return "Erro: Custo do produto inválido.";
  }
  if (isNaN(outrosCustos) || outrosCustos < 0) {
    adicionarErroCampo(document.getElementById("outrosCustos"), "Erro: Outros custos inválidos.");
    return "Erro: Outros custos inválidos.";
  }
  if (isNaN(peso) || peso <= -1) {
    adicionarErroCampo(document.getElementById("peso"), "Erro: Peso da mercadoria inválido.");
    return "Erro: Peso da mercadoria inválido.";
  }

  return null;
}

function calcularLucro() {
  const erro = validarEntradas();
  if (erro) {
      document.getElementById("mensagemErro").innerText = erro;
      return;
  }

  document.getElementById("mensagemErro").innerText = "";
  const nomeProduto = document.getElementById("nomeProduto").value || "Produto Sem Nome";
  const precoVenda = parseFloat(document.getElementById("precoVenda").value);
  const desconto = parseFloat(document.getElementById("desconto").value);
  const custoProduto = parseFloat(document.getElementById("custoProduto").value);
  const outrosCustos = parseFloat(document.getElementById("outrosCustos").value);
  const tipoConta = document.getElementById("tipoConta").value;
  const planoFrete = document.getElementById("planoFrete").value;
  const peso = parseFloat(document.getElementById("peso").value);

  const precoComDesconto = precoVenda * (1 - desconto / 100);
  const frete = calcularFrete(precoComDesconto, peso, planoFrete);
  let lucro = precoComDesconto - custoProduto - outrosCustos - frete;

    // Aplicar o desconto de lucro baseado no tipo de conta
    if (tipoConta === "Comum") {
      lucro *= 0.84; // Reduz o lucro em 16%
  } else if (tipoConta === "Premium") {
      lucro *= 0.81; // Reduz o lucro em 19%
  }

  let percentualLucro = (lucro / precoComDesconto) * 100;
  
  // Define a cor com base no valor do lucro
  const corLucro = lucro >= 0 ? "green" : "red";

  document.getElementById("resultado").innerHTML = `
    <strong>Produto:</strong> ${nomeProduto}<br />
    <strong>Preço de Venda:</strong> R$${precoVenda.toFixed(2)}<br />
    <strong>Desconto Aplicado:</strong> ${desconto}%<br />
    <strong>Preço com Desconto:</strong> R$${precoComDesconto.toFixed(2)}<br />
    <strong>Frete:</strong> R$${frete.toFixed(2)}<br />
    <strong style="font-size: 1.5em; color: ${corLucro};">Lucro:</strong> 
    <strong style="font-size: 1.5em; color: ${corLucro};">R$${lucro.toFixed(2)}</strong> 
    (${percentualLucro.toFixed(2)}%)
  `;

  historicoCalculos.push({
      nomeProduto, precoVenda, desconto, custoProduto, outrosCustos, tipoConta, planoFrete, peso, precoComDesconto, frete, lucro, percentualLucro
  });

  salvarHistorico();
}

 document.getElementById("resultado").innerHTML = `
   <strong>Produto:</strong> ${nomeProduto}<br />
   <strong>Preço de Venda:</strong> R$${precoVenda.toFixed(2)}<br />
   <strong>Desconto Aplicado:</strong> ${desconto}%<br />
   <strong>Preço com Desconto:</strong> R$${precoComDesconto.toFixed(2)}<br />
   <strong>Frete:</strong> R$${frete.toFixed(2)}<br />
   <strong style="font-size: 1.5em; color: ${corLucro};">Lucro:</strong> 
   <strong style="font-size: 1.5em; color: ${corLucro};">R$${lucro.toFixed(2)}</strong> 
   (${percentualLucro.toFixed(2)}%)
 `;

 historicoCalculos.push({
     nomeProduto, precoVenda, desconto, custoProduto, outrosCustos, tipoConta, planoFrete, peso, precoComDesconto, frete, lucro, percentualLucro
 });

 salvarHistorico();




//função para mostrar o histórico
function mostrarHistorico() {
  const historicoContainer = document.getElementById("historico");
  const container = document.getElementById("container");
  const historicoView = document.getElementById("historicoView");

  setTimeout(() => {
    container.style.display = "none"; // Esconde o container
    historicoView.style.display = "block"; // Mostra o histórico
    historicoView.classList.add("fade-in-slide"); // Aplica a animação de entrada
  }, 600); // Tempo da animação de deslizar

  // Dados dos cálculos que serão inseridos no histórico
  historicoContainer.innerHTML = historicoCalculos.map((calculo, index) => `
    <div class="history-item">
      <input type="checkbox" class="selecionarCalculo" data-index="${index}">
      <p><strong>Produto:</strong> ${calculo.nomeProduto}, 
      <strong>Preço com Desconto:</strong> R$${calculo.precoComDesconto.toFixed(2)}, 
      <strong>Frete:</strong> R$${calculo.frete.toFixed(2)}, 
      <strong style="font-size: 1.2em; color: green;">Lucro:</strong> R$${calculo.lucro.toFixed(2)}</p>
    </div>
  `).join("");
}

function voltarAoSimulador() {
  const container = document.getElementById("container");
  const historicoView = document.getElementById("historicoView");

  // Remove a animação de entrada do histórico e a oculta
  historicoView.classList.remove("fade-in-slide");
  historicoView.style.display = "none";

  // Mostra o simulador novamente com animação de entrada
  container.style.display = "block";
  container.classList.add("fade-in-slide");

  // Remove a classe de saída do container para que ela não interfira em próximas animações
  setTimeout(() => {
    container.classList.remove("fade-in-slide");
  }, 800); // Tempo da animação de entrada
}

// Função para exportar histórico para excel
function exportarParaExcel() {
const worksheet = XLSX.utils.json_to_sheet(historicoCalculos);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "Histórico");
XLSX.writeFile(workbook, "Historico_Calculos.xlsx");
}


//Função para apagar cálculos selecionados do histórico
function apagarSelecionados() {
const checkboxes = document.querySelectorAll(".selecionarCalculo:checked");
const indicesParaRemover = Array.from(checkboxes).map(checkbox => parseInt(checkbox.dataset.index));

historicoCalculos = historicoCalculos.filter((_, index) => !indicesParaRemover.includes(index));
salvarHistorico();
mostrarHistorico(); // Atualiza a exibição do histórico
}

function voltarHome() {
  window.location.href = 'home-index.html'; // Voltar a página inicial
}
