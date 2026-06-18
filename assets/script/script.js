const container = document.querySelector('.container');
const cadastrarBtn = document.querySelector('.cadastrar_btm');
const loginBtn = document.querySelector('.login_btm');

cadastrarBtn.addEventListener('click', () => {
    container.classList.add('active');
});

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
});

$(document).ready(function () {

    $('#buttonCadastrar').click(function (event) {
        event.preventDefault();
        enviarParaCadastro();
    });

    $('#buttonLogin').click(function (event) {
        event.preventDefault();
        receberLogin();
    });
});

const limparCamposCadastro = () => {
    $('#cadastroDeUsuario').val("");
    $('#cadastroDeEmail').val("");
    $('#cadastroDeSenha').val("");
};

const limparCamposLogin = () => {
    $('#loginEmail').val("");
    $('#loginSenha').val("");
};

var enviarParaCadastro = () => {

    let usuario = $('#cadastroDeUsuario').val().trim();
    let email = $('#cadastroDeEmail').val().trim();
    let senha = $('#cadastroDeSenha').val().trim();

    if (!usuario || !email || !senha) {
        Swal.fire({
            title: "Atenção",
            text: "Preencha todos os campos antes de cadastrar.",
            icon: "warning"
        });
        return;
    }

    let dadosUsuario = {
        NomeUsuario: usuario,
        Email: email,
        Senha: senha
    };

    $.ajax({
        url: 'https://serviconodetcc.onrender.com/CadastrarUsuario',
        dataType: 'json',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(dadosUsuario),

        success: function (dados) {
            Swal.fire({
                title: "Sucesso",
                text: "Usuário cadastrado com sucesso.",
                icon: "success"
            }).then(() => {
                limparCamposCadastro();
                container.classList.remove('active');
                $('#loginEmail').val(email);
            });
        },

        error: function (err) {
            console.error("Erro ao cadastrar:", err);

            Swal.fire({
                title: "Erro",
                text: "Não foi possível cadastrar o usuário.",
                icon: "error"
            });
        }
    });
};

const receberLogin = () => {

    let email = $('#loginEmail').val().trim();
    let senha = $('#loginSenha').val().trim();

    if (!email || !senha) {
        Swal.fire({
            title: "Atenção",
            text: "Preencha o e-mail e a senha.",
            icon: "warning"
        });
        return;
    }

    $.ajax({
        type: 'GET',
        url: 'https://serviconodetcc.onrender.com/LoginUsuarioSenha?Email='
            + encodeURIComponent(email)
            + '&Senha='
            + encodeURIComponent(senha),
        dataType: 'json',

        success: function (resposta) {
            console.log(resposta);

            if (
                resposta &&
                (
                    resposta === true ||
                    resposta.length > 0 ||
                    resposta.email ||
                    resposta.nome
                )
            ) {
                Swal.fire({
                    title: "Sucesso",
                    text: "Login realizado com sucesso.",
                    icon: "success"
                }).then(() => {
                    limparCamposLogin();
                    window.location.href = 'dashboard.html?idUsuario=' + resposta[0].idUsuario;
                });
            } else {
                Swal.fire({
                    title: "Erro",
                    text: "Usuário ou senha inválidos.",
                    icon: "error"
                });
            }
        },

        error: function (err) {
            console.error("Erro ao consultar o servidor:", err);

            Swal.fire({
                title: "Erro",
                text: "Erro ao consultar o servidor.",
                icon: "error"
            });
        }
    });
};

//   $.ajax({
//       url: 'https://serviconodetcc.onrender.com/LoginUsuarioSenha?Email=' + $('#loginEmail').val() + '&senha=' + $('#loginSenha').val(),

//     //     // Método GET para buscar usuários
//          type: 'GET',

//          contentType: 'application/json',
//          dataType: 'json'});

// }

// $.ajax({
//     // Endpoint com parâmetros de email e senha
//     url: 'https://serviconodetcc.onrender.com/LoginUsuarioSenha?Email='
//         + $('#loginEmail').val() + '&senha=' + $('#loginSenha').val(),

//     // Método GET para buscar usuários
//     type: 'GET',

//     contentType: 'application/json',
//     dataType: 'json',

//     // Se a requisição retornar dados
//     success: function (resposta) {
//         console.log(resposta);

// if (resposta) {
//     let usuarioValido = false;

//     // Percorre a lista de usuários retornados
//     resposta.forEach(usuario => {

//         // Verifica se email e senha coincidem
//         if (usuario.email === $('#loginEmail').val() &&
//             usuario.senha === $('#loginSenha').val()) {
//             usuarioValido = true;
//         }
//     });

//     // Se encontrou usuário válido
//     if (usuarioValido) {
//         // Redireciona para o dashboard
//         window.location.href = 'dashbord.html';
//     } else {
//         alert('Usuário ou senha inválidos');
//     }
// } else {
//     alert('Usuário ou senha inválidos');
// }
//},

// Em caso de erro na requisição
//         error: function (err) {
//             console.error(err);

//             Swal.fire({
//                 icon: "error",
//                 title: "Usuário ou senha invalido"
//             });
//         }
//     });
// }