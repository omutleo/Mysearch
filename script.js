// script.js - Основной функционал приложения

// ============================================
// STATE & DOM ELEMENTS
// ============================================
let currentCategory = null;
let allSuppliers = database;

// DOM Elements
let loginScreen = null;
let loginForm = null;
let loginError = null;
let appScreen = null;
let logoutBtn = null;
let globalSearch = null;
let dashboardView = null;
let categoryView = null;
let categoriesContainer = null;
let suppliersContainer = null;
let currentCategoryTitle = null;
let currentCategoryCount = null;
let backToDashboard = null;
let totalSuppliersEl = null;
let totalCategoriesEl = null;
let loginModal = null;
let loginFormModal = null;
let loginErrorModal = null;

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Check which page we're on and initialize accordingly
    loginScreen = document.getElementById('login-screen');
    appScreen = document.getElementById('app-screen');
    loginModal = document.getElementById('login-modal');
    
    if (loginScreen) {
        // We're on login.html
        initLoginPage();
    } else if (appScreen) {
        // We're on index.html
        initAppPage();
    }
});

// ============================================
// LOGIN PAGE INITIALIZATION
// ============================================
function initLoginPage() {
    loginForm = document.getElementById('login-form');
    loginError = document.getElementById('login-error');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();
            handleLogin();
            return false;
        });
    }
    
    // Check if already logged in
    checkAuth();
}

// ============================================
// APP PAGE INITIALIZATION
// ============================================
async function initAppPage() {
    // ... (получение DOM элементов остается без изменений) ...
    logoutBtn = document.getElementById('logout-btn');
    globalSearch = document.getElementById('global-search');
    dashboardView = document.getElementById('dashboard-view');
    categoryView = document.getElementById('category-view');
    categoriesContainer = document.getElementById('categories-container');
…}


// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true' && loginScreen && appScreen) {
        window.location.href = 'index.html';
    }
}

function handleLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (username === 'admin' && password === '20hyptec26') {
        sessionStorage.setItem('isLoggedIn', 'true');
        window.location.href = 'index.html';
    } else {
        if (loginError) {
            loginError.style.display = 'block';
            setTimeout(() => {
                loginError.style.display = 'none';
            }, 3000);
        }
    }
}

function handleLoginModal() {
    const username = document.getElementById('username-modal').value.trim();
    const password = document.getElementById('password-modal').value.trim();
    
    if (username === 'admin' && password === '20hyptec26') {
        sessionStorage.setItem('isLoggedIn', 'true');
        if (loginModal) {
            loginModal.classList.add('hidden');
        }
        showApp();
    } else {
        if (loginErrorModal) {
            loginErrorModal.style.display = 'block';
            setTimeout(() => {
                loginErrorModal.style.display = 'none';
            }, 3000);
        }
    }
}

function handleLogout() {
    sessionStorage.removeItem('isLoggedIn');
    window.location.href = 'login.html';
}

function showLoginModal() {
    if (loginModal) {
        loginModal.classList.remove('hidden');
        if (appScreen) {
            appScreen.classList.add('hidden');
        }
    }
}

// ============================================
// APP DISPLAY FUNCTIONS
// ============================================
async function showApp() {
    // 1. Сначала загружаем данные из Google Таблицы
    await loadDatabase();
    
    if (loginModal) {
…    if (totalSuppliersEl) {
        totalSuppliersEl.textContent = database.length;
    }
    if (totalCategoriesEl) {
        totalCategoriesEl.textContent = categories.length;
    }

    // Render categories
    renderCategories();
}
// ============================================
// DATA FUNCTIONS
// ============================================
function getUniqueCategories() {
    const categories = [...new Set(database.map(item => item.equipment))];
    return categories.sort();
}

function getSuppliersByCategory(category) {
    return database.filter(item => item.equipment === category);
}

function searchSuppliers(query) {
    const lowerQuery = query.toLowerCase();
    return database.filter(item => 
        item.name.toLowerCase().includes(lowerQuery) ||
        item.equipment.toLowerCase().includes(lowerQuery) ||
        (item.contact && item.contact.toLowerCase().includes(lowerQuery)) ||
        (item.email && item.email.toLowerCase().includes(lowerQuery)) ||
        (item.comments && item.comments.toLowerCase().includes(lowerQuery))
    );
}

// ============================================
// RENDERING FUNCTIONS
// ============================================
function renderCategories() {
    if (!categoriesContainer) return;
    
    categoriesContainer.innerHTML = '';
    
    const categories = getUniqueCategories();
    
    categories.forEach(category => {
        const suppliers = getSuppliersByCategory(category);
        const card = document.createElement('div');
        card.className = 'category-card';
        card.innerHTML = `
            <i class="fas ${categoryIcons[category] || 'fa-folder'} category-icon"></i>
            <div class="category-title">${category}</div>
            <div class="category-count">${suppliers.length} поставщиков</div>
        `;
        card.addEventListener('click', () => showCategory(category));
        card.setAttribute('tabindex', '0');
        card.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                showCategory(category);
            }
        });
        categoriesContainer.appendChild(card);
    });
}

function renderSuppliers(suppliers) {
    if (!suppliersContainer) return;
    
    suppliersContainer.innerHTML = '';
    
    if (!suppliers || suppliers.length === 0) {
        suppliersContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>Поставщики не найдены</p>
            </div>
        `;
        return;
    }

    suppliers.forEach((supplier, index) => {
        const item = document.createElement('div');
        item.className = 'supplier-item';
        item.style.animationDelay = `${index * 0.05}s`;
        
        let detailsHTML = '';
        
        if (supplier.contact) {
            detailsHTML += `
                <div class="detail-item">
                    <i class="fas fa-user detail-icon"></i>
                    <div>
                        <div class="detail-label">Контактное лицо</div>
                        <div class="detail-text">${supplier.contact}</div>
                    </div>
                </div>
            `;
        }
        
        if (supplier.email) {
            detailsHTML += `
                <div class="detail-item">
                    <i class="fas fa-envelope detail-icon"></i>
                    <div>
                        <div class="detail-label">Почта</div>
                        <div class="detail-text">${supplier.email}</div>
                    </div>
                </div>
            `;
        }
        
        if (supplier.equipment) {
            detailsHTML += `
                <div class="detail-item">
                    <i class="fas fa-cogs detail-icon"></i>
                    <div>
                        <div class="detail-label">Оборудование</div>
                        <div class="detail-text">${supplier.equipment}</div>
                    </div>
                </div>
            `;
        }
        
        // Кнопка копирования email (если email есть)
        const copyBtn = supplier.email ? 
            `<button class="copy-email-btn" data-email="${supplier.email}" title="Копировать email">
                <i class="fas fa-copy"></i> Копировать
            </button>` : '';
        
        item.innerHTML = `
            <div class="supplier-name">${supplier.name}</div>
            <div class="supplier-details">
                ${detailsHTML}
            </div>
            ${copyBtn}
        `;
        
        suppliersContainer.appendChild(item);
    });
    
    // Добавляем обработчики событий на кнопки копирования
    document.querySelectorAll('.copy-email-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const email = this.getAttribute('data-email');
            copyToClipboard(email, this);
        });
    });
}

// ============================================
// COPY TO CLIPBOARD FUNCTION
// ============================================
function copyToClipboard(text, button) {
    // Используем Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showCopyNotification(button, 'Email скопирован!');
        }).catch(err => {
            // Fallback для старых браузеров
            fallbackCopyToClipboard(text, button);
        });
    } else {
        // Fallback для старых браузеров
        fallbackCopyToClipboard(text, button);
    }
}

function fallbackCopyToClipboard(text, button) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showCopyNotification(button, 'Email скопирован!');
    } catch (err) {
        showCopyNotification(button, 'Ошибка копирования', true);
    }
    
    document.body.removeChild(textArea);
}

function showCopyNotification(button, message, isError = false) {
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.className = 'copy-notification' + (isError ? ' error' : '');
    notification.textContent = message;
    
    // Позиционируем рядом с кнопкой
    const rect = button.getBoundingClientRect();
    notification.style.position = 'fixed';
    notification.style.left = rect.left + 'px';
    notification.style.top = (rect.bottom + 10) + 'px';
    notification.style.zIndex = '10000';
    
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Удаляем через 2 секунды
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// ============================================
// SEARCH FUNCTION
// ============================================
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    
    if (query.length === 0) {
        if (currentCategory) {
            const suppliers = getSuppliersByCategory(currentCategory);
            renderSuppliers(suppliers);
        } else {
            renderCategories();
        }
        return;
    }

    const filtered = searchSuppliers(query);
    
    if (currentCategory) {
        // Search within current category
        const categoryFiltered = filtered.filter(item => item.equipment === currentCategory);
        renderSuppliers(categoryFiltered);
    } else {
        // Global search - show results in category view
        if (currentCategoryTitle) {
            currentCategoryTitle.textContent = `Результаты поиска: "${query}"`;
        }
        if (currentCategoryCount) {
            currentCategoryCount.textContent = `${filtered.length} найдено`;
        }
        if (dashboardView) {
            dashboardView.classList.add('hidden');
        }
        if (categoryView) {
            categoryView.classList.remove('hidden');
        }
        renderSuppliers(filtered);
    }
}
