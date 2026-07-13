
import { useState, useEffect } from "react";
import "../App.css";
import fetchData from "./datafetch";
import { useNavigate } from "react-router-dom";

import type {
  Employee,
  RandomUserResponse
} from "../types/employee";



export function Dashboard() {
const [employeeData, setEmployeeData] = useState<Employee[]>([]);
const navigate = useNavigate();
  
//   const [employeeName, setEmployeeName] = useState("");
//   const [reason, setReason] = useState("");
//   const [resource, setResource] = useState("");

  useEffect(() => {
    async function getEmployeeData() {
      const data = await fetchData<RandomUserResponse>(
        "https://randomuser.me/api/?results=10",
      );

      const employees: Employee[] = data.results.map((user) => ({
        name: `${user.name.first} ${user.name.last}`,
        phoneNumber: user.phone,
        profilePicture: user.picture.medium,
      }));

      setEmployeeData(employees);
    }

    getEmployeeData();
  }, []);

  
  const handlelogout = () => {
    localStorage.removeItem("isAuthenticated");
    window.location.href = "/login";
  }

  const handleReqs = () => {
    navigate("/reqs")

  }
  return (


     <main className="App-body">

        
        <section className="employee-section">
          <h2 className="App-title">Employee Dashboard</h2>

        <form onSubmit={handlelogout}>
            <button type="submit">Logout</button>
        </form>

        <form onSubmit={handleReqs}>
           <button type="submit">Request form</button>
            </form>

          <div className="employee-list">
            {employeeData.map((employee, index) => (
              <div className="employee-card" key={employee.phoneNumber}>
                <p>#Employee {index + 1}</p>
                <img src={employee.profilePicture} alt={employee.name} />
                <h2>Name: {employee.name}</h2>
                <p>Ph.No: {employee.phoneNumber}</p>
              </div>
            ))}
          </div>
        </section>

             </main>
  
  );
}