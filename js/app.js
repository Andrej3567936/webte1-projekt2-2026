const RESTAURANTS = [
    {
        name: "Eat & Meet",
        url: "https://eatandmeet.sk/tyzdenne-menu",
        address: "Staré Grunty 36, Bratislava",
        localFile: "local/eatnmeet.html",
        parse: parseEatAndMeet //ukladas tu samotnu funkciu, niee jej vysledok preto bez zatvoriek
        //je to len odkaz na funkciu 
    }
]


async function loadDocument(url) {
    const response = await fetch(url); //fetch posle http pozioadavku na adresu, kym neodpovie tak caka, stranka zatial bezi nrmalne (asynchronnost) a ked odpovie tak sa ulozi do response
    //fetch vracia promise, await pocka na vysledok
    const html = await response.text(); //caka na staiahnutie tela odpovede
    
    return new DOMParser().parseFromString(html, 'text/html'); //dom parser toto html prevedie z textu na strom kde uz hladame s tym queryselector
}








function renderDay(items, day) {
    const dayItems = items.filter(function (item) {
        return item.day === day;
    });

    const list = $("<ul class='list-group list-group-flush'></ul>"); //vytvori novy element

    dayItems.forEach(function (item) {
        const row = $("<li class='list-group-item d-flex justify-content-between gap-2'></li>");

        const info = $("<div></div>"); //prazdny div element info (bude tu nazov asi)
        const isSoup = item.type.startsWith("Polievka"); //vrati true ak sa string zacina na polievka
        const badge = $("<span class='badge me-2'></span>").addClass(isSoup ? "text-bg-warning" : "text-bg-secondary").text(item.type); 
        const name = $("<span></span>").text(item.name);

        info.append(badge, name); //prida do info badge a name

        if (item.allergens) {
            info.append($("<small class='d-block text-body-secondary'></small>").text("Alergény: " + item.allergens));
        }

        const price = $("<strong class='text-nowrap'></strong>").text(item.price);

        row.append(info, price);
        list.append(row);

    
    });

    return list;

}








function renderCard(restaurant, items, day) {
    const col = $("<div class='col-md-6'></div>");
    const card = $("<div class='card h-100'></div>");

    const header = $("<div class='card-header'></div>");
    const link = $("<a target='_blank' rel='noopener'></a>");
    link.attr("href", restaurant.url).text(restaurant.name); //zretazenie linku a nazvu restiy, pridane do prazdenho prvku link

    header.append($("<h2 class='h5 mb-0'></h2>").append(link)); //vlozi prvok do vnutra na koniec
    header.append($("<small class='text-body-secondary'></small>").text(restaurant.address));

    card.append(header, renderDay(items, day));
    col.append(card);
    return col;
}



const menuData = {}; //tutok sa budu ukladat uz nacitane jedla z jednotlivych restik, kluc bude nazov restiky

function addDay(day) { //vykresli den do menu
    RESTAURANTS.forEach(function (restaurant) { //prejde vsetky restiky
        const items = menuData[restaurant.name];
        if (items) {
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
    for (const restaurant of RESTAURANTS) { //preco som nedal ze forEach? Lebo forEach nefunguje s await (by nepockalo), for of funguje
        const doc = await loadDocument(restaurant.localFile); //nacita lokalny subor do doc
        menuData[restaurant.name] = restaurant.parse(doc); //zavola parse funkciu a ulozi vysledok do menuData pod nazvom restiky
    }
    showToday(); //po nacitani vsetkych dat vykresli pondelok
}

loadAll();


$("#day-tabs button").on("click", function () { //pridanie event listenera na kliknutie na buttony
    selectDay($(this).data("day")); //zisti na ktory button si klikol a zavola selectDay s danym dnom
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