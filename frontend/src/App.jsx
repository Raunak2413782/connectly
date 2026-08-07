import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SearchUsers from "./pages/SearchUsers";
import FriendRequests from "./pages/FriendRequests";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/search" element={<SearchUsers />} />
        <Route path="/requests" element={<FriendRequests />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;