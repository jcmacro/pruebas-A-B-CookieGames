// Variables globales
let cartItems = [];
let currentGame = null;

// Funciones principales
function addToCart(event, name, price) {
    event.stopPropagation();
    cartItems.push({
        name,
        price
    });
    updateCartCount();
    showAlert(`"${name}" añadido al carrito`);
}

function updateCartCount() {
    document.getElementById('cart-count').textContent = cartItems.length;
}

function openCart() {
    if (cartItems.length === 0) {
        showAlert("Tu carrito está vacío");
        return;
    }

    const total = cartItems.reduce((sum, item) => sum + item.price, 0);
    const itemsList = cartItems.map(item =>
        `• ${item.name} - $${item.price.toFixed(2)}`
    ).join('\n');

    showAlert(`🛒 Carrito (${cartItems.length} items)\n\n${itemsList}\n\n💵 Total: $${total.toFixed(2)}`);
}

function openGame(name) {
    currentGame = name;
    showAlert(`Abriendo "${name}"...`);
    // Redirigir a la página del juego en producción
}

function openComments(event, name) {
    event.stopPropagation();
    currentGame = name;
    const comment = prompt(`Deja tu comentario sobre "${name}":`);
    if (comment) {
        showAlert(`✔ Comentario sobre "${name}" enviado`);
    }
}

function showHome() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function showRegister() {
    showAlert("Formulario de registro abierto");
    // Abrir modal de registro en producción
}

function showLogin() {
    // Implementación mejorada del login
    const email = prompt("Ingrese su correo electrónico:");
    if (email) {
        const password = prompt("Ingrese su contraseña:");
        if (password) {
            showAlert(`Bienvenido de vuelta! (${email})`);
            // Aquí iría la lógica real de autenticación
        }
    }
}

function showAlert(message) {
    alert(message);
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
});