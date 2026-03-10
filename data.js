// data.js - Загрузка данных из Google Sheets (CSV)
// ============================================

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTgA5Y46KknkOfRv7Dj-1mlnABECey_WYuVZSq6mrstoYnY-WrnH1KZVKafIuZwuXiY00HOt9Uzu91X/pub?gid=11256287&single=true&output=csv';

let database = []; // Глобальный массив с данными
let dataLoaded = false; // Флаг загрузки

// Парсер CSV с поддержкой кавычек и запятых внутри полей
function parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = parseCSVLine(lines[i]);
        const obj = {};
        
        headers.forEach((header, index) => {
            obj[header] = values[index] ? values[index].trim().replace(/^"|"$/g, '') : '';
        });
        
        if (obj.name || obj.equipment) {
            result.push({
                name: obj.name || '',
                equipment: obj.equipment || '',
                contact: obj.contact || '',
                email: obj.email || '',
                comments: obj.comments || ''
            });
        }
    }
    
    return result;
}

// Парсер одной строки CSV с корректной обработкой кавычек
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
    result.push(current);
    
    return result;
}

// Основная функция загрузки данных
async function loadDatabase() {
    try {
        console.log('📥 Загрузка данных из Google Sheets...');
        const response = await fetch(CSV_URL, { 
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const csvText = await response.text();
        database = parseCSV(csvText);
        dataLoaded = true;
        
        console.log(`✅ Загружено ${database.length} поставщиков`);
        return database;
        
    } catch (error) {
        console.error('❌ Ошибка загрузки данных:', error);
        database = [];
        dataLoaded = true;
        return [];
    }
}

// Иконки категорий
const categoryIcons = {
    "Техника автоматизации": "fa-cogs",
    "Оснащение лабораторий": "fa-flask",
    "Хим реактивы": "fa-vial",
    "Запчасти": "fa-wrench",
    "Оборудование": "fa-industry",
    "Масло": "fa-oil-can",
    "Уплотнения": "fa-ring"
};
