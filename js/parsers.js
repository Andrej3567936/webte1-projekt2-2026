
const DAYS = ["Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok"];

function parseEatAndMeet(doc) { //ideme tahat zo stranky eat n meet odaje o jedlach po dnoch
    const items = [];

    for (let dayNumber = 1; dayNumber <= 5; dayNumber++) {
        const dayBlock = doc.querySelector("#day-" + dayNumber); //dayelement premenna tu si z docu ulozim cely jeden div pre den
        if (!dayBlock) continue; //chyba den na stranke 

        const cards = dayBlock.querySelectorAll(".menu-details");

        cards.forEach(function (card) {
            const type = card.querySelector("h4").textContent.trim(); //trim oreze slovo (textContent) od znaciek
            
            const priceElement = card.querySelector(".price");
            const prices = priceElement.textContent.split("/");
            const priceNormal = prices[0].trim();
            const priceISIC = prices[1].trim();

            const desc = card.querySelector(".desc");
            const name = desc.firstChild.textContent.trim();
            const allergensSpan = desc.querySelector("span");
            const allergens = allergensSpan ? allergensSpan.textContent.replace(/[()]/g, "") : "";

            
            console.log(DAYS[dayNumber - 1], type, name, priceNormal, priceISIC, allergens); //testoval som na tomto v konzoole
            
            items.push({ //push priuda na koneic pola prvok
                restaurant: "Eat & Meet",
                day: DAYS[dayNumber - 1],
                type: type,
                name: name,
                price: priceNormal,
                priceISIC: priceISIC,
                allergens: allergens
            });

        });

    }
    return items;
}