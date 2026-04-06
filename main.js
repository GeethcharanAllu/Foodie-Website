/** Same origin when the app is served by Express (http://localhost:5000). */
const API_BASE = "";

var swiper = new Swiper(".mySwiper", {
    loop: true,
    navigation: {
        nextEl: "#next",
        prevEl: "#prev",
    },
});


const cartIcon = document.querySelector('.cart-icon');
const cartTab = document.querySelector('.cart-tab');
const closeBtn = document.querySelector('.close-btn');
const checkoutBtn = document.querySelector('.checkout-btn');
const cardList = document.querySelector('.card-list');
const cartList = document.querySelector('.cart-list');
const cartTotal = document.querySelector('.cart-total');
const cartValue = document.querySelector('.cart-value');
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
const bars = document.querySelector('.fa-bars');
const signInBtns = document.querySelectorAll('.signin-btn');



cartIcon.addEventListener('click', () => cartTab.classList.add('cart-tab-active'));
closeBtn.addEventListener('click', () => cartTab.classList.remove('cart-tab-active'));

if (checkoutBtn) {
    checkoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        placeOrder();
    });
}
// hamburger.addEventListener('click', () => mobileMenu.classList.toggle('mobile-menu-active'));
// hamburger.addEventListener('click', () => bars.classList.toggle('fa-xmark'));
hamburger.addEventListener('click', (e) => {
    e.preventDefault(); // prevents page jumping

    mobileMenu.classList.toggle('mobile-menu-active');

    bars.classList.toggle('fa-bars');
    bars.classList.toggle('fa-xmark');
});

document.querySelectorAll("a.scroll-nav").forEach((link) => {
    link.addEventListener("click", () => {
        mobileMenu.classList.remove("mobile-menu-active");
        if (bars) {
            bars.classList.add("fa-bars");
            bars.classList.remove("fa-xmark");
        }
    });
});


let productList = [];
let cartProduct = [];

let cartToastTimer = null;
function showCartToast(message) {
    const el = document.getElementById("cartToast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("cart-toast-visible");
    if (cartToastTimer) clearTimeout(cartToastTimer);
    cartToastTimer = setTimeout(() => {
        el.classList.remove("cart-toast-visible");
        cartToastTimer = null;
    }, 2600);
}

const updateTotals = () =>{

    let totalPrice = 0;
    let totalQuantity = 0;

    document.querySelectorAll('.item').forEach(item =>{

        const quantity = parseInt(item.querySelector('.quantity-value').textContent);
        const price = parseFloat(item.querySelector('.item-total').textContent.replace('₹',''));
        
        totalPrice += price;
        totalQuantity += quantity;
    });

    cartTotal.textContent = `₹${totalPrice.toFixed(2)}`;
    cartValue.textContent = totalQuantity;
    
}

const showCards = () => {

    productList.forEach(product => {

        const orderCard = document.createElement('div');
        orderCard.classList.add('order-card');

        orderCard.innerHTML = `
        <div class="card-image">
            <img src="${product.image}">
        </div>
        <h4>${product.name}</h4>
        <h4 class="price">${product.price}</h4>
        <a href="#" class="btn card-btn">Add to Cart</a>
        `;

        cardList.appendChild(orderCard);

        const cardBtn = orderCard.querySelector('.card-btn');
        cardBtn.addEventListener('click', (e)=>{
            e.preventDefault();
            addToCart(product);
            cartTab.classList.add('cart-tab-active');
            const menuSection = document.getElementById('menu');
            if (menuSection) {
                menuSection.scrollIntoView({ behavior: 'smooth' });
            }
        });

    });
}

const addToCart = (product) =>{
    // Show cart panel and ensure user stays on menu section
    cartTab.classList.add('cart-tab-active');
    const menuSection = document.getElementById('menu');
    if (menuSection) {
        menuSection.scrollIntoView({ behavior: 'smooth' });
    }

    const existingProduct = cartProduct.find(item => item.id === product.id);
    if(existingProduct){
        showCartToast("Already in your cart");
        return;
    }

    cartProduct.push(product);

    let quantity = 1;
    let price = parseFloat(product.price.replace('₹',''));

    const cartItem =document.createElement('div');
    cartItem.classList.add('item');
    if (product._id) {
        cartItem.dataset.productId = product._id;
    }

    cartItem.innerHTML = `
        <div class="item-image">
            <img src="${product.image}">
        </div>
        <div class="detail">
            <h4>${product.name}</h4>
            <h4 class="item-total">${product.price}</h4>
        </div>
        <div class="flex">
            <a href="#" class="quantity-btn minus">
                <i class="fa-solid fa-minus"></i>
            </a>
            <h4 class="quantity-value">${quantity}</h4>
            <a href="#" class="quantity-btn plus">
                <i class="fa-solid fa-plus"></i>
            </a>
        </div>
    `;

    cartList.appendChild(cartItem);
    updateTotals();
    showCartToast("Added to cart!");

    const plusBtn = cartItem.querySelector('.plus');
    const quantityValue = cartItem.querySelector('.quantity-value');
    const itemTotal = cartItem.querySelector('.item-total');
    const minusBtn = cartItem.querySelector('.minus');

    plusBtn.addEventListener('click',(e)=>{
        e.preventDefault();
        quantity++;
        quantityValue.textContent = quantity;
        itemTotal.textContent=`₹${(price * quantity).toFixed(2)}`
        updateTotals();
    });

    minusBtn.addEventListener('click',(e)=>{
        e.preventDefault();

        if(quantity>1){
            quantity--;
            quantityValue.textContent = quantity;
            itemTotal.textContent=`₹${(price * quantity).toFixed(2)}`;
            updateTotals();
        }
        else{
            cartItem.classList.add('slide-out')
            
            setTimeout(()=>{
                cartItem.remove();
                cartProduct = cartProduct.filter(item => item.id !== product.id);
                updateTotals();
            },300)
        }
        
    })

}

async function initApp() {
    try {
        const response = await fetch(`${API_BASE}/api/products`);
        if (!response.ok) throw new Error("API error");
        productList = await response.json();
    } catch {
        try {
            const response = await fetch("products.json");
            productList = await response.json();
        } catch (e2) {
            console.error(e2);
            productList = [];
        }
    }
    showCards();
}

function getAuthHeaders() {
    const token = localStorage.getItem("foodie_token");
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
}

function showMockPaymentDialog(amount, currency, onSuccess, onCancel) {
    // Create mock payment dialog
    const dialog = document.createElement("div");
    dialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    `;
    
    const mockDialog = document.createElement("div");
    mockDialog.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 8px;
        width: 90%;
        max-width: 400px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;
    
    mockDialog.innerHTML = `
        <div style="text-align: center;">
            <img src="images/Razorpay-Logo.jpg" alt="Razorpay" style="width: 100px; margin-bottom: 20px;">
            <h2 style="margin: 20px 0; color: #1a1a1a;">Payment</h2>
            <div style="background: #fff3cd; padding: 20px; border-radius: 5px; margin-bottom: 25px; border: 2px solid #ffc107;">
                <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;"><strong>Total Amount</strong></p>
                <p style="color: #F2BD12; margin: 0; font-size: 32px; font-weight: bold;">${currency} ${(amount / 100).toFixed(2)}</p>
                <small style="color: #999; display: block; margin-top: 8px;">Payment (Sandbox Mode)</small>
            </div>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; text-align: left;">
                <p style="margin: 5px 0; font-size: 14px;"><strong>Payment Methods:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px; font-size: 13px;">
                    <li>UPI (Mock)</li>
                    <li>Credit/Debit Card (Mock)</li>
                    <li>Net Banking (Mock)</li>
                </ul>
            </div>
            <div style="display: flex; gap: 10px;">
                <button id="mock-cancel-btn" style="flex: 1; padding: 10px; background: #e0e0e0; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">Cancel</button>
                <button id="mock-pay-btn" style="flex: 1; padding: 10px; background: #F2BD12; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 14px;">Complete Payment</button>
            </div>
        </div>
    `;
    
    dialog.appendChild(mockDialog);
    document.body.appendChild(dialog);
    
    document.getElementById("mock-pay-btn").addEventListener("click", () => {
        dialog.remove();
        onSuccess();
    });
    
    document.getElementById("mock-cancel-btn").addEventListener("click", () => {
        dialog.remove();
        onCancel();
    });
}

function clearCartUI() {
    document.querySelectorAll(".cart-list .item").forEach((el) => el.remove());
    cartProduct = [];
    updateTotals();
    cartTab.classList.remove("cart-tab-active");
}

async function placeOrder() {
    const token = localStorage.getItem("foodie_token");
    if (!token) {
        alert("Please sign in to place an order.");
        return;
    }

    const items = [];
    document.querySelectorAll(".cart-list .item").forEach((row) => {
        const productId = row.dataset.productId;
        const qty = parseInt(row.querySelector(".quantity-value").textContent, 10);
        if (productId && qty > 0) {
            items.push({ productId, quantity: qty });
        }
    });

    if (items.length === 0) {
        alert("Your cart is empty or menu data is not loaded from the server. Open the site at http://localhost:5000 and add items.");
        return;
    }

    let createData;
    try {
        const res = await fetch(`${API_BASE}/api/payments/create-order`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ items }),
        });
        createData = await res.json().catch(() => ({}));
        console.log("Create order response:", res.status, createData);
        if (!res.ok) {
            console.error("Create order failed:", createData);
            if (res.status === 401) {
                // Token expired or invalid
                localStorage.removeItem("foodie_token");
                localStorage.removeItem("foodie_user");
                alert("Your session has expired. Please sign in again.");
                // Reset UI to signed out state
                setSignedOutUI();
                return;
            }
            alert(createData.message || "Could not start checkout");
            return;
        }
    } catch (err) {
        console.error(err);
        alert("Could not reach the server. Is it running?");
        return;
    }

    // Show mock payment dialog
    showMockPaymentDialog(
        createData.amount,
        createData.currency || "INR",
        async () => {
            // On success - verify payment
            try {
                const v = await fetch(`${API_BASE}/api/payments/verify`, {
                    method: "POST",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        orderId: createData.orderId,
                        amount: createData.amount,
                        currency: createData.currency || "INR",
                    }),
                });
                const out = await v.json().catch(() => ({}));
                if (!v.ok) {
                    if (v.status === 401) {
                        // Token expired during verification
                        localStorage.removeItem("foodie_token");
                        localStorage.removeItem("foodie_user");
                        alert("Your session has expired during payment. Please sign in again.");
                        setSignedOutUI();
                        return;
                    }
                    alert(out.message || "Payment verification failed");
                    return;
                }
                showCartToast("Order placed!");
                alert(
                    `Order placed successfully!\nTotal: ₹${Number(out.totalAmount).toFixed(2)}`
                );
                clearCartUI();
            } catch (err) {
                console.error(err);
                alert("Verification request failed. Please try again.");
            }
        },
        () => {
            // On cancel
            alert("Payment cancelled");
        }
    );
}

initApp();

// ================================================================================

// ================= LOGIN + PASSWORD TOGGLE SAFE VERSION =================

document.addEventListener("DOMContentLoaded", function () {

    function setupPasswordToggle(toggleBtnId, passwordInputId) {
        const toggleBtn = document.getElementById(toggleBtnId);
        const passwordInput = document.getElementById(passwordInputId);

        if (!toggleBtn || !passwordInput) return;

        toggleBtn.addEventListener("click", () => {
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                toggleBtn.classList.replace("fa-eye", "fa-eye-slash");
            } else {
                passwordInput.type = "password";
                toggleBtn.classList.replace("fa-eye-slash", "fa-eye");
            }
        });
    }

    setupPasswordToggle("toggleLoginPassword", "loginPassword");
    setupPasswordToggle("toggleSignupPassword", "signupPassword");

    const loginModal = document.getElementById("loginModal");
    const closeLogin = document.getElementById("closeLogin");
    const showSignup = document.getElementById("showSignup");
    const showLogin = document.getElementById("showLogin");
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");

    if (!loginModal) return;

    function setSignedInUI(user) {
        signInBtns.forEach((btn) => {
            btn.innerHTML =
                user.name +
                '&nbsp;<i class="fa-solid fa-arrow-right-from-bracket"></i>';
            btn.classList.add("logged-in"); // Mark as logged in
        });
    }

    function setSignedOutUI() {
        signInBtns.forEach((btn) => {
            btn.innerHTML = 'Sign in &nbsp;<i class="fa-solid fa-arrow-right-from-bracket"></i>';
            btn.classList.remove("logged-in"); // Mark as logged out
        });
    }

    function logout() {
        // Clear stored tokens and user data
        localStorage.removeItem("foodie_token");
        localStorage.removeItem("foodie_user");
        // Reset UI to signed-out state
        setSignedOutUI();
        // Close cart if open
        cartTab.classList.remove('cart-tab-active');
        // Clear cart items
        clearCartUI();
        alert("You have been logged out successfully");
    }

    function loadSession() {
        const raw = localStorage.getItem("foodie_user");
        if (raw) {
            try {
                const user = JSON.parse(raw);
                setSignedInUI(user);
            } catch {
                /* ignore */
            }
        }
    }
    loadSession();

    const loginBtn = document.getElementById("loginBtn");
    const signupBtn = document.getElementById("signupBtn");

    if (loginBtn) {
        loginBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            const email = document.getElementById("loginEmail")?.value?.trim();
            const password = document.getElementById("loginPassword")?.value;
            if (!email || !password) {
                alert("Enter email and password");
                return;
            }
            try {
                const res = await fetch(`${API_BASE}/api/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });
                const data = await res.json();
                if (!res.ok) {
                    alert(data.message || "Login failed");
                    return;
                }
                localStorage.setItem("foodie_token", data.token);
                localStorage.setItem("foodie_user", JSON.stringify(data.user));
                setSignedInUI(data.user);
                loginModal.style.display = "none";
            } catch (err) {
                console.error(err);
                alert("Cannot reach server. Run the backend at http://localhost:5000");
            }
        });
    }

    if (signupBtn) {
        signupBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            const name = document.getElementById("signupName")?.value?.trim();
            const email = document.getElementById("signupEmail")?.value?.trim();
            const password = document.getElementById("signupPassword")?.value;
            if (!name || !email || !password) {
                alert("Fill in name, email, and password");
                return;
            }
            try {
                const res = await fetch(`${API_BASE}/api/auth/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password }),
                });
                const data = await res.json();
                if (!res.ok) {
                    alert(data.message || "Sign up failed");
                    return;
                }
                localStorage.setItem("foodie_token", data.token);
                localStorage.setItem("foodie_user", JSON.stringify(data.user));
                setSignedInUI(data.user);
                loginModal.style.display = "none";
            } catch (err) {
                console.error(err);
                alert("Cannot reach server. Run the backend at http://localhost:5000");
            }
        });
    }

    // Open modal or logout
    signInBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            // Check if user is logged in
            if (btn.classList.contains("logged-in")) {
                // User is logged in - logout
                logout();
            } else {
                // User is not logged in - show login modal
                loginModal.style.display = "flex";
            }
        });
    });

    // Close modal
    if (closeLogin) {
        closeLogin.addEventListener("click", () => {
            loginModal.style.display = "none";
        });
    }

    // Switch to signup
    if (showSignup) {
        showSignup.addEventListener("click", (e) => {
            e.preventDefault();
            loginForm.style.display = "none";
            signupForm.style.display = "block";
        });
    }

    // Switch to login
    if (showLogin) {
        showLogin.addEventListener("click", (e) => {
            e.preventDefault();
            signupForm.style.display = "none";
            loginForm.style.display = "block";
        });
    }

});

// Subscribe function
function subscribe() {
    const emailInput = document.getElementById('email');
    const email = emailInput.value.trim();
    
    if (email === '') {
        alert('Please enter your email address');
        return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    alert('Subscribed!');
    emailInput.value = ''; // Clear the input
}
