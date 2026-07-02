const themeToggle = document.querySelector("#themeToggle");
const accessForm = document.querySelector("#accessForm");
const formMessage = document.querySelector("#formMessage");

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});


accessForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(accessForm);

  const employeeName = formData.get("employeeName");
  const systemName = formData.get("systemName");

  formMessage.textContent = `Access request submitted for ${employeeName} to ${systemName}.`;

  accessForm.reset();
});