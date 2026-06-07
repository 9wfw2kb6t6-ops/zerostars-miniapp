import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase
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

// Game state
let storedGame = JSON.parse(localStorage.getItem("zerostars_save")) || {};
let game = {
  coins: storedGame.coins ?? 0,
  level: storedGame.level ?? 1,
  xp: storedGame.xp ?? 0,
  energy: storedGame.energy ?? 100,
  power: storedGame.power ?? 1,
  miners: storedGame.miners ?? 0,
  referrals: storedGame.referrals ?? 0,
  referredBy: storedGame.referredBy ?? null,
  xpBoost: storedGame.xpBoost ?? false,
  doubleCoins: storedGame.doubleCoins ?? false,
  tasks: storedGame.tasks ?? {task1:false,task2:false,task3:false,telegram:false,twitter:false},
  dailyMissions: storedGame.dailyMissions ?? {mine100:false,upgrade1:false,dailyReward:false},
  achievements: storedGame.achievements ?? {stars1000:false,level10:false,miners10:false}
};

let username = localStorage.getItem("username");
if(!username){
  username = "Player_" + Math.floor(Math.random()*999999);
  localStorage.setItem("username", username);
}
const referralCode = username;

// Cloud Save
async function loadCloudSave(){
  try{
    const snap = await getDoc(doc(db,"players",username));
    if(snap.exists()){
      const data = snap.data();
      game = {
        ...game,
        ...data,
        coins: Math.max(game.coins, data.coins || 0),
        level: Math.max(game.level, data.level || 1),
        power: Math.max(game.power, data.power || 1),
        miners: Math.max(game.miners, data.miners || 0),
        xp: Math.max(game.xp, data.xp || 0),
        energy: Math.max(game.energy, data.energy || 0),
        referrals: Math.max(game.referrals, data.referrals || 0),
        tasks: {...game.tasks, ...data.tasks},
        dailyMissions: {...game.dailyMissions, ...data.dailyMissions},
        achievements: {...game.achievements, ...data.achievements},
        referredBy: game.referredBy || data.referredBy || null
      };
    }
  } catch(err){ console.error(err); }
  finally { update(); }
}

async function saveCloud(){ try{ await setDoc(doc(db,"players",username),game);} catch(err){console.error(err);} }

function save(){ localStorage.setItem("zerostars_save",JSON.stringify(game)); saveCloud(); }

// DOM Elements
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
const refCountEl=document.getElementById("refCount");

// Update UI
function update(){
  coinsEl.textContent=game.coins;
  levelEl.textContent=game.level;
  powerEl.textContent=game.power;
  minersEl.textContent=game.miners;
  const maxXp=game.level*100;
  xpText.textContent=`${game.xp} / ${maxXp}`;
  xpFill.style.width=Math.min((game.xp/maxXp*100),100)+"%";
  
  energyText.textContent = game.energy; // نمایش انرژی واقعی
  energyFill.style.width = Math.min((game.energy/500)*100,100)+"%"; // مقیاس نوار انرژی

  if(refCountEl) refCountEl.textContent = `Referrals: ${game.referrals || 0}`;

  // Achievements
  if(game.coins>=1000 && !game.achievements.stars1000){game.achievements.stars1000=true; document.getElementById("ach1").innerHTML="✅ Reach 1000 Stars"; game.coins+=500;}
  if(game.level>=10 && !game.achievements.level10){game.achievements.level10=true; document.getElementById("ach2").innerHTML="✅ Reach Level 10"; game.coins+=1000;}
  if(game.miners>=10 && !game.achievements.miners10){game.achievements.miners10=true; document.getElementById("ach3").innerHTML="✅ Buy 10 Miners"; game.coins+=1500;}
  save();
}

// Floating
function createFloating(text,x,y){
  const div=document.createElement("div");
  div.className="floating"; div.innerText=text;
  div.style.left=x+"px"; div.style.top=y+"px";
  document.body.appendChild(div);
  setTimeout(()=>div.remove(),1000);
}

// Star Click / Touch
function mineStar(e){
  e.preventDefault();
  if(game.energy<=0) return;
  let gain=game.power;
  if(game.xpBoost) gain*=2;
  if(game.doubleCoins) gain*=2;
  game.coins+=gain; game.xp+=gain; game.energy--;
  if(game.coins>=100) game.dailyMissions.mine100=true;
  while(game.xp>=game.level*100){ game.xp-=game.level*100; game.level++; }
  createFloating("+"+gain,e.clientX||window.innerWidth/2,e.clientY||window.innerHeight/2);
  update();
}
if(starEl){
  starEl.addEventListener("click", mineStar);
  starEl.addEventListener("touchstart", mineStar);
}

// Buttons
const btnMap=[
  ["upgradeBtn",()=>{const cost=game.power*50;if(game.coins<cost)return alert("Not enough Stars");game.coins-=cost;game.power++;game.dailyMissions.upgrade1=true;update();}],
  ["minerBtn",()=>{const cost=(game.miners+1)*100;if(game.coins<cost)return alert("Not enough Stars");game.coins-=cost;game.miners++;update();}],
  ["dailyBtn",()=>{const today=new Date().toDateString();if(localStorage.getItem("zs_daily")===today)return alert("Already Claimed");localStorage.setItem("zs_daily",today);game.coins+=500;game.dailyMissions.dailyReward=true;update();}],
  ["boostBtn",()=>{if(game.coins<500)return alert("Need 500 Stars");game.coins-=500;game.xpBoost=true;update();}],
  ["energyBoostBtn",()=>{if(game.coins<300)return alert("Need 300 Stars"); game.coins-=300; game.energy+=100; update();}],
  ["doubleCoinsBtn",()=>{if(game.coins<1000)return alert("Need 1000 Stars");game.coins-=1000;game.doubleCoins=true;update();}]
];
btnMap.forEach(([id,fn])=>{
  const el=document.getElementById(id);
  if(el){
    el.addEventListener("click",fn);
    el.addEventListener("touchstart",e=>{e.preventDefault();fn();});
  }
});

// Auto Energy / Miner
setInterval(()=>{
  if(game.energy<100){game.energy+=5;if(game.energy>100)game.energy=100;update();}
},3000);
setInterval(()=>{
  if(game.miners>0){
    game.coins+=game.miners; game.xp+=game.miners;
    while(game.xp>=game.level*100){ game.xp-=game.level*100; game.level++; }
    update();
  }
},1000);

// Referral
function copyReferral() {
  const link = window.location.origin + window.location.pathname + "?ref=" + username;

  if (navigator.share) {
    navigator.share({ title: "ZeroStars", text: "Join ZeroStars and earn rewards!", url: link })
      .catch(err => console.log("Share cancelled or not supported"));
  } else {
    navigator.clipboard.writeText(link);
    alert("Referral Link Copied:\n" + link);
  }
}
window.copyReferral = copyReferral;

async function processReferral(){
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if(!ref || ref===username || game.referredBy) return;

  try{
    const refDoc = await getDoc(doc(db,"players",ref));
    if(refDoc.exists()){
      let refData = refDoc.data();
      refData.coins = (refData.coins || 0) + 500;
      refData.referrals = (refData.referrals || 0) + 1;
      await setDoc(doc(db,"players",ref), refData);
      game.coins += 250;
      game.referredBy = ref;
      save();
      alert("Referral bonus received!");
    }
  } catch(err){ console.error(err); }
}

// Tasks
function claimTask(id){if(id===1 && !game.tasks.task1 && game.coins>=100){game.tasks.task1=true;game.coins+=50;}
if(id===2 && !game.tasks.task2 && game.miners>=1){game.tasks.task2=true;game.coins+=150;}
if(id===3 && !game.tasks.task3 && game.level>=5){game.tasks.task3=true;game.coins+=500;} update();}
window.claimTask=claimTask;

function claimTelegramTask(){
  if(game.tasks.telegram){ alert("Already Claimed"); return; }
  window.open('https://t.me/zeroStarsuru','_blank');
  game.tasks.telegram=true;
  game.coins+=500;
  update();
}
window.claimTelegramTask=claimTelegramTask;

function claimTwitterTask(){
  if(game.tasks.twitter){ alert("Already Claimed"); return; }
  window.open('https://x.com/Zerostartsuru','_blank');
  game.tasks.twitter=true;
  game.coins+=500;
  update();
}
window.claimTwitterTask=claimTwitterTask;

// Wallet Connect
async function connectWallet(){
  if(typeof window.ethereum!=="undefined"){
    try{
      const accounts = await window.ethereum.request({method:"eth_requestAccounts"});
      const account = accounts[0];
      walletAddr.textContent=`Connected: ${account}`;
      game.wallet=account;
      save();
    }catch(err){console.error(err); alert("Connection failed!");}
  } else { alert("MetaMask not detected!"); }
}
if(walletBtn) { walletBtn.addEventListener("click", connectWallet); }

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
(async () => {
  try {
    await loadCloudSave();
    await processReferral();
    update();
    updateLeaderboard();
    setInterval(updateLeaderboard,5000);
  } catch(err) {
    console.error(err);
    update();
    updateLeaderboard();
    setInterval(updateLeaderboard,5000);
  }
})();
