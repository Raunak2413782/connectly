import InputField from "./components/InputField";
import Login from "./pages/Login";
import Register from "./pages/Register";
import {useState} from "react";
import {BrowserRouter,Routes,Route} from "react-router-dom";
function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />}/>
      <Route path="/register" element={<Register/>}/>
    </Routes>
    </BrowserRouter>
  );
}
export default App;