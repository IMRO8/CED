import "dotenv/config"; 
import { prisma } from "./db";
 
const COUNT = 10;
const API = `https://randomuser.me/api/?results=${COUNT}&nat=us`;
 
// minimal shape of the fields we actually use from the API response
type RandomUser = {
  name: { first: string; last: string };
  phone: string;
  picture: { medium: string };
};
type RandomUserResponse = { results: RandomUser[] };
 
async function main() {
  const force = process.env.FORCE_SEED === "true";
  const existing = await prisma.employee.count();
 
  // idempotency guard: don't silently duplicate rows on an accidental re-run
  if (existing > 0 && !force) {
    console.log(
      `Skipping: ${existing} employees already exist. ` +
        `Run with FORCE_SEED=true to wipe and reseed.`,
    );
    return;
  }
 
  if (force && existing > 0) {
    await prisma.employee.deleteMany();
    console.log(`Cleared ${existing} existing employees (FORCE_SEED).`);
  }
 
  const res = await fetch(API);
  if (!res.ok) {
    throw new Error(`randomuser.me returned ${res.status} ${res.statusText}`);
  }
 
  const data = (await res.json()) as RandomUserResponse;
 
  const employees = data.results.map((u) => ({
    name: `${u.name.first} ${u.name.last}`,
    phoneNumber: u.phone,
    profilePicture: u.picture.medium,
  }));
 
  const result = await prisma.employee.createMany({ data: employees });
  console.log(`Seeded ${result.count} employees.`);
}
 
main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect(); // release the connection so the script exits
  });
 