
/* JQUERY
    $
    hladame prfky": id -> $("#menu"), $("#days-tabs button")
    vytvarame prvky: $("<div></div>"), $("<h2></h2>")
    uprava textu: 
                <.append("text"), .append($("<h2></h2>").text("text")), 

    treidy a atributy: 
        .addClass("class"), .removeClass("class"), .toggleClass("class")
        .attr("href", "url"), .val("value") - zisti hodnotu value atributu
        .data("day") - zisti hodnotu data-day atributu

    udalosti:
        .on("click", function() { ... }), .on("change", function() { ... })




*/

const RESTAURANTS = [ //pole objektov restaUracie
    {
        name: "Eat & Meet",
        url: "https://eatandmeet.sk/tyzdenne-menu",
        address: "Staré Grunty 36, Bratislava",
        localFile: "../local/eatnmeet.html",
        parse: parseEatAndMeet, //ukladas tu samotnu funkciu, niee jej vysledok preto bez zatvoriek
        //je to len odkaz na funkciu 
        note: "Cena s dotáciou" // poznámka v pätičke karty
    },

    {
        name: "Slovak Pub",
        url: "https://slovakpub.sk/denne-menu/",
        address: "Obchodná 62, Bratislava",
        localFile: "../local/slovakpub.html",
        parse: parseSlovakPub
    },

    {
        name: "White Dragon",
        url: "https://whitedragon.sk/menucka/",
        address: "Staré Grunty 18, Bratislava",
        localFile: "../local/whitedragon.html",
        parse: parseWhiteDragon
    }
]


async function loadDocument(url) {
    const response = await fetch(url); //fetch posle http pozioadavku na adresu, kym neodpovie tak caka, stranka zatial bezi nrmalne (asynchronnost) a ked odpovie tak sa ulozi do response
    //fetch vracia promise, await pocka na vysledok
    const html = await response.text(); //caka na staiahnutie tela odpovede

    return new DOMParser().parseFromString(html, 'text/html'); //dom parser toto html prevedie z textu na strom kde uz hladame s tym queryselector
}

$("#restaurant-filter input").on("change", function () { // zmena zaškrtnutia
    selectDay($("#day-tabs button.active").data("day")); // prekreslí aktuálne vybraný deň
});





function renderDay(items, day) {
    const dayItems = items.filter(function (item) {
        return item.day === day;
    });

    const list = $("<ul class='list-group list-group-flush'></ul>"); //vytvori novy element
    //obe triedy su bootstrapove, list-gropu spravi pekny zoznam s okrajmi, list-group-flush odstrani okraje medzi jednotlivymi polozkami aby boli epkne na stranke

    dayItems.forEach(function (item) {
        const row = $("<li class='list-group-item d-flex justify-content-between gap-2'></li>");

        const info = $("<div></div>"); //prazdny div element info 
        const isSoup = item.type.toLowerCase().includes("polievka"); //vrati true ak ma div slovo polievka
        const badge = $("<span class='badge me-2'></span>").addClass(isSoup ? "text-bg-warning" : "text-bg-secondary").text(item.type);
        const name = $("<span></span>").text(item.name);

        info.append(badge, name); //prida do info badge a name

        if (item.allergens) {
            info.append($("<small class='d-block text-body-secondary'></small>").text("Alergény: " + item.allergens));
        }

        const price = $("<div class='text-end text-nowrap'></div>"); // pravý stĺpec: normálna cena + ISIC pod ňou
        price.append($("<strong></strong>").text(item.price));

        if (item.priceISIC && item.priceISIC !== item.price) { // len ak existuje a líši sa od normálnej
            price.append($("<small class='d-block text-info'></small>").text(item.priceISIC));
        }

        row.append(info, price);
        list.append(row);


    });

    return list;

}




function renderCard(restaurant, items, day) {
    const col = $("<div class='col-12 col-md-6 col-lg-4'></div>");
    const card = $("<div class='card h-100'></div>");

    const header = $("<div class='card-header'></div>");
    const link = $("<a target='_blank' rel='noopener'></a>");



    link.attr("href", restaurant.url).text(restaurant.name); //zretazenie linku a nazvu restiy, pridane do prazdenho prvku link

    header.append($("<h2 class='h5 mb-0'></h2>").append(link)); //vlozi prvok do vnutra na koniec
    header.append($("<small class='text-body-secondary'></small>").text(restaurant.address));

    

    card.append(header, renderDay(items, day));

    

    if (restaurant.note) { // poznámka sa zobrazí len reštauráciám, ktoré ju majú
        card.append($("<div class='card-footer small text-info'></div>").text(restaurant.note));
    }
    
    const saved = loadMenuFromLocalStorage(restaurant.name); //nacita z local storagu menu pre dany nazov restiky
    if (saved) {
        card.append($("<div class='card-footer small text-body-secondary'></div>").text("Posledná aktualizácia: " + saved.date + " " + saved.time));
    }


    col.append(card);
    return col;
}



function selectedNames() { // vráti pole názvov zaškrtnutých reštaurácií
    return $("#restaurant-filter input:checked").map(function () {
        return this.value;
    }).get();
}

const menuData = {}; //tutok sa budu ukladat uz nacitane jedla z jednotlivych restik, kluc bude nazov restiky

function addDay(day) { //vykresli den do menu
    RESTAURANTS.forEach(function (restaurant) { //prejde vsetky restiky
        const items = menuData[restaurant.name];
        if (items && selectedNames().includes(restaurant.name)) { // vykreslí len zaškrtnuté
            $("#menu").append(renderCard(restaurant, items, day)); //prida do menu vykresleny card
        }
    });
}

function showDay(day) { //vykreslenie jdneho dna
    $("#menu").empty(); //vycisti obsah menu
    addDay(day);
}


//CELY MF TYZDEN BUG Boy

function showWeek() {
    $("#menu").empty(); //vycisti obsah menu

    DAYS.forEach(function (day) { //prejde vsetky dni
        $("#menu").append($("<h2 class='h4 col-12 mt-4'></h2>").text(day)); //prida do menu nadpis s dnom
        addDay(day); //prida do menu jedla pre dany den
    });
}

function selectDay(day) {
    $("#day-tabs button").removeClass("active");
    $("#day-tabs button[data-day='" + day + "']").addClass("active"); //prida active class na button na ktory si klikol



    if (day === "week") {
        showWeek(); //vykresli cely tyzden
    } else {
        showDay(DAYS[day - 1]); //vykresli den na ktory si klikol
    }
}


async function loadAll() {
    /* pre kazdu restauraciu:
        1. nacita z local storagu menu pre dany nazov restiky
        2. ak je z dnesneho dna tak ulozi do menuData
        3. ak nie je z dnesneho dna alebo nieje v local storage tak zavola parse funkciu a ulozi vysledok do menuData pod nazvom restiky
        4. ulozi do local storagu
        5. po nacitani vsetkych dat vykresli aktualny den
*/

    $("#loading").removeClass("d-none"); //zobrazi loading spinner

    for (const restaurant of RESTAURANTS) { //preco som nedal ze forEach? Lebo forEach nefunguje s await (by nepockalo), for of funguje
        const saved = loadMenuFromLocalStorage(restaurant.name); //nacita z local storagu menu pre dany nazov restiky

        if (isFromToday(saved)) {
            menuData[restaurant.name] = saved.items; //ak je z dnesneho dna tak ulozi do menuData
        } else {
            const doc = await loadDocument(restaurant.localFile);
            menuData[restaurant.name] = restaurant.parse(doc); //zavola parse funkciu a ulozi vysledok do menuData pod nazvom restiky
            saveMenuToLocalStorage(restaurant.name, menuData[restaurant.name]); //ulozi do local storagu
        }


    }

    $("#loading").addClass("d-none"); //skryje loading spinner

    showToday(); //po nacitani vsetkych dat vykresli pondelok
}

loadAll();



//CHECKBOXESSS
RESTAURANTS.forEach(function (restaurant) { // pre každú reštauráciu jedno políčko
    const label = $("<label class='d-flex align-items-center gap-2'></label>");
    const checkbox = $("<input type='checkbox' class='form-check-input m-0' checked>").val(restaurant.name);

    label.append(checkbox, $("<span></span>").text(restaurant.name));
    $("#restaurant-filter").append(label);
});

$("#restaurant-filter input").on("change", function () { // zmena zaškrtnutia
    selectDay($("#day-tabs button.active").data("day")); // prekreslí aktuálne vybraný deň
});





$("#day-tabs button").on("click", function () { //pridanie event listenera na kliknutie na buttony
    selectDay($(this).data("day")); //zisti na ktory button si klikol a zavola selectDay s danym dnom
});

$("#btn-update").on("click", function () { // nové stiahnutie všetkých menu
    localStorage.clear(); // zmaže uložené dáta, takže loadAll() bude sťahovať nanovo
    loadAll();
});

$("#btn-clear").on("click", function () { // vymazanie uložených dát
    localStorage.clear(); // zmaže uložené dáta z prehliadača
    RESTAURANTS.forEach(function (restaurant) {
        delete menuData[restaurant.name]; // zmaže menu aj z pamäte
    });
    $("#menu").empty(); // vyčistí stránku
});



function showToday() {
    const dayNumber = new Date().getDay(); //vrati cislo dna v tyzdni (0-6) 0 je nedela, 1 je pondelok, 2 utorok, 3 streda, 4 stvrtok, 5 piatok, 6 sobota
    if (dayNumber === 0 || dayNumber === 6) { //ak je sobota alebo nedela

        $("#weekend-msg").removeClass("d-none");
        selectDay(1); //vykresli pondelok
    } else {

        $("#weekend-msg").addClass("d-none");
        selectDay(dayNumber); //vykresli dany den
    }
}