let game = JSON.parse(
localStorage.getItem("zerostars_save")
) || {

coins:0,
level:1,
xp:0,
energy:100,
power:1,
miners:0,
xpBoost:false

};
let username =
localStorage.getItem("username") ||
prompt("Enter Username");

localStorage.setItem(
"username",
username
);

const coinsEl =
document.getElementById("coins");

const levelEl =
document.getElementById("level");

const xpText =
document.getElementById("xpText");

const xpFill =
document.getElementById("xpFill");

const energyFill =
document.getElementById("energyFill");

const energyText =
document.getElementById("energyText");

const powerEl =
document.getElementById("power");

const minersEl =
document.getElementById("miners");

function save(){

localStorage.setItem(
"zerostars_save",
JSON.stringify(game)
);

}

function update(){

coinsEl.textContent =
game.coins;

levelEl.textContent =
game.level;

powerEl.textContent =
game.power;

minersEl.textContent =
game.miners;

const maxXp =
game.level * 100;

xpText.textContent =
game.xp + " / " + maxXp;

xpFill.style.width =
(game.xp / maxXp * 100) + "%";

energyText.textContent =
game.energy + " / 100";

energyFill.style.width =
game.energy + "%";

save();

}

function createFloating(text,x,y){

const div =
document.createElement("div");

div.className =
"floating";

div.innerText =
text;

div.style.left =
x + "px";

div.style.top =
y + "px";

document.body.appendChild(div);

setTimeout(()=>{
div.remove();
},1000);

}

document
.getElementById("star")
.addEventListener("click",(e)=>{

if(game.energy <= 0)
return;

let gain =
game.power;

if(game.xpBoost)
gain *= 2;

game.coins += gain;
game.xp += gain;

game.energy--;

const maxXp =
game.level * 100;

if(game.xp >= maxXp){

game.xp -= maxXp;

game.level++;

alert(
"🎉 Level Up! Level " +
game.level
);

}

createFloating(
"+" + gain,
e.clientX,
e.clientY
);

update();

});

document
.getElementById("upgradeBtn")
.onclick = ()=>{

const cost =
game.power * 50;

if(game.coins < cost){

alert(
"Not enough Stars"
);

return;

}

game.coins -= cost;

game.power++;

update();

};

document
.getElementById("minerBtn")
.onclick = ()=>{

const cost =
(game.miners + 1) * 100;

if(game.coins < cost){

alert(
"Not enough Stars"
);

return;

}

game.coins -= cost;

game.miners++;

update();

};

document
.getElementById("dailyBtn")
.onclick = ()=>{

const today =
new Date()
.toDateString();

if(
localStorage.getItem(
"zs_daily"
) === today
){

alert(
"Already Claimed"
);

return;

}

localStorage.setItem(
"zs_daily",
today
);

game.coins += 500;

alert(
"🎁 +500 Stars"
);

update();

};

document
.getElementById("boostBtn")
.onclick = ()=>{

if(game.coins < 500){

alert(
"Need 500 Stars"
);

return;

}

game.coins -= 500;

game.xpBoost = true;

alert(
"🚀 XP Boost Activated"
);

update();

};

setInterval(()=>{

if(game.energy < 100){

game.energy++;

update();

}

},30000);

setInterval(()=>{

if(game.miners > 0){

game.coins += game.miners;

game.xp += game.miners;

const maxXp =
game.level * 100;

if(game.xp >= maxXp){

game.xp -= maxXp;

game.level++;

}

update();

}

},1000);

update();
