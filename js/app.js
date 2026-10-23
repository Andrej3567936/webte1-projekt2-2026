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

    const list = $("<ul class='list-group list-group-flush'></ul>"); //vytvori njovy element

    dayItems.forEach(function (item) {
        const row = $("<li class='list-group-item'></li>");
        row.text(item.type + ": " + item.name + " - " + item.price); //vkladame ako text, nie ako html
        list.append(row);
    });

    return list;

}

function renderCard(restaurant, items, day) {
    const col = $("<div class='col-md-6'></div>");
    const card = $("<div class='card h-100'></div>");

    const header = $("<div class='card-header'></div>");
    const link = $("<a target='blank' rel='noopener'></a>");
    link.attr("href", restaurant.url).text(restaurant.name);

    header.append($("<h2 class='h5 mb-0'></h2>").append(link));
    header.append($("<small class='text-body-secondary'></small>").text(restaurant.address));

    card.append(header, renderDay(items, day));
    col.append(card);
    return col;
}



async function test() {
    const restaurant = RESTAURANTS[0];
    const doc = await loadDocument(restaurant.localFile); //musi byt await lebo bez toho by vratil promise
    //console.log(parseEatAndMeet(doc));
    const items = restaurant.parse(doc);

    $("#menu").append(renderCard(restaurant, items, "Pondelok"));
}

test();