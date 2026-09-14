/* ==========================================================================
   KAGURA RESTAURANT - SHOPPING CART & ORDER SYSTEM
   Handles state persistence across pages, flyout drawer & checkout
   ========================================================================== */

class KaguraCart {
  constructor() {
    this.storageKey = 'kagura_cart_items';
    this.historyKey = 'kagura_order_history';
    this.items = this.loadCart();
    this.vatRate = 0.07;
    this.serviceRate = 0.10;
    
    this.init();
  }

  loadCart() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
      this.updateBadges();
      this.renderDrawer();
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }

  addItem(dishId, quantity = 1) {
    const dish = MENU_DATA.find(d => d.id === dishId);
    if (!dish) return false;

    const existing = this.items.find(item => item.id === dishId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push({
        id: dish.id,
        name: dish.name,
        nameTh: dish.nameTh,
        price: dish.price,
        image: dish.image,
        quantity: quantity
      });
    }

    this.saveCart();

    // Trigger toast notification
    if (window.showToast) {
      window.showToast(`เพิ่ม "${dish.nameTh}" ลงในตะกร้าเรียบร้อย`, 'check');
    }

    // Bounce cart badge
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(b => {
      b.classList.remove('bounce');
      void b.offsetWidth; // trigger reflow
      b.classList.add('bounce');
    });

    return true;
  }

  removeItem(dishId) {
    const item = this.items.find(i => i.id === dishId);
    this.items = this.items.filter(i => i.id !== dishId);
    this.saveCart();
    if (item && window.showToast) {
      window.showToast(`นำ "${item.nameTh}" ออกจากรายการแล้ว`, 'trash');
    }
  }

  updateQuantity(dishId, delta) {
    const item = this.items.find(i => i.id === dishId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeItem(dishId);
    } else {
      this.saveCart();
    }
  }

  clearCart() {
    this.items = [];
    this.saveCart();
  }

  getTotalCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getCalculations() {
    const subtotal = this.getSubtotal();
    const serviceCharge = Math.round(subtotal * this.serviceRate);
    const vat = Math.round((subtotal + serviceCharge) * this.vatRate);
    const total = subtotal + serviceCharge + vat;

    return {
      subtotal,
      serviceCharge,
      vat,
      total
    };
  }

  updateBadges() {
    const count = this.getTotalCount();
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(b => {
      b.textContent = count;
      b.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  renderDrawer() {
    const container = document.getElementById('cart-items-container');
    const subtotalEl = document.getElementById('cart-subtotal-val');
    const serviceEl = document.getElementById('cart-service-val');
    const vatEl = document.getElementById('cart-vat-val');
    const totalEl = document.getElementById('cart-total-val');
    const checkoutBtn = document.getElementById('cart-checkout-btn');

    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = `
        <div class="cart-empty-state">
          <div class="cart-empty-icon">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h4 style="margin-bottom: 0.5rem; color: #fff;">ยังไม่มีรายการในตะกร้า</h4>
          <p style="font-size: 0.88rem;">เลือกเมนูที่คุณชื่นชอบเพื่อเริ่มสั่งอาหารพรีเมียม</p>
          <a href="menu.html" class="btn btn-outline btn-sm" style="margin-top: 1.2rem;" onclick="cartApp.closeDrawer()">ดูเมนูอาหาร</a>
        </div>
      `;
      if (checkoutBtn) checkoutBtn.disabled = true;
      if (subtotalEl) subtotalEl.textContent = '฿0';
      if (serviceEl) serviceEl.textContent = '฿0';
      if (vatEl) vatEl.textContent = '฿0';
      if (totalEl) totalEl.textContent = '฿0';
      return;
    }

    if (checkoutBtn) checkoutBtn.disabled = false;

    container.innerHTML = this.items.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.nameTh}</div>
          <div class="cart-item-price">฿${(item.price * item.quantity).toLocaleString()}</div>
        </div>
        <div class="cart-qty-control">
          <button class="qty-btn minus" onclick="cartApp.updateQuantity('${item.id}', -1)" title="ลด">-</button>
          <span class="qty-val">${item.quantity}</span>
          <button class="qty-btn plus" onclick="cartApp.updateQuantity('${item.id}', 1)" title="เพิ่ม">+</button>
        </div>
        <button class="cart-remove-btn" onclick="cartApp.removeItem('${item.id}')" title="ลบ">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    `).join('');

    const calc = this.getCalculations();
    if (subtotalEl) subtotalEl.textContent = `฿${calc.subtotal.toLocaleString()}`;
    if (serviceEl) serviceEl.textContent = `฿${calc.serviceCharge.toLocaleString()}`;
    if (vatEl) vatEl.textContent = `฿${calc.vat.toLocaleString()}`;
    if (totalEl) totalEl.textContent = `฿${calc.total.toLocaleString()}`;
  }

  openDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (drawer && overlay) {
      drawer.classList.add('active');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      this.renderDrawer();
    }
  }

  closeDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (drawer && overlay) {
      drawer.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.updateBadges();
      this.renderDrawer();

      // Trigger buttons
      document.querySelectorAll('.cart-trigger-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.openDrawer();
        });
      });

      const closeBtn = document.getElementById('cart-close-btn');
      if (closeBtn) closeBtn.addEventListener('click', () => this.closeDrawer());

      const overlay = document.getElementById('cart-overlay');
      if (overlay) overlay.addEventListener('click', () => this.closeDrawer());

      // Checkout Button
      const checkoutBtn = document.getElementById('cart-checkout-btn');
      if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
          this.openCheckoutModal();
        });
      }
    });
  }

  openCheckoutModal() {
    if (this.items.length === 0) return;
    this.closeDrawer();

    const modal = document.getElementById('checkout-modal');
    if (!modal) return;

    const calc = this.getCalculations();
    const modalTotal = document.getElementById('modal-checkout-total');
    if (modalTotal) modalTotal.textContent = `฿${calc.total.toLocaleString()}`;

    modal.classList.add('active');
    modal.scrollTop = 0;
    const cont = modal.querySelector('.modal-container');
    if (cont) cont.scrollTop = 0;
    document.body.style.overflow = 'hidden';
  }

  processOrder(event) {
    if (event) event.preventDefault();
    const form = document.getElementById('checkout-form');
    if (!form || !form.checkValidity()) {
      if (form) form.reportValidity();
      return;
    }

    const name = document.getElementById('checkout-name')?.value || 'แขกผู้มีเกียรติ';
    const phone = document.getElementById('checkout-phone')?.value || '-';
    const diningType = document.getElementById('checkout-type')?.value || 'Dine-in (รับประทานที่ร้าน)';
    const payment = document.querySelector('input[name="payment_method"]:checked')?.value || 'QR PromptPay';

    const calc = this.getCalculations();
    const orderId = 'KG-' + Math.floor(100000 + Math.random() * 900000);
    const orderDate = new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });

    const orderData = {
      orderId,
      orderDate,
      customer: { name, phone, diningType },
      payment,
      items: [...this.items],
      calculations: calc
    };

    // Save to order history
    try {
      const history = JSON.parse(localStorage.getItem(this.historyKey) || '[]');
      history.unshift(orderData);
      localStorage.setItem(this.historyKey, JSON.stringify(history));
    } catch(e) {}

    // Clear cart
    this.clearCart();

    // Close checkout modal & show receipt modal
    document.getElementById('checkout-modal')?.classList.remove('active');
    this.showReceipt(orderData);
  }

  showReceipt(order) {
    const receiptModal = document.getElementById('receipt-modal');
    const container = document.getElementById('receipt-content');
    if (!receiptModal || !container) return;

    container.innerHTML = `
      <div style="text-align: center; margin-bottom: 1.5rem;">
        <div style="width: 60px; height: 60px; background: rgba(255,42,75,0.15); border: 1px solid var(--primary-red); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem auto; color: var(--primary-red);">
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 style="color: #fff; margin-bottom: 0.3rem;">คำสั่งซื้อสำเร็จ!</h3>
        <p style="font-size: 0.9rem; color: var(--text-secondary);">ขอขอบคุณที่ร่วมสัมผัสประสบการณ์กับ KAGURA</p>
      </div>

      <div style="background: var(--bg-surface-elevated); padding: 1.2rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 1.5rem; font-size: 0.9rem;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
          <span style="color: var(--text-muted);">หมายเลขคำสั่งซื้อ:</span>
          <strong style="color: var(--primary-red); letter-spacing: 1px;">${order.orderId}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
          <span style="color: var(--text-muted);">เวลาสั่ง:</span>
          <span>${order.orderDate}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
          <span style="color: var(--text-muted);">ชื่อผู้สั่ง:</span>
          <span>${order.customer.name} (${order.customer.phone})</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
          <span style="color: var(--text-muted);">รูปแบบ:</span>
          <span>${order.customer.diningType}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: var(--text-muted);">การชำระเงิน:</span>
          <span style="color: var(--gold-accent);">${order.payment}</span>
        </div>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <h4 style="font-size: 1rem; margin-bottom: 0.8rem; color: #fff;">รายการที่สั่ง (${order.items.length} รายการ)</h4>
        <div style="max-height: 180px; overflow-y: auto; padding-right: 0.5rem;">
          ${order.items.map(i => `
            <div style="display: flex; justify-content: space-between; font-size: 0.88rem; margin-bottom: 0.6rem; padding-bottom: 0.6rem; border-bottom: 1px solid rgba(255,255,255,0.05);">
              <span>${i.nameTh} × ${i.quantity}</span>
              <span style="color: var(--text-primary); font-weight: 600;">฿${(i.price * i.quantity).toLocaleString()}</span>
            </div>
          `).join('')}
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 1.15rem; font-weight: 700; margin-top: 1rem; padding-top: 0.8rem; border-top: 1px solid var(--border-subtle);">
          <span>ยอดรวมสุทธิ (Net Total):</span>
          <span style="color: var(--primary-red); font-family: var(--font-serif);">฿${order.calculations.total.toLocaleString()}</span>
        </div>
      </div>

      <div style="display: flex; gap: 1rem;">
        <button class="btn btn-primary" style="width: 100%;" onclick="document.getElementById('receipt-modal').classList.remove('active'); document.body.style.overflow = '';">ตกลง</button>
      </div>
    `;

    receiptModal.classList.add('active');
    receiptModal.scrollTop = 0;
    const rCont = receiptModal.querySelector('.modal-container');
    if (rCont) rCont.scrollTop = 0;
    document.body.style.overflow = 'hidden';
  }
}

// Global instance
const cartApp = new KaguraCart();
window.cartApp = cartApp;
