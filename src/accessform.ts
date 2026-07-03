export function setupAccessForm(): void {
  const accessForm = document.querySelector<HTMLFormElement>("#accessForm");
  const formMessage = document.querySelector<HTMLParagraphElement>("#formMessage");

  if (!accessForm || !formMessage) {
    return;
  }

  accessForm.addEventListener("submit", (event: SubmitEvent) => {
    event.preventDefault();

    const formData = new FormData(accessForm);

    const employeeName = String(formData.get("employeeName") ?? "");
    const systemName = String(formData.get("systemName") ?? "");

    formMessage.textContent = `Access request submitted for ${employeeName} to ${systemName}.`;

    accessForm.reset();
  });
}