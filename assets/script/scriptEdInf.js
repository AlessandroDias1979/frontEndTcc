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

  // ====== Coleta de dados ======
  const nomeAluno = ($("#nomeAluno").val() || "").trim() || "Não informado";
  const turma     = turmaSelecionada || "Não informada";
  const parecer   = ($("#parecer").val() || "").trim() || "Não informado";
  const nivel     = ($("#nivel").val() || "").trim() || "Não informado";

  const checkboxesMarcados = document.querySelectorAll(
    "input[type='checkbox']:checked"
  );

  // ====== Configurações de layout ======
  const margemEsq = 10;
  const larguraUtil = 190; // 210mm (A4) - 2 * margem
  const limiteY = 280;
  let y = 15;

  // Função utilitária para escrever texto com quebra automática e nova página
  const escreverTexto = (texto, tamanhoFonte = 12, negrito = false) => {
    pdf.setFontSize(tamanhoFonte);
    pdf.setFont("helvetica", negrito ? "bold" : "normal");

    const linhas = pdf.splitTextToSize(texto, larguraUtil);
    linhas.forEach((linha) => {
      if (y > limiteY) {
        pdf.addPage();
        y = 15;
      }
      pdf.text(linha, margemEsq, y);
      y += tamanhoFonte * 0.5 + 2;
    });
  };

  // ====== Cabeçalho ======
  escreverTexto("Parecer - Educação Infantil (BNCC)", 14, true);
  y += 3;

  // ====== Dados do aluno ======
  escreverTexto(`Nome do aluno: ${nomeAluno}`, 12);
  escreverTexto(`Turma: ${turma}`, 12);
  escreverTexto(`Nível de desenvolvimento: ${nivel}`, 12);
  y += 3;

  // ====== Parecer ======
  escreverTexto("Parecer:", 12, true);
  escreverTexto(parecer, 12);
  y += 3;


  // ====== Aspectos Observados ======
  escreverTexto("Aspectos Observados:", 12, true);

  if (checkboxesMarcados.length === 0) {
    escreverTexto("- Nenhum item selecionado.", 12);
  } else {
    checkboxesMarcados.forEach((cb) => {
      const texto = cb.dataset.text || cb.value || "Item sem descrição";
      escreverTexto(`- ${texto}`, 12);
    });
  }

  // ====== Salvar ======
  const nomeArquivo = `Parecer_${nomeAluno.replace(/\s+/g, "_")}.pdf`;
  pdf.save(nomeArquivo);
});

// ====== VOLTAR ======
btnVoltar.addEventListener("click", () => {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "../dashbord.html";
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
      console.error("Erro AJAX:");
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

/*const cadastrarRespostas = (idParecer) => {
  if (!alunoSelecionadoId) {
    Swal.fire("Atenção", "Selecione um aluno.", "warning");
    return;
  }

  if (!idParecer) {
    Swal.fire("Erro", "ID do parecer não informado.", "error");
    return;
  }

  const checkboxesMarcados = document.querySelectorAll(
    "input[type='checkbox']:checked"
  );

  if (checkboxesMarcados.length === 0) {
    Swal.fire("Atenção", "Selecione pelo menos uma pergunta.", "warning");
    return;
  }

  //  Monta o array de objetos para enviar
  const respostas = [];

  checkboxesMarcados.forEach((cb) => {
    respostas.push({
      idAluno: alunoSelecionadoId,
      idParecer: idParecer,
      idPerguntas: cb.dataset.id
    });
  });

  console.log(" Enviando respostas:", respostas);
  //  Envio via AJAX
  $.ajax({
    url: `${API_BASE}/cadastrarQuestionarioResposta`,
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(respostas), //  array completo

    success: function () {
      Swal.fire("Sucesso", "Respostas salvas com sucesso!", "success");
    },

    error: function (xhr) {
      console.error("Erro ao salvar:", xhr.responseText);
      Swal.fire("Erro", "Erro ao salvar respostas.", "error");
    }
  });
};*/

// ====== START ======
$(document).ready(function () {
  carregarTitulos();
});