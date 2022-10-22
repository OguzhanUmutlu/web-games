(async () => {
    await new Promise(r => addEventListener("load", r));
    const Keyboard = window.SimpleKeyboard.default;

    const myKeyboard = new Keyboard({
        onChange: input => console.log(input)
    });
    addEventListener("contextmenu",ev=>ev.preventDefault());
})();