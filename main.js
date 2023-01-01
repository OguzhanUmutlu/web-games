const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);
canvas.style.pointerEvents = "none";
canvas.style.position = "absolute";
canvas.style.left = "0";
canvas.style.top = "0";
const onResize = () => [canvas.width = innerWidth, canvas.height = innerHeight];
onResize();
addEventListener("resize", onResize);
const {random, floor} = Math;
const rand = (min, max) => floor(random() * (max - min + 1)) + min;

const snowflakes = [];
let ticks = 0;

const Y_RATIO = 70 / 100; // max distance they can go relative to the screen height
const MAX_SPEED = 0.5;

const animate = () => {
    ticks++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (ticks % 2 === 0) snowflakes.push({
        x: rand(0, canvas.width), y: -30,
        radius: rand(2, 4), speed: rand(0, MAX_SPEED * 1000) / 1000
    });

    snowflakes.forEach((snowflake, index) => {
        snowflake.x += snowflake.speed;
        snowflake.y++;
        if (snowflake.y >= canvas.height * Y_RATIO) return snowflakes.splice(index, 1);
        const opacity = (canvas.height * Y_RATIO - snowflake.y) / (canvas.height * Y_RATIO + 30);
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.arc(snowflake.x, snowflake.y, snowflake.radius, 0, Math.PI * 2);
        ctx.fill();
    });

    requestAnimationFrame(animate);
};
animate();