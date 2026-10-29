function saveMenuToLocalStorage(name, items) {
    const now = new Date();
    const entry =  {
        date: now.toLocaleDateString("sk-SK"),
        time: now.toLocaleTimeString("sk-SK"),
        items: items
    };

    localStorage.setItem("menu_" + name, JSON.stringify(entry));
}
    

function loadMenuFromLocalStorage(name) {
    const text = localStorage.getItem("menu_" + name); //vyberie z local storagu prvok s klucom menu_name a ulozi do textu, ak neexistuje tak null
    return text ? JSON .parse(text) : null; //opak stringifi, z textu spravi naspat objekt s date, tme, items
}

function isFromToday(entry) {
    return entry !== null && entry.date === new Date().toLocaleDateString("sk-SK");
}

