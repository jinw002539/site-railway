// // ✅ CORREÇÃO: Espera o DOM carregar completamente
// document.addEventListener('DOMContentLoaded', function() {
//     console.log("✅ Script.js carregado e pronto!");

//     document.getElementById("form").addEventListener("submit", async function(e) {
//         e.preventDefault();
//         console.log("📝 Formulário enviado via script.js");

//         const formData = new FormData(this);
//         const data = {
//             nome: formData.get("nome"),
//             idade: formData.get("idade")
//         };

//         console.log("📊 Dados a enviar:", data);

//         try {
//             const response = await fetch("/gravar", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json"
//                 },
//                 body: JSON.stringify(data)
//             });

//             const result = await response.text();
//             console.log("✅ Resposta do servidor:", result);
//             alert(result);

//         } catch (error) {
//             console.error("❌ Erro:", error);
//             alert("Erro: " + error.message);
//         }
//     });
// });

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Script carregado - Sistema pronto!');

    document.getElementById('form').addEventListener('submit', async function(e) {
        e.preventDefault();

        // Captura os dados do formulário
        const formData = new FormData(this);
        const data = {
            nome: formData.get('nome'),
            idade: formData.get('idade')
        };

        try {
            // Envia para o backend
            const response = await fetch('/gravar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            // Mostra a resposta
            const result = await response.text();
            alert(result);

        } catch (error) {
            console.error('Erro:', error);
            alert('Erro de conexão. Tente novamente.');
        }
    });
});