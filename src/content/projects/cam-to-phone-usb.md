---
title: "CamToPhoneUSB: Android USB Tethering via libgphoto2"
description: "Android camera tethering application communicating over USB OTG and PTP (Picture Transfer Protocol) using a custom-built native C/C++ libgphoto2 stack cross-compiled via Linux NDK."
publishDate: "2024-07-14"
tags: ["Android", "Kotlin", "C/C++", "libgphoto2", "libusb", "Linux NDK", "WSL", "USB OTG"]
githubUrl: "https://github.com/invisiblesushi/CamToPhoneUSB"
image: "/projects/cam-to-phone-usb-screenshot.jpg"
imageAlt: "CamToPhoneUSB Android app screenshot showing Sony camera connection and tether status"
featured: false
order: 7
---

## Overview

**CamToPhoneUSB** is an Android proof-of-concept application designed for tethered photography. It establishes a direct hardware bridge between modern digital cameras (Sony, Canon, Nikon, Fujifilm, etc.) and an Android smartphone or tablet over a standard USB OTG cable.

When a photograph is captured, the application listens over the Picture Transfer Protocol (PTP), automatically detects the incoming image on the camera's storage, downloads the full-resolution file, and saves it locally to the Android device.

## Application Interface & Tether Workflow

<div class="flex flex-col sm:flex-row items-center gap-6 my-6 p-4 rounded-2xl bg-card border border-border">
  <img 
    src="/projects/cam-to-phone-usb-screenshot.jpg" 
    alt="CamToPhoneUSB Android app running on phone" 
    class="max-w-[50%] sm:max-w-[200px] max-h-[340px] object-contain rounded-xl border border-border shadow-md mx-auto"
  />
  <div class="text-sm text-muted-foreground flex flex-col gap-2">
    <p class="font-medium text-foreground">Live Tether Session</p>
    <p>The screenshot shows an active tether session paired with a Sony camera body in PC Remote mode. Once USB permissions are granted via Android's USB host API, the app detects storage endpoints, listens for shutter capture events, and transfers full-resolution photos to device storage (<code>PICTURES/USB_IMAGES/</code>).</p>
  </div>
</div>

## System Architecture & Technical Stack

- **Platform**: Android 10+ (API 29+), Kotlin
- **Native Stack**: C / C++, `libgphoto2` (v2.5.33), `libusb`, GNU `libtool` (`libltdl`)
- **Protocol**: Picture Transfer Protocol (PTP) over USB OTG
- **Cross-Compilation**: Automated bash toolchain running on WSL / Linux targeting Android NDK (`arm64-v8a` and `armeabi-v7a`)

## Key Engineering Challenges & Solutions

### 1. Linux NDK Cross-Compilation Toolchain
Standard Android development does not ship prebuilt libraries for POSIX-heavy camera frameworks like `libgphoto2`.

I engineered a dedicated cross-compilation pipeline (`build_libgphoto2_android.sh`) running on WSL/Linux that builds `libtool`, `libusb`, and `libgphoto2` from source against the Linux Android NDK:
- Configures sysroots and compiler flags for both 64-bit (`arm64-v8a`) and 32-bit (`armeabi-v7a`) ABIs.
- Resolves POSIX header differences and dynamic linking requirements.
- Automatically organizes shared objects (`.so`) and header files into the Gradle JNI directory (`app/src/main/jniLibs/`).

### 2. Android USB File Descriptor Patching
On standard Linux distributions, `libusb` and `libgphoto2` open raw `/dev/bus/usb/` device nodes. However, Android's security sandbox prevents direct access to USB device nodes without root privileges.

To overcome this, I developed a custom patch (`libgphoto2-android-usb-open.patch`) that integrates with Android's `UsbManager` and `UsbDeviceConnection.getFileDescriptor()`. This enables passing user-granted file descriptors directly into native C logic to maintain full sandboxed security compliance.

### 3. Event-Driven Capture & Transfer
The Kotlin layer registers event listeners to monitor PTP state machines. Upon shutter release, file events trigger asynchronous retrieval queues, preventing UI thread blocking while streaming large RAW and JPEG payloads across USB endpoints.
