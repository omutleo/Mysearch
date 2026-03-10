// STATE & DOM ELEMENTS
// ============================================
let currentCategory = null;
let allSuppliers = [];
let isLoading = false;

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
let addSupplierBtn = null;
let addSupplierModal = null;
let addSupplierForm = null;
let modalClose = null;
let modalCancel = null;
let refreshBtn = null;
let notification = null;
let loadingIndicator = null;
let saveSupplierBtn = null;

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
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
// GOOGLE SHEETS API FUNCTIONS
// ============================================
async function fetchFromGoogleSheets() {
    if (isLoading) return;
    
    isLoading = true;
    showLoading(true);
    
    try {
        if (!CONFIG.GOOGLE_SHEET_CSV || CONFIG.GOOGLE_SHEET_CSV.includes('ВСТАВЬТЕ')) {
            throw new Error('Не настроена ссылка на Google Таблицу в config.js');
        }
        
        const response = await fetch(CONFIG.GOOGLE_SHEET_CSV);
        
        if (!response.ok) {
            throw new Error('Ошибка доступа к Google Таблице');
        }
        
        const csvText = await response.text();
        const suppliers = parseCSV(csvText);
        
        allSuppliers = suppliers.filter(s => s.name && s.name.trim() !== '');
        
        showLoading(false);
        return true;
        
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        showLoading(false);
        showNotification('Ошибка загрузки данных: ' + error.message, 'error');
        return false;
    }
}

async function saveToGoogleSheets(supplierData) {
    try {
        if (!CONFIG.GOOGLE_APPS_SCRIPT_URL || CONFIG.GOOGLE_APPS_SCRIPT_URL.includes('ВСТАВЬТЕ')) {
            throw new Error('Не настроен URL Google Apps Script в config.js');
        }
        
        const response = await fetch(CONFIG.GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...supplierData,
                password: CONFIG.API_PASSWORD
            })
        });
        
        return true;
        
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        throw error;
    }
}

function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        
        if (values.length >= headers.length) {
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = values[index] ? values[index].trim().replace(/"/g, '') : '';
            });
            result.push(obj);
        }
    }
    
    return result;
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current);
    return result;
}

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
    
    checkAuth();
}

// ============================================
// APP PAGE INITIALIZATION
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
    addSupplierBtn = document.getElementById('add-supplier-btn');
    addSupplierModal = document.getElementById('add-supplier-modal');
    addSupplierForm = document.getElementById('add-supplier-form');
    modalClose = document.getElementById('modal-close');
    modalCancel = document.getElementById('modal-cancel');
    refreshBtn = document.getElementById('refresh-btn');
    notification = document.getElementById('notification');
    loadingIndicator = document.getElementById('loading-indicator');
    saveSupplierBtn = document.getElementById('save-supplier-btn');
    
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    
    if (isLoggedIn === 'true') {
        showApp();
    } else {
        showLoginModal();
    }
    
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (backToDashboard) backToDashboard.addEventListener('click', showDashboard);
    if (globalSearch) globalSearch.addEventListener('input', handleSearch);
    if (addSupplierBtn) addSupplierBtn.addEventListener('click', openAddSupplierModal);
    if (modalClose) modalClose.addEventListener('click', closeAddSupplierModal);
    if (modalCancel) modalCancel.addEventListener('click', closeAddSupplierModal);
    if (refreshBtn) refreshBtn.addEventListener('click', () => {
        fetchFromGoogleSheets().then(() => {
            showDashboard();
            showNotification('Данные обновлены!', 'success');
        });
    });
    
    if (addSupplierForm) {
        addSupplierForm.addEventListener('submit', handleAddSupplier);
    }
    
    if (addSupplierModal) {
        addSupplierModal.addEventListener('click', function(e) {
            if (e.target === addSupplierModal) {
                closeAddSupplierModal();
            }
        });
    }
}

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
    
    if (username === 'admin' && password === CONFIG.LOGIN_PASSWORD) {
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
    if (loginModal) {
        loginModal.classList.add('hidden');
    }
    if (appScreen) {
        appScreen.classList.remove('hidden');
    }
    
    const success = await fetchFromGoogleSheets();
    
    if (success) {
        const categories = getUniqueCategories();
        
        if (totalSuppliersEl) {
            totalSuppliersEl.textContent = allSuppliers.length;
        }
        if (totalCategoriesEl) {
            totalCategoriesEl.textContent = categories.length;
        }
        
        renderCategories();
    }
}

function showDashboard() {
    currentCategory = null;
    if (dashboardView) {
        dashboardView.classList.remove('hidden');
    }
    if (categoryView) {
        categoryView.classList.add('hidden');
    }
    if (globalSearch) {
        globalSearch.value = '';
    }
    
    const categories = getUniqueCategories();
    if (totalSuppliersEl) {
        totalSuppliersEl.textContent = allSuppliers.length;
    }
    if (totalCategoriesEl) {
        totalCategoriesEl.textContent = categories.length;
    }
    
    renderCategories();
}

function showCategory(categoryName) {
    currentCategory = categoryName;
    if (currentCategoryTitle) {
        currentCategoryTitle.textContent = categoryName;
    }
    const suppliers = getSuppliersByCategory(categoryName);
    if (currentCategoryCount) {
        currentCategoryCount.textContent = `${suppliers.length} поставщиков`;
    }
    
    if (dashboardView) {
        dashboardView.classList.add('hidden');
    }
    if (categoryView) {
        categoryView.classList.remove('hidden');
    }
    
    renderSuppliers(suppliers);
}

// ============================================
// ADD SUPPLIER MODAL FUNCTIONS
// ============================================
function openAddSupplierModal() {
    if (addSupplierModal) {
        addSupplierModal.classList.remove('hidden');
    }
    if (addSupplierForm) {
        addSupplierForm.reset();
    }
}

function closeAddSupplierModal() {
    if (addSupplierModal) {
        addSupplierModal.classList.add('hidden');
    }
    if (addSupplierForm) {
        addSupplierForm.reset();
    }
}

async function handleAddSupplier(e) {
    e.preventDefault();
    
    const name = document.getElementById('supplier-name').value.trim();
    const equipment = document.getElementById('supplier-equipment').value;
    const contact = document.getElementById('supplier-contact').value.trim();
    const email = document.getElementById('supplier-email').value.trim();
    const comments = document.getElementById('supplier-comments').value.trim();
    
    if (!name || !equipment) {
        showNotification('Заполните обязательные поля!', 'error');
        return;
    }
    
    if (saveSupplierBtn) {
        saveSupplierBtn.disabled = true;
        saveSupplierBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Сохранение...';
    }
    
    try {
        const newSupplier = {
            name: name,
            equipment: equipment,
            contact: contact,
            email: email,
            comments: comments
        };
        
        const success = await saveToGoogleSheets(newSupplier);
        
        if (success) {
            showNotification('Поставщик успешно добавлен! Обновите данные для отображения.', 'success');
            closeAddSupplierModal();
            
            allSuppliers.push(newSupplier);
            
            if (currentCategory) {
                showCategory(currentCategory);
            } else {
                showDashboard();
            }
        } else {
            throw new Error('Ошибка сохранения');
        }
        
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('Ошибка сохранения: ' + error.message, 'error');
    } finally {
        if (saveSupplierBtn) {
            saveSupplierBtn.disabled = false;
            saveSupplierBtn.innerHTML = '<i class="fas fa-save"></i> Сохранить';
        }
    }
}

// ============================================
// DATA FUNCTIONS
// ============================================
function getUniqueCategories() {
    const categories = [...new Set(allSuppliers.map(item => item.equipment))];
    return categories.filter(c => c && c.trim() !== '').sort();
}

function getSuppliersByCategory(category) {
    return allSuppliers.filter(item => item.equipment === category);
}

function searchSuppliers(query) {
    const lowerQuery = query.toLowerCase();
    return allSuppliers.filter(item =>
        (item.name && item.name.toLowerCase().includes(lowerQuery)) ||
        (item.equipment && item.equipment.toLowerCase().includes(lowerQuery)) ||
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
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showCopyNotification(button, 'Email скопирован!');
        }).catch(err => {
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
    const notification = document.createElement('div');
    notification.className = 'copy-notification' + (isError ? ' error' : '');
    notification.textContent = message;
    
    const rect = button.getBoundingClientRect();
    notification.style.position = 'fixed';
    notification.style.left = rect.left + 'px';
    notification.style.top = (rect.bottom + 10) + 'px';
    notification.style.zIndex = '10000';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function showNotification(message, type = 'success') {
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = 'notification ' + type;
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

function showLoading(show) {
    if (loadingIndicator) {
        if (show) {
            loadingIndicator.classList.remove('hidden');
        } else {
            loadingIndicator.classList.add('hidden');
        }
    }
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
        const categoryFiltered = filtered.filter(item => item.equipment === currentCategory);
        renderSuppliers(categoryFiltered);
    } else {
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
