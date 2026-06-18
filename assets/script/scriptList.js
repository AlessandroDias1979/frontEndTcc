// ===============================
// ELEMENTOS DO HTML
// ===============================
const btnVoltar = document.getElementById("btn-voltar");
const tabela = document.getElementById("tabelaAlunos");

// ===============================
// BOTÃO VOLTAR
// ===============================
btnVoltar.addEventListener("click", function () {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "dashboard.html"; // caminho para acessar o dashboard.html
  }
});

// ===============================
// LISTAR ALUNOS (GET)
// ===============================
function carregarAlunos() {
  $.ajax({
    url: "https://serviconodetcc.onrender.com/AllAlunos",
    method: "GET",
    dataType: "json",

    success: function (alunos) {
      renderizarTabela(alunos);
    },

    error: function (erro) {
      console.error("Erro ao carregar alunos:", erro);
      alert("Erro ao carregar a lista de alunos.");
    }
  });
}

// ===============================
// RENDERIZAR TABELA
// ===============================
function renderizarTabela(alunos) {
  tabela.innerHTML = "";

  if (alunos.length === 0) {
    tabela.innerHTML = `
      <tr>
        <td colspan="3" style="text-align:center;">Nenhum aluno cadastrado.</td>
      </tr>
`;
    return;
  }

  alunos.forEach(function (aluno) {
    const tr = document.createElement("tr");

    // Coluna Nome
    const tdNome = document.createElement("td");
    tdNome.textContent = aluno.nome;

    // Coluna Turma
    const tdTurma = document.createElement("td");
    tdTurma.textContent = aluno.turma;

    // Coluna Ações
    const tdAcoes = document.createElement("td");
    tdAcoes.classList.add("acoes");

    // Botão Editar
    const btnEditar = document.createElement("button");
    btnEditar.textContent = "Editar";
    btnEditar.classList.add("btn-editar");
    btnEditar.onclick = function () {
      editarAluno(aluno);
    };

    // Botão Deletar
    const btnDeletar = document.createElement("button");
    btnDeletar.textContent = "Deletar";
    btnDeletar.classList.add("btn-deletar");
    btnDeletar.onclick = function () {
      deletarAluno(aluno.id);
    };

    tdAcoes.appendChild(btnEditar);
    tdAcoes.appendChild(btnDeletar);

    tr.appendChild(tdNome);
    tr.appendChild(tdTurma);
    tr.appendChild(tdAcoes);

    tabela.appendChild(tr);
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
  const novoNome = prompt("Editar nome:", aluno.nome);
  const novaTurma = prompt("Editar turma:", aluno.turma);

  if (!novoNome || !novaTurma) return;

  const dadosAluno = {
    id: aluno.id,
    nome: novoNome,
    turma: novaTurma
  };

  $.ajax({
    url: "https://serviconodetcc.onrender.com/editarAluno",
    method: "PUT", // se der erro, troque para "POST"
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