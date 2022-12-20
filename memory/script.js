(async () => {
    await new Promise(r => addEventListener("load", r));
    const {floor, random} = Math;
    const shuffle = array => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = floor(random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };
    let started = false;
    const textDiv = document.querySelector(".text");
    const boxesDiv = document.querySelector(".boxes");
    const gameLoop = () => {
        let ended = false;
        let stage = 1;
        const score = () => stage - 1;
        const tableSize = () => floor(stage / 5) + 3;
        const boxLightAmount = () => floor(stage / 5) + 3;
        const speed = () => floor(-1 * stage ** 2 / 5 + 500) < 0 ? 0 : floor(-1 * stage ** 2 / 5 + 500);
        const wait = n => new Promise(r => setTimeout(r, n));
        let lights = null;
        let pressing = null;
        let boxes = null;
        (async () => {
            const starting = async () => {
                boxesDiv.innerHTML = [..." ".repeat(tableSize())].map((_, j) => `<div>${[..." ".repeat(tableSize())].map((_, jj) => `<div data-box-id="${j * tableSize() + jj}"><div>${j * 3 + jj + 1}</div></div>`).join("")}</div>`).join("");
                boxes = Array.from(boxesDiv.querySelectorAll("div > div")).filter(i => i.getAttribute("data-box-id"));
                boxes.forEach(i => {
                    i.style.width = Math.min(innerWidth, innerHeight) * .6 / tableSize() + "px";
                    // noinspection JSSuspiciousNameCombination
                    i.style.height = i.style.width;
                });
                for (let t = 3; t > 0; t--) {
                    textDiv.innerHTML = t + "";
                    await wait(1000);
                }
                textDiv.innerHTML = "&nbsp;";
                await wait(1000);
                setTimeout(showing);
            };
            const showing = async () => {
                const sh = shuffle([...boxes]);
                lights = sh.slice(0, boxLightAmount());
                textDiv.innerHTML = "Try to memorize the pattern";
                for (let i = 0; i < lights.length; i++) {
                    const light = lights[i];
                    light.style.backgroundColor = "white";
                    light.firstChild.style.color = "#47494f";
                    await wait(speed());
                    light.style.backgroundColor = "";
                    light.firstChild.style.color = "";
                    await wait(speed());
                }
                textDiv.innerHTML = "Click the boxes you have just seen";
                pressing = [];
                setTimeout(waiting);
            };
            const waiting = async () => {
                const ev = await new Promise(r => addEventListener("click", r));
                if (!ev.target.getAttribute("data-box-id")) return setTimeout(waiting);
                const id = ev.target.getAttribute("data-box-id");
                if (id !== lights[pressing.length].getAttribute("data-box-id")) return ending();
                ev.target.style.backgroundColor = "white";
                pressing.push(id);
                if (lights.length === pressing.length) {
                    stage++;
                    return starting();
                }
                setTimeout(waiting);
            };
            const ending = async () => {
                boxesDiv.innerHTML = "";
                let high = (localStorage.getItem("memory-highScore") || 0) * 1;
                let nh = false;
                if (high < score()) {
                    nh = true;
                    high = score();
                    localStorage.setItem("memory-highScore", high + "");
                }
                textDiv.innerHTML = (nh ? "NEW HIGH SCORE!<br>" : "") + "You pressed to the wrong box!<br>The pattern was: " + lights.map(i => `${i.getAttribute("data-box-id") * 1 + 1}`).join(", ") + "<br>Score: " + score() + "<br>High score: " + high + "<br>Click to restart";
                started = false;
            };
            await starting();
        })();
        return () => ended = true;
    };
    addEventListener("click", () => {
        if (!started) {
            started = true;
            gameLoop();
        }
    });
})();