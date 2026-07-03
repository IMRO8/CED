export function Themeswitch() : void  {
const themeToggle = document.getElementById('#themeToggle') as HTMLButtonElement;

if(!themeToggle) return;
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

}