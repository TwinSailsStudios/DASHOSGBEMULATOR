// ================================================================
//  DASH OS v30 !!!
//  made by me (Pratik)
//
//  ok so this is my gameboy emulator thing i been working on forever
//  its basically my own little OS for my esp32 handheld
//
//  STUFF I ADDED THIS TIME:
//  - floppy disk rom menu 
//    shows one rom at a time like a real floppy, u swipe thru w dpad
//    has typing animation for the stats bc hackerman vibes
//  - performance mode = instant turbo, just flip it on
//  - frame skip goes up to 15 (was only 2)
//  - tracks how long u played each rom + last save time
//
//  SECRET STUFF (dont tell anyone):
//    1. konami code -> up up down down left right left right B A
//       gives u rainbow theme :)
//    2. watch the credits all the way = unlocks snake game hehe
//    3. hold X+Y+Start for 3sec = matrix mode (falling green stuff)
//    4. smash select 10 times in settings = dev mode (shows heap n stuff)
//    5. Start+Select+B+A together = speedrun timer with ms
//
//  THEMES: got 14 of em. my fav is orange ofc (its the default)
//    also theres a multi one that cycles thru colors
//
//  SAVES:
//    autosaves every 10 sec so u dont lose progress
//    also saves when u exit w B+A
//    works w pokemon, zelda, all that
//
//  if ur reading this hi :) ~Pratik
// ================================================================

#pragma GCC optimize("O3,unroll-loops,inline-functions,fast-math")
#pragma GCC target("xtensa")

#include <Arduino.h>
#include <SPI.h>
#include <SD.h>
#include <TFT_eSPI.h>
#include <Bluepad32.h>

#define PEANUT_GB_HIGH_LCD_ACCURACY 0
#define ENABLE_SOUND 0
#define PEANUT_GB_USE_BIOS 0
#include "peanut_gb.h"

// screen + pins n stuff
int currentScale = 1;
#define ROT   3
#define SCRW  480
#define SCRH  320
#define GB_W  160   // gameboy screen is tiny lol
#define GB_H  144
#define SD_CS    5
#define BL_PIN  27
#define BOOT_BTN 0

// rom stuff
#define MAX_ROM 24     // if u got more than 24 roms thats ur problem
#define NL      48
#define ROMBANK 16384
#define CRAM    8192

struct Pt { int16_t x, y; };

// ================================================================
//  THEMES!!! 14 of them. i spent forever picking the colors
// ================================================================
enum Theme {
  THEME_RED, THEME_VELVET,
  THEME_ORANGE, THEME_AMBER,
  THEME_YELLOW, THEME_GOLD,
  THEME_GREEN, THEME_MATRIX,
  THEME_BLUE, THEME_CYAN,
  THEME_PURPLE, THEME_MAGENTA,
  THEME_WHITE, THEME_MULTI,
  THEME_COUNT
};

const char* themeNames[] = {
  "Red","Velvet","Orange","Amber","Yellow","Gold",
  "Green","Matrix","Blue","Cyan","Purple","Magenta",
  "White","Multi"
};

struct ThemeColors {
  uint16_t primary, light, dim, bg;
};

// these are rgb565 colors (google it if u dont know)
ThemeColors themes[] = {
  {0xF800, 0xFC10, 0x7800, 0x0000}, // Red
  {0xC000, 0xE000, 0x5800, 0x1000}, // Velvet - kinda wine colored
  {0xFC00, 0xFD60, 0x8400, 0x0000}, // Orange <- best one, default
  {0xFD40, 0xFEA0, 0x8280, 0x0000}, // Amber
  {0xFFE0, 0xFFF0, 0x8C00, 0x0000}, // Yellow
  {0xFEA0, 0xFF40, 0x7E00, 0x0000}, // Gold
  {0x07E0, 0x4FE0, 0x0400, 0x0000}, // Green
  {0x03E0, 0x07E0, 0x0180, 0x0040}, // Matrix (darker green)
  {0x001F, 0x439F, 0x0010, 0x0000}, // Blue
  {0x07FF, 0x4FFF, 0x0410, 0x0000}, // Cyan
  {0xF81F, 0xFC9F, 0x8010, 0x0000}, // Purple
  {0xF81F, 0xFBFF, 0x7810, 0x0000}, // Magenta (same as purple almost oops)
  {0xFFFF, 0xFFFF, 0x8410, 0x0000}, // White - kinda boring ngl
  {0xFC00, 0xFD60, 0x8400, 0x0000}, // Multi (changes on its own)
};

int currentTheme = THEME_ORANGE;

// global color vars. gets overwritten when u change theme
uint16_t C_BK  = 0x0000;
uint16_t C_OR  = 0xFC00;
uint16_t C_LO  = 0xFD60;
uint16_t C_DIM = 0x8400;
uint16_t C_GN  = 0x4DE0;
uint16_t C_RD  = 0xF840;
uint16_t C_WH  = 0xFFFF;
uint16_t C_SEP = 0x2945;

// for the multi theme that cycles
static int _multiIdx = 0;
static const uint16_t MULTI_C[] = {0xF800,0xFC00,0xFFE0,0x07E0,0x001F,0xF81F};

void applyTheme(){
  if(currentTheme == THEME_MULTI){
    // cycle thru colors
    C_OR  = MULTI_C[_multiIdx % 6];
    C_LO  = MULTI_C[(_multiIdx+1) % 6];
    C_DIM = 0x6B4D; C_BK = 0x0000;
  } else {
    C_OR  = themes[currentTheme].primary;
    C_LO  = themes[currentTheme].light;
    C_DIM = themes[currentTheme].dim;
    C_BK  = themes[currentTheme].bg;
  }
  // these ones stay the same no matter what
  C_GN = 0x4DE0; C_RD = 0xF840; C_WH = 0xFFFF; C_SEP = 0x2945;
}

// ================================================================
//  SETTINGS + FLAGS
// ================================================================
bool showStats       = false;
bool creditsWatched  = false;
bool performanceMode = false;  // turbo mode basically
bool speedrunMode    = false;  // secret ms timer
bool devMode         = false;  // shows heap n memory addresses
bool matrixMode      = false;  // green falling code thing
bool autoPause       = false;  // pauses if controller dies
int  frameSkip       = 0;      // 0-15, higher=faster but ugly
int  currentPalette  = 0;

// gameboy color palettes (the 4 shades of grey/green/whatever)
static const uint16_t PALETTES[][4] = {
  {0xFEE4, 0xFC00, 0x9A20, 0x3880}, // Amber
  {0x8FC0, 0x4E00, 0x2340, 0x0120}, // Classic (the og greenish one)
  {0xEF5C, 0xA534, 0x528A, 0x1084}, // Pocket
  {0xFFFF, 0xAD55, 0x52AA, 0x0000}, // Light (just greyscale)
  {0xF81F, 0xA00F, 0x500A, 0x1884}, // Neon <- this one slaps
  {0x07FF, 0x0410, 0x0208, 0x0000}, // Cyan
};
static const char* paletteNames[] = {"Amber","Classic","Pocket","Light","Neon","Cyan"};
#define PALETTE_COUNT 6

static uint16_t DMG[4] = {0xFEE4, 0xFC00, 0x9A20, 0x3880};

static void applyPalette(){
  for(int i=0;i<4;i++) DMG[i]=PALETTES[currentPalette][i];
}

// ================================================================
//  KONAMI CODE TRACKER
// ================================================================
static bool konamiUnlocked = false;
// up up down down left right left right B A <- legendary
static uint8_t konamiSeq[10] = {DPAD_UP,DPAD_UP,DPAD_DOWN,DPAD_DOWN,DPAD_LEFT,DPAD_RIGHT,DPAD_LEFT,DPAD_RIGHT,0,0};
static int konamiIdx = 0;
static uint32_t lastInputTime = 0;
static int selectPresses = 0;  // for dev mode unlock
static uint32_t matrixHoldStart = 0;

// ================================================================
//  ROM STATS (how long u played etc)
// ================================================================
struct RomStats {
  uint32_t playTimeSeconds;
  uint32_t lastSavedTimestamp;
  bool     isFavorite;
};

static RomStats romStats[MAX_ROM] = {};
static uint32_t playStartMs  = 0;
static uint32_t playTotalSec = 0;

// saves the stats to a .dat file next to the rom
// basically same name as rom but .dat instead of .gb
static void saveRomStats(int idx, const char *romName){
  char datPath[NL+6];
  strncpy(datPath, romName, NL-1);
  datPath[NL-1] = 0;
  char *dot = strrchr(datPath, '.');
  if(dot) strcpy(dot, ".dat");
  else strcat(datPath, ".dat");
  
  File f = SD.open(datPath, FILE_WRITE);
  if(f){
    f.write((uint8_t*)&romStats[idx], sizeof(RomStats));
    f.close();
  }
}

static void loadRomStats(int idx, const char *romName){
  char datPath[NL+6];
  strncpy(datPath, romName, NL-1);
  datPath[NL-1] = 0;
  char *dot = strrchr(datPath, '.');
  if(dot) strcpy(dot, ".dat");
  else strcat(datPath, ".dat");
  
  File f = SD.open(datPath, FILE_READ);
  if(f){
    f.read((uint8_t*)&romStats[idx], sizeof(RomStats));
    f.close();
  } else {
    // no file? just zero it out
    romStats[idx].playTimeSeconds = 0;
    romStats[idx].lastSavedTimestamp = 0;
    romStats[idx].isFavorite = false;
  }
}

// ================================================================
//  HARDWARE + GLOBAL JUNK
// ================================================================
TFT_eSPI tft = TFT_eSPI();
SPIClass sdspi(VSPI);

// memory banks. esp32 doesnt have enough ram for the whole rom
// so i cache chunks of it. bank0 is always loaded (first 16k)
// bank1 + bank2 swap around with LRU (least recently used)
// update: had to kill bank2 bc ran outta ram rip
static uint8_t   *bank0Cache = nullptr;
static uint8_t   *bank1Cache = nullptr;
static uint8_t   *bank2Cache = nullptr;
static uint32_t   bank1Base  = 0xFFFFFFFF;  // 0xFFFFFFFF = "nothing loaded"
static uint32_t   bank2Base  = 0xFFFFFFFF;
static uint32_t   bank1LRU   = 0;
static uint32_t   bank2LRU   = 0;
static uint32_t   lruCounter = 0;

static struct gb_s *gbp   = nullptr;  // peanut-gb emulator state
static uint16_t   *fbuf   = nullptr;  // framebuffer
static uint16_t   *lbuf   = nullptr;  // line buffer for 2x scaling
static uint8_t    *cram   = nullptr;  // cart ram (save data)
static bool        cramDirty = false; // did save data change?
static uint32_t    romsz  = 0;
static File        romf;

static float    fps      = 0;
static uint32_t fpsN     = 0;
static uint32_t fpsT     = 0;
static uint32_t lastSaveTime = 0;
static char     gTitle[17] = "";
static bool     isGBC = false;

static char rfn [MAX_ROM][NL];  // rom filenames
static char rdsp[MAX_ROM][NL];  // display names (no .gb)
static int  rcnt = 0;
static char currentRomFile[NL] = "";
static int  currentRomIdx = -1;

static ControllerPtr ctrl = nullptr;
void onConn(ControllerPtr c){ ctrl=c; Serial.println("[BT] controller connected :)"); }
void onDisc(ControllerPtr c){ ctrl=nullptr; Serial.println("[BT] disconnected :("); }

// ================================================================
//  ROM READING CALLBACKS (peanut-gb calls these)
// ================================================================
// this gets called a LOT so it needs to be fast. IRAM_ATTR puts it in fast ram
IRAM_ATTR uint8_t gb_rom_read(struct gb_s *gb, const uint_fast32_t a){
  if(a < ROMBANK) return bank0Cache[a];  // bank 0, easy
  
  uint32_t base = (a / ROMBANK) * ROMBANK;
  
  // is it already in bank1?
  if(base == bank1Base){
    bank1LRU = ++lruCounter;
    return bank1Cache[a - base];
  }
  
  // bank2?
  if(bank2Cache && base == bank2Base){
    bank2LRU = ++lruCounter;
    return bank2Cache[a - base];
  }
  
  // not cached, gotta load from SD. swap out whichever is older
  if(!bank2Cache || bank1LRU < bank2LRU){
    bank1Base = base;
    bank1LRU = ++lruCounter;
    uint32_t n = min((uint32_t)ROMBANK, romsz - base);
    romf.seek(base);
    romf.read(bank1Cache, n);
    return bank1Cache[a - base];
  } else {
    bank2Base = base;
    bank2LRU = ++lruCounter;
    uint32_t n = min((uint32_t)ROMBANK, romsz - base);
    romf.seek(base);
    romf.read(bank2Cache, n);
    return bank2Cache[a - base];
  }
}

IRAM_ATTR uint8_t gb_cart_ram_read(struct gb_s *g, const uint_fast32_t a){
  return (a < CRAM) ? cram[a] : 0xFF;
}

IRAM_ATTR void gb_cart_ram_write(struct gb_s *g, const uint_fast32_t a, const uint8_t v){
  if(a < CRAM){
    cram[a] = v;
    cramDirty = true;  // mark for saving later
  }
}

// error handler. i just ignore errors lol it usually works out
void gb_error(struct gb_s *g, const enum gb_error_e e, const uint16_t v){}

// called once per scanline. converts gb pixels to rgb565
IRAM_ATTR void lcd_draw_line(struct gb_s *gb, const uint8_t *px, const uint_fast8_t line){
  uint16_t *dst = fbuf + (int)line * GB_W;
  for(int x = 0; x < GB_W; x++) dst[x] = DMG[px[x] & 3];
}

// ================================================================
//  SAVE/LOAD SRAM (pokemon saves n stuff)
// ================================================================
static void saveSRAM(const char *romName){
  if(!cramDirty) return;  // nothing changed, skip
  
  // same trick as before, swap .gb for .sav
  char savePath[NL+6];
  strncpy(savePath, romName, NL-1);
  savePath[NL-1] = 0;
  char *dot = strrchr(savePath, '.');
  if(dot) strcpy(dot, ".sav");
  else strcat(savePath, ".sav");
  
  File saveFile = SD.open(savePath, FILE_WRITE);
  if(saveFile){
    saveFile.write(cram, CRAM);
    saveFile.close();
    cramDirty = false;
    
    // update when we last saved
    if(currentRomIdx >= 0){
      romStats[currentRomIdx].lastSavedTimestamp = millis() / 1000;
      saveRomStats(currentRomIdx, romName);
    }
    
    Serial.printf("[SAVE] wrote %s (%d bytes)\n", savePath, CRAM);
  } else {
    Serial.printf("[SAVE] couldnt write %s :(\n", savePath);
  }
}

static void loadSRAM(const char *romName){
  char savePath[NL+6];
  strncpy(savePath, romName, NL-1);
  savePath[NL-1] = 0;
  char *dot = strrchr(savePath, '.');
  if(dot) strcpy(dot, ".sav");
  else strcat(savePath, ".sav");
  
  Serial.printf("[SAVE] loading save for: %s -> %s\n", romName, savePath);
  
  File saveFile = SD.open(savePath, FILE_READ);
  if(saveFile){
    size_t bytesRead = saveFile.read(cram, CRAM);
    saveFile.close();
    cramDirty = false;
    Serial.printf("[SAVE] loaded %s (%d bytes)\n", savePath, bytesRead);
  } else {
    // no save = fresh start. fill w 0xFF bc thats what real carts do
    memset(cram, 0xFF, CRAM);
    cramDirty = false;
    Serial.printf("[SAVE] no save found, fresh start!\n");
  }
}

// ================================================================
//  LIL HELPERS FOR DRAWING TEXT (saves me typing the same stuff)
// ================================================================
// T = text. lazy name but whatever
static void T(int x,int y,const char *s,uint16_t fg,uint16_t bg,uint8_t sz=1){
  tft.setTextFont(1); tft.setTextSize(sz);
  tft.setTextColor(fg,bg); tft.setCursor(x,y); tft.print(s);
}

// TC = text centered
static void TC(int y,const char *s,uint16_t fg,uint16_t bg,uint8_t sz=1){
  T((SCRW-(int)strlen(s)*6*sz)/2,y,s,fg,bg,sz);
}

// horizontal line
static void HL(int y,uint16_t c=0xFFFF){ 
  tft.drawFastHLine(0,y,SCRW,c); 
}

static void topBar(const char *lbl){
  tft.fillRect(0,0,SCRW,18,C_BK); HL(0); HL(17);
  T(4,5,"> DASH OS",C_OR,C_BK,1);
  char b[42]; snprintf(b,sizeof(b),"[ %s ]",lbl);
  TC(5,b,C_WH,C_BK,1);
  T(SCRW-30,5,"v30",C_DIM,C_BK,1);
}

static void botBar(const char *h){
  tft.fillRect(0,SCRH-14,SCRW,14,C_BK); HL(SCRH-14);
  T(4,SCRH-10,h,C_DIM,C_BK,1);
}

// if something REALLY breaks, we come here and just give up
static void die(const char *msg){
  tft.fillScreen(C_BK); HL(0,C_RD);
  T(4, 8,"[ FATAL ]",C_RD,C_BK,2);
  T(4,30,msg,C_WH,C_BK,1);
  Serial.printf("[FATAL] %s\n",msg);
  while(true) delay(999);  // bye
}

// ================================================================
//  CONTROLLER INPUT
// ================================================================
// reads dpad. handles weird case where 8bitdo sends axis instead of dpad
static uint8_t dpv(){
  if(!ctrl) return 0;
  uint8_t d=0;
  if(ctrl->dpad()&0x01) d|=DPAD_UP;
  if(ctrl->dpad()&0x02) d|=DPAD_DOWN;
  if(ctrl->dpad()&0x04) d|=DPAD_RIGHT;
  if(ctrl->dpad()&0x08) d|=DPAD_LEFT;
  // my 8bitdo micro in switch mode sends axes not dpad bits. took me HOURS to figure out
  if(!d){
    int ax=ctrl->axisX(), ay=ctrl->axisY();
    if(ax < -200) d|=DPAD_LEFT;
    if(ax >  200) d|=DPAD_RIGHT;
    if(ay < -200) d|=DPAD_UP;
    if(ay >  200) d|=DPAD_DOWN;
  }
  return d;
}

// checks if ur doing the konami code
static void checkKonami(uint8_t input){
  // if u wait too long, reset
  if(millis() - lastInputTime > 1000) konamiIdx = 0;
  lastInputTime = millis();
  
  if(input == 0) return;
  
  uint8_t expected = konamiSeq[konamiIdx];
  if((expected & 0xF0) && (input & expected)){
    konamiIdx++;
  } else if(konamiIdx == 8 && (input & BUTTON_B)){
    konamiIdx++;
  } else if(konamiIdx == 9 && (input & BUTTON_A)){
    // WE DID IT
    konamiUnlocked = true;
    Serial.println("[EASTER EGG] KONAMI CODE!!! nice");
  } else {
    konamiIdx = 0;  // messed up, start over
  }
}

// ================================================================
//  PUSH FRAMEBUFFER TO THE SCREEN
// ================================================================
static void pushFrame(){
  int gfxW = GB_W * currentScale;
  int gfxH = GB_H * currentScale;
  // center it
  int gbX = (SCRW - gfxW) / 2;
  int gbY = (SCRH - gfxH) / 2;
  
  tft.startWrite();
  if(currentScale == 1){
    // just blast it to the screen, simple
    tft.setAddrWindow(gbX, gbY, GB_W, GB_H);
    tft.pushColors(fbuf, GB_W * GB_H, true);
  } else {
    // 2x mode: duplicate every pixel horizontally AND every line vertically
    tft.setAddrWindow(gbX, gbY, gfxW, gfxH);
    for(int y = 0; y < GB_H; y++){
      uint16_t *src = fbuf + y * GB_W;
      uint16_t *d = lbuf;
      for(int x = 0; x < GB_W; x++){ *d++ = src[x]; *d++ = src[x]; }
      // push the same line twice = vertical scaling
      tft.pushColors(lbuf, gfxW, true);
      tft.pushColors(lbuf, gfxW, true);
    }
  }
  tft.endWrite();
}

// ================================================================
//  BOOT SPLASH
// ================================================================
static void splashScreen(){
  tft.fillScreen(C_BK);
  TC(SCRH/2-40,">DASH OS",C_OR,C_BK,3);
  TC(SCRH/2,"ULTIMATE EDITION",C_LO,C_BK,2);
  TC(SCRH/2+30,"v30",C_DIM,C_BK,1);
  TC(SCRH/2+50,"press A or BOOT",C_DIM,C_BK,1);
  TC(SCRH-20,"by Pratik Dash",C_DIM,C_BK,1);
  
  // wait for button press
  while(true){
    BP32.update(); delay(10);
    if(digitalRead(BOOT_BTN)==LOW) break;
    if(ctrl&&(ctrl->buttons()&BUTTON_A)) break;
  }
  delay(100);
}

// ================================================================
//  FLOPPY DISK ROM MENU (THE COOL ONE)
// ================================================================
// types out text character by character. hacker movie vibes
static void typeText(int x, int y, const char *text, uint16_t color, int delayMs){
  char buf[64];
  int len = strlen(text);
  for(int i = 0; i <= len; i++){
    strncpy(buf, text, i);
    buf[i] = 0;
    tft.fillRect(x, y, SCRW-x, 12, C_BK);
    T(x, y, buf, color, C_BK, 1);
    if(delayMs > 0) delay(delayMs);
  }
}

// draws a big floppy disk w the rom info on it
// i looked up pics of real 3.5" floppies for reference
static void drawFloppyDisk(int idx){
  tft.fillScreen(C_BK);
  
  // figure out where to put it
  int fx = SCRW/2 - 100;
  int fy = 60;
  int fw = 200;
  int fh = 180;
  
  // main floppy body (dark grey)
  tft.fillRect(fx, fy, fw, fh, 0x2104);
  tft.drawRect(fx, fy, fw, fh, C_OR);
  tft.drawRect(fx+1, fy+1, fw-2, fh-2, C_OR);  // double border looks better
  
  // the silver metal slidey thing on top
  tft.fillRect(fx+20, fy+10, fw-40, 30, 0x632C);
  tft.drawRect(fx+20, fy+10, fw-40, 30, C_DIM);
  
  // white label area (like where u write "homework" or whatever)
  tft.fillRect(fx+15, fy+50, fw-30, 100, C_BK);
  tft.drawRect(fx+15, fy+50, fw-30, 100, C_LO);
  
  // rom name on the label
  TC(fy+60, rdsp[idx], C_OR, C_BK, 1);
  
  // stats w typing animation!! this part is my fav
  int statY = fy + 85;
  char buf[64];
  
  // size
  snprintf(buf, 64, "> SIZE: %u KB", romsz/1024);
  typeText(fx+25, statY, buf, C_WH, 10);
  statY += 16;
  
  // play time (convert secs to hrs/mins)
  uint32_t secs = romStats[idx].playTimeSeconds;
  snprintf(buf, 64, "> PLAYED: %uh %um", secs/3600, (secs%3600)/60);
  typeText(fx+25, statY, buf, C_GN, 10);
  statY += 16;
  
  // when u last saved
  if(romStats[idx].lastSavedTimestamp > 0){
    uint32_t ago = (millis()/1000) - romStats[idx].lastSavedTimestamp;
    snprintf(buf, 64, "> SAVED: %um ago", ago/60);
    typeText(fx+25, statY, buf, C_LO, 10);
  } else {
    typeText(fx+25, statY, "> SAVED: never", C_DIM, 10);
  }
  statY += 16;
  
  // star if favorited
  if(romStats[idx].isFavorite){
    typeText(fx+25, statY, "> FAVORITE: YES", C_OR, 10);
  }
  
  // write-protect notch thingy (the lil cutout on real floppies)
  tft.fillRect(fx+fw-15, fy+5, 10, 20, C_BK);
  
  // help text at bottom
  botBar("Left/Right:browse  A:launch  Y:fav  X:settings");
  
  // big star in corner if its a fav
  if(romStats[idx].isFavorite){
    T(fx+fw-25, fy+60, "*", C_OR, C_BK, 2);
  }
}

// main menu loop, returns which rom u picked (or -1 for exit)
static int floppyDiskMenu(){
  int sel = 0;
  
  // load stats for every rom first
  for(int i = 0; i < rcnt; i++){
    loadRomStats(i, rfn[i]);
  }
  
  drawFloppyDisk(sel);
  
  while(true){
    BP32.update();
    
    if(!ctrl){
      delay(20);
      continue;  // no controller, just wait
    }
    
    uint8_t d = dpv();
    uint32_t btn = ctrl->buttons();
    
    // swipe right = next rom
    if(d & DPAD_RIGHT){
      sel = (sel + 1) % rcnt;  // wrap around
      drawFloppyDisk(sel);
      delay(200);  // debounce
    }
    
    // swipe left = prev rom
    if(d & DPAD_LEFT){
      sel = (sel - 1 + rcnt) % rcnt;  // +rcnt so it doesnt go negative
      drawFloppyDisk(sel);
      delay(200);
    }
    
    // Y = toggle favorite
    if(btn & BUTTON_Y){
      romStats[sel].isFavorite = !romStats[sel].isFavorite;
      saveRomStats(sel, rfn[sel]);
      drawFloppyDisk(sel);
      delay(200);
    }
    
    // X = open settings from menu
    if(btn & BUTTON_X){
      settingsMenu();
      applyTheme();
      applyPalette();
      drawFloppyDisk(sel);
      delay(200);
    }
    
    // A = pick this one!!
    if(btn & BUTTON_A){
      delay(200);
      return sel;
    }
    
    // B = back out
    if(btn & BUTTON_B){
      delay(200);
      return -1;
    }
    
    delay(50);
  }
}

// ================================================================
//  CREDITS (scrolls like star wars)
// ================================================================
static void showCredits(){
  tft.fillScreen(C_BK);
  const char* credits[] = {
    "", "", "",
    "DASH OS ULTIMATE",
    "v30",
    "",
    "Created by",
    "PRATIK DASH",  // <- thats me :)
    "",
    "Powered by:",
    "- PEANUT-GB",
    "- TFT_eSPI",
    "- BLUEPAD32",
    "",
    "Special Thanks:",
    "Open Source Community",
    "",
    "Easter Eggs Found:",
    // show checkmark if unlocked, ? if not
    konamiUnlocked ? "CHECK Konami Code" : "? Konami Code",
    devMode ? "CHECK Dev Mode" : "? Dev Mode",
    speedrunMode ? "CHECK Speedrun Timer" : "? Speedrun Timer",
    "",
    "Press B to exit",
    "", ""
  };
  
  int numLines = sizeof(credits)/sizeof(credits[0]);
  int scrollY = SCRH;  // start offscreen at the bottom
  
  // scroll up until everything is offscreen
  while(scrollY > -numLines*20){
    BP32.update();
    if(ctrl && (ctrl->buttons()&BUTTON_B)) break;  // let em skip
    
    tft.fillScreen(C_BK);
    for(int i=0; i<numLines; i++){
      int y = scrollY + i*20;
      if(y > -20 && y < SCRH){  // only draw whats visible
        TC(y, credits[i], C_OR, C_BK, 1);
      }
    }
    scrollY -= 2;
    delay(50);
  }
  
  creditsWatched = true;  // they watched the whole thing, unlock snake
}

// ================================================================
//  SECRET SNAKE GAME (the reward for watching credits)
// ================================================================
#define SN_COLS 30
#define SN_ROWS 20
#define SN_CEL  10    // how big each cell is
#define SN_MAX  300   // max snake length. if u get this u r insane
#define SN_OFFX ((SCRW-SN_COLS*SN_CEL)/2)
#define SN_OFFY ((SCRH-SN_ROWS*SN_CEL)/2)

static void snakeDraw(Pt p, uint16_t c){
  tft.fillRect(SN_OFFX+p.x*SN_CEL, SN_OFFY+p.y*SN_CEL, SN_CEL-1, SN_CEL-1, c);
  // SN_CEL-1 leaves a lil gap so u can see the snake segments
}

static void secretSnake(){
  if(!creditsWatched) return;  // no cheating!!
  
  Pt *snake = (Pt*)malloc(SN_MAX*sizeof(Pt));
  if(!snake) return;  // outta memory rip
  
snrestart:  // yeah i used goto sue me lol
  tft.fillScreen(C_BK);
  topBar("SECRET SNAKE");
  botBar("D-Pad:move Y:pause A:restart B:exit");
  
  // draw arena border
  tft.drawRect(SN_OFFX-1, SN_OFFY-1, SN_COLS*SN_CEL+2, SN_ROWS*SN_CEL+2, C_OR);
  
  // start w 3 segments in the middle
  int snLen = 3;
  snake[0] = {SN_COLS/2, SN_ROWS/2};
  snake[1] = {SN_COLS/2-1, SN_ROWS/2};
  snake[2] = {SN_COLS/2-2, SN_ROWS/2};
  
  int sdx = 1, sdy = 0;  // start going right
  Pt food = {(int16_t)random(SN_COLS), (int16_t)random(SN_ROWS)};
  
  // draw initial snake + food
  for(int i=0; i<snLen; i++) snakeDraw(snake[i], i==0?C_OR:C_LO);
  snakeDraw(food, C_RD);
  
  int score = 0;
  int spd = 150;  // delay between moves (lower = faster)
  uint32_t lm = millis();
  bool paused = false;
  bool pheld = false;  // so it doesnt pause/unpause a million times
  
  char sc[20];
  snprintf(sc, 20, "Score: %d", score);
  T(SN_OFFX, 5, sc, C_WH, C_BK, 1);
  
  while(true){
    BP32.update();
    if(!ctrl){delay(20);continue;}
    
    uint32_t btn = ctrl->buttons();
    uint8_t d = dpv();
    
    if(btn & BUTTON_B){delay(200); free(snake); return;}
    if(btn & BUTTON_A){delay(200); goto snrestart;}
    if(btn & BUTTON_Y){
      if(!pheld){paused = !paused; pheld = true;}
    } else {pheld = false;}
    
    if(paused){
      TC(SCRH/2, "PAUSED", C_OR, C_BK, 2);
      delay(50);
      continue;
    }
    
    // change direction but u cant go backwards into urself
    if((d & DPAD_UP)    && sdy != 1)  {sdx = 0; sdy = -1;}
    if((d & DPAD_DOWN)  && sdy != -1) {sdx = 0; sdy = 1;}
    if((d & DPAD_LEFT)  && sdx != 1)  {sdx = -1; sdy = 0;}
    if((d & DPAD_RIGHT) && sdx != -1) {sdx = 1; sdy = 0;}
    
    // wait til its time for next move
    if(millis() - lm < (uint32_t)spd){delay(5); continue;}
    lm = millis();
    
    // figure out new head position
    Pt nh = {(int16_t)(snake[0].x + sdx), (int16_t)(snake[0].y + sdy)};
    
    // did we hit a wall?
    bool dead = (nh.x < 0 || nh.x >= SN_COLS || nh.y < 0 || nh.y >= SN_ROWS);
    // did we hit ourselves?
    if(!dead){
      for(int i=1; i<snLen; i++){
        if(nh.x == snake[i].x && nh.y == snake[i].y){
          dead = true;
          break;
        }
      }
    }
    
    if(dead){
      // death animation (flashes red)
      for(int f=0; f<8; f++){
        for(int i=0; i<snLen; i++) snakeDraw(snake[i], f%2 ? C_RD : C_BK);
        delay(80);
      }
      tft.fillRect(SN_OFFX, SN_OFFY, SN_COLS*SN_CEL, SN_ROWS*SN_CEL, C_BK);
      TC(SCRH/2-16, "GAME OVER", C_RD, C_BK, 2);
      snprintf(sc, 24, "Score: %d", score);
      TC(SCRH/2+6, sc, C_WH, C_BK, 1);
      TC(SCRH/2+22, "A:restart  B:exit", C_DIM, C_BK, 1);
      delay(400);
      
      // wait for input
      while(true){
        BP32.update();
        if(!ctrl){delay(20); continue;}
        uint32_t b2 = ctrl->buttons();
        if(b2 & BUTTON_A){delay(200); goto snrestart;}
        if(b2 & BUTTON_B){delay(200); free(snake); return;}
        delay(20);
      }
    }
    
    bool ate = (nh.x == food.x && nh.y == food.y);
    // only erase tail if we DIDNT eat (bc we grow)
    if(!ate) snakeDraw(snake[snLen-1], C_BK);
    if(ate && snLen < SN_MAX) snLen++;
    
    // shift all segments down by 1, new head at front
    for(int i = snLen-1; i > 0; i--) snake[i] = snake[i-1];
    snake[0] = nh;
    snakeDraw(snake[0], C_OR);
    if(snLen > 1) snakeDraw(snake[1], C_LO);  // redraw old head in lighter color
    
    if(ate){
      score++;
      spd = max(60, spd - 3);  // speed up a bit. 60 is the cap or its impossible
      
      // place new food somewhere NOT on the snake
      Pt nf;
      bool ok = false;
      while(!ok){
        nf = {(int16_t)random(SN_COLS), (int16_t)random(SN_ROWS)};
        ok = true;
        for(int i=0; i<snLen; i++){
          if(snake[i].x == nf.x && snake[i].y == nf.y){
            ok = false;
            break;
          }
        }
      }
      food = nf;
      snakeDraw(food, C_RD);
      
      // update score display
      snprintf(sc, 20, "Score: %d  ", score);
      tft.fillRect(SN_OFFX, 5, 120, 10, C_BK);
      T(SN_OFFX, 5, sc, C_WH, C_BK, 1);
    }
    
    delay(5);
  }
}

// ================================================================
//  SCAN SD CARD FOR ROMS
// ================================================================
static void scanRoms(){
  rcnt=0;
  File root=SD.open("/");
  if(!root) return;
  
  while(true){
    File e=root.openNextFile();
    if(!e||rcnt>=MAX_ROM) break;
    if(e.isDirectory()) continue;  // skip folders
    const char *n=e.name(); 
    int l=strlen(n);
    if(l<4) continue;
    // only .gb files. check last 3 chars case insensitive
    if(!(toupper(n[l-1])=='B'&&toupper(n[l-2])=='G'&&n[l-3]=='.')) continue;
    
    strncpy(rfn[rcnt],n,NL-1); 
    rfn[rcnt][NL-1]=0;
    strncpy(rdsp[rcnt],n,NL-1); 
    rdsp[rcnt][NL-1]=0;
    
    // strip the .gb off the display name
    int k; 
    for(k=l-1;k>=0;k--) 
      if(rdsp[rcnt][k]=='.'){
        rdsp[rcnt][k]=0;
        break;
      }
    rcnt++;
  }
  root.close();
}

static bool openRom(const char *name){
  if(romf) romf.close();  // close old one first
  char path[NL+2]; 
  snprintf(path,sizeof(path),"/%s",name);
  romf=SD.open(path);
  if(!romf) return false;
  romsz=romf.size(); 
  bank1Base=0xFFFFFFFF;  // reset cache
  
  // preload bank 0 (always needed)
  if(bank0Cache){
    uint32_t n=min((uint32_t)ROMBANK,romsz);
    romf.seek(0);
    if(romf.read(bank0Cache,n)!=n) return false;
  }
  
  return true;
}

// ================================================================
//  SETTINGS MENU
// ================================================================
static void settingsMenu(){
  enum { S_THEME, S_PALETTE, S_SCALE, S_SKIP, S_PERF, S_STATS, S_AUTOPAUSE, S_CREDITS, S_COUNT };
  int sel = 0;
  bool needRedraw = true;
  
  while(true){
    BP32.update();
    
    if(!ctrl){
      delay(20);
      continue;
    }
    
    // only redraw when something changed (saves time)
    if(needRedraw){
      tft.fillScreen(C_BK);
      topBar("SETTINGS");
      botBar("D-Pad:navigate A:select B:back Select:dev");
      
      int y = 30;
      char val[48];
      
      for(int i = 0; i < S_COUNT; i++){
        bool selected = (sel == i);
        // highlight the selected row
        tft.fillRect(0, y, SCRW, 28, selected ? 0x2104 : C_BK);
        uint16_t fg = selected ? C_OR : C_WH;
        uint16_t bg = selected ? 0x2104 : C_BK;
        
        const char* label = "";
        val[0] = 0;
        
        // giant if/else chain but whatever it works
        if(i == S_THEME){
          label = "Theme:";
          snprintf(val, 48, "%s", themeNames[currentTheme]);
        } else if(i == S_PALETTE){
          label = "Palette:";
          snprintf(val, 48, "%s", paletteNames[currentPalette]);
        } else if(i == S_SCALE){
          label = "Scale:";
          snprintf(val, 48, "%dx", currentScale);
        } else if(i == S_SKIP){
          label = "Frame Skip:";
          if(frameSkip == 0) snprintf(val, 48, "OFF");
          else snprintf(val, 48, "%d frames", frameSkip);
        } else if(i == S_PERF){
          label = "Performance Mode:";
          snprintf(val, 48, performanceMode ? "ON (TURBO)" : "OFF");
        } else if(i == S_STATS){
          label = "Show Stats:";
          snprintf(val, 48, showStats ? "ON" : "OFF");
        } else if(i == S_AUTOPAUSE){
          label = "Auto-Pause:";
          snprintf(val, 48, autoPause ? "ON" : "OFF");
        } else if(i == S_CREDITS){
          label = "Credits & Secrets";
          snprintf(val, 48, creditsWatched ? "UNLOCKED!" : "");
        }
        
        T(20, y+8, label, fg, bg, 1);
        if(val[0]) T(200, y+8, val, C_LO, bg, 1);
        
        y += 32;
      }
      
      needRedraw = false;
    }
    
    uint8_t d = dpv();
    uint32_t btn = ctrl->buttons();
    uint32_t misc = ctrl->miscButtons();
    
    if(d & DPAD_DOWN){ 
      sel = (sel+1) % S_COUNT; 
      needRedraw = true;
      delay(150); 
    }
    if(d & DPAD_UP){ 
      sel = (sel-1+S_COUNT) % S_COUNT; 
      needRedraw = true;
      delay(150); 
    }
    
    if(btn & BUTTON_A){
      // A cycles the selected option
      if(sel == S_THEME){
        currentTheme = (currentTheme+1) % THEME_COUNT;
        applyTheme();
      } else if(sel == S_PALETTE){
        currentPalette = (currentPalette+1) % PALETTE_COUNT;
        applyPalette();
      } else if(sel == S_SCALE){
        currentScale = (currentScale == 1) ? 2 : 1;  // just toggle 1x/2x
      } else if(sel == S_SKIP){
        frameSkip = (frameSkip + 1) % 16;  // 0-15
      } else if(sel == S_PERF){
        performanceMode = !performanceMode;
        if(performanceMode){
          // turbo preset: small screen, lots of skip, show fps
          currentScale = 1;
          frameSkip = 8;
          showStats = true;
        }
      } else if(sel == S_STATS){
        showStats = !showStats;
      } else if(sel == S_AUTOPAUSE){
        autoPause = !autoPause;
      } else if(sel == S_CREDITS){
        showCredits();
        if(creditsWatched) secretSnake();  // reward!!
      }
      needRedraw = true;
      delay(200);
    }
    
    if(btn & BUTTON_B){ 
      delay(200); 
      return; 
    }
    
    // EASTER EGG: hit select 10x = dev mode
    if(misc & MISC_BUTTON_SELECT){
      selectPresses++;
      if(selectPresses >= 10){
        devMode = !devMode;
        selectPresses = 0;
        tft.fillScreen(C_BK);
        TC(SCRH/2, devMode ? "DEV MODE ON" : "DEV MODE OFF", C_OR, C_BK, 2);
        delay(1000);
        needRedraw = true;
      }
      delay(200);
    }
    
    delay(20);
  }
}

// ================================================================
//  SETUP (runs once at boot)
// ================================================================
void setup(){
  // turn on the backlight first so we can see stuff
  pinMode(BL_PIN, OUTPUT); 
  digitalWrite(BL_PIN, HIGH);
  pinMode(BOOT_BTN, INPUT_PULLUP);

  // allocate all the big buffers. if any of these fail we r cooked
  fbuf = (uint16_t*)malloc(GB_W * GB_H * sizeof(uint16_t));
  bank0Cache = (uint8_t*)malloc(ROMBANK);
  bank1Cache = (uint8_t*)malloc(ROMBANK);
  bank2Cache = nullptr;  // no room for bank2, sad but it works
  cram = (uint8_t*)malloc(CRAM);
  gbp  = (struct gb_s*)malloc(sizeof(struct gb_s));
  lbuf = (uint16_t*)malloc(GB_W * 2 * sizeof(uint16_t));

  // if any malloc failed, blink the backlight forever to signal :(
  if(!fbuf||!bank0Cache||!bank1Cache||!cram||!gbp||!lbuf){
    while(true){ 
      digitalWrite(BL_PIN,HIGH); 
      delay(150); 
      digitalWrite(BL_PIN,LOW); 
      delay(150); 
    }
  }
  
  memset(cram, 0xFF, CRAM);  // init save ram

  Serial.begin(115200); 
  delay(100);
  Serial.println("[BOOT] DASH OS ULTIMATE v30 lets goooo");
  Serial.printf("[MEM] free=%u\n", ESP.getFreeHeap());

  // SD card setup. this was SO annoying to get working
  pinMode(SD_CS, OUTPUT);
  digitalWrite(SD_CS, HIGH);
  delay(200);
  sdspi.begin(18,19,23,SD_CS);
  delay(200);
  
  // try at slow speed first (400khz)
  bool sdOK = SD.begin(SD_CS, sdspi, 400000);
  if(!sdOK){
    // sometimes it fails the first time, try again
    delay(400); 
    digitalWrite(SD_CS, HIGH); 
    delay(100);
    sdOK = SD.begin(SD_CS, sdspi, 400000);
  }
  
  if(sdOK){
    // if slow worked, try fast. fall back if it doesnt
    SD.end();
    delay(50);
    sdOK = SD.begin(SD_CS, sdspi, 25000000);  // 25mhz, spicy
    if(!sdOK) sdOK = SD.begin(SD_CS, sdspi, 20000000);
    if(!sdOK) sdOK = SD.begin(SD_CS, sdspi, 10000000);
  }
  
  Serial.printf("[SD] init %s  heap=%u\n", sdOK?"OK":"FAILED", ESP.getFreeHeap());
  if(!sdOK){ while(true) delay(999); }  // no SD = no fun, just hang

  applyTheme();
  applyPalette();
  tft.init(); 
  tft.setRotation(ROT); 
  tft.fillScreen(C_BK);

  BP32.setup(&onConn, &onDisc);
  splashScreen();
  
  // wait for controller to connect (cant do much w/o it)
  while(!ctrl){ BP32.update(); delay(50); }
}

// ================================================================
//  MAIN LOOP (runs forever)
// ================================================================
enum State{MENU, PLAYING};
static State st = MENU;

void loop(){
  BP32.update();

  if(st == MENU){
    tft.fillScreen(C_BK);
    scanRoms();
    if(rcnt == 0) die("no .gb files on SD");  // put some roms on it dummy

    int pick = floppyDiskMenu();
    if(pick < 0){
      // user bailed, reboot the whole thing
      delay(1000);
      ESP.restart();
    }
    
    currentRomIdx = pick;
    if(!openRom(rfn[pick])) die("ROM open failed");
    
    strncpy(currentRomFile, rfn[pick], NL-1);
    currentRomFile[NL-1] = 0;

    tft.fillScreen(C_BK);

    // reset rom bank caches for new game
    bank1Base = bank2Base = 0xFFFFFFFF;
    bank1LRU = bank2LRU = 0;
    lruCounter = 0;

    // grab the game title from the rom header (offset 0x134)
    memset(gTitle, 0, sizeof(gTitle));
    for(int k = 0; k < 16; k++){
      uint8_t cc = bank0Cache[0x134+k];
      gTitle[k] = (cc>=32 && cc<127) ? (char)cc : 0;  // printable ascii only
    }

    // check if its gameboy color (we dont support GBC but good to know)
    isGBC = (bank0Cache[0x0143] == 0x80 || bank0Cache[0x0143] == 0xC0);
    Serial.printf("[ROM] %s, GBC: %s\n", gTitle, isGBC ? "YES" : "NO");

    loadSRAM(currentRomFile);

    // fire up the emulator!!!
    enum gb_init_error_e err = gb_init(gbp, gb_rom_read, gb_cart_ram_read,
                                       gb_cart_ram_write, gb_error, nullptr);
    if(err != GB_INIT_NO_ERROR) die("gb_init failed");
    
    gb_init_lcd(gbp, lcd_draw_line);
    gbp->direct.frame_skip = frameSkip;
    gbp->direct.interlace  = 0;
    gbp->direct.joypad     = 0xFF;  // 0xFF = no buttons pressed (inverted)

    playStartMs = millis();
    playTotalSec = 0;
    fpsN = 0; 
    fpsT = millis(); 
    fps = 0;
    
    st = PLAYING;
    return;
  }

  if(st == PLAYING){
    uint32_t btn  = ctrl ? ctrl->buttons() : 0;
    uint32_t misc = ctrl ? ctrl->miscButtons() : 0;
    uint8_t  d    = dpv();

    // check konami code (could happen anytime)
    checkKonami(d | btn);
    
    // EASTER EGG: Start+Select+B+A all at once = speedrun timer
    if((misc & MISC_BUTTON_START) && (misc & MISC_BUTTON_SELECT) && 
       (btn & BUTTON_A) && (btn & BUTTON_B)){
      speedrunMode = !speedrunMode;
      delay(500);
    }

    // X+Y = open settings while playing
    if((btn & BUTTON_X) && (btn & BUTTON_Y)){
      settingsMenu();
      applyTheme(); 
      applyPalette();
      gbp->direct.frame_skip = frameSkip;
      tft.fillScreen(C_BK);
      fpsN = 0; 
      fpsT = millis();
      return;
    }

    // B+A held = exit back to menu (+save everything)
    if((btn & BUTTON_A) && (btn & BUTTON_B)){
      delay(400);
      
      // save SRAM + update play time
      saveSRAM(currentRomFile);
      uint32_t sessionSecs = (millis() - playStartMs) / 1000;
      romStats[currentRomIdx].playTimeSeconds += sessionSecs;
      saveRomStats(currentRomIdx, currentRomFile);
      
      tft.fillScreen(C_BK);
      st = MENU;
      return;
    }

    // map our controller buttons to gameboy button bits
    // gb wants: bit0=A bit1=B bit2=Select bit3=Start bit4=Right bit5=Left bit6=Up bit7=Down
    // wait i had A and B swapped in comments lol let me just keep the code
    uint8_t joy = 0;
    if(d & DPAD_RIGHT) joy |= (1<<4);
    if(d & DPAD_LEFT)  joy |= (1<<5);
    if(d & DPAD_UP)    joy |= (1<<6);
    if(d & DPAD_DOWN)  joy |= (1<<7);
    if(btn & BUTTON_B) joy |= (1<<0);
    if(btn & BUTTON_A) joy |= (1<<1);
    if(misc & MISC_BUTTON_START)  joy |= (1<<3);
    if(misc & MISC_BUTTON_SELECT) joy |= (1<<2);
    gbp->direct.joypad = ~joy;  // gb wants it inverted (0=pressed)

    // THE ACTUAL EMULATION HAPPENS HERE
    gb_run_frame(gbp);
    pushFrame();

    // draw little status bar under the gameboy screen
    int gfxW = GB_W * currentScale;
    int gfxH = GB_H * currentScale;
    int gbY = (SCRH - gfxH) / 2;
    
    // only if theres room for it
    if(gbY + gfxH < SCRH - 16){
      int barY = gbY + gfxH + 2;
      tft.fillRect(0, barY, SCRW, 14, C_BK);
      
      // fps on the left
      char fpsStr[16];
      snprintf(fpsStr, 16, "%.0f FPS", fps);
      T(4, barY+2, fpsStr, C_GN, C_BK, 1);
      
      // PERF badge if turbo mode on
      if(performanceMode){
        T(SCRW-40, barY+2, "PERF", C_OR, C_BK, 1);
      }
    }

    // overlay stats at the top if enabled
    if(showStats){
      char buf[32];
      snprintf(buf, 32, "FPS:%.0f", fps);
      T(4, 4, buf, C_GN, C_BK, 1);
      
      if(performanceMode){
        T(SCRW-40, 4, "PERF", C_OR, C_BK, 1);
      }
      
      // dev mode shows free heap (useful for debugging)
      if(devMode){
        snprintf(buf, 32, "HEAP:%u", ESP.getFreeHeap());
        T(4, 16, buf, C_DIM, C_BK, 1);
      }
      
      // speedrun timer w ms precision
      if(speedrunMode){
        uint32_t ms = millis() - playStartMs;
        snprintf(buf, 32, "%02lu:%02lu.%03lu", 
                 ms/60000, (ms/1000)%60, ms%1000);
        TC(4, buf, C_OR, C_BK, 1);
      }
    }

    // update fps counter once a second
    fpsN++;
    uint32_t now = millis();
    if(now - fpsT >= 1000){
      fps = (float)fpsN * 1000.0f / (float)(now - fpsT);
      fpsN = 0; 
      fpsT = now;
    }
    
    // autosave every 10 sec so u dont lose stuff if battery dies
    if(now - lastSaveTime > 10000){
      saveSRAM(currentRomFile);
      lastSaveTime = now;
    }
  }
}
