import { Themeswitch } from "./theme";
import { setupAccessForm } from "./accessform";
import { Person } from "./types";
import { getData } from "./ApiClient";

Themeswitch();
setupAccessForm();

async function data(): Promise<void> {
  try {
    const people = await getData<Person[]>("./src/person.json");

    const list = document.querySelector<HTMLTableSectionElement>(
      ".employee-table-body"
    );

    if (!list) {
      console.error("Could not find .employee-table-body in the HTML");
      return;
    }
    let cnt = 0;
    people.forEach((person) => {
      if (person.Status.toLowerCase() === "active") {
        cnt++;
      }
    });
    const metricElement = document.querySelector<HTMLParagraphElement>(
      ".metric"
    );
    if (metricElement) {
      metricElement.textContent = cnt.toString();
    } else {
      console.error("Could not find .metric in the HTML");
    }
    
    list.innerHTML = people
      .map(
        (person) => `
          <tr>
            <td>${person.name}</td>
            <td>${person.Role}</td>
            <td>${person.Team}</td>
            <td>
              <span class="status ${person.Status.toLowerCase().replace(" ", "-")}">
                ${person.Status}
              </span>
            </td>
          </tr>
        `
      )
      .join("");
  } catch (error) {
    console.error("Failed to load person:", error);
  }
}

data();