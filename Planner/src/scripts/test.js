document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('test');
    const textFeld = document.getElementById('ausgabeTest');
    btn.addEventListener('click', () => {
        console.log('Button geklickt!');
        textFeld.innerText = "Dieser Text wurde direkt von der externen app.js geladen!";
        textFeld.style.color = "green";
    });
});