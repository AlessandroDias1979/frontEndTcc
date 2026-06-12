// Seleciona os elementos do DOM
const container = document.querySelector('.container');
const cadastrarBtn = document.querySelector('.cadastrar_btm');
const loginBtn = document.querySelector('.login_btm');

// Evento ao clicar no botão "Cadastrar"
// Adiciona a classe 'active' para alternar a interface (ex: mostrar formulário de cadastro)
cadastrarBtn.addEventListener('click', () => {
    container.classList.add('active');
});

// Evento ao clicar no botão "Login"
// Remove a classe 'active' para voltar para a tela de login
loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
});

// Aguarda o carregamento completo da página
$(document).ready(function() {

    // Ao clicar no botão de cadastro, chama a função de envio de dados
    $('#buttonCadastrar').click(function(){
        enviarParaCadastro();
    });

    // Ao clicar no botão de login, chama a função de validação
    $('#buttonLogin').click(function () {
         receberLogin();
   });
});


// ==========================
// FUNÇÃO: Cadastro de usuário
// ==========================
var enviarParaCadastro = () => {
    $.ajax({
        // Endpoint da API para cadastro
        url: 'https://clickparecer.onrender.com/Usuarios',

        // Tipo de resposta esperada
        dataType: 'json',

        // Método HTTP
        type: 'POST',

        // Tipo de conteúdo enviado
        contentType: 'application/json',

        // Dados enviados para o servidor (convertidos em JSON)
        data: JSON.stringify({
            nome: $('#cadastroDeUsuario').val(),
            email: $('#cadastroDeEmail').val(),
            senha: $('#cadastroDeSenha').val()
        }),

        // Se o cadastro for bem-sucedido
        success: function(dados) {
            Swal.fire({
                title: "Sucesso",
                text: "Usuário cadastrado com sucesso",
                icon: "success"
            }).then(() => {
                // Redireciona para a página inicial após confirmação
                window.location.href = 'index.html';
            });
        },

        // Em caso de erro na requisição
        error: function(err) {
            console.error("Erro ao cadastrar:", err);

            Swal.fire({
                title: "Erro",
                text: "Não foi possível cadastrar o usuário. Verifique os dados ou a conexão com o servidor.",
                icon: "error"
            });
        }
    });
}


// ==========================
// FUNÇÃO: Login do usuário
// ==========================


const receberLogin = () => {
    $.ajax({
        method: 'GET',
        url: 'https://serviconodetcc.onrender.com/LoginUsuarioSenha?Email=' + $('#email').val() + '&Senha=' + $('#senha').val(),
        dataType: 'json',

        success: function(resposta) {
            // Verifica se a resposta existe e tem usuários
            if (resposta && resposta.length > 0) {
                // Usuário encontrado
                window.location.href = 'dashboard.html';
            } else {
                // Usuário não encontrado
                alert('Usuário não existe, cadastre-se');
            }
        },

        error: function() {
            alert('Erro ao consultar o servidor');
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