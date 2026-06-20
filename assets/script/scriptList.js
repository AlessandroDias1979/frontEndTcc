
// ELEMENTOS DO HTML
const btnVoltar = document.getElementById("btn-voltar");

// BOTÃO VOLTAR

btnVoltar.addEventListener("click", function () {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "dashboard.html";
  }
});

// FUNÇÃO AUXILIAR: pega o ID correto do aluno
// (resolve o problema do "undefined")

function getId(aluno) {
  return aluno.id ?? aluno.Id ?? aluno.ID ?? aluno.idAluno ?? aluno.IdAluno;
}

// RENDERIZAR TABELA
function renderizarTabela(alunos) {
  const $tabela = $("#tabelaAlunos tbody");
  $tabela.empty();

  if (!alunos || alunos.length === 0) {
    $tabela.append(`<tr><td colspan="3">Nenhum aluno cadastrado.</td></tr>`);
    return;
  }

  alunos.forEach(function (aluno) {
    const idAluno = getId(aluno);
    const linha = `
      <tr>
        <td>${aluno.NomeDoAluno}</td>
        <td>${aluno.Turma}</td>
        <td class="acoes">
          <button class="btn-editar"  data-id="${idAluno}">Editar</button>
          <button class="btn-deletar" data-id="${idAluno}">Deletar</button>
        </td>
      </tr>
    `;
    $tabela.append(linha);
  });

  // Liga os eventos dos botões depois de inserir as linhas
  $tabela.find(".btn-editar").on("click", function () {
    const id = $(this).data("id");
    const aluno = alunos.find(a => getId(a) == id);
    editarAluno(aluno);
  });

  $tabela.find(".btn-deletar").on("click", function () {
    const id = $(this).data("id");
    deletarAluno(id);
  });
}

// LISTAR ALUNOS (GET)
function carregarAlunos() {
  $.ajax({
    url: "https://serviconodetcc.onrender.com/AllAlunos",
    method: "GET",
    dataType: "json",
    success: function (alunos) {
      console.log("Alunos recebidos:", alunos);
      renderizarTabela(alunos);
    },
    error: function (erro) {
      console.error("Erro ao carregar alunos:", erro);
      alert("Erro ao carregar a lista de alunos.");
    }
  });
}

// DELETAR ALUNO
function deletarAluno(id) {
  if (!id || id === "undefined") {
    alert("ID do aluno não encontrado. Verifique o console (F12).");
    return;
  }

  if (!confirm("Deseja realmente deletar este aluno?")) return;

  $.ajax({
    url: "https://serviconodetcc.onrender.com/deletarAluno/" + id,
    method: "DELETE",
    success: function () {
      alert("Aluno deletado com sucesso!");
      carregarAlunos();
    },
    error: function (xhr) {
      console.error("Erro ao deletar:", xhr.status, xhr.responseText);
      alert("Erro ao deletar aluno.");
    }
  });
}

// EDITAR ALUNO (com modal dinâmico)
function editarAluno(aluno) {
  // Cria o modal direto no JS (sem precisar alterar HTML/CSS)
  const modalHTML = `
    <div id="modalEditar" style="
      position:fixed; inset:0; background:rgba(0,0,0,0.5);
      display:flex; justify-content:center; align-items:center; z-index:9999;
      font-family:Arial, sans-serif;">
      <div style="background:#fff; padding:25px 30px; border-radius:10px;
                  width:90%; max-width:400px; box-shadow:0 5px 20px rgba(0,0,0,0.3);">
        <h3 style="margin-top:0; color:#333;">Editar Aluno</h3>

        <label style="display:block; margin:12px 0 5px; font-weight:bold; color:#555;">
          Nome do Aluno:
        </label>
        <input type="text" id="editNome" value="${aluno.NomeDoAluno}" style="
          width:100%; padding:8px 10px; border:1px solid #ccc;
          border-radius:5px; font-size:14px; box-sizing:border-box;">

        <label style="display:block; margin:12px 0 5px; font-weight:bold; color:#555;">
          Turma:
        </label>
        <input type="text" id="editTurma" value="${aluno.Turma}" style="
          width:100%; padding:8px 10px; border:1px solid #ccc;
          border-radius:5px; font-size:14px; box-sizing:border-box;">

        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
          <button id="btnSalvarEdicao" style="
            padding:8px 16px; border:none; border-radius:5px; cursor:pointer;
            font-weight:bold; background:#28a745; color:#fff;">Salvar</button>
          <button id="btnCancelarEdicao" style="
            padding:8px 16px; border:none; border-radius:5px; cursor:pointer;
            font-weight:bold; background:#6c757d; color:#fff;">Cancelar</button>
        </div>
      </div>
    </div>
  `;

  // Adiciona o modal na tela
  $("body").append(modalHTML);
  $("#editNome").focus();

  // Fecha o modal
  function fecharModal() {
    $("#modalEditar").remove();
  }

  // Botão cancelar
  $("#btnCancelarEdicao").on("click", fecharModal);

  // Fechar ao clicar fora do conteúdo
  $("#modalEditar").on("click", function (e) {
    if (e.target.id === "modalEditar") fecharModal();
  });

  // Fechar com ESC
  $(document).on("keydown.modalEditar", function (e) {
    if (e.key === "Escape") {
      fecharModal();
      $(document).off("keydown.modalEditar");
    }
  });

  // Botão salvar
  $("#btnSalvarEdicao").on("click", function () {
    const novoNome  = $("#editNome").val().trim();
    const novaTurma = $("#editTurma").val().trim();

    if (!novoNome || !novaTurma) {
      alert("Nome e turma não podem ficar vazios.");
      return;
    }

    const dadosAluno = {
      id: getId(aluno),
      NomeDoAluno: novoNome,
      Turma: novaTurma
    };

    $.ajax({
      url: "https://serviconodetcc.onrender.com/editarAluno",
      method: "PUT",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify(dadosAluno),
      success: function () {
        alert("Aluno atualizado com sucesso!");
        fecharModal();
        carregarAlunos();
      },
      error: function (xhr) {
        console.error("Erro ao editar:", xhr.status, xhr.responseText);
        alert("Erro ao editar aluno.");
      }
    });
  });
}

// INICIALIZAÇÃO
$(document).ready(function () {
  carregarAlunos();
});