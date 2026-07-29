const express = require("express");
const app = express();
const cors = require("cors");
app.use(express.json());
app.use(cors());
app.options("*", cors());

app.get("/", (req, res) => {
    res.send("Connectly Backend Running");
});

app.options("/register", (req, res) => {
    console.log("OPTIONS request received");
    res.sendStatus(204);
});

app.post("/register", (req, res) => {
    console.log(req.body);
    console.log("Email: ",req.body.email);
    console.log("Password: ",req.body.password);

    const{email,password} = req.body;
    if(email==="" || password===""){
        return res.send("Please enter email and password");
    }else if(password.length<6){
        return res.send("Password must be at least 6 characters long");
    }

    res.send("Register API Working");
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});