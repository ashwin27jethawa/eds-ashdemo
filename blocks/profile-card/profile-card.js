// export default function decorate(block) {
//   //   console.log(block.children);
//   async function getData() {
//     try {
//       const res = await fetch("http://localhost:3000/query-index.json");

//       const json = await res.json();

//       const allPages = json.data;
//       console.log("All Pages:", allPages);

//       const employees = allPages.filter(
//         (page) =>
//           page.path.startsWith("/employees-page/") &&
//           page.path !== "/employees-page/",
//       );

//       console.log("Employee list:", employees);
//       return employees;
//     } catch (error) {
//       console.error("Could not fetch the index:", error);
//     }
//   }

//   getData();

// //   block.textContent= ""
// console.log(block);

// }

export default function decorate(block) {
  async function getData() {
    try {
      const res = await fetch("/query-index.json");
      const json = await res.json();
      return json.data.filter(
        (page) =>
          page.path.startsWith("/employees-page/") &&
          page.path !== "/employees-page/",
      );
    } catch (error) {
      console.error("Could not fetch the index:", error);
    }
  }
  async function renderEmployees() {
    const employees = await getData();
    
    

    if (!employees) return;

    block.textContent = "";

    const cardContainer = document.createElement("div");
    cardContainer.classList.add("employee-card-grid");

    employees.forEach((employee) => {
      const card = document.createElement("div");
      card.classList.add("employee-card");

      const link = document.createElement("a");
      link.href = employee.path;
      link.classList.add("employee-link");

      const imgDiv = document.createElement("div");
      imgDiv.classList.add("employee-image");
      const img = document.createElement("img");
      img.src = employee.personimg;
      img.alt = employee.personname;
      imgDiv.append(img);

      const name = document.createElement("h3");
      name.classList.add("employee-name");
      name.textContent = employee.personname;

      link.append(name);
      card.append(imgDiv,link);
      cardContainer.append(card);
    });

    block.append(cardContainer);
  }
  renderEmployees();
}
