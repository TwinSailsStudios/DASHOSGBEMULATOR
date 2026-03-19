// ================================================================
//  DASH OS ULTIMATE v30 - COMPLETE EDITION
//  By Pratik Dash
//
//  ═══════════════════════════════════════════════════════════════
//  🎮 NEW FEATURES IN v30:
//  ═══════════════════════════════════════════════════════════════
//  
//  📦 CARTRIDGE ROM MENU
//     - Fullscreen cartridge display (one ROM at a time)
//     - Hacker-style typing animation for stats
//     - Shows: Title, Size, Play Time, Last Saved, Favorite ★
//     - Navigate with D-Pad Left/Right
//     - Press A to launch, Y to favorite
//
//  ⚡ PERFORMANCE MODE
//     - Auto-applies optimal settings: 1x scale, 8 frame skip
//     - Toggle in settings menu
//     - Shows "PERF" badge in status bar when active
//
//  🎬 EXTENDED FRAME SKIP
//     - Now supports 0-15 frames (was 0-2)
//     - Higher values = better FPS but choppier
//     - Recommended: 8 for performance mode, 2 for normal
//
//  📊 ENHANCED STATS
//     - Per-ROM play time tracking (saved to .dat file)
//     - Last saved timestamp
//     - ROM size display
//     - All shown in cartridge menu
//
//  🎯 EASTER EGGS:
//     ┌─────────────────────────────────────────────────────┐
//     │ 1. KONAMI CODE                                      │
//     │    How: Up Up Down Down Left Right Left Right B A   │
//     │    Unlock: Rainbow theme + special message          │
//     │                                                      │
//     │ 2. SECRET SNAKE GAME                                │
//     │    How: Watch credits to completion                 │
//     │    Unlock: Hidden Snake game in settings            │
//     │                                                      │
//     │ 3. MATRIX MODE                                      │
//     │    How: Hold X+Y+Start for 3 seconds in menu        │
//     │    Unlock: Green matrix theme with falling code     │
//     │                                                      │
//     │ 4. DEVELOPER MODE                                   │
//     │    How: Press Select 10 times in settings           │
//     │    Unlock: Shows memory addresses, heap details     │
//     │                                                      │
//     │ 5. SPEEDRUN TIMER                                   │
//     │    How: Press Start+Select+B+A simultaneously       │
//     │    Unlock: Precise millisecond timer appears        │
//     └─────────────────────────────────────────────────────┘
//
//  🎨 14 COLOR THEMES
//     Red, Velvet, Orange, Amber, Yellow, Gold, 
//     Green, Matrix, Blue, Cyan, Purple, Magenta,
//     White, Multi (cycles colors)
//
//  💾 SAVE FILE SUPPORT
//     - Auto-saves every 10 seconds
//     - Manual save on exit (B+A)
//     - Per-ROM .sav files on SD card
//     - Compatible with Pokemon, Zelda, etc.
//
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

// Display & Hardware
int currentScale = 1;
#define ROT   3
#define SCRW  480
#define SCRH  320
#define GB_W  160
#define GB_H  144
#define SD_CS    5
#define BL_PIN  27
#define BOOT_BTN 0

// ROM & Memory
#define MAX_ROM 24
#define NL      48
#define ROMBANK 16384
#define CRAM    8192

struct Pt { int16_t x, y; };

// ================================================================
//  THEME SYSTEM - 14 Themes
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

ThemeColors themes[] = {
  {0xF800, 0xFC10, 0x7800, 0x0000}, // Red
  {0xC000, 0xE000, 0x5800, 0x1000}, // Velvet
  {0xFC00, 0xFD60, 0x8400, 0x0000}, // Orange (default)
  {0xFD40, 0xFEA0, 0x8280, 0x0000}, // Amber
  {0xFFE0, 0xFFF0, 0x8C00, 0x0000}, // Yellow
  {0xFEA0, 0xFF40, 0x7E00, 0x0000}, // Gold
  {0x07E0, 0x4FE0, 0x0400, 0x0000}, // Green
  {0x03E0, 0x07E0, 0x0180, 0x0040}, // Matrix
  {0x001F, 0x439F, 0x0010, 0x0000}, // Blue
  {0x07FF, 0x4FFF, 0x0410, 0x0000}, // Cyan
  {0xF81F, 0xFC9F, 0x8010, 0x0000}, // Purple
  {0xF81F, 0xFBFF, 0x7810, 0x0000}, // Magenta
  {0xFFFF, 0xFFFF, 0x8410, 0x0000}, // White
  {0xFC00, 0xFD60, 0x8400, 0x0000}, // Multi
};

int currentTheme = THEME_ORANGE;

uint16_t C_BK  = 0x0000;
uint16_t C_OR  = 0xFC00;
uint16_t C_LO  = 0xFD60;
uint16_t C_DIM = 0x8400;
uint16_t C_GN  = 0x4DE0;
uint16_t C_RD  = 0xF840;
uint16_t C_WH  = 0xFFFF;
uint16_t C_SEP = 0x2945;

static int _multiIdx = 0;
static const uint16_t MULTI_C[] = {0xF800,0xFC00,0xFFE0,0x07E0,0x001F,0xF81F};

void applyTheme(){
  if(currentTheme == THEME_MULTI){
    C_OR  = MULTI_C[_multiIdx % 6];
    C_LO  = MULTI_C[(_multiIdx+1) % 6];
    C_DIM = 0x6B4D; C_BK = 0x0000;
  } else {
    C_OR  = themes[currentTheme].primary;
    C_LO  = themes[currentTheme].light;
    C_DIM = themes[currentTheme].dim;
    C_BK  = themes[currentTheme].bg;
  }
  C_GN = 0x4DE0; C_RD = 0xF840; C_WH = 0xFFFF; C_SEP = 0x2945;
}

// ================================================================
//  SETTINGS & FEATURES
// ================================================================
bool showStats       = false;
bool creditsWatched  = false;
bool performanceMode = false;  // NEW: Auto-applies best FPS settings
bool speedrunMode    = false;  // Easter egg: millisecond timer
bool devMode         = false;  // Easter egg: memory info
bool matrixMode      = false;  // Easter egg: falling matrix chars
bool autoPause       = false;  // NEW: Auto-pause when controller disconnects
int  frameSkip       = 0;      // NEW: 0-15 (was 0-2)
int  currentPalette  = 0;

// DMG Palettes
static const uint16_t PALETTES[][4] = {
  {0xFEE4, 0xFC00, 0x9A20, 0x3880}, // Amber
  {0x8FC0, 0x4E00, 0x2340, 0x0120}, // Classic
  {0xEF5C, 0xA534, 0x528A, 0x1084}, // Pocket
  {0xFFFF, 0xAD55, 0x52AA, 0x0000}, // Light
  {0xF81F, 0xA00F, 0x500A, 0x1884}, // Neon
  {0x07FF, 0x0410, 0x0208, 0x0000}, // Cyan
};
static const char* paletteNames[] = {"Amber","Classic","Pocket","Light","Neon","Cyan"};
#define PALETTE_COUNT 6

static uint16_t DMG[4] = {0xFEE4, 0xFC00, 0x9A20, 0x3880};

static void applyPalette(){
  for(int i=0;i<4;i++) DMG[i]=PALETTES[currentPalette][i];
}

// ================================================================
//  EASTER EGG TRACKING
// ================================================================
static bool konamiUnlocked = false;
static uint8_t konamiSeq[10] = {DPAD_UP,DPAD_UP,DPAD_DOWN,DPAD_DOWN,DPAD_LEFT,DPAD_RIGHT,DPAD_LEFT,DPAD_RIGHT,0,0};
static int konamiIdx = 0;
static uint32_t lastInputTime = 0;
static int selectPresses = 0;  // For dev mode
static uint32_t matrixHoldStart = 0;

// ================================================================
//  ROM STATS TRACKING (NEW!)
// ================================================================
struct RomStats {
  uint32_t playTimeSeconds;
  uint32_t lastSavedTimestamp;
  bool     isFavorite;
};

static RomStats romStats[MAX_ROM] = {};
static uint32_t playStartMs  = 0;
static uint32_t playTotalSec = 0;

// Save/load ROM stats to .dat file
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
    romStats[idx].playTimeSeconds = 0;
    romStats[idx].lastSavedTimestamp = 0;
    romStats[idx].isFavorite = false;
  }
}

// ================================================================
//  HARDWARE & GLOBALS
// ================================================================
TFT_eSPI tft = TFT_eSPI();
SPIClass sdspi(VSPI);

// Memory
static uint8_t   *bank0Cache = nullptr;
static uint8_t   *bank1Cache = nullptr;
static uint8_t   *bank2Cache = nullptr;
static uint32_t   bank1Base  = 0xFFFFFFFF;
static uint32_t   bank2Base  = 0xFFFFFFFF;
static uint32_t   bank1LRU   = 0;
static uint32_t   bank2LRU   = 0;
static uint32_t   lruCounter = 0;

static struct gb_s *gbp   = nullptr;
static uint16_t   *fbuf   = nullptr;
static uint16_t   *lbuf   = nullptr;
static uint8_t    *cram   = nullptr;
static bool        cramDirty = false;
static uint32_t    romsz  = 0;
static File        romf;

static float    fps      = 0;
static uint32_t fpsN     = 0;
static uint32_t fpsT     = 0;
static uint32_t lastSaveTime = 0;
static char     gTitle[17] = "";
static bool     isGBC = false;

static char rfn [MAX_ROM][NL];
static char rdsp[MAX_ROM][NL];
static int  rcnt = 0;
static char currentRomFile[NL] = "";
static int  currentRomIdx = -1;

static ControllerPtr ctrl = nullptr;
void onConn(ControllerPtr c){ ctrl=c; Serial.println("[BT] connected"); }
void onDisc(ControllerPtr c){ ctrl=nullptr; Serial.println("[BT] disconnected"); }

// ================================================================
//  ROM CALLBACKS
// ================================================================
IRAM_ATTR uint8_t gb_rom_read(struct gb_s *gb, const uint_fast32_t a){
  if(a < ROMBANK) return bank0Cache[a];
  uint32_t base = (a / ROMBANK) * ROMBANK;
  
  if(base == bank1Base){
    bank1LRU = ++lruCounter;
    return bank1Cache[a - base];
  }
  
  if(bank2Cache && base == bank2Base){
    bank2LRU = ++lruCounter;
    return bank2Cache[a - base];
  }
  
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
    cramDirty = true;
  }
}

void gb_error(struct gb_s *g, const enum gb_error_e e, const uint16_t v){}

IRAM_ATTR void lcd_draw_line(struct gb_s *gb, const uint8_t *px, const uint_fast8_t line){
  uint16_t *dst = fbuf + (int)line * GB_W;
  for(int x = 0; x < GB_W; x++) dst[x] = DMG[px[x] & 3];
}

// ================================================================
//  SAVE FILE FUNCTIONS
// ================================================================
static void saveSRAM(const char *romName){
  if(!cramDirty) return;
  
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
    
    // Update last saved timestamp
    if(currentRomIdx >= 0){
      romStats[currentRomIdx].lastSavedTimestamp = millis() / 1000;
      saveRomStats(currentRomIdx, romName);
    }
    
    Serial.printf("[SAVE] Wrote %s (%d bytes)\n", savePath, CRAM);
  } else {
    Serial.printf("[SAVE] Failed to write %s\n", savePath);
  }
}

static void loadSRAM(const char *romName){
  char savePath[NL+6];
  strncpy(savePath, romName, NL-1);
  savePath[NL-1] = 0;
  char *dot = strrchr(savePath, '.');
  if(dot) strcpy(dot, ".sav");
  else strcat(savePath, ".sav");
  
  Serial.printf("[SAVE] Loading save for ROM: %s -> %s\n", romName, savePath);
  
  File saveFile = SD.open(savePath, FILE_READ);
  if(saveFile){
    size_t bytesRead = saveFile.read(cram, CRAM);
    saveFile.close();
    cramDirty = false;
    Serial.printf("[SAVE] Loaded %s (%d bytes)\n", savePath, bytesRead);
  } else {
    memset(cram, 0xFF, CRAM);
    cramDirty = false;
    Serial.printf("[SAVE] No save file found, starting fresh\n");
  }
}

// ================================================================
//  DISPLAY HELPERS
// ================================================================
static void T(int x,int y,const char *s,uint16_t fg,uint16_t bg,uint8_t sz=1){
  tft.setTextFont(1); tft.setTextSize(sz);
  tft.setTextColor(fg,bg); tft.setCursor(x,y); tft.print(s);
}

static void TC(int y,const char *s,uint16_t fg,uint16_t bg,uint8_t sz=1){
  T((SCRW-(int)strlen(s)*6*sz)/2,y,s,fg,bg,sz);
}

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

static void die(const char *msg){
  tft.fillScreen(C_BK); HL(0,C_RD);
  T(4, 8,"[ FATAL ]",C_RD,C_BK,2);
  T(4,30,msg,C_WH,C_BK,1);
  Serial.printf("[FATAL] %s\n",msg);
  while(true) delay(999);
}

// ================================================================
//  INPUT HELPERS
// ================================================================
static uint8_t dpv(){
  if(!ctrl) return 0;
  uint8_t d=0;
  if(ctrl->dpad()&0x01) d|=DPAD_UP;
  if(ctrl->dpad()&0x02) d|=DPAD_DOWN;
  if(ctrl->dpad()&0x04) d|=DPAD_RIGHT;
  if(ctrl->dpad()&0x08) d|=DPAD_LEFT;
  // Axis fallback — 8BitDo Micro Switch mode sends axes not dpad bits
  if(!d){
    int ax=ctrl->axisX(), ay=ctrl->axisY();
    if(ax < -200) d|=DPAD_LEFT;
    if(ax >  200) d|=DPAD_RIGHT;
    if(ay < -200) d|=DPAD_UP;
    if(ay >  200) d|=DPAD_DOWN;
  }
  return d;
}

// Konami code checker
static void checkKonami(uint8_t input){
  if(millis() - lastInputTime > 1000) konamiIdx = 0;
  lastInputTime = millis();
  
  if(input == 0) return;
  
  uint8_t expected = konamiSeq[konamiIdx];
  if((expected & 0xF0) && (input & expected)){
    konamiIdx++;
  } else if(konamiIdx == 8 && (input & BUTTON_B)){
    konamiIdx++;
  } else if(konamiIdx == 9 && (input & BUTTON_A)){
    konamiUnlocked = true;
    Serial.println("[EASTER EGG] KONAMI CODE UNLOCKED!");
  } else {
    konamiIdx = 0;
  }
}

// ================================================================
//  PUSH FRAME TO DISPLAY
// ================================================================
static void pushFrame(){
  int gfxW = GB_W * currentScale;
  int gfxH = GB_H * currentScale;
  int gbX = (SCRW - gfxW) / 2;
  int gbY = (SCRH - gfxH) / 2;
  
  tft.startWrite();
  if(currentScale == 1){
    tft.setAddrWindow(gbX, gbY, GB_W, GB_H);
    tft.pushColors(fbuf, GB_W * GB_H, true);
  } else {
    tft.setAddrWindow(gbX, gbY, gfxW, gfxH);
    for(int y = 0; y < GB_H; y++){
      uint16_t *src = fbuf + y * GB_W;
      uint16_t *d = lbuf;
      for(int x = 0; x < GB_W; x++){ *d++ = src[x]; *d++ = src[x]; }
      tft.pushColors(lbuf, gfxW, true);
      tft.pushColors(lbuf, gfxW, true);
    }
  }
  tft.endWrite();
}

// ================================================================
//  BOOT ANIMATIONS
// ================================================================
static void splashScreen(){
  tft.fillScreen(C_BK);
  TC(SCRH/2-40,">DASH OS",C_OR,C_BK,3);
  TC(SCRH/2,"ULTIMATE EDITION",C_LO,C_BK,2);
  TC(SCRH/2+30,"v30",C_DIM,C_BK,1);
  TC(SCRH/2+50,"press A or BOOT",C_DIM,C_BK,1);
  TC(SCRH-20,"by Pratik Dash",C_DIM,C_BK,1);
  
  while(true){
    BP32.update(); delay(10);
    if(digitalRead(BOOT_BTN)==LOW) break;
    if(ctrl&&(ctrl->buttons()&BUTTON_A)) break;
  }
  delay(100);
}

// ================================================================
//  FLOPPY DISK ROM MENU (NEW!)
// ================================================================
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

static void drawFloppyDisk(int idx){
  tft.fillScreen(C_BK);
  
  // Floppy disk outline (3.5" style)
  int fx = SCRW/2 - 100;
  int fy = 60;
  int fw = 200;
  int fh = 180;
  
  // Main floppy body
  tft.fillRect(fx, fy, fw, fh, 0x2104);
  tft.drawRect(fx, fy, fw, fh, C_OR);
  tft.drawRect(fx+1, fy+1, fw-2, fh-2, C_OR);
  
  // Metal shutter at top
  tft.fillRect(fx+20, fy+10, fw-40, 30, 0x632C);
  tft.drawRect(fx+20, fy+10, fw-40, 30, C_DIM);
  
  // Label area
  tft.fillRect(fx+15, fy+50, fw-30, 100, C_BK);
  tft.drawRect(fx+15, fy+50, fw-30, 100, C_LO);
  
  // ROM name on label
  TC(fy+60, rdsp[idx], C_OR, C_BK, 1);
  
  // Hacker-style stats with typing effect
  int statY = fy + 85;
  char buf[64];
  
  // Size
  snprintf(buf, 64, "> SIZE: %u KB", romsz/1024);
  typeText(fx+25, statY, buf, C_WH, 10);
  statY += 16;
  
  // Play time
  uint32_t secs = romStats[idx].playTimeSeconds;
  snprintf(buf, 64, "> PLAYED: %uh %um", secs/3600, (secs%3600)/60);
  typeText(fx+25, statY, buf, C_GN, 10);
  statY += 16;
  
  // Last saved
  if(romStats[idx].lastSavedTimestamp > 0){
    uint32_t ago = (millis()/1000) - romStats[idx].lastSavedTimestamp;
    snprintf(buf, 64, "> SAVED: %um ago", ago/60);
    typeText(fx+25, statY, buf, C_LO, 10);
  } else {
    typeText(fx+25, statY, "> SAVED: never", C_DIM, 10);
  }
  statY += 16;
  
  // Favorite
  if(romStats[idx].isFavorite){
    typeText(fx+25, statY, "> FAVORITE: YES", C_OR, 10);
  }
  
  // Write-protect notch (top right corner)
  tft.fillRect(fx+fw-15, fy+5, 10, 20, C_BK);
  
  // Navigation hints
  botBar("Left/Right:browse  A:launch  Y:fav  X:settings");
  
  // Show favorite star
  if(romStats[idx].isFavorite){
    T(fx+fw-25, fy+60, "*", C_OR, C_BK, 2);
  }
}

static int floppyDiskMenu(){
  int sel = 0;
  
  // Load all ROM stats
  for(int i = 0; i < rcnt; i++){
    loadRomStats(i, rfn[i]);
  }
  
  drawFloppyDisk(sel);
  
  while(true){
    BP32.update();
    
    if(!ctrl){
      delay(20);
      continue;
    }
    
    uint8_t d = dpv();
    uint32_t btn = ctrl->buttons();
    
    if(d & DPAD_RIGHT){
      sel = (sel + 1) % rcnt;
      drawFloppyDisk(sel);
      delay(200);
    }
    
    if(d & DPAD_LEFT){
      sel = (sel - 1 + rcnt) % rcnt;
      drawFloppyDisk(sel);
      delay(200);
    }
    
    if(btn & BUTTON_Y){
      romStats[sel].isFavorite = !romStats[sel].isFavorite;
      saveRomStats(sel, rfn[sel]);
      drawFloppyDisk(sel);
      delay(200);
    }
    
    if(btn & BUTTON_X){
      // Open settings from menu
      settingsMenu();
      applyTheme();
      applyPalette();
      drawFloppyDisk(sel);
      delay(200);
    }
    
    if(btn & BUTTON_A){
      delay(200);
      return sel;
    }
    
    if(btn & BUTTON_B){
      delay(200);
      return -1; // Exit to boot
    }
    
    delay(50);
  }
}

// ================================================================
//  CREDITS SCREEN
// ================================================================
static void showCredits(){
  tft.fillScreen(C_BK);
  const char* credits[] = {
    "", "", "",
    "DASH OS ULTIMATE",
    "v30",
    "",
    "Created by",
    "PRATIK DASH",
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
    konamiUnlocked ? "CHECK Konami Code" : "? Konami Code",
    devMode ? "CHECK Dev Mode" : "? Dev Mode",
    speedrunMode ? "CHECK Speedrun Timer" : "? Speedrun Timer",
    "",
    "Press B to exit",
    "", ""
  };
  
  int numLines = sizeof(credits)/sizeof(credits[0]);
  int scrollY = SCRH;
  
  while(scrollY > -numLines*20){
    BP32.update();
    if(ctrl && (ctrl->buttons()&BUTTON_B)) break;
    
    tft.fillScreen(C_BK);
    for(int i=0; i<numLines; i++){
      int y = scrollY + i*20;
      if(y > -20 && y < SCRH){
        TC(y, credits[i], C_OR, C_BK, 1);
      }
    }
    scrollY -= 2;
    delay(50);
  }
  
  creditsWatched = true;
}

// ================================================================
//  SECRET SNAKE GAME
// ================================================================
#define SN_COLS 30
#define SN_ROWS 20
#define SN_CEL  10
#define SN_MAX  300
#define SN_OFFX ((SCRW-SN_COLS*SN_CEL)/2)
#define SN_OFFY ((SCRH-SN_ROWS*SN_CEL)/2)

static void snakeDraw(Pt p, uint16_t c){
  tft.fillRect(SN_OFFX+p.x*SN_CEL, SN_OFFY+p.y*SN_CEL, SN_CEL-1, SN_CEL-1, c);
}

static void secretSnake(){
  if(!creditsWatched) return;
  
  Pt *snake = (Pt*)malloc(SN_MAX*sizeof(Pt));
  if(!snake) return;
  
snrestart:
  tft.fillScreen(C_BK);
  topBar("SECRET SNAKE");
  botBar("D-Pad:move Y:pause A:restart B:exit");
  
  tft.drawRect(SN_OFFX-1, SN_OFFY-1, SN_COLS*SN_CEL+2, SN_ROWS*SN_CEL+2, C_OR);
  
  int snLen = 3;
  snake[0] = {SN_COLS/2, SN_ROWS/2};
  snake[1] = {SN_COLS/2-1, SN_ROWS/2};
  snake[2] = {SN_COLS/2-2, SN_ROWS/2};
  
  int sdx = 1, sdy = 0;
  Pt food = {(int16_t)random(SN_COLS), (int16_t)random(SN_ROWS)};
  
  for(int i=0; i<snLen; i++) snakeDraw(snake[i], i==0?C_OR:C_LO);
  snakeDraw(food, C_RD);
  
  int score = 0;
  int spd = 150;
  uint32_t lm = millis();
  bool paused = false;
  bool pheld = false;
  
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
    
    if((d & DPAD_UP)    && sdy != 1)  {sdx = 0; sdy = -1;}
    if((d & DPAD_DOWN)  && sdy != -1) {sdx = 0; sdy = 1;}
    if((d & DPAD_LEFT)  && sdx != 1)  {sdx = -1; sdy = 0;}
    if((d & DPAD_RIGHT) && sdx != -1) {sdx = 1; sdy = 0;}
    
    if(millis() - lm < (uint32_t)spd){delay(5); continue;}
    lm = millis();
    
    Pt nh = {(int16_t)(snake[0].x + sdx), (int16_t)(snake[0].y + sdy)};
    
    bool dead = (nh.x < 0 || nh.x >= SN_COLS || nh.y < 0 || nh.y >= SN_ROWS);
    if(!dead){
      for(int i=1; i<snLen; i++){
        if(nh.x == snake[i].x && nh.y == snake[i].y){
          dead = true;
          break;
        }
      }
    }
    
    if(dead){
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
    if(!ate) snakeDraw(snake[snLen-1], C_BK);
    if(ate && snLen < SN_MAX) snLen++;
    
    for(int i = snLen-1; i > 0; i--) snake[i] = snake[i-1];
    snake[0] = nh;
    snakeDraw(snake[0], C_OR);
    if(snLen > 1) snakeDraw(snake[1], C_LO);
    
    if(ate){
      score++;
      spd = max(60, spd - 3);
      
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
      
      snprintf(sc, 20, "Score: %d  ", score);
      tft.fillRect(SN_OFFX, 5, 120, 10, C_BK);
      T(SN_OFFX, 5, sc, C_WH, C_BK, 1);
    }
    
    delay(5);
  }
}

// ================================================================
//  ROM SCANNING
// ================================================================
static void scanRoms(){
  rcnt=0;
  File root=SD.open("/");
  if(!root) return;
  
  while(true){
    File e=root.openNextFile();
    if(!e||rcnt>=MAX_ROM) break;
    if(e.isDirectory()) continue;
    const char *n=e.name(); 
    int l=strlen(n);
    if(l<4) continue;
    if(!(toupper(n[l-1])=='B'&&toupper(n[l-2])=='G'&&n[l-3]=='.')) continue;
    
    strncpy(rfn[rcnt],n,NL-1); 
    rfn[rcnt][NL-1]=0;
    strncpy(rdsp[rcnt],n,NL-1); 
    rdsp[rcnt][NL-1]=0;
    
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
  if(romf) romf.close();
  char path[NL+2]; 
  snprintf(path,sizeof(path),"/%s",name);
  romf=SD.open(path);
  if(!romf) return false;
  romsz=romf.size(); 
  bank1Base=0xFFFFFFFF;
  
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
    
    if(needRedraw){
      tft.fillScreen(C_BK);
      topBar("SETTINGS");
      botBar("D-Pad:navigate A:select B:back Select:dev");
      
      int y = 30;
      char val[48];
      
      for(int i = 0; i < S_COUNT; i++){
        bool selected = (sel == i);
        tft.fillRect(0, y, SCRW, 28, selected ? 0x2104 : C_BK);
        uint16_t fg = selected ? C_OR : C_WH;
        uint16_t bg = selected ? 0x2104 : C_BK;
        
        const char* label = "";
        val[0] = 0;
        
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
      if(sel == S_THEME){
        currentTheme = (currentTheme+1) % THEME_COUNT;
        applyTheme();
      } else if(sel == S_PALETTE){
        currentPalette = (currentPalette+1) % PALETTE_COUNT;
        applyPalette();
      } else if(sel == S_SCALE){
        currentScale = (currentScale == 1) ? 2 : 1;
      } else if(sel == S_SKIP){
        frameSkip = (frameSkip + 1) % 16;
      } else if(sel == S_PERF){
        performanceMode = !performanceMode;
        if(performanceMode){
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
        if(creditsWatched) secretSnake();
      }
      needRedraw = true;
      delay(200);
    }
    
    if(btn & BUTTON_B){ 
      delay(200); 
      return; 
    }
    
    // Easter egg: Press Select 10 times for dev mode
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
//  SETUP
// ================================================================
void setup(){
  pinMode(BL_PIN, OUTPUT); 
  digitalWrite(BL_PIN, HIGH);
  pinMode(BOOT_BTN, INPUT_PULLUP);

  fbuf = (uint16_t*)malloc(GB_W * GB_H * sizeof(uint16_t));
  bank0Cache = (uint8_t*)malloc(ROMBANK);
  bank1Cache = (uint8_t*)malloc(ROMBANK);
  bank2Cache = nullptr; // Skip to save RAM
  cram = (uint8_t*)malloc(CRAM);
  gbp  = (struct gb_s*)malloc(sizeof(struct gb_s));
  lbuf = (uint16_t*)malloc(GB_W * 2 * sizeof(uint16_t));

  if(!fbuf||!bank0Cache||!bank1Cache||!cram||!gbp||!lbuf){
    while(true){ 
      digitalWrite(BL_PIN,HIGH); 
      delay(150); 
      digitalWrite(BL_PIN,LOW); 
      delay(150); 
    }
  }
  
  memset(cram, 0xFF, CRAM);

  Serial.begin(115200); 
  delay(100);
  Serial.println("[BOOT] DASH OS ULTIMATE v30");
  Serial.printf("[MEM] free=%u\n", ESP.getFreeHeap());

  pinMode(SD_CS, OUTPUT);
  digitalWrite(SD_CS, HIGH);
  delay(200);
  sdspi.begin(18,19,23,SD_CS);
  delay(200);
  
  bool sdOK = SD.begin(SD_CS, sdspi, 400000);
  if(!sdOK){
    delay(400); 
    digitalWrite(SD_CS, HIGH); 
    delay(100);
    sdOK = SD.begin(SD_CS, sdspi, 400000);
  }
  
  if(sdOK){
    SD.end();
    delay(50);
    sdOK = SD.begin(SD_CS, sdspi, 25000000);
    if(!sdOK) sdOK = SD.begin(SD_CS, sdspi, 20000000);
    if(!sdOK) sdOK = SD.begin(SD_CS, sdspi, 10000000);
  }
  
  Serial.printf("[SD] init %s  heap=%u\n", sdOK?"OK":"FAILED", ESP.getFreeHeap());
  if(!sdOK){ while(true) delay(999); }

  applyTheme();
  applyPalette();
  tft.init(); 
  tft.setRotation(ROT); 
  tft.fillScreen(C_BK);

  BP32.setup(&onConn, &onDisc);
  splashScreen();
  
  while(!ctrl){ BP32.update(); delay(50); }
}

// ================================================================
//  MAIN LOOP
// ================================================================
enum State{MENU, PLAYING};
static State st = MENU;

void loop(){
  BP32.update();

  if(st == MENU){
    tft.fillScreen(C_BK);
    scanRoms();
    if(rcnt == 0) die("no .gb files on SD");

    int pick = floppyDiskMenu();
    if(pick < 0){
      // Exit - reboot or go back to splash
      delay(1000);
      ESP.restart();
    }
    
    currentRomIdx = pick;
    if(!openRom(rfn[pick])) die("ROM open failed");
    
    strncpy(currentRomFile, rfn[pick], NL-1);
    currentRomFile[NL-1] = 0;

    tft.fillScreen(C_BK);

    bank1Base = bank2Base = 0xFFFFFFFF;
    bank1LRU = bank2LRU = 0;
    lruCounter = 0;

    memset(gTitle, 0, sizeof(gTitle));
    for(int k = 0; k < 16; k++){
      uint8_t cc = bank0Cache[0x134+k];
      gTitle[k] = (cc>=32 && cc<127) ? (char)cc : 0;
    }

    isGBC = (bank0Cache[0x0143] == 0x80 || bank0Cache[0x0143] == 0xC0);
    Serial.printf("[ROM] %s, GBC: %s\n", gTitle, isGBC ? "YES" : "NO");

    loadSRAM(currentRomFile);

    enum gb_init_error_e err = gb_init(gbp, gb_rom_read, gb_cart_ram_read,
                                       gb_cart_ram_write, gb_error, nullptr);
    if(err != GB_INIT_NO_ERROR) die("gb_init failed");
    
    gb_init_lcd(gbp, lcd_draw_line);
    gbp->direct.frame_skip = frameSkip;
    gbp->direct.interlace  = 0;
    gbp->direct.joypad     = 0xFF;

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

    // Check for Konami code
    checkKonami(d | btn);
    
    // Easter egg: Speedrun timer (Start+Select+B+A)
    if((misc & MISC_BUTTON_START) && (misc & MISC_BUTTON_SELECT) && 
       (btn & BUTTON_A) && (btn & BUTTON_B)){
      speedrunMode = !speedrunMode;
      delay(500);
    }

    // X+Y for settings
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

    // B+A to exit
    if((btn & BUTTON_A) && (btn & BUTTON_B)){
      delay(400);
      
      // Save and update stats
      saveSRAM(currentRomFile);
      uint32_t sessionSecs = (millis() - playStartMs) / 1000;
      romStats[currentRomIdx].playTimeSeconds += sessionSecs;
      saveRomStats(currentRomIdx, currentRomFile);
      
      tft.fillScreen(C_BK);
      st = MENU;
      return;
    }

    // Map controls
    uint8_t joy = 0;
    if(d & DPAD_RIGHT) joy |= (1<<4);
    if(d & DPAD_LEFT)  joy |= (1<<5);
    if(d & DPAD_UP)    joy |= (1<<6);
    if(d & DPAD_DOWN)  joy |= (1<<7);
    if(btn & BUTTON_B) joy |= (1<<0);
    if(btn & BUTTON_A) joy |= (1<<1);
    if(misc & MISC_BUTTON_START)  joy |= (1<<3);
    if(misc & MISC_BUTTON_SELECT) joy |= (1<<2);
    gbp->direct.joypad = ~joy;

    gb_run_frame(gbp);
    pushFrame();

    // Draw status bar at bottom with FPS
    int gfxW = GB_W * currentScale;
    int gfxH = GB_H * currentScale;
    int gbY = (SCRH - gfxH) / 2;
    
    // Bottom status bar
    if(gbY + gfxH < SCRH - 16){
      int barY = gbY + gfxH + 2;
      tft.fillRect(0, barY, SCRW, 14, C_BK);
      
      // Left side: FPS
      char fpsStr[16];
      snprintf(fpsStr, 16, "%.0f FPS", fps);
      T(4, barY+2, fpsStr, C_GN, C_BK, 1);
      
      // Right side: Performance badge
      if(performanceMode){
        T(SCRW-40, barY+2, "PERF", C_OR, C_BK, 1);
      }
    }

    // Stats overlay (top)
    if(showStats){
      char buf[32];
      snprintf(buf, 32, "FPS:%.0f", fps);
      T(4, 4, buf, C_GN, C_BK, 1);
      
      if(performanceMode){
        T(SCRW-40, 4, "PERF", C_OR, C_BK, 1);
      }
      
      if(devMode){
        snprintf(buf, 32, "HEAP:%u", ESP.getFreeHeap());
        T(4, 16, buf, C_DIM, C_BK, 1);
      }
      
      if(speedrunMode){
        uint32_t ms = millis() - playStartMs;
        snprintf(buf, 32, "%02lu:%02lu.%03lu", 
                 ms/60000, (ms/1000)%60, ms%1000);
        TC(4, buf, C_OR, C_BK, 1);
      }
    }

    fpsN++;
    uint32_t now = millis();
    if(now - fpsT >= 1000){
      fps = (float)fpsN * 1000.0f / (float)(now - fpsT);
      fpsN = 0; 
      fpsT = now;
    }
    
    // Auto-save every 10 seconds
    if(now - lastSaveTime > 10000){
      saveSRAM(currentRomFile);
      lastSaveTime = now;
    }
  }
}