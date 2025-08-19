document.getElementById("form").addEventListener("submit", async(e) => {
    e.preventDefault();

    try {
        const form = new FormData(e.target);
        const data = {
            nome: form.get("nome"),
            idade: form.get("idade")
        };

        const res = await fetch("/gravar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            throw new Error(`Erro ${res.status}: ${await res.text()}`);
        }

        alert(await res.text());

    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao enviar: " + error.message);
    }
});