const PRODUCT_PRICE = 1500;
let cart = [];
let currentProduct = null;
let selectedSize = null;
let quantity = 1;
let deliveryFee = 0;
let selectedLocation = "";
let selectedImage = "";
let currentCategory = "All";
let selectedColor = null;

const products = [
  {
    id: 1,
    name: "Chic Shift Dress",
    price: PRODUCT_PRICE,
    category: "Shift Dresses",
    images: [
      "images/shift-dresses/chic-shift/blue.jpg",
      "images/shift-dresses/chic-shift/red.jpg",
      "images/shift-dresses/chic-shift/yellow.jpg"
    ],
    stock: { S: 5, M: 3, L: 0, XL: 2 }
  },
  {
    id: 2,
    name: "Modern Shift Dress",
    price: PRODUCT_PRICE,
    category: "Shift Dresses",
    images: [
      "images/shift-dresses/mordern-shift/black.jpg",
      "images/shift-dresses/mordern-shift/red.jpg"
    ],
    stock: { M: 4, L: 2, XL: 0 }
  },
  {
    id: 3,
    name: "Maxi Dress",
    price: PRODUCT_PRICE,
    category: "Maxi Dresses",
    images: [
      "images/maxi-dresses/blue.jpg",
      "images/maxi-dresses/green.jpg"
    ],
    stock: { M: 4, L: 2, XL: 0 }
  }
];


/* ===== STOCK HELPERS ===== */
function getTotalStock(product) {
  return Object.values(product.stock).reduce((s, q) => s + q, 0);
}

/* ===== CATEGORY FILTER ===== */
function filterCategory(category) {
  currentCategory = category;

  document.querySelectorAll(".category-bar button")
    .forEach(btn => btn.classList.remove("active"));

  event.target.classList.add("active");

  document.getElementById("categoryTitle").innerText = category;

  renderProducts();
}

function filterFromCard(category) {
  currentCategory = category;

  // active card highlight
  document.querySelectorAll(".category-card")
    .forEach(card => card.classList.remove("active"));
  event.currentTarget.classList.add("active");

  // update title
  document.getElementById("categoryTitle").innerText = category;

  renderProducts();

  document.getElementById("productList")
    .scrollIntoView({ behavior: "smooth" });
}



/* ===== PRODUCTS ===== */
function renderProducts() {
  const list = document.getElementById("productList");
  list.innerHTML = "";

  products.forEach(p => {
    if (currentCategory !== "All" && p.category !== currentCategory) return;

    list.innerHTML += `
      <div class="product-card">
        <img src="${p.images[0]}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p class="price">Ksh ${p.price}</p>
        <button class="btn primary" onclick="openModal(${p.id})">
          View Product
        </button>
      </div>
    `;
  });
}



/* ===== MODAL ===== */
function openModal(id) {
  currentProduct = products.find(p => p.id === id);
  selectedSize = null;
  quantity = 1;
  selectedImage = null;
selectedColor = null;


  document.querySelector(".modal-image").src = currentProduct.images[0];
document.querySelector(".modal-content .price").innerText = "Ksh 1500";

document.getElementById("addToCartBtn").disabled = true;
document.getElementById("colorHint").style.display = "block";


  const sizes = document.querySelector(".sizes");
  sizes.innerHTML = "";

  Object.entries(currentProduct.stock).forEach(([size, qty]) => {
    const btn = document.createElement("button");
    btn.innerText = size;
    if (qty === 0) {
      btn.disabled = true;
      btn.classList.add("out-of-stock");
    } else {
      btn.onclick = () => selectSize(btn);
    }
    sizes.appendChild(btn);
  });

  renderImageOptions();
  document.getElementById("productModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("productModal").style.display = "none";
}

function renderImageOptions() {
  const box = document.getElementById("imageOptions");
  box.innerHTML = "";

  currentProduct.images.forEach(img => {
    const el = document.createElement("img");
    el.src = img;
    el.className = "color-thumb";

    el.onclick = () => {
      selectedImage = img;
      selectedColor = img.split("/").pop().replace(".jpg", "");

      document.querySelector(".modal-image").src = img;

      document.querySelectorAll(".color-thumb")
        .forEach(i => i.classList.remove("active"));
      el.classList.add("active");

      document.getElementById("colorHint").style.display = "none";

      // enable button ONLY if size is also selected
      if (selectedSize && selectedImage) {
        document.getElementById("addToCartBtn").disabled = false;
      }
    };

    box.appendChild(el);
  });
}


function selectSize(btn) {
  selectedSize = btn.innerText;
  document.querySelectorAll(".sizes button")
    .forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("sizeHint").style.display = "none";
  document.getElementById("addToCartBtn").disabled = false;
}

/* ===== QUANTITY ===== */
function increaseQty() {
  quantity++;
  document.getElementById("qtyValue").innerText = quantity;
}

function decreaseQty() {
  if (quantity > 1) {
    quantity--;
    document.getElementById("qtyValue").innerText = quantity;
  }
}

/* ===== ADD TO CART ===== */
document.getElementById("addToCartBtn").onclick = () => {
  if (!selectedSize) return;

  const stock = currentProduct.stock[selectedSize];
  if (quantity > stock) {
    alert(`Only ${stock} left for size ${selectedSize}`);
    return;
  }

  currentProduct.stock[selectedSize] -= quantity;

  const existing = cart.find(
    i => i.id === currentProduct.id && i.size === selectedSize
  );

  if (existing) existing.qty += quantity;
  else cart.push({
  id: currentProduct.id,
  name: currentProduct.name,
  price: PRODUCT_PRICE,
  size: selectedSize,
  color: selectedColor,
  qty: quantity,
  image: selectedImage
});


  updateCart();
  renderProducts();


  closeModal();
  openCart();
};

/* ===== CART ===== */
function updateCart() {
  const items = document.getElementById("cartItems");
  items.innerHTML = "";
  let total = 0;

  cart.forEach((i, index) => {
    total += i.price * i.qty;
    items.innerHTML += `
      <div class="cart-item">
        <img src="${i.image}" class="cart-thumb">
        <div class="cart-item-info">
          <div class="cart-item-name">${i.name}</div>
          <div class="cart-item-size">Size: ${i.size}</div>
          <div class="cart-item-size">Color: ${i.color}</div>
<button class="remove-btn" onclick="removeItem(${index})">✕ Remove</button>
        </div>
        <div class="cart-item-actions">
          <div class="qty-controls">
            <button onclick="changeQty(${index}, -1)">−</button>
            <span>${i.qty}</span>
            <button onclick="changeQty(${index}, 1)">+</button>
          </div>
          <div class="cart-item-price">Ksh ${i.price * i.qty}</div>
        </div>
      </div>
    `;
  });

  document.getElementById("cartTotal").innerText = total + deliveryFee;
  document.getElementById("cartCount").innerText =
    cart.reduce((s, i) => s + i.qty, 0);
}

function changeQty(index, delta) {
  const item = cart[index];
  const product = products.find(p => p.id === item.id);

  if (delta === 1) {
    if (product.stock[item.size] <= 0) return alert("No more stock");
    product.stock[item.size]--;
    item.qty++;
  } else {
    product.stock[item.size]++;
    item.qty--;
    if (item.qty === 0) cart.splice(index, 1);
  }

  updateCart();
  renderProducts();
}

function removeItem(index) {
  const item = cart[index];
  const product = products.find(p => p.id === item.id);
  product.stock[item.size] += item.qty;
  cart.splice(index, 1);
  updateCart();
  renderProducts();
}

/* ===== CART UI ===== */
function openCart() {
  document.getElementById("cartDrawer").classList.add("open");
}
function closeCart() {
  document.getElementById("cartDrawer").classList.remove("open");
}

renderProducts();
function scrollToProducts() {
  const section = document.getElementById("productList");
  if (!section) return;

  section.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}
document.getElementById("categoryTitle").innerText = currentCategory;
renderProducts();
