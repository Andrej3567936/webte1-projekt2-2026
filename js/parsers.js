
const DAYS = ["Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok"];

function capitalize(text) { // "SLADKÉ" -> "Sladké": prvé písmeno veľké, zvyšok malé
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function parseEatAndMeet(doc) { //ideme tahat zo stranky eat n meet odaje o jedlach po dnoch
    const items = [];

    for (let dayNumber = 1; dayNumber <= 5; dayNumber++) {
        const dayBlock = doc.querySelector("#day-" + dayNumber); //dayelement premenna tu si z docu ulozim cely jeden div pre den
        if (!dayBlock) continue; //chyba den na stranke 

        const cards = dayBlock.querySelectorAll(".menu-details");

        cards.forEach(function (card) {
            const type = capitalize(card.querySelector("h4").textContent.trim()); //trim oreze slovo (textContent) od znaciek
            
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


//parser je tu podobny ale v eatnmeet mali dni pekne oznacene aké day1 day2 atd ale tito tu spekulanti ich oznacene neamju takze
//hadzem vsetky dni do pola a potom ich budem tahat podla indexu ako kral
function parseSlovakPub(doc) {
    const items = [];
    const dayBlocks = doc.querySelectorAll(".weekly-menu-slider-item");

    for (let dayNumber = 1; dayNumber <= 5; dayNumber++) {
        const dayBlock = dayBlocks[dayNumber - 1];
        if (!dayBlock) continue; // deň chýba

        const cards = dayBlock.querySelectorAll(".weekly-menu-item");

        cards.forEach(function (card) {
            const titleElement = card.querySelector(".weekly-menu-content-title");
            const type = titleElement.querySelector("strong") //najde polievku v strongu
                            .textContent // taha text
                            .replace(":", "") // dstrani dvojbodku
                            .replace(/\s+/g, " ") //zluci zalomenia a viacnásobné medzery na jednu medzeru
                            .trim() //zahadzuje medzeri na okrajoch
                            .replace("Denná polievka", "Polievka"); // jednotný názov typu   
            const name = titleElement.lastChild.textContent.split("(")[0].trim(); //nedavam anglicky preklad odstranujem 


            const parts = card.querySelector(".weekly-menu-content-description").textContent.trim().split(", ");
            const weight = parts[0];
            const allergens = parts[1] || "";

            const priceElement = card.querySelector(".weekly-menu-price");
            const price = priceElement ? priceElement.textContent.trim() : "";

            items.push({
                restaurant: "Slovak Pub",
                day: DAYS[dayNumber - 1],
                type: type,
                name: name,
                price: price,
                priceISIC: "",
                weight: weight,
                allergens: allergens
            });
        });
    }

    return items;
}

function splitAllergens(line) { // z riadku "Názov jedla 1,3,9" urobí { name: "Názov jedla", allergens: "1,3,9" }
    const match = line.match(/^(.*?)\s*([\d,]+)$/); 
    return match ? { name: match[1], allergens: match[2] } : { name: line, allergens: "" };
}

function parseWhiteDragon(doc) {
    const items = [];
    const content = doc.querySelector(".post_content");
    if (!content) return items; // stránka zmenila štruktúru

    const priceMenu = content.textContent.match(/Cena menu\s*\D*?([\d,]+)\s*eur/);
    const priceSpecial = content.textContent.match(/špeciál\s*\D*?([\d,]+)\s*eur/);
    const menuPrice = priceMenu ? priceMenu[1] + " €" : "";
    const specialPrice = priceSpecial ? priceSpecial[1] + " €" : "";

    let currentDay = "";

    content.querySelectorAll("p").forEach(function (paragraph) {
        const lines = [];
        paragraph.childNodes.forEach(function (node) {
            if (node.nodeType === 3 && node.textContent.trim() !== "") {
                lines.push(node.textContent.trim());
            }
        });
        if (lines.length === 0) return; // prázdny odsek preskočíme

        // odsek s dňom: prvý riadok je názov dňa, ďalšie riadky sú jedlá
        if (DAYS.includes(lines[0])) {
            currentDay = lines[0];

            lines.slice(1).forEach(function (line, index) {
                const parsed = splitAllergens(line);
                items.push({
                    restaurant: "White Dragon",
                    day: currentDay,
                    type: index < 2 ? "Polievka " + (index + 1) : "Menu " + (index - 1), // prvé dva riadky sú Polievka 1, 2; ďalšie Menu 1, 2, ...
                    name: parsed.name,
                    price: menuPrice,
                    priceISIC: "",
                    weight: "",
                    allergens: parsed.allergens
                });
            });
        }
        // odsek so špeciálom patrí k poslednému dňu
        else if (lines[0].startsWith("Špeciál:") && currentDay) {
            const parsed = splitAllergens(lines[0].replace("Špeciál:", "").trim());
            items.push({
                restaurant: "White Dragon",
                day: currentDay,
                type: "Špeciál",
                name: parsed.name,
                price: specialPrice,
                priceISIC: "",
                weight: "",
                allergens: parsed.allergens
            });
        }
    });

    return items;
}