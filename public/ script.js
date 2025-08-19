document.getElementById("form").addEventListener("submit", async(e) => {
    e.preventDefault();
    const form = new FormData(e.target);

    const res = await fetch("/gravar", {
        method: "POST",
        body: JSON.stringify({
            nome: form.get("nome"),
            idade: form.get("idade")
        }),
        headers: { "Content-Type": "application/json" }
    });

    alert(await res.text());
});