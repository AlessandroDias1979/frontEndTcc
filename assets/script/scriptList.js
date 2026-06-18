// ===============================
// ELEMENTOS DO HTML
// ===============================
const btnVoltar = document.getElementById("btn-voltar");

// ===============================
// BOTÃO VOLTAR
// ===============================
btnVoltar.addEventListener("click", function () {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "dashboard.html";
  }
});

// ===============================
// RENDERIZAR TABELA
// ===============================
function renderizarTabela(alunos) {
  const $tabela = $("#tabelaAlunos tbody"); // seleciona o <tbody>
  $tabela.empty();

  if (!alunos || alunos.length === 0) {
    $tabela.append(`<tr><td colspan="3">Nenhum aluno cadastrado.</td></tr>`);
    return;
  }

  alunos.forEach(function (aluno) {
    const linha = `
      <tr>
        <td>${aluno.nome}</td>
        <td>${aluno.turma}</td>
        <td class="acoes">
          <button class="btn-editar"  data-id="${aluno.id}">Editar</button>
          <button class="btn-deletar" data-id="${aluno.id}">Deletar</button>
        </td>
      </tr>
    `;
    $tabela.append(linha);
  });

  // Liga os eventos dos botões depois de inserir as linhas
  $tabela.find(".btn-editar").on("click", function () {
    const id = $(this).data("id");
    const aluno = alunos.find(a => a.id == id);
    editarAluno(aluno);
  });

  $tabela.find(".btn-deletar").on("click", function () {
    const id = $(this).data("id");
    deletarAluno(id);
  });
}

// ===============================
// LISTAR ALUNOS (GET)
// ===============================
function carregarAlunos() {
  $.ajax({
    url: "https://serviconodetcc.onrender.com/AllAlunos",
    method: "GET",
    dataType: "json",
    success: function (alunos) {
      console.log("Alunos recebidos:", alunos); // ajuda no debug
      renderizarTabela(alunos);
    },
    error: function (erro) {
      console.error("Erro ao carregar alunos:", erro);
      alert("Erro ao carregar a lista de alunos.");
    }
  });
}

// ===============================
// DELETAR ALUNO
// ===============================
function deletarAluno(id) {
  if (!confirm("Deseja realmente deletar este aluno?")) return;

  $.ajax({
    url: "https://serviconodetcc.onrender.com/deletarAluno/" + id,
    method: "DELETE",
    success: function () {
      alert("Aluno deletado com sucesso!");
      carregarAlunos();
    },
    error: function (erro) {
      console.error("Erro ao deletar:", erro);
      alert("Erro ao deletar aluno.");
    }
  });
}

// ===============================
// EDITAR ALUNO
// ===============================
function editarAluno(aluno) {
  const novoNome  = prompt("Editar nome:", aluno.nome);
  const novaTurma = prompt("Editar turma:", aluno.turma);

  if (!novoNome || !novaTurma) return;

  const dadosAluno = {
    id: aluno.id,
    nome: novoNome,
    turma: novaTurma
  };

  $.ajax({
    url: "https://serviconodetcc.onrender.com/editarAluno",
    method: "PUT",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify(dadosAluno),
    success: function () {
      alert("Aluno atualizado com sucesso!");
      carregarAlunos();
    },
    error: function (erro) {
      console.error("Erro ao editar:", erro);
      alert("Erro ao editar aluno.");
    }
  });
}

// ===============================
// INICIALIZAÇÃO
// ===============================
$(document).ready(function () {
  carregarAlunos();
});