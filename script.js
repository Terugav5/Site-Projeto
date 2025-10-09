
const professoresAutorizados = [
    { email: "testesocialxx@gmail.com", cpf: "47753467840" },
    { email: "danielfrancocrz@gmail.com", cpf: "12345678910" },
    { email: "coordenadora@senai.sp.gov.br", cpf: "11122233344" },
    { email: "maria.silva@senai.sp.gov.br", cpf: "55566677788" }
  ];
  
  const loginForm = document.getElementById('loginForm');
  const feedbackDiv = document.getElementById('feedback');
  const feedbackText = document.getElementById('feedback-text');
  
  function mostrarMensagem(texto, tipo) {
      feedbackDiv.style.display = 'block';
      feedbackText.textContent = texto;
      feedbackDiv.className = 'feedback-message feedback-' + tipo;
      setTimeout(() => {
          feedbackDiv.style.display = 'none';
      }, 3000);
  }
  
  loginForm.addEventListener('submit', function(event) {
      event.preventDefault();
  
      const email = document.getElementById('email').value.trim().toLowerCase();
      const cpfInput = document.getElementById('cpf').value.trim();
  
      const cpfLimpo = cpfInput.replace(/[^0-9]/g, '');
  
      if (cpfLimpo.length !== 11 || !/^\d{11}$/.test(cpfLimpo)) {
          mostrarMensagem('CPF inválido. Insira 11 dígitos numéricos.', 'error');
          document.getElementById('cpf').focus();
          return;
      }
  
      const professorEncontrado = professoresAutorizados.find(p => 
          p.email === email && p.cpf === cpfLimpo
      );
  
      if (professorEncontrado) {
          localStorage.setItem('loggedInUser', email);
          setTimeout(() => {
              window.location.href = 'dashboard.html';
          }, 1000);
      } else {
          mostrarMensagem('❌ Email ou CPF não autorizados.\nApenas professores cadastrados podem entrar.', 'error');
          document.getElementById('email').value = '';
          document.getElementById('cpf').value = '';
          document.getElementById('email').focus();
      }
  });