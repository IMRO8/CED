
import { useState } from "react";
import { useNavigate } from "react-router-dom";



export function Login() {

    const[uid , setUid] = useState("");
    const[pass , setPass] = useState("");
    const[error , setError] = useState("");

    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (uid === "admin" && pass === "password") {
            localStorage.setItem("isAuthenticated", "true");
            navigate("/dashboard");
        } else {
            setError("Invalid username or password");
        }
    };




  return (
    
    <main>
      <h1>Login</h1>

      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="uid">Username</label>
          <input
            id="uid"
            type="text"
            value={uid}
            onChange={(event) => setUid(event.target.value)}
          />
        </div>


        <div>
          <label htmlFor="pass">Password</label>
          <input
            id="pass"
            type="password"
            value={pass}
            onChange={(event) => setPass(event.target.value)}
          />
        </div>


        <button type="submit">Log in</button>

        {error && <p role="alert">{error}</p>}


        </form>

        </main>
  );
}




