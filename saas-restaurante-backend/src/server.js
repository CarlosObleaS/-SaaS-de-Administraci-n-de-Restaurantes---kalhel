require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API en http://localhost:${PORT}`));
