const express = require("express");
const cors = require("cors");
const limiter = require("./middlewares/rateLimit");


const app = express();

app.use(cors());
app.use(express.json());
app.use(limiter);

app.use("/api", require("./routes/admin.movie.routes"));
app.use("/api", require("./routes/public.movie.routes"));
app.use("/api", require("./routes/admin.series.routes"));
app.use("/api", require("./routes/public.series.routes"));
app.use("/api", require("./routes/search.routes"));
app.use("/api", require("./routes/recommendation.routes"));
app.use("/api", require("./routes/content.routes"));
app.use("/api", require("./routes/home.routes"));
app.use("/api", require("./routes/view.routes"));


module.exports = app;
