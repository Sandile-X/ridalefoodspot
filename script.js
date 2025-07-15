// Global variables
let cart = [];
let isCartOpen = false;

// DOM elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const cartSidebar = document.getElementById('cart');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.querySelector('.cart-count');

// Initialize the website
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
    setupEventListeners();
    loadCartFromStorage();
    updateCartDisplay();
});

// Initialize website functionality
function initializeWebsite() {
    // Show first menu category
    showCategory('kota');
    
    // Add scroll effect to header
    window.addEventListener('scroll', handleScroll);
    
    // Initialize smooth scrolling for navigation
    setupSmoothScrolling();
}

// Setup event listeners
function setupEventListeners() {
    // Mobile menu toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }
    
    // Order form submission
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', handleOrderSubmission);
    }
    
    // Close cart when clicking outside
    document.addEventListener('click', function(e) {
        if (isCartOpen && !cartSidebar.contains(e.target) && !e.target.closest('.cart-btn')) {
            toggleCart();
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isCartOpen) {
            toggleCart();
        }
    });
}

// Handle scroll effects
function handleScroll() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
}

// Setup smooth scrolling
function setupSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offsetTop = target.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                    // Close mobile menu if open
                    if (navMenu.classList.contains('active')) {
                        toggleMobileMenu();
                    }
                }
            }
        });
    });
}

// Toggle mobile menu
function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    
    // Animate hamburger
    const bars = hamburger.querySelectorAll('.bar');
    if (hamburger.classList.contains('active')) {
        bars[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
        bars[1].style.opacity = '0';
        bars[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
    } else {
        bars[0].style.transform = 'none';
        bars[1].style.opacity = '1';
        bars[2].style.transform = 'none';
    }
}

// Menu category switching
function showCategory(categoryName) {
    // Hide all categories
    const categories = document.querySelectorAll('.menu-category');
    categories.forEach(category => {
        category.classList.remove('active');
    });
    
    // Show selected category
    const selectedCategory = document.getElementById(categoryName);
    if (selectedCategory) {
        selectedCategory.classList.add('active');
    }
    
    // Update tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Find and activate the clicked tab
    const activeTab = Array.from(tabButtons).find(btn => 
        btn.textContent.toLowerCase().includes(categoryName) ||
        btn.onclick.toString().includes(categoryName)
    );
    if (activeTab) {
        activeTab.classList.add('active');
    }
}

// Scroll to menu section
function scrollToMenu() {
    const menuSection = document.getElementById('menu');
    if (menuSection) {
        const offsetTop = menuSection.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// Cart functionality
function addToCart(itemName, price) {
    const existingItem = cart.find(item => item.name === itemName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: itemName,
            price: price,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    saveCartToStorage();
    showAddToCartFeedback(itemName);
}

function removeFromCart(itemName) {
    cart = cart.filter(item => item.name !== itemName);
    updateCartDisplay();
    saveCartToStorage();
}

function updateQuantity(itemName, newQuantity) {
    const item = cart.find(item => item.name === itemName);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(itemName);
        } else {
            item.quantity = newQuantity;
            updateCartDisplay();
            saveCartToStorage();
        }
    }
}

function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalElement = document.getElementById('cartTotal');
    const cartCountElement = document.querySelector('.cart-count');
    
    // Clear current items
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        cartTotalElement.textContent = '0.00';
        cartCountElement.textContent = '0';
        return;
    }
    
    let total = 0;
    let totalItems = 0;
    
    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>R${item.price.toFixed(2)} each</p>
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="updateQuantity('${item.name}', ${item.quantity - 1})">-</button>
                    <span class="qty-display">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity('${item.name}', ${item.quantity + 1})">+</button>
                    <button class="remove-btn" onclick="removeFromCart('${item.name}')" style="margin-left: 10px; background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">Remove</button>
                </div>
            </div>
            <div class="cart-item-price">
                <strong>R${(item.price * item.quantity).toFixed(2)}</strong>
            </div>
        `;
        cartItemsContainer.appendChild(itemElement);
        
        total += item.price * item.quantity;
        totalItems += item.quantity;
    });
    
    cartTotalElement.textContent = total.toFixed(2);
    cartCountElement.textContent = totalItems.toString();
}

function toggleCart() {
    const cartOverlay = document.querySelector('.cart-overlay') || createCartOverlay();
    
    if (isCartOpen) {
        cartSidebar.classList.remove('open');
        cartOverlay.classList.remove('show');
        isCartOpen = false;
    } else {
        cartSidebar.classList.add('open');
        cartOverlay.classList.add('show');
        isCartOpen = true;
    }
}

function createCartOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'cart-overlay';
    overlay.addEventListener('click', toggleCart);
    document.body.appendChild(overlay);
    return overlay;
}

function showAddToCartFeedback(itemName) {
    // Create temporary feedback message
    const feedback = document.createElement('div');
    feedback.className = 'add-to-cart-feedback';
    feedback.textContent = `${itemName} added to cart!`;
    feedback.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 3000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.remove();
    }, 2000);
}

// Local storage functions
function saveCartToStorage() {
    localStorage.setItem('ridaleCart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('ridaleCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Checkout functionality
function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemsList = cart.map(item => `${item.name} x${item.quantity} - R${(item.price * item.quantity).toFixed(2)}`).join('\n');
    
    const orderMessage = `New Order from Website:\n\n${itemsList}\n\nTotal: R${total.toFixed(2)}\n\nPlease call customer for delivery details.`;
    
    // Create WhatsApp link
    const whatsappNumber = '27712351559'; // Remove leading 0 and add country code
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(orderMessage)}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Show confirmation
    showOrderConfirmation();
}

function showOrderConfirmation() {
    const confirmation = document.createElement('div');
    confirmation.className = 'order-confirmation';
    confirmation.innerHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 20px 40px rgba(0,0,0,0.3); z-index: 4000; text-align: center;">
            <i class="fas fa-check-circle" style="font-size: 3rem; color: #4CAF50; margin-bottom: 1rem;"></i>
            <h3>Order Sent!</h3>
            <p>Your order has been sent via WhatsApp. We'll call you shortly to confirm delivery details.</p>
            <button onclick="this.parentElement.parentElement.remove(); clearCart();" style="margin-top: 1rem; padding: 10px 20px; background: #ff6b35; color: white; border: none; border-radius: 5px; cursor: pointer;">Close</button>
        </div>
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 3500;"></div>
    `;
    
    document.body.appendChild(confirmation);
}

function clearCart() {
    cart = [];
    updateCartDisplay();
    saveCartToStorage();
    if (isCartOpen) {
        toggleCart();
    }
}

// Order form submission
function handleOrderSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const customerName = formData.get('name') || e.target.querySelector('input[placeholder="Your Name"]').value;
    const phoneNumber = formData.get('phone') || e.target.querySelector('input[placeholder="Phone Number"]').value;
    const address = formData.get('address') || e.target.querySelector('input[placeholder="Delivery Address"]').value;
    const instructions = formData.get('instructions') || e.target.querySelector('textarea').value;
    
    if (!customerName || !phoneNumber || !address) {
        alert('Please fill in all required fields.');
        return;
    }
    
    const orderMessage = `New Custom Order:\n\nName: ${customerName}\nPhone: ${phoneNumber}\nAddress: ${address}\nInstructions: ${instructions || 'None'}\n\nPlease call customer to discuss their order.`;
    
    const whatsappNumber = '27712351559';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(orderMessage)}`;
    
    window.open(whatsappUrl, '_blank');
    
    // Show success message
    showSuccessMessage('Order request sent! We\'ll call you shortly.');
    e.target.reset();
}

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message show';
    successDiv.textContent = message;
    
    const form = document.querySelector('.order-form');
    form.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 5000);
}

// Phone call functions
function callOrder() {
    window.location.href = 'tel:0712351559';
}

function callDelivery() {
    window.location.href = 'tel:0607034900';
}

// Performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimized scroll handler
const optimizedScrollHandler = debounce(handleScroll, 10);
window.removeEventListener('scroll', handleScroll);
window.addEventListener('scroll', optimizedScrollHandler);

// Search functionality (for future enhancement)
function searchMenu(query) {
    const menuItems = document.querySelectorAll('.menu-item');
    const lowercaseQuery = query.toLowerCase();
    
    menuItems.forEach(item => {
        const itemName = item.querySelector('h4').textContent.toLowerCase();
        const itemDescription = item.querySelector('p').textContent.toLowerCase();
        
        if (itemName.includes(lowercaseQuery) || itemDescription.includes(lowercaseQuery)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Social media sharing
function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
}

// Analytics and tracking (placeholder for future implementation)
function trackEvent(eventName, eventData) {
    console.log(`Event: ${eventName}`, eventData);
    // Here you would integrate with analytics services like Google Analytics
}

// Track menu item views
function trackMenuItemView(itemName) {
    trackEvent('menu_item_view', { item: itemName });
}

// Track add to cart events
const originalAddToCart = addToCart;
addToCart = function(itemName, price) {
    trackEvent('add_to_cart', { item: itemName, price: price });
    return originalAddToCart(itemName, price);
};

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    // In production, you might want to send this to an error tracking service
});

// Service worker registration (for PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed');
            });
    });
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe menu items for scroll animations
document.addEventListener('DOMContentLoaded', function() {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'all 0.6s ease';
        observer.observe(item);
    });
});

// Utility functions
function formatCurrency(amount) {
    return `R${amount.toFixed(2)}`;
}

function validatePhoneNumber(phone) {
    const phoneRegex = /^(\+27|0)[6-8][0-9]{8}$/;
    return phoneRegex.test(phone);
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        addToCart,
        removeFromCart,
        updateQuantity,
        formatCurrency,
        validatePhoneNumber,
        validateEmail
    };
}
