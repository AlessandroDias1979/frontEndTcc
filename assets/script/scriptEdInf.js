// ====== Elementos ======
const btnPdf = document.getElementById("btnPdf");
const btnLimpar = document.getElementById("btnLimpar");
const btnVoltar = document.getElementById("btn-voltar");
const btnSalvar = document.getElementById("btnSalvar");
const btnteste = document.getElementById("btnteste");

// ====== API ======
const API_BASE = "https://serviconodetcc.onrender.com";

// ====== AUTOCOMPLETE ALUNOS ======
const input = $("#nomeAluno");
const lista = $("#listaAlunos");

$(function () {
  carregarAlunos();
  carregarParecer();

});


carregarAlunos = () => {
  $.ajax({
    url: `${API_BASE}/AllAlunos`,
    type: "GET",
    dataType: "json",
    success: function (alunos) {
      const $select = $("#nomeAluno");
      $select.empty();
      $select.append('<option value="">Selecione um aluno</option>');

      alunos.forEach(aluno => {
        $("<option>")
          .val(aluno.idAluno)
          .text(aluno.NomeDoAluno) // confira o nome real no JSON
          .appendTo($select);
      });
    },
    error: function (xhr, status, err) {
      console.error("Erro ao carregar alunos:", status, err, xhr.responseText);
      alert("Não foi possível carregar a lista de alunos.");
    }
  });
};
carregarParecer = () => {
  $.ajax({
    url: `${API_BASE}/AllParecer`,
    type: "GET",
    dataType: "json",
    success: function (pareceres) {
      const $select = $("#parecer");
      $select.empty();
      $select.append('<option value="">Selecione um parecer</option>');

      pareceres.forEach(parecer => {
        $("<option>")
          .val(parecer.idParecer)
          .text(parecer.descricao) // confira o nome real no JSON
          .appendTo($select);
      });
    },
    error: function (xhr, status, err) {
      console.error("Erro ao carregar pareceres:", status, err, xhr.responseText);
      alert("Não foi possível carregar a lista de pareceres.");
    }
  });
};

// guarda o ID do aluno selecionado e a turma vinda do backend
let alunoSelecionadoId = null;
let turmaSelecionada = ""; //  turma vinda do banco

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
        // escapa aspas para não quebrar o HTML
        const turmaSafe = (aluno.Turma || "").toString().replace(/"/g, "&quot;");
        const nomeSafe = (aluno.NomeDoAluno || "").toString();

        //  incluímos a turma no data-attribute
        lista.append(`
          <div class="item-aluno"
               data-id="${aluno.idAluno}"
               data-turma="${turmaSafe}">
               ${nomeSafe}
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

  const nome = $(this).text().trim();
  const id = $(this).attr("data-id");      //  attr ao invés de data (evita cache do jQuery)
  const turma = $(this).attr("data-turma");   //  attr ao invés de data

  if (!id) {
    Swal.fire("Atenção", "ID do aluno não encontrado!", "warning");
    return;
  }

  input.val(nome);
  alunoSelecionadoId = id;
  turmaSelecionada = (turma && turma.trim()) ? turma : "Não informada"; //  guarda a turma

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

btnSalvar.addEventListener("click", () => {

  // 🔎 VALIDAÇÃO DO ALUNO
  if (!$("#nomeAluno").val()) {
    Swal.fire("Atenção", "Selecione um aluno.", "warning");
    return;
  }

  // 🔎 VALIDAÇÃO DO PARECER
  if (!$("#parecer").val()) {
    Swal.fire("Atenção", "Selecione um parecer.", "warning");
    return;
  }

  // 🔎 VALIDAÇÃO DOS CHECKBOXES (já estava)
  const checkboxesMarcados = document.querySelectorAll(
    "input[type='checkbox']:checked"
  );
  if (checkboxesMarcados.length === 0) {
    Swal.fire("Atenção", "Selecione pelo menos uma pergunta.", "warning");
    return;
  } else {
    checkboxesMarcados.forEach((cb) => {
      //const texto = cb.dataset.text || cb.value || "Item sem descrição";
      //escreverTexto(`- ${texto}`, 12);
      $.ajax({
        url: `${API_BASE}/cadastrarQuestionarioResposta`,
        dataType: 'json',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          idAluno: $("#nomeAluno").val(),
          idParecer: $("#parecer").val(),
          idPerguntas: cb.dataset.id
        }),
        timeout: 60000,

        success: function () {
          Swal.fire({
            title: "Sucesso",
            text: "Usuário cadastrado com sucesso.",
            icon: "success"
          }).then(() => {
            console.log("Usuário cadastrado com sucesso.");

          });
        },

        error: function (err) {
          console.error("Erro ao cadastrar:", err);

        }
      });
    });
  }

});

// ====== GERAR PDF ======
btnPdf.addEventListener("click", () => {
  carregar();
});

carregar= async () => {
  const dados = await parecerIa();
  parecer(dados);
}

parecerIa = async () => {
  const checkboxesMarcados = document.querySelectorAll(
    "input[type='checkbox']:checked"
  );

  var texto = "";
    checkboxesMarcados.forEach((cb) => {
      texto += cb.dataset.text ;
    });
    try {
      const response = await fetch('https://node-h8tw.onrender.com/chat', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            mensagem: "Você é um especialista em educação infantil e deve fazer um parecer humanizado para os pais dando sugestões de ações pois o aluno " + $("#nomeAluno option:selected").text() + "sofre " + texto + " O texto deve ter apenas o laudo sem agradecimentos ou dados externos."
         })
      });

      const retorno = await response.json();

      return retorno.resposta;

   } catch (erro) {
      console.error("Erro na requisição:", erro);
   }

}

function parecer(dados){
   const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  // ====== Coleta de dados ======
  const nomeAluno = ($("#nomeAluno").val() || "").trim() + ' - ' + $("#nomeAluno option:selected").text() || "Não informado";
  const parecer = ($("#parecer").val() || "").trim() + ' - ' + $("#parecer option:selected").text() || "Não informado";
  const nivel = ($("#nivel").val() || "").trim() || "Não informado";

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
  escreverTexto(`Nome do aluno: ${nomeAluno}`, 12, true);   
  escreverTexto("Parecer:", 12, true); 
  escreverTexto(parecer, 12);    
  escreverTexto(`Nível de desenvolvimento: ${nivel}`, 12);
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

  escreverTexto(dados, 12);

  // ====== Salvar ======
  const nomeArquivo = `Parecer_${nomeAluno.replace(/\s+/g, "_")}.pdf`;
  pdf.save(nomeArquivo);
}

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
/*const idParecer = (idAluno) => {
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
};*/

// ====== PREENCHER PARECER NO FORMULÁRIO ======
function preencherParecer(parecer) {
  const p = Array.isArray(parecer) ? parecer[0] : parecer;
  if (!p) return;

  //  se o parecer trouxer a turma, sobrescreve a variável
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
};




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

  // Monta o array de objetos para enviar
  const respostas = [];

  checkboxesMarcados.forEach((cb) => {
    respostas.push({
      idAluno: alunoSelecionadoId,
      idParecer: idParecer,
      idPerguntas: cb.dataset.id
    });
  });

  console.log("Enviando respostas:", respostas);

  // Envio via AJAX
  $.ajax({
    url: `${API_BASE}/cadastrarQuestionarioResposta`,
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(respostas),

    success: function () {
      Swal.fire("Sucesso", "Respostas salvas com sucesso!", "success");
    },

    error: function (xhr) {
      console.error("Erro ao salvar:", xhr.responseText);
      Swal.fire("Erro", "Erro ao salvar respostas.", "error");
    }
  });
};

*/
// ====== START ======
$(document).ready(function () {
  carregarTitulos();
});