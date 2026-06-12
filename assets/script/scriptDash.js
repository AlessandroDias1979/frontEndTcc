const btnCadastrarAluno = document.querySelector('#btnCadastrarAluno');
const btnListarAluno = document.querySelector('#btnListarAluno');

document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".menu-link");
  const telas = document.querySelectorAll(".tela");

  function ativarTela(idTela) {
    // Remove ativo das telas
    telas.forEach(t => t.classList.remove("ativa"));

    // Ativa a tela selecionada
    const tela = document.getElementById(idTela);
    if (tela) tela.classList.add("ativa");
  }

  function ativarLink(linkClicado) {
    links.forEach(l => l.classList.remove("active"));
    linkClicado.classList.add("active");
  }

  // Clique no menu
  links.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      const alvo = link.dataset.target;
      ativarTela(alvo);
      ativarLink(link);

      // Atualiza hash (URL) ex.: #alunos ou #pareceres
      const href = link.getAttribute("href");
      if (href) history.pushState(null, "", href);
    });
  });

  // Se abrir com hash na URL, abre a tela correspondente
  const hash = window.location.hash; // #alunos ou #pareceres
  if (hash) {
    const linkHash = Array.from(links).find(l => l.getAttribute("href") === hash);
    if (linkHash) {
      const alvo = linkHash.dataset.target;
      ativarTela(alvo);
      ativarLink(linkHash);
    }
  }

  const btnSair = document.getElementById("btn-sair");
  btnSair?.addEventListener("click", () => {
    const confirmar = confirm("Deseja realmente sair?");
    if (confirmar) {
      // Se você tiver login, pode limpar aqui:
      // localStorage.clear();
      // sessionStorage.clear();
      window.location.href = "index.html"; // troque para a página de login se tiver
    }
  });
});
    
 //POST DOS ALUNOS
$(document).ready(function () {

    $('#btnCadastrarAluno').click(function () {
        enviarParaCadastroAluno();
    });

});

// Envia o serviço para banco de dados
function enviarParaCadastroAluno() {

    const nome = $('#nomeAlunoCadastrar').val();
    const turma = $('#turmaAlunoCadastrar').val();

    if (!nome || !turma) {
        Swal.fire({
            title: "Atenção",
            text: "Preencha todos os campos!",
            icon: "warning"
        });
        return;
    }

    $.ajax({
        url: 'http://localhost:3001/alunos',
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify({
            nome: nome,
            turma: turma
        }),
        success: function (response) {
            Swal.fire({
                title: "Sucesso",
                text: "Aluno cadastrado com sucesso",
                icon: "success"
            }).then(() => {
                window.location.reload(); // Recarrega a página para mostrar o novo aluno
            });
        },
        error: function (err) {
            console.error(err);
            Swal.fire({
                title: "Erro",
                text: "Erro ao cadastrar aluno",
                icon: "error"
            });
        }
    });
}

document.getElementById("btnListarAluno").addEventListener("click", function () {
  window.location.href = "listar.html"; // página desejada
});


