// ===============================
// NAVEGAÇÃO ENTRE AS TELAS
// ===============================
const menuLinks = document.querySelectorAll('.menu-link');
const telas = document.querySelectorAll('.tela');

menuLinks.forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();

        // Remove "active" de todos os links
        menuLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // Esconde todas as telas
        telas.forEach(tela => tela.classList.remove('ativa'));

        // Mostra a tela correspondente
        const target = link.getAttribute('data-target');
        document.getElementById(target).classList.add('ativa');
    });
});


$(document).ready(function () {

    $('#btnCadastrarAluno').click(function (event) {
        event.preventDefault();
        enviarParaCadastroAluno();
    });

    $('#btnListarAluno').click(function (event) {
        event.preventDefault();
        window.location.href = 'listar.html';
    });

    $('#btn-sair').click(function (event) {
        event.preventDefault();
        sairDoSistema();
    });
});


const limparCamposAluno = () => {
    $('#nomeAlunoCadastrar').val("");
    $('#turmaAlunoCadastrar').val("");
};


var enviarParaCadastroAluno = () => {

    let nome = $('#nomeAlunoCadastrar').val().trim();
    let turma = $('#turmaAlunoCadastrar').val().trim();

    if (!nome || !turma) {
        Swal.fire({
            title: "Atenção",
            text: "Preencha o nome e a turma do aluno.",
            icon: "warning"
        });
        return;
    }

    let dadosAluno = {
        NomeAluno: nome,
        Turma: turma
    };

    $.ajax({
        url: 'https://serviconodetcc.onrender.com/CadastrarAluno',
        dataType: 'json',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(dadosAluno),

        success: function (dados) {
            Swal.fire({
                title: "Sucesso",
                text: "Aluno cadastrado com sucesso.",
                icon: "success"
            }).then(() => {
                limparCamposAluno();
            });
        },

        error: function (err) {
            console.error("Erro ao cadastrar aluno:", err);

            Swal.fire({
                title: "Erro",
                text: "Não foi possível cadastrar o aluno.",
                icon: "error"
            });
        }
    });
};


const sairDoSistema = () => {

    Swal.fire({
        title: "Deseja sair?",
        text: "Você será redirecionado para a tela de login.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sim, sair",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            sessionStorage.clear();
            window.location.href = '../index.html';
        }
    });
};