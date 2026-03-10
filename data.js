// data.js - Загрузка данных из Google Sheets (CSV)
// ============================================

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTgA5Y46KknkOfRv7Dj-1mlnABECey_WYuVZSq6mrstoYnY-WrnH1KZVKafIuZwuXiY00HOt9Uzu91X/pub?gid=11256287&single=true&output=csv';

let database = [];
let dataLoaded = false;

// Парсер одной строки CSV
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    return result.map(val => val.trim().replace(/(^"|"$)/g, ''));
}

// Парсер CSV текста
function parseCSV(text) {
    const lines = text.trim().split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length < 2) continue;
        
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = values[index] || '';
        });
        
       // Функция очистки: триммирует и убирает лишние пробелы
const clean = (val) => (val || '').toString().trim().replace(/\s+/g, ' ');

const supplier = {
    name: clean(obj.name || obj.название || obj.поставщик),
    equipment: clean(obj.equipment || obj.категория || obj.оборудование),
    contact: clean(obj.contact || obj.контакт || obj.контактное_лицо),
    email: clean(obj.email || obj.почта || obj.e_mail),
    comments: clean(obj.comments || obj.комментарии || obj.примечание)
};
        
        if (supplier.name || supplier.equipment) {
            result.push(supplier);
        }
    }
    return result;
}

// Загрузка данных из Google Sheets
async function loadDatabase() {
    try {
        console.log('📥 Загрузка данных...');
        
        // Добавляем timestamp чтобы обойти кэш
        const url = CSV_URL + '&t=' + Date.now();
        
        const response = await fetch(url, { cache: 'no-store' });
        
        if (!response.ok) {
            throw new Error('HTTP ' + response.status);
        }
        
        const csvText = await response.text();
        database = parseCSV(csvText);
        dataLoaded = true;
        
        console.log('✅ Загружено ' + database.length + ' поставщиков');
        return database;
        
    } catch (error) {
        console.error('❌ Ошибка:', error);
        database = [];
        dataLoaded = true;
        return [];
    }
}

// Иконки категорий
const categoryIcons = {
    'Техника автоматизации': 'fa-cogs',
    'Оснащение лабораторий': 'fa-flask',
    'Хим реактивы': 'fa-vial',
    'Запчасти': 'fa-wrench',
    'Оборудование': 'fa-industry',
    'Масло': 'fa-oil-can',
    'Уплотнения': 'fa-ring'
};
