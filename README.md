# DASH OS
### Game Boy Emulator for ESP32 (CYD Board)
*By Pratik Dash — [@TwinSailsStudios](https://github.com/TwinSailsStudios)*

🌐 **[Project Website](https://twinsailsstudios.github.io/DASHOSGBEMULATOR/)** &nbsp;·&nbsp; ▶ **[Watch Demo](https://imgur.com/O46zO3Y)**

A feature-rich Game Boy / Game Boy Color emulator built for the ESP32-32E "Cheap Yellow Display" (CYD) board. Runs from an SD card with a wireless controller, themed UI, save states, and easter eggs.

---

## Demo

🌐 **[Project Website](https://twinsailsstudios.github.io/DASHOSGBEMULATOR/)** — full showcase with interactive features, screenshots, and more

▶ **[Watch it running on real hardware](https://imgur.com/O46zO3Y)**

Tetris and Super Marioland running at 60fps on a $4 chip inside a cardboard case.

---

## Hardware Requirements

| Component | Details |
|---|---|
| **Board** | ESP32-32E (CYD — Cheap Yellow Display) |
| **Display** | ST7796 480×320 TFT (built-in on CYD) |
| **Storage** | MicroSD card (FAT32 formatted) |
| **Controller** | 8BitDo Micro (must be in **Switch mode**: hold Start+Y to pair) |

### SD Card Wiring

| SD Card | Pin |
|---|---|
| SCK | 18 |
| MISO | 19 |
| MOSI | 23 |
| CS | 5 |

---

## Dependencies

Install these libraries in Arduino IDE before compiling:

- [TFT_eSPI](https://github.com/Bodmer/TFT_eSPI)
- [Bluepad32 for Arduino (ESP32)](https://github.com/ricardoquesada/bluepad32)
- [peanut_gb.h](https://github.com/deltabeard/Peanut-GB) — place in sketch folder

### TFT_eSPI User_Setup.h

You **must** configure `User_Setup.h` in the TFT_eSPI library folder:

```cpp
#define ST7796_DRIVER
#define TFT_CS   15
#define TFT_DC    2
#define TFT_MOSI 13
#define TFT_SCLK 14
#define TFT_MISO 12
#define TFT_RST  -1
#define TFT_BL   27
#define SPI_FREQUENCY  40000000
#define SPI_READ_FREQUENCY  20000000
```

---

## Setup

1. Clone this repo and open `GB_Emulator.ino` in Arduino IDE
2. Configure `TFT_eSPI/User_Setup.h` as shown above
3. Copy `.gb` / `.gbc` ROM files to the root of your SD card
4. Flash to your CYD board
5. Pair your 8BitDo Micro: hold **Start+Y** until the LED blinks fast

---

## Controls

| Button | Action |
|---|---|
| D-Pad | Move / GB D-Pad |
| A | GB A button |
| B | GB B button |
| Start | GB Start |
| Select | GB Select |
| **B + A** | Back to ROM menu (saves game) |
| **X + Y** | Open settings |

> Note: 8BitDo Micro must be in **Switch mode**. Hold Start+Y to re-pair if D-Pad isn't responding.

---

## Features

### Core Emulation
- Game Boy (.gb) and Game Boy Color (.gbc) support
- Powered by [peanut-gb](https://github.com/deltabeard/Peanut-GB)
- Dual bank ROM cache — bank 0 in RAM permanently, bank 1 streams from SD on bank switches
- Frame skip 0–15
- 6 DMG color palettes: Amber, Classic, Pocket, Light, Neon, Cyan

### Save System
- SRAM auto-saves every 10 seconds
- Manual save on B+A exit
- Per-ROM `.sav` files on SD card
- Compatible with Pokémon, Zelda, and any battery-backed GB game

### ROM Menu
- Floppy disk cartridge viewer
- Hacker-style typing animation for stats
- Per-ROM play time, last saved timestamp, and favorites
- Navigate with D-Pad Left/Right, launch with A

### Settings
- **14 color themes** — Red, Velvet, Orange, Amber, Yellow, Gold, Green, Matrix, Blue, Cyan, Purple, Magenta, White, Multi
- **Scale** — 1x (~60fps) or 2x (~27fps)
- **Frame skip** — 0 to 15
- **Performance mode** — auto-applies 1x scale + 8 frame skip
- **Stats overlay** — FPS, heap, speedrun timer
- **Auto-pause** — pauses when controller disconnects
- **6 DMG palettes** — change how GB games look

### Easter Eggs

| Unlock | How |
|---|---|
| 🌈 Konami code | Up Up Down Down Left Right Left Right B A |
| 🐍 Snake game | Watch the credits all the way through |
| 💻 Dev mode | Press Select 10 times in settings |
| ⚡ Matrix mode | Hold X+Y+Start for 3 seconds |
| ⏱ Speedrun timer | Press Start+Select+B+A simultaneously |

---

## Performance

| Mode | Scale | Frame Skip | FPS |
|---|---|---|---|
| Normal | 1x | 0 | ~60 |
| Normal | 2x | 0 | ~27 |
| Performance | 1x | 8 | ~60+ |

---

## How It Was Built

Started from zero with an Arduino kit in December 2025. The two hardest bugs:

**The white screen** — SD card had to be initialized before everything else (before `Serial.begin`, before `malloc`, before the display). Once SD claims the SPI bus first, everything works.

**0.1fps** — every frame was reading the entire ROM from SD. Fixed with a dual bank cache: bank 0 stays in RAM permanently, other banks load on demand. Jumped to ~60fps immediately.

The case is cardboard and hot glue. No 3D printer required.

---

## Known Issues

- GBC color support is basic — uses DMG palette fallback for most GBC games
- SD card must be pushed in firmly (spring slot on CYD is loose)
- 8BitDo Micro must be in Switch mode — X mode will not work

---

## Project Structure

```
GB_Emulator/
├── GB_Emulator.ino   # Main sketch
└── peanut_gb.h       # Game Boy emulation core (download separately)
```

---

## License

Open source. The emulation core is provided by [peanut-gb](https://github.com/deltabeard/Peanut-GB) (MIT License). ROM files are not included and are the property of their respective copyright holders. Only use ROMs you own.

---

*Built with cardboard, hot glue, and no sleep · by Pratik Dash · 2026*
