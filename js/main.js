document.addEventListener('DOMContentLoaded', function() {
    
    // ============================================
    // CSRF TOKEN OLUŞTUR
    // ============================================
    function generateCSRFToken() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    const csrfInput = document.getElementById('csrf_token');
    if (csrfInput) csrfInput.value = generateCSRFToken();
    
    // ============================================
    // MOBİL MENÜ
    // ============================================
    const mobileToggle = document.getElementById('mobileToggle');
    const mainNav = document.querySelector('.main-navigation');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
    if (window.innerWidth <= 768) {
        const dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(dropdown => {
            const link = dropdown.querySelector('a');
            link.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                }
            });
        });
    }
    
    // ============================================
    // ARAMA SONUÇLARI SAYFASI
    // ============================================
    if (window.location.pathname.includes('arama-sonuclari.html')) {
        const params = new URLSearchParams(window.location.search);
        const query = params.get('q') || '';
        const searchQueryEl = document.getElementById('searchQuery');
        const resultsContainer = document.getElementById('searchResults');
        if (searchQueryEl) searchQueryEl.textContent = query;
        if (resultsContainer) {
            if (query.length > 0) {
                const siteContent = [
                    { title: 'ISO 9001:2015', url: 'belge-detay/iso-9001-2015.html', desc: 'Kalite yönetim sistemi standardı.' },
                    { title: 'ISO 14001', url: 'belge-detay/iso-14001.html', desc: 'Çevre yönetim sistemi standardı.' },
                    { title: 'ISO 27001', url: 'belge-detay/iso-27001.html', desc: 'Bilgi güvenliği yönetim sistemi.' },
                    { title: 'OHSAS 18001', url: 'belge-detay/ohsas-18001.html', desc: 'İş sağlığı ve güvenliği yönetim sistemi.' },
                    { title: 'HACCP', url: 'belge-detay/haccp.html', desc: 'Gıda güvenliği yönetim sistemi.' },
                    { title: 'CE Marking', url: 'belge-detay/ce-marking.html', desc: 'Avrupa Uygunluk İşareti.' },
                    { title: 'ISO/TS 16949', url: 'belge-detay/iso-ts-16949.html', desc: 'Otomotiv Kalite Yönetim Sistemi.' },
                    { title: 'AS 9100', url: 'belge-detay/as-9100.html', desc: 'Havacılık Kalite Yönetim Sistemi.' },
                    { title: 'TURKAK Onaylı Belgeler', url: 'belge-detay/turkak-onayli-belgeler.html', desc: 'Türk Akreditasyon Kurumu onaylı belgelendirme.' },
                    { title: 'Hakkımızda', url: 'hakkimizda.html', desc: 'Kalicert Belgelendirme hakkında.' },
                    { title: 'Hizmetlerimiz', url: 'hizmetlerimiz.html', desc: 'Belgelendirme hizmetlerimiz.' },
                    { title: 'İletişim', url: 'iletisim.html', desc: 'İletişim bilgilerimiz.' }
                ];
                const filtered = siteContent.filter(item => item.title.toLowerCase().includes(query.toLowerCase()) || item.desc.toLowerCase().includes(query.toLowerCase()));
                if (filtered.length > 0) {
                    let html = '<ul class="results-list">';
                    filtered.forEach(item => { html += `<li><a href="${item.url}"><h4>${item.title}</h4><p>${item.desc}</p></a></li>`; });
                    html += '</ul>';
                    resultsContainer.innerHTML = html;
                } else { resultsContainer.innerHTML = '<p class="no-results">Sonuç bulunamadı.</p>'; }
            } else { resultsContainer.innerHTML = '<p class="no-results">Lütfen arama yapın.</p>'; }
        }
    }
    
    // ============================================
    // İLETİŞİM FORMU - info@kalicert.net adresine gönderir
    // ============================================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const submitBtn = document.getElementById('submitBtn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnSpinner = submitBtn.querySelector('.btn-spinner');
        const formMessage = document.getElementById('formMessage');
        const nameError = document.getElementById('name-error'), emailError = document.getElementById('email-error'), phoneError = document.getElementById('phone-error'), messageError = document.getElementById('message-error');
        const nameInput = document.getElementById('name'), emailInput = document.getElementById('email'), phoneInput = document.getElementById('phone'), messageInput = document.getElementById('message');
        
        function clearErrors() { if(nameError) nameError.textContent = ''; if(emailError) emailError.textContent = ''; if(phoneError) phoneError.textContent = ''; if(messageError) messageError.textContent = ''; }
        function resetInputBorders() { [nameInput, emailInput, phoneInput, messageInput].forEach(input => { if (input) input.style.borderColor = ''; }); }
        
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitBtn.disabled = true; btnText.style.display = 'none'; btnSpinner.style.display = 'inline-block';
            formMessage.style.display = 'none'; formMessage.className = 'form-message';
            clearErrors(); resetInputBorders();
            const formData = new FormData(contactForm);
            
            fetch('contact.php', { method: 'POST', body: formData })
            .then(response => response.json())
            .then(data => {
                submitBtn.disabled = false; btnText.style.display = 'inline-block'; btnSpinner.style.display = 'none';
                if (data.success) {
                    formMessage.className = 'form-message success';
                    formMessage.innerHTML = '<i class="fas fa-check-circle"></i> ' + data.message;
                    formMessage.style.display = 'block';
                    contactForm.reset();
                    if (csrfInput) csrfInput.value = generateCSRFToken();
                } else {
                    formMessage.className = 'form-message error';
                    if (data.errors) {
                        if (data.errors.name && nameError) { nameError.textContent = data.errors.name; nameInput.style.borderColor = '#dc3545'; }
                        if (data.errors.email && emailError) { emailError.textContent = data.errors.email; emailInput.style.borderColor = '#dc3545'; }
                        if (data.errors.phone && phoneError) { phoneError.textContent = data.errors.phone; phoneInput.style.borderColor = '#dc3545'; }
                        if (data.errors.message && messageError) { messageError.textContent = data.errors.message; messageInput.style.borderColor = '#dc3545'; }
                        formMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> ' + data.message;
                    } else { formMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> ' + data.message; }
                    formMessage.style.display = 'block';
                }
                setTimeout(() => formMessage.style.display = 'none', 8000);
            })
            .catch(error => {
                submitBtn.disabled = false; btnText.style.display = 'inline-block'; btnSpinner.style.display = 'none';
                formMessage.className = 'form-message error';
                formMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Bağlantı hatası. Lütfen telefonla ulaşın.';
                formMessage.style.display = 'block';
            });
        });
        [nameInput, emailInput, phoneInput, messageInput].forEach(input => { if (input) input.addEventListener('focus', function() { this.style.borderColor = ''; }); });
    }
});