import React from "react";
import { Toaster } from "react-hot-toast";
import EmployeeTable from "./components/EmployeeTable";

function App() {
  return (
    <div className="App">
      <Toaster position="top-right" />
      <EmployeeTable />
    </div>
  );
}

export default App;
