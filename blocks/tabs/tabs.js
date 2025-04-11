// eslint-disable-next-line import/no-unresolved
import { fetchPlaceholders, toClassName } from '../../scripts/aem.js';

export default async function decorate(block) {

    try {
        const placeholders = await fetchPlaceholders()
        const targetURL = await placeholders.getfundscategorisationnode;//fetchPlaceholders.getAllFundsBoost;
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("User-Agent", "WEB/MultipleCampaign");
        myHeaders.append("user-agent", "WEB/MultipleCampaign");
        myHeaders.append("UserAgent", "WEB/MultipleCampaign");
        myHeaders.append("appid", "27820BB4MEC3DA4D65MAC74CDFF81E020A60");
        myHeaders.append("Access-Control-Allow-Origin", "*");

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
        console.log(error);

    }


    // build tablist
    const tablist = document.createElement('div');
    tablist.className = 'tabs-list';
    tablist.setAttribute('role', 'tablist');

    // decorate tabs and tabpanels
    const tabs = [...block.children].map((child) => child.firstElementChild);
    tabs.forEach((tab, i) => {
        const id = toClassName(tab.textContent);

        // decorate tabpanel
        const tabpanel = block.children[i];
        tabpanel.className = 'tabs-panel';
        tabpanel.id = `tabpanel-${id}`;
        tabpanel.setAttribute('aria-hidden', !!i);
        tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
        tabpanel.setAttribute('role', 'tabpanel');

        // build tab button
        const button = document.createElement('button');
        button.className = 'tabs-tab';
        button.id = `tab-${id}`;
        button.innerHTML = tab.innerHTML;
        button.setAttribute('aria-controls', `tabpanel-${id}`);
        button.setAttribute('aria-selected', !i);
        button.setAttribute('role', 'tab');
        button.setAttribute('type', 'button');
        button.addEventListener('click', () => {
            block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
                panel.setAttribute('aria-hidden', true);
            });
            tablist.querySelectorAll('button').forEach((btn) => {
                btn.setAttribute('aria-selected', false);
            });
            tabpanel.setAttribute('aria-hidden', false);
            button.setAttribute('aria-selected', true);
        });
        tablist.append(button);
        tab.remove();
    });

    block.prepend(tablist);
}