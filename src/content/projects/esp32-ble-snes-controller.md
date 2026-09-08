---
title: "ESP32 Bluetooth SNES Controller & Custom PCB"
description: "Hardware retrofit and embedded firmware project converting a classic Japanese Super Famicom gamepad into a modern wireless Bluetooth Low Energy (BLE) controller with custom 2-layer PCB design."
publishDate: "2024-05-27"
tags: ["C++", "ESP32", "BLE", "PCB Design", "Hardware", "Embedded Systems", "IoT"]
githubUrl: "https://github.com/invisiblesushi/ESP32-BLE-SNES-controller"
image: "/projects/snes-controller-front.jpg"
imageAlt: "ESP32 Bluetooth Super Famicom Gamepad with Custom PCB"
featured: false
order: 8
---

## Overview

This project is a complete hardware retrofitting and firmware solution that transforms an original Japanese Super Famicom (SFC) gamepad (*Super Potato Japan CC-SFCCR*) into a modern wireless Bluetooth Low Energy (BLE) controller compatible with PCs, tablets, smartphones, and consoles.

Rather than running loose protoboard jumper wires inside the tight enclosure, I designed a dedicated custom Printed Circuit Board (PCB) to house the microcontroller, charging circuits, power regulation, and button contacts.

## Physical Build & Assembled Hardware

<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 max-w-[80%] mx-auto">
  <figure class="m-0 flex flex-col gap-1 items-center">
    <img src="/projects/snes-controller-front.jpg" alt="Assembled ESP32 SNES Controller Front" class="rounded-xl border border-border shadow-sm m-0 max-h-[220px] max-w-full object-contain" />
    <figcaption class="text-xs text-muted-foreground text-center">Assembled wireless gamepad in clear Super Famicom shell</figcaption>
  </figure>
  <figure class="m-0 flex flex-col gap-1 items-center">
    <img src="/projects/snes-controller-internal.jpg" alt="Internal view of custom PCB and battery assembly" class="rounded-xl border border-border shadow-sm m-0 max-h-[220px] max-w-full object-contain" />
    <figcaption class="text-xs text-muted-foreground text-center">Internal layout with custom PCB, 300mAh LiPo, and TP4056</figcaption>
  </figure>
</div>

<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 max-w-[80%] mx-auto">
  <figure class="m-0 flex flex-col gap-1 items-center">
    <img src="/projects/snes-controller-usb.jpg" alt="USB-C Charging Port on Gamepad" class="rounded-xl border border-border shadow-sm m-0 max-h-[220px] max-w-full object-contain" />
    <figcaption class="text-xs text-muted-foreground text-center">Type-C charging port cleanly aligned with controller edge</figcaption>
  </figure>
  <figure class="m-0 flex flex-col gap-1 items-center">
    <img src="/projects/snes-controller-back.jpg" alt="Rear view of assembled controller" class="rounded-xl border border-border shadow-sm m-0 max-h-[220px] max-w-full object-contain" />
    <figcaption class="text-xs text-muted-foreground text-center">Rear view showing original casing fitment</figcaption>
  </figure>
</div>

## Technical Specifications & Hardware Design

### 1. Custom PCB Engineering
- **Layer Count**: 2-Layer FR-4 printed circuit board
- **Thickness**: Ultra-thin 0.8 mm profile to fit seamlessly within original controller housing tolerances
- **Surface**: Form-fitted trace routing aligning precisely with internal button rubber pads, tactile microswitches, and USB-C port cutouts

<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 max-w-[80%] mx-auto">
  <figure class="m-0 flex flex-col gap-1 items-center">
    <img src="/projects/snes-pcb.png" alt="2-layer Custom PCB Layout" class="rounded-xl border border-border shadow-sm bg-white p-2 m-0 max-h-[220px] max-w-full object-contain" />
    <figcaption class="text-xs text-muted-foreground text-center">Custom 2-Layer FR-4 PCB layout (0.8mm profile)</figcaption>
  </figure>
  <figure class="m-0 flex flex-col gap-1 items-center">
    <img src="/projects/snes-schematic.png" alt="Circuit Schematic Diagram" class="rounded-xl border border-border shadow-sm bg-white p-2 m-0 max-h-[220px] max-w-full object-contain" />
    <figcaption class="text-xs text-muted-foreground text-center">Circuit schematic: ESP32-S, LDO 3.3V regulation, and TP4056</figcaption>
  </figure>
</div>

### 2. Power Management Circuitry
- **Battery**: Integrated 300 mAh rechargeable Lithium-Polymer (LiPo) battery
- **Charging IC**: TP4056 Type-C lithium charging controller with overcharge protection
- **Voltage Regulation**: LM1117-3.3V Low-Dropout (LDO) regulator supplying stable 3.3V rail to the ESP32 module

### 3. Shift Register Communication & GPIO
The original SNES controller relies on a shift register to read all 12 digital inputs serially:
- **Pin 2**: Latch signal (initiates button state capture)
- **Pin 4**: Clock signal (cycles through individual button bits)
- **Pin 15**: Serial Data out (reads high/low button state)
- Handled with high-frequency polling routines ensuring ultra-low input latency.

<figure class="my-6">
  <img src="/projects/snes-btn-mapping.png" alt="SNES Controller Button Mapping Diagram" class="max-w-[50%] max-h-[260px] object-contain mx-auto rounded-xl border border-border shadow-sm bg-white p-2" />
  <figcaption class="text-xs text-muted-foreground text-center">Serial bit sequence and button mapping diagram</figcaption>
</figure>

## Firmware & Connectivity

- **Core Framework**: C++ running on the ESP32 Dual-Core microcontroller
- **Bluetooth Stack**: Bluetooth Low Energy (BLE) HID Gamepad emulation (`ESP32-BLE-Gamepad`)
- **Compatibility**: Standard HID profile recognized natively by Windows, Android, macOS, Linux, and iOS without requiring third-party drivers
- **Power Optimization**: Configurable sleep timers and power-down states when disconnected to maximize battery life
