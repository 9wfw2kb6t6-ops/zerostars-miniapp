let game = JSON.parse(
localStorage.getItem("zerostars_save")
) || {

coins:0,
level:1,
xp:0,
energy:100,
power:1,
miners:0

};

const coinsEl =
document.getElementById("coins");

const levelEl =
document.getElementById("level");

const xpEl =
document.getElementById("xp");

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

xpEl.textContent =
game.xp;

powerEl.textContent =
game.power;

minersEl.textContent =
game.miners;

energyText.textContent =
game.energy + " / 100 Energy";

energyFill.style.width =
game.energy + "%";

save();

}

document
.getElementById("star")
.addEventListener("click",()=>{

if(game.energy <= 0) return;

game.coins += game.power;
game.xp += game.power;
game.energy--;

if(
game.xp >= game.level * 100
){
game.xp = 0;
game.level++;
}

update();

});

document
.getElementById("upgradeBtn")
.onclick = ()=>{

let cost =
game.power * 50;

if(game.coins < cost)
return;

game.coins -= cost;
game.power++;

update();

};

document
.getElementById("minerBtn")
.onclick = ()=>{

let cost =
(game.miners+1) * 100;

if(game.coins < cost)
return;

game.coins -= cost;
game.miners++;

update();

};

document
.getElementById("dailyBtn")
.onclick = ()=>{

const today =
new Date().toDateString();

if(
localStorage.getItem("zs_daily")
=== today
){
alert("Reward already claimed");
return;
}

localStorage.setItem(
"zs_daily",
today
);

game.coins += 500;

update();

};

setInterval(()=>{

if(game.energy < 100){

game.energy++;
update();

}

},1000);

setInterval(()=>{

if(game.miners > 0){

game.coins += game.miners;
update();

}

},1000);

update();
