// Captura o container principal e os botões de alternância entre Login e Cadastro
const container = document.querySelector('.container');
const cadastrarBtn = document.querySelector('.cadastrar_btm');
const loginBtn = document.querySelector('.login_btm');

// Alterna a exibição entre os formulários de login e cadastro
cadastrarBtn.addEventListener('click', () => container.classList.add('active'));
loginBtn.addEventListener('click', () => container.classList.remove('active'));

// URL base da API hospedada no Render
const API_BASE = 'https://serviconodetcc.onrender.com';

// Associa os cliques dos botões às funções de cadastro e login quando o DOM carrega
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

// Limpa todos os campos do formulário de cadastro
const limparCamposCadastro = () => {
    $('#cadastroDeUsuario, #cadastroDeEmail, #cadastroDeSenha').val("");
};

// Limpa todos os campos do formulário de login
const limparCamposLogin = () => {
    $('#loginEmail, #loginSenha').val("");
};

// Exibe um alerta com indicador de carregamento durante requisições
const mostrarLoading = (titulo = "Processando...") => {
    Swal.fire({
        title: titulo,
        text: "Aguarde um momento.",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });
};

// Valida o formato do e-mail usando expressão regular
const validarEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Valida os dados e envia o cadastro do usuário para a API via POST
const enviarParaCadastro = () => {
    const usuario = $('#cadastroDeUsuario').val().trim();
    const email = $('#cadastroDeEmail').val().trim().toLowerCase();
    const senha = $('#cadastroDeSenha').val();

    if (!usuario || !email || !senha) {
        Swal.fire({ title: "Atenção", text: "Preencha todos os campos antes de cadastrar.", icon: "warning" });
        return;
    }

    if (!validarEmail(email)) {
        Swal.fire({ title: "Atenção", text: "Informe um e-mail válido.", icon: "warning" });
        return;
    }

    if (senha.length < 6) {
        Swal.fire({ title: "Atenção", text: "A senha deve ter pelo menos 6 caracteres.", icon: "warning" });
        return;
    }

    const dadosUsuario = { NomeUsuario: usuario, Email: email, Senha: senha };

    mostrarLoading("Cadastrando...");

    $.ajax({
        url: `${API_BASE}/CadastrarUsuario`,
        dataType: 'json',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(dadosUsuario),
        timeout: 60000,

        success: function () {
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
            let msg = "Não foi possível cadastrar o usuário.";
            if (err.status === 409) msg = "E-mail já cadastrado.";
            else if (err.status === 0) msg = "Sem conexão com o servidor.";
            Swal.fire({ title: "Erro", text: msg, icon: "error" });
        }
    });
};

// Autentica o usuário na API e redireciona para a dashboard em caso de sucesso

const receberLogin = () => {
    const email = $('#loginEmail').val().trim().toLowerCase();
    const senha = $('#loginSenha').val();

    if (!email || !senha) {
        Swal.fire({ title: "Atenção", text: "Preencha o e-mail e a senha.", icon: "warning" });
        return;
    }

    mostrarLoading("Entrando...");

    // Monta a URL com Email e Senha (com letras maiúsculas, como a API espera)
    const url = `${API_BASE}/LoginUsuarioSenha?Email=${encodeURIComponent(email)}&Senha=${encodeURIComponent(senha)}`;

    $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        timeout: 60000,

        success: function (resposta) {
            const usuario = Array.isArray(resposta) ? resposta[0] : resposta;

            if (usuario && usuario.idUsuario) {
                sessionStorage.setItem('idUsuario', usuario.idUsuario);
                Swal.fire({
                    title: "Sucesso",
                    text: "Login realizado com sucesso.",
                    icon: "success"
                }).then(() => {
                    limparCamposLogin();
                    window.location.href = `./dashboard.html?idUsuario=${usuario.idUsuario}`;
                });
            } else {
                Swal.fire({ title: "Erro", text: "Usuário ou senha inválidos.", icon: "error" });
            }
        },

        error: function (err) {
            console.error("Erro ao consultar o servidor:", err);
            let msg = "Erro ao consultar o servidor.";
            if (err.status === 401) msg = "Usuário ou senha inválidos.";
            else if (err.status === 0) msg = "Sem conexão com o servidor.";
            else if (err.status === 404) msg = "Serviço de login não encontrado.";
            else if (err.status === 500) msg = "Erro interno no servidor.";
            else if (err.statusText === "timeout") msg = "Tempo de resposta esgotado.";
            Swal.fire({ title: "Erro", text: msg, icon: "error" });
        },

        complete: function () {
            esconderLoading();
        }
    });
};
