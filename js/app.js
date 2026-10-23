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


async function test() {
    const doc = await loadDocument("../local/eatnmeet.html"); //musi byt await lebo bez toho by vratil promise
    //console.log(parseEatAndMeet(doc));

    const items = parseEatAndMeet(doc);
    $("#menu").append(renderDay(items, "Pondelok"));
}

test();