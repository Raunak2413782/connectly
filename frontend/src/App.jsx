import InputField from "./components/InputField";
import Login from "./pages/Login";
import Register from "./pages/Register";
import {useState} from "react";
import {BrowserRouter,Routes,Route} from "react-router-dom";
import Profile from "./pages/Profile";
function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />}/>
      <Route path="/register" element={<Register/>}/>
      <Route path="/profile" element={<Profile />} />
    </Routes>
    </BrowserRouter>
  );
}
export default App;