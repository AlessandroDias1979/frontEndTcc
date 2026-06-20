// ====== Elementos ======
const btnPdf = document.getElementById("btnPdf");
const btnLimpar = document.getElementById("btnLimpar");
const btnVoltar = document.getElementById("btn-voltar");

// ====== API ======
const API_BASE = "https://serviconodetcc.onrender.com";

// ====== AUTOCOMPLETE ALUNOS ======
const input = $("#nomeAluno");
const lista = $("#listaAlunos");

// guarda o ID do aluno selecionado
let alunoSelecionadoId = null;

input.on("input", function () {
  const termo = $(this).val();

  if (termo.length < 2) {
    lista.empty();
    return;
  }

  $.ajax({
    url: `${API_BASE}/AllAlunos?search=${encodeURIComponent(termo)}`,
    type: "GET",
    dataType: "json",

    success: function (alunos) {
      lista.empty();

      if (!alunos || alunos.length === 0) {
        lista.append(`<div class="item-aluno sem-resultado">Nenhum aluno encontrado</div>`);
        return;
      }

      $.each(alunos, function (_, aluno) {
        lista.append(`
          <div class="item-aluno"
               data-id="${aluno.idAluno}">
               ${aluno.NomeDoAluno}
          </div>
        `);
      });
    },

    error: function () {
      console.error("Erro ao buscar alunos");
    }
  });
});

// clique no aluno (delegação correta)
$(document).on("click", ".item-aluno", function () {
  // ignora clique no "Nenhum aluno encontrado"
  if ($(this).hasClass("sem-resultado")) return;

  const nome = $(this).text().trim();
  const id = $(this).data("id");

  if (!id) {
    Swal.fire("Atenção", "ID do aluno não encontrado!", "warning");
    return;
  }

  input.val(nome);
  alunoSelecionadoId = id;
  lista.empty();

  console.log("✅ Aluno selecionado:", id, nome);

  // carrega parecer automaticamente
  idParecer(id);
});

// fechar lista ao clicar fora
$(document).on("click", function (e) {
  if (!$(e.target).closest(".campo").length) {
    lista.empty();
  }
});

// ====== GERAR PDF ======
btnPdf.addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  const nomeAluno   = $("#nomeAluno").val();
  const turma       = $("#turma").val();
  const observacoes = $("#observacoes").val();
  const periodo     = $("#periodo").val();
  const nivel       = $("#nivel").val();

  const checkboxesMarcados = document.querySelectorAll(
    "input[type='checkbox']:checked"
  );

  let y = 10;

  pdf.setFontSize(14);
  pdf.text("Parecer – Educação Infantil (BNCC)", 10, y);
  y += 10;

  pdf.setFontSize(12);
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

// ====== LIMPAR ======
btnLimpar.addEventListener("click", () => {
  $("input[type='text'], textarea").val("");
  $("input[type='checkbox']").prop("checked", false);

  lista.empty();
  alunoSelecionadoId = null;
});

// ====== VOLTAR ======
btnVoltar.addEventListener("click", () => {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "dashbord.html";
  }
});

// ====== CARREGAR TITULOS ======
const carregarTitulos = () => {
  $.ajax({
    url: `${API_BASE}/AllTitulos`,
    type: "GET",
    dataType: "json",

    success: function (titulos) {
      $("#cardsContainer").empty();

      $.each(titulos, function (_, titulo) {
        $("#cardsContainer").append(`
          <article class="card">
            <div class="card-titulo">${titulo.NomeDoTitulo}</div>
            <div class="card-conteudo" id="perguntas-${titulo.idTitulo}">
              Carregando perguntas...
            </div>
          </article>
        `);

        carregarPerguntas(titulo.idTitulo);
      });
    },

    error: function () {
      Swal.fire("Erro", "Erro ao carregar títulos", "error");
    }
  });
};

// ====== CARREGAR PERGUNTAS ======
const carregarPerguntas = (idTitulo) => {
  $.ajax({
    url: `${API_BASE}/PerguntasbyTituloid/${idTitulo}`,
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
              data-text="${pergunta.Pergunta}"
              data-id="${pergunta.idPerguntas}"
              data-titulo="${idTitulo}">
            ${pergunta.Pergunta}
          </label><br>
        `);
      });
    },

    error: function () {
      $(`#perguntas-${idTitulo}`).html("Erro ao carregar perguntas");
    }
  });
};

// ====== BUSCAR PARECER DO ALUNO ======
const idParecer = (idAluno) => {
  if (!idAluno) {
    console.warn("⚠️ ID do aluno inválido:", idAluno);
    return;
  }

  $.ajax({
    url: `${API_BASE}/AllPareceres`,
    type: "GET",
    data: { idAluno: idAluno },
    dataType: "json",

    success: function (parecer) {
      console.log("✅ Parecer recebido:", parecer);

      if (!parecer || (Array.isArray(parecer) && parecer.length === 0)) {
        console.info("ℹ️ Aluno ainda não possui parecer.");
        return;
      }

      preencherParecer(parecer);
    },

    error: function (xhr) {
      console.error("❌ Erro AJAX:");
      console.error("Status:", xhr.status);
      console.error("Resposta:", xhr.responseText);

      // 404 = aluno sem parecer (não é erro real)
      if (xhr.status === 404) {
        console.info("ℹ️ Aluno ainda não possui parecer.");
        return;
      }

      Swal.fire("Erro", "Erro ao carregar parecer do aluno.", "error");
    }
  });
};

// ====== PREENCHER PARECER NO FORMULÁRIO ======
function preencherParecer(parecer) {
  // se vier array, pega o primeiro
  const p = Array.isArray(parecer) ? parecer[0] : parecer;

  if (!p) return;

  $("#turma").val(p.Turma || "");
  $("#periodo").val(p.Periodo || "");
  $("#nivel").val(p.Nivel || "");
  $("#observacoes").val(p.Observacoes || "");

  // marca checkboxes do parecer antigo
  if (p.perguntasMarcadas && Array.isArray(p.perguntasMarcadas)) {
    // primeiro desmarca tudo
    $("input[type='checkbox']").prop("checked", false);

    // depois marca as do parecer
    p.perguntasMarcadas.forEach(idPergunta => {
      $(`input[data-id="${idPergunta}"]`).prop("checked", true);
    });
  }
}

// ====== START ======
$(document).ready(function () {
  carregarTitulos();
});