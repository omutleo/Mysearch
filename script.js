// script.js - Логика приложения
// ============================================

let currentCategory = null;
let allSuppliers = [];

// DOM Elements
let loginScreen, loginForm, loginError, appScreen, logoutBtn, globalSearch;
let dashboardView, categoryView, categoriesContainer, suppliersContainer;
let currentCategoryTitle, currentCategoryCount, backToDashboard;
let totalSuppliersEl, totalCategoriesEl, loginModal, loginFormModal, loginErrorModal;

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', async function() {
    // Ждём загрузки данных из data.js
    await loadDatabase();
    allSuppliers = database;
    
    loginScreen = document.getElementById('login-screen');
    appScreen = document.getElementById('app-screen');
    loginModal = document.getElementById('login-modal');
    
    if (loginScreen) {
        initLoginPage();
    } else if (appScreen) {
        initAppPage();
    }
});

// ============================================
// LOGIN PAGE
// ============================================
function initLoginPage() {
    loginForm = document.getElementById('login-form');
    loginError = document.getElementById('login-error');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
            return false;
        });
    }
    checkAuth();
}

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
            setTimeout(() => { loginError.style.display = 'none'; }, 3000);
        }
    }
}

// ============================================
// APP PAGE
// ============================================
function initAppPage() {
    logoutBtn = document.getElementById('logout-btn');
    globalSearch = document.getElementById('global-search');
    dashboardView = document.getElementById('dashboard-view');
    categoryView = document.getElementById('category-view');
    categoriesContainer = document.getElementById('categories-container');
    suppliersContainer = document.getElementById('suppliers-container');
    currentCategoryTitle = document.getElementById('current-category-title');
    currentCategoryCount = document.getElementById('current-category-count');
    backToDashboard = document.getElementById('back-to-dashboard');
    totalSuppliersEl = document.getElementById('total-suppliers');
    totalCategoriesEl = document.getElementById('total-categories');
    loginModal = document.getElementById('login-modal');
    loginFormModal = document.getElementById('login-form-modal');
    loginErrorModal = document.getElementById('login-error-modal');
    
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        showApp();
    } else {
        showLoginModal();
    }
    
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (backToDashboard) backToDashboard.addEventListener('click', showDashboard);
    if (globalSearch) globalSearch.addEventListener('input', handleSearch);
    
    if (loginFormModal) {
        loginFormModal.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLoginModal();
            return false;
        });
    }
    
    const refreshBtn = document.getElementById('refresh-data-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', handleRefreshData);
    }
}

function handleLoginModal() {
    const username = document.getElementById('username-modal').value.trim();
    const password = document.getElementById('password-modal').value.trim();
    
    if (username === 'admin' && password === '20hyptec26') {
        sessionStorage.setItem('isLoggedIn', 'true');
        if (loginModal) loginModal.classList.add('hidden');
        showApp();
    } else {
        if (loginErrorModal) {
            loginErrorModal.style.display = 'block';
            setTimeout(() => { loginErrorModal.style.display = 'none'; }, 3000);
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
        if (appScreen) appScreen.classList.add('hidden');
    }
}

function showApp() {
    if (loginModal) loginModal.classList.add('hidden');
    if (appScreen) appScreen.classList.remove('hidden');
    
    const categories = getUniqueCategories();
    if (totalSuppliersEl) totalSuppliersEl.textContent = allSuppliers.length;
    if (totalCategoriesEl) totalCategoriesEl.textContent = categories.length;
    renderCategories();
}

function showDashboard() {
    currentCategory = null;
    if (dashboardView) dashboardView.classList.remove('hidden');
    if (categoryView) categoryView.classList.add('hidden');
    if (globalSearch) globalSearch.value = '';
    
    const categories = getUniqueCategories();
    if (totalSuppliersEl) totalSuppliersEl.textContent = allSuppliers.length;
    if (totalCategoriesEl) totalCategoriesEl.textContent = categories.length;
    renderCategories();
}

function showCategory(categoryName) {
    currentCategory = categoryName;
    if (currentCategoryTitle) currentCategoryTitle.textContent = categoryName;
    
    const suppliers = getSuppliersByCategory(categoryName);
    if (currentCategoryCount) currentCategoryCount.textContent = `${suppliers.length} поставщиков`;
    
    if (dashboardView) dashboardView.classList.add('hidden');
    if (categoryView) categoryView.classList.remove('hidden');
    renderSuppliers(suppliers);
}

// ============================================
// DATA FUNCTIONS
// ============================================
function getUniqueCategories() {
    if (!database || database.length === 0) return [];
    const categories = [...new Set(database.map(item => item.equipment).filter(cat => cat))];
    return categories.sort();
}

function getSuppliersByCategory(category) {
    if (!database) return [];
    return database.filter(item => item.equipment === category);
}

function searchSuppliers(query) {
    if (!database) return [];
    const lowerQuery = query.toLowerCase();
    return database.filter(item =>
        (item.name && item.name.toLowerCase().includes(lowerQuery)) ||
        (item.equipment && item.equipment.toLowerCase().includes(lowerQuery)) ||
        (item.contact && item.contact.toLowerCase().includes(lowerQuery)) ||
        (item.email && item.email.toLowerCase().includes(lowerQuery)) ||
        (item.comments && item.comments.toLowerCase().includes(lowerQuery))
    );
}

// ============================================
// RENDERING
// ============================================
function renderCategories() {
    if (!categoriesContainer) return;
    categoriesContainer.innerHTML = '';
    
    const categories = getUniqueCategories();
    if (categories.length === 0) {
        categoriesContainer.innerHTML = '<div class="no-results"><p>Категории не найдены</p></div>';
        return;
    }
    
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
            if (e.key === 'Enter') showCategory(category);
        });
        categoriesContainer.appendChild(card);
    });
}

function renderSuppliers(suppliers) {
    if (!suppliersContainer) return;
    suppliersContainer.innerHTML = '';
    
    if (!suppliers || suppliers.length === 0) {
        suppliersContainer.innerHTML = '<div class="no-results"><i class="fas fa-search"></i><p>Поставщики не найдены</p></div>';
        return;
    }
    
    suppliers.forEach((supplier, index) => {
        const item = document.createElement('div');
        item.className = 'supplier-item';
        item.style.animationDelay = `${index * 0.05}s`;
        
        let detailsHTML = '';
        if (supplier.contact) {
            detailsHTML += `<div class="detail-item"><i class="fas fa-user detail-icon"></i><div><div class="detail-label">Контактное лицо</div><div class="detail-text">${supplier.contact}</div></div></div>`;
        }
        if (supplier.email) {
            detailsHTML += `<div class="detail-item"><i class="fas fa-envelope detail-icon"></i><div><div class="detail-label">Почта</div><div class="detail-text">${supplier.email}</div></div></div>`;
        }
        if (supplier.equipment) {
            detailsHTML += `<div class="detail-item"><i class="fas fa-cogs detail-icon"></i><div><div class="detail-label">Оборудование</div><div class="detail-text">${supplier.equipment}</div></div></div>`;
        }
        
        const copyBtn = supplier.email ? 
            `<button class="copy-email-btn" data-email="${supplier.email}" title="Копировать email"><i class="fas fa-copy"></i> Копировать</button>` : '';
        
        item.innerHTML = `<div class="supplier-name">${supplier.name}</div><div class="supplier-details">${detailsHTML}</div>${copyBtn}`;
        suppliersContainer.appendChild(item);
    });
    
    document.querySelectorAll('.copy-email-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            copyToClipboard(this.getAttribute('data-email'), this);
        });
    });
}

// ============================================
// COPY TO CLIPBOARD
// ============================================
function copyToClipboard(text, button) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showCopyNotification(button, 'Email скопирован!');
        }).catch(() => {
            fallbackCopyToClipboard(text, button);
        });
    } else {
        fallbackCopyToClipboard(text, button);
    }
}

function fallbackCopyToClipboard(text, button) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
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
    const notification = document.createElement('div');
    notification.className = 'copy-notification' + (isError ? ' error' : '');
    notification.textContent = message;
    const rect = button.getBoundingClientRect();
    notification.style.cssText = `position:fixed;left:${rect.left}px;top:${rect.bottom + 10}px;z-index:10000;`;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => { if (document.body.contains(notification)) document.body.removeChild(notification); }, 300);
    }, 2000);
}

// ============================================
// SEARCH
// ============================================
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    if (query.length === 0) {
        if (currentCategory) {
            renderSuppliers(getSuppliersByCategory(currentCategory));
        } else {
            renderCategories();
        }
        return;
    }
    
    const filtered = searchSuppliers(query);
    if (currentCategory) {
        renderSuppliers(filtered.filter(item => item.equipment === currentCategory));
    } else {
        if (currentCategoryTitle) currentCategoryTitle.textContent = `Результаты поиска: "${query}"`;
        if (currentCategoryCount) currentCategoryCount.textContent = `${filtered.length} найдено`;
        if (dashboardView) dashboardView.classList.add('hidden');
        if (categoryView) categoryView.classList.remove('hidden');
        renderSuppliers(filtered);
    }
}

// ============================================
// REFRESH DATA
// ============================================
async function handleRefreshData() {
    const refreshBtn = document.getElementById('refresh-data-btn');
    if (refreshBtn) {
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    }
    try {
        await loadDatabase();
        allSuppliers = database;
        if (currentCategory) {
            showCategory(currentCategory);
        } else {
            showDashboard();
        }
        showNotification('✅ Данные обновлены!', 'success');
    } catch (error) {
        console.error('Ошибка обновления:', error);
        showNotification('❌ Ошибка обновления данных', 'error');
    } finally {
        if (refreshBtn) {
            refreshBtn.disabled = false;
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
        }
    }
}

// ============================================
// NOTIFICATIONS
// ============================================
function showNotification(message, type = 'info') {
    document.querySelectorAll('.app-notification').forEach(n => n.remove());
    const notification = document.createElement('div');
    notification.className = `app-notification ${type}`;
    notification.style.cssText = `position:fixed;top:20px;right:20px;padding:15px 25px;border-radius:8px;color:white;font-weight:500;z-index:10000;animation:slideIn 0.3s ease;background:${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};box-shadow:0 4px 12px rgba(0,0,0,0.2);`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => { if (document.body.contains(notification)) document.body.removeChild(notification); }, 300);
    }, 2500);
}

if (!document.getElementById('notification-animations')) {
    const style = document.createElement('style');
    style.id = 'notification-animations';
    style.textContent = `@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes slideOut{from{transform:translateX(0);opacity:1}to{transform:translateX(100%);opacity:0}}`;
    document.head.appendChild(style);
}
