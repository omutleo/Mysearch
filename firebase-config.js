// firebase-config.js - Конфигурация Firebase
// ============================================
// ВАЖНО: Замените эти данные на ваши из Firebase Console
// ============================================

const firebaseConfig = {
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "your-project-id.firebaseapp.com",
    databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:xxxxxxxxxxxxxxxxxxxxxx"
};

// Глобальные переменные Firebase
let db = null;
let suppliersRef = null;
let isFirebaseConnected = false;

// Инициализация Firebase
function initFirebase() {
    try {
        firebase.initializeApp(firebaseConfig);
        db = firebase.database();
        suppliersRef = db.ref('suppliers');
        
        // Проверка подключения
        const connectedRef = db.ref('.info/connected');
        connectedRef.on('value', (snap) => {
            isFirebaseConnected = snap.val() === true;
            if (window.updateConnectionStatus) {
                window.updateConnectionStatus();
            }
        });
        
        console.log('✅ Firebase инициализирован успешно');
        return true;
    } catch (error) {
        console.error('❌ Ошибка инициализации Firebase:', error);
        return false;
    }
}
