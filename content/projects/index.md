---
title: Projects
date: 2023-10-07T10:47:57Z
draft: false
featuredImage: "./projects/projects.jpg"
externalLink: ""
---

{{< flex src="/projects/btrfs-on-ubuntu.png" alt="BTRFS Snapshot Manager" class="rowRight" href="https://github.com/MichaelSchaecher/btrfs-snapshots-manager" >}}

BTRFS is one of the best filesystems for Linux thanks to the features it offers of most modern filesystems. One of the features that I like the most is the ability to create snapshots of the filesystem. This is very useful when you want to backup your system or just want to try out new software without the fear of breaking your system.

With BTRFS-Snapshots-Manager, there is no need to manually create snapshots before installing, remove or updating software. The script will automatically create a snapshot of the filesystem before and after the installation, removal or update of software. With the added benefit of `Systemd Timers`, the script will also create snapshots at regular intervals each day.

Download the latest release from [here](https://github.com/MichaelSchaecher/btrfs-snapshots-manager/releases/download/1.24.07-78/btrfs-snapshots-manager_1.24.07-78_amd64.deb) and install it using the following command:

```bash
sudo dpkg -i btrfs-snapshots-manager_*.deb
```

{{< /flex >}}

{{< flex src="/projects/zram.png" alt="ZRAM for SWAP" class="rowLeft" href="https://github.com/MichaelSchaecher/simple-zram" >}}

I have created a **simple script** to enable **ZRAM** for **SWAP** on **Linux**. This script is based on the **ZRAM** configuration for **Ubuntu** and **Debian**. It creates a **ZRAM** device and enables it as **SWAP**. The script also sets the **ZRAM** device to be used as **SWAP** on boot.

The script is written in **Bash** and can be used on any **Linux** distribution that supports **ZRAM**. However, there is a `deb` package available [here](https://github.com/MichaelSchaecher/simple-zram/releases/download/1.0.1/simple-zram_1.0.1_all.deb).

To install the `deb` package, download it and install it using the following command:

```bash
sudo dpkg -i simple-zram_*.deb
```

{{< /flex >}}

{{< flex src="/projects/SystemdScripts.png" alt="SystemD Timer Scripts" class="rowRight"
href="https://github.com/MichaelSchaecher/systemd-scripts" >}}

Here are some **SystemD Timer Scripts** I wrote to automate some tasks on my Virtual Machine and/or LXC Containers that help me to keep my system up-to-date and running without much need manual intervention.

- Update [Pihole](https://pi-hole.net/) Gravity and underlying Framework.
- Keep [Unbound](https://nlnetlabs.nl/projects/unbound/about/) DNS Resolver up-to-date.
- Clean up apt cache.
- Update [Starship](https://starship.rs/) prompt to the latest version.
- Keep [Vaultwarden](https://hub.docker.com/r/vaultwarden/server) Docker container updated.

If using these scripts, please make sure to adjust the paths and commands to your needs.

> **Note:** The timer script for **Starship Prompt** only works if Starship is installed globally.

The advantage of using **SystemD** over **Cron** is that it is more reliable when it comes to running tasks at a specific time and if the time was missed. This means that **SystemD** will run the task as soon as possible after the missed time.

{{< /flex >}}

{{< flex src="/projects/Kernel.png" alt="Linux Kernel for WSL" class="rowLeft"
href="https://github.com/MichaelSchaecher/linux-wsl-kerenel" >}}

I have compiled a **Linux Kernel** for **Windows Subsystem for Linux (WSL)**. This kernel is based on the based on either the mainline or stable kernel from [kernel.org](https://www.kernel.org/). The kernel is compiled inside WSL and can be installed on Windows 10 or Windows 11.

To use this [Kernel Patch](https://github.com/MichaelSchaecher/wsl-kernel-patch) you need to have the following installed development tools on your system.

```bash
sudo apt install build-essential \
  flex bison libssl-dev \
  libelf-dev bc libncurses-dev
```

You can download the compiled kernel from [here](https://github.com/MichaelSchaecher/linux-wsl-kerenel/releases/tag/kernel-release) and install it on your system. **Note**: Don't install in the default location for the kernel. Instead, install it in a separate directory and point to it in your WSL configuration.

{{< /flex >}}

{{< flex src="/projects/simple-dark.png" alt="Hugo Theme Simple Dark" class="rowRight"
href="https://simple-dark.pages.dev/" >}}

I have created a **Hugo Theme** called **Simple Dark**. This theme is a simple and clean dark theme for Hugo. It is based on the Hugo theme [Hugo Coder](https://github.com/luizdepra/hugo-coder) created by **Luiz F. A. de Prá**.

I did make some changes, most noteably to how the **SCSS** files are structured and transpiled. I also added some additional features like how the [FontAwesome](https://fontawesome.com/) icons are loaded and used in the theme.

The source code for this theme can be found on [GitHub](https://github.com/MichaelSchaecher/simple-dark).

{{< /flex >}}
