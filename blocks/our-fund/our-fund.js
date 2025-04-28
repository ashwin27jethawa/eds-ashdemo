import { div, label, input } from "../../scripts/dom-helpers.js"
// import data from "./our-fund.json"
export default async function decorate(block) {

    const responseData = await fetch("./our-fund.json")
    const data = responseData.json();

    Array.from(block.children).forEach((element, index) => {
        element.classList.add("inner" + (index + 1))
        Array.from(element.children).forEach((elementer, indexer) => {
            elementer.classList.add("inner" + (index + 1) + "-container" + (indexer + 1))
        })
    })

    const leftContainer = div({ class: "left-container" },
        label("Investment Method"),
        div({ class: "radio-button-container" },
            label(
                input({
                    type: "radio",
                    value: "Direct",
                    cheked: "true"
                }),"Direct"
            ),
            label(
                input({
                    type: "radio",
                    value: "Regular"
                }),"Regular"
            )
        )

    )

    block.querySelector(".inner1-container2").innerHTML = "";
    block.querySelector(".inner1-container2").append(leftContainer);
}
