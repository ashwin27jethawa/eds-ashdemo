import { fetchPlaceholders } from '../../scripts/aem.js';
import { div, ul, li } from '../../scripts/dom-helpers.js'
import accordBuild from "../accordion/accordion.js"

import tabBuildCompo from "../tabs/tabs.js"

export default async function decorate(block) {
    const pathName = block.textContent.trim();
    block.textContent = "";

    const response = await fetch(pathName);
    const Data = await response.json();

    const myData = Data.data;
    const FaqData = {}

    FaqData["faqContainer"] = ul({ class: "accordion" },
        ...myData.map((item) => {
            return div({ class: "accordion-item" },
                li(item.title),
                li(item.discription)
            )
        })
    )
    const DataDuplicate = ["All"];
    for (const element of myData) {
        if (!DataDuplicate.includes(element.category)) {
            DataDuplicate.push(element.category)
        }
    }
    const faqContainerTabs = ul({ class: "tabs" },
        ...DataDuplicate.map((item) => {
            return div({
                class: "tabs-items"
            },
                li(item),
                div({ class: "tabs-body" })
            )
        })
    )
    tabBuildCompo(faqContainerTabs)
    block.append(faqContainerTabs)
    accordBuild(FaqData["faqContainer"])
    document.querySelector(".tabs-body").append(FaqData["faqContainer"]);

    
// -----------------------------------------
    document.querySelectorAll(".tabs-tab").forEach(function (element) {
        element.addEventListener("click", (event) => {
            console.log(event.currentTarget.textContent.trim());
            FaqData["faqContainer"] = ""
            FaqData["faqContainer"] = ul({ class: "accordion" },
                ...myData.map((item) => {
                    if (event.currentTarget.textContent.trim() === item.category) {
                        return div({ class: "accordion-item" },
                            li(item.title),
                            li(item.discription)
                        )
                    } else if (event.currentTarget.textContent.trim() === "All") {
                        return div({ class: "accordion-item" },
                            li(item.title),
                            li(item.discription)
                        )
                    } else {
                        return ""
                    }
                })
            )
            accordBuild(FaqData["faqContainer"])
            document.querySelector("#tabpanel-" + event.currentTarget.textContent.toLocaleLowerCase().replaceAll(" ", "-")).innerHTML = "";
            document.querySelector("#tabpanel-" + event.currentTarget.textContent.toLocaleLowerCase().replaceAll(" ", "-")).append(FaqData["faqContainer"]);
        })
    })

    try {
        const placeholders = await fetchPlaceholders();
        const targetURL = await placeholders.getfundscategorisationnode;//fetchPlaceholders.getAllFundsBoost;
        // console.log(targetURL);
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("appid", "27820BB4MEC3DA4D65MAC74CDFF81E020A60");
        const raw = JSON.stringify({
            "api_name": "getFundsCategorisationNode",
            "categoryType": "MF"
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        fetch(targetURL, requestOptions)
            .then((response) => response.text())
            .then((result) => console.log(result))
            .catch((error) => console.error(error));
    } catch (error) {

    }
}