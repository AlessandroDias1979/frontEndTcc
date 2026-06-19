// ====== Elementos ======
const btnPdf = document.getElementById("btnPdf");
const btnLimpar = document.getElementById("btnLimpar");
const btnVoltar = document.getElementById("btn-voltar");

// URL base da API (centralizada para facilitar manutenção)
const API_BASE = "https://serviconodetcc.onrender.com";

// ====== Gerar PDF ======
btnPdf.addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  const nomeAluno   = document.getElementById("nomeAluno").value;
  const turma       = document.getElementById("turma").value;
  const observacoes = document.getElementById("observacoes").value;
  const periodo     = document.getElementById("periodo").value;
  const nivel       = document.getElementById("nivel").value;

  const checkboxesMarcados = document.querySelectorAll(
    "input[type='checkbox']:checked"
  );

  let y = 10;

  pdf.setFontSize(14);
  pdf.text("Parecer – Educação Infantil (BNCC)", 10, y);
  y += 10;

  pdf.setFontSize(11);
  pdf.text(`Nome do aluno: ${nomeAluno}`, 10, y); y += 7;
  pdf.text(`Turma: ${turma}`, 10, y); y += 7;
  pdf.text(`Período: ${periodo}`, 10, y); y += 7;
  pdf.text(`Nível de desenvolvimento: ${nivel}`, 10, y); y += 10;

  pdf.text("Observações:", 10, y); y += 7;
  const obsQuebradas = pdf.splitTextToSize(observacoes, 180);
  pdf.text(obsQuebradas, 10, y);
  y += obsQuebradas.length * 7 + 5;

  pdf.text("Aspectos Observados:", 10, y); y += 7;

  if (checkboxesMarcados.length === 0) {
    pdf.text("- Nenhum item selecionado.", 10, y);
  } else {
    checkboxesMarcados.forEach((cb) => {
      if (y > 280) { pdf.addPage(); y = 10; }
      pdf.text(`- ${cb.dataset.text}`, 10, y);
      y += 7;
    });
  }

  pdf.save(`Parecer_${nomeAluno || "Aluno"}.pdf`);
});

// ====== Limpar formulário ======
btnLimpar.addEventListener("click", () => {
  document.querySelectorAll("input[type='text'], textarea")
    .forEach(c => c.value = "");
  document.querySelectorAll("input[type='checkbox']")
    .forEach(c => c.checked = false);
});

// ====== Botão Voltar ======
btnVoltar.addEventListener("click", () => {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "dashbord.html";
  }
});

// ====== Carregar Títulos (cards) ======
const carregarTitulos = () => {
  $.ajax({
    url: `${API_BASE}/titulos?idTurma=1`,
    type: "GET",
    dataType: "json",
    success: function (titulos) {
      $("#cardsContainer").empty();

      $.each(titulos, function (_, titulo) {
        const cardHTML = `
          <article class="card">
            <div class="card-titulo">${titulo.nomeTitulo}</div>
            <div class="card-conteudo" id="perguntas-${titulo.idTitulo}">
              Carregando perguntas...
            </div>
          </article>
        `;
        $("#cardsContainer").append(cardHTML);

        // Carrega as perguntas deste título
        carregarPerguntas(titulo.idTitulo);
      });
    },
    error: function () {
      Swal.fire("Erro", "Erro ao carregar títulos", "error");
    }
  });
};

// ====== Carregar Perguntas de cada título ======
const carregarPerguntas = (idTitulo) => {
  $.ajax({
    url: `${API_BASE}/perguntas?idTitulo=${idTitulo}`,  // ✅ sem aspas extras
    type: "GET",
    dataType: "json",
    success: function (perguntas) {
      const div = $(`#perguntas-${idTitulo}`);
      div.empty();

      $.each(perguntas, function (_, pergunta) {
        div.append(`
          <label class="pergunta-item">
            <input 
              type="checkbox"
              data-text="${pergunta.questao}"
              data-id="${pergunta.id}"
              data-titulo="${idTitulo}"
            >
            ${pergunta.questao}
          </label><br>
        `);
      });
    },
    error: function () {
      $(`#perguntas-${idTitulo}`).html("Erro ao carregar perguntas");
    }
  });
};

const idParecer = (idAluno) => {
  $.ajax({
    url: `${API_BASE}/parecer?idAluno=${idAluno}`,
    type: "GET",
    dataType: "json",
    success: function (parecer) {
      console.log("Parecer recebido:", parecer);
    },
    error: function (err) {
      console.error("Erro ao carregar parecer:", err);
      Swal.fire("Erro", "Erro ao carregar parecer do aluno.", "error");
    }
  });
}

// ====== Ponto de entrada ÚNICO ======
$(document).ready(function () {
  carregarTitulos();   // ✅ nomes batem agora
});