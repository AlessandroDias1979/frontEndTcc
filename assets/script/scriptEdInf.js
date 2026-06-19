const btnPdf = document.getElementById("btnPdf");
const btnLimpar = document.getElementById("btnLimpar");
const btnVoltar = document.getElementById("btn-voltar");
const btnListarAluno = document.getElementById("btnListarAluno");

// Gerar PDF
btnPdf.addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  // Captura dos inputs
  const nomeAluno = document.getElementById("nomeAluno").value;
  const turma = document.getElementById("turma").value;
  const observacoes = document.getElementById("observacoes").value;
  const periodo = document.getElementById("periodo").value;
  const nivel = document.getElementById("nivel").value;

  // Captura dos checkboxes marcados
  const checkboxesMarcados = document.querySelectorAll(
    "input[type='checkbox']:checked"
  );

  let y = 10;

  // Título
  pdf.setFontSize(14);
  pdf.text("Parecer – Educação Infantil (BNCC)", 10, y);
  y += 10;

  // Dados do aluno
  pdf.setFontSize(11);
  pdf.text(`Nome do aluno: ${nomeAluno}`, 10, y); y += 7;
  pdf.text(`Turma: ${turma}`, 10, y); y += 7;
  pdf.text(`Período: ${periodo}`, 10, y); y += 7;
  pdf.text(`Nível de desenvolvimento: ${nivel}`, 10, y); y += 10;

  // Observações
  pdf.text("Observações:", 10, y);
  y += 7;

  const observacoesQuebradas = pdf.splitTextToSize(observacoes, 180);
  pdf.text(observacoesQuebradas, 10, y);
  y += observacoesQuebradas.length * 7 + 5;

  // Conteúdos selecionados
  pdf.text("Aspectos Observados:", 10, y);
  y += 7;

  if (checkboxesMarcados.length === 0) {
    pdf.text("- Nenhum item selecionado.", 10, y);
  } else {
    checkboxesMarcados.forEach((checkbox) => {
      const texto = checkbox.dataset.text;

      if (y > 280) {
        pdf.addPage();
        y = 10;
      }

      pdf.text(`- ${texto}`, 10, y);
      y += 7;
    });
  }

  // Salva o PDF
  pdf.save(`Parecer_${nomeAluno || "Aluno"}.pdf`);
});

// Limpar formulário
btnLimpar.addEventListener("click", () => {
  // Limpa inputs e textarea
  document.querySelectorAll("input[type='text'], textarea").forEach((campo) => {
    campo.value = "";
  });

  // Desmarca todos os checkboxes
  document.querySelectorAll("input[type='checkbox']").forEach((check) => {
    check.checked = false;
  });


});


$(document).ready(function () {
  carregarTitulos();
});


const CarregarTitulos = () => {

  $.ajax({
    url: 'http://localhost:3001/titulos?idTurma=1',
    type: 'GET',
    dataType: 'json',
    success: function (titulos) {

      $("#cardsContainer").empty();

      $.each(titulos, function (index, titulo) {

        const cardHTML = `
          <article class="card">
            <div class="card-titulo">${titulo.nomeTitulo}</div>
            <div class="card-conteudo" id="perguntas-${titulo.idTitulo}">
              Carregando perguntas...
            </div>
          </article>
        `;

        $("#cardsContainer").append(cardHTML);

        // ✅ carregar perguntas deste título
        CarregarPerguntas(titulo.idTitulo);
      });

    },
    error: function () {
      Swal.fire("Erro", "Erro ao carregar títulos", "error");
    }
  });

};

const CarregarPerguntas = (idTitulo) => {

  $.ajax({
    url: `'https://serviconodetcc.onrender.com/perguntas?idTitulo=${idTitulo}'`,
    type: 'GET',
    dataType: 'json',
    success: function (perguntas) {

      const div = $(`#perguntas-${idTitulo}`);
      div.empty();

      $.each(perguntas, function (index, pergunta) {
        div.append(`
          <label class="pergunta-item">
            <input 
              type="checkbox"
              data-text="${pergunta.questao}"
              data-id="${pergunta.id}"
              data-titulo="${idTitulo}"
            >
            ${pergunta.questao}
          </label><br>
        `);
      });

    },
    error: function () {
      $(`#perguntas-${idTitulo}`).html("Erro ao carregar perguntas");
    }
  });

};


const  CarregarrTela  = () => {


   $.ajax({
        url: 'https://serviconodetcc.onrender.com/perguntas?idTitulo=1',
        type: 'GET',
        contentType: 'application/json',
            dataType: 'json',
        success: function (titulo, resposta) {
          $("#titulo").text(titulo);
          $.each(resposta, function (index, pergunta) {
            $("#perguntas").append('<label><input type="checkbox" data-text="' + pergunta.questao + '" /> ' + pergunta.questao + '</label>');
            

            });
            
        },
        error: function (err) {
            console.error(err);
            Swal.fire({
                icon: "error",
                title: "erro ao buscar as perguntas"
});
        }
    });
}

$(document).ready(function () {

  CarregarrTela();

});

document.getElementById("btn-voltar").addEventListener("click", function () {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "dashbord.html"; // página desejada
  }
});


