/* DASH OS — BOSS RUSH overlay. Drop in via:  <script src="dash-bossrush.js" defer></script>
   No deps. Hooks site's CSS vars (--or --cy --rd --bk --gn). Saves to localStorage 'dashBR_v1'. */
(()=>{'use strict';
if(window.__DASH_BR){return;} window.__DASH_BR=1;

/* ──────────── CONFIG ──────────── */
const W=480,H=270,PX=2,FPS=60;
const KEY='dashBR_v1';
const PLAYER_NAME='Pratik';
const COLORS={or:'#e87820',or2:'#c05e10',gn:'#2ecc71',rd:'#e74c3c',cy:'#1abc9c',bk:'#07080f',pl:'#9b59b6',yl:'#f1c40f',wh:'#dde0ff',mt:'#6668a0'};

/* ──────────── 14 THEMES ──────────── */
const THEMES={
  red:{c:'#e74c3c',c2:'#b03030',tier:'base',perk:'atkSpd',mul:1,name:'RED',desc:'+25% Attack Speed'},
  orange:{c:'#e87820',c2:'#c05e10',tier:'base',perk:'def',mul:1,name:'ORANGE',desc:'+25% Defense'},
  yellow:{c:'#f1c40f',c2:'#c49b0a',tier:'base',perk:'move',mul:1,name:'YELLOW',desc:'+25% Move Speed'},
  green:{c:'#2ecc71',c2:'#1a9e55',tier:'base',perk:'regen',mul:1,name:'GREEN',desc:'+1 HP/s Regen'},
  blue:{c:'#3498db',c2:'#1f5d8a',tier:'base',perk:'energy',mul:1,name:'BLUE',desc:'+50% Energy Pool'},
  purple:{c:'#9b59b6',c2:'#6c3483',tier:'base',perk:'cd',mul:1,name:'PURPLE',desc:'-25% Cooldowns'},
  velvet:{c:'#c0306c',c2:'#7c1c46',tier:'prestige',perk:'atkSpd',mul:2,name:'VELVET',desc:'+50% Attack Speed'},
  amber:{c:'#ffb52a',c2:'#b07a10',tier:'prestige',perk:'def',mul:2,name:'AMBER',desc:'+50% Defense'},
  gold:{c:'#ffd54a',c2:'#a87f00',tier:'prestige',perk:'move',mul:2,name:'GOLD',desc:'+50% Move Speed'},
  matrix:{c:'#33ff66',c2:'#0a8030',tier:'prestige',perk:'regen',mul:2,name:'MATRIX',desc:'+2 HP/s Regen'},
  cyan:{c:'#1abc9c',c2:'#0e8a70',tier:'prestige',perk:'energy',mul:2,name:'CYAN',desc:'+100% Energy Pool'},
  magenta:{c:'#ff3df0',c2:'#a01da8',tier:'prestige',perk:'cd',mul:2,name:'MAGENTA',desc:'-50% Cooldowns'},
  white:{c:'#f0f0ff',c2:'#9090a0',tier:'mythic',perk:'all',mul:1,name:'WHITE',desc:'All base passives combined'},
  multi:{c:'rainbow',c2:'rainbow',tier:'mythic',perk:'rainbow',mul:1,name:'MULTI',desc:'Rainbow Overdrive — all E abilities cycle'}
};

/* ──────────── BOSSES (data-driven) ──────────── */
const BOSSES=[
  {id:'kernel',name:'THE KERNEL PANIC',hp:240,col:'#e74c3c',col2:'#7c1010',
    sprite:'kernel',passive:'teleport10',
    attacks:['stackOverflow','memoryLeak','hardCrash'],
    tagline:'a kernel never panics. except this one.'},
  {id:'spi',name:'GENERAL SPI',hp:300,col:'#1abc9c',col2:'#0a5c52',
    sprite:'spi',passive:'priorityShield',
    attacks:['misoLasers','clockCycle','pinScramble'],
    tagline:'master of serial protocol. shielded by priority.'},
  {id:'wsod',name:'WHITE SCREEN OF DEATH',hp:280,col:'#f0f0ff',col2:'#7080a0',
    sprite:'wsod',passive:'proximityBlur',
    attacks:['backlightBurn','uninitVar','reflash'],
    tagline:'flash of nothingness. it cannot be read.'},
  {id:'slug',name:'ZERO-POINT-ONE',hp:220,col:'#7c4a20',col2:'#3a2010',
    sprite:'slug',passive:'fpsDrop',
    attacks:['fpsZone','rwSlam','diskFragment'],
    tagline:'the slowest enemy in the cosmos.'},
  {id:'cardboard',name:'THE CARDBOARD COLOSSUS',hp:360,col:'#a87830',col2:'#5c4018',
    sprite:'card',passive:'multiArmor',
    attacks:['glueTrap','boxFold','craftCutter'],
    tagline:'engineering by glue gun.'},
  {id:'ghost',name:'THE CACHE GHOST',hp:260,col:'#9b59b6',col2:'#4c2a5c',
    sprite:'ghost',passive:'bankSwap',
    attacks:['cacheMiss','bankSwapAtk','dataThrash'],
    tagline:'present in two places, hittable in one.'},
  {id:'beetle',name:'THE BOOTLOADER BEETLE',hp:300,col:'#2ecc71',col2:'#0e6030',
    sprite:'beetle',passive:'bootHeal',
    attacks:['bootLoop','serialSpit','resetPulse'],
    tagline:'reboots are how it heals.'},
  {id:'demon',name:'THE $4 DEMON',hp:340,col:'#e74c3c',col2:'#3c0a0a',
    sprite:'demon',passive:'discountResist',
    attacks:['componentRain','touchTwitch','discountBeam'],
    tagline:'cheap parts, expensive pain.'},
  {id:'iset',name:'THE INSTRUCTION SET',hp:380,col:'#f1c40f',col2:'#7a6300',
    sprite:'iset',passive:'attackImmune',
    attacks:['mallocMeteor','whileLoop','pointerPierce'],
    tagline:'never the same trick twice.'},
  {id:'phantom',name:'THE 60-FPS PHANTOM',hp:420,col:'#dde0ff',col2:'#3a3c60',
    sprite:'phantom',passive:'staticDodge',
    attacks:['frameSkip','vsyncSlash','motionBlur'],
    tagline:'sixty frames a second. zero of them honest.'}
];

/* ──────────── BYTE LINES ──────────── */
const BYTE={
  intro:["BOSS_RUSH ENGAGED.","welcome to the worst day of your firmware life, "+PLAYER_NAME+".","ten bosses. zero excuses. one cat-themed power fantasy."],
  hit:["that's gonna sting on tuesday.","health is just a suggestion.","auggie & otto would be embarrassed."],
  kill:["dispatched. clean.","another one for the changelog.","ship it."],
  die:["F","skill issue.","you deserve better fans, "+PLAYER_NAME+"!","try again. i'll wait."],
  combo:["combo!","chef's kiss.","this is fine."],
  win:["YOU CLEARED BOSS_RUSH.","ten bosses. flat.","go take a break, "+PLAYER_NAME+". you earned the cat photos."]
};
const pickByte=k=>BYTE[k][Math.random()*BYTE[k].length|0];

/* ──────────── STATE ──────────── */
const S={
  run:false,paused:false,view:'bios', // bios|menu|arena|game|minigame|reward|win|gameover
  player:null,boss:null,bossIdx:0,
  bullets:[],ebullets:[],particles:[],zones:[],warns:[],
  keys:Object.create(null),mouse:{x:W/2,y:H/2,down:false},
  time:0,frame:0,lastT:0,fpsScale:1,
  theme:'orange',unlockedThemes:{orange:1},
  quests:{enemies:0,wins:0,perfectKills:0,waveKills:0,minigames:0,clones:0,
          totalKills:0,fastWin:0,healed:0,specials:0,maxCombo:0,
          dashDodges:0,whiteWin:0,mgPerfect:0,cleanKill:0,gauntletSec:0},
  bossStartT:0,bossClean:true,
  achievements:{},
  byteSay:'',byteUntil:0,
  combo:0,comboT:0,
  shake:0,flash:0,invertT:0,blurT:0,
  minigame:null,minigameDone:null,
  rewardQueue:[],
  music:false,sfxMute:false
};

/* ──────────── UTIL ──────────── */
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const dist=(a,b)=>{const dx=a.x-b.x,dy=a.y-b.y;return Math.sqrt(dx*dx+dy*dy);};
const ang=(a,b)=>Math.atan2(b.y-a.y,b.x-a.x);
const rand=(a,b)=>a+Math.random()*(b-a);
const rint=(a,b)=>Math.floor(rand(a,b+1));
const now=()=>performance.now();
const aabb=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const circHit=(a,b)=>{const r=(a.r||4)+(b.r||4);return (a.x-b.x)**2+(a.y-b.y)**2<r*r;};

const save=()=>{try{localStorage.setItem(KEY,JSON.stringify({theme:S.theme,unlockedThemes:S.unlockedThemes,quests:S.quests,achievements:S.achievements,bossIdx:S.bossIdx}));}catch(e){}};
const load=()=>{try{const j=JSON.parse(localStorage.getItem(KEY)||'{}');if(j.theme)S.theme=j.theme;if(j.unlockedThemes)S.unlockedThemes=j.unlockedThemes;if(j.quests)Object.assign(S.quests,j.quests);if(j.achievements)S.achievements=j.achievements;}catch(e){}};

/* ──────────── CSS injection ──────────── */
const css=`
.br-root{position:fixed;inset:0;z-index:99998;background:#000;font-family:'VT323',monospace;color:#dde0ff;display:none}
.br-root.on{display:flex;flex-direction:column}
.br-bios{position:fixed;inset:0;background:#000;z-index:99999;display:flex;flex-direction:column;padding:2.5rem;font-size:1.25rem;line-height:1.5;font-family:'VT323',monospace;color:#2ecc71}
.br-bios .h{font-family:'Press Start 2P',monospace;font-size:0.85rem;color:#e87820;margin-bottom:1rem;letter-spacing:0.1em}
.br-bios .ln{opacity:0;animation:brTypeIn 0.05s linear forwards}
@keyframes brTypeIn{to{opacity:1}}
.br-bios .opt{font-family:'Press Start 2P',monospace;font-size:0.85rem;margin:0.6rem 0;cursor:pointer;color:#dde0ff;letter-spacing:0.06em;padding:0.7rem 1rem;border:1px solid #3a3c60;background:#07080f;display:inline-block;width:fit-content;transition:all 0.15s}
.br-bios .opt b{color:#e87820}
.br-bios .opt:hover{border-color:#e87820;background:#101120;transform:translateX(6px)}
.br-bios .opt.f2:hover{border-color:#e74c3c;color:#e74c3c}
.br-bios .opt.f2:hover b{color:#e74c3c}
.br-bios .footer{position:absolute;bottom:1.2rem;left:2.5rem;font-size:0.85rem;color:#3a3c60}
.br-bios .crt{position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.25) 2px,rgba(0,0,0,0.25) 3px)}
.br-bios .scan{position:absolute;left:0;right:0;height:80px;background:linear-gradient(180deg,transparent,rgba(46,204,113,0.05),transparent);animation:brScan 6s linear infinite}
@keyframes brScan{0%{top:-80px}100%{top:100%}}

/* portal button on site */
#br-portal{position:fixed;top:0.7rem;right:0.7rem;z-index:880;font-family:'Press Start 2P',monospace;font-size:0.55rem;letter-spacing:0.1em;padding:0.55rem 0.8rem;border:1px solid #e74c3c;color:#e74c3c;background:rgba(7,8,15,0.9);cursor:pointer;transition:all 0.18s}
#br-portal:hover{background:#e74c3c;color:#000;transform:translateY(-2px) scale(1.05);box-shadow:0 0 18px rgba(231,76,60,0.5)}
#br-portal .blk{display:inline-block;width:6px;height:6px;background:currentColor;margin-right:6px;animation:brPortalBlink 1s steps(1) infinite}
@keyframes brPortalBlink{50%{opacity:0}}

/* main game shell */
.br-shell{position:fixed;inset:0;background:#07080f;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:99998}
.br-stage{position:relative;width:min(100vw,calc(100vh*16/9));aspect-ratio:16/9;background:#0a0c1a;border:2px solid #3a3c60;box-shadow:0 0 60px rgba(232,120,32,0.15),inset 0 0 60px rgba(0,0,0,0.6);image-rendering:pixelated;image-rendering:crisp-edges}
.br-stage canvas{position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated;image-rendering:crisp-edges}
.br-stage .scanlines{position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.18) 3px,rgba(0,0,0,0.18) 4px);z-index:6}
.br-stage .vignette{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at center,transparent 50%,rgba(0,0,0,0.6) 100%);z-index:6}

.br-hud{position:absolute;top:0;left:0;right:0;padding:0.6rem 0.9rem;display:flex;justify-content:space-between;align-items:flex-start;font-family:'Press Start 2P',monospace;font-size:0.55rem;letter-spacing:0.08em;z-index:8;pointer-events:none}
.br-hud .l,.br-hud .r{display:flex;flex-direction:column;gap:0.3rem}
.br-hud .bar{width:160px;height:10px;background:#101120;border:1px solid #3a3c60;position:relative;overflow:hidden}
.br-hud .bar i{position:absolute;inset:0 auto 0 0;background:#e87820;transition:width 0.18s}
.br-hud .bar.hp i{background:#2ecc71}
.br-hud .bar.hp.lo i{background:#e74c3c;animation:brHpLo 0.5s steps(1) infinite}
.br-hud .bar.en i{background:#1abc9c}
@keyframes brHpLo{50%{opacity:0.4}}
.br-hud .lbl{color:#6668a0;font-size:0.5rem}
.br-hud .stat{color:#dde0ff}
.br-hud .stat.or{color:#e87820}
.br-hud .stat.cy{color:#1abc9c}
.br-hud .boss-bar{width:300px;height:14px;background:#101120;border:1px solid #e74c3c;position:relative;overflow:hidden}
.br-hud .boss-bar i{position:absolute;inset:0 auto 0 0;background:linear-gradient(90deg,#e74c3c,#e87820);transition:width 0.2s;height:100%}
.br-hud .boss-bar.armored{height:6px;margin-top:1px}
.br-hud .boss-name{color:#e74c3c;font-size:0.6rem;text-align:center;margin-bottom:0.2rem;text-shadow:0 0 8px rgba(231,76,60,0.5)}

#br-byte-tag{position:absolute;left:0.9rem;bottom:0.9rem;max-width:50%;padding:0.6rem 0.8rem;background:rgba(7,8,15,0.92);border:1px solid #e87820;font-family:'VT323',monospace;font-size:1.05rem;color:#dde0ff;line-height:1.3;z-index:9;animation:brByteIn 0.25s ease}
#br-byte-tag::before{content:'BYTE > ';color:#e87820;font-family:'Press Start 2P',monospace;font-size:0.55rem;letter-spacing:0.1em;display:block;margin-bottom:0.15rem}
@keyframes brByteIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}

#br-exit{position:absolute;top:0.6rem;right:0.6rem;font-family:'Press Start 2P',monospace;font-size:0.5rem;letter-spacing:0.1em;padding:0.45rem 0.7rem;border:1px solid #6668a0;background:rgba(7,8,15,0.92);color:#dde0ff;cursor:pointer;z-index:10;transition:all 0.15s}
#br-exit:hover{border-color:#e74c3c;color:#e74c3c}
#br-exit::before{content:'[ ';color:#6668a0}#br-exit::after{content:' ]';color:#6668a0}

/* menu/arena overlays */
.br-overlay{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;background:rgba(7,8,15,0.94);z-index:7;font-family:'VT323',monospace;font-size:1.1rem;color:#dde0ff;text-align:center}
.br-overlay.on{display:flex}
.br-overlay h1{font-family:'Press Start 2P',monospace;font-size:1.6rem;color:#e87820;letter-spacing:0.15em;margin-bottom:0.4rem;text-shadow:0 0 24px rgba(232,120,32,0.5)}
.br-overlay h2{font-family:'Press Start 2P',monospace;font-size:0.9rem;color:#1abc9c;margin-bottom:1.5rem;letter-spacing:0.12em}
.br-overlay .sub{color:#6668a0;font-size:1rem;margin-bottom:2rem}
.br-overlay .btn{font-family:'Press Start 2P',monospace;font-size:0.7rem;letter-spacing:0.1em;padding:0.8rem 1.4rem;border:1px solid #3a3c60;background:#101120;color:#dde0ff;cursor:pointer;margin:0.35rem;transition:all 0.18s}
.br-overlay .btn:hover{border-color:#e87820;color:#e87820;transform:translateY(-2px)}
.br-overlay .btn.p{border-color:#e87820;background:#e87820;color:#000}
.br-overlay .btn.p:hover{background:#c05e10;border-color:#c05e10;color:#000}
.br-overlay .btn.d{border-color:#e74c3c;color:#e74c3c}
.br-overlay .btn.d:hover{background:#e74c3c;color:#000}

/* boss intro card */
.br-card{padding:1.5rem 2rem;border:2px solid #e74c3c;background:#0a0a0a;max-width:600px;animation:brCardIn 0.4s cubic-bezier(0.34,1.56,0.64,1)}
@keyframes brCardIn{from{transform:scale(0.7);opacity:0}to{transform:scale(1);opacity:1}}
.br-card .num{font-family:'Press Start 2P',monospace;font-size:0.6rem;color:#6668a0;letter-spacing:0.2em}
.br-card h1{margin:0.5rem 0}
.br-card .tag{font-style:italic;color:#1abc9c;margin-bottom:1rem;font-size:1rem}

/* theme grid */
.br-themes{display:grid;grid-template-columns:repeat(7,1fr);gap:0.5rem;max-width:700px;margin:1rem 0}
.br-theme{padding:0.6rem 0.4rem;border:2px solid #3a3c60;background:#0a0a0a;cursor:pointer;text-align:center;font-family:'Press Start 2P',monospace;font-size:0.45rem;letter-spacing:0.05em;transition:all 0.18s;position:relative}
.br-theme:hover{transform:translateY(-3px)}
.br-theme.active{box-shadow:0 0 0 2px #e87820}
.br-theme.locked{opacity:0.25;cursor:not-allowed}
.br-theme .sw{display:block;width:100%;height:14px;margin-bottom:0.3rem;border:1px solid rgba(0,0,0,0.4)}
.br-theme.multi .sw{background:linear-gradient(90deg,#e74c3c,#e87820,#f1c40f,#2ecc71,#1abc9c,#3498db,#9b59b6,#ff3df0)}
.br-theme .lck{position:absolute;top:2px;right:4px;color:#e74c3c;font-family:'VT323',monospace;font-size:0.7rem}

/* MINIGAME OVERLAY */
.br-mg{position:absolute;inset:0;background:rgba(0,0,0,0.95);z-index:11;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1rem;font-family:'VT323',monospace;color:#dde0ff;font-size:1.05rem;display:none}
.br-mg.on{display:flex}
.br-mg .title{font-family:'Press Start 2P',monospace;font-size:0.8rem;color:#e87820;letter-spacing:0.15em;margin-bottom:0.4rem}
.br-mg .desc{color:#6668a0;margin-bottom:1rem;text-align:center;max-width:560px;font-size:1rem}
.br-mg .panel{background:#0a0a0a;border:2px solid #3a3c60;padding:1.2rem;margin-bottom:1rem;max-width:90%}
.br-mg input,.br-mg textarea{font-family:'Inconsolata',monospace;font-size:0.95rem;background:#000;color:#2ecc71;border:1px solid #3a3c60;padding:0.5rem;width:100%;outline:none}
.br-mg input:focus{border-color:#e87820}
.br-mg .timer{font-family:'Press Start 2P',monospace;color:#e74c3c;font-size:0.7rem;letter-spacing:0.1em;margin-top:0.6rem}
.br-mg .ok{color:#2ecc71}.br-mg .bad{color:#e74c3c}

/* memory madness CSS hardware parts */
.br-mm-board{position:relative;width:520px;height:300px;background:#070a14;border:2px solid #3a3c60;background-image:radial-gradient(circle at 0% 0%,rgba(26,188,156,0.08) 0,transparent 50%),repeating-linear-gradient(0deg,transparent 0,transparent 18px,rgba(46,204,113,0.05) 18px,rgba(46,204,113,0.05) 19px),repeating-linear-gradient(90deg,transparent 0,transparent 18px,rgba(46,204,113,0.05) 18px,rgba(46,204,113,0.05) 19px)}
.br-mm-slot{position:absolute;border:2px dashed rgba(232,120,32,0.4);background:rgba(232,120,32,0.06);display:flex;align-items:center;justify-content:center;font-family:'Press Start 2P',monospace;font-size:0.4rem;color:#6668a0;letter-spacing:0.05em;text-align:center;line-height:1.4}
.br-mm-slot.over{background:rgba(232,120,32,0.18);border-color:#e87820}
.br-mm-slot.filled{border-style:solid;border-color:#2ecc71;background:transparent}
.br-mm-tray{display:flex;gap:0.4rem;flex-wrap:wrap;justify-content:center;margin-top:0.6rem;width:520px}
.br-mm-part{cursor:grab;user-select:none;position:relative;transition:transform 0.18s}
.br-mm-part.in-board{position:absolute;cursor:default}
.br-mm-part:active{cursor:grabbing}
.br-mm-part:hover{transform:scale(1.06);filter:brightness(1.2)}
.br-mm-part::after{content:attr(data-name);position:absolute;bottom:-13px;left:50%;transform:translateX(-50%);font-family:'Press Start 2P',monospace;font-size:0.4rem;color:#dde0ff;white-space:nowrap;letter-spacing:0.05em;pointer-events:none;opacity:0.85}
/* ESP32-32E: black square w/ silver shield */
.br-mm-part.esp{width:60px;height:60px;background:linear-gradient(135deg,#1a1a22,#000);border:1px solid #444;clip-path:polygon(0 0,100% 0,100% 100%,0 100%)}
.br-mm-part.esp::before{content:'';position:absolute;inset:8px;background:linear-gradient(135deg,#888,#444 50%,#222);clip-path:polygon(0 0,100% 0,100% 100%,0 100%)}
/* ST7796U screen: glossy dark rectangle */
.br-mm-part.scr{width:120px;height:80px;background:linear-gradient(180deg,#0a0a18,#030308);border:3px solid #1a1a22;box-shadow:inset 0 0 12px rgba(26,188,156,0.4)}
.br-mm-part.scr::before{content:'DASH OS';position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:'Press Start 2P',monospace;font-size:0.45rem;color:#e87820;letter-spacing:0.2em;opacity:0.7}
/* SD slot */
.br-mm-part.sd{width:48px;height:36px;background:linear-gradient(135deg,#2a2a36,#0a0a14);border:1px solid #444;clip-path:polygon(0 0,100% 0,100% 80%,80% 100%,0 100%)}
.br-mm-part.sd::before{content:'';position:absolute;left:6px;right:6px;top:6px;bottom:6px;background:repeating-linear-gradient(90deg,#666 0,#666 2px,transparent 2px,transparent 5px)}
/* USB-C */
.br-mm-part.usb{width:40px;height:18px;background:linear-gradient(180deg,#888,#444);border-radius:9px;border:1px solid #222}
.br-mm-part.usb::before{content:'';position:absolute;inset:3px 5px;background:#0a0a14;border-radius:5px}
/* RGB LED */
.br-mm-part.rgb{width:22px;height:22px;background:radial-gradient(circle,#fff 10%,#e74c3c 30%,#2ecc71 60%,#3498db 100%);border-radius:50%;border:2px solid #1a1a22;box-shadow:0 0 12px rgba(255,255,255,0.5);animation:brLed 1.5s linear infinite}
@keyframes brLed{0%{box-shadow:0 0 12px #e74c3c}33%{box-shadow:0 0 12px #2ecc71}66%{box-shadow:0 0 12px #3498db}100%{box-shadow:0 0 12px #e74c3c}}
/* button (reset/boot) */
.br-mm-part.btn{width:18px;height:18px;background:radial-gradient(circle at 35% 35%,#666,#222);border-radius:50%;border:1px solid #111;box-shadow:inset 0 -2px 4px rgba(0,0,0,0.5)}

.br-mm-result{font-family:'Press Start 2P',monospace;font-size:0.7rem;color:#2ecc71;margin-top:0.6rem;min-height:1em}

/* sample chop rhythm */
.br-rh{display:grid;grid-template-columns:repeat(4,80px);gap:0.6rem;margin:0.6rem 0}
.br-rh .lane{height:200px;background:#101120;border:1px solid #3a3c60;position:relative;overflow:hidden}
.br-rh .lane.hit{background:#1a3030;border-color:#1abc9c}
.br-rh .lane .key{position:absolute;bottom:6px;left:50%;transform:translateX(-50%);font-family:'Press Start 2P',monospace;font-size:0.7rem;color:#e87820;letter-spacing:0.1em;padding:0.3rem 0.5rem;background:#0a0a0a;border:1px solid #e87820}
.br-rh .lane .target{position:absolute;left:8px;right:8px;bottom:38px;height:3px;background:#e87820;box-shadow:0 0 8px #e87820}
.br-rh .note{position:absolute;left:8px;right:8px;height:14px;background:linear-gradient(180deg,#1abc9c,#0e8a70);border:1px solid #fff;border-radius:2px}
.br-rh .note.h{background:linear-gradient(180deg,#2ecc71,#1a9e55);box-shadow:0 0 12px #2ecc71}
.br-rh .note.m{background:linear-gradient(180deg,#e87820,#c05e10)}
.br-rh .score{font-family:'Press Start 2P',monospace;font-size:0.7rem;letter-spacing:0.1em;color:#dde0ff}

/* clone game terminal */
.br-term{font-family:'Inconsolata',monospace;background:#000;border:1px solid #2ecc71;padding:0.8rem;color:#2ecc71;width:560px;max-width:90vw;font-size:0.95rem;line-height:1.5}
.br-term .pr{color:#e87820}
.br-term .target{color:#6668a0}
.br-term .ok{color:#2ecc71}
.br-term .typed{color:#dde0ff;background:rgba(46,204,113,0.08)}

/* reward modal */
.br-reward{padding:2rem;border:2px solid #e87820;background:#0a0a0a;max-width:500px;text-align:center;animation:brCardIn 0.4s cubic-bezier(0.34,1.56,0.64,1)}
.br-reward .ico{font-size:2.4rem;color:#e87820;font-family:'Press Start 2P',monospace;margin-bottom:0.6rem;letter-spacing:0.1em}
.br-reward .ttl{color:#1abc9c;font-family:'Press Start 2P',monospace;font-size:0.8rem;letter-spacing:0.12em;margin-bottom:0.5rem}

.br-fx-flash{position:absolute;inset:0;background:#fff;z-index:7;pointer-events:none;opacity:0;mix-blend-mode:screen}
.br-fx-invert{position:absolute;inset:0;z-index:7;pointer-events:none;mix-blend-mode:difference;background:#fff;opacity:0;transition:opacity 0.2s}
.br-fx-invert.on{opacity:1}

/* mobile shrink */
@media (max-width:720px){
  .br-hud{font-size:0.45rem}
  .br-hud .bar{width:100px}
  .br-hud .boss-bar{width:50%}
  .br-overlay h1{font-size:1.1rem}
  .br-mg .panel{padding:0.7rem}
  .br-mm-board{width:90vw;height:60vw;max-height:300px}
  .br-rh{grid-template-columns:repeat(4,18vw);gap:0.3rem}
}
`;

const styleEl=document.createElement('style');
styleEl.id='br-style';
styleEl.textContent=css;
document.head.appendChild(styleEl);

/* ──────────── DOM injection ──────────── */
const $=(s,r=document)=>r.querySelector(s);
const make=(tag,attrs={},...kids)=>{const e=document.createElement(tag);for(const k in attrs){if(k==='style')Object.assign(e.style,attrs[k]);else if(k==='cls')e.className=attrs[k];else if(k.startsWith('on'))e.addEventListener(k.slice(2),attrs[k]);else e.setAttribute(k,attrs[k]);}for(const k of kids){if(k==null)continue;e.append(k.nodeType?k:document.createTextNode(k));}return e;};

/* portal button (always on the site) */
const portal=make('button',{id:'br-portal',title:'Enter Boss Rush'},make('span',{cls:'blk'}),'BOSS_RUSH');
portal.addEventListener('click',()=>showBIOS());

/* BIOS */
const bios=make('div',{cls:'br-bios',style:{display:'none'}});
function buildBIOS(){
  bios.innerHTML='';
  const mk=(t,d=0,extra={})=>{const e=make('div',{cls:'ln',style:{animationDelay:d+'ms',...extra.style||{}},...(extra.attrs||{})},t);return e;};
  bios.append(make('div',{cls:'crt'}));
  bios.append(make('div',{cls:'scan'}));
  bios.append(make('div',{cls:'h ln',style:{animationDelay:'0ms'}},'DASH-OS BIOS — POST'));
  const lines=[
    'CPU: ESP32-S3 @ 240MHz   MEM: 8MB PSRAM   ROM: 16MB',
    'detecting peripherals...... ',
    'ST7796U LCD ...... [OK]',
    'SD CARD ...... [OK]',
    'BLUETOOTH ...... [OK]',
    'PEANUT-GB ...... [OK]',
    'CAT_INPUT (auggie+otto) ...... [PURRING]',
    '',
    'select boot device:',''];
  let d=80;
  lines.forEach(l=>{bios.append(mk(l||' ',d));d+=70;});
  const f1=make('div',{cls:'opt f1',onclick:()=>closeBIOS('site')},make('b',{},'F1'),' → BOOT DASH_OS  (normal site)');
  const f2=make('div',{cls:'opt f2',onclick:()=>closeBIOS('game')},make('b',{},'F2'),' → ENTER BOSS_RUSH  (minigame)');
  bios.append(f1);bios.append(f2);
  bios.append(make('div',{cls:'footer'},'press F1 / F2 — or click. (esc to dismiss)'));
}

/* main shell */
const shell=make('div',{cls:'br-root'});
const stage=make('div',{cls:'br-stage'});
const cv=make('canvas',{width:W*PX,height:H*PX});
const fxflash=make('div',{cls:'br-fx-flash'});
const fxinvert=make('div',{cls:'br-fx-invert'});
const scanlines=make('div',{cls:'scanlines'});
const vignette=make('div',{cls:'vignette'});
stage.append(cv,fxflash,fxinvert,scanlines,vignette);

/* HUD */
const hud=make('div',{cls:'br-hud'});
const hudL=make('div',{cls:'l'},
  make('div',{},make('span',{cls:'lbl'},'HP '),make('span',{cls:'stat',id:'br-hp-num'},'100')),
  make('div',{cls:'bar hp',id:'br-hp'},make('i',{style:{width:'100%'}})),
  make('div',{},make('span',{cls:'lbl'},'EN '),make('span',{cls:'stat cy',id:'br-en-num'},'100')),
  make('div',{cls:'bar en',id:'br-en'},make('i',{style:{width:'100%'}}))
);
const hudC=make('div',{cls:'c',id:'br-boss-wrap',style:{display:'none'}},
  make('div',{cls:'boss-name',id:'br-boss-name'},''),
  make('div',{cls:'boss-bar',id:'br-boss'},make('i',{style:{width:'100%'}}))
);
const hudR=make('div',{cls:'r',style:{textAlign:'right'}},
  make('div',{},make('span',{cls:'lbl'},'BOSS '),make('span',{cls:'stat or',id:'br-boss-num'},'1/10')),
  make('div',{},make('span',{cls:'lbl'},'THEME '),make('span',{cls:'stat or',id:'br-theme-tag'},'ORANGE')),
  make('div',{},make('span',{cls:'lbl'},'CMB '),make('span',{cls:'stat',id:'br-combo'},'x0'))
);
hud.append(hudL,hudC,hudR);
stage.append(hud);

const exitBtn=make('button',{id:'br-exit',title:'KILL PROCESS — exit to site',onclick:()=>confirmExit()},'KILL PROCESS');
stage.append(exitBtn);

const byteTag=make('div',{id:'br-byte-tag',style:{display:'none'}},'');
stage.append(byteTag);

/* overlays */
const ovMenu=make('div',{cls:'br-overlay'},
  make('h1',{},'BOSS RUSH'),
  make('h2',{},'10 BOSSES • 7 MINIGAMES • 14 THEMES'),
  make('div',{cls:'sub'},'every boss in DASH OS’s nightmare. cleared start to finish.'),
  make('button',{cls:'btn p',onclick:()=>startRun()},'> START RUN'),
  make('button',{cls:'btn',onclick:()=>showThemes()},'> THEMES'),
  make('button',{cls:'btn',onclick:()=>showHelp()},'> HOW TO PLAY'),
  make('button',{cls:'btn d',onclick:()=>confirmExit()},'> EXIT TO SITE')
);
ovMenu.id='br-menu';

const ovCard=make('div',{cls:'br-overlay'});
ovCard.id='br-card';

const ovReward=make('div',{cls:'br-overlay'});
ovReward.id='br-reward';

const ovWin=make('div',{cls:'br-overlay'},
  make('h1',{style:{color:'#2ecc71'}},'RUN CLEARED'),
  make('h2',{},'10 / 10 BOSSES'),
  make('div',{cls:'sub',id:'br-win-stats'},''),
  make('button',{cls:'btn p',onclick:()=>{S.bossIdx=0;startRun();}},'> NEW GAME+'),
  make('button',{cls:'btn',onclick:()=>menu()},'> MAIN MENU'),
  make('button',{cls:'btn d',onclick:()=>confirmExit()},'> EXIT TO SITE')
);
ovWin.id='br-win';

const ovOver=make('div',{cls:'br-overlay'},
  make('h1',{style:{color:'#e74c3c'}},'KERNEL PANIC'),
  make('h2',{id:'br-over-h2'},'YOU DIED'),
  make('div',{cls:'sub',id:'br-over-byte'},''),
  make('button',{cls:'btn p',onclick:()=>retryBoss()},'> RETRY BOSS'),
  make('button',{cls:'btn',onclick:()=>menu()},'> MAIN MENU'),
  make('button',{cls:'btn d',onclick:()=>confirmExit()},'> EXIT TO SITE')
);
ovOver.id='br-over';

const ovHelp=make('div',{cls:'br-overlay'},
  make('h1',{},'HOW TO PLAY'),
  make('div',{cls:'sub',style:{maxWidth:'600px'}},
    'WASD or ARROWS — move. SHIFT — dash. MOUSE — aim. CLICK or SPACE — shoot.\n'+
    'E — special (theme-dependent). ESC — pause.\n\n'+
    'each boss has a passive + 3 unique attacks. some require positioning, others bullet-dodging. '+
    'minigames trigger between bosses — clear them for upgrades. '+
    'unlock themes by completing quests; prestige tiers double their effect.'
  ),
  make('button',{cls:'btn p',onclick:()=>menu()},'> BACK')
);
ovHelp.id='br-help';
[...Array(6)].forEach(()=>{});

const ovThemes=make('div',{cls:'br-overlay'},
  make('h1',{},'THEME CODEX'),
  make('h2',{},'14 themes • base • prestige • mythic'),
  make('div',{cls:'br-themes',id:'br-theme-grid'}),
  make('div',{cls:'sub',id:'br-theme-desc',style:{minHeight:'2em'}},''),
  make('button',{cls:'btn p',onclick:()=>menu()},'> BACK')
);
ovThemes.id='br-themes';

stage.append(ovMenu,ovCard,ovReward,ovWin,ovOver,ovHelp,ovThemes);

/* minigame overlay */
const ovMG=make('div',{cls:'br-mg',id:'br-mg'});
stage.append(ovMG);

shell.append(stage);
function attachToBody(){document.body.append(portal,shell,bios);}
if(document.body)attachToBody();else document.addEventListener('DOMContentLoaded',attachToBody,{once:true});

const ctx=cv.getContext('2d');
ctx.imageSmoothingEnabled=false;

/* ──────────── INPUT ──────────── */
window.addEventListener('keydown',e=>{
  const k=e.key.toLowerCase();
  if(bios.style.display!=='none'){
    if(e.key==='F1'||k==='1'){e.preventDefault();closeBIOS('site');}
    else if(e.key==='F2'||k==='2'){e.preventDefault();closeBIOS('game');}
    else if(k==='escape'){closeBIOS('cancel');}
    return;
  }
  if(!shell.classList.contains('on'))return;
  S.keys[k]=1;
  if(k==='escape'){togglePause();}
  if(k===' '||k==='spacebar'){e.preventDefault();}
});
window.addEventListener('keyup',e=>{S.keys[e.key.toLowerCase()]=0;});
cv.addEventListener('mousemove',e=>{const r=cv.getBoundingClientRect();S.mouse.x=(e.clientX-r.left)*W/r.width;S.mouse.y=(e.clientY-r.top)*H/r.height;});
cv.addEventListener('mousedown',e=>{e.preventDefault();S.mouse.down=true;});
cv.addEventListener('mouseup',()=>{S.mouse.down=false;});
cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('touchstart',e=>{e.preventDefault();const t=e.touches[0];const r=cv.getBoundingClientRect();S.mouse.x=(t.clientX-r.left)*W/r.width;S.mouse.y=(t.clientY-r.top)*H/r.height;S.mouse.down=true;},{passive:false});
cv.addEventListener('touchmove',e=>{e.preventDefault();const t=e.touches[0];const r=cv.getBoundingClientRect();S.mouse.x=(t.clientX-r.left)*W/r.width;S.mouse.y=(t.clientY-r.top)*H/r.height;},{passive:false});
cv.addEventListener('touchend',()=>{S.mouse.down=false;});

/* ──────────── AUDIO (web-audio blips) ──────────── */
let AC=null;
function getAC(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){}}return AC;}
function blip(f=440,d=0.06,t='square',v=0.08){if(S.sfxMute)return;const c=getAC();if(!c)return;const o=c.createOscillator(),g=c.createGain();o.type=t;o.frequency.value=f;g.gain.value=v;o.connect(g).connect(c.destination);o.start();g.gain.setValueAtTime(v,c.currentTime);g.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+d);o.stop(c.currentTime+d);}
const sShoot=()=>blip(880,0.04,'square',0.05);
const sHit  =()=>blip(180,0.08,'sawtooth',0.07);
const sHurt =()=>blip(120,0.18,'square',0.1);
const sKill =()=>{blip(440,0.08,'square',0.08);setTimeout(()=>blip(660,0.08,'square',0.08),60);setTimeout(()=>blip(880,0.16,'square',0.08),120);};
const sUI   =()=>blip(660,0.04,'square',0.04);
const sUnlock=()=>{blip(523,0.08,'triangle',0.08);setTimeout(()=>blip(659,0.08,'triangle',0.08),80);setTimeout(()=>blip(784,0.16,'triangle',0.08),160);setTimeout(()=>blip(1046,0.24,'triangle',0.08),240);};

/* ──────────── PIXEL HELPERS ──────────── */
function pix(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x*PX|0,y*PX|0,(w*PX)|0,(h*PX)|0);}
function rect(x,y,w,h,c){pix(x,y,w,h,c);}
function dotc(x,y,r,c){ctx.fillStyle=c;ctx.beginPath();ctx.arc(x*PX,y*PX,r*PX,0,Math.PI*2);ctx.fill();}
function ringc(x,y,r,c,lw=1){ctx.strokeStyle=c;ctx.lineWidth=lw*PX;ctx.beginPath();ctx.arc(x*PX,y*PX,r*PX,0,Math.PI*2);ctx.stroke();}
function lineP(x1,y1,x2,y2,c,lw=1){ctx.strokeStyle=c;ctx.lineWidth=lw*PX;ctx.beginPath();ctx.moveTo(x1*PX,y1*PX);ctx.lineTo(x2*PX,y2*PX);ctx.stroke();}
function txt(s,x,y,c='#dde0ff',sz=6,align='left'){ctx.fillStyle=c;ctx.font=(sz*PX)+'px "Press Start 2P", monospace';ctx.textAlign=align;ctx.textBaseline='top';ctx.fillText(s,x*PX,y*PX);}

/* draw bitmap (string array, '0' = transparent) */
function drawBitmap(arr,x,y,palette,scale=1){
  for(let r=0;r<arr.length;r++){
    const row=arr[r];
    for(let cidx=0;cidx<row.length;cidx++){
      const ch=row[cidx];if(ch==='0'||ch===' ')continue;
      const col=palette[ch]||'#fff';
      ctx.fillStyle=col;
      ctx.fillRect((x+cidx*scale)*PX|0,(y+r*scale)*PX|0,(scale*PX)|0,(scale*PX)|0);
    }
  }
}

/* ──────────── SPRITES ──────────── */
const SPR={};
SPR.player=[
  '00aaa00',
  '0aabba0',
  'aabbbba',
  'awbbbwa',
  'aabbbba',
  '0acccaa',
  '0c000c0'
];
const PAL_P=()=>{const t=THEMES[S.theme];return {a:t.c,b:t.c2,w:'#fff',c:'#1a1a22'};};

SPR.bullet=[' aa ','aaaa','aaaa',' aa '];
SPR.ebullet=['  rr  ','rrrrrr','rrrrrr','  rr  '];

/* boss sprites — 16w, rich palette with K shadow / H highlight / W eye / e iris / x mouth */
SPR.kernel=[
  'KKKKKKKKKKKKKKKK',
  'KRrrrrrrrrrrrrRK',
  'KrHrHrHrHrHrHrrK',
  'KKKKKKKKKKKKKKKK',
  'KKHWWWWWWWWWWHKK',
  'KKWeWWWWWWWWeWKK',
  'KKWeWeWWWWeWeWKK',
  'KKWWWWWxxWWWWWKK',
  'KKWWWxxxxxxWWWKK',
  'KKWWxxxxxxxxWWKK',
  'KKWxxxxxxxxxxWKK',
  'KKHWWWWWWWWWWHKK',
  'KKKKKKKKKKKKKKKK',
  'KrHrHrHrHrHrHrrK',
  'KRrrrrrrrrrrrrRK',
  'KKKKKKKKKKKKKKKK'
];
SPR.spi=[
  '0HK000000000HK00',
  '0HK000000000HK00',
  '0HK000000000HK00',
  'KRKKKKKKKKKKKRKK',
  'KRRRRRRRRRRRRRRK',
  'KRYYYYYYYYYYYYRK',
  'KRYrrrrrrrrrrYRK',
  'KRYrYWWeeWeeWYRK',
  'KRYrYWeeWWWeWYRK',
  'KRYrYWWWWxxxWYRK',
  'KRYrYxxxxxxxxYRK',
  'KRYrYWWWWxxxWYRK',
  'KRYrYYYYYYYYYYRK',
  'KRYrrrrrrrrrrYRK',
  'KRRRRRRRRRRRRRRK',
  'KKKKKKKKKKKKKKKK'
];
SPR.wsod=[
  '0HHHHHHHHHHHHHH0',
  'HRWWWWWWWWWWWWRH',
  'HWWWHWWWWWWWHWWH',
  'HWWeOWWWWWWWeOWH',
  'HWWeWWWWWWWWeWWH',
  'HWxxWxWxxxWWxWxH',
  'HWWxWWxxxWWxxWWH',
  'HWxxxxWWxxxxxxWH',
  'HWWWWWWWWWWWWWWH',
  'HWxxWxxWxxxxWxxH',
  'HWWWWWWWWWWWWWWH',
  'HRWWWWWWWWWWWWRH',
  '0HHHHHHHHHHHHHH0',
  '0K0K0K0K0K0K0K00'
];
SPR.slug=[
  '0KKKKKKKKKKKKKK0',
  'KRrrrrrrrrrrrrRK',
  'KRrWeWWWWWWeWWrK',
  'KRrWeWWWWWWeWWrK',
  'KRrrrrrrrrrrrrRK',
  'KRrHrrrrrrrrHrRK',
  'KRrrHrrrrrrHrrRK',
  'KRrrrHrrrrHrrrRK',
  'KRrrrrHrrHrrrrRK',
  'KRrrrrrHHrrrrrRK',
  'KRrrrrrrrrrrrrRK',
  '0KKKKKKKKKKKKKK0'
];
SPR.card=[
  'KKKKKKKKKKKKKKKK',
  'KRrrrrrrrrrrrrRK',
  'KRrxxrrrrrrxxrRK',
  'KRrxxrrrrrrxxrRK',
  'KRrrrrrxxrrrrrRK',
  'KRrrrrxxxxrrrrRK',
  'KRrxxrrrrrrxxrRK',
  'KRrxxrrrrrrxxrRK',
  'KRRRRRRRRRRRRRRK',
  'KK00KK00KK00KK0K',
  '0K00K00KK00K00K0',
  '0HHHHHHHHHHHHHH0'
];
SPR.ghost=[
  '0000HHHHHHHH0000',
  '000HRrrrrrrRH000',
  '00HRrWWWWWWWWrRH',
  '0HRrWeeWWWWeeWrH',
  '0HRrWeeWWWWeeWrH',
  '0HRrWWWWWWWWWWrH',
  '0HRrWxxxxxxxxWrH',
  '0HRrWWWWWWWWWWrH',
  '0HRrWMMMWWMMMWrH',
  '0HRrWWWWWWWWWWrH',
  '0HRrrrrrrrrrrrrH',
  '0HRRRRRRRRRRRRRH',
  '0HRRRRRRRRRRRRRH',
  '0H00RRR00RRR00H0',
  '0000HH000HH00000'
];
SPR.beetle=[
  'HK000000000000KH',
  '0HK0000000000KH0',
  '00HKKKKKKKKKKH00',
  '00KRRRRRRRRRRK00',
  '0KRRWWeeeeWWRRK0',
  '0KRR=========RK0',
  'KRRRrrrr==rrRRRK',
  'KRR===rr==rr==RK',
  'KRRrr==rr==rrrRK',
  'KRRrrr=====rrrRK',
  'KRRrrrrrrrrrrRRK',
  '0KRRRRRRRRRRRRK0',
  '00KKK0K0K0K0KKK0',
  '00000K000K000000'
];
SPR.demon=[
  '0:0000000000000:',
  '::00000000000000',
  '0::0:0::::0:0::0',
  '0:::::rrrr::::::',
  '0:rRRrrrrrrRRr:0',
  'RRrrYYrrrrYYrrRR',
  'RRrrYYrrrrYYrrRR',
  'RRrrrr$$$$rrrrRR',
  'RRrrr$$WW$$rrrRR',
  'RRrrrr$$$$rrrrRR',
  'RRrrrrrrrrrrrrRR',
  'RRrrr=======rrRR',
  'RRrr=========rRR',
  '0RRrrrrrrrrrrRR0',
  '00RRRRRRRRRRRR00',
  '000:0::0::0::000'
];
SPR.iset=[
  'KKKKKKKKKKKKKKKK',
  'KYYYYYYYYYYYYYYK',
  'KYyyyyyyyyyyyyYK',
  'KYy$$YY$$YY$$yYK',
  'KYy$HY$$$Y$H$yYK',
  'KYyyyyyyyyyyyyYK',
  'KYy==yy=====yyYK',
  'KYyy========yyYK',
  'KYy=yyy==yyy=yYK',
  'KYy=yyy==yyy=yYK',
  'KYyy========yyYK',
  'KYy==yy=====yyYK',
  'KYyyyyyyyyyyyyYK',
  'KYyHHyyyyyyHHyYK',
  'KYYYYYYYYYYYYYYK',
  'KKKKKKKKKKKKKKKK'
];
SPR.phantom=[
  '0000KKKKKKKK0000',
  '000KKKKKKKKKKK00',
  '00KKKKKKKKKKKKK0',
  '0KKKHHKKKKHHKKK0',
  '0KKKHHKKKKHHKKK0',
  '0KKKKKKKKKKKKKK0',
  '0KKKKKHHHHKKKKK0',
  '0KKKHHHHHHHHKKK0',
  '0KKKKHHHHHHKKKK0',
  '0KKKKKKKKKKKKKK0',
  'HHKKKKKKKKKKKKHH',
  'HHKKKKKKKKKKKKHH',
  '0HHKKKKKKKKKKHH0',
  '00HHKKKKKKKKHH00',
  '000HHK00000HH000',
  '0000HH00000HH000',
  '00000H00000H0000',
  '0000K00000K0000K'
];

function bossPalette(b){return {
  R:b.col,r:b.col2,K:'#0a0a14',H:'#fff',W:'#f0f0ff',
  e:'#7c1010',x:'#1a1a22','=':'#1a1a22',':':'#e74c3c',
  Y:'#f1c40f',y:'#7a6300',O:'#e87820',o:'#c05e10',
  M:'#ff3df0',m:'#a01da8',T:'#1abc9c',t:'#0e8a70',
  G:'#2ecc71',g:'#1a9e55',B:'#3498db',b:'#1f5d8a',
  P:'#9b59b6',p:'#6c3483','$':'#ffd54a','#':'#888','+':'#666','*':'#fff',
  c:b.col,C:b.col2,A:'#fff'
};}

/* ──────────── PLAYER ──────────── */
class Player{
  constructor(){
    this.x=W/2;this.y=H/2;this.w=7;this.h=7;this.r=4;
    this.hp=100;this.maxHp=100;
    this.en=100;this.maxEn=100;
    this.shootCd=0;this.dashCd=0;this.eCd=0;
    this.iframes=0;
    this.invertCtl=false;
    this.frozen=0;
    this.rooted=0;
    this.atkSpd=1;this.def=1;this.move=1;this.regen=0;this.cdMul=1;
    this.applyTheme();
    this.shootInterval=18;
  }
  applyTheme(){
    const t=THEMES[S.theme];
    this.atkSpd=1;this.def=1;this.move=1;this.regen=0;this.cdMul=1;this.maxEn=100;
    const apply=(perk,m)=>{
      if(perk==='atkSpd')this.atkSpd=1+0.25*m;
      if(perk==='def')this.def=1-0.2*m;
      if(perk==='move')this.move=1+0.25*m;
      if(perk==='regen')this.regen=1*m;
      if(perk==='energy')this.maxEn=100*(1+0.5*m);
      if(perk==='cd')this.cdMul=1-0.25*m;
    };
    if(t.perk==='all'){apply('atkSpd',1);apply('def',1);apply('move',1);apply('regen',1);apply('energy',1);apply('cd',1);}
    else if(t.perk==='rainbow'){apply('atkSpd',2);apply('move',2);apply('cd',2);apply('def',1);apply('regen',1);}
    else apply(t.perk,t.mul);
    this.en=Math.min(this.en,this.maxEn);
  }
  update(dt){
    if(this.frozen>0){this.frozen-=dt;this.dx=0;this.dy=0;return;}
    let dx=0,dy=0;
    const inv=this.invertCtl?-1:1;
    if(S.keys['w']||S.keys['arrowup'])dy-=1;
    if(S.keys['s']||S.keys['arrowdown'])dy+=1;
    if(S.keys['a']||S.keys['arrowleft'])dx-=1;
    if(S.keys['d']||S.keys['arrowright'])dx+=1;
    dx*=inv;dy*=inv;
    if(this.rooted>0){this.rooted-=dt;dx=dy=0;}
    this.dx=dx;this.dy=dy;
    const len=Math.hypot(dx,dy)||1;
    let slowFactor=1;
    for(const z of S.zones){if(z.kind==='leak'&&dist(z,this)<z.r)slowFactor=Math.min(slowFactor,z.slow);}
    const sp=80*this.move*S.fpsScale*slowFactor;
    if(S.keys['shift']&&this.dashCd<=0&&(dx||dy)){
      const near=S.ebullets.some(b=>dist(b,this)<14);
      this.x+=dx/len*40;this.y+=dy/len*40;
      this.dashCd=0.6*this.cdMul;
      this.iframes=0.25;
      if(near)S.quests.dashDodges++;
      sUI();
      for(let i=0;i<8;i++)particle(this.x,this.y,'#fff',16);
    }
    this.x+=dx/len*sp*dt;this.y+=dy/len*sp*dt;
    this.x=clamp(this.x,4,W-4);this.y=clamp(this.y,4,H-4);
    if(this.dashCd>0)this.dashCd-=dt;
    if(this.eCd>0)this.eCd-=dt;
    if(this.shootCd>0)this.shootCd-=dt;
    if(this.iframes>0)this.iframes-=dt;
    if(this.regen>0)this.heal(this.regen*dt);
    this.en=Math.min(this.maxEn,this.en+12*dt);
    if((S.mouse.down||S.keys[' '])&&this.shootCd<=0){
      const a=ang(this,S.mouse);
      this.shoot(a);
      this.shootCd=(0.18/this.atkSpd);
    }
    if(S.keys['e']&&this.eCd<=0&&this.en>=30){this.useSpecial();}
  }
  shoot(a){
    S.bullets.push({x:this.x,y:this.y,vx:Math.cos(a)*220,vy:Math.sin(a)*220,r:3,t:1.2,dmg:8});
    sShoot();
  }
  useSpecial(){
    S.quests.specials++;
    const t=THEMES[S.theme];
    let perk=t.perk;
    if(perk==='rainbow'){const arr=['atkSpd','def','move','regen','energy','cd'];perk=arr[(S.frame/60|0)%arr.length];}
    if(perk==='atkSpd'){
      // wave attack - 12 bullets in a ring
      for(let i=0;i<14;i++){const a=Math.PI*2*i/14;S.bullets.push({x:this.x,y:this.y,vx:Math.cos(a)*200,vy:Math.sin(a)*200,r:3,t:1.1,dmg:10,wave:1});}
      this.eCd=4*this.cdMul;this.en-=30;
    } else if(perk==='def'){
      this.iframes=2;this.eCd=8*this.cdMul;this.en-=40;sUI();byteSay('SHIELD UP.');
    } else if(perk==='move'){
      this.iframes=0.4;this.x+=Math.cos(ang(this,S.mouse))*60;this.y+=Math.sin(ang(this,S.mouse))*60;this.eCd=2*this.cdMul;this.en-=20;
    } else if(perk==='regen'){
      this.heal(35);this.eCd=8*this.cdMul;this.en-=40;sUI();
    } else if(perk==='energy'){
      // big shot
      const a=ang(this,S.mouse);
      S.bullets.push({x:this.x,y:this.y,vx:Math.cos(a)*240,vy:Math.sin(a)*240,r:7,t:1.5,dmg:35,big:1});
      this.eCd=2*this.cdMul;this.en-=30;
    } else if(perk==='cd'){
      // freeze enemy bullets for 2s
      S.ebullets.forEach(b=>{b.frozen=2.5;});
      this.eCd=10*this.cdMul;this.en-=40;byteSay('TIME, BABY.');
    } else if(perk==='all'){
      // white = combined: shield + heal + wave
      this.iframes=1.2;this.heal(20);
      for(let i=0;i<10;i++){const a=Math.PI*2*i/10;S.bullets.push({x:this.x,y:this.y,vx:Math.cos(a)*200,vy:Math.sin(a)*200,r:3,t:1,dmg:10});}
      this.eCd=10*this.cdMul;this.en-=60;byteSay('WHITE OUT.');
    }
    sUnlock();
  }
  heal(n){const before=this.hp;this.hp=Math.min(this.maxHp,this.hp+n);S.quests.healed+=Math.max(0,this.hp-before);}
  hit(n){
    if(this.iframes>0)return;
    this.hp-=n*this.def;
    this.iframes=0.45;
    S.bossClean=false;
    S.shake=8;sHurt();
    if(Math.random()<0.4)byteSay(pickByte('hit'));
    if(this.hp<=0){this.hp=0;dieScreen();}
  }
  draw(){
    if(this.iframes>0&&Math.floor(S.frame/3)%2)return;
    const p=PAL_P();
    drawBitmap(SPR.player,this.x-3,this.y-3,p);
  }
}
function particle(x,y,c,life=20,vx=null,vy=null){
  S.particles.push({x,y,vx:vx??rand(-40,40),vy:vy??rand(-40,40),life,max:life,c});
}

/* ──────────── BOSS ──────────── */
class Boss{
  constructor(d){
    this.d=d;this.x=W/2;this.y=60;
    this.hp=d.hp;this.maxHp=d.hp;
    this.attackTimer=2;this.attackPhase=0;this.curAtk=null;
    this.passiveT=0;
    this.bankA=true; // for ghost
    this.usedAttacks=Object.create(null); // for iset
    this.armor=3; // for cardboard
    this.bootHealUsed=false;
    this.fpsLost=0;
    this.dashChargeT=0;this.illusions=[];
    this.tx=W/2;this.ty=60;this.moveT=0;
    this.flickerCd=0;
    this.spr=SPR[d.sprite];
    this.r=10;
  }
  update(dt){
    this.passiveT-=dt;
    // movement: drift toward random target
    this.moveT-=dt;
    if(this.moveT<=0){this.tx=rand(40,W-40);this.ty=rand(30,H/2-20);this.moveT=rand(2,4);}
    this.x+=(this.tx-this.x)*0.6*dt;
    this.y+=(this.ty-this.y)*0.6*dt;
    // passive
    this.runPassive(dt);
    // attack pacing
    this.attackTimer-=dt;
    if(this.attackTimer<=0&&!this.curAtk){
      const list=this.d.attacks;
      let aname;
      if(this.d.passive==='attackImmune'){
        const fresh=list.filter(n=>!this.usedAttacks[n]);
        aname=fresh.length?fresh[rint(0,fresh.length-1)]:list[rint(0,list.length-1)];
        this.usedAttacks[aname]=true;
      } else aname=list[rint(0,list.length-1)];
      this.startAttack(aname);
    }
    if(this.curAtk){this.curAtk.t-=dt;ATTACKS[this.curAtk.name].update(this,this.curAtk,dt);if(this.curAtk.t<=0){this.curAtk=null;this.attackTimer=rand(1.4,2.6);}}
  }
  runPassive(dt){
    const p=this.d.passive;
    if(p==='teleport10'){
      if(this.passiveT<=0){this.passiveT=10;this.x=this.tx=rand(60,W-60);this.y=this.ty=rand(30,H/2);for(let i=0;i<12;i++)particle(this.x,this.y,'#9b59b6',24);}
    } else if(p==='priorityShield'){
      // protocol pads spawn, only damage on pads
      if(this.passiveT<=0){this.passiveT=8;spawnPads();}
    } else if(p==='proximityBlur'){
      const d=dist(this,S.player);
      const blur=clamp(1-d/180,0,1);
      cv.style.filter=`blur(${blur*4}px)`;
    } else if(p==='fpsDrop'){
      // S.fpsScale set on hit
    } else if(p==='multiArmor'){
      // armor draws differently
    } else if(p==='bankSwap'){
      if(this.passiveT<=0){this.passiveT=4;this.bankA=!this.bankA;for(let i=0;i<10;i++)particle(this.x,this.y,'#ff3df0',24);}
    } else if(p==='bootHeal'){
      if(!this.bootHealUsed&&this.hp<=this.maxHp*0.5){this.bootHealUsed=true;this.hp=Math.min(this.maxHp,this.hp+this.maxHp*0.25);S.flash=0.4;byteSay('it RECOVERED. classic.');for(let i=0;i<30;i++)particle(this.x,this.y,'#2ecc71',40);}
    } else if(p==='discountResist'){
      // damage scaling done in hit()
    } else if(p==='attackImmune'){
      // tracked in update
    } else if(p==='staticDodge'){
      // dodge resolved in hit()
    }
  }
  startAttack(name){
    this.curAtk={name,t:ATTACKS[name].dur,phase:0,data:{}};
    ATTACKS[name].start(this,this.curAtk);
    byteSay(ATTACKS[name].byte||'');
  }
  hit(n){
    // priority shield: SPI only takes damage if player on pad
    if(this.d.passive==='priorityShield'){
      const onPad=S.zones.some(z=>z.kind==='pad'&&dist(z,S.player)<z.r);
      if(!onPad){blip(120,0.04,'square',0.04);return;}
    }
    if(this.d.passive==='bankSwap'){
      // only "on" body is hittable; offset
      // simple: hitbox already offset; we treat boss as in valid bank
    }
    if(this.d.passive==='discountResist'){
      // big shots = 50% reduced damage
      // hit() called with n already; we don't know the source. Approximate: every other hit half damage
      if(Math.random()<0.5)n*=0.5;
    }
    if(this.d.passive==='staticDodge'){
      const v=Math.hypot(S.player.dx||0,S.player.dy||0);
      if(v<0.05&&Math.random()<0.5){blip(220,0.03,'sine',0.04);particle(this.x,this.y,'#fff',12);return;}
    }
    if(this.d.passive==='multiArmor'&&this.armor>0){
      // chunk armor first
      this.hp-=n*0.5;
      if(this.hp<this.maxHp*(this.armor/4)){this.armor--;byteSay('armor layer cracked.');S.flash=0.2;}
      sHit();S.shake=4;
      if(this.hp<=0)this.die();
      return;
    }
    if(this.d.passive==='fpsDrop'){
      this.fpsLost++;S.fpsScale=Math.max(0.4,1-this.fpsLost*0.01);
    }
    this.hp-=n;sHit();S.shake=3;
    if(this.hp<=0)this.die();
  }
  die(){
    this.hp=0;
    for(let i=0;i<60;i++)particle(this.x+rand(-12,12),this.y+rand(-12,12),this.d.col,40);
    sKill();
    S.shake=14;S.flash=0.5;
    const elapsed=(now()-S.bossStartT)/1000;
    S.quests.enemies++;S.quests.wins++;S.quests.totalKills++;
    if(elapsed<60)S.quests.fastWin++;
    if(S.bossClean)S.quests.cleanKill++;
    save();
    byteSay(pickByte('kill'));
    setTimeout(()=>onBossDefeated(),900);
  }
  draw(){
    if(this.flickerCd>0){this.flickerCd-=1/60;if(Math.floor(S.frame/3)%2===0)return;}
    const sw=this.spr[0].length, sh=this.spr.length;
    drawBitmap(this.spr,this.x-sw/2,this.y-sh/2,bossPalette(this.d));
    // bank ghost: draw both, only one solid
    if(this.d.passive==='bankSwap'){
      ctx.globalAlpha=0.35;
      drawBitmap(this.spr,this.x-sw/2+22,this.y-sh/2,bossPalette(this.d));
      ctx.globalAlpha=1;
    }
    // armor pips
    if(this.d.passive==='multiArmor'){
      for(let i=0;i<this.armor;i++){pix(this.x-sw/2+i*4,this.y-sh/2-6,3,3,'#a87830');}
    }
  }
}

function spawnPads(){
  S.zones=S.zones.filter(z=>z.kind!=='pad');
  for(let i=0;i<3;i++)S.zones.push({kind:'pad',x:rand(40,W-40),y:rand(H/2,H-30),r:18,life:7});
}

/* ──────────── ATTACK PRIMITIVES (data-driven boss attacks) ──────────── */
const ATTACKS={};

function eb(x,y,vx,vy,extra={}){S.ebullets.push({x,y,vx,vy,r:3,t:5,dmg:14,...extra});}
function warn(x,y,r,life,col='rgba(231,76,60,0.5)'){S.warns.push({x,y,r,life,max:life,col});}
function shockwave(x,y,maxR,life,col,dmg=12){S.zones.push({kind:'sw',x,y,r:1,maxR,life,max:life,col,dmg,hit:0});}

/* KERNEL */
ATTACKS.stackOverflow={dur:5.5,byte:'STACK OVERFLOW.',start:(b,a)=>{a.data.gap=rand(60,W-60);a.data.spawnT=0;},
  update:(b,a,dt)=>{a.data.spawnT-=dt;if(a.data.spawnT<=0){a.data.spawnT=0.18;
    for(let x=0;x<W;x+=10){if(Math.abs(x-a.data.gap)<26)continue;eb(x,-4,0,80,{r:3.5,dmg:10,kind:'code'});}
  }}};
ATTACKS.memoryLeak={dur:5,byte:'MEMORY LEAK.',start:(b,a)=>{a.data.spawnT=0;},
  update:(b,a,dt)=>{a.data.spawnT-=dt;if(a.data.spawnT<=0){a.data.spawnT=0.7;
    S.zones.push({kind:'leak',x:rand(40,W-40),y:rand(40,H-40),r:6,maxR:30,life:4,max:4,growth:6,slow:0.55});
  }}};
ATTACKS.hardCrash={dur:3.2,byte:'HARD CRASH INCOMING.',start:(b,a)=>{a.data.warned=false;a.data.flashed=false;},
  update:(b,a,dt)=>{
    if(!a.data.warned&&a.t<2.2){a.data.warned=true;}
    if(!a.data.flashed&&a.t<1.5){a.data.flashed=true;S.flash=0.8;
      // freeze if not moving
      const v=Math.hypot(S.player.dx||0,S.player.dy||0);
      if(v<0.05){S.player.frozen=1.2;S.player.hit(8);}
    }
  }};

/* SPI */
ATTACKS.misoLasers={dur:5,byte:'MISO/MOSI ENGAGED.',start:(b,a)=>{a.data.angle=0;},
  update:(b,a,dt)=>{a.data.angle+=dt*0.6;
    drawBeam(b.x,b.y,a.data.angle);
    drawBeam(b.x,b.y,a.data.angle+Math.PI/2);
    // dmg if near beam
    [a.data.angle,a.data.angle+Math.PI/2].forEach(an=>{
      const dxp=S.player.x-b.x,dyp=S.player.y-b.y;
      const tx=Math.cos(an),ty=Math.sin(an);
      const proj=dxp*tx+dyp*ty;if(proj<0||proj>300)return;
      const px=b.x+tx*proj,py=b.y+ty*proj;
      const d=Math.hypot(S.player.x-px,S.player.y-py);
      if(d<3)S.player.hit(10*dt*8);
    });
  }};
ATTACKS.clockCycle={dur:3.8,byte:'CLOCK CYCLE.',start:(b,a)=>{shockwave(b.x,b.y,140,3,'rgba(26,188,156,0.7)',16);},
  update:(b,a,dt)=>{}};
ATTACKS.pinScramble={dur:6,byte:'PIN SCRAMBLE.',start:(b,a)=>{a.data.pins=[];for(let i=0;i<10;i++){a.data.pins.push({x:rand(30,W-30),y:rand(40,H-30)});}a.data.linkT=0;},
  update:(b,a,dt)=>{a.data.linkT-=dt;if(a.data.linkT<=0){a.data.linkT=0.4;for(let i=0;i<5;i++){const p1=a.data.pins[rint(0,9)],p2=a.data.pins[rint(0,9)];if(p1===p2)continue;a.data.linkA={p1,p2,life:0.4};}}
    a.data.pins.forEach(p=>{ctx.fillStyle='#f1c40f';ctx.fillRect(p.x*PX-PX,p.y*PX-PX,PX*2,PX*2);});
    if(a.data.linkA){a.data.linkA.life-=dt;if(a.data.linkA.life>0){const{p1,p2}=a.data.linkA;lineP(p1.x,p1.y,p2.x,p2.y,'#1abc9c',1);
      // damage if on segment
      const v=segDist(S.player,p1,p2);if(v<4)S.player.hit(0.3);
    }}
  }};

/* WSOD */
ATTACKS.backlightBurn={dur:4,byte:'BACKLIGHT BURN.',start:(b,a)=>{a.data.angle=ang(b,S.player);},
  update:(b,a,dt)=>{a.data.angle+=(ang(b,S.player)-a.data.angle)*0.4*dt;drawWideBeam(b.x,b.y,a.data.angle,28);
    const dxp=S.player.x-b.x,dyp=S.player.y-b.y;const tx=Math.cos(a.data.angle),ty=Math.sin(a.data.angle);
    const proj=dxp*tx+dyp*ty;if(proj<0||proj>320)return;
    const px=b.x+tx*proj,py=b.y+ty*proj;const d=Math.hypot(S.player.x-px,S.player.y-py);if(d<14)S.player.hit(0.18);
  }};
ATTACKS.uninitVar={dur:4.5,byte:'UNINITIALIZED VARIABLE.',start:(b,a)=>{a.data.t=0;a.data.bs=[];for(let i=0;i<8;i++)a.data.bs.push({x:rand(30,W-30),y:rand(30,H-30),vx:rand(-50,50),vy:rand(-50,50)});},
  update:(b,a,dt)=>{a.data.bs.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;
    if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;
    const d=dist(p,S.player);
    if(d<100){ctx.fillStyle='rgba(255,255,255,'+(1-d/100)+')';ctx.beginPath();ctx.arc(p.x*PX,p.y*PX,3*PX,0,Math.PI*2);ctx.fill();}
    if(d<5)S.player.hit(0.4);
  });}};
ATTACKS.reflash={dur:5,byte:'RE-FLASH.',start:(b,a)=>{S.invertT=5;fxinvert.classList.add('on');},
  update:(b,a,dt)=>{if(a.t<=0){fxinvert.classList.remove('on');S.invertT=0;}}};

/* SLUG */
ATTACKS.fpsZone={dur:5,byte:'0.1 FPS ZONE.',start:(b,a)=>{S.zones.push({kind:'slowzone',x:b.x,y:b.y,r:50,life:5,max:5});}};
ATTACKS.rwSlam={dur:3,byte:'READ/WRITE SLAM.',start:(b,a)=>{a.data.warned=false;a.data.slammed=false;warn(S.player.x,S.player.y,40,1.4);},
  update:(b,a,dt)=>{if(!a.data.slammed&&a.t<1.6){a.data.slammed=true;const wp=S.warns.find(w=>w);if(wp&&dist(wp,S.player)<wp.r){S.player.frozen=1;S.player.hit(12);}}}};
ATTACKS.diskFragment={dur:4,byte:'DISK FRAGMENT.',start:(b,a)=>{for(let i=0;i<24;i++){const an=Math.PI*2*i/24;eb(b.x,b.y,Math.cos(an)*120,Math.sin(an)*120,{r:3,dmg:10});}}};

/* CARDBOARD */
ATTACKS.glueTrap={dur:4,byte:'HOT GLUE.',start:(b,a)=>{for(let i=0;i<5;i++)S.zones.push({kind:'glue',x:rand(40,W-40),y:rand(40,H-40),r:14,life:5,max:5});}};
ATTACKS.boxFold={dur:3.5,byte:'BOX FOLD!',start:(b,a)=>{a.data.tx=S.player.x;a.data.ty=S.player.y;a.data.rolled=false;warn(a.data.tx,a.data.ty,30,1.2);},
  update:(b,a,dt)=>{
    if(!a.data.rolled&&a.t<2.3){a.data.rolled=true;
      b.x=a.data.tx;b.y=a.data.ty;
      if(dist(b,S.player)<28)S.player.hit(20);
      shockwave(b.x,b.y,40,0.6,'rgba(168,120,48,0.6)',8);
    }
  }};
ATTACKS.craftCutter={dur:5,byte:'X-ACTO BLADES.',start:(b,a)=>{a.data.bs=[];for(let i=0;i<3;i++)a.data.bs.push({an:i*Math.PI*2/3,r:30,sp:rand(2,3.5)});},
  update:(b,a,dt)=>{a.data.bs.forEach(bl=>{bl.an+=dt*bl.sp;const x=b.x+Math.cos(bl.an)*bl.r,y=b.y+Math.sin(bl.an)*bl.r;ctx.fillStyle='#dde0ff';ctx.fillRect(x*PX-PX,y*PX-PX*2,PX*3,PX*4);
    if(Math.hypot(x-S.player.x,y-S.player.y)<5)S.player.hit(0.6);
  });}};

/* GHOST */
ATTACKS.cacheMiss={dur:4,byte:'CACHE MISS.',start:(b,a)=>{a.data.t=0;},
  update:(b,a,dt)=>{a.data.t-=dt;if(a.data.t<=0){a.data.t=0.4;
    const an=ang(b,S.player);
    eb(b.x,b.y,Math.cos(an)*100,Math.sin(an)*100,{r:3,dmg:10,tele:1.2});
  }}};
ATTACKS.bankSwapAtk={dur:1,byte:'BANK SWAP!',start:(b,a)=>{const px=S.player.x,py=S.player.y;S.player.x=b.x;S.player.y=b.y;b.x=px;b.y=py;S.player.iframes=0.5;}};
ATTACKS.dataThrash={dur:5,byte:'DATA THRASH.',start:(b,a)=>{a.data.t=0;},
  update:(b,a,dt)=>{a.data.t-=dt;if(a.data.t<=0){a.data.t=0.25;eb(b.x,b.y,0,0,{r:2,dmg:6,homing:S.player,sp:60,t:4});}}};

/* BEETLE */
ATTACKS.bootLoop={dur:5,byte:'BOOT LOOP.',start:(b,a)=>{a.data.r=20;a.data.cx=S.player.x;a.data.cy=S.player.y;},
  update:(b,a,dt)=>{a.data.r=Math.max(20,a.data.r-2*dt);
    ringc(a.data.cx,a.data.cy,a.data.r,'rgba(46,204,113,0.7)',2);
    const d=dist({x:a.data.cx,y:a.data.cy},S.player);
    if(d>a.data.r-2&&d<a.data.r+4)S.player.hit(0.5);
  }};
ATTACKS.serialSpit={dur:4,byte:'SERIAL SPIT.',start:(b,a)=>{a.data.t=0;a.data.an=ang(b,S.player);},
  update:(b,a,dt)=>{a.data.t-=dt;if(a.data.t<=0){a.data.t=0.1;a.data.an+=0.18;
    const ch=Math.random()<0.5?'1':'0';
    eb(b.x,b.y,Math.cos(a.data.an)*100,Math.sin(a.data.an)*100,{r:3,dmg:6,bin:ch,trail:1});
  }}};
ATTACKS.resetPulse={dur:1,byte:'RESET PULSE.',start:(b,a)=>{shockwave(b.x,b.y,100,0.8,'rgba(46,204,113,0.5)',6);S.player.eCd=Math.max(S.player.eCd,8);byteSay('your E is gone for 8s.');}};

/* DEMON */
ATTACKS.componentRain={dur:5,byte:'COMPONENT RAIN.',start:(b,a)=>{a.data.t=0;},
  update:(b,a,dt)=>{a.data.t-=dt;if(a.data.t<=0){a.data.t=0.18;eb(rand(20,W-20),-4,0,90,{r:4,dmg:11,comp:1});}}};
ATTACKS.touchTwitch={dur:3,byte:'TOUCH TWITCH.',start:(b,a)=>{a.data.t=0;},
  update:(b,a,dt)=>{a.data.t-=dt;if(a.data.t<=0){a.data.t=0.6;
    S.mouse.x=rand(0,W);S.mouse.y=rand(0,H);
  }}};
ATTACKS.discountBeam={dur:4,byte:'DISCOUNT BEAM.',start:(b,a)=>{warn(S.player.x,S.player.y,30,1);},
  update:(b,a,dt)=>{
    if(a.t<3&&!a.data.shrunk&&dist(S.warns[0]||{x:0,y:0},S.player)<30){a.data.shrunk=true;S.player.w=4;S.player.h=4;S.player.r=2;S.player.shrinkT=4;}
    if(S.player.shrinkT){S.player.shrinkT-=dt;if(S.player.shrinkT<=0){S.player.w=7;S.player.h=7;S.player.r=4;}}
  }};

/* INSTRUCTION SET */
ATTACKS.mallocMeteor={dur:5,byte:'MALLOC METEOR.',start:(b,a)=>{a.data.met={x:rand(40,W-40),y:-10,vy:30,hp:25};warn(a.data.met.x,H-20,40,5);},
  update:(b,a,dt)=>{const m=a.data.met;m.y+=m.vy*dt;rect(m.x-6,m.y-6,12,12,'#f1c40f');rect(m.x-4,m.y-4,8,8,'#7a6300');
    S.bullets.forEach(bu=>{if(Math.hypot(bu.x-m.x,bu.y-m.y)<8){m.hp-=bu.dmg;bu.t=0;}});
    if(m.hp<=0){a.t=0;return;}
    if(m.y>H-20){S.player.hit(25);S.shake=20;a.t=0;}
  }};
ATTACKS.whileLoop={dur:4,byte:'while(true).',start:(b,a)=>{},
  update:(b,a,dt)=>{const an=ang(S.player,b);S.player.x+=Math.cos(an)*40*dt;S.player.y+=Math.sin(an)*40*dt;
    ringc(b.x,b.y,80,'rgba(241,196,15,0.4)',1);
  }};
ATTACKS.pointerPierce={dur:3.5,byte:'POINTER PIERCE.',start:(b,a)=>{eb(b.x,b.y,0,0,{r:3,dmg:18,homing:S.player,sp:130,t:5,col:'#f1c40f'});}};

/* PHANTOM */
ATTACKS.frameSkip={dur:3,byte:'FRAME SKIP.',start:(b,a)=>{a.data.t=0;},
  update:(b,a,dt)=>{a.data.t-=dt;if(a.data.t<=0){a.data.t=1.2;
    // teleport behind player and slash
    const an=ang(b,S.player);
    b.x=S.player.x+Math.cos(an+Math.PI)*30;b.y=S.player.y+Math.sin(an+Math.PI)*30;b.tx=b.x;b.ty=b.y;
    warn(S.player.x,S.player.y,18,0.5);
    setTimeout(()=>{if(dist(b,S.player)<22&&!S.player.iframes)S.player.hit(15);},400);
  }}};
ATTACKS.vsyncSlash={dur:3,byte:'V-SYNC SLASH.',start:(b,a)=>{warn(W/2,S.player.y,W,1.2);
  setTimeout(()=>{if(Math.abs(S.player.y-(S.warns[0]?.y||0))<10)S.player.hit(20);},1100);}};
ATTACKS.motionBlur={dur:5,byte:'MOTION BLUR.',start:(b,a)=>{a.data.ill=[];const real=rint(0,4);for(let i=0;i<5;i++){a.data.ill.push({x:rand(30,W-30),y:rand(30,H-30),real:i===real});}b.illusions=a.data.ill;},
  update:(b,a,dt)=>{a.data.ill.forEach(il=>{
    const sw=b.spr[0].length, sh=b.spr.length;
    ctx.globalAlpha=il.real?0.85:0.4;
    drawBitmap(b.spr,il.x-sw/2,il.y-sh/2,bossPalette(b.d));
    ctx.globalAlpha=1;
  });},
  cleanup:b=>{b.illusions=[];}
};

/* helpers */
function drawBeam(x,y,a){
  const x2=x+Math.cos(a)*400,y2=y+Math.sin(a)*400;
  ctx.strokeStyle='rgba(26,188,156,0.85)';ctx.lineWidth=2*PX;ctx.beginPath();ctx.moveTo(x*PX,y*PX);ctx.lineTo(x2*PX,y2*PX);ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,0.5)';ctx.lineWidth=PX;ctx.stroke();
}
function drawWideBeam(x,y,a,w){
  const x2=x+Math.cos(a)*400,y2=y+Math.sin(a)*400;
  const tx=-Math.sin(a)*w/2,ty=Math.cos(a)*w/2;
  ctx.fillStyle='rgba(240,240,255,0.25)';
  ctx.beginPath();ctx.moveTo((x+tx)*PX,(y+ty)*PX);ctx.lineTo((x-tx)*PX,(y-ty)*PX);ctx.lineTo((x2-tx)*PX,(y2-ty)*PX);ctx.lineTo((x2+tx)*PX,(y2+ty)*PX);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.7)';
  ctx.beginPath();ctx.moveTo((x+tx*0.3)*PX,(y+ty*0.3)*PX);ctx.lineTo((x-tx*0.3)*PX,(y-ty*0.3)*PX);ctx.lineTo((x2-tx*0.3)*PX,(y2-ty*0.3)*PX);ctx.lineTo((x2+tx*0.3)*PX,(y2+ty*0.3)*PX);ctx.closePath();ctx.fill();
}
function segDist(p,a,b){
  const ABx=b.x-a.x,ABy=b.y-a.y,APx=p.x-a.x,APy=p.y-a.y;
  const t=clamp((APx*ABx+APy*ABy)/(ABx*ABx+ABy*ABy||1),0,1);
  const x=a.x+ABx*t,y=a.y+ABy*t;return Math.hypot(p.x-x,p.y-y);
}

/* ──────────── BULLETS / ZONES update+draw ──────────── */
function updateBullets(dt){
  for(let i=S.bullets.length-1;i>=0;i--){const b=S.bullets[i];b.x+=b.vx*dt;b.y+=b.vy*dt;b.t-=dt;
    if(b.t<=0||b.x<-10||b.x>W+10||b.y<-10||b.y>H+10){S.bullets.splice(i,1);continue;}
    if(S.boss&&dist(b,S.boss)<S.boss.r+b.r){S.boss.hit(b.dmg);if(b.wave&&S.boss.hp<=0)S.quests.waveKills++;S.combo++;S.comboT=2;if(S.combo>S.quests.maxCombo)S.quests.maxCombo=S.combo;S.bullets.splice(i,1);continue;}
  }
  for(let i=S.ebullets.length-1;i>=0;i--){const b=S.ebullets[i];
    if(b.frozen>0){b.frozen-=dt;continue;}
    if(b.tele&&b.tele>0){b.tele-=dt;if(b.tele<=0){b.x=S.player.x+rand(-30,30);b.y=S.player.y+rand(-30,30);const an=ang(b,S.player);b.vx=Math.cos(an)*120;b.vy=Math.sin(an)*120;}}
    if(b.homing){const an=ang(b,b.homing);const sp=b.sp||100;b.vx+=(Math.cos(an)*sp-b.vx)*0.04;b.vy+=(Math.sin(an)*sp-b.vy)*0.04;}
    b.x+=b.vx*dt*S.fpsScale;b.y+=b.vy*dt*S.fpsScale;b.t-=dt;
    if(b.t<=0){S.ebullets.splice(i,1);continue;}
    if(circHit(b,S.player)){S.player.hit(b.dmg);S.ebullets.splice(i,1);continue;}
  }
  for(let i=S.zones.length-1;i>=0;i--){const z=S.zones[i];
    if(z.kind==='sw'){z.r+=(z.maxR-z.r)*0.15;z.life-=dt;
      if(z.hit<1&&Math.abs(dist(z,S.player)-z.r)<5){z.hit=1;S.player.hit(z.dmg);}
    }
    else if(z.kind==='leak'){z.r=Math.min(z.maxR,z.r+z.growth*dt);z.life-=dt;}
    else if(z.kind==='slowzone'){z.life-=dt;if(dist(z,S.player)<z.r){S.fpsScale=0.35;}else{S.fpsScale=1-(S.boss?.fpsLost||0)*0.01;}}
    else if(z.kind==='glue'){z.life-=dt;if(dist(z,S.player)<z.r){S.player.rooted=0.18;}}
    else if(z.kind==='pad'){z.life-=dt;}
    if(z.life<=0)S.zones.splice(i,1);
  }
  for(let i=S.warns.length-1;i>=0;i--){const w=S.warns[i];w.life-=dt;if(w.life<=0)S.warns.splice(i,1);}
  for(let i=S.particles.length-1;i>=0;i--){const p=S.particles[i];p.life-=dt*60;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=0.95;p.vy*=0.95;if(p.life<=0)S.particles.splice(i,1);}
}
function drawBullets(){
  S.zones.forEach(z=>{
    if(z.kind==='sw'){ringc(z.x,z.y,z.r,z.col,2);}
    else if(z.kind==='leak'){ctx.fillStyle='rgba(231,76,60,0.25)';ctx.beginPath();ctx.arc(z.x*PX,z.y*PX,z.r*PX,0,Math.PI*2);ctx.fill();}
    else if(z.kind==='slowzone'){ctx.fillStyle='rgba(124,74,32,0.2)';ctx.beginPath();ctx.arc(z.x*PX,z.y*PX,z.r*PX,0,Math.PI*2);ctx.fill();ringc(z.x,z.y,z.r,'rgba(124,74,32,0.7)',1);}
    else if(z.kind==='glue'){ctx.fillStyle='rgba(232,120,32,0.5)';ctx.beginPath();ctx.arc(z.x*PX,z.y*PX,z.r*PX,0,Math.PI*2);ctx.fill();}
    else if(z.kind==='pad'){ctx.fillStyle='rgba(26,188,156,0.35)';ctx.fillRect((z.x-z.r)*PX,(z.y-z.r)*PX,z.r*2*PX,z.r*2*PX);ringc(z.x,z.y,z.r,'#1abc9c',1);txt('PAD',z.x-9,z.y-3,'#fff',4);}
  });
  S.warns.forEach(w=>{const a=(w.life/w.max);ctx.strokeStyle='rgba(231,76,60,'+(0.4+0.5*Math.sin(S.frame*0.4))+')';ctx.lineWidth=2*PX;ctx.beginPath();ctx.arc(w.x*PX,w.y*PX,w.r*PX,0,Math.PI*2);ctx.stroke();});
  S.bullets.forEach(b=>{if(b.big){dotc(b.x,b.y,b.r,'#1abc9c');dotc(b.x,b.y,b.r-2,'#fff');}else{dotc(b.x,b.y,b.r,'#fff');dotc(b.x,b.y,b.r-1,THEMES[S.theme].c);}});
  S.ebullets.forEach(b=>{
    if(b.frozen>0){dotc(b.x,b.y,b.r,'#3498db');return;}
    if(b.bin){txt(b.bin,b.x-2,b.y-3,'#e74c3c',5);return;}
    dotc(b.x,b.y,b.r,'#e74c3c');dotc(b.x,b.y,b.r-1,'#fff');
  });
  S.particles.forEach(p=>{const a=p.life/p.max;ctx.fillStyle=p.c;ctx.globalAlpha=a;ctx.fillRect(p.x*PX-PX,p.y*PX-PX,PX*2,PX*2);ctx.globalAlpha=1;});
}

/* ──────────── BYTE ──────────── */
function byteSay(s,t=2.6){if(!s)return;byteTag.style.display='block';byteTag.textContent=s;S.byteSay=s;S.byteUntil=now()+t*1000;}
function byteTick(){if(now()>S.byteUntil&&S.byteSay){S.byteSay='';byteTag.style.display='none';}}

/* ──────────── HUD update ──────────── */
function updateHUD(){
  if(!S.player)return;
  const hp=$('#br-hp i'),hpn=$('#br-hp-num');
  hp.style.width=Math.max(0,S.player.hp/S.player.maxHp*100)+'%';
  hpn.textContent=Math.ceil(S.player.hp);
  $('#br-hp').classList.toggle('lo',S.player.hp/S.player.maxHp<0.3);
  $('#br-en i').style.width=Math.max(0,S.player.en/S.player.maxEn*100)+'%';
  $('#br-en-num').textContent=Math.ceil(S.player.en);
  $('#br-boss-num').textContent=(Math.min(S.bossIdx+1,10))+'/10';
  $('#br-theme-tag').textContent=THEMES[S.theme].name;
  $('#br-combo').textContent='x'+S.combo;
  if(S.boss){
    $('#br-boss-wrap').style.display='';
    $('#br-boss-name').textContent=S.boss.d.name;
    $('#br-boss i').style.width=Math.max(0,S.boss.hp/S.boss.maxHp*100)+'%';
  } else $('#br-boss-wrap').style.display='none';
}

/* ──────────── FLOW ──────────── */
function showOverlay(id){['br-menu','br-card','br-reward','br-win','br-over','br-help','br-themes'].forEach(x=>{const e=$('#'+x);if(e)e.classList.toggle('on',x===id);});}
function showBIOS(){buildBIOS();bios.style.display='flex';shell.classList.remove('on');document.body.style.overflow='hidden';}
function closeBIOS(choice){bios.style.display='none';
  if(choice==='game'){enterGame();}
  else{document.body.style.overflow='';}
}
function enterGame(){document.body.style.overflow='hidden';shell.classList.add('on');S.view='menu';menu();}
function menu(){
  S.run=false;S.view='menu';
  if(S.player){S.player=null;}S.boss=null;S.bullets=[];S.ebullets=[];S.zones=[];S.warns=[];S.particles=[];
  S.bossIdx=Math.min(S.bossIdx,9);
  showOverlay('br-menu');
}
function startRun(){
  showOverlay('');S.run=true;S.view='arena';
  S.player=new Player();S.bossIdx=0;
  S.lastT=now();
  byteSay(pickByte('intro'),3);
  loadBoss(0);
  loop();
}
function loadBoss(i){
  S.bossIdx=i;
  if(i>=BOSSES.length){winRun();return;}
  S.bullets=[];S.ebullets=[];S.zones=[];S.warns=[];S.particles=[];
  cv.style.filter='';
  const d=BOSSES[i];
  const ov=$('#br-card');
  ov.innerHTML='';
  const card=make('div',{cls:'br-card'},
    make('div',{cls:'num'},'BOSS '+(i+1)+' / 10'),
    make('h1',{},d.name),
    make('div',{cls:'tag'},'"'+d.tagline+'"'),
    make('div',{style:{color:'#6668a0',fontFamily:'"Press Start 2P",monospace',fontSize:'0.55rem',letterSpacing:'0.1em',marginBottom:'0.5rem'}},'PASSIVE: '+d.passive.toUpperCase()),
    make('div',{style:{color:'#dde0ff',marginBottom:'1rem'}},d.attacks.map(a=>'• '+a).join('  ')),
    make('button',{cls:'btn p',onclick:()=>{showOverlay('');S.boss=new Boss(d);S.bossStartT=now();S.bossClean=true;byteSay('round '+(i+1)+'. fight.',2);}},'> ENGAGE')
  );
  ov.append(card);
  showOverlay('br-card');
  S.view='arena';
}
function onBossDefeated(){
  S.boss=null;S.bullets=[];S.ebullets=[];S.zones=[];S.warns=[];
  cv.style.filter='';S.fpsScale=1;
  // possibly trigger minigame
  const wantMG=Math.random()<0.65||S.bossIdx===2||S.bossIdx===5;
  if(wantMG){const list=Object.keys(MINIGAMES);const name=list[rint(0,list.length-1)];launchMinigame(name);}
  else nextBossOrReward();
}
function nextBossOrReward(){
  // reward modal
  const ov=$('#br-reward');
  ov.innerHTML='';
  const earned=checkUnlocks();
  const card=make('div',{cls:'br-reward'},
    make('div',{cls:'ico'},'★'),
    make('div',{cls:'ttl'},'BOSS DEFEATED'),
    make('div',{style:{color:'#dde0ff',marginBottom:'0.6rem'}},BOSSES[S.bossIdx].name),
    make('div',{style:{color:'#1abc9c',marginBottom:'0.8rem',fontSize:'0.95rem'}},earned||'+25 HP / +10 EN restored'),
    make('button',{cls:'btn p',onclick:()=>{S.player.heal(25);S.player.en=Math.min(S.player.maxEn,S.player.en+10);showOverlay('');loadBoss(S.bossIdx+1);}},'> NEXT BOSS')
  );
  ov.append(card);
  showOverlay('br-reward');
  save();
}
/* QUESTS — named gates per spec. progress in S.quests, claimed in showThemes(). */
const QUESTS={
  red:    {p:'Defeat 5 enemies',g:s=>[s.enemies,5]},
  orange: {p:'Win 40 minigames',g:s=>[s.minigames,40]},
  yellow: {p:'Defeat any boss in <60s',g:s=>[s.fastWin,1]},
  green:  {p:'Heal 200 HP total',g:s=>[s.healed,200]},
  blue:   {p:'Defeat 3 bosses',g:s=>[s.wins,3]},
  purple: {p:'Use special 20 times',g:s=>[s.specials,20]},
  velvet: {p:'Reach a 10x combo',g:s=>[s.maxCombo,10]},
  amber:  {p:'40 wave-attack kills',g:s=>[s.waveKills,40]},
  gold:   {p:'10 dash-dodges',g:s=>[s.dashDodges,10]},
  matrix: {p:'Clear a run with WHITE theme',g:s=>[s.whiteWin,1]},
  cyan:   {p:'30 minigame perfects',g:s=>[s.mgPerfect,30]},
  magenta:{p:'Beat 10 bosses total',g:s=>[s.totalKills,10]},
  white:  {p:'Unlock all 6 base + perfect-kill any boss',g:s=>{const bases=['red','orange','yellow','green','blue','purple'].every(k=>S.unlockedThemes[k]);return [(bases?1:0)+(s.cleanKill>0?1:0),2];}},
  multi:  {p:'Unlock all 13 themes + 5min RGB Gauntlet',g:s=>{const c=Object.keys(S.unlockedThemes).filter(k=>S.unlockedThemes[k]&&k!=='multi').length;return [Math.min(c,13)+(s.gauntletSec>=300?1:0),14];}}
};
function tryClaim(k){
  if(S.unlockedThemes[k])return false;
  const [a,b]=QUESTS[k].g(S.quests);
  if(a>=b){S.unlockedThemes[k]=1;sUnlock();save();return true;}
  return false;
}
function checkUnlocks(){
  const got=[];
  for(const k in QUESTS)if(!S.unlockedThemes[k]&&tryClaim(k))got.push(THEMES[k].name);
  return got.length?'theme unlocked: '+got.join(' • '):'';
}
function winRun(){
  S.run=false;S.view='win';
  if(S.theme==='white')S.quests.whiteWin++;
  checkUnlocks();
  $('#br-win-stats').textContent=`enemies: ${S.quests.enemies} • runs: ${S.quests.wins} • themes: ${Object.keys(S.unlockedThemes).filter(k=>S.unlockedThemes[k]).length}/14`;
  byteSay(pickByte('win'),5);
  showOverlay('br-win');
  save();
}
function dieScreen(){
  S.run=false;S.view='gameover';
  $('#br-over-byte').textContent=pickByte('die');
  $('#br-over-h2').textContent='killed by '+(S.boss?.d.name||'???');
  showOverlay('br-over');
}
function retryBoss(){S.player=new Player();S.bullets=[];S.ebullets=[];S.zones=[];S.warns=[];S.particles=[];loadBoss(S.bossIdx);S.run=true;S.lastT=now();}
function togglePause(){S.paused=!S.paused;if(!S.paused)S.lastT=now();}
function confirmExit(){
  if(confirm('KILL PROCESS — return to DASH OS site? Run progress saved.')){
    save();
    shell.classList.remove('on');document.body.style.overflow='';S.run=false;
  }
}
function showHelp(){showOverlay('br-help');}
function showThemes(){
  const grid=$('#br-theme-grid');
  grid.innerHTML='';
  Object.keys(THEMES).forEach(k=>{
    const t=THEMES[k];const unlocked=!!S.unlockedThemes[k];
    const q=QUESTS[k];const [a,b]=q?q.g(S.quests):[0,1];
    const claimable=!unlocked&&a>=b;
    const c=make('div',{cls:'br-theme'+(k==='multi'?' multi':'')+(unlocked?'':' locked')+(S.theme===k?' active':''),
      onclick:()=>{
        if(unlocked){S.theme=k;if(S.player)S.player.applyTheme();save();showThemes();$('#br-theme-desc').textContent=t.name+' — '+t.desc;}
        else if(claimable){tryClaim(k);showThemes();$('#br-theme-desc').textContent='UNLOCKED: '+t.name;}
        else{$('#br-theme-desc').innerHTML=`<b style="color:#e74c3c">LOCKED</b> — ${q?q.p:''} (${a}/${b})`;}
      }});
    if(k!=='multi')c.style.borderColor=claimable?'#2ecc71':t.c;
    if(claimable)c.style.boxShadow='0 0 16px rgba(46,204,113,0.6)';
    const sw=make('div',{cls:'sw'});if(k!=='multi')sw.style.background=t.c;
    c.append(sw,document.createTextNode(t.name));
    if(!unlocked){
      c.append(make('div',{style:{fontFamily:'"Inconsolata",monospace',fontSize:'0.55rem',color:claimable?'#2ecc71':'#6668a0',marginTop:'0.3rem',letterSpacing:'normal'}},claimable?'CLAIM ✦':a+'/'+b));
      if(!claimable)c.append(make('div',{cls:'lck'},'✖'));
    }
    grid.append(c);
  });
  $('#br-theme-desc').textContent='click a theme to equip its passive. green border = claimable.';
  showOverlay('br-themes');
}

/* ──────────── MINIGAMES ──────────── */
const MINIGAMES={};
function launchMinigame(name){
  S.view='minigame';
  ovMG.classList.add('on');ovMG.innerHTML='';
  byteSay('MINIGAME: '+name.replace(/_/g,' ').toUpperCase(),2);
  MINIGAMES[name]({onDone:(success)=>{
    ovMG.classList.remove('on');ovMG.innerHTML='';
    S.quests.minigames++;save();
    if(success){byteSay(pickByte('combo'));S.player.heal(15);S.player.en=Math.min(S.player.maxEn,S.player.en+25);}
    else{byteSay('whatever, '+PLAYER_NAME+'. moving on.');S.player.hp=Math.max(1,S.player.hp-10);}
    nextBossOrReward();
  }});
}

/* MEMORY MADNESS — drag/drop */
MINIGAMES.memory_madness=({onDone})=>{
  const parts=[
    {id:'esp',cls:'esp',name:'ESP32-32E',slot:[160,80,90,90]},
    {id:'scr',cls:'scr',name:'ST7796U',slot:[20,20,160,100]},
    {id:'sd',cls:'sd',name:'SD SLOT',slot:[300,40,80,60]},
    {id:'usb',cls:'usb',name:'USB-C',slot:[420,140,80,40]},
    {id:'rgb',cls:'rgb',name:'RGB LED',slot:[20,200,40,40]},
    {id:'btn1',cls:'btn',name:'RST',slot:[100,200,30,30]},
    {id:'btn2',cls:'btn',name:'BOOT',slot:[140,200,30,30]}
  ];
  const root=make('div',{cls:'panel',style:{display:'flex',flexDirection:'column',alignItems:'center'}});
  ovMG.append(make('div',{cls:'title'},'MEMORY MADNESS'));
  ovMG.append(make('div',{cls:'desc'},'place each component on its labeled slot. controls inverted as penalty.'));
  const board=make('div',{cls:'br-mm-board'});
  parts.forEach(p=>{const [x,y,w,h]=p.slot;const slot=make('div',{cls:'br-mm-slot','data-id':p.id,style:{left:x+'px',top:y+'px',width:w+'px',height:h+'px'}},p.name);board.append(slot);});
  root.append(board);
  const tray=make('div',{cls:'br-mm-tray'});
  const placed={};
  parts.forEach(p=>{
    const el=make('div',{cls:'br-mm-part '+p.cls,'data-id':p.id,'data-name':p.name,draggable:'true'});
    el.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',p.id);});
    tray.append(el);
  });
  root.append(tray);
  const result=make('div',{cls:'br-mm-result'});
  root.append(result);
  ovMG.append(root);
  ovMG.append(make('button',{cls:'btn',style:{fontFamily:'"Press Start 2P",monospace',fontSize:'0.6rem',padding:'0.6rem 1rem',marginTop:'0.6rem',background:'#101120',border:'1px solid #6668a0',color:'#dde0ff',cursor:'pointer'},onclick:()=>onDone(false)},'> SKIP'));
  board.querySelectorAll('.br-mm-slot').forEach(slot=>{
    slot.addEventListener('dragover',e=>{e.preventDefault();slot.classList.add('over');});
    slot.addEventListener('dragleave',()=>slot.classList.remove('over'));
    slot.addEventListener('drop',e=>{e.preventDefault();slot.classList.remove('over');
      const id=e.dataTransfer.getData('text/plain');
      const partEl=tray.querySelector(`[data-id="${id}"]`)||board.querySelector(`.br-mm-part.in-board[data-id="${id}"]`);
      if(!partEl)return;
      if(slot.dataset.id!==id){result.style.color='#e74c3c';result.textContent='WRONG SLOT — '+id.toUpperCase();sHurt();return;}
      partEl.classList.add('in-board');
      const [x,y,w,h]=parts.find(p=>p.id===id).slot;
      partEl.style.left=(x+w/2-partEl.offsetWidth/2)+'px';
      partEl.style.top=(y+h/2-partEl.offsetHeight/2)+'px';
      board.append(partEl);
      slot.classList.add('filled');
      placed[id]=1;
      blip(660,0.06,'square',0.06);
      if(Object.keys(placed).length===parts.length){result.style.color='#2ecc71';result.textContent='FULL ASSEMBLY ✔ +HP +EN';setTimeout(()=>onDone(true),900);}
    });
  });
};

/* INSTALLATION CLONE — typing */
MINIGAMES.installation_clone=({onDone})=>{
  ovMG.append(make('div',{cls:'title'},'INSTALLATION CLONE'));
  ovMG.append(make('div',{cls:'desc'},'type the install commands. exact match required. one keystroke off = restart line.'));
  const targets=['git clone https://github.com/PratikDash/DASH-OS','cd dash-os','python flash.py'];
  const term=make('div',{cls:'br-term'});
  const lines=[];
  let curIdx=0;
  function rebuild(){
    term.innerHTML='';
    for(let i=0;i<targets.length;i++){
      const ln=make('div');
      ln.append(make('span',{cls:'pr'},'$ '));
      if(i<curIdx){ln.append(make('span',{cls:'ok'},targets[i]+' ✔'));}
      else if(i===curIdx){
        const typed=lines[i]||'';const remaining=targets[i].slice(typed.length);
        const ok=targets[i].startsWith(typed);
        ln.append(make('span',{cls:ok?'typed':'bad'},typed));
        ln.append(make('span',{cls:'target'},remaining||' '));
        ln.append(make('span',{cls:'pr'},'_'));
      }else{ln.append(make('span',{cls:'target'},targets[i]));}
      term.append(ln);
    }
  }
  lines.length=targets.length;rebuild();
  ovMG.append(term);
  const tip=make('div',{cls:'desc',style:{marginTop:'0.6rem',color:'#6668a0',fontSize:'0.85rem'}},'click to focus. esc to skip.');
  ovMG.append(tip);
  const handler=e=>{
    if(curIdx>=targets.length||S.view!=='minigame')return;
    if(e.key==='Escape'){cleanup();onDone(false);return;}
    if(e.key==='Enter'){
      if((lines[curIdx]||'')===targets[curIdx]){curIdx++;blip(660,0.08,'square',0.06);if(curIdx>=targets.length){S.quests.clones++;cleanup();onDone(true);return;}}
      else{lines[curIdx]='';blip(120,0.08,'sawtooth',0.06);}
      rebuild();return;
    }
    if(e.key==='Backspace'){lines[curIdx]=(lines[curIdx]||'').slice(0,-1);rebuild();return;}
    if(e.key.length===1){lines[curIdx]=(lines[curIdx]||'')+e.key;
      if(!targets[curIdx].startsWith(lines[curIdx])){lines[curIdx]=lines[curIdx].slice(0,-1);blip(120,0.04,'sawtooth',0.04);}
      rebuild();
    }
  };
  function cleanup(){window.removeEventListener('keydown',handler,true);}
  window.addEventListener('keydown',handler,true);
};

/* SAMPLE CHOP — rhythm */
MINIGAMES.sample_chop=({onDone})=>{
  ovMG.append(make('div',{cls:'title'},'SAMPLE CHOP'));
  ovMG.append(make('div',{cls:'desc'},'4-bar soul beat. hit 1/2/3/4 when notes touch the line. 70%+ to clear.'));
  const grid=make('div',{cls:'br-rh'});
  const lanes=[];
  for(let i=0;i<4;i++){const l=make('div',{cls:'lane'},make('div',{cls:'target'}),make('div',{cls:'key'},(i+1)+''));grid.append(l);lanes.push(l);}
  ovMG.append(grid);
  const score=make('div',{cls:'score'},'HITS 0  MISS 0  ACC 100%');
  ovMG.append(score);
  const skip=make('button',{cls:'btn',style:{marginTop:'0.6rem',fontFamily:'"Press Start 2P",monospace',fontSize:'0.6rem',padding:'0.6rem 1rem',background:'#101120',border:'1px solid #6668a0',color:'#dde0ff',cursor:'pointer'},onclick:()=>{cleanup();onDone(false);}},'> SKIP');
  ovMG.append(skip);
  // 16 notes, 4 bars
  const beat=[];
  const bpm=110;const spb=60/bpm;
  for(let bar=0;bar<4;bar++){for(let b=0;b<4;b++){if(Math.random()<0.7){const lane=rint(0,3);beat.push({t:bar*4*spb+b*spb,lane,el:null,hit:0});}}}
  let t0=now();let hits=0,miss=0;
  function tick(){
    const elapsed=(now()-t0)/1000;
    beat.forEach(n=>{
      const lifeT=n.t-elapsed;
      if(lifeT>2||n.hit)return;
      if(!n.el){n.el=make('div',{cls:'note'+(n.t%2<0.1?' h':' m')});lanes[n.lane].append(n.el);}
      const lh=lanes[n.lane].clientHeight;
      const targetBottom=38;
      const top=Math.max(-15,(lh-targetBottom)*(1-lifeT/2));
      n.el.style.top=top+'px';
      if(lifeT<-0.3){n.hit=-1;miss++;n.el.remove();}
    });
    score.textContent=`HITS ${hits}  MISS ${miss}  ACC ${beat.length?Math.round(hits/(hits+miss||1)*100):100}%`;
    const allDone=beat.every(n=>n.hit);
    if(elapsed>4*4*spb+0.5||allDone){
      cleanup();
      const acc=hits/Math.max(1,hits+miss);
      onDone(acc>=0.7);return;
    }
    raf=requestAnimationFrame(tick);
  }
  let raf;tick();
  const handler=e=>{
    const n=parseInt(e.key);if(!(n>=1&&n<=4))return;
    const elapsed=(now()-t0)/1000;
    let best=null,bestD=99;
    beat.forEach(b=>{if(b.hit||b.lane!==n-1)return;const d=Math.abs(b.t-elapsed);if(d<bestD){bestD=d;best=b;}});
    if(best&&bestD<0.25){best.hit=1;hits++;best.el.remove();lanes[n-1].classList.add('hit');setTimeout(()=>lanes[n-1].classList.remove('hit'),120);blip(440+n*100,0.05,'square',0.06);}
    else{miss++;blip(120,0.06,'sawtooth',0.05);}
  };
  function cleanup(){cancelAnimationFrame(raf);window.removeEventListener('keydown',handler);}
  window.addEventListener('keydown',handler);
};

/* simpler stubs: image scramble, story dash, feature check, easter egg */
function simpleMG(title,desc,prompt,answer,onDone,extraSetup){
  ovMG.append(make('div',{cls:'title'},title));
  ovMG.append(make('div',{cls:'desc'},desc));
  const panel=make('div',{cls:'panel',style:{textAlign:'center',minWidth:'320px'}});
  panel.append(make('div',{style:{marginBottom:'0.6rem',fontSize:'1.05rem'}},prompt));
  if(extraSetup)extraSetup(panel);
  const inp=make('input',{type:'text',autofocus:true,placeholder:'type answer...'});
  panel.append(inp);
  const out=make('div',{cls:'timer',style:{marginTop:'0.5rem'}});
  panel.append(out);
  ovMG.append(panel);
  ovMG.append(make('button',{cls:'btn',style:{fontFamily:'"Press Start 2P",monospace',fontSize:'0.6rem',padding:'0.6rem 1rem',marginTop:'0.6rem',background:'#101120',border:'1px solid #6668a0',color:'#dde0ff',cursor:'pointer'},onclick:()=>onDone(false)},'> SKIP'));
  setTimeout(()=>inp.focus(),50);
  let timeLeft=15;
  const iv=setInterval(()=>{timeLeft--;out.textContent='TIME '+timeLeft+'s';if(timeLeft<=0){clearInterval(iv);onDone(false);}},1000);
  inp.addEventListener('keydown',e=>{
    if(e.key==='Enter'){
      const v=inp.value.trim().toLowerCase();
      const ans=Array.isArray(answer)?answer:[answer];
      const ok=ans.some(a=>v===a.toLowerCase());
      clearInterval(iv);
      if(ok){out.className='ok';out.textContent='CORRECT.';setTimeout(()=>onDone(true),500);}
      else{out.className='bad';out.textContent='WRONG. expected: '+ans[0];setTimeout(()=>onDone(false),900);}
    }
  });
}
/* IMAGE SCRAMBLE — 3x3 sliding puzzle */
MINIGAMES.image_scramble=({onDone})=>{
  ovMG.append(make('div',{cls:'title'},'IMAGE SCRAMBLE'));
  ovMG.append(make('div',{cls:'desc'},'click a tile next to the empty slot to slide it. solve in 60s.'));
  const grid=make('div',{style:{display:'grid',gridTemplateColumns:'repeat(3,80px)',gap:'4px',background:'#101120',padding:'4px',border:'2px solid #3a3c60'}});
  let tiles=[1,2,3,4,5,6,7,8,0];
  for(let i=0;i<60;i++){const ei=tiles.indexOf(0);const adj=[ei-3,ei+3,ei%3?ei-1:-1,ei%3<2?ei+1:-1].filter(x=>x>=0&&x<9);const m=adj[rint(0,adj.length-1)];[tiles[ei],tiles[m]]=[tiles[m],tiles[ei]];}
  function render(){grid.innerHTML='';tiles.forEach((t,i)=>{const tl=make('div',{style:{width:'80px',height:'80px',background:t?'linear-gradient(135deg,#e87820,#c05e10)':'#000',color:'#000',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'"Press Start 2P",monospace',fontSize:'1.2rem',cursor:t?'pointer':'default',border:t?'2px solid #fff':'1px dashed #3a3c60'},onclick:()=>{if(!t)return;const ei=tiles.indexOf(0);if([ei-3,ei+3,(ei%3?ei-1:-2),(ei%3<2?ei+1:-2)].includes(i)){[tiles[i],tiles[ei]]=[tiles[ei],tiles[i]];render();sUI();if(tiles.join(',')==='1,2,3,4,5,6,7,8,0'){clearInterval(iv);S.quests.mgPerfect++;onDone(true);}}}},t||'');grid.append(tl);});}
  render();ovMG.append(grid);
  const t=make('div',{cls:'timer'},'60s');ovMG.append(t);
  ovMG.append(make('button',{cls:'btn',style:{fontFamily:'"Press Start 2P",monospace',fontSize:'0.6rem',padding:'0.6rem 1rem',marginTop:'0.6rem',background:'#101120',border:'1px solid #6668a0',color:'#dde0ff',cursor:'pointer'},onclick:()=>{clearInterval(iv);onDone(false);}},'> SKIP'));
  let s=60;const iv=setInterval(()=>{s--;t.textContent=s+'s';if(s<=0){clearInterval(iv);onDone(false);}},1000);
};

/* STORY DASH — 3 stages: LED mimic → boot order → mash */
MINIGAMES.story_dash=({onDone})=>{
  ovMG.append(make('div',{cls:'title'},'THE STORY DASH'));
  const desc=make('div',{cls:'desc'});ovMG.append(desc);
  let stage=0;
  function nextStage(){
    ovMG.querySelectorAll('.panel').forEach(e=>e.remove());
    if(stage===0){
      desc.textContent='STAGE 1/3 — watch the LED. then press SPACE on each ON beat.';
      const p=make('div',{cls:'panel',style:{textAlign:'center'}});
      const led=make('div',{style:{width:'48px',height:'48px',borderRadius:'50%',background:'#222',margin:'0 auto 1rem',boxShadow:'inset 0 -4px 8px rgba(0,0,0,0.5)'}});
      const status=make('div',{style:{color:'#1abc9c'}},'WATCHING...');
      p.append(led,status);ovMG.append(p);
      const seq=[1,1,0,1,0,1,1,0];let i=0;
      const iv=setInterval(()=>{
        if(i<seq.length){led.style.background=seq[i]?'#e87820':'#222';led.style.boxShadow=seq[i]?'0 0 24px #e87820':'inset 0 -4px 8px rgba(0,0,0,0.5)';blip(seq[i]?880:220,0.04,'square',0.05);i++;return;}
        clearInterval(iv);led.style.background='#222';status.textContent='YOUR TURN — press SPACE on each beat in order';
        let j=0;
        const handler=e=>{if(e.code!=='Space')return;e.preventDefault();
          if(seq[j]===1){j++;led.style.background='#2ecc71';led.style.boxShadow='0 0 24px #2ecc71';blip(660,0.05,'square',0.06);setTimeout(()=>{led.style.background='#222';led.style.boxShadow='inset 0 -4px 8px rgba(0,0,0,0.5)';},120);
            // skip 0s
            while(seq[j]===0)j++;
            if(j>=seq.length){window.removeEventListener('keydown',handler);stage=1;nextStage();}
          }else{window.removeEventListener('keydown',handler);status.textContent='WRONG BEAT.';status.className='bad';setTimeout(()=>onDone(false),500);}
        };window.addEventListener('keydown',handler);
      },350);
    }else if(stage===1){
      desc.textContent='STAGE 2/3 — click in correct boot order: SD → SERIAL → MALLOC → DISPLAY';
      const want=['SD','SERIAL','MALLOC','DISPLAY'];const opts=[...want].sort(()=>Math.random()-0.5);
      const p=make('div',{cls:'panel',style:{display:'flex',gap:'8px',flexWrap:'wrap',justifyContent:'center'}});
      let prog=[];
      opts.forEach(o=>{const b=make('button',{style:{padding:'1rem 1.4rem',fontFamily:'"Press Start 2P",monospace',fontSize:'0.7rem',background:'#101120',border:'1px solid #e87820',color:'#dde0ff',cursor:'pointer',letterSpacing:'0.1em'},onclick:()=>{
        if(b.disabled)return;prog.push(o);b.disabled=true;b.style.opacity='0.3';b.style.borderColor='#2ecc71';
        if(prog.join(',')!==want.slice(0,prog.length).join(',')){b.style.borderColor='#e74c3c';sHurt();setTimeout(()=>onDone(false),500);return;}
        sUI();
        if(prog.length===want.length){stage=2;setTimeout(nextStage,400);}
      }},o);p.append(b);});
      ovMG.append(p);
    }else{
      desc.textContent='STAGE 3/3 — mash SPACE to ramp 0.1 FPS → 60 FPS. need 30 in 5s.';
      const p=make('div',{cls:'panel',style:{textAlign:'center'}});
      const bar=make('div',{style:{width:'400px',maxWidth:'80vw',height:'30px',background:'#101120',border:'1px solid #3a3c60',position:'relative',overflow:'hidden'}});
      const fill=make('div',{style:{position:'absolute',top:0,bottom:0,left:0,width:'0%',background:'linear-gradient(90deg,#e74c3c,#e87820,#2ecc71)',transition:'width 0.08s'}});
      bar.append(fill);
      const fps=make('div',{style:{fontFamily:'"Press Start 2P",monospace',color:'#e87820',marginTop:'0.6rem',fontSize:'0.85rem',letterSpacing:'0.1em'}},'0.1 FPS');
      p.append(bar,fps);ovMG.append(p);
      let count=0;const target=30;
      const handler=e=>{if(e.code!=='Space')return;e.preventDefault();count++;const pct=Math.min(100,count/target*100);fill.style.width=pct+'%';fps.textContent=Math.round(0.1+(60-0.1)*Math.min(1,count/target))+' FPS';blip(330+count*30,0.03,'square',0.04);if(count>=target){window.removeEventListener('keydown',handler);clearTimeout(to);onDone(true);}};
      window.addEventListener('keydown',handler);
      const to=setTimeout(()=>{window.removeEventListener('keydown',handler);onDone(count>=target);},5000);
    }
  }
  nextStage();
};

/* FEATURE CHECK — pick 3 of 5 (one wrong = fail) */
MINIGAMES.feature_check=({onDone})=>{
  ovMG.append(make('div',{cls:'title'},'FEATURE CHECK'));
  ovMG.append(make('div',{cls:'desc'},'pick the 3 REAL DASH OS features. one wrong pick fails the check.'));
  const items=[
    {t:'60 FPS rendering',ok:1},
    {t:'14 themes',ok:1},
    {t:'Save states',ok:1},
    {t:'Dual-bank cache',ok:1},
    {t:'Bluetooth controllers',ok:1},
    {t:'Cloud NVMe sync',ok:0},
    {t:'AI dialogue gen',ok:0},
    {t:'Built-in DRM',ok:0}
  ].sort(()=>Math.random()-0.5).slice(0,5);
  const panel=make('div',{cls:'panel',style:{display:'grid',gap:'0.5rem',minWidth:'320px'}});
  let picked=0;
  items.forEach(it=>{const b=make('button',{style:{padding:'0.7rem',fontFamily:'"Press Start 2P",monospace',fontSize:'0.55rem',background:'#101120',border:'1px solid #3a3c60',color:'#dde0ff',cursor:'pointer',textAlign:'left',letterSpacing:'0.06em'},onclick:()=>{
    if(b.disabled)return;b.disabled=true;
    if(it.ok){picked++;b.style.borderColor='#2ecc71';b.style.color='#2ecc71';sUI();if(picked>=3)setTimeout(()=>onDone(true),400);}
    else{b.style.borderColor='#e74c3c';b.style.color='#e74c3c';sHurt();setTimeout(()=>onDone(false),600);}
  }},it.t);panel.append(b);});
  ovMG.append(panel);
};

/* EASTER EGG GAMBIT — memorize then type */
MINIGAMES.easter_egg=({onDone})=>{
  ovMG.append(make('div',{cls:'title'},'EASTER EGG GAMBIT'));
  ovMG.append(make('div',{cls:'desc'},'memorize the code shown. when it disappears, type it from memory.'));
  const codes=['uuddlrlrba','august_01','esp32_32e'];
  const code=codes[rint(0,codes.length-1)];
  const panel=make('div',{cls:'panel',style:{textAlign:'center',minWidth:'360px'}});
  const big=make('div',{style:{fontFamily:'"Press Start 2P",monospace',fontSize:'1.3rem',color:'#e87820',letterSpacing:'0.15em',padding:'1.2rem',animation:'brCardIn 0.3s'}},code);
  panel.append(big);
  const sub=make('div',{style:{color:'#6668a0'}},'memorizing... 3s');
  panel.append(sub);
  ovMG.append(panel);
  let mem=3;const memIv=setInterval(()=>{mem--;sub.textContent='memorizing... '+mem+'s';if(mem<=0){clearInterval(memIv);
    panel.innerHTML='';
    const inp=make('input',{type:'text',autofocus:true,placeholder:'type the code...'});
    panel.append(inp);setTimeout(()=>inp.focus(),50);
    const t=make('div',{cls:'timer'},'5s');panel.append(t);
    let s=5;const iv=setInterval(()=>{s--;t.textContent=s+'s';if(s<=0){clearInterval(iv);onDone(false);}},1000);
    inp.addEventListener('keydown',e=>{if(e.key==='Enter'){clearInterval(iv);const ok=inp.value.trim().toLowerCase()===code;if(!ok){
      // failure penalty: type 20-char freeze
      panel.innerHTML='';panel.append(make('div',{style:{color:'#e74c3c',marginBottom:'0.5rem'}},'WRONG. penalty: type 20 random chars frozen.'));
      const pen=Array.from({length:20},()=>'abcdefghjkmnp23456789'[rint(0,20)]).join('');
      const tgt=make('div',{style:{fontFamily:'"Press Start 2P",monospace',fontSize:'0.9rem',color:'#dde0ff',letterSpacing:'0.1em',padding:'0.8rem'}},pen);panel.append(tgt);
      const inp2=make('input',{type:'text'});panel.append(inp2);setTimeout(()=>inp2.focus(),50);
      inp2.addEventListener('input',()=>{if(inp2.value===pen){onDone(false);}});
      return;
    }onDone(true);}});
  }},1000);
};

/* ──────────── MAIN LOOP ──────────── */
function loop(){
  if(!shell.classList.contains('on'))return;
  if(S.run){
    const t=now();let dt=(t-S.lastT)/1000;S.lastT=t;
    if(dt>0.1)dt=0.1;
    if(!S.paused&&S.view==='arena'){
      S.player.update(dt);
      if(S.boss)S.boss.update(dt);
      updateBullets(dt);
      S.frame++;S.time+=dt;
      if(S.shake>0)S.shake-=dt*30;
      if(S.flash>0)S.flash-=dt*2;
      if(S.comboT>0){S.comboT-=dt;if(S.comboT<=0)S.combo=0;}
    }
    render();
    updateHUD();
    byteTick();
  }
  requestAnimationFrame(loop);
}
function render(){
  // background
  const sx=S.shake?rand(-S.shake,S.shake):0;
  const sy=S.shake?rand(-S.shake,S.shake):0;
  ctx.save();
  ctx.fillStyle='#07080f';ctx.fillRect(0,0,W*PX,H*PX);
  ctx.translate(sx*PX,sy*PX);
  // arena grid bg
  ctx.fillStyle='rgba(232,120,32,0.08)';
  for(let i=0;i<W;i+=20)pix(i,0,1,H,'rgba(255,255,255,0.025)');
  for(let j=0;j<H;j+=20)pix(0,j,W,1,'rgba(255,255,255,0.025)');
  // floor under boss
  if(S.boss){
    ctx.fillStyle='rgba(231,76,60,0.05)';ctx.beginPath();ctx.arc(S.boss.x*PX,S.boss.y*PX,80*PX,0,Math.PI*2);ctx.fill();
  }
  drawBullets();
  if(S.boss)S.boss.draw();
  if(S.player)S.player.draw();
  if(S.flash>0){ctx.fillStyle='rgba(255,255,255,'+S.flash+')';ctx.fillRect(0,0,W*PX,H*PX);}
  ctx.restore();
}

/* ──────────── INIT ──────────── */
load();
// auto-show portal even before any boot complete; auto-show BIOS once site boot finishes
function watchSiteBoot(){
  const boot=document.getElementById('boot');
  if(!boot){return;}
  const obs=new MutationObserver(()=>{if(boot.classList.contains('out')||getComputedStyle(boot).opacity==='0'){
    obs.disconnect();
    if(!sessionStorage.getItem('br_shown')){sessionStorage.setItem('br_shown','1');setTimeout(showBIOS,1200);}
  }});
  obs.observe(boot,{attributes:true,attributeFilter:['class','style']});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watchSiteBoot);else watchSiteBoot();

console.log('%c[BOSS_RUSH] loaded. press the BOSS_RUSH button (top-right) or refresh.','color:#e87820;font-family:monospace');
})();
