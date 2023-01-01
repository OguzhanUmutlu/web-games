(async () => {
    await new Promise(r => addEventListener("load", r));
    const {floor} = Math;
    let started = false;
    const text = document.querySelector(".text");
    const gameLoop = () => {
        started = true;
        let stage = 1;
        const score = () => stage - 1;
        const wordAmount = () => floor(stage / 5) + 3;
        const wait = n => new Promise(r => setTimeout(r, n));
        let expectedText = null;
        let pressing = null;
        let first = false;
        (async () => {
            const starting = async () => {
                text.style.textDecoration = "";
                for (let t = 3; t > 0; t--) {
                    text.innerHTML = t + "";
                    await wait(1000);
                }
                text.innerHTML = "";
                await wait(1000);
                setTimeout(showing);
            };
            const showing = async () => {
                expectedText = [..." ".repeat(wordAmount())].map(_ => WORDS[Math.floor(Math.random() * WORDS.length)]).join(" ");
                text.innerHTML = expectedText + "<br>Memorize the words and start typing!";
                pressing = [];
                pressedKeys.length = 0;
                first = false;
                setTimeout(waiting);
            };
            const waiting = async () => {
                let entered = false;
                let input = false;
                for (let i = 0; i < pressedKeys.length; i++) {
                    const k = pressedKeys[i];
                    input = true;
                    if (k === "Backspace") pressing.pop();
                    else if (k === "Enter" && first) entered = true;
                    if (/^[\w ]$/.test(k)) {
                        if (expectedText.length > pressing.length) {
                            pressing.push(k);
                            first = true;
                            text.style.textDecoration = "underline";
                        }
                    }
                }
                if (first && input) text.innerHTML = pressing.map(i => i === " " ? "&nbsp;" : i).join("");
                if (entered) {
                    if (expectedText !== pressing.join("")) return ending();
                    stage++;
                    return starting();
                }
                pressedKeys.length = 0;
                setTimeout(waiting);
            };
            const ending = async () => {
                text.style.textDecoration = "";
                let high = (localStorage.getItem("text-memorization-highScore") || 0) * 1;
                let nh = false;
                if (high < score()) {
                    nh = true;
                    high = score();
                    localStorage.setItem("text-memorization-highScore", high + "");
                }
                text.innerHTML = (nh ? "NEW HIGH SCORE!<br>" : "") + "The sentence was wrong!<br>The text was: " + expectedText + "<br>Score: " + score() + "<br>High score: " + high + "<br>Click to restart";
                started = false;
            };
            await starting();
        })();
        return () => started = false;
    };
    addEventListener("click", () => {
        if (!started) gameLoop();
    });
    const pressedKeys = [];
    addEventListener("keydown", ev => pressedKeys.push(ev.key));
})();