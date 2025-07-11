const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const activityRoutes = require("./routes/activityRoutes");
app.use("/api/activities", activityRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);




mongoose
  .connect("mongodb+srv://admin:123456Ek@cluster0.tv70e1e.mongodb.net/gonulluDB?retryWrites=true&w=majority")
  .then(() => console.log("MongoDB bağlantısı başarılı"))
  .catch((err) => console.log("MongoDB bağlantı hatası:", err));


app.get("/", (req, res) => {
  res.send("Backend çalışıyor!");
});


const PORT = 5000;
app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor`));



