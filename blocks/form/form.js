import {
  decorateIcons,
  toCamelCase,
  toClassName,
} from "../../../scripts/aem.js";

/**
 * Creates an HTML element with an optional class name
 * @param {string} tag - HTML tag name
 * @param {string} [className] - Optional CSS class name
 * @returns {HTMLElement} Created element
 */
function createElement(tag, className) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  return el;
}

/**
 * Adds one or more CSS classes from a space-delimited string.
 * @param {HTMLElement} element - Target element
 * @param {string} classNames - Space-delimited class list
 */
function addClasses(element, classNames) {
  if (!classNames) return;
  classNames
    .split(/\s+/)
    .filter(Boolean)
    .forEach((className) => element.classList.add(className));
}

/**
 * Returns true when a sheet value is the string "true".
 * @param {string|boolean|undefined|null} value - Raw sheet value
 * @returns {boolean} Whether the value is true
 */
function isTrueValue(value) {
  return String(value).toLowerCase() === "true";
}

/**
 * Reads the field value using the sheet's `value` column first, then `default`.
 * @param {Object} field - Field configuration object
 * @returns {string} Field value
 */
function getFieldValue(field) {
  if (field.value !== undefined) return field.value;
  return field.default ?? "";
}

/**
 * Returns whether the field should remain editable. Missing values default to true.
 * @param {Object} field - Field configuration object
 * @returns {boolean} Whether the field is editable
 */
function isEditableField(field) {
  const { editable } = field;
  if (editable === undefined || editable === null || editable === "") {
    return true;
  }
  return !String(editable).toLowerCase().includes("false");
}

/**
 * Reads the configured icon name from the sheet.
 * @param {Object} field - Field configuration object
 * @returns {string} Icon name
 */
function getFieldIcon(field) {
  return field.icon || field[" icon"] || "";
}

/**
 * Generates a camelCase ID from a name and optional option
 * @param {string} name - Base name for the ID
 * @param {string} [option] - Optional value to append to the ID
 * @returns {string} Generated camelCase ID
 */
function generateId(name, option = null) {
  const id = toCamelCase(name);
  return option ? `${id}-${toCamelCase(option)}` : id;
}

/**
 * Creates a help text paragraph with a unique ID
 * @param {string} text - Help text content
 * @param {string} inputId - ID of the associated input field
 * @returns {HTMLParagraphElement} Help text element
 */
function writeHelpText(text, inputId) {
  const help = createElement("p", "field-help-text");
  help.textContent = text;
  help.id = `${inputId}-help`;
  return help;
}

/**
 * Creates a label or legend element
 * @param {string} text - Label text content
 * @param {string} [type='label'] - Either 'label' or 'legend'
 * @param {string} [id] - ID of the associated input (for 'label' type only)
 * @param {boolean} [required] - Whether the field is required
 * @returns {HTMLElement} Label or legend element
 */
function buildLabel(text, type = "label", id = null, required = false) {
  const label = createElement(type);
  label.textContent = text;
  if (id && type === "label") label.setAttribute("for", id);
  if (required) label.dataset.required = "true";
  return label;
}

/**
 * Parses a display value such as "₹5,000", "50%", "$1,00,000" into its parts.
 * Prefix excludes commas so "1,000" isn't treated as prefix + number.
 * Commas inside the numeric group are stripped before parseFloat.
 * @param {string} raw
 * @returns {{ prefix: string, num: number, suffix: string }}
 */
function parseDisplayValue(raw) {
  const match = (raw ?? "")
    .trim()
    .match(/^([^\d,]*([\d][\d,]*(?:\.\d+)?)([^\d]*))$/);
  if (!match) return { prefix: "", num: 0, suffix: "" };
  return {
    prefix: match[1],
    num: parseFloat(match[2].replace(/,/g, "")),
    suffix: match[3],
  };
}

/**
 * Builds a range input wrapper, handling both the standard variant and the
 * slider-with-input variant (when field.classes includes 'slider-with-input').
 * @param {Object} field - Field configuration object
 * @param {HTMLInputElement} input - Pre-configured range input element
 * @returns {HTMLElement} Wrapper element or bare input
 */
function buildRange(field, input) {
  const { placeholder, classes, options } = field;
  const defaultValue = getFieldValue(field);

  const updateRangeProgress = () => {
    const min = parseFloat(input.min) || 0;
    const max = parseFloat(input.max) || 100;
    const val = parseFloat(input.value) || 0;
    const pct = ((val - min) / (max - min)) * 100;
    input.style.setProperty("--range-progress", `${pct}%`);
  };

  /**
   * Builds a .range-labels row from the options string (e.g. "0, 20L").
   * @returns {HTMLElement|null}
   */
  const buildLabelsRow = () => {
    if (!options || !options.length) return null;
    const [minVal, maxVal] = options.split(",").map((o) => o.trim());
    const labelsRow = createElement("div", "range-labels");
    if (minVal) {
      const minLabel = createElement("span", "range-label range-label-min");
      minLabel.textContent = minVal;
      labelsRow.append(minLabel);
    }
    if (maxVal) {
      const maxLabel = createElement("span", "range-label range-label-max");
      maxLabel.textContent = maxVal;
      labelsRow.append(maxLabel);
    }
    return labelsRow;
  };

  // --- slider-with-input variant ---
  if (classes && classes.includes("slider-with-input")) {
    const { prefix, num, suffix } = parseDisplayValue(defaultValue);

    // Seed the range with the numeric part of the default value
    input.value = num;
    updateRangeProgress();

    // Text input — shows formatted value, accepts numeric typing
    const textInput = createElement("input");
    textInput.type = "text";
    textInput.inputMode = "numeric";
    textInput.className = "range-text-input";
    textInput.value = defaultValue ?? "";
    textInput.setAttribute(
      "aria-label",
      input.getAttribute("aria-label") || "",
    );

    // Range → Text: reformat with original prefix/suffix
    input.addEventListener("input", () => {
      textInput.value = `${prefix}${input.value}${suffix}`;
      updateRangeProgress();
    });

    // Text → Range: strip formatting, clamp, update slider
    textInput.addEventListener("input", () => {
      const { num: parsed } = parseDisplayValue(textInput.value);
      if (Number.isNaN(parsed)) return;
      const min = parseFloat(input.min) || 0;
      const max = parseFloat(input.max) || 100;
      input.value = Math.min(Math.max(parsed, min), max);
      updateRangeProgress();
    });

    // Left column: slider track + optional min/max labels below it
    const sliderCol = createElement("div", "range-slider-col");
    sliderCol.append(input);
    const labelsRow = buildLabelsRow();
    if (labelsRow) sliderCol.append(labelsRow);

    // Right column: editable value + optional unit suffix
    const valueBox = createElement("div", "range-value-box");
    valueBox.append(textInput);
    if (placeholder) {
      const unitSuffix = createElement("span", "range-unit-suffix");
      unitSuffix.textContent = placeholder;
      valueBox.append(unitSuffix);
    }

    const rangeWrapper = createElement(
      "div",
      "range-input-wrapper slider-with-input",
    );
    rangeWrapper.append(sliderCol, valueBox);
    return rangeWrapper;
  }

  // --- standard range ---
  input.addEventListener("input", updateRangeProgress);
  updateRangeProgress();

  const rangeWrapper = createElement("div", "range-input-wrapper");
  rangeWrapper.append(input);

  const labelsRow = buildLabelsRow();
  if (labelsRow) rangeWrapper.append(labelsRow);

  return labelsRow ? rangeWrapper : input;
}

/**
 * Creates an input element with specified attributes
 * @param {Object} field - Field configuration object
 * @returns {HTMLInputElement} Input element
 */
function buildInput(field) {
  const { type, field: fieldName, required, placeholder, classes } = field;
  const defaultValue = getFieldValue(field);
  const icon = getFieldIcon(field);
  const isEditable = isEditableField(field);

  const input = createElement("input");
  input.type = type || "text";
  input.id = generateId(fieldName);
  input.name = input.id;
  input.required = isTrueValue(required);
  if (defaultValue) input.value = defaultValue;
  if (placeholder) input.placeholder = placeholder;
  if (!isEditable) {
    input.readOnly = true;
    input.setAttribute("aria-readonly", "true");
  }

  const wrapper = createElement("div", "input-wrapper");
  let iconEl;

  if (icon) {
    wrapper.classList.add("has-icon");
    iconEl = createElement("span", `icon icon-${icon}`);
  }

  if (type === "tel" && classes?.includes("region")) {
    const region = createElement("span", "tel-region");
    region.textContent = "+91";
    wrapper.append(region, input);
    if (iconEl) {
      wrapper.append(iconEl);
      // decorateIconscon(wrapper);
    }
    return wrapper;
  }

  if (type === "range") return buildRange(field, input);

  const isTextInput = ["text", "email"].includes(type);

  if (isTextInput) {
    if (!isEditable) {
      wrapper.append(input);
      if (iconEl) {
        wrapper.append(iconEl);
        decorateIcons(wrapper);
      }
      return wrapper;
    }

    if (iconEl) {
      wrapper.append(input);
      wrapper.append(iconEl);
      decorateIcons(wrapper);
      return wrapper;
    }

    const clearBtn = createElement("button", "clear-btn");
    clearBtn.type = "button";
    clearBtn.setAttribute("aria-label", "Clear input");
    clearBtn.hidden = !defaultValue;

    const toggleClearButton = () => {
      clearBtn.hidden = input.value.length === 0;
    };

    input.addEventListener("input", toggleClearButton);

    clearBtn.addEventListener("click", () => {
      input.value = "";
      toggleClearButton();
      input.focus();
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });

    wrapper.append(input, clearBtn);
    return wrapper;
  }

  wrapper.append(input);
  if (iconEl) {
    wrapper.append(iconEl);
    decorateIcons(wrapper);
  }

  return wrapper;
}

/**
 * Creates a textarea element
 * @param {Object} field - Field configuration object
 * @returns {HTMLTextAreaElement} Textarea element
 */
function buildTextArea(field) {
  const { field: fieldName, required, placeholder } = field;
  const defaultValue = getFieldValue(field);
  const isEditable = isEditableField(field);

  const textarea = createElement("textarea");
  textarea.id = generateId(fieldName);
  textarea.name = textarea.id;
  textarea.required = isTrueValue(required);
  textarea.rows = 5;
  if (defaultValue) textarea.value = defaultValue;
  if (placeholder) textarea.placeholder = placeholder;
  if (!isEditable) {
    textarea.readOnly = true;
    textarea.setAttribute("aria-readonly", "true");
  }
  return textarea;
}

/**
 * Creates a radio/checkbox input for an option
 * @param {Object} field - Field configuration object
 * @param {string} option - Option value
 * @returns {HTMLInputElement} Radio/checkbox input
 */
function buildOptionInput(field, option) {
  const { type, field: fieldName, required } = field;
  const defaultValue = getFieldValue(field);
  const isEditable = isEditableField(field);
  const id = generateId(fieldName, option);

  const input = createElement("input");
  input.type = type;
  input.id = id;
  input.name = generateId(fieldName);
  input.value = option;
  input.checked = option === defaultValue;
  input.required = isTrueValue(required);
  input.disabled = !isEditable;

  return input;
}

/**
 * Creates a fieldset containing radio/checkbox options
 * @param {Object} field - Field configuration object
 * @param {string} controlled - Controlled field name
 * @returns {HTMLFieldSetElement} Fieldset containing options
 */
function buildOptions(field, controlled) {
  const { type, options, label, required } = field;
  if (!options) return null;

  const fieldset = createElement("fieldset", `form-field ${type}-field`);
  if (controlled) {
    const controller = controlled.split("-")[0];
    fieldset.dataset.controller = controller;
    fieldset.dataset.condition = controlled;
  }
  fieldset.append(buildLabel(label, "legend", null, isTrueValue(required)));

  options.split(",").forEach((o) => {
    const option = o.trim();
    const input = buildOptionInput(field, option);
    const span = createElement("span");
    const labelEl = buildLabel(option, "label", input.id);
    labelEl.prepend(input, span);
    fieldset.append(labelEl);
  });

  return fieldset;
}

/**
 * Fetches select options from a remote URL
 * @param {URL} url - URL to fetch options from
 * @returns {Promise<Array<HTMLOptionElement>>} Array of option elements
 */
async function buildOptionsFromUrl(url) {
  const resp = await fetch(url);
  const { data } = await resp.json();
  const options = data.map((o) => {
    const { option, value } = o;
    const optionEl = createElement("option");
    if (option && value) {
      optionEl.value = value;
      optionEl.textContent = option;
    } else if (option && !value) {
      optionEl.value = option;
      optionEl.textContent = option;
    } else if (value && !option) {
      optionEl.value = value;
      optionEl.textContent = value;
    }
    return optionEl;
  });
  return options;
}

/**
 * Replaces the native <select> with an accessible custom dropdown.
 * Generic: pass any <select> element — no dependency on form-field markup.
 * The native select stays hidden in the DOM for form submission and
 * state detection via :has() CSS selectors.
 * Accessibility: role="combobox" trigger, role="listbox" panel,
 * role="option" items, full keyboard nav, focus management.
 * @param {HTMLSelectElement} selectEl - The native <select> to enhance
 */
function initCustomSelect(selectEl) {
  const container = selectEl.parentElement; // trigger is appended here
  const root = container.parentElement; // listbox is appended here (positioning context)
  if (!container || !root) return;

  // Ensure the select has an ID to wire up ARIA relationships
  if (!selectEl.id) {
    selectEl.id = `select-${Math.random().toString(36).slice(2, 7)}`;
  }
  const { id } = selectEl;

  // Keep native select for form data — hide it visually
  selectEl.setAttribute("aria-hidden", "true");
  selectEl.setAttribute("tabindex", "-1");
  selectEl.style.cssText =
    "position:absolute;opacity:0;width:1px;height:1px;pointer-events:none;";

  // ── Trigger button ──────────────────────────────────────────────────────
  const trigger = createElement("button", "select-trigger");
  trigger.type = "button";
  trigger.id = `${id}-trigger`;
  trigger.setAttribute("role", "combobox");
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-controls", `${id}-listbox`);

  // Point <label for=""> at the trigger so clicking the label works
  const labelEl =
    root.querySelector("label") || document.querySelector(`[for="${id}"]`);
  if (labelEl) labelEl.setAttribute("for", trigger.id);

  const valueSpan = createElement("span", "select-value");
  trigger.append(valueSpan);
  container.append(trigger);

  // ── Listbox ──────────────────────────────────────────────────────────────
  const listbox = createElement("ul", "select-listbox");
  listbox.id = `${id}-listbox`;
  listbox.setAttribute("role", "listbox");
  listbox.hidden = true;
  root.append(listbox);

  function renderOptions() {
    listbox.innerHTML = "";
    [...selectEl.options].forEach((opt) => {
      if (opt.disabled && !opt.value) return; // skip placeholder

      const li = createElement("li");
      li.setAttribute("role", "option");
      li.dataset.value = opt.value;
      li.setAttribute("aria-selected", String(selectEl.value === opt.value));
      if (opt.disabled) {
        li.setAttribute("aria-disabled", "true");
      } else {
        li.setAttribute("tabindex", "-1");
      }

      const text = createElement("span", "option-text");
      text.textContent = opt.textContent.trim();
      li.append(text);

      const check = createElement("span", "option-check");
      check.setAttribute("aria-hidden", "true");
      li.append(check);

      listbox.append(li);
    });
  }

  function syncValue() {
    const chosen = selectEl.value
      ? [...selectEl.options].find((o) => o.value === selectEl.value)
      : [...selectEl.options].find((o) => o.disabled && !o.value);
    valueSpan.textContent = chosen?.textContent.trim() ?? "";
    valueSpan.classList.toggle("is-placeholder", !selectEl.value);
  }

  function syncAria() {
    listbox.querySelectorAll('[role="option"]').forEach((li) => {
      li.setAttribute(
        "aria-selected",
        String(li.dataset.value === selectEl.value),
      );
    });
  }

  renderOptions();
  syncValue();

  // ── Open / Close ─────────────────────────────────────────────────────────
  function open() {
    if (selectEl.disabled || selectEl.hasAttribute("readonly")) return;
    listbox.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    container.classList.add("is-open");
    const toFocus =
      listbox.querySelector('[aria-selected="true"]:not([aria-disabled])') ||
      listbox.querySelector('[role="option"]:not([aria-disabled])');
    toFocus?.focus();
  }

  function close(refocus = true) {
    listbox.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    container.classList.remove("is-open");
    if (refocus) trigger.focus();
  }

  function pick(value) {
    selectEl.value = value;
    selectEl.dispatchEvent(new Event("change", { bubbles: true }));
    syncValue();
    syncAria();
  }

  // ── Events ───────────────────────────────────────────────────────────────
  trigger.addEventListener("click", () =>
    listbox.hidden ? open() : close(false),
  );

  trigger.addEventListener("keydown", (e) => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      open();
    }
  });

  listbox.addEventListener("click", (e) => {
    const opt = e.target.closest('[role="option"]');
    if (!opt || opt.getAttribute("aria-disabled") === "true") return;
    pick(opt.dataset.value);
    close();
  });

  listbox.addEventListener("keydown", (e) => {
    const opts = [
      ...listbox.querySelectorAll('[role="option"]:not([aria-disabled])'),
    ];
    const i = opts.indexOf(document.activeElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      opts[Math.min(i + 1, opts.length - 1)]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (i <= 0) close();
      else opts[i - 1]?.focus();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const active = document.activeElement;
      if (active?.dataset?.value !== undefined) {
        pick(active.dataset.value);
        close();
      }
    } else if (e.key === "Escape" || e.key === "Tab") {
      if (e.key === "Tab") e.preventDefault();
      close();
    }
  });

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (!root.contains(e.target)) close(false);
  });

  // Keep trigger text in sync if native select changes programmatically
  selectEl.addEventListener("change", () => {
    syncValue();
    syncAria();
  });

  // Rebuild when async (URL-sourced) options arrive
  new MutationObserver(() => {
    renderOptions();
    syncValue();
  }).observe(selectEl, { childList: true });
}

/**
 * Creates a select dropdown field
 * @param {Object} field - Field configuration object
 * @param {string} controlled - Controlled field name
 * @returns {HTMLElement} Wrapper div containing select element
 */
function buildSelect(field, controlled) {
  const { type, options, field: fieldName, label, placeholder } = field;
  const required = isTrueValue(field.required);
  const icon = getFieldIcon(field);
  const isEditable = isEditableField(field);
  const defaultValue = getFieldValue(field);
  if (!options) return null;

  const wrapper = createElement("div", `form-field ${type}-field`);
  if (controlled) {
    const controller = controlled.split("-")[0];
    wrapper.dataset.controller = controller;
    wrapper.dataset.condition = controlled;
  }
  wrapper.append(buildLabel(label, "label", generateId(fieldName), required));

  const select = createElement("select");
  select.id = generateId(fieldName);
  select.name = select.id;
  select.required = required;
  if (!isEditable) {
    select.setAttribute("readonly", "");
    select.setAttribute("aria-readonly", "true");
  }

  const wrapperInput = createElement("div", "input-wrapper");

  if (icon) {
    wrapperInput.classList.add("has-icon");
    const iconEL = createElement("span", `icon icon-${icon}`);
    wrapperInput.append(iconEL);
    decorateIcons(wrapperInput);
  }

  wrapperInput.prepend(select);
  wrapper.append(wrapperInput);

  if (placeholder) {
    const placeholderOption = createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = placeholder;
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    select.append(placeholderOption);
  }

  try {
    const url = new URL(options);
    buildOptionsFromUrl(url).then((os) => {
      select.append(...os);
      if (defaultValue) select.value = defaultValue;
    });
  } catch (error) {
    options.split(",").forEach((o) => {
      const option = o.trim();
      const optionEl = createElement("option");
      optionEl.value = option;
      optionEl.textContent = option;
      select.append(optionEl);
    });

    if (defaultValue) select.value = defaultValue;
  }

  initCustomSelect(select);

  return wrapper;
}

/**
 * Creates a toggle switch field (styled checkbox)
 * @param {Object} field - Field configuration object
 * @param {string} controlled - Controlled field name
 * @returns {HTMLElement} Wrapper div containing toggle switch
 */
function buildToggle(field, controlled) {
  const { label } = field;
  const required = isTrueValue(field.required);
  const defaultValue = getFieldValue(field);
  const isEditable = isEditableField(field);

  const wrapper = createElement("div", "form-field toggle-field");
  if (controlled) {
    const controller = controlled.split("-")[0];
    wrapper.dataset.controller = controller;
    wrapper.dataset.condition = controlled;
  }

  const input = buildOptionInput(
    { ...field, type: "checkbox" },
    defaultValue || "true",
  );
  input.setAttribute("role", "switch");
  input.setAttribute("aria-checked", input.checked);
  input.disabled = !isEditable;

  input.addEventListener("change", () => {
    input.setAttribute("aria-checked", input.checked);
  });

  const span = createElement("span");
  const labelEl = buildLabel(label, "label", input.id, required);
  labelEl.prepend(input, span);
  wrapper.append(labelEl);

  return wrapper;
}

/**
 * Creates a button element
 * @param {Object} field - Field configuration object
 * @returns {HTMLButtonElement} Button element
 */
function buildButton(field) {
  const { type, label, classes } = field;
  const button = createElement("button");
  button.className = "button";
  addClasses(button, classes);
  button.type = type;
  button.textContent = label;
  if (type === "reset") button.classList.add("secondary");
  return button;
}

/**
 * Toggles visibility of conditional fields based on the selected input
 * @param {Event} e - Change event
 * @param {Map} controllerConfig - Map of controller names to controlled fields
 */
function toggleConditional(e, controllerConfig) {
  const { target } = e;
  const controller = target.name;
  // check if this is a controlling input
  if (controllerConfig.has(controller)) {
    const inputs = [...controllerConfig.get(controller)];
    inputs.forEach((i) => {
      const field = i.closest(".form-field");
      const { condition } = field.dataset;
      const conditionMet = condition.includes(toClassName(target.value));
      field.setAttribute("aria-hidden", !conditionMet);

      // toggle required and tabindex based on visibility
      if (conditionMet) {
        if (i.dataset.originalRequired === "true") {
          i.setAttribute("required", "");
        }
        i.removeAttribute("tabindex");
      } else {
        i.removeAttribute("required");
        i.setAttribute("tabindex", "-1"); // remove from tab order when hidden
      }
    });
  }
}

/**
 * Sets initial visibility of conditional fields based on default values.
 * @param {HTMLFormElement} form - Form element
 * @param {Map} controllerConfig - Map of controller names to controlled fields.
 */
function initConditionals(form, controllerConfig) {
  // for each controller, find its current value and apply conditions
  controllerConfig.forEach((controlledInputs, controller) => {
    // find the controlling input - could be radio/checkbox or select
    let controllerValue = null;
    const checked = form.querySelector(`[name="${controller}"]:checked`);
    const select = form.querySelector(`select[name="${controller}"]`);

    if (checked) {
      controllerValue = checked.value;
    } else if (select) {
      controllerValue = select.value;
    }

    if (controllerValue) {
      // set correct visibility for each controlled field
      controlledInputs.forEach((input) => {
        const field = input.closest(".form-field");
        const { condition } = field.dataset;
        const conditionMet = condition.includes(toClassName(controllerValue));
        field.setAttribute("aria-hidden", !conditionMet);

        // store original required state and toggle based on visibility
        if (input.hasAttribute("required")) {
          // store original required state if not already stored
          if (!input.dataset.originalRequired) {
            input.dataset.originalRequired = "true";
          }

          if (!conditionMet) {
            input.removeAttribute("required");
          }
        }

        // remove from tab order when hidden
        if (conditionMet) {
          input.removeAttribute("tabindex");
        } else {
          input.setAttribute("tabindex", "-1");
        }
      });
    } else {
      // if no input is checked, hide all controlled fields
      controlledInputs.forEach((input) => {
        const field = input.closest(".form-field");
        field.setAttribute("aria-hidden", true);

        // remove required attribute when hidden
        if (input.hasAttribute("required")) {
          // store original required state if not already stored
          if (!input.dataset.originalRequired) {
            input.dataset.originalRequired = "true";
          }
          input.removeAttribute("required");
        }

        // remove from tab order when hidden
        input.setAttribute("tabindex", "-1");
      });
    }
  });
}

/**
 * Sets up conditional field visibility and ARIA relationships
 * @param {HTMLFormElement} form - Form element
 */
function enableConditionals(form) {
  // find controlled fields
  const controlled = [...form.querySelectorAll("[data-controller]")];

  // create a map of controller names to controlled fields
  const controllerConfig = new Map();

  controlled.forEach((c) => {
    const input = c.querySelector("input, textarea, select");
    const { controller } = c.dataset;

    // add to controller map
    if (!controllerConfig.has(controller)) controllerConfig.set(controller, []);
    controllerConfig.get(controller).push(input);

    // set up aria relationships
    if (input && input.id) {
      // find the controlling input(s)
      const controllerInputs = form.querySelectorAll(`[name="${controller}"]`);

      // set aria-controls on controlling inputs
      controllerInputs.forEach((controllerInput) => {
        // get existing aria-controls or initialize empty
        const existingControls =
          controllerInput.getAttribute("aria-controls") || "";
        const controlsArray = existingControls.split(" ").filter((ec) => ec);

        // add this input's id if not already present
        if (!controlsArray.includes(input.id)) {
          controlsArray.push(input.id);
        }

        // update aria-controls attribute
        controllerInput.setAttribute("aria-controls", controlsArray.join(" "));

        // set aria-controlledby on the controlled input
        input.setAttribute("aria-controlledby", controllerInput.id);
      });
    }
  });

  // initialize conditional visibility
  initConditionals(form, controllerConfig);

  // add single event listener for ALL controlling inputs
  form.addEventListener("change", (e) => {
    toggleConditional(e, controllerConfig);
  });
}

/**
 * Enables or disables all form elements
 * @param {HTMLFormElement} form - Form element
 * @param {boolean} [disabled=true] - Whether to disable the form
 */
function toggleForm(form, disabled = true) {
  [...form.elements].forEach((el) => {
    el.disabled = disabled;
  });
}

/**
 * Generates form submission payload from form elements
 * @param {HTMLFormElement} form - Form element
 * @returns {Object} Payload object with form data
 */
function generatePayload(form) {
  const payload = {};
  [...form.elements].forEach((field) => {
    if (field.name && !field.disabled) {
      if (field.type === "radio") {
        if (field.checked) payload[field.name] = field.value;
      } else if (field.type === "checkbox") {
        if (field.checked)
          payload[field.name] = payload[field.name]
            ? `${payload[field.name]},${field.value}`
            : field.value;
      } else {
        payload[field.name] = field.value;
      }
    }
  });
  return payload;
}

/**
 * Handles form submission
 * @param {HTMLFormElement} form - Form element to submit
 * @returns {Promise<void>}
 */
async function handleSubmit(form) {
  try {
    const payload = generatePayload(form);
    toggleForm(form);
    const response = await fetch(form.dataset.action, {
      method: "POST",
      body: JSON.stringify({ data: payload }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      if (form.dataset.confirmation) {
        window.location.href = form.dataset.confirmation;
      }
    } else {
      const error = await response.text();
      throw new Error(error);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  } finally {
    toggleForm(form, false);
  }
}

/**
 * Sets up form submission handler
 * @param {HTMLFormElement} form - Form element
 * @param {string} submit - Submit URL
 * @param {Array<Object>} fields - Array of field configurations
 */
function enableSubmission(form, submit, fields) {
  form.dataset.action = submit;
  const confirmation = fields.find((f) => f.type === "confirmation");
  if (confirmation) {
    form.dataset.confirmation =
      confirmation.label || getFieldValue(confirmation);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const valid = form.reportValidity();
    if (valid) {
      handleSubmit(form);
    } else {
      const firstInvalid = form.querySelector(":invalid:not(fieldset)");
      if (firstInvalid) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
        firstInvalid.setAttribute("aria-invalid", true);
      }
    }
  });

  // clear aria-invalid on field change
  form.addEventListener("input", (e) => {
    if (e.target.hasAttribute("aria-invalid")) {
      if (e.target.validity.valid) {
        e.target.removeAttribute("aria-invalid");
      }
    }
  });
}

/**
 * Creates a plain text paragraph field.
 * @param {Object} field - Field configuration object
 * @returns {HTMLParagraphElement} Paragraph element
 */
function buildPlainText(field) {
  const { label, field: fieldName, classes } = field;
  const value = getFieldValue(field);

  const p = createElement("p", "plain-text-field");
  addClasses(p, classes);

  // Prefer value, fallback to label
  p.textContent = value || label || "";

  if (fieldName) {
    p.dataset.field = generateId(fieldName);
  }

  return p;
}

/**
 * Creates a form field based on field configuration
 * @param {Object} field - Field configuration object
 * @returns {HTMLElement} Form field element (fieldset, div, or button)
 */
function buildField(field) {
  const { type, label, help, field: fieldName, conditional, classes } = field;
  const controlled = conditional || null;

  if (type === "plain-text") {
    return buildPlainText(field);
  }

  // submit/reset buttons stand alone
  if (type === "submit" || type === "reset") {
    return buildButton(field);
  }

  // radio/checkbox groups get a fieldset
  if (type === "radio" || type === "checkbox") {
    const fieldset = buildOptions(field, controlled);
    if (help) {
      const helpText = writeHelpText(help, generateId(fieldName));
      fieldset.append(helpText);
    }
    return fieldset;
  }

  if (type === "toggle") {
    const toggle = buildToggle(field, controlled);
    if (help) {
      const helpText = writeHelpText(help, generateId(fieldName));
      toggle.append(helpText);
    }
    return toggle;
  }

  if (type === "select") {
    const select = buildSelect(field, controlled);
    if (help) {
      const helpText = writeHelpText(help, generateId(fieldName));
      select.append(helpText);
    }
    return select;
  }

  // inputs and textareas get a wrapper div
  const wrapper = createElement("div", `form-field ${type}-field`);
  addClasses(wrapper, classes);

  if (controlled) {
    const controller = controlled.split("-")[0];
    wrapper.dataset.controller = controller;
    wrapper.dataset.condition = controlled;
  }
  const inputId = generateId(fieldName);
  wrapper.append(
    buildLabel(label, "label", inputId, isTrueValue(field.required)),
  );

  // create help text first to get id
  let helpText;
  if (help) {
    helpText = writeHelpText(help, inputId);
    wrapper.append(helpText);
  }

  const input = type === "textarea" ? buildTextArea(field) : buildInput(field);

  if (type === "textarea") {
    wrapper.append(input);
  } else {
    wrapper.insertBefore(input, wrapper.firstChild.nextSibling);
  }

  if (help) input.setAttribute("aria-describedby", helpText.id);

  return wrapper;
}

/**
 * Creates a complete form from field configurations
 * @param {Array<Object>} fields - Array of field configurations
 * @returns {HTMLFormElement} Complete form element
 */
export function buildForm(fields, submit) {
  const form = createElement("form");
  form.setAttribute("novalidate", "");

  const rowWrappers = new Map();

  fields.forEach((field) => {
    if (field.type === "row" && field.name) {
      const rowWrapper = createElement(
        "div",
        `form-row ${toClassName(field.name)}`,
      );
      addClasses(rowWrapper, field.classes);
      rowWrappers.set(field.name, rowWrapper);
    }
  });

  // group buttons at the end
  const buttons = [];

  fields.forEach((field) => {
    if (field.type === "row") {
      const rowWrapper = rowWrappers.get(field.name);
      if (rowWrapper) form.append(rowWrapper);
    } else if (field.type === "submit" || field.type === "reset") {
      const rowWrapper = rowWrappers.get(field.row);
      if (rowWrapper) {
        rowWrapper.append(buildField(field));
      } else {
        buttons.push(field);
      }
    } else if (field.type !== "confirmation") {
      const fieldElement = buildField(field);
      const rowWrapper = rowWrappers.get(field.row);
      if (rowWrapper) {
        rowWrapper.append(fieldElement);
      } else {
        form.append(fieldElement);
      }
    }
  });

  // add buttons in a wrapper (if any)
  if (buttons.length) {
    const buttonWrapper = createElement("div", "button-wrapper");
    buttons.forEach((button) => buttonWrapper.append(buildField(button)));
    form.append(buttonWrapper);
  }

  enableConditionals(form);

  if (submit) enableSubmission(form, submit, fields);

  return form;
}

/**
 * Initializes form block with data from JSON endpoint
 * @param {HTMLElement} block - Form block element
 */
export default function decorate(block) {
  block.style.visibility = "hidden";
  const [source, submit] = [...block.querySelectorAll("a[href]")].map(
    (a) => a.href,
  );
  if (source) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(async (entry) => {
          if (entry.isIntersecting) {
            try {
              const resp = await fetch(new URL(source, window.location.origin));
              if (!resp.ok)
                throw new Error(`${resp.status}: ${resp.statusText}`);
              const { data } = await resp.json();
              if (!data) throw new Error(`No form fields at ${source}`);
              const form = buildForm(data, submit);
              block.replaceChildren(form);
              block.removeAttribute("style");
            } catch (error) {
              // eslint-disable-next-line no-console
              console.error("Could not build form from", source, error);
              block.parentElement.remove();
            }
            observer.disconnect();
          }
        });
      },
      { threshold: 0 },
    );

    observer.observe(block);
  } else {
    // eslint-disable-next-line no-console
    console.error("Unable to create form without source");
    block.parentElement.remove();
  }
}
