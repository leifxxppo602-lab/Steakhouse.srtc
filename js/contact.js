/* ==========================================================================
   KAGURA RESTAURANT - CONTACT PAGE SCRIPT
   Interactive FAQ Accordion & Form Validation
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initFaqAccordion();
  initContactForm();
});

function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      
      // Close all others
      faqItems.forEach(other => other.classList.remove('active'));

      if (!isOpen) {
        item.classList.add('active');
      }
    });
  });
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const name = document.getElementById('contact-name')?.value;
    
    if (window.showToast) {
      window.showToast(`ขอบคุณคุณ ${name} ทีมงานได้รับข้อความเรียบร้อยแล้ว`, 'check');
    }

    form.reset();
  });
}
