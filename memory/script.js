(async () => {
    await new Promise(r => addEventListener("load", r));
    const {floor, random} = Math;
    const rand = (min, max) => floor(random() * (max - min + 1)) + min;
    let started = false;
    const kbTable = document.querySelector(".table");
    const toggleKeyboard = () => kbTable.style.height = kbTable.style.height ? "" : "200px";
    document.querySelector(".keyboard > .toggle > img").addEventListener("click", toggleKeyboard);
    document.querySelectorAll(".keys > div > div").forEach(i => {
        const char = i.innerHTML;
        i.addEventListener("click", ev => {
            const opt = {
                charCode: char.charCodeAt(0),
                code: char.charCodeAt(0).toString(),
                key: char
            };
            dispatchEvent(new KeyboardEvent("keydown", opt));
            dispatchEvent(new KeyboardEvent("keypress", opt));
            dispatchEvent(new KeyboardEvent("keyup", opt));
            ev.preventDefault();
        });
    });
    const numbers = document.querySelector(".numbers");
    const gameLoop = () => {
        let ended = false;
        let stage = 1;
        let numberAmount = () => floor(stage / 5) + 3;
        let numberLength = () => floor(stage / 10) + 1;
        let time = () => floor(500 / stage);
        const wait = n => new Promise(r => setTimeout(r, n));
        let ints = null;
        let pressing = null;
        (async () => {
            const starting = async () => {
                for (let t = 3; t > 0; t--) {
                    numbers.innerHTML = t + "";
                    await wait(1000);
                }
                numbers.innerHTML = "";
                await wait(1000);
                setTimeout(showing);
            };
            const showing = async () => {
                ints = [..." ".repeat(numberAmount())].map(_ => rand(1, 10 ** (numberLength()) - 1));
                numbers.innerHTML = ints.join(" ");
                await wait(time());
                numbers.innerHTML = "Type the numbers you have just seen";
                pressing = [];
                pressedKeys.length = 0;
                setTimeout(waiting);
            };
            const waiting = async () => {
                for (let i = 0; i < pressedKeys.length; i++) {
                    const k = pressedKeys[i];
                    if (!/\d/.test(k)) continue;
                    if (k * 1 !== ints[pressing.length]) return ending();
                    pressing.push(k);
                    if (ints.length === pressing.length) break;
                }
                if (pressing.length) numbers.innerHTML = pressing.join(" ");
                if (ints.length === pressing.length) {
                    stage++;
                    return starting();
                }
                pressedKeys.length = 0;
                setTimeout(waiting);
            };
            const ending = async () => {
                numbers.innerHTML = "You pressed to the wrong key!<br>The numbers were: " + ints.join(" ") + "<br>Your score: " + stage + "<br>Click to restart";
                started = false;
            };
            await starting();
        })();
        return () => ended = true;
    };
    addEventListener("click", ev => {
        if (ev.composedPath().some(i => i && i.classList && i.classList.contains("keyboard"))) return;
        if (!started) {
            started = true;
            gameLoop();
        }
    });
    const pressedKeys = [];
    addEventListener("keypress", ev => pressedKeys.push(ev.key));
})();