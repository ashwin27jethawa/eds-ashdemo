export default function decorate(block) {
  //   console.log(block.children);
  async function getData() {
    try {
      const res = await fetch("http://localhost:3000/query-index.json");

      const json = await res.json();

      const allPages = json.data;
      console.log("All Pages:", allPages);

      const employees = allPages.filter(
        (page) =>
          page.path.startsWith("/employees-page/") &&
          page.path !== "/employees-page/",
      );

      console.log("Employee Sub-pages:", employees);
      return employees;
    } catch (error) {
      console.error("Could not fetch the index:", error);
    }
  }

  getData();
}
