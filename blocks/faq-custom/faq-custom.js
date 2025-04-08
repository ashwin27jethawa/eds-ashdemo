import { div, ul, li, span } from "../../scripts/dom-helpers.js"

export default function decorate(block) {
    apiCall(block);
}

async function apiCall(params) {
    const apiCall = await fetch('http://localhost:3000/faqsheet.json');
    const response = await apiCall.json();
    if (response.data != undefined) {
        const Data = response.data;
        console.log(Data);
        decorationBlock(params, Data);
    }
}

function decorationBlock(params, data) {
    params.innerHTML = "";
    const TabsArray = ["All"];
    data.forEach(element => {
        if (!TabsArray.includes(element.category)) {
            TabsArray.push(element.category)
        }
    });
    console.log(TabsArray);
    params.append(
        div({ class: "tabs-container" },
            ul({ class: "faq-filter tabs-container" },
                ...TabsArray.map((tab) => {
                    const mopClass = tab == "All" ? "active" : ""
                    return li({
                        class: "tab-list-data" + " " + mopClass,
                        onclick: (item) => {
                            document.querySelector(".accordion").innerHTML = "";
                            document.querySelector(".active").classList.remove("active");
                            item.currentTarget.classList.add("active");
                            data.map((element) => {
                                if (item.currentTarget.textContent == element.category) {
                                    return document.querySelector(".accordion").append(
                                        div({ class: "details accordion-item" },
                                            div({
                                                class: "summary accordion-item-label",
                                                onclick: function () {
                                                    if (this.nextElementSibling.style.display == "" || this.nextElementSibling.style.display == "none") {
                                                        this.nextElementSibling.style.display = "block";
                                                        this.nextElementSibling.style.height = "auto";
                                                        this.nextElementSibling.style.opacity = 1;
                                                    } else {
                                                        this.nextElementSibling.style.display = "none";
                                                        this.nextElementSibling.style.height = "0";
                                                        this.nextElementSibling.style.opacity = 0;
                                                    }

                                                }
                                            }, element.title,
                                                span({ class: "colArrow" })
                                            ),
                                            div({ class: "accordion-item-body" }, element.discription)
                                        )
                                    )
                                } else if (item.currentTarget.textContent == "All") {
                                    return document.querySelector(".accordion").append(div({ class: "details accordion-item" },
                                        div({
                                            class: "summary accordion-item-label",
                                            onclick: function () {
                                                if (this.nextElementSibling.style.display == "" || this.nextElementSibling.style.display == "none") {
                                                    this.nextElementSibling.style.display = "block";
                                                    this.nextElementSibling.style.height = "auto";
                                                    this.nextElementSibling.style.opacity = 1;
                                                } else {
                                                    this.nextElementSibling.style.display = "none";
                                                    this.nextElementSibling.style.height = "0";
                                                    this.nextElementSibling.style.opacity = 0;
                                                }

                                            }
                                        }, element.title,
                                            span({ class: "colArrow" })
                                        ),
                                        div({ class: "accordion-item-body" }, element.discription)
                                    ))
                                }
                            })
                        },
                    }, tab)
                })
            )
        )
    )
    params.append(
        div({ class: "accordion main-accordion-item" },
            ...data.map((element) => {
                return div({ class: "details accordion-item" },
                    div({
                        class: "summary accordion-item-label",
                        onclick: function () {
                            if (this.nextElementSibling.style.display == "" || this.nextElementSibling.style.display == "none") {
                                this.nextElementSibling.style.display = "block";
                                this.nextElementSibling.style.height = "auto";
                                this.nextElementSibling.style.opacity = 1;
                            } else {
                                this.nextElementSibling.style.display = "none";
                                this.nextElementSibling.style.height = "0";
                                this.nextElementSibling.style.opacity = 0;
                            }

                        }
                    }, element.title,
                        span({ class: "colArrow" })
                    ),
                    div({ class: "accordion-item-body" }, element.discription)
                )
            })
        )
    )
}