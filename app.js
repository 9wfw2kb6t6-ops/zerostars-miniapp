import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "...",
  authDomain: "zerostars-97e21.firebaseapp.com",
  projectId: "zerostars-97e21",
  storageBucket: "zerostars-97e21.firebasestorage.app",
  messagingSenderId: "617216289630",
  appId: "1:617216289630:web:d5d44b81af4ed85e113dcf",
  measurementId: "G-VYWB3L69PK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let game = JSON.parse(localStorage.getItem("zerostars_save")) || {
  coins:0, level:1, xp:0, energy:100, power:1, miners:0,
  xpBoost:false, doubleCoins:false,
  tasks:{task1:false,task2:false,task3:false,telegram:false,twitter:false},
  dailyMissions:{mine100:false,upgrade1:false,dailyReward:false},
  achievements:{stars1000:false,level10:false,miners10:false}
};

let username = localStorage.getItem("username") || ("Player_"+Math.floor(Math.random()*100000));

const coinsEl=document.getElementById("coins");
const levelEl=document.getElementById("level");
const xpText=document.getElementById("xpText");
const xpFill=document.getElementById("xpFill");
const energyFill=document.getElementById("energyFill");
const energyText=document.getElementById("energyText");
const powerEl=document.getElementById("power");
const minersEl=document.getElementById("miners");
const starEl=document.getElementById("star");
const walletBtn=document.getElementById("connectWalletBtn");
const walletAddr=document.getElementById("walletAddress");

async function loadCloudSave(){
  try{
    const snap = await getDoc(doc(db,"players",username));
    if(snap.exists()){ game = {...game,...snap.data()}; update(); }
  }catch(err){console.error(err);}
}

async function saveCloud(){try{await setDoc(doc(db,"players",username),game);}catch(err){console.error(err);}}

function save(){localStorage.setItem("zerostars_save",JSON.stringify(game)); saveCloud();}

function update(){
  if(coinsEl) coinsEl.textContent=game.coins;
  if(levelEl) levelEl.textContent=game.level;
  if(powerEl) powerEl.textContent=game.power;
  if(minersEl) minersEl.textContent=game.miners;
  const maxXp=game.level*100;
  if(xpText) xpText.textContent=`${game.xp} / ${maxXp}`;
  let xpPercent=(game.xp/maxXp)*100;
  if(xpPercent>100) xpPercent=100;
  if(xpFill) xpFill.style.width=xpPercent+"%";
  if(energyText) energyText.textContent=`${game.energy} / 100`;
  if(energyFill) energyFill.style.width=game.energy+"%";

  if(game.coins>=1000 && !game.achievements.stars1000){game.achievements.stars1000=true;const ach1=document.getElementById("ach1"); if(ach1) ach1.innerHTML="✅ Reach 1000 Stars"; game.coins+=500;}
  if(game.level>=10 && !game.achievements.level10){game.achievements.level10=true;const ach2=document.getElementById("ach2"); if(ach2) ach2.innerHTML="✅ Reach Level 10"; game.coins+=1000;}
  if(game.miners>=10 && !game.achievements.miners10){game.achievements.miners10=true;const ach3=document.getElementById("ach3"); if(ach3) ach3.innerHTML="✅ Buy 10 Miners"; game.coins+=1500;}
  save();
}

function createFloating(text,x,y){
  const div=document.createElement("div");
  div.className="floating"; div.innerText=text;
  div.style.left=x+"px"; div.style.top=y+"px";
  document.body.appendChild(div);
  setTimeout(()=>div.remove(),1000);
}

function mineStar(e){
  e.preventDefault();
  if(game.energy<=0) return;
  let gain=game.power;
  if(game.xpBoost) gain*=2;
  if(game.doubleCoins) gain*=2;
  game.coins+=gain; game.xp+=gain; game.energy--;
  if(game.coins>=100) game.dailyMissions.mine100=true;
  while(game.xp>=game.level*100){game.xp-=game.level*100; game.level++;}
  createFloating("+"+gain,e.clientX||window.innerWidth/2,e.clientY||window.innerHeight/2);
  update();
}
if(starEl){starEl.addEventListener("click",mineStar); starEl.addEventListener("touchstart",mineStar);}

// BUTTONS
const btnMap=[
["upgradeBtn",()=>{const cost=game.power*50;if(game.coins<cost)return alert("Not enough Stars");game.coins-=cost;game.power++;game.dailyMissions.upgrade1=true;update();}],
["minerBtn",()=>{const cost=(game.miners+1)*100;if(game.coins<cost)return alert("Not enough Stars");game.coins-=cost;game.miners++;update();}],
["dailyBtn",()=>{const today=new Date().toDateString();if(localStorage.getItem("zs_daily")===today)return alert("Already Claimed");localStorage.setItem("zs_daily",today);game.coins+=500;game.dailyMissions.dailyReward=true;update();}],
["boostBtn",()=>{if(game.coins<500)return alert("Need 500 Stars");game.coins-=500;game.xpBoost=true;update();}],
["energyBoostBtn",()=>{if(game.coins<300)return alert("Need 300 Stars");game.coins-=300;game.energy=100;update();}],
["doubleCoinsBtn",()=>{if(game.coins<1000)return alert("Need 1000 Stars");game.coins-=1000;game.doubleCoins=true;update();}]
];
btnMap.forEach(([id,fn])=>{const el=document.getElementById(id);if(!el) return; el.addEventListener("click",fn); el.addEventListener("touchstart",e=>{e.preventDefault();fn();});});

// AUTO ENERGY / MINER
setInterval(()=>{if(game.energy<100){game.energy+=5;if(game.energy>100)game.energy=100;update();}},3000);
setInterval(()=>{if(game.miners>0){game.coins+=game.miners;game.xp+=game.miners;update();}},1000);

// TASKS
function claimTask(id){if(id===1 && !game.tasks.task1 && game.coins>=100){game.tasks.task1=true;game.coins+=50;} if(id===2 && !game.tasks.task2 && game.miners>=1){game.tasks.task2=true;game.coins+=150;} if(id===3 && !game.tasks.task3 && game.level>=5){game.tasks.task3=true;game.coins+=500;} update();}
function claimTelegramTask(){if(game.tasks.telegram){alert("Already Claimed");return;} game.tasks.telegram=true; game.coins+=500; update();}
function claimTwitterTask(){if(game.tasks.twitter){alert("Already Claimed");return;} game.tasks.twitter=true; game.coins+=500; update();}
function claimDailyMission(id){if(id===1 && game.dailyMissions.mine100===true){game.dailyMissions.mine100="claimed";game.coins+=300;} if(id===2 && game.dailyMissions.upgrade1===true){game.dailyMissions.upgrade1="claimed";game.coins+=500;} if(id===3 && game.dailyMissions.dailyReward===true){game.dailyMissions.dailyReward="claimed";game.coins+=200;} update();}

window.claimTask=claimTask;
window.claimTelegramTask=claimTelegramTask;
window.claimTwitterTask=claimTwitterTask;
window.claimDailyMission=claimDailyMission;

// WALLET
async function connectWallet(){if(typeof window.ethereum!=="undefined"){try{const accounts
