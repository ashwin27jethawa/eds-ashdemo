import buildFormBlock from "../form/form.js"
export default function decorate(block){
    const pathName = block.textContent.trim();
    // block.textContent = "";
    buildFormBlock(block,pathName)
}