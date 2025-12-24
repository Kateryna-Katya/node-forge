/**
 * PROJECT: node-forge.blog
 * VERSION: 1.0.0
 * DESCRIPTION: Главный скрипт для управления интерактивностью, 
 * валидацией и анимациями.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. ИНИЦИАЛИЗАЦИЯ ИКОНОК (LUCIDE) ---
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // --- 2. ПЛАВНЫЙ СКРОЛЛ (LENIS) ---
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // --- 3. МОБИЛЬНОЕ МЕНЮ ---
    const burger = document.querySelector('.header__burger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const menuLinks = document.querySelectorAll('.mobile-menu__link, .header__cta');

    const toggleMenu = () => {
        mobileMenu.classList.toggle('active');
        burger.classList.toggle('active'); // Класс для анимации самого бургер-значка
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    };

    burger.addEventListener('click', toggleMenu);

    // Закрываем меню при клике на ссылки
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenu.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    // --- 4. ЭФФЕКТЫ ПРИ СКРОЛЛЕ (HEADER) ---
    const headerNav = document.querySelector('.header__nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            headerNav.style.padding = '8px 24px';
            headerNav.style.background = 'rgba(30, 34, 41, 0.95)';
            headerNav.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
        } else {
            headerNav.style.padding = '12px 32px';
            headerNav.style.background = 'rgba(30, 34, 41, 0.8)';
            headerNav.style.boxShadow = 'none';
        }
    });

    // --- 5. АНИМАЦИИ (GSAP + INTERSECTION OBSERVER) ---
    
    // Анимация Hero секции при загрузке
    gsap.from(".hero__title", {
        opacity: 0,
        y: 60,
        duration: 1.2,
        ease: "power4.out",
        delay: 0.3
    });

    gsap.from(".hero__subtitle", {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: "power3.out",
        delay: 0.6
    });

    gsap.from(".hero__btns", {
        opacity: 0,
        y: 20,
        duration: 1,
        ease: "power3.out",
        delay: 0.8
    });

    // Параллакс эффект для карточек преимуществ (на чистом JS для легкости)
    const benefitCards = document.querySelectorAll('.benefit-card');
    const observerOptions = { threshold: 0.1 };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    benefitCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(40px)';
        card.style.transition = 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)';
        observer.observe(card);
    });

    // --- 6. ВАЛИДАЦИЯ ФОРМЫ И КАПЧА ---
    const contactForm = document.getElementById('contactForm');
    const phoneInput = document.getElementById('phone');
    const captchaQuestion = document.getElementById('captcha-question');
    const captchaInput = document.getElementById('captcha-answer');
    const formResponse = document.getElementById('formResponse');

    let n1, n2;

    // Функция генерации капчи
    const generateCaptcha = () => {
        n1 = Math.floor(Math.random() * 10) + 1;
        n2 = Math.floor(Math.random() * 10) + 1;
        if (captchaQuestion) {
            captchaQuestion.innerText = `Подтвердите, что вы не бот: ${n1} + ${n2} =`;
        }
    };

    generateCaptcha();

    // СТРОГАЯ ВАЛИДАЦИЯ ТЕЛЕФОНА (Запрет на ввод букв)
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            // Заменяем всё, что не цифра, на пустую строку
            const cleanValue = this.value.replace(/[^\d+]/g, '');
            if (this.value !== cleanValue) {
                this.value = cleanValue;
            }
        });
    }

    // Обработка отправки формы
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const userAnswer = parseInt(captchaInput.value);
            const phoneValue = phoneInput.value.replace(/\D/g, ''); // Чисто цифры для проверки длины

            // 1. Проверка капчи
            if (userAnswer !== (n1 + n2)) {
                alert('Ошибка: Неверный ответ на математический пример.');
                generateCaptcha();
                captchaInput.value = '';
                return;
            }

            // 2. Проверка длины телефона
            if (phoneValue.length < 9) {
                alert('Пожалуйста, введите корректный номер телефона (минимум 9 цифр).');
                return;
            }

            // Имитация AJAX отправки
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerText = 'Отправка...';

            setTimeout(() => {
                formResponse.innerText = "Успешно! Мы получили ваш запрос и свяжемся с вами в течение 24 часов.";
                formResponse.className = "form-message success";
                formResponse.style.display = "block";
                
                contactForm.reset();
                submitBtn.disabled = false;
                submitBtn.innerText = 'Запросить доступ';
                generateCaptcha();

                // Скрываем сообщение через 5 секунд
                setTimeout(() => {
                    formResponse.style.display = "none";
                }, 5000);
            }, 1500);
        });
    }

    // --- 7. COOKIE POPUP ---
    const cookiePopup = document.getElementById('cookiePopup');
    const acceptBtn = document.getElementById('acceptCookies');

    if (cookiePopup && !localStorage.getItem('nodeForge_cookies')) {
        setTimeout(() => {
            cookiePopup.style.display = 'block';
            gsap.from(cookiePopup, {
                y: 50,
                opacity: 0,
                duration: 0.6,
                ease: "power2.out"
            });
        }, 2000);
    }

    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('nodeForge_cookies', 'true');
            gsap.to(cookiePopup, {
                y: 50,
                opacity: 0,
                duration: 0.4,
                onComplete: () => cookiePopup.style.display = 'none'
            });
        });
    }
});

// Дополнительный эффект: Параллакс для фонового блоба в Hero
window.addEventListener('mousemove', (e) => {
    const blob = document.querySelector('.hero__blob');
    if (blob) {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        gsap.to(blob, {
            x: mouseX * 40,
            y: mouseY * 40,
            duration: 2,
            ease: "power2.out"
        });
    }
});