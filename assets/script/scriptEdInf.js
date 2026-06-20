// ====== Elementos ======
const btnPdf = document.getElementById("btnPdf");
const btnLimpar = document.getElementById("btnLimpar");
const btnVoltar = document.getElementById("btn-voltar");

// ====== API ======
const API_BASE = "https://serviconodetcc.onrender.com";

// ====== AUTOCOMPLETE ALUNOS ======
const input = $("#nomeAluno");
const lista = $("#listaAlunos");

// guarda o ID do aluno selecionado e a turma vinda do backend
let alunoSelecionadoId = null;
let turmaSelecionada   = ""; // 👈 NOVO: turma vinda do banco

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
        // 👇 incluímos a turma no data-attribute
        lista.append(`
          <div class="item-aluno"
               data-id="${aluno.idAluno}"
               data-turma="${aluno.Turma || ''}">
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
  if ($(this).hasClass("sem-resultado")) return;

  const nome  = $(this).text().trim();
  const id    = $(this).data("id");
  const turma = $(this).data("turma"); // 👈 captura a turma

  if (!id) {
    Swal.fire("Atenção", "ID do aluno não encontrado!", "warning");
    return;
  }

  input.val(nome);
  alunoSelecionadoId = id;
  turmaSelecionada   = turma || "Não informada"; // 👈 guarda a turma

  // opcional: se você tiver um <span id="turmaInfo"> na tela
  $("#turmaInfo").text(turmaSelecionada);

  lista.empty();

  console.log("✅ Aluno selecionado:", id, nome, "| Turma:", turmaSelecionada);

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

  const nomeAluno = $("#nomeAluno").val();
  const turma     = turmaSelecionada || "Não informada"; // 👈 vem do banco
  const periodo   = $("#periodo").val();
  const nivel     = $("#nivel").val();

  const checkboxesMarcados = document.querySelectorAll(
    "input[type='checkbox']:checked"
  );

  let y = 10;

  pdf.setFontSize(14);
  pdf.text("Parecer – Educação Infantil (BNCC)", 10, y);
  y += 10;

  pdf.setFontSize(12);
  pdf.text(`Nome do aluno: ${nomeAluno}`, 10, y); y += 7;
  pdf.text(`Turma: ${turma}`, 10, y);             y += 7; // 👈 turma do backend
  pdf.text(`Período: ${periodo}`, 10, y);          y += 7;
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
  turmaSelecionada   = "";          // 👈 reseta a variável
  $("#turmaInfo").text("—");        // 👈 limpa a exibição (se existir)
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
  const p = Array.isArray(parecer) ? parecer[0] : parecer;
  if (!p) return;

  // 👇 se o parecer trouxer a turma, sobrescreve a variável
  if (p.Turma) {
    turmaSelecionada = p.Turma;
    $("#turmaInfo").text(p.Turma); // se tiver o span na tela
  }

  $("#periodo").val(p.Periodo || "");
  $("#nivel").val(p.Nivel || "");

  if (p.perguntasMarcadas && Array.isArray(p.perguntasMarcadas)) {
    $("input[type='checkbox']").prop("checked", false);

    p.perguntasMarcadas.forEach(idPergunta => {
      $(`input[data-id="${idPergunta}"]`).prop("checked", true);
    });
  }
}

// ====== START ======
$(document).ready(function () {
  carregarTitulos();
});