// Cart state management
let cartState = {
    items: [],
    total: 0
};

// Format price in Indian Rupees
const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(price / 100);
};

// Fetch cart data from API
async function fetchCartData() {
    try {
        const response = await fetch('https://cdn.shopify.com/s/files/1/0883/2188/4479/files/apiCartData.json?v=1728384889');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching cart data:', error);
        return null;
    }
}

// Update cart totals
function updateCartTotals() {
    const subtotal = cartState.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal; // Add tax or shipping if needed

    document.getElementById('subtotal').textContent = formatPrice(subtotal);
    document.getElementById('total').textContent = formatPrice(total);
    cartState.total = total;

    // Save to localStorage
    localStorage.setItem('cartState', JSON.stringify(cartState));
}

// Create cart item HTML
function createCartItemHTML(item) {
    return `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-info">
                <img src="${item.image}" alt="${item.title}">
                <div>
                    <h3>${item.title}</h3>
                    <p>${item.product_description}</p>
                </div>
            </div>
            <div class="price">${formatPrice(item.price)}</div>
            <div class="quantity">
                <input type="number" 
                       class="quantity-input" 
                       value="${item.quantity}" 
                       min="1" 
                       data-id="${item.id}">
            </div>
            <div class="subtotal">${formatPrice(item.price * item.quantity)}</div>
            <button class="remove-btn" data-id="${item.id}">🗑️</button>
        </div>
    `;
}

// Update cart display
function updateCartDisplay() {
    const cartItemsList = document.getElementById('cartItemsList');
    cartItemsList.innerHTML = cartState.items.map(item => createCartItemHTML(item)).join('');
    updateCartTotals();
}

// Handle quantity change
function handleQuantityChange(event) {
    const input = event.target;
    if (!input.matches('.quantity-input')) return;

    const id = parseInt(input.dataset.id);
    const quantity = parseInt(input.value);

    if (quantity < 1) {
        input.value = 1;
        return;
    }

    const itemIndex = cartState.items.findIndex(item => item.id === id);
    if (itemIndex !== -1) {
        cartState.items[itemIndex].quantity = quantity;
        updateCartDisplay();
    }
}

// Handle item removal
function handleRemoveItem(event) {
    const button = event.target;
    if (!button.matches('.remove-btn')) return;

    const id = parseInt(button.dataset.id);
    showRemoveModal(id);
}

// Modal functionality
function showRemoveModal(itemId) {
    const modal = document.getElementById('removeModal');
    modal.style.display = 'block';

    const confirmBtn = document.getElementById('confirmRemove');
    const cancelBtn = document.getElementById('cancelRemove');

    confirmBtn.onclick = () => {
        cartState.items = cartState.items.filter(item => item.id !== itemId);
        updateCartDisplay();
        modal.style.display = 'none';
    };

    cancelBtn.onclick = () => {
        modal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

// Initialize cart
async function initializeCart() {
    // Show loader
    document.getElementById('loader').style.display = 'block';

    // Try to load from localStorage first
    const savedCart = localStorage.getItem('cartState');
    if (savedCart) {
        cartState = JSON.parse(savedCart);
        updateCartDisplay();
    }

    // Fetch fresh data from API
    const data = await fetchCartData();
    if (data) {
        cartState.items = data.items;
        updateCartDisplay();
    }

    // Hide loader
    document.getElementById('loader').style.display = 'none