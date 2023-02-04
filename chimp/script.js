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
    const rand = (min, max) => floor(random() * (max - min + 1)) + min;
    let started = false;
    const text = document.querySelector(".text");
    const gameLoop = async () => {
        text.innerHTML = "";
        let ended = false;
        let stage = 1;
        const score = () => stage - 1;
        const time = () => -30 * (stage - 1) * (stage - 1) + 2000;
        const numberAmount = () => floor(stage / 2) + 3;
        const wait = n => new Promise(r => setTimeout(r, n));
        let ints = null;
        let tempInts = null;
        let startedButton = false;
        let startTime = null;
        const starting = async () => {
            await wait(1000);
            ints = shuffle([..." ".repeat(numberAmount())].map((_, i) => i + 1));
            tempInts = JSON.parse(JSON.stringify(ints));
            document.querySelector(".numbers").innerHTML = ints.map(i => `<div style="margin: ${rand(1, 150)}px 5px 5px">${i}</div>`).join("");
            pressedButtons = [];
            startedButton = false;
            startTime = Date.now();
            setTimeout(waiting);
        };
        const waiting = async () => {
            if (!startedButton && Date.now() - startTime > time()) {
                startedButton = true;
                document.querySelector(".numbers").childNodes.forEach(c => {
                    c.innerHTML = "";
                    c.style.background = "white";
                });
            }
            for (let i = 0; i < pressedButtons.length; i++) {
                const k = pressedButtons[i];
                const num = tempInts[k];
                if (!startedButton) {
                    startedButton = true;
                    document.querySelector(".numbers").childNodes.forEach(c => {
                        c.innerHTML = "";
                        c.style.background = "white";
                    });
                }
                if (tempInts.some(i => i < num)) return ending();
                tempInts = tempInts.filter(i => i !== num);
                const ch = Array.from(document.querySelector(".numbers").children).filter(i => !i.style.pointerEvents)[k];
                ch.style.pointerEvents = "none";
                ch.style.background = "none";
                if (tempInts.length === 0) break;
            }
            if (tempInts.length === 0) {
                stage++;
                return starting();
            }
            pressedButtons = [];
            setTimeout(waiting);
        };
        const ending = async () => {
            let high = (localStorage.getItem("chimp-highScore") || 0) * 1;
            let nh = false;
            if (high < score()) {
                nh = true;
                high = score();
                localStorage.setItem("chimp-highScore", high + "");
            }
            text.innerHTML = (nh ? "NEW HIGH SCORE!<br>" : "") + "You pressed to the wrong button!<br>The numbers were ordered like this from left to right: " + ints.join(" ") + "<br>Score: " + score() + "<br>High score: " + high + "<br>Click to restart";
            started = false;
            document.querySelector(".numbers").innerHTML = "";
        };
        await starting();
        return () => ended = true;
    };
    text.addEventListener("click", () => gameLoop());
    let pressedButtons = [];
    addEventListener("click", ev => {
        if (!ev.target.parentNode || !ev.target.parentNode.classList || !ev.target.parentNode.classList.contains("numbers")) return;
        const index = Array.from(ev.target.parentNode.children).filter(i => !i.style.pointerEvents).indexOf(ev.target);
        pressedButtons.push(index);
    });
})();