/*
  Warnings:

  - You are about to drop the column `employeeRequest` on the `EmployeeRequest` table. All the data in the column will be lost.
  - Added the required column `resource` to the `EmployeeRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EmployeeRequest" DROP COLUMN "employeeRequest",
ADD COLUMN     "resource" TEXT NOT NULL;
