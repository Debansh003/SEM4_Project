server.post('/predict', isAuth, (req, res) => {
    const { area, efficiency, irradiance, pr } = req.body;

    const energy =
        parseFloat(area) *
        parseFloat(efficiency) *
        parseFloat(irradiance) *
        parseFloat(pr);

    res.redirect(`/result.html?energy=${energy}&user=${req.query.user}`);
});

// 🌬️ WIND
server.post('/predict-wind', isAuth, (req, res) => {
    const { area, airDensity, velocity, cp, efficiency } = req.body;

    const energy =
        0.5 *
        parseFloat(airDensity) *
        parseFloat(area) *
        Math.pow(parseFloat(velocity), 3) *
        parseFloat(cp) *
        parseFloat(efficiency);

    res.redirect(`/result.html?energy=${energy}&user=${req.query.user}`);
});
