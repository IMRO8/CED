import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { Login } from "./login";
import { Dashboard } from "./dashboard";
import { ProtectedRoute } from "./ProtectedRoute";
import { Reqs } from "./Reqs";

export function Paths(){
return (
  <BrowserRouter>
  
    <Routes>


         <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route index element={<Dashboard />} />
        <Route path="/reqs" element={<Reqs />} />
      </Route>

        <Route path="/login" element={<Login />} />

        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    
    
      </BrowserRouter>

);

}