document.addEventListener('DOMContentLoaded', function() {
    
    // ============================================
    // CSRF TOKEN OLUŞTUR
    // ============================================
    function generateCSRFToken() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }
    
    const csrfInput = document.getElementById('csrf_token');
    if (csrfInput) {
        csrfInput.value = generateCSRFToken();
    }
    
    // ============================================
    // MOBİL MENÜ
    // ============================================
    const mobileToggle = document.getElementById('mobileToggle');
    const mainNav = document.querySelector('.main-navigation');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
    
    // Mobilde dropdown menüler için
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
        
        if (searchQueryEl) {
            searchQueryEl.textContent = query;
        }
        
        if (resultsContainer) {
            if (query.length > 0) {
                const siteContent = [
                    { title: 'ISO 9001:2015 Kalite Yönetim Sistemi', url: 'belge-detay/iso-9001-2015.html', desc: 'Kalite yönetim sistemi standardı, müşteri memnuniyeti ve sürekli iyileştirme.' },
                    { title: 'ISO 14001 Çevre Yönetim Sistemi', url: 'belge-detay/iso-14001.html', desc: 'Çevre yönetim sistemi standardı, çevresel performansın artırılması.' },
                    { title: 'ISO 27001 Bilgi Güvenliği Yönetim Sistemi', url: 'belge-detay/iso-27001.html', desc: 'Bilgi güvenliği yönetim sistemi, risk analizi ve bilgi varlıklarının korunması.' },
                    { title: 'OHSAS 18001 İş Sağlığı ve Güvenliği', url: 'belge-detay/ohsas-18001.html', desc: 'İş sağlığı ve güvenliği yönetim sistemi, çalışan güvenliği.' },
                    { title: 'HACCP Gıda Güvenliği Yönetim Sistemi', url: 'belge-detay/haccp.html', desc: 'Tehlike analizi ve kritik kontrol noktaları, gıda güvenliği.' },
                    { title: 'CE Marking - Avrupa Uygunluk İşareti', url: 'belge-detay/ce-marking.html', desc: 'CE işareti, Avrupa Birliği teknik mevzuat uyumu.' },
                    { title: 'ISO/TS 16949 Otomotiv Kalite Yönetim Sistemi', url: 'belge-detay/iso-ts-16949.html', desc: 'Otomotiv ana ve yan sanayi kalite yönetim sistemi.' },
                    { title: 'Hakkımızda - AGS Belgelendirme', url: 'hakkimizda.html', desc: 'AGS, kalite konusunda denetim ve yöneticilik görevleri yapmış tecrübeli ekibiyle hizmet vermektedir.' },
                    { title: 'Hizmetlerimiz', url: 'hizmetlerimiz.html', desc: 'ISO 9001, ISO 14001, OHSAS 18001, HACCP, ISO 27001 ve daha fazlası.' },
                    { title: 'İletişim - AGS Belgelendirme', url: 'iletisim.html', desc: 'İstanbul Maltepe şubesi iletişim bilgileri ve konum.' },
                    { title: 'İş Güvenliği', url: 'is-guvenligi.html', desc: 'İş sağlığı ve güvenliği hakkında detaylı bilgi için kalicertisg.com.' }
                ];
                
                const filtered = siteContent.filter(item => 
                    item.title.toLowerCase().includes(query.toLowerCase()) || 
                    item.desc.toLowerCase().includes(query.toLowerCase())
                );
                
                if (filtered.length > 0) {
                    let html = '<ul class="results-list">';
                    filtered.forEach(item => {
                        html += `<li><a href="${item.url}"><h4>${item.title}</h4><p>${item.desc}</p></a></li>`;
                    });
                    html += '</ul>';
                    resultsContainer.innerHTML = html;
                } else {
                    resultsContainer.innerHTML = '<p class="no-results">Arama kriterlerinize uygun sonuç bulunamadı. Lütfen farklı anahtar kelimeler deneyin.</p>';
                }
            } else {
                resultsContainer.innerHTML = '<p class="no-results">Lütfen arama yapmak için bir kelime girin.</p>';
            }
        }
    }
    
    // ============================================
    // İLETİŞİM FORMU - PHP İLE AJAX GÖNDERİMİ
    // ============================================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const submitBtn = document.getElementById('submitBtn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnSpinner = submitBtn.querySelector('.btn-spinner');
        const formMessage = document.getElementById('formMessage');
        
        // Hata mesajı elementleri
        const nameError = document.getElementById('name-error');
        const emailError = document.getElementById('email-error');
        const phoneError = document.getElementById('phone-error');
        const messageError = document.getElementById('message-error');
        
        // Input elementleri
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');
        const messageInput = document.getElementById('message');
        
        // Hata mesajlarını temizle
        function clearErrors() {
            if (nameError) nameError.textContent = '';
            if (emailError) emailError.textContent = '';
            if (phoneError) phoneError.textContent = '';
            if (messageError) messageError.textContent = '';
        }
        
        // Input kenarlıklarını normal yap
        function resetInputBorders() {
            [nameInput, emailInput, phoneInput, messageInput].forEach(input => {
                if (input) input.style.borderColor = '';
            });
        }
        
        // Form gönderimi
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // UI'ı yükleme durumuna getir
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            btnSpinner.style.display = 'inline-block';
            formMessage.style.display = 'none';
            formMessage.className = 'form-message';
            clearErrors();
            resetInputBorders();
            
            // Form verilerini topla
            const formData = new FormData(contactForm);
            
            // AJAX isteği
            fetch('contact.php', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Sunucu hatası: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                // UI'ı normale döndür
                submitBtn.disabled = false;
                btnText.style.display = 'inline-block';
                btnSpinner.style.display = 'none';
                
                if (data.success) {
                    // Başarılı
                    formMessage.className = 'form-message success';
                    formMessage.innerHTML = '<i class="fas fa-check-circle"></i> ' + data.message;
                    formMessage.style.display = 'block';
                    contactForm.reset();
                    
                    // CSRF token yenile
                    if (csrfInput) {
                        csrfInput.value = generateCSRFToken();
                    }
                } else {
                    // Hata durumu
                    formMessage.className = 'form-message error';
                    
                    if (data.errors) {
                        // Alan bazlı hataları göster
                        if (data.errors.name && nameError) {
                            nameError.textContent = data.errors.name;
                            if (nameInput) nameInput.style.borderColor = '#dc3545';
                        }
                        if (data.errors.email && emailError) {
                            emailError.textContent = data.errors.email;
                            if (emailInput) emailInput.style.borderColor = '#dc3545';
                        }
                        if (data.errors.phone && phoneError) {
                            phoneError.textContent = data.errors.phone;
                            if (phoneInput) phoneInput.style.borderColor = '#dc3545';
                        }
                        if (data.errors.message && messageError) {
                            messageError.textContent = data.errors.message;
                            if (messageInput) messageInput.style.borderColor = '#dc3545';
                        }
                        formMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> ' + data.message;
                    } else {
                        formMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> ' + data.message;
                    }
                    
                    formMessage.style.display = 'block';
                }
                
                // 8 saniye sonra mesajı gizle
                setTimeout(() => {
                    formMessage.style.display = 'none';
                }, 8000);
            })
            .catch(error => {
                console.error('Hata:', error);
                
                // UI'ı normale döndür
                submitBtn.disabled = false;
                btnText.style.display = 'inline-block';
                btnSpinner.style.display = 'none';
                
                formMessage.className = 'form-message error';
                formMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Bağlantı hatası oluştu. Lütfen daha sonra tekrar deneyin veya telefon ile ulaşın: 0216 489 56 62';
                formMessage.style.display = 'block';
                
                setTimeout(() => {
                    formMessage.style.display = 'none';
                }, 10000);
            });
        });
        
        // Input odaklanınca kenarlık rengini düzelt
        [nameInput, emailInput, phoneInput, messageInput].forEach(input => {
            if (input) {
                input.addEventListener('focus', function() {
                    this.style.borderColor = '';
                });
            }
        });
    }
    
    // ============================================
    // HEADER SCROLL EFEKTİ
    // ============================================
    let lastScroll = 0;
    const header = document.querySelector('.site-header');
    
    if (header) {
        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                header.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
            } else {
                header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
            }
            
            lastScroll = currentScroll;
        });
    }
    
    // ============================================
    // SMOOTH SCROLL
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '') {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
});