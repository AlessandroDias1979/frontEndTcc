const btnVoltar = document.getElementById("btn-voltar");

document.getElementById("btn-voltar").addEventListener("click", function () {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "dashbord.html"; // página desejada
  }
});

// Lista de alunos (simulação – depois pode vir de API ou banco)
let alunos = [
  { id: 1, nome: "João Silva", turma: "1º Ano A" },
  { id: 2, nome: "Maria Souza", turma: "2º Ano B" },
  { id: 3, nome: "Pedro Santos", turma: "3º Ano A" }
];

const tabela = document.getElementById("tabelaAlunos");

function renderizarTabela() {
  tabela.innerHTML = "";

  alunos.forEach((aluno, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${aluno.nome}</td>
      <td>${aluno.turma}</td>
      <td class="acoes">
        <button class="btn-editar" onclick="editarAluno(${index})">Editar</button>
        <button class="btn-deletar" onclick="deletarAluno(${index})">Deletar</button>
      </td>
    `;

    tabela.appendChild(tr);
  });
}

function editarAluno(index) {
  const novoNome = prompt("Editar nome:", alunos[index].nome);
  const novaTurma = prompt("Editar turma:", alunos[index].turma);

  if (novoNome && novaTurma) {
    alunos[index].nome = novoNome;
    alunos[index].turma = novaTurma;
    renderizarTabela();
  }
}

function deletarAluno(index) {
  if (confirm("Deseja realmente deletar este aluno?")) {
    alunos.splice(index, 1);
    renderizarTabela();
  }
}

// Carrega a tabela ao abrir a página
renderizarTabela();
