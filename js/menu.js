/* ==========================================================================
   KAGURA RESTAURANT - MENU PAGE SCRIPT
   Filtering, Search, and Dish Detail Modal
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initMenu();
});

let currentCategory = 'all';
let searchQuery = '';

function initMenu() {
  const container = document.getElementById('menu-grid');
  if (!container) return;

  renderMenu();

  // Category Filter Buttons
  const filterBtns = document.querySelectorAll('.menu-tab-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category;
      btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      renderMenu();
    });
  });

  // Search Input
  const searchInput = document.getElementById('menu-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      renderMenu();
    });
  }
}

function renderMenu() {
  const container = document.getElementById('menu-grid');
  if (!container) return;

  const filtered = MENU_DATA.filter(dish => {
    const matchesCat = currentCategory === 'all' || dish.category === currentCategory;
    const matchesSearch = searchQuery === '' || 
      dish.name.toLowerCase().includes(searchQuery) ||
      dish.nameTh.toLowerCase().includes(searchQuery) ||
      dish.description.toLowerCase().includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
        <div style="width: 64px; height: 64px; background: rgba(255, 42, 75, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem auto; color: var(--primary-red);">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 style="color: #fff; margin-bottom: 0.5rem;">ไม่พบเมนูที่ตรงกับคำค้นหา</h3>
        <p style="color: var(--text-secondary);">ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่นดูสิครับ</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(dish => {
    const badgesHtml = dish.tags.map(t => {
      if (t === 'Signature' || t === 'Chef Choice') {
        return `<span class="badge badge-chef">${t}</span>`;
      } else if (t === 'Spicy') {
        return `<span class="badge badge-fire">🌶️ ${t}</span>`;
      }
      return `<span class="badge badge-subtle">${t}</span>`;
    }).join('');

    return `
      <div class="dish-card" data-id="${dish.id}">
        <div class="dish-image-wrapper" onclick="openDishModal('${dish.id}')" style="cursor: pointer;">
          <img src="${dish.image}" alt="${dish.name}" class="dish-image" loading="lazy">
          <div class="dish-badge-group">
            ${badgesHtml}
          </div>
        </div>
        <div class="dish-content">
          <div class="dish-header">
            <div>
              <h3 class="dish-title" onclick="openDishModal('${dish.id}')" style="cursor: pointer;">${dish.nameTh}</h3>
              <span style="font-size: 0.8rem; color: var(--text-muted);">${dish.name}</span>
            </div>
            <span class="dish-price">฿${dish.price.toLocaleString()}</span>
          </div>
          <p class="dish-desc">${dish.description}</p>
          <div class="dish-footer">
            <div class="dish-meta">
              <span style="color: var(--gold-accent);">★ ${dish.rating}</span>
              <span>(${dish.reviewsCount})</span>
            </div>
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn-outline btn-sm" onclick="openDishModal('${dish.id}')" title="ดูรายละเอียด">
                รายละเอียด
              </button>
              <button class="btn btn-primary btn-sm" onclick="cartApp.addItem('${dish.id}', 1)">
                + สั่ง
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Dish Modal detail viewer
window.openDishModal = function(dishId) {
  const dish = MENU_DATA.find(d => d.id === dishId);
  if (!dish) return;

  const modal = document.getElementById('dish-detail-modal');
  const container = document.getElementById('dish-detail-content');
  if (!modal || !container) return;

  const spiceIcons = '🌶️'.repeat(dish.spiceLevel) || 'ไม่เผ็ด';

  container.innerHTML = `
    <div style="position: relative;">
      <img src="${dish.image}" alt="${dish.name}" style="width: 100%; height: clamp(170px, 26vh, 250px); object-fit: cover; border-radius: var(--radius-lg) var(--radius-lg) 0 0;">
      <div style="position: absolute; bottom: 0.8rem; left: 1.2rem; display: flex; gap: 0.4rem; flex-wrap: wrap;">
        ${dish.tags.map(t => `<span class="badge badge-fire">${t}</span>`).join('')}
      </div>
    </div>
    <div style="padding: 1.4rem;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; gap: 0.8rem;">
        <div>
          <h2 style="font-size: clamp(1.2rem, 3.5vw, 1.5rem); color: #fff; margin-bottom: 0.2rem; line-height: 1.25;">${dish.nameTh}</h2>
          <p style="color: var(--text-muted); font-size: 0.88rem;">${dish.name}</p>
        </div>
        <div style="font-family: var(--font-serif); font-size: clamp(1.4rem, 4vw, 1.7rem); font-weight: 700; color: var(--primary-red); white-space: nowrap;">
          ฿${dish.price.toLocaleString()}
        </div>
      </div>

      <p style="font-size: 0.92rem; line-height: 1.65; color: var(--text-secondary); margin: 0.8rem 0 1.2rem 0;">
        ${dish.description}
      </p>

      <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.2rem;">
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.8rem; font-size: 0.88rem;">
          <div>
            <span style="color: var(--text-muted); display: block; font-size: 0.78rem;">ความเผ็ด:</span>
            <span>${spiceIcons}</span>
          </div>
          <div>
            <span style="color: var(--text-muted); display: block; font-size: 0.78rem;">เวลาปรุง:</span>
            <span>${dish.prepTime}</span>
          </div>
          <div>
            <span style="color: var(--text-muted); display: block; font-size: 0.78rem;">พลังงาน:</span>
            <span>${dish.calories}</span>
          </div>
          <div>
            <span style="color: var(--text-muted); display: block; font-size: 0.78rem;">คะแนนความพึงพอใจ:</span>
            <span style="color: var(--gold-accent);">★ ${dish.rating} (${dish.reviewsCount} รีวิว)</span>
          </div>
        </div>
        <div style="margin-top: 0.7rem; padding-top: 0.7rem; border-top: 1px solid rgba(255,255,255,0.05); font-size: 0.82rem;">
          <span style="color: var(--text-muted);">วัตถุดิบสำคัญ:</span>
          <span style="color: var(--text-secondary);">${dish.ingredients}</span>
        </div>
      </div>

      <div style="display: flex; gap: 0.8rem; align-items: center; flex-wrap: wrap;">
        <div class="cart-qty-control" style="padding: 0.2rem 0.5rem;">
          <button class="qty-btn" onclick="const q = document.getElementById('modal-dish-qty'); if(+q.value > 1) q.value = +q.value - 1;">-</button>
          <input type="number" id="modal-dish-qty" value="1" min="1" max="99" style="width: 40px; background: transparent; border: none; color: #fff; text-align: center; font-weight: 700;">
          <button class="qty-btn" onclick="const q = document.getElementById('modal-dish-qty'); q.value = +q.value + 1;">+</button>
        </div>
        <button class="btn btn-primary" style="flex-grow: 1; min-width: 180px;" onclick="
          const qty = parseInt(document.getElementById('modal-dish-qty').value) || 1;
          cartApp.addItem('${dish.id}', qty);
          document.getElementById('dish-detail-modal').classList.remove('active');
          document.body.style.overflow = '';
        ">
          เพิ่มในตะกร้า ฿${dish.price.toLocaleString()}
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');
  const modalContainer = modal.querySelector('.modal-container');
  if (modalContainer) modalContainer.scrollTop = 0;
  modal.scrollTop = 0;
  document.body.style.overflow = 'hidden';
};
