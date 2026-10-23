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



async function test() {
    const restaurant = RESTAURANTS[0];
    const doc = await loadDocument(restaurant.localFile); //musi byt await lebo bez toho by vratil promise
    //console.log(parseEatAndMeet(doc));
    const items = restaurant.parse(doc); //pole objektov jedal, ktore sa naparsovali

    $("#menu").append(renderCard(restaurant, items, "Pondelok"));
}

test();