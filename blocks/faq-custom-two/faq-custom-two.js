import {div,ul,li} from '../../scripts/dom-helpers.js'
export default async function decorate(block){
    const pathName = block.textContent.trim();
    block.textContent = "";

    const response = await fetch(pathName);
    const Data = await response.json();

    const myData = Data.data;

    const faqContainer = div({class:"accoridan-container"},
        ul({class:"accordion"},
            ...myData.map((item)=>{
                return div({class:"accordion-item"},
                    li(item.title),
                    li(item.discription)
                )
            })
        )
    )

    block.append(faqContainer);
}