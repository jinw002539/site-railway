// ✅ CORREÇÃO: Espera o DOM carregar completamente
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Script.js carregado com sucesso!');

    document.getElementById('form').addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('📝 Formulário enviado');

        const formData = new FormData(this);
        const data = {
            nome: formData.get('nome'),
            idade: formData.get('idade')
        };

        console.log('📊 Dados capturados:', data);

        try {
            const response = await fetch('/gravar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.text();
            console.log('✅ Resposta:', result);
            alert(result);

        } catch (error) {
            console.error('❌ Erro:', error);
            alert('Erro ao enviar: ' + error.message);
        }
    });
});