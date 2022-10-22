(async () => {
    const {floor, random, sqrt, pow} = Math;
    const rand = (min, max) => floor(random() * (max - min + 1)) + min;
    const shuffle = array => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = floor(random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };
    const questionDiv = document.querySelector(".question");
    let question = null;
    let win = false;
    const regenerateQuestion = (r = rand(2, 6)) => {
        question = null;
        renderQuestion(r);
    };
    const generateQuestion = (r = rand(2, 6)) => {
        win = false;
        const numbers = [];
        const operators = [];
        let result = -1;
        const resultArray = [];
        const ch = () => {
            numbers.length = 0;
            operators.length = 0;
            resultArray.length = 0;
            result = -1;
            for (let i = 0; i < r; i++) {
                const n = rand(1, 9);
                numbers.push(n);
                resultArray.push(n);
                if (i !== r - 1) {
                    const op = [..."+-*/"][floor(random() * 4)];
                    operators.push(op);
                    resultArray.push(op);
                }
            }
            result = eval(resultArray.join(""));
        };
        while (result < 0 || result > 99 || isNaN(result) || result !== floor(result)) ch();
        question = {
            result, resultArray,
            nodes: shuffle([...numbers]).map(i => ({type: "number", value: i, div: null}))
        };
    };
    const renderQuestion = () => {
        if (!question) generateQuestion();
        let currentResult = "?";
        try {
            if (!question.nodes.some((i, j) => [..."+-*/"].includes(i.value) && (!question.nodes[j - 1] || [..."+-*/"].includes(question.nodes[j - 1].value)))) {
                const a = eval(question.nodes.map(i => i.value).join(" "));
                document.querySelector(".question").style.color = "";
                currentResult = a;
            }
        } catch (e) {
            document.querySelector(".question").style.color = "red";
        }
        questionDiv.innerHTML = "";
        question.nodes.forEach(i => {
            const d = document.createElement("div");
            d.classList.add("draggable");
            d.setAttribute("data-type", i.type);
            if (i.type === "number") d.setAttribute("data-removable", "0");
            d.innerText = {"*": "×", "/": "÷"}[i.value] || i.value;
            i.div = d;
            questionDiv.appendChild(d);
        });
        const e = document.createElement("div");
        e.innerText = "=";
        e.className = "not-draggable";
        questionDiv.appendChild(e);
        const r = document.createElement("div");
        r.innerText = currentResult.toString().includes(".") ? (currentResult * 1).toFixed(2) : currentResult;
        r.className = "not-draggable";
        questionDiv.appendChild(r);
        document.querySelector(".target").innerHTML = question.result;
        if (currentResult === question.result && !win) {
            win = true;
            sendWinPopup();
        }
    };
    renderQuestion();
    let dragging = null;
    addEventListener("mousedown", ev => {
        let {target, clientX, clientY} = ev;
        target = touchTarget || target;
        const draggable = target.classList.contains("draggable");
        if (!draggable) return;
        const removable = target.hasAttribute("data-removable") ? target.getAttribute("data-removable") * 1 : true;
        const isClone = target.parentElement.classList.contains("operators");
        dragging = {target, parent: target.parentElement, removable, isClone};
        if (isClone) {
            dragging.target = target.cloneNode(true);
        }
        dragging.target.remove();
        const rect = dragging.target.getBoundingClientRect();
        dragging.target.style.left = clientX - rect.width / 2 + "px";
        dragging.target.style.top = clientY - rect.height / 2 + "px";
        dragging.target.classList.add("dragging");
    });
    addEventListener("mousemove", ev => {
        const {clientX, clientY} = ev;
        if (!dragging) return;
        const rect = dragging.target.getBoundingClientRect();
        dragging.target.style.left = clientX - rect.width / 2 + "px";
        dragging.target.style.top = clientY - rect.height / 2 + "px";
        document.body.appendChild(dragging.target);
    });
    addEventListener("mouseup", ev => {
        const {clientX, clientY} = ev;
        if (!dragging) return;
        dragging.target.classList.remove("dragging");
        const nearest = question.nodes.filter(i => i.div && i.div !== dragging.target).map(i => {
            const rect = i.div.getBoundingClientRect();
            const center = [rect.x + rect.width / 2, rect.y + rect.height / 2];
            return [i.div, center, sqrt(pow(center[0] - clientX, 2) + pow(center[1] - clientY, 2))];
        }).sort((a, b) => a[2] - b[2])[0];
        if (nearest && nearest[2] < 50) {
            const old = question.nodes.find(i => i.div === dragging.target);
            question.nodes = question.nodes.filter(i => i.div !== dragging.target);
            const ind = question.nodes.map(i => i.div).indexOf(nearest[0]);
            const pushing = old || {
                type: "operator",
                value: {"×": "*", "÷": "/"}[dragging.target.innerHTML] || dragging.target.innerHTML
            };
            if (nearest[1][0] > clientX) {
                //back
                question.nodes = [...question.nodes.slice(0, ind), pushing, ...question.nodes.slice(ind)]
            } else {
                // towards
                question.nodes = [...question.nodes.slice(0, ind + 1), pushing, ...question.nodes.slice(ind + 1)]
            }
        } else if (dragging.target.getAttribute("data-type") === "operator") question.nodes = question.nodes.filter(i => i.div !== dragging.target);
        dragging.target.remove();
        renderQuestion();
        dragging = null;
    });
    let touchTarget = null;
    const touchHandler = e => ev => {
        const touch = ev.changedTouches[0];
        const event = new MouseEvent(e, {clientX: touch.clientX, clientY: touch.clientY});
        touchTarget = ev.target;
        dispatchEvent(event);
    }
    document.addEventListener("touchstart", touchHandler("mousedown"));
    document.addEventListener("touchmove", touchHandler("mousemove"));
    document.addEventListener("touchend", touchHandler("mouseup"));
    const popupDiv = document.querySelector(".popup");
    const popupBoxDiv = document.querySelector(".popup-box");
    const sendWinPopup = () => {
        popupBoxDiv.innerHTML = `
<h1>Victory!</h1>
You guessed the combination right!
<div class="buttons">
    <div>OK</div>
    <div>Regenerate</div>
</div>`;
        document.querySelectorAll(".popup-box > .buttons > div").forEach((i, j) => i.addEventListener("click", () => {
            closePopup()
            if (j === 1) regenerateQuestion();
        }));
        popupDiv.classList.add("popup-on");
        popupBoxDiv.classList.add("popup-box-on");
    };
    const sendAnswerPopup = () => {
        popupBoxDiv.innerHTML = `
<h1>Answer:</h1>
${question.resultArray.join(" ")}
<div class="buttons">
    <div>OK</div>
</div>`;
        document.querySelectorAll(".popup-box > .buttons > div").forEach(i => i.addEventListener("click", closePopup));
        popupDiv.classList.add("popup-on");
        popupBoxDiv.classList.add("popup-box-on");
    };
    const sendHowPopup = () => {
        popupBoxDiv.innerHTML = `
<h1>How to play?</h1>
You will be given a random amount of numbers.<br>
With these numbers, you need to reach the top target number by using addition, subtraction, multiplication and division operations.
<div class="buttons">
    <div>OK</div>
</div>`;
        document.querySelectorAll(".popup-box > .buttons > div").forEach(i => i.addEventListener("click", closePopup));
        popupDiv.classList.add("popup-on");
        popupBoxDiv.classList.add("popup-box-on");
    };
    const closePopup = () => {
        popupDiv.classList.remove("popup-on");
        popupBoxDiv.classList.remove("popup-box-on");
    };
    document.querySelector("#show-answer").addEventListener("click", sendAnswerPopup);
    document.querySelector("#generate").addEventListener("click", regenerateQuestion);
    document.querySelector("#how-to-play").addEventListener("click", sendHowPopup);
    const isMobile = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series([46])0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br([ev])w|bumb|bw-([nu])|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do([cp])o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly([-_])|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-([mpt])|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c([- _agpst])|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac([ \-\/])|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja([tv])a|jbro|jemu|jigs|kddi|keji|kgt([ \/])|klon|kpt |kwc-|kyo([ck])|le(no|xi)|lg( g|\/([klu])|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t([- ov])|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30([02])|n50([025])|n7(0([01])|10)|ne(([cm])-|on|tf|wf|wg|wt)|nok([6i])|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan([adt])|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c([-01])|47|mc|nd|ri)|sgh-|shar|sie([-m])|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel([im])|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c([- ])|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(navigator.userAgent.substring(0, 4));
    if (!isMobile) document.querySelector("body").style.overflow = "hidden";
})();