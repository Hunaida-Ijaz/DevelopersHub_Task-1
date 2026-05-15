function handleCategoryChange() {

  const category = document.getElementById("categorySelect").value;

  // MOBILE PAGE
  if (category === "mobile") {
    showPage("mobile");
  }

  // CLOTHING PAGE
  else if (category === "clothing") {
    showPage("clothing");
  }

  // ELECTRONICS SCROLL
  else if (category === "electronics") {

    // first go to home page
    showPage("home");

    // wait a little then scroll
    setTimeout(() => {

      const electronicsSection =
        document.querySelectorAll(".cat-block")[1];

      electronicsSection.scrollIntoView({
        behavior: "smooth"
      });

    }, 100);
  }
}
// ===== PAGE SWITCHER =====
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-' + name);
  if (el) { el.classList.add('active'); window.scrollTo(0, 0); }
  setTimeout(function () {
    initCatCells();
    initRecCards();
    initProdCards();
  }, 50);
}

function doSearch() { showPage('mobile'); }

function setImg(el, src) {
  document.getElementById('mainImg').src = src;
  document.querySelectorAll('.thumb').forEach(t => t.classList.remove('on'));
  el.classList.add('on');
}

function switchTab(btn, tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  ['tdesc', 'trev', 'tship', 'tsell'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = (id === tab) ? 'block' : 'none';
  });
}

// ===== WISHLIST BUTTON =====
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('wbtn')) {
    e.stopPropagation();
    e.target.classList.toggle('on');
    e.target.textContent = e.target.classList.contains('on') ? '♥' : '♡';
  }
});

// ===== COUNTDOWN TIMER =====
(function timer() {
  let d = 4, h = 13, m = 34, s = 56;
  setInterval(() => {
    s--; if (s < 0) { s = 59; m--; }
    if (m < 0) { m = 59; h--; }
    if (h < 0) { h = 23; d--; }
    if (d < 0) { d = h = m = s = 0; }
    ['td', 'th', 'tm', 'ts'].forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String([d, h, m, s][i]).padStart(2, '0');
    });
  }, 1000);
})();

// ===== TOAST NOTIFICATION (cart page) =====
let toastCount = 0;

function showToast(type, title, subtitle) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const id = 'toast-' + (toastCount++);
  const icons = { add: '✅', remove: '🗑️', save: '🔖', info: '💳' };
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.id = id;
  toast.innerHTML = `
    <div class="toast-icon ${type}">${icons[type] || '✅'}</div>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      <div class="toast-sub">${subtitle}</div>
    </div>
    <button class="toast-close" onclick="dismissToast('${id}')" aria-label="Dismiss">×</button>
  `;
  container.appendChild(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
  setTimeout(() => dismissToast(id), 3500);
}

function dismissToast(id) {
  const t = document.getElementById(id);
  if (!t) return;
  t.classList.remove('show');
  setTimeout(() => t.remove(), 300);
}

// ===== CATEGORY TOAST (with product image) =====
let catToastCount = 0;

function showCatToast(name, price, imgSrc) {
  const container = document.getElementById('catToastContainer');
  if (!container) return;
  const id = 'cat-toast-' + (catToastCount++);
  const toast = document.createElement('div');
  toast.className = 'cat-toast';
  toast.id = id;
  toast.innerHTML = `
    <img class="cat-toast-img" src="${imgSrc}" alt="${name}">
    <div class="cat-toast-body">
      <div class="cat-toast-title">✔ Added to cart!</div>
      <div class="cat-toast-name">${name}</div>
      <div class="cat-toast-price">${price}</div>
    </div>
    <button class="cat-toast-close" onclick="dismissCatToast('${id}')" aria-label="Dismiss">×</button>
  `;
  container.appendChild(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
  setTimeout(() => dismissCatToast(id), 3500);
}

function dismissCatToast(id) {
  const t = document.getElementById(id);
  if (!t) return;
  t.classList.remove('show');
  setTimeout(() => t.remove(), 300);
}

// ===== SHARED CART STORE =====
window.cartItems = window.cartItems || [];

// ===== CORE ADD TO CART =====
function catAddToCart(btn, name, price, imgSrc) {
  const existing = window.cartItems.find(i => i.name === name);
  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
  } else {
    window.cartItems.push({ name, price, imgSrc, qty: 1 });
  }
  btn.textContent = '✔ Added';
  btn.classList.add('added');
  setTimeout(() => {
    btn.textContent = '🛒 Add to cart';
    btn.classList.remove('added');
  }, 1500);
  showCatToast(name, price, imgSrc);
  injectIntoCartPage(name, price, imgSrc);
  updateNavCartBadge();
}

// ===== UPDATE NAVBAR CART BADGE =====
function updateNavCartBadge() {
  const total = window.cartItems.reduce((sum, i) => sum + (i.qty || 1), 0);
  const badge = document.getElementById('navCartCount');
  if (badge) {
    badge.textContent = total;
    badge.style.transform = 'scale(1.4)';
    setTimeout(() => badge.style.transform = '', 200);
  }
}

// ===== INJECT ITEM INTO CART PAGE =====
function injectIntoCartPage(name, price, imgSrc) {
  const cartBox = document.querySelector('#page-cart .cart-box');
  if (!cartBox) return;

  const footer = cartBox.querySelector('.cart-footer');
  // FIX: wrap in String() so .replace() never crashes
  const priceNum = parseFloat(String(price).replace(/[^0-9.]/g, '')) || 0;

  const empty = cartBox.querySelector('.empty-cart');
  if (empty) empty.remove();

  // If already in cart, bump qty instead of adding duplicate
  const existing = cartBox.querySelector(`.cart-item[data-name="${name}"]`);
  if (existing) {
    const sel = existing.querySelector('.qty-sel');
    if (sel) {
      const cur = parseInt(sel.value.replace('Qty: ', '')) || 1;
      const next = Math.min(cur + 1, 10);
      let found = false;
      Array.from(sel.options).forEach(o => {
        if (o.value === 'Qty: ' + next) { o.selected = true; found = true; }
      });
      if (!found) {
        const o = document.createElement('option');
        o.value = o.textContent = 'Qty: ' + next;
        o.selected = true;
        sel.appendChild(o);
      }
    }
    updateSummary();
    return;
  }

  const item = document.createElement('div');
  item.className = 'cart-item';
  item.dataset.name = name;
  item.dataset.price = priceNum;
  item.style.opacity = '0';
  item.style.transform = 'translateX(-20px)';
  item.innerHTML = `
    <img src="${imgSrc}" alt="${name}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;">
    <div>
      <div class="ci-name">${name}</div>
      <div class="ci-meta">Size: medium, Color: default</div>
      <div class="ci-seller">Seller: Various</div>
      <div class="ci-acts">
        <button class="btn-rem" onclick="removeItem(this)">Remove</button>
        <button class="btn-sfl" onclick="saveForLater(this)">Save for later</button>
      </div>
    </div>
    <div>
      <select class="qty-sel" onchange="updateSummary()">
        <option selected>Qty: 1</option>
        <option>Qty: 2</option>
        <option>Qty: 3</option>
        <option>Qty: 5</option>
      </select>
    </div>
    <div class="ci-price">$${priceNum.toFixed(2)}</div>
  `;

  cartBox.insertBefore(item, footer);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    item.style.transition = 'opacity 0.3s, transform 0.3s';
    item.style.opacity = '1';
    item.style.transform = 'translateX(0)';
  }));
  updateSummary();
}

// ===== CART PAGE: REMOVE ITEM =====
function removeItem(btn) {
  const item = btn.closest('.cart-item');
  const name = item.dataset.name || item.querySelector('.ci-name').textContent.trim();
  item.style.transition = 'opacity 0.3s, transform 0.3s';
  item.style.opacity = '0';
  item.style.transform = 'translateX(30px)';
  setTimeout(() => {
    item.remove();
    updateSummary();
    checkEmpty();
    showToast('remove', 'Item removed', name);
  }, 300);
}

// ===== CART PAGE: SAVE FOR LATER =====
function saveForLater(btn) {
  const item = btn.closest('.cart-item');
  const name = item.dataset.name || item.querySelector('.ci-name').textContent.trim();
  const price = item.dataset.price || '0';
  const img = item.querySelector('img') ? item.querySelector('img').src : '';
  item.style.transition = 'opacity 0.3s, transform 0.3s';
  item.style.opacity = '0';
  item.style.transform = 'translateX(30px)';
  setTimeout(() => {
    item.remove();
    updateSummary();
    checkEmpty();
    addToSavedGrid(name, price, img);
    showToast('save', 'Saved for later', name);
  }, 300);
}

function addToSavedGrid(name, price, img) {
  const grid = document.querySelector('#page-cart .saved-grid');
  if (!grid) return;
  const card = document.createElement('div');
  card.className = 'saved-card';
  card.dataset.name = name;
  card.dataset.price = price;
  card.dataset.img = img;
  card.style.opacity = '0';
  card.style.transform = 'scale(0.9)';
  card.innerHTML = `
    <img src="${img}" alt="${name}">
    <div class="saved-info">
      <div class="sv-price">$${parseFloat(price).toFixed(2)}</div>
      <div class="sv-name">${name}</div>
      <button class="btn-mv" onclick="moveToCart(this)">🛒 Move to cart</button>
    </div>
  `;
  grid.appendChild(card);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    card.style.transition = 'opacity 0.3s, transform 0.3s';
    card.style.opacity = '1';
    card.style.transform = 'scale(1)';
  }));
}

// ===== CART PAGE: MOVE SAVED TO CART =====
function moveToCart(btn) {
  const card = btn.closest('.saved-card');
  const name = card.dataset.name || card.querySelector('.sv-name').textContent.trim();
  const price = card.dataset.price || '0';
  const img = card.dataset.img || (card.querySelector('img') ? card.querySelector('img').src : '');
  card.style.transition = 'opacity 0.3s, transform 0.3s';
  card.style.opacity = '0';
  card.style.transform = 'scale(0.9)';
  setTimeout(() => {
    card.remove();
    injectIntoCartPage(name, price, img);
    showToast('add', 'Moved to cart!', name);
  }, 300);
}

// ===== CART PAGE: REMOVE ALL =====
function removeAll() {
  const items = document.querySelectorAll('#page-cart .cart-item');
  if (!items.length) return;
  items.forEach((item, i) => {
    setTimeout(() => {
      item.style.transition = 'opacity 0.3s, transform 0.3s';
      item.style.opacity = '0';
      item.style.transform = 'translateX(30px)';
      setTimeout(() => item.remove(), 300);
    }, i * 80);
  });
  setTimeout(() => {
    updateSummary();
    checkEmpty();
    showToast('remove', 'Cart cleared', 'All items removed');
  }, items.length * 80 + 350);
}

// ===== CART PAGE: CHECK EMPTY STATE =====
function checkEmpty() {
  const cartBox = document.querySelector('#page-cart .cart-box');
  if (!cartBox) return;
  const items = cartBox.querySelectorAll('.cart-item');
  const empty = cartBox.querySelector('.empty-cart');
  if (!items.length && !empty) {
    const div = document.createElement('div');
    div.className = 'empty-cart';
    div.style.cssText = 'padding:40px;text-align:center;color:#888;font-size:14px;';
    div.innerHTML = `
      <div style="font-size:48px;margin-bottom:12px">🛒</div>
      <div style="font-weight:600;margin-bottom:4px">Your cart is empty</div>
      <div style="font-size:12px">Add products to continue shopping</div>
    `;
    cartBox.insertBefore(div, cartBox.querySelector('.cart-footer'));
  } else if (items.length && empty) {
    empty.remove();
  }
  const title = document.querySelector('#page-cart .wrap > div:first-child');
  if (title) title.textContent = 'My cart (' + items.length + ')';
}

// ===== CART PAGE: LIVE PRICE SUMMARY =====
function updateSummary() {
  const items = document.querySelectorAll('#page-cart .cart-item');
  let sub = 0;
  items.forEach(item => {
    const price = parseFloat(item.dataset.price || 0);
    const sel = item.querySelector('.qty-sel');
    const qty = sel ? (parseInt(sel.value.replace('Qty: ', '')) || 1) : 1;
    sub += price * qty;
  });
  const discount = 60;
  const tax = 14;
  const total = Math.max(0, sub - discount + tax);
  const rows = document.querySelectorAll('#page-cart .summ-row span:last-child');
  if (rows[0]) rows[0].textContent = '$' + sub.toFixed(2);
  const totEl = document.querySelector('#page-cart .summ-tot span:last-child');
  if (totEl) totEl.textContent = '$' + total.toFixed(2);
  const title = document.querySelector('#page-cart .wrap > div:first-child');
  if (title) title.textContent = 'My cart (' + items.length + ')';
}

// ===== INJECT BUTTONS INTO .cat-cell =====
function initCatCells() {
  document.querySelectorAll('.cat-cell').forEach(cell => {
    if (cell.querySelector('.btn-atc')) return;
    const img = cell.querySelector('img');
    const nameEl = cell.querySelector('.cat-cell-name');
    const priceEl = cell.querySelector('.cat-cell-price');
    const imgSrc = img ? img.getAttribute('src') : '';
    const name = nameEl ? nameEl.textContent.trim() : 'Product';
    const price = priceEl ? priceEl.textContent.trim() : '';
    const btn = document.createElement('button');
    btn.className = 'btn-atc';
    btn.textContent = '🛒 Add to cart';
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      catAddToCart(this, name, price, imgSrc);
    });
    cell.appendChild(btn);
  });
}

// ===== INJECT BUTTONS INTO .rec-card =====
function initRecCards() {
  document.querySelectorAll('.rec-card').forEach(card => {
    if (card.querySelector('.btn-atc-rec')) return;
    const img = card.querySelector('img');
    const nameEl = card.querySelector('.rec-name');
    const priceEl = card.querySelector('.rec-price');
    const imgSrc = img ? img.getAttribute('src') : '';
    const name = nameEl ? nameEl.textContent.trim() : 'Product';
    const price = priceEl ? priceEl.textContent.trim() : '';
    const btn = document.createElement('button');
    btn.className = 'btn-atc-rec';
    btn.textContent = '🛒 Add to cart';
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      catAddToCart(this, name, price, imgSrc);
    });
    card.appendChild(btn);
  });
}

// ===== INJECT BUTTONS INTO .prod-card (mobile listing page) =====
function initProdCards() {
  document.querySelectorAll('.prod-card').forEach(card => {
    if (card.querySelector('.btn-atc-prod')) return;
    const img = card.querySelector('img');
    const nameEl = card.querySelector('.p-name');
    const priceEl = card.querySelector('.p-price');
    const imgSrc = img ? img.getAttribute('src') : '';
    const name = nameEl ? nameEl.textContent.trim() : 'Product';
    const price = priceEl ? priceEl.textContent.trim() : '';
    const btn = document.createElement('button');
    btn.className = 'btn-atc-prod';
    btn.textContent = '🛒 Add to cart';
    btn.style.cssText = 'display:block;width:calc(100% - 16px);margin:0 8px 8px;padding:6px 0;font-size:12px;font-weight:600;color:#fff;background:#2563eb;border:none;border-radius:6px;cursor:pointer;opacity:0;transform:translateY(6px);transition:opacity 0.2s,transform 0.2s;pointer-events:none;';
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      catAddToCart(this, name, price, imgSrc);
    });
    card.style.position = 'relative';
    card.style.overflow = 'hidden';
    card.addEventListener('mouseenter', () => {
      btn.style.opacity = '1';
      btn.style.transform = 'translateY(0)';
      btn.style.pointerEvents = 'all';
    });
    card.addEventListener('mouseleave', () => {
      btn.style.opacity = '0';
      btn.style.transform = 'translateY(6px)';
      btn.style.pointerEvents = 'none';
    });
    card.appendChild(btn);
  });
}

// ===== INIT CART PAGE EXISTING BUTTONS =====
function initCartPage() {
  const hardcoded = [
    { price: '78.99', name: 'Jacket in wool with multiple colors' },
    { price: '39.00', name: 'T-shirts with multiple colors, for men and lady' },
    { price: '170.50', name: "Men's Shorts with multiple colors" },
  ];
  document.querySelectorAll('#page-cart .cart-item').forEach((item, i) => {
    if (hardcoded[i]) {
      item.dataset.price = hardcoded[i].price;
      item.dataset.name = hardcoded[i].name;
    }
    const remBtn = item.querySelector('.btn-rem');
    if (remBtn) remBtn.onclick = function () { removeItem(this); };
    const sflBtn = item.querySelector('.btn-sfl');
    if (sflBtn) sflBtn.onclick = function () { saveForLater(this); };
    const sel = item.querySelector('.qty-sel');
    if (sel) sel.onchange = updateSummary;
  });

  document.querySelectorAll('#page-cart .saved-card').forEach(card => {
    const img = card.querySelector('img');
    const nameEl = card.querySelector('.sv-name');
    const priceEl = card.querySelector('.sv-price');
    card.dataset.img = img ? img.src : '';
    card.dataset.name = nameEl ? nameEl.textContent.trim() : 'Product';
    card.dataset.price = priceEl ? priceEl.textContent.replace('$', '').trim() : '0';
    const mvBtn = card.querySelector('.btn-mv');
    if (mvBtn) mvBtn.onclick = function () { moveToCart(this); };
  });

  const remAllBtn = document.querySelector('#page-cart .btn-remall');
  if (remAllBtn) remAllBtn.onclick = removeAll;
}
// ===== DYNAMIC DETAIL PAGE =====
function openDetail(imgSrc, name, price) {
  // Update main image on detail page
  const mainImg = document.getElementById('mainImg');
  if (mainImg) mainImg.src = imgSrc;

  // Update title
  const titleEl = document.querySelector('.det-title');
  if (titleEl && name) titleEl.textContent = name;

  // Update price tiers
  const priceTiers = document.querySelectorAll('.ptier-p');
  if (priceTiers.length && price) {
    priceTiers.forEach(pt => pt.textContent = price);
  }

  // Update first thumb to match
  const firstThumb = document.querySelector('.thumb img');
  if (firstThumb) firstThumb.src = imgSrc;
  const firstThumbDiv = document.querySelector('.thumb');
  if (firstThumbDiv) {
    firstThumbDiv.setAttribute('onclick', `setImg(this,'${imgSrc}')`);
  }

  // Store clicked product so "Send inquiry" adds correct item to cart
  window.currentProduct = { name, price, imgSrc };

  showPage('detail');
}
function addCurrentToCart() {
  const p = window.currentProduct;
  if (p && p.name) {
    injectIntoCartPage(p.name, p.price, p.imgSrc);
    showCatToast(p.name, p.price, p.imgSrc);
  }
  showPage('cart');
}

// ===== RUN ON PAGE LOAD =====
document.addEventListener('DOMContentLoaded', function () {
  initCatCells();
  initRecCards();
  initProdCards();
  initCartPage();
  updateSummary();
});