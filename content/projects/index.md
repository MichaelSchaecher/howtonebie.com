---
title: Projects
date: 2023-10-07T10:47:57Z
draft: false
featuredImage: "./projects/projects.jpg"
externalLink: ""
---

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

{{< /flex >}}

The advantage of using **SystemD** over **Cron** is that it is more reliable when it comes to running tasks at a specific time and if the time was missed. This means that **SystemD** will run the task as soon as possible after the missed time.

{{< flex src="/projects/Kernel.png" alt="Linux Kernel for WSL" class="rowLeft"
href="https://github.com/MichaelSchaecher/linux-wsl-kerenel" >}}

I have compiled a **Linux Kernel** for **Windows Subsystem for Linux (WSL)**. This kernel is based on the based on either the mainline or stable kernel from [kernel.org](https://www.kernel.org/). The kernel is compiled inside WSL and can be installed on Windows 10 or Windows 11.

To use this [Kernel Patch](https://github.com/MichaelSchaecher/wsl-kernel-patch) you need to have the following installed development tools on your system.

```bash
sudo apt install build-essential \
  flex bison libssl-dev \
  libelf-dev bc libncurses-dev
```

{{< /flex >}}

You can download the compiled kernel from [here](https://github.com/MichaelSchaecher/linux-wsl-kerenel/releases/tag/kernel-release) and install it on your system. **Note**: Don't install in the default location for the kernel. Instead, install it in a separate directory and point to it in your WSL configuration.

{{< flex src="/projects/simple-dark.png" alt="Hugo Theme Simple Dark" class="rowRight"
href="https://simple-dark.pages.dev/" >}}

I have created a **Hugo Theme** called **Simple Dark**. This theme is a simple and clean dark theme for Hugo. It is based on the Hugo theme [Hugo Coder](https://github.com/luizdepra/hugo-coder) created by **Luiz F. A. de Prá**.

I did make some changes, most noteably to how the **SCSS** files are structured and transpiled. I also added some additional features like how the [FontAwesome](https://fontawesome.com/) icons are loaded and used in the theme.

The source code for this theme can be found on [GitHub](https://github.com/MichaelSchaecher/simple-dark).

{{< /flex >}}
