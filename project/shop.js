document.addEventListener('DOMContentLoaded', async () => {
  const cartKey = 'elite-arsenal-cart';
  let cart = JSON.parse(localStorage.getItem(cartKey) || '[]');

  // Helpers
  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const parsePrice = (text) => {
    if (!text) return 0;
    const n = String(text).replace(/[^0-9.\-]+/g, '');
    return parseFloat(n) || 0;
  };
  const formatPrice = (num) => Number(num).toFixed(2);

  // Elements
  const productGrid = qs('#productGrid');
  const cartCountEl = qs('#cartCount');
  const cartItemsEl = qs('#cartItems');
  const totalAmountEl = qs('#totalAmount');
  const cartSidebar = qs('#cartSidebar');
  const payModal = qs('#payModal');
  const modalTotalEl = qs('#modalTotal');
  const productModal = qs('#productModal');

  let products = [];

  async function loadProducts() {
    try {
      const res = await fetch('./data/products.json');
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      if (Array.isArray(data)) products = data;
    } catch (err) {
      console.warn('Failed to load products.json:', err);
      products = products || [];
    }
  }

  function persistCart() {
    localStorage.setItem(cartKey, JSON.stringify(cart));
  }

  function updateCartUI() {
    cartItemsEl.innerHTML = '';
    let total = 0;

    cart.forEach((item, idx) => {
      total += Number(item.price) || 0;

      const itemRow = document.createElement('div');
      itemRow.style.cssText = 'display:flex; justify-content:space-between; margin-bottom:10px; background:#222; padding:10px; align-items:center;';

      const left = document.createElement('div');
      left.textContent = item.name;
      left.style.flex = '1';

      const right = document.createElement('div');
      right.style.display = 'flex';
      right.style.alignItems = 'center';
      right.style.gap = '10px';

      const priceSpan = document.createElement('span');
      priceSpan.textContent = `$${formatPrice(item.price)}`;

      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Remove';
      removeBtn.style.cssText = 'background:#ff4444; color:white; border:none; padding:6px 8px; cursor:pointer;';
      removeBtn.addEventListener('click', () => {
        cart.splice(idx, 1);
        persistCart();
        updateCartUI();
      });

      right.appendChild(priceSpan);
      right.appendChild(removeBtn);

      itemRow.appendChild(left);
      itemRow.appendChild(right);

      cartItemsEl.appendChild(itemRow);
    });

    cartCountEl.innerText = cart.length;
    totalAmountEl.innerText = formatPrice(total);
    modalTotalEl && (modalTotalEl.innerText = formatPrice(total));
  }

  // Keep cart sidebar toggle available globally (used inline in HTML)
  window.toggleCart = function toggleCart() {
    cartSidebar.classList.toggle('active');
  };

  function addToCart({ id, name, price }) {
    // Keep existing behavior: push item; could be expanded to track qty
    cart.push({ id, name, price: Number(price) });
    persistCart();
    updateCartUI();
  }

  function createProductCard(product, index) {
    const card = document.createElement('div');
    card.className = 'product-card';

    card.innerHTML = `
      <span class="product-num">${String(index + 1).padStart(2, '0')}</span>
      <div class="product-img"><img src="${product.image}" alt="${product.name}"></div>
      <div class="product-info">
        <div class="info-top">
          <h4>${product.name}</h4>
          <span class="price">$${formatPrice(product.price)}</span>
        </div>
        <p class="category">${product.category.toUpperCase()}</p>
        <p class="desc">${product.desc}</p>
        <div class="actions">
          <button class="buy-now">BUY NOW</button>
          <button class="wishlist"><i class='bx bx-heart'></i></button>
        </div>
      </div>
    `;

    // BUY NOW
    const buyBtn = qs('.buy-now', card);
    buyBtn && buyBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      addToCart({ id: product.id, name: product.name, price: product.price });
      buyBtn.style.transform = 'scale(0.95)';
      setTimeout(() => buyBtn.style.transform = '', 120);
    });

    // Wishlist
    const wishBtn = qs('.wishlist', card);
    wishBtn && wishBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      wishBtn.classList.toggle('active');
      const icon = qs('i', wishBtn);
      if (wishBtn.classList.contains('active')) {
        icon && (icon.className = 'bx bxs-heart');
        wishBtn.style.color = '#ffcc00';
        wishBtn.style.borderColor = '#ffcc00';
      } else {
        icon && (icon.className = 'bx bx-heart');
        wishBtn.style.color = '#fff';
        wishBtn.style.borderColor = '#333';
      }
    });

    // Card click -> show modal
    card.addEventListener('click', (e) => {
      if (e.target.closest('.actions')) return;
      qs('#modalTitle').innerText = product.name;
      qs('#modalPrice').innerText = `$${formatPrice(product.price)}`;
      qs('#modalCategory').innerText = product.category.toUpperCase();
      qs('#modalDesc').innerText = product.desc;
      qs('#modalImg').src = product.image;
      productModal && (productModal.style.display = 'flex');
    });

    return card;
  }

  function renderProducts(filter = 'all') {
    productGrid.innerHTML = '';
    const filtered = products.filter(p => filter === 'all' || p.category === filter);
    if (filtered.length === 0) {
      productGrid.innerHTML = '<p style="color:#bbb;">No products found for this category.</p>';
      return;
    }

    filtered.forEach((p, i) => {
      const card = createProductCard(p, i);
      productGrid.appendChild(card);
    });
  }

  // Wire sidebar filters
  function setupFilters() {
    qsa('.filter-list li').forEach(li => {
      li.addEventListener('click', function () {
        const current = qs('.filter-list li.active');
        current && current.classList.remove('active');
        this.classList.add('active');

        const cat = this.dataset.cat || this.innerText.trim().toLowerCase();
        const normalized = cat === 'all' ? 'all' : cat.replace(/[^a-z]/gi, '');
        renderProducts(normalized);
      });
    });

    // Reset filter when clicking main logo or shop title
    const logo = qs('.logo');
    logo && logo.addEventListener('click', () => {
      const current = qs('.filter-list li.active');
      current && current.classList.remove('active');
      const allLi = qs('.filter-list li[data-cat="all"]');
      allLi && allLi.classList.add('active');
      renderProducts('all');
    });

    const shopTitle = qs('.shop-header h1');
    shopTitle && shopTitle.addEventListener('click', () => {
      const current = qs('.filter-list li.active');
      current && current.classList.remove('active');
      const allLi = qs('.filter-list li[data-cat="all"]');
      allLi && allLi.classList.add('active');
      renderProducts('all');
    });
  }

  // Modal controls
  const closeModalBtn = qs('.close-modal');
  closeModalBtn && closeModalBtn.addEventListener('click', () => productModal && (productModal.style.display = 'none'));
  window.addEventListener('click', (ev) => { if (ev.target === productModal) productModal.style.display = 'none'; });

  // Modal big ADD TO CART
  const modalAddBtn = qs('.buy-now-large');
  modalAddBtn && modalAddBtn.addEventListener('click', (ev) => {
    ev.stopPropagation();
    const name = qs('#modalTitle')?.innerText || 'Product';
    const priceText = qs('#modalPrice')?.innerText || '$0';
    const price = parsePrice(priceText);
    addToCart({ id: `modal-${Date.now()}`, name, price });
    productModal && (productModal.style.display = 'none');
    cartSidebar.classList.add('active');
  });

  // Payment modal controls
  window.openCheckout = function () {
    if (cart.length === 0) return alert('Your cart is empty!');
    modalTotalEl && (modalTotalEl.innerText = formatPrice(cart.reduce((s, i) => s + i.price, 0)));
    if (payModal) payModal.style.display = 'flex';
  };

  window.closeCheckout = function () { if (payModal) payModal.style.display = 'none'; };

  window.confirmPayment = function () {
    alert('Payment Successful! Your order has been placed via Cash Pay.');
    cart = [];
    persistCart();
    updateCartUI();
    closeCheckout();
    cartSidebar.classList.remove('active');
  };

  // Initialize app
  await loadProducts();
  setupFilters();
  renderProducts('all');
  updateCartUI();

  // Export for debugging
  window._eliteCart = { get: () => cart, add: addToCart };
});
