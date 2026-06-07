import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBfOoEJ0BxhhjkXdL4ae-z5dSrflRG6GQc",
  authDomain: "zerostars-97e21.firebaseapp.com",
  projectId: "zerostars-97e21",
  storageBucket: "zerostars-97e21.firebasestorage.app",
  messagingSenderId: "617216289630",
  appId: "1:617216289630:web:d5d44b81af4ed85e113dcf",
  measurementId: "G-VYWB3L69PK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Game State
let game = JSON.parse(localStorage.getItem("zerostars_save")) || {
  coins:0, level:1, xp:0, energy:100, power:1, miners:0,
  xpBoost:false, doubleCoins:false,
  tasks:{task1:false, task2:false, task3:false, telegram:false, twitter:false},
  dailyMissions:{mine100:false, upgrade1:false, dailyReward:false},
  achievements:{stars1000:false, level10:false, miners10:false}
};

let username = localStorage.getItem("username");
if(!username){ username = prompt("Enter Username"); localStorage.setItem("username", username); }

// Cloud Save
async function loadCloudSave(){
  try{
    const snap = await getDoc(doc(db, "players", username));
    if(snap.exists()){ game = {...game,...snap.data()}; update(); }
  }catch(err){ console.error(err); }
}

async function saveCloud(){ try{ await setDoc(doc(db, "players", username), game); } catch(err){console.error(err);} }

function save(){ localStorage.setItem("zerostars_save", JSON.stringify(game)); saveCloud(); }

// DOM Elements
const coinsEl = document.getElementById("coins");
const levelEl = document.getElementById("level");
const xpText = document.getElementById("xpText");
const xpFill = document.getElementById("xpFill");
const energyFill = document.getElementById("energyFill");
const energyText = document.getElementById("energyText");
const powerEl = document.getElementById("power");
const minersEl = document.getElementById("miners");
const starEl = document.getElementById("star");

// Update Function
function update(){
  coinsEl.textContent = game.coins;
  levelEl.textContent = game.level;
  powerEl.textContent = game.power;
  minersEl.textContent = game.miners;

  const maxXp = game.level*100;
  xpText.textContent = game.xp + " / " + maxXp;
  xpFill.style.width = (game.xp/maxXp*100) + "%";

  energyText.textContent = game.energy + " / 100";
  energyFill.style.width = game.energy + "%";

  // Achievements
  if(game.coins>=1000 && !game.achievements.stars1000){ game.achievements.stars1000=true; document.getElementById("ach1").innerHTML="✅ Reach 1000 Stars"; game.coins+=500; }
  if(game.level>=10 && !game.achievements.level10){ game.achievements.level10=true; document.getElementById("ach2").innerHTML="✅ Reach Level 10"; game.coins+=1000; }
  if(game.miners>=10 && !game.achievements.miners10){ game.achievements.miners10=true; document.getElementById("ach3").innerHTML="✅ Buy 10 Miners"; game.coins+=1500; }

  save();
}

// Floating Text
function createFloating(text,x,y){
  const div=document.createElement("div");
  div.className="floating";
  div.innerText=text;
  div.style.left=x+"px";
  div.style.top=y+"px";
  document.body.appendChild(div);
  setTimeout(()=>div.remove(),1000);
}

// Click / Touch on Star
function handleStarClick(e){
  e.preventDefault();
  if(game.energy<=0) return;
  let gain=game.power;
  if(game.xpBoost) gain*=2;
  if(game.doubleCoins) gain*=2;

  game.coins+=gain;
  game.xp+=gain;
  game.energy--;

  if(game.coins>=100) game.dailyMissions.mine100=true;
  if(game.xp>=game.level*100){ game.xp-=game.level*100; game.level++; }

  createFloating("+"+gain,e.clientX || window.innerWidth/2, e.clientY || window.innerHeight/2);
  update();
}

starEl.addEventListener("click", handleStarClick);
starEl.addEventListener("touchstart", handleStarClick);

// Buttons
const btnMap = [
  ["upgradeBtn",()=>{const cost=game.power*50;if(game.coins<cost)return alert("Not enough Stars");game.coins-=cost;game.power++;game.dailyMissions.upgrade1=true;update();}],
  ["minerBtn",()=>{const cost=(game.miners+1)*100;if(game.coins<cost)return alert("Not enough Stars");game.coins-=cost;game.miners++;update();}],
  ["dailyBtn",()=>{const today=new Date().toDateString();if(localStorage.getItem("zs_daily")===today)return alert("Already Claimed");localStorage.setItem("zs_daily",today);game.coins+=500;game.dailyMissions.dailyReward=true;update();}],
  ["boostBtn",()=>{if(game.coins<500)return alert("Need 500 Stars");game.coins-=500;game.xpBoost=true;update();}],
  ["energyBoostBtn",()=>{if(game.coins<300)return alert("Need 300 Stars");game.coins-=300;game.energy=100;update();}],
  ["doubleCoinsBtn",()=>{if(game.coins<1000)return alert("Need 1000 Stars");game.coins-=1000;game.doubleCoins=true;update();}]
];
btnMap.forEach(([id,fn])=>{
  const el=document.getElementById(id);
  el.addEventListener("click",fn);
  el.addEventListener("touchstart",(e)=>{ e.preventDefault(); fn(); });
});

// Auto Energy & Miner
setInterval(()=>{ if(game.energy<100){ game.energy+=5; if(game.energy>100)game.energy=100; update(); } },3000);
setInterval(()=>{ if(game.miners>0){ game.coins+=game.miners; game.xp+=game.miners; update(); } },1000);

// Tasks
function claimTask(id){ if(id===1 && !game.tasks.task1 && game.coins>=100){game.tasks.task1=true;game.coins+=50;} 
if(id===2 && !game.tasks.task2 && game.miners>=1){game.tasks.task2=true;game.coins+=150;}
if(id===3 && !game.tasks.task3 && game.level>=5){game.tasks.task3=true;game.coins+=500;}
update();}
window.claimTask=claimTask;

function claimTelegramTask(){ if(!game.tasks.telegram){game.tasks.telegram=true;game.coins+=500;update();} }
window.claimTelegramTask=claimTelegramTask;

function claimTwitterTask(){ if(!game.tasks.twitter){game.tasks.twitter=true;game.coins+=500;update();} }
window.claimTwitterTask=claimTwitterTask;

function claimDailyMission(id){
  if(id===1 && game.dailyMissions.mine100===true){game.dailyMissions.mine100="claimed";game.coins+=300;}
  if(id===2 && game.dailyMissions.upgrade1===true){game.dailyMissions.upgrade1="claimed";game.coins+=500;}
  if(id===3 && game.dailyMissions.dailyReward===true){game.dailyMissions.dailyReward="claimed";game.coins+=200;}
  update();
}
window.claimDailyMission=claimDailyMission;

// Live Leaderboard
async function updateLeaderboard(){
  const board=document.getElementById("leaderboard");
  try{
    const snap=await getDocs(collection(db,"players"));
    let players=[];
    snap.forEach(docSnap=>{ const data=docSnap.data(); players.push({username:docSnap.id,coins:data.coins||0,level:data.level||1}); });
    players.sort((a,b)=>b.coins-a.coins);
    board.innerHTML="<h3>🏆 Top Players</h3>";
    players.slice(0,10).forEach((p,i)=>{
      const div=document.createElement("div");
      div.textContent=`#${i+1} ${p.username} - ${p.coins} ⭐ | Lv.${p.level}`;
      board.appendChild(div);
    });
  }catch(err){ board.innerHTML="Failed to load leaderboard."; console.error(err);}
}

// Init
loadCloudSave();
updateLeaderboard();
setInterval(updateLeaderboard,5000);
update();
