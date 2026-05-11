export default function decorate(block) {
  block.innerHTML = `
    <div class="form-card">

      <h2>Contact Form</h2>

      <form id="contact-form">

        <input type="hidden" name="editIndex">

        <div class="grid">

          <div class="field">
            <input type="text" name="firstName" placeholder="First Name">
            <small class="error"></small>
          </div>

          <div class="field">
            <input type="text" name="lastName" placeholder="Last Name">
            <small class="error"></small>
          </div>

        </div>

        <div class="field">
          <input type="email" name="email" placeholder="Email">
          <small class="error"></small>
        </div>

        <div class="field">
          <input type="text" name="username" placeholder="Username">
          <small class="error"></small>
        </div>

        <div class="field">
          <input type="tel" name="phone" placeholder="Phone Number" maxLength="10">
          <small class="error"></small>
        </div>

        <div class="field">
          <input type="number" name="age" placeholder="Age">
          <small class="error"></small>
        </div>

        <button type="submit" id="submit-btn" disabled="true">
          Save
        </button>

      </form>

      <div class="top">
        <h3>Saved</h3>

        <button id="clear-btn">
          Clear All
        </button>
      </div>

      <div id="contact-list"></div>

    </div>
  `;

  const form = block.querySelector("#contact-form");
  const list = block.querySelector("#contact-list");
  const clearBtn = block.querySelector("#clear-btn");
  const submitBtn = block.querySelector("#submit-btn");

  // regex patterns
  const nameRegex = /^[A-Za-z]+$/;
  const usernameRegex = /^\w+$/;
  const phoneRegex = /^[6-9]\d{9}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function getContacts() {
    return JSON.parse(localStorage.getItem("contacts")) || [];
  }

  function saveContacts(data) {
    localStorage.setItem("contacts", JSON.stringify(data));
  }

  // error handling
  function showError(input, message) {
    const field = input.parentElement;
    const error = field.querySelector(".error");
    error.textContent = message;
    input.classList.add("invalid");
  }

  // clear error
  function clearError(input) {
    const field = input.parentElement;
    const error = field.querySelector(".error");
    error.textContent = "";
    input.classList.remove("invalid");
  }

  // input validation
  function validateInput(input) {
    const value = input.value.trim();
    // name
    if (input.name == "firstName" || input.name == "lastName") {
      if (!value) {
        showError(input, "This field is required");
        return false;
      }
      if (!nameRegex.test(value)) {
        if (value.includes(" ")) {
          showError(input, "Only single word allowed (Example: Suresh)");
          return false;
        }
      }
      clearError(input);
      return true;
    }
    // email
    if (input.name == "email") {
      if (!emailRegex.test(value)) {
        showError(input, "Enter valid email");
        return false;
      }
      clearError(input);
      return true;
    }

    // usernmae
    if (input.name == "username") {
      if (!usernameRegex.test(value)) {
        showError(
          input,
          "Usernames can only contain letters, numbers, and underscores",
        );
        return false;
      }
      clearError(input);
      return true;
    }

    // phone number
    if (input.name == "phone") {
      if (!phoneRegex.test(value)) {
        const startsCorrectly = phoneRegex.test(value);

        if (!startsCorrectly) {
          showError(input, "Phone number must start with 9, 8, 7, or 6");
        } else {
          showError(input, "Phone number must be exactly 10 digits");
        }
        return false;
      }

      clearError(input);
      return true;
    }

    // age
    if (input.name == "age") {
      if (!value || Number(value) < 1 || Number(value) > 100) {
        showError(input, "Enter valid age (1-100)");
        return false;
      }
      clearError(input);
      return true;
    }
    if (!value) {
      showError(input, "This field is required");
      return false;
    }
    clearError(input);
    return true;
  }

  let isValid = true;

  //  validation
  form.addEventListener("input", (e) => {
    console.log(e.target);

    const inputs = form.querySelectorAll("input");

    inputs.forEach((input) => {
      console.log("input", input);

      submitBtn.disabled = false;
      if (input.name !== "editIndex") {
        const valid = validateInput(input);

        if (!valid) {
          isValid = false;
          submitBtn.disabled = true;
        } else {
          submitBtn.disabled = false;
        }
      }
    });
  });

  // render contacts
  function renderContacts() {
    const contacts = getContacts();

    if (!contacts.length) {
      list.innerHTML = `
        <p class="empty">No contacts found</p>
      `;
      return;
    }

    list.innerHTML = contacts
      .map(
        (item, index) => `
      <div class="item">

        <div class="info">
          <strong>
            ${item.firstName} ${item.lastName}
          </strong>

          <p>Email: ${item.email}</p>

          <p>Username: ${item.username}</p>

          <p>Phone: ${item.phone}</p>

          <small>Age: ${item.age || "N/A"}</small>
        </div>

        <div class="actions">

          <button class="edit-btn" data-index="${index}">
            Edit
          </button>

          <button class="delete-btn" data-index="${index}">
            Delete
          </button>

        </div>

      </div>
    `,
      )
      .join("");
  }

  // form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const inputs = form.querySelectorAll("input");

    // input validation on user type on sumbut

    // inputs.forEach((input) => {
    //   console.log("input", inputs);

    //   submitBtn.disabled = false;
    //   if (input.name !== "editIndex") {
    //     const valid = validateInput(input);

    //     if (!valid) {
    //       isValid = false;
    //       submitBtn.disabled = true;
    //     } else {
    //       submitBtn.disabled = false;
    //     }
    //   }
    // });

    if (!isValid) return;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const contacts = getContacts();

    const contact = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      username: data.username,
      phone: data.phone,
      age: data.age,
    };

    if (data.editIndex !== "") {
      contacts[data.editIndex] = contact;
    } else {
      contacts.push(contact);
    }

    saveContacts(contacts);
    form.reset();
    form.editIndex.value = "";

    submitBtn.textContent = "Save";

    renderContacts();
  });

  list.addEventListener("click", (e) => {
    const contacts = getContacts();

    // delete contact
    if (e.target.classList.contains("delete-btn")) {
      const index = e.target.dataset.index;
      contacts.splice(index, 1);
      saveContacts(contacts);

      renderContacts();
    }

    // edit contact
    if (e.target.classList.contains("edit-btn")) {
      const index = e.target.dataset.index;

      const item = contacts[index];

      form.firstName.value = item.firstName;
      form.lastName.value = item.lastName;
      form.email.value = item.email;
      form.username.value = item.username;
      form.phone.value = item.phone;
      form.age.value = item.age;

      form.editIndex.value = index;

      submitBtn.textContent = "Update";
    }
  });

  // clear contacts
  clearBtn.addEventListener("click", () => {
    localStorage.removeItem("contacts");
    renderContacts();
  });

  renderContacts();
}
