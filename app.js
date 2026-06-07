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
document
.getElementById("energyBoostBtn")
.onclick = ()=>{

if(game.coins < 300)
return alert("Need 300 Stars");

game.coins -= 300;

game.energy = 100;

alert("⚡ Energy Full");

update();

};
};

game.tasks =
game.tasks || {
game.dailyMissions =
game.dailyMissions || {

mine100:false,
upgrade1:false,
dailyReward:false

};
game.achievements =
game.achievements || {

stars1000:false,
level10:false,
miners10:false

};
task1:false,
task2:false,
task3:false,

telegram:false,
twitter:false

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
if(
game.coins >= 1000 &&
!game.achievements.stars1000
){

game.achievements.stars1000 = true;

document.getElementById("ach1")
.innerHTML =
"✅ Reach 1000 Stars";

game.coins += 500;

}

if(
game.level >= 10 &&
!game.achievements.level10
){

game.achievements.level10 = true;

document.getElementById("ach2")
.innerHTML =
"✅ Reach Level 10";

game.coins += 1000;

}

if(
game.miners >= 10 &&
!game.achievements.miners10
){

game.achievements.miners10 = true;

document.getElementById("ach3")
.innerHTML =
"✅ Buy 10 Miners";

game.coins += 1500;

}
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
if(game.coins >= 100){
game.dailyMissions.mine100 = true;
}
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
game.dailyMissions.upgrade1 = true;
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
game.dailyMissions.dailyReward = true;
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

game.energy += 5;

if(game.energy > 100){
game.energy = 100;
}

update();

}

},3000);

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
function claimTask(id){

if(id === 1){

if(game.coins < 100)
return alert("Need 100 Stars");

if(game.tasks.task1)
return;

game.tasks.task1 = true;

game.coins += 50;

alert("Task Completed! +50");

}

if(id === 2){

if(game.miners < 1)
return alert("Buy a Miner First");

if(game.tasks.task2)
return;

game.tasks.task2 = true;

game.coins += 150;

alert("Task Completed! +150");

}

if(id === 3){

if(game.level < 5)
return alert("Reach Level 5");

if(game.tasks.task3)
return;

game.tasks.task3 = true;

game.coins += 500;

alert("Task Completed! +500");

}

update();

}

function claimTelegramTask(){

if(game.tasks.telegram){
alert("Already Claimed");
return;
}

game.tasks.telegram = true;

game.coins += 500;

alert("📢 Telegram Reward +500");

update();

}

function claimTwitterTask(){

if(game.tasks.twitter){
alert("Already Claimed");
return;
}

game.tasks.twitter = true;

game.coins += 500;

alert("🐦 X Reward +500");

update();

}
function claimDailyMission(id){

if(id === 1){

if(!game.dailyMissions.mine100)
return alert("Mine 100 Stars First");

game.coins += 300;

game.dailyMissions.mine100 = "claimed";

alert("🎯 +300 Stars");

}

if(id === 2){

if(!game.dailyMissions.upgrade1)
return alert("Buy Upgrade First");

game.coins += 500;

game.dailyMissions.upgrade1 = "claimed";

alert("🎯 +500 Stars");

}

if(id === 3){

if(!game.dailyMissions.dailyReward)
return alert("Claim Daily Reward First");

game.coins += 200;

game.dailyMissions.dailyReward = "claimed";

alert("🎯 +200 Stars");

}

update();

}
update();
