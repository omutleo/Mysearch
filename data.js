// data.js - База данных поставщиков
// ============================================

const database = [
    {
        name: "Да, поставим",
        equipment: "Техника автоматизации",
        contact: "Мария ИВЬЕВА",
        email: "sale9@da-postavim.ru",
        comments: "Endress+Hauser, PARKER, Phoenix contact, Rockwell, Siemens, ABB, Schneider Electric, Allen-Bradley, Omron, Tetra Pak, Alfa Laval, Wago, Fanuc, Sick, Pepper+Fuchs, Norgen, IFM, Balluff, FESTO, Rittal, SEW-Eurodrive, Danfoss, B&R, Emerson, PILZ"
    },
    {
        name: "Вент Эл",
        equipment: "Техника автоматизации",
        contact: "Александр Васьков",
        email: "415@vent-el.ru",
        comments: "ФМР, ФРНК, ППУ, ФПП, Кондиционеры, сплит-системы - Haier, Lessar, Quattroclima, Tosot, Fujitsu, BALLU, Electrolux"
    },
    {
        name: "ООО Глобал автоматикс",
        equipment: "Техника автоматизации",
        contact: "Евгения Коваленко",
        email: "e.kovalenko@simatix.ru",
        comments: "Siemens, Phoenix contact, SICK, Schneider Electric, АВВ, Pepperl+fuchs, Rittal, WAGO, Beckhoff, SEW Eurodrive"
    },
    {
        name: "Корвет Нева",
        equipment: "Оснащение лабораторий",
        contact: "Никита Игоревич Зезуль",
        email: "nikita.korvet-neva@mail.ru",
        comments: "оснащением лабораторий различного профиля"
    },
    {
        name: "Миллаб",
        equipment: "Оснащение лабораторий",
        contact: "Максим Стрелков",
        email: "mas@millab.ru",
        comments: "Наша компания является авторизированным дистрибьютором лабораторного, аналитического и промышленного оборудования"
    },
    {
        name: "Химмед",
        equipment: "Хим реактивы",
        contact: "Кондратьев Алексей",
        email: "chimmed@mail.ru",
        comments: "Хим реактивы, Смесь Pesticide Mix of 12 comp."
    },
    {
        name: "Реарус",
        equipment: "Хим реактивы",
        contact: "Менеджер продаж",
        email: "info@rearus.ru",
        comments: "Химические реактивы и растворители как отечественных, так и иностранных производителей"
    },
    {
        name: "О-рингс",
        equipment: "Уплотнения",
        contact: "Максим Кравченко",
        email: "sales@o-ring.su",
        comments: "Уплотнение, кольцо, EPDM, o-ring"
    },
    {
        name: "Амертенд",
        equipment: "Масло",
        contact: "Менеджер продаж",
        email: "info@amertend.ru",
        comments: "Масло Klüberoil, масла"
    },
    {
        name: "Deomera",
        equipment: "Оборудование",
        contact: "Дмитрий Михайлов",
        email: "info@deomera.ru",
        comments: "тестер сопротивления, мультиметр, манометр, измерительные приборы"
    }
];

const categoryIcons = {
    "Техника автоматизации": "fa-cogs",
    "Оснащение лабораторий": "fa-flask",
    "Хим реактивы": "fa-vial",
    "Запчасти": "fa-wrench",
    "Оборудование": "fa-industry",
    "Масло": "fa-oil-can",
    "Уплотнения": "fa-ring"
};

// Флаг загрузки (для совместимости)
let dataLoaded = true;

// Функция-заглушка для совместимости с script.js
async function loadDatabase() {
    console.log(`✅ Загружено ${database.length} поставщиков из локальной базы`);
    return database;
}
