/* ==========================================================================
   KAGURA RESTAURANT - RESERVATION SYSTEM
   Interactive Zone Selector & Booking Voucher Confirmation
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initReservation();
});

let selectedZoneId = 'chef-counter';

function initReservation() {
  renderZoneCards();
  initDateInput();
  initFormSubmission();
}

function renderZoneCards() {
  const container = document.getElementById('zones-selection-container');
  if (!container) return;

  container.innerHTML = SEATING_ZONES.map(zone => {
    const isSelected = zone.id === selectedZoneId;
    return `
      <div class="zone-card ${isSelected ? 'selected' : ''}" data-zone-id="${zone.id}" onclick="selectZone('${zone.id}')">
        <img src="${zone.image}" alt="${zone.name}" class="zone-card-img">
        <div class="zone-card-content">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.3rem;">
            <h4 style="color: #fff; font-size: 1.1rem;">${zone.nameTh}</h4>
            <span class="badge ${zone.badge === 'Exclusive' ? 'badge-chef' : 'badge-subtle'}">${zone.badge}</span>
          </div>
          <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.6rem;">${zone.name}</p>
          <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 0.8rem;">${zone.description}</p>
          <div style="display: flex; justify-content: space-between; font-size: 0.82rem; color: var(--primary-red); font-weight: 600; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.6rem;">
            <span>👥 จุได้ ${zone.capacity}</span>
            <span>${zone.surcharge}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.selectZone = function(zoneId) {
  selectedZoneId = zoneId;
  const cards = document.querySelectorAll('.zone-card');
  cards.forEach(card => {
    if (card.dataset.zoneId === zoneId) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });

  const zoneInput = document.getElementById('res-zone-input');
  if (zoneInput) zoneInput.value = zoneId;
};

function initDateInput() {
  const dateInput = document.getElementById('res-date');
  if (!dateInput) return;

  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;
  if (!dateInput.value) {
    dateInput.value = today;
  }
}

function initFormSubmission() {
  const form = document.getElementById('reservation-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const name = document.getElementById('res-name').value;
    const phone = document.getElementById('res-phone').value;
    const email = document.getElementById('res-email').value || '-';
    const date = document.getElementById('res-date').value;
    const time = document.getElementById('res-time').value;
    const guests = document.getElementById('res-guests').value;
    const occasion = document.getElementById('res-occasion').value;
    const notes = document.getElementById('res-notes').value || 'ไม่มีหมายเหตุเพิ่มเติม';

    const zoneObj = SEATING_ZONES.find(z => z.id === selectedZoneId) || SEATING_ZONES[0];
    const bookingCode = 'KG-VIP-' + Math.floor(10000 + Math.random() * 90000);

    const bookingData = {
      bookingCode,
      name,
      phone,
      email,
      date,
      time,
      guests,
      zone: zoneObj.nameTh,
      occasion,
      notes,
      createdAt: new Date().toISOString()
    };

    // Save to localStorage
    try {
      const bookings = JSON.parse(localStorage.getItem('kagura_bookings') || '[]');
      bookings.unshift(bookingData);
      localStorage.setItem('kagura_bookings', JSON.stringify(bookings));
    } catch(e) {}

    // Show Voucher Modal
    showBookingVoucher(bookingData);

    if (window.showToast) {
      window.showToast('สำรองโต๊ะสำเร็จ! รหัสการจอง: ' + bookingCode, 'check');
    }

    form.reset();
    initDateInput();
  });
}

function showBookingVoucher(data) {
  const modal = document.getElementById('reservation-voucher-modal');
  const container = document.getElementById('voucher-content');
  if (!modal || !container) return;

  container.innerHTML = `
    <div style="background: linear-gradient(135deg, #181b24 0%, #101217 100%); border: 1.5px solid var(--border-red); border-radius: var(--radius-lg); padding: 2rem; position: relative; overflow: hidden; box-shadow: 0 0 35px var(--primary-red-glow);">
      
      <div style="position: absolute; top: -30px; right: -30px; width: 120px; height: 120px; background: rgba(255,42,75,0.15); border-radius: 50%; filter: blur(30px);"></div>

      <div style="text-align: center; margin-bottom: 1.8rem; border-bottom: 1px dashed rgba(255,42,75,0.3); padding-bottom: 1.5rem;">
        <span style="font-family: var(--font-serif); font-size: 1.4rem; font-weight: 800; color: #fff; letter-spacing: 2px;">KAGURA STEAKHOUSE</span>
        <div style="font-size: 0.85rem; color: var(--gold-accent); margin-top: 0.3rem;">★ VIP RESERVATION PASS ★</div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.2rem; margin-bottom: 1.5rem; font-size: 0.92rem;">
        <div>
          <span style="color: var(--text-muted); font-size: 0.78rem; display: block; text-transform: uppercase;">รหัสการจอง (Booking ID)</span>
          <strong style="color: var(--primary-red); font-size: 1.2rem; font-family: var(--font-serif);">${data.bookingCode}</strong>
        </div>
        <div>
          <span style="color: var(--text-muted); font-size: 0.78rem; display: block; text-transform: uppercase;">ชื่อผู้จอง (Guest Name)</span>
          <strong style="color: #fff;">${data.name}</strong>
        </div>
        <div>
          <span style="color: var(--text-muted); font-size: 0.78rem; display: block; text-transform: uppercase;">วันที่ & เวลา (Date & Time)</span>
          <strong style="color: #fff;">${data.date} เวลา ${data.time} น.</strong>
        </div>
        <div>
          <span style="color: var(--text-muted); font-size: 0.78rem; display: block; text-transform: uppercase;">จำนวนผู้ร่วมโต๊ะ (Party Size)</span>
          <strong style="color: #fff;">${data.guests} ท่าน</strong>
        </div>
        <div style="grid-column: 1 / -1;">
          <span style="color: var(--text-muted); font-size: 0.78rem; display: block; text-transform: uppercase;">โซนที่นั่ง (Seating Area)</span>
          <strong style="color: var(--gold-accent); font-size: 1rem;">${data.zone}</strong>
        </div>
        <div style="grid-column: 1 / -1;">
          <span style="color: var(--text-muted); font-size: 0.78rem; display: block; text-transform: uppercase;">โอกาสพิเศษ (Occasion)</span>
          <span style="color: var(--text-secondary);">${data.occasion} (${data.notes})</span>
        </div>
      </div>

      <div style="background: rgba(0,0,0,0.4); border-radius: var(--radius-md); padding: 1rem; text-align: center; border: 1px solid rgba(255,255,255,0.06); margin-bottom: 1.5rem;">
        <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
          * โปรดแสดงบัตรนี้แก่พนักงานต้อนรับเมื่อเดินทางมาถึง โต๊ะจะถูกสำรองไว้เป็นเวลา 20 นาทีจากเวลานัดหมาย
        </p>
        <span style="font-size: 0.8rem; color: var(--primary-red);">เบอร์ติดต่อร้าน: 02-999-8888 หรือ 081-234-5678</span>
      </div>

      <button class="btn btn-primary" style="width: 100%;" onclick="document.getElementById('reservation-voucher-modal').classList.remove('active'); document.body.style.overflow = '';">
        บันทึก & ปิดหน้าต่าง
      </button>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}
