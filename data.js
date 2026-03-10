// data.js - Конфигурация источника данных
// ============================================

// ⚠️ ВСТАВЬТЕ СЮДА ВАШУ ССЫЛКУ ИЗ ШАГА 1
const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/ВАШ_ID_ТАБЛИЦЫ/pub?output=csv';

// Кэш данных
let database = [];
let isDataLoaded = false;

// Функция загрузки данных
async function loadDatabase() {
    if (isDataLoaded) return database;
    
    try {
        const response = await fetch(GOOGLE_SHEET_CSV_URL);
        if (!response.ok) throw new Error('Ошибка сети');
        
        const csvText = await response.text();
        database = parseCSV(csvText);
        isDataLoaded = true;
        
        console.log('✅ База загружена:', database.length, 'поставщиков');
        return database;
    } catch (error) {
        console.error('❌ Ошибка загрузки базы:', error);
        // Fallback на пустой массив или старые данные при ошибке
        database = [];
        return database;
    }
}

// Парсинг CSV (учитывает кавычки и запятые внутри ячеек)
function parseCSV(text) {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = parseCSVLine(lines[0]).map(h => h.trim());
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length < headers.length) continue;
        
        const item = {};
        headers.forEach((header, index) => {
            item[header] = values[index] ? values[index].trim() : '';
        });
        
        // Пропускаем пустые строки
        if (item.name) {
            result.push(item);
        }
    }
    
    return result;
}

// Умный парсер строки CSV
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

// Иконки категорий (остались без изменений)
const categoryIcons = {
    "Техника автоматизации": "fa-cogs",
    "Оснащение лабораторий": "fa-flask",
    "Хим реактивы": "fa-vial",
    "Запчасти": "fa-wrench",
    "Оборудование": "fa-industry",
    "Масло": "fa-oil-can",
    "Уплотнения": "fa-ring"
};
