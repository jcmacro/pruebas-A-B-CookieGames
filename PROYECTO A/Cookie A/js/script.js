// Variables globales
let cart = [];
let selectedPaymentMethod = null;
let currentGameForComment = '';
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let comments = JSON.parse(localStorage.getItem('comments')) || {};

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar modales de Bootstrap
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
    const commentModal = new bootstrap.Modal(document.getElementById('commentModal'));

    // Validación del formulario de login
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', function(event) {
        if (!loginForm.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        }

        loginForm.classList.add('was-validated');

        if (loginForm.checkValidity()) {
            event.preventDefault();
            alert('Inicio de sesión exitoso!');
            loginModal.hide();
        }
    });

    // Validación del formulario de registro
    const registerForm = document.getElementById('registerForm');
    registerForm.addEventListener('submit', function(event) {
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirm').value;

        if (password !== confirmPassword) {
            document.getElementById('registerConfirm').setCustomValidity('Las contraseñas no coinciden');
        } else {
            document.getElementById('registerConfirm').setCustomValidity('');
        }

        if (!registerForm.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        }

        registerForm.classList.add('was-validated');

        if (registerForm.checkValidity()) {
            event.preventDefault();
            alert('Registro exitoso! Ahora puedes iniciar sesión.');
            registerModal.hide();
        }
    });

    // Cargar carrito desde localStorage si existe
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
    }

    // Actualizar botones de favoritos
    updateFavoriteButtons();
});

// Funciones para mostrar modales
function showLoginModal() {
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    loginModal.show();
}

function showRegisterModal() {
    const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
    registerModal.show();
}

function openCommentModal(gameTitle) {
    currentGameForComment = gameTitle;
    const commentModal = new bootstrap.Modal(document.getElementById('commentModal'));

    // Cargar comentario existente si hay uno
    const commentText = document.getElementById('commentText');
    if (comments[gameTitle]) {
        commentText.value = comments[gameTitle];
    } else {
        commentText.value = '';
    }

    commentModal.show();
}

// Función para guardar comentario
function saveComment() {
    const commentText = document.getElementById('commentText').value;

    if (commentText.trim() !== '') {
        comments[currentGameForComment] = commentText;
        localStorage.setItem('comments', JSON.stringify(comments));
        alert('Comentario guardado correctamente!');
    } else {
        alert('Por favor escribe un comentario antes de guardar.');
    }

    const commentModal = bootstrap.Modal.getInstance(document.getElementById('commentModal'));
    commentModal.hide();
}

// Funciones del carrito
function addToCart(event, title, price, link) {
    event.stopPropagation();

    // Verificar si el juego ya está en el carrito
    const existingItem = cart.find(item => item.title === title);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            title: title,
            price: price,
            link: link,
            quantity: 1
        });
    }

    updateCartCount();
    updateCartStorage();

    // Mostrar notificación
    showNotification(`${title} añadido al carrito`);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartCount();
    updateCartStorage();
    renderCartItems();

    if (cart.length === 0) {
        document.getElementById('empty-cart-message').style.display = 'block';
    }
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

function updateCartStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function openCheckout() {
    const checkoutPage = document.getElementById('checkout-page');
    checkoutPage.hidden = false;

    // Forzar reflow para que la transición funcione
    void checkoutPage.offsetWidth;

    checkoutPage.classList.add('show');

    // Deshabilitar scroll del body cuando el carrito está abierto
    document.body.style.overflow = 'hidden';

    renderCartItems();
}

function closeCheckout() {
    const checkoutPage = document.getElementById('checkout-page');
    checkoutPage.classList.remove('show');

    // Habilitar scroll del body cuando el carrito se cierra
    document.body.style.overflow = '';

    setTimeout(() => {
        checkoutPage.hidden = true;
    }, 300);
}

function renderCartItems() {
    const cartItemsContainer = document.getElementById('checkout-items');
    const emptyCartMessage = document.getElementById('empty-cart-message');

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p id="empty-cart-message">Tu carrito está vacío</p>';
        document.getElementById('checkout-total').textContent = '0.00';
        return;
    } else {
        emptyCartMessage.style.display = 'none';
    }

    let html = '';
    let total = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        html += `
            <div class="checkout-item">
                <div class="checkout-item-info">
                    <h4>${item.title}</h4>
                    <p>Cantidad: ${item.quantity} | Precio unitario: $${item.price.toFixed(2)}</p>
                </div>
                <div class="checkout-item-price">$${itemTotal.toFixed(2)}</div>
                <button class="remove-item btn btn-sm btn-danger" onclick="removeFromCart(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });

    cartItemsContainer.innerHTML = html;
    document.getElementById('checkout-total').textContent = total.toFixed(2);
}

// Funciones de métodos de pago
function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    const paymentMethods = document.querySelectorAll('.payment-method');

    paymentMethods.forEach(pm => {
        pm.classList.remove('selected');
    });

    event.currentTarget.classList.add('selected');

    document.getElementById('selected-payment-method').textContent = `Método seleccionado: ${getPaymentMethodName(method)}`;
    document.querySelector('.btn-pay').disabled = false;
}

function getPaymentMethodName(method) {
    switch (method) {
        case 'paypal':
            return 'PayPal';
        case 'credit-card':
            return 'Tarjeta de Crédito';
        case 'bank-transfer':
            return 'Transferencia Bancaria';
        case 'crypto':
            return 'Criptomonedas';
        default:
            return '';
    }
}

function processPayment() {
    if (!selectedPaymentMethod) {
        alert('Por favor selecciona un método de pago');
        return;
    }

    if (cart.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const paymentMethod = getPaymentMethodName(selectedPaymentMethod);

    alert(`Pago de $${total.toFixed(2)} procesado con ${paymentMethod}. ¡Gracias por tu compra!`);

    // Vaciar carrito
    cart = [];
    updateCartCount();
    updateCartStorage();
    renderCartItems();
    closeCheckout();

    // Resetear método de pago
    selectedPaymentMethod = null;
    document.getElementById('selected-payment-method').textContent = 'No has seleccionado un método de pago';
    document.querySelector('.btn-pay').disabled = true;

    // Quitar selección de métodos de pago
    document.querySelectorAll('.payment-method').forEach(pm => {
        pm.classList.remove('selected');
    });
}

// Funciones de favoritos
function toggleFavorite(event, gameTitle) {
    event.stopPropagation();

    const index = favorites.indexOf(gameTitle);
    const button = event.currentTarget;

    if (index === -1) {
        favorites.push(gameTitle);
        button.innerHTML = '<i class="fas fa-star"></i>';
        showNotification(`${gameTitle} añadido a favoritos`);
    } else {
        favorites.splice(index, 1);
        button.innerHTML = '<i class="far fa-star"></i>';
        showNotification(`${gameTitle} eliminado de favoritos`);
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function updateFavoriteButtons() {
    document.querySelectorAll('.game-action-btn').forEach(button => {
        const onclickAttr = button.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes('toggleFavorite')) {
            const gameTitle = onclickAttr.match(/'(.*?)'/)[1];
            if (favorites.includes(gameTitle)) {
                button.innerHTML = '<i class="fas fa-star"></i>';
            } else {
                button.innerHTML = '<i class="far fa-star"></i>';
            }
        }
    });
}

// Función de notificación
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Estilos para notificación (se añaden dinámicamente)
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--primary-color);
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
        opacity: 0;
        transition: opacity 0.3s;
        z-index: 1100;
    }
    
    .notification.show {
        opacity: 1;
    }
`;
document.head.appendChild(notificationStyles);