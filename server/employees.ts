import { prisma } from "./db";
import { redis } from "./redis";

const LIST_KEY = "employees:all";
const TTL = 60;

export async function listEmployees(){
const cached = await redis.get(LIST_KEY)
if(cached)return JSON.parse(cached)

const employees = await prisma.employee.findMany({orderBy:{createdAt:"desc"}})
await redis.set(LIST_KEY, JSON.stringify(employees), "EX" , TTL)
return employees
}

export async function createEmployee(data: { name: string; phoneNumber: string; profilePicture?: string }) {
  const employee = await prisma.employee.create({ data });
  await redis.del(LIST_KEY);                             
  return employee;
}


export async function updateEmployee(id: string, data: Partial<{ name: string; phoneNumber: string }>) {
  const employee = await prisma.employee.update({ where: { id }, data });
  await redis.del(LIST_KEY);
  return employee;
}

export async function deleteEmployee(id: string) {
  await prisma.employee.delete({ where: { id } });
  await redis.del(LIST_KEY);
}

