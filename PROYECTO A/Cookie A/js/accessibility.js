// Funcionalidades de accesibilidad
document.addEventListener('DOMContentLoaded', function() {
    // Toggle de alto contraste
    document.getElementById('contrast-toggle').addEventListener('click', function() {
        document.body.classList.toggle('high-contrast');
        localStorage.setItem('highContrast', document.body.classList.contains('high-contrast'));
    });

    // Verificar si el modo alto contraste estaba activado
    if (localStorage.getItem('highContrast') === 'true') {
        document.body.classList.add('high-contrast');
    }

    // Aumentar tamaño de fuente
    document.getElementById('font-increase').addEventListener('click', function() {
        changeFontSize(1);
    });

    // Disminuir tamaño de fuente
    document.getElementById('font-decrease').addEventListener('click', function() {
        changeFontSize(-1);
    });

    // Restaurar tamaño de fuente por defecto al hacer doble clic en el botón de disminuir
    document.getElementById('font-decrease').addEventListener('dblclick', function() {
        document.documentElement.style.fontSize = '16px';
        localStorage.removeItem('fontSize');
    });
});

function changeFontSize(step) {
    const html = document.documentElement;
    const currentSize = parseFloat(window.getComputedStyle(html, null).getPropertyValue('font-size'));
    const newSize = currentSize + (step * 2);

    // Limitar el tamaño entre 12px y 24px
    if (newSize >= 12 && newSize <= 24) {
        html.style.fontSize = newSize + 'px';
        localStorage.setItem('fontSize', newSize);
    }
}

// Verificar si hay un tamaño de fuente guardado
window.onload = function() {
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
        document.documentElement.style.fontSize = savedFontSize + 'px';
    }

    // Manejar el foco para accesibilidad
    const skipLink = document.querySelector('.skip-link');
    const mainContent = document.getElementById('main-content');

    skipLink.addEventListener('click', function(e) {
        e.preventDefault();
        mainContent.setAttribute('tabindex', '-1');
        mainContent.focus();
    });

    // Restaurar tabindex después de perder el foco
    mainContent.addEventListener('blur', function() {
        this.removeAttribute('tabindex');
    });
};