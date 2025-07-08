import {
  button,
  div,
  textarea,
  label,
  span
} from "../../scripts/dom-helpers.js";

export default function decorate(block) {
  block.innerHTML = "";
  block.append(
    div(
      label({
          "for": 'html-input'
        },
        'Paste your HTML code here:'
      ),
      textarea({
        "id": 'html-input',
        "placeholder": 'Paste HTML here...'
      }),
      div({
          "class": 'button-row'
        },
        button({
            "id": 'convert-btn'
          },
          'Convert to DOM Helper'
        ),
        button({
            "id": 'copy-btn',
            "disabled": ''
          },
          'Copy to Clipboard'
        ),
        span({
            "id": 'copy-msg'
          },
          'Copied!'
        )
      ),
      label({
          "for": 'output-code'
        },
        'DOM Helper Code output:'
      ),
      textarea({
        "id": 'output-code',
        "placeholder": 'Converted code will appear here...',
        "readonly": ''
      })
    )
  )

  const helperTags = new Set([
    'div', 'p', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'i', 'img', 'span',
    'form', 'input', 'label', 'button', 'iframe', 'nav', 'fieldset', 'article', 'strong', 'select',
    'option', 'br', 'table', 'tr', 'td', 'th'
  ]);

  function escapeString(str) {
    return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
  }

  function serializeAttributes(el) {
    const attrs = [];
    for (const attr of el.attributes) {
      attrs.push(`${JSON.stringify(attr.name)}: '${escapeString(attr.value)}'`);
    }
    return attrs.length > 0 ? `{ ${attrs.join(', ')} }` : null;
  }

  function htmlToDomElCode(node, indent = 0) {
    const pad = '  '.repeat(indent);

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();
      if (!text) return '';
      return `'${escapeString(text)}'`;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    const tag = node.tagName.toLowerCase();
    const fnName = helperTags.has(tag) ? tag : 'domEl';

    const children = [];
    node.childNodes.forEach(child => {
      const childCode = htmlToDomElCode(child, indent + 1);
      if (childCode) children.push(childCode);
    });

    const attrsCode = serializeAttributes(node);

    const args = [];
    if (attrsCode) args.push(attrsCode);
    args.push(...children);

    if (args.length === 0) {
      return `${pad}${fnName}()`;
    } else if (args.length === 1) {
      return `${pad}${fnName}(${args[0]})`;
    } else {
      const joinedArgs = args.map(arg => {
        if (arg.includes('\n')) {
          return arg.split('\n').map(line => pad + '  ' + line).join('\n');
        }
        return arg;
      }).join(',\n' + pad + '  ');
      return `${pad}${fnName}(\n${pad}  ${joinedArgs}\n${pad})`;
    }
  }
  
  const convertBtn = block.querySelector('#convert-btn');
  const copyBtn = block.querySelector('#copy-btn');
  const htmlInput = block.querySelector('#html-input');
  const outputCode = block.querySelector('#output-code');
  const copyMsg = block.querySelector('#copy-msg');

  convertBtn.addEventListener('click', () => {
    const html = htmlInput.value.trim();
    if (!html) {
      alert('Please paste some HTML code first.');
      return;
    }
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const root = doc.body.firstElementChild;
      if (!root) {
        alert('Could not parse any valid HTML element.');
        return;
      }
      const code = htmlToDomElCode(root);
      outputCode.value = code;
      copyBtn.disabled = false;
      copyMsg.classList.remove('visible');
    } catch (e) {
      alert('Error parsing HTML: ' + e.message);
    }
  });

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(outputCode.value);
      copyMsg.classList.add('visible');
      setTimeout(() => copyMsg.classList.remove('visible'), 1500);
    } catch {
      alert('Failed to copy. Please copy manually.');
    }
  });
}