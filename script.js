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
// INIT
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
// LOGIN
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
    if (sessionStorage.getItem('isLoggedIn') === 'true' && loginScreen && appScreen) {
        window.location.href = 'index.html';
    }
}

function handleLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (username === 'admin' && password === '20hyptec26') {
        sessionStorage.setItem('isLoggedIn', 'true');
        window.location.href = 'index.html';
    } else if (loginError) {
        loginError.style.display = 'block';
        setTimeout(() => { loginError.style.display = 'none'; }, 3000);
    }
}

// ============================================
// APP
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
    
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
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
    } else if (loginErrorModal) {
        loginErrorModal.style.display = 'block';
        setTimeout(() => { loginErrorModal.style.display = 'none'; }, 3000);
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
    if (currentCategoryCount) currentCategoryCount.textContent = suppliers.length + ' поставщиков';
    
    if (dashboardView) dashboardView.classList.add('hidden');
    if (categoryView) categoryView.classList.remove('hidden');
    renderSuppliers(suppliers);
}

// ============================================
// DATA
// ============================================
function getUniqueCategories() {
    if (!database || database.length === 0) return [];
    return [...new Set(database.map(item => item.equipment).filter(c => c))].sort();
}

function getSuppliersByCategory(category) {
    if (!database) return [];
    return database.filter(item => item.equipment === category);
}

function searchSuppliers(query) {
    if (!database) return [];
    const q = query.toLowerCase();
    return database.filter(item =>
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.equipment && item.equipment.toLowerCase().includes(q)) ||
        (item.contact && item.contact.toLowerCase().includes(q)) ||
        (item.email && item.email.toLowerCase().includes(q)) ||
        (item.comments && item.comments.toLowerCase().includes(q))
    );
}

// ============================================
// RENDER
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
        card.innerHTML = '<i class="fas ' + (categoryIcons[category] || 'fa-folder') + ' category-icon"></i>' +
            '<div class="category-title">' + category + '</div>' +
            '<div class="category-count">' + suppliers.length + ' поставщиков</div>';
        card.addEventListener('click', () => showCategory(category));
        card.setAttribute('tabindex', '0');
        card.addEventListener('keypress', (e) => { if (e.key === 'Enter') showCategory(category); });
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
        item.style.animationDelay = (index * 0.05) + 's';
        
        let details = '';
        if (supplier.contact) details += '<div class="detail-item"><i class="fas fa-user detail-icon"></i><div><div class="detail-label">Контактное лицо</div><div class="detail-text">' + supplier.contact + '</div></div></div>';
        if (supplier.email) details += '<div class="detail-item"><i class="fas fa-envelope detail-icon"></i><div><div class="detail-label">Почта</div><div class="detail-text">' + supplier.email + '</div></div></div>';
        if (supplier.equipment) details += '<div class="detail-item"><i class="fas fa-cogs detail-icon"></i><div><div class="detail-label">Оборудование</div><div class="detail-text">' + supplier.equipment + '</div></div></div>';
        
        const copyBtn = supplier.email ? '<button class="copy-email-btn" data-email="' + supplier.email + '" title="Копировать email"><i class="fas fa-copy"></i> Копировать</button>' : '';
        
        item.innerHTML = '<div class="supplier-name">' + supplier.name + '</div><div class="supplier-details">' + details + '</div>' + copyBtn;
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
// COPY
// ============================================
function copyToClipboard(text, button) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => showCopyNotification(button, 'Email скопирован!')).catch(() => fallbackCopy(text, button));
    } else {
        fallbackCopy(text, button);
    }
}

function fallbackCopy(text, button) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-999999px';
    document.body.appendChild(ta);
    ta.select();
    try {
        document.execCommand('copy');
        showCopyNotification(button, 'Email скопирован!');
    } catch (e) {
        showCopyNotification(button, 'Ошибка копирования', true);
    }
    document.body.removeChild(ta);
}

function showCopyNotification(button, message, isError) {
    const n = document.createElement('div');
    n.className = 'copy-notification' + (isError ? ' error' : '');
    n.textContent = message;
    const r = button.getBoundingClientRect();
    n.style.cssText = 'position:fixed;left:' + r.left + 'px;top:' + (r.bottom + 10) + 'px;z-index:10000;';
    document.body.appendChild(n);
    setTimeout(() => n.classList.add('show'), 10);
    setTimeout(() => {
        n.classList.remove('show');
        setTimeout(() => { if (document.body.contains(n)) document.body.removeChild(n); }, 300);
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
        if (currentCategoryTitle) currentCategoryTitle.textContent = 'Результаты поиска: "' + query + '"';
        if (currentCategoryCount) currentCategoryCount.textContent = filtered.length + ' найдено';
        if (dashboardView) dashboardView.classList.add('hidden');
        if (categoryView) categoryView.classList.remove('hidden');
        renderSuppliers(filtered);
    }
}

// ============================================
// REFRESH
// ============================================
async function handleRefreshData() {
    const btn = document.getElementById('refresh-data-btn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
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
    } catch (e) {
        console.error('Ошибка:', e);
        showNotification('❌ Ошибка обновления', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-sync-alt"></i>';
        }
    }
}

// ============================================
// NOTIFICATIONS
// ============================================
function showNotification(message, type) {
    document.querySelectorAll('.app-notification').forEach(n => n.remove());
    const n = document.createElement('div');
    n.className = 'app-notification ' + (type || 'info');
    n.style.cssText = 'position:fixed;top:20px;right:20px;padding:15px 25px;border-radius:8px;color:white;font-weight:500;z-index:10000;animation:slideIn 0.3s ease;background:' + (type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8') + ';box-shadow:0 4px 12px rgba(0,0,0,0.2);';
    n.textContent = message;
    document.body.appendChild(n);
    setTimeout(() => {
        n.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => { if (document.body.contains(n)) document.body.removeChild(n); }, 300);
    }, 2500);
}

if (!document.getElementById('notification-animations')) {
    const s = document.createElement('style');
    s.id = 'notification-animations';
    s.textContent = '@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes slideOut{from{transform:translateX(0);opacity:1}to{transform:translateX(100%);opacity:0}}';
    document.head.appendChild(s);
}
