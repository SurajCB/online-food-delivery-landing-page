// assets/app.js
(function(){
  const STORAGE_KEY = "SIB_CART_V1";
  const GST_RATE = 0.05;
  const SERVICE_RATE = 0.02;

  function readCart(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
    catch { return []; }
  }
  function writeCart(items){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    updateCartCount();
  }
  function updateCartCount(){
    const countEl = document.getElementById("cartCount");
    if(countEl){ countEl.textContent = readCart().length; }
  }
  function money(n){ return "₹" + n.toFixed(2); }

  function toast(msg){
    const t = document.getElementById("toast");
    if(!t) return;
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(()=>t.classList.remove("show"), 1400);
  }

  function openDrawer(){
    document.getElementById("cartDrawer")?.classList.add("open");
    renderDrawer();
  }
  function closeDrawer(){
    document.getElementById("cartDrawer")?.classList.remove("open");
  }

  function addToCart(slug){
    const item = window.MENU_ITEMS.find(i=>i.slug===slug);
    if(!item) return;
    const cart = readCart();
    cart.push({ slug: item.slug, name: item.name, price: item.price, qty: 1 });
    writeCart(cart);
    renderDrawer();
    toast(item.name + " added to cart");
  }

  function removeFromCart(index){
    const cart = readCart();
    cart.splice(index, 1);
    writeCart(cart);
    renderDrawer();
  }

  function computeTotals(items){
    const subtotal = items.reduce((s, it)=> s + (it.price * (it.qty||1)), 0);
    const gst = subtotal * GST_RATE;
    const service = subtotal * SERVICE_RATE;
    const total = subtotal + gst + service;
    return { subtotal, gst, service, total };
  }

  function renderDrawer(){
    const listEl = document.getElementById("cartItems");
    const totalsEl = document.getElementById("cartTotals");
    if(!listEl || !totalsEl) return;
    const cart = readCart();
    listEl.innerHTML = cart.length ? "" : "<p>Your cart is empty.</p>";
    cart.forEach((it, idx)=>{
      const li = document.createElement("li");
      li.style.display="grid";
      li.style.gridTemplateColumns="1fr auto auto";
      li.style.gap="8px";
      li.style.alignItems="center";
      li.style.padding="8px 0";
      li.style.borderBottom="1px solid #f0e6d9";
      li.innerHTML = `<span>${it.name}</span>
                      <strong>${money(it.price)}</strong>
                      <button class="btn" data-rm="${idx}">✕</button>`;
      listEl.appendChild(li);
    });
    listEl.querySelectorAll("[data-rm]").forEach(btn=>{
      btn.addEventListener("click", e=> removeFromCart(parseInt(btn.dataset.rm,10)));
    });

    const totals = computeTotals(cart);
    totalsEl.innerHTML = `
      <div>Subtotal: <strong>${money(totals.subtotal)}</strong></div>
      <div>GST (5%): <strong>${money(totals.gst)}</strong></div>
      <div>Other Tax (2%): <strong>${money(totals.service)}</strong></div>
      <div style="margin-top:6px">Total: <strong>${money(totals.total)}</strong></div>
    `;
  }

  function renderDropdown(){
    const menuBox = document.getElementById("menuDropdown");
    if(!menuBox) return;
    menuBox.innerHTML = "";
    window.MENU_ITEMS.forEach(item=>{
      const a = document.createElement("a");
      a.href = "item.html?slug=" + encodeURIComponent(item.slug);
      a.textContent = item.name + " — ₹" + item.price;
      menuBox.appendChild(a);
    });
  }

  function renderPopular(targetId, n){
    const grid = document.getElementById(targetId);
    if(!grid) return;
    grid.innerHTML = "";
    window.MENU_ITEMS.slice(0, n).forEach(item=>{
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `
        <img alt="${item.name}" src="${item.img}">
        <div class="content">
          <h3>${item.name}</h3>
          <p class="price">₹${item.price}</p>
          <div style="display:flex;gap:8px;margin-top:8px">
            <a class="btn ghost" href="item.html?slug=${encodeURIComponent(item.slug)}">View</a>
            <button class="btn primary" data-add="${item.slug}">Add to Cart</button>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
    grid.querySelectorAll("[data-add]").forEach(btn=>{
      btn.addEventListener("click", ()=> addToCart(btn.dataset.add));
    });
  }

  function renderMenu(targetId){
    const grid = document.getElementById(targetId);
    if(!grid) return;
    grid.innerHTML = "";
    window.MENU_ITEMS.forEach(item=>{
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `
        <img alt="${item.name}" src="${item.img}">
        <div class="content">
          <h3>${item.name}</h3>
          <p>${item.desc}</p>
          <p class="price">₹${item.price}</p>
          <div style="display:flex;gap:8px;margin-top:8px">
            <a class="btn ghost" href="item.html?slug=${encodeURIComponent(item.slug)}">Details</a>
            <button class="btn primary" data-add="${item.slug}">Add to Cart</button>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
    grid.querySelectorAll("[data-add]").forEach(btn=>{
      btn.addEventListener("click", ()=> addToCart(btn.dataset.add));
    });
  }

  function renderItem(targetId, slug){
    const container = document.getElementById(targetId);
    if(!container) return;
    const item = window.MENU_ITEMS.find(i=>i.slug===slug);
    if(!item){
      container.innerHTML = "<p>Item not found.</p>";
      return;
    }
    container.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start">
        <img alt="${item.name}" src="${item.img}" style="border-radius:18px">
        <div>
          <h1>${item.name}</h1>
          <p>${item.desc}</p>
          <p class="price">₹${item.price}</p>
          <div style="display:flex;gap:8px;margin-top:8px">
            <button class="btn primary" id="addItemBtn">Add to Cart</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById("addItemBtn")?.addEventListener("click", ()=> addToCart(item.slug));
  }

  function renderCartPage(targetId){
    const el = document.getElementById(targetId);
    if(!el) return;
    const cart = readCart();
    if(!cart.length){
      el.innerHTML = "<p>Your cart is empty.</p>";
      return;
    }
    const totals = computeTotals(cart);
    const list = cart.map((it, idx)=>`
      <li style="display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:center;border-bottom:1px solid #f0e6d9;padding:10px 0">
        <span>${it.name}</span>
        <strong>${money(it.price)}</strong>
        <button class="btn" data-rm="${idx}">Remove</button>
      </li>`).join("");

    el.innerHTML = `
      <ul>${list}</ul>
      <div style="margin-top:12px">
        <div>Subtotal: <strong>${money(totals.subtotal)}</strong></div>
        <div>GST (5%): <strong>${money(totals.gst)}</strong></div>
        <div>Other Tax (2%): <strong>${money(totals.service)}</strong></div>
        <div style="margin-top:6px">Total: <strong id="orderTotal">${money(totals.total)}</strong></div>
      </div>
      <div style="margin-top:12px;display:flex;gap:8px">
        <button class="btn ghost" id="clearCartBtn">Clear Cart</button>
        <button class="btn primary" id="proceedBtn">Proceed to Payment</button>
      </div>
    `;

    el.querySelectorAll("[data-rm]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        removeFromCart(parseInt(btn.dataset.rm,10));
        renderCartPage(targetId);
      });
    });
    document.getElementById("clearCartBtn")?.addEventListener("click", ()=>{
      writeCart([]);
      renderCartPage(targetId);
    });
    document.getElementById("proceedBtn")?.addEventListener("click", ()=>{
      const t = computeTotals(readCart());
      sessionStorage.setItem("SIB_ORDER_TOTAL", String(t.total));
      location.href = "payment.html";
    });
  }

  function renderGallery(targetId){
    const grid = document.getElementById(targetId);
    if(!grid) return;
    window.MENU_ITEMS.forEach(item=>{
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `
        <img alt="${item.name}" src="${item.img}">
        <div class="content">
          <h3>${item.name}</h3>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  // Payment page init (merged flow)
  function initPayment(){
    const cart = readCart();
    const totals = computeTotals(cart);
    const summary = document.getElementById("orderSummary");
    if(summary){
      summary.innerHTML = `
        <div class="notice">
          <strong>Order Summary</strong><br>
          Items: ${cart.length}<br>
          Subtotal: ${money(totals.subtotal)}<br>
          GST: ${money(totals.gst)} • Other Tax: ${money(totals.service)}<br>
          <span style="font-weight:800">Total: ${money(totals.total)}</span>
        </div>
        <div id="extraFields" style="margin-top:10px"></div>
      `;
    }

    const methodEl = document.getElementById("method");
    const extraBox = document.getElementById("extraFields");
    function renderExtraFields(){
      if(!extraBox || !methodEl) return;
      extraBox.innerHTML = "";
      if(methodEl.value==="card"){
        extraBox.innerHTML = `
          <label>Card Number <input id="cardNumber" required></label>
          <label>Expiry <input id="cardExpiry" required></label>
          <label>CVV <input id="cardCVV" required></label>
        `;
      } else if(methodEl.value==="upi"){
        extraBox.innerHTML = `<label>UPI ID <input id="upiId" required></label>`;
      }
    }
    methodEl?.addEventListener("change", renderExtraFields);
    renderExtraFields();

    const form = document.getElementById("paymentForm");
    form?.addEventListener("submit", (e)=>{
      e.preventDefault();
      const name = document.getElementById("name").value;
      const phone = document.getElementById("phone").value;
      const address = document.getElementById("address").value;
      const method = methodEl?.value || "cod";

      const orderId = "SIB" + Math.floor(100000 + Math.random()*900000);
      sessionStorage.setItem("SIB_LAST_ORDER_ID", orderId);
      sessionStorage.setItem("SIB_LAST_ORDER_TOTAL", String(totals.total));
      sessionStorage.setItem("SIB_LAST_PAYMENT_METHOD", method);

      if(method==="card"){
        sessionStorage.setItem("SIB_LAST_PAYMENT_DETAILS", JSON.stringify({
          cardNumber: document.getElementById("cardNumber").value,
          cardExpiry: document.getElementById("cardExpiry").value
        }));
      } else if(method==="upi"){
        sessionStorage.setItem("SIB_LAST_PAYMENT_DETAILS", JSON.stringify({
          upiId: document.getElementById("upiId").value
        }));
      } else {
        sessionStorage.setItem("SIB_LAST_PAYMENT_DETAILS", "Cash on Delivery");
      }

      writeCart([]);
      location.href = "thankyou.html";
    });
  }

  function renderThankYou(){
    const id = sessionStorage.getItem("SIB_LAST_ORDER_ID") || "—";
    const total = Number(sessionStorage.getItem("SIB_LAST_ORDER_TOTAL") || "0");
    const method = sessionStorage.getItem("SIB_LAST_PAYMENT_METHOD") || "—";
    const details = sessionStorage.getItem("SIB_LAST_PAYMENT_DETAILS") || "";
    const box = document.getElementById("orderInfo");
    if(box){
      box.innerHTML = `
        Order ID: <strong>${id}</strong><br>
        Total Paid: <strong>${money(total)}</strong><br>
        Payment Method: <strong>${method}</strong><br>
        <small>${details}</small>
      `;
    }
  }

  function initUI(){
    updateCartCount();
    const menuBox = document.getElementById("menuDropdown");
    if(menuBox){
      menuBox.innerHTML = "";
      window.MENU_ITEMS.forEach(item=>{
        const a = document.createElement("a");
        a.href = "item.html?slug=" + encodeURIComponent(item.slug);
        a.textContent = item.name + " — ₹" + item.price;
        menuBox.appendChild(a);
      });
    }
    document.getElementById("openCartBtn")?.addEventListener("click", openDrawer);
    document.getElementById("closeCartBtn")?.addEventListener("click", closeDrawer);
    document.getElementById("cartBackdrop")?.addEventListener("click", closeDrawer);
    document.getElementById("checkoutBtn")?.addEventListener("click", ()=>{
      closeDrawer();
      const t = computeTotals(readCart());
      sessionStorage.setItem("SIB_ORDER_TOTAL", String(t.total));
      location.href = "payment.html";
    });
  }

  window.SIB = {
    addToCart, renderPopular, renderMenu, renderItem, renderCartPage, renderGallery,
    initPayment, renderThankYou
  };

  document.addEventListener("DOMContentLoaded", initUI);
})();
