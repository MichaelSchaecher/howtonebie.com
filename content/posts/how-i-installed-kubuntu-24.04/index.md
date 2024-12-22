---
title: How I Installed Kubuntu 24.04
# Set date to Mountain Standard Time. Example: 2023-12-17T20:01:00-07:00
date: 2024-12-20T15:46:40-07:00
lastmod: 2024-12-20T15:46:40-07:00
description: ""
slug: how-i-installed-kubuntu-24.04
authors:
  - Michael Schaecher
tags:
  - Ubuntu
categories:
  - Install Linux
  - BTRFS
externalLink: ""
series:
draft: true
weight: 20
featuredImage: "https://kubuntu.org/wp-content/uploads/2024/04/3ee9/kubuntu-24.04-banner.png"
---

## Introduction

Over the last few years, 15 years give or take 3 year when I was forced to use Windows. I've tried a number of different Linux distributions. Starting with [Ubuntu](https://ubuntu.com/), then tried [Arch Linux](https://archlinux.org/), but I've gone back to Ubuntu mostly because I like having to not fight setting up a all-in-one printer/scanner.

I did however like installing by way of the commandline so I started installing Ubuntu the same way and that is how I installed Kubuntu 24.04. So in this post I will show you how I installed Kubuntu 24.04 using the commandline and how I create a custom [BTRFS](https://btrfs.wiki.kernel.org/index.php/Main_Page) partition subvolume layout. This became a necessity because the installer does not support BTRFS subvolumes properly, this is especially true for **Ubuntu** new installer.

{{< notice info >}}
This guide well be using UEFI and GPT partition table for the installation mostly because that is default for most computers for the last 10 years. If you are needing to install using BIOS and MBR the grub installation will be different.
{{< /notice >}}

## Preparing the Installation

Just like [GNOME](https://www.gnome.org/) the [KDE](https://kde.org/) desktop environment is a full featured desktop environment. This means that it will require more resources than a lightweight desktop environment like [XFCE](https://xfce.org/) or [LXDE](https://lxde.org/).

- Minimum of 4GB of RAM (8GB recommended)
- 50GB of free disk space
- Internet connection (for downloading packages and updates)
- A USB drive with at least 16GB of space
- A computer with a 64-bit processor (dual-core that is less than 10 years old at the minimum)

### Download the Kubuntu 24.04 ISO

The first step is to download the Kubuntu 24.04 ISO from the [Kubuntu website](https://kubuntu.org/). You can download the ISO from the website or use the following command to download it from the commandline:

```bash
wget -c https://cdimage.ubuntu.com/kubuntu/releases/24.04.1/release/kubuntu-24.04.1-desktop-amd64.iso
```

For faster download speeds you can use a torrent client to download the ISO. You can find the torrent file on the [Kubuntu](https://kubuntu.org/) website or just click [here](https://cdimage.ubuntu.com/kubuntu/releases/noble/release/kubuntu-24.04.1-desktop-amd64.iso.torrent) to download the torrent file.

### Create a Bootable USB Drive

In most case you will need to create a bootable USB drive to install Kubuntu 24.04, unless have a DVD drive in your computer that is. Either way you may need to change the boot order or enable booting from USB in the BIOS/UEFI to boot from the USB drive. Doing so will differ depending on the manufacturer of your computer, but repeatedly pressing the F2, F12, or Delete key during boot up will usually get you into the BIOS/UEFI.

#### On Linux

There are a number of ways to create a bootable USB drive. You can use [Balena Etcher](https://www.balena.io/etcher/), [Rufus](https://rufus.ie/), or the `dd` command. I will show you how to create a bootable USB drive using the `dd` command. If you are using a **Ubuntu** based distribution installing _Startup Disk Creator_ is the easiest way to create a bootable USB drive.

{{< notice warning >}}
The `dd` command can be dangerous if you use the wrong device as it can overwrite all data on the device. That is way the nickname for `dd` is "**disk destroyer**".

```bash
sudo dd if=kubuntu-24.04.1-desktop-amd64.iso of=/dev/sdX bs=4M status=progress oflag=sync
```

{{< /notice >}}

#### On Windows

If you are using Windows you can use [Balena Etcher](https://www.balena.io/etcher/) is the best way to create a bootable USB drive. Downloading from the website or using [winget](https://docs.microsoft.com/en-us/windows/package-manager/winget/) to install it. _Winget_ is somewhat like `apt` or `dnf`, but less intuitive and powerful so do be surprised if you get errors.

```powershell
winget install --accept-package-agreements --id Balena.Etcher
```

Flash the ISO to the USB drive using _Balena Etcher_ is pretty straight forward. Just select the ISO, select the USB drive you want to flash it to, and click the flash button.

No matter what method you use or what operating system you are using you will need to boot from the USB drive to install Kubuntu 24.04.

## Installing Kubuntu 24.04

After booting from the USB drive you will be presented with the [grub](https://www.gnu.org/software/grub/) boot menu. The default option is to "_Try Kubuntu/Install Kubuntu_". You can select this option to try Kubuntu before installing it or you can select the "_Install Kubuntu_" option to start the installation process.

The installer may be the first thing you see, if so just ignore it because we are going to install Kubuntu 24.04 using the commandline. To do this press **Ctrl+Alt+T** to switch to a terminal. You will be presented with a terminal window. From here we well need switch to a root shell by typing the following command `sudo -i` to make things easier.

### Partitioning and Formatting

There are a number of ways to partition the disk, but I have found that the easiest way is to use the `parted` command to create the partitions. As it turns out `parted` requires less typing than `fdisk` or `gdisk`. The following is the partition layout I used: This may differ depending on the type of drive you have. I have a 1TB NVMe drive which shows up as `/dev/nvme0n1`; if you have a SATA drive it will show up as `/dev/sda`.

Without SWAP partition:

- `/dev/nvme0n1p1` - 1024MB - EFI System Partition
- `/dev/nvme0n1p2` - rest of the disk - BTRFS

With SWAP partition:

- `/dev/nvme0n1p1` - 1024MB - EFI System Partition
- `/dev/nvme0n1p2` - 8192MB - Linux Swap
- `/dev/nvme0n1p3` - rest of the disk - BTRFS

Why I chose to install with a SWAP partition is because I have more then 32GB of RAM setup [ZSWAP](https://www.kernel.org/doc/Documentation/vm/zswap.txt) and [ZRAM](https://www.kernel.org/doc/Documentation/vm/zram.txt) to use as the **SWAP** partition. Installing with a SWAP partition is not advised as some applications may require a SWAP partition to function properly such as transpiler and/or compilers.

#### Create the Partitions

The 'X' is either going to be the drive letter or the drive number. If you have a SATA drive it maybe `/dev/sda` and for NVMe `/dev/nvme0n1`.

```bash
parted /dev/<sdX|nvme0nX> -- mklabel gpt \
  mkpart primary fat32 1MiB 1025MiB set 1 esp on \
  mkpart primary btrfs 1025MiB 100%
```

With SWAP partition:

```bash
parted /dev/<sdX|nvme0nX> -- mklabel gpt \
  mkpart primary fat32 1MiB 1025MiB set 1 esp on \
  mkpart primary linux-swap 1025MiB 9217MiB \
  mkpart primary btrfs 9217MiB 100%
```

If you run into problems with the `parted` there maybe either a MBR or GPT partition table already on the drive. First list the partitions on the drive with `parted /dev/<sdX|nvme0nX> print`. If there are partitions on the drive you will need to remove them with the `rm` command starting with the last partition and working your way to the first partition.

```bash
parted /dev/<sdX|nvme0nX> -- rm <partition number>
```

Now try running the `parted` command again.

#### Format the Partitions

Now that the partitions have been created we need to format them. The EFI System Partition will be formatted as VFAT

```bash
mkfs.vfat -n EFI /dev/<sda1|nvme0n1p1>
mkfs.btrfs -L ROOTFS /dev/<sda2|nvme0n1p2>
```

With SWAP partition:

```bash
mkfs.vfat -n EFI /dev/<sda1|nvme0n1p1>
mkswap -L SWAP /dev/<sda2|nvme0n1p2>
mkfs.btrfs -L ROOTFS /dev/<sda3|nvme0n1p3>
```

### Create the BTRFS Subvolumes

Mount the BTRFS partition `mount /dev/<sda2|nvme0n1p2> /mnt` and create subvolumes for mounting to the required directories.

```bash
for subvol in @ @home @cache @log @snapshots @tmp; do
  btrfs subvolume create /mnt/$subvol
done
```

When finished umount with `umount /mnt` and mount `@` subvolume first.

```bash
mount -o subvol=@ /dev/<sda2|nvme0n1p2> /mnt
```

Next create the directories for the other subvolumes and the EFI System Partition.

```bash
mkdir -p /mnt/{home,var/{cache,log},.snapshots,tmp,boot/efi}
mount /dev/<sda1|nvme0n1p1> /mnt/boot/efi
mount -o subvol=@home /dev/<sda2|nvme0n1p2> /mnt/home
mount -o subvol=@cache /dev/<sda2|nvme0n1p2> /mnt/var/cache
mount -o subvol=@log /dev/<sda2|nvme0n1p2> /mnt/var/log
mount -o subvol=@snapshots /dev/<sda2|nvme0n1p2> /mnt/.snapshots
mount -o subvol=@tmp /dev/<sda2|nvme0n1p2> /mnt/tmp
```

### Install Kubuntu 24.04

The installation is done by unsquashing the filesystem from the ISO/USB drive to the BTRFS partition. This is done with the `unsquashfs` command.

```bash
unsquashfs -df /mnt /casper/filesystem.squashfs
```

If you are installing the default **Ubuntu** with GNOME desktop you will need to unsquash the two different filesystems that I well not go into here. However, for installation of systems using anything other the [Subiquity](https://github.com/canonical/subiquity) installer the above command is all that is needed.

### Setting and Configuring the Installation

This is where the fun really begins in setting up the installation the way you want. But in order to do this we need to make sure that the system as internet access by copying the `resolv.conf` file to the new system.

```bash
cp /etc/resolv.conf /mnt/etc/resolv.conf
```

Now mount the necessary directories for begin.

```bash
for dir in dev dev/pts proc sys ; do
  mount --bind /$dir /mnt/$dir ; mount --make-rslave /mnt/$dir
done
```

The `/dev/pts` is needed to prevent an error about the `/dev/pts` not being mounted. The `--make-rslave` is needed to prevent the `/proc` and `/sys` from being mounted as read-only.

> **Note:** Not doing this most likely will not cause any problems, but it is better to be safe than sorry.

### Working Inside the Installation

Now that the necessary directories have been mounted we can chroot into the installation. `chroot -s /bin/bash /mnt` will change the root directory to the installation and start a bash shell.

#### Step 1: Purge Unneeded Packages

Because we unsquashed the filesystem which is the same one that was booted from the USB drive we need to remove the `casper`, `ubiquity` and anything that as to do live booting.

```bash
apt purge --autoremove -y casper calamares calamares-* user-setup kubuntu-installer-prompt
```

The above command will trigger the removal of of none specified packages that is okay so don't worry about it.

{{< notice warning >}}
What ever you do do not remove or purge ever package listed in the file `_filesystem.manifest-remove_`: that well break the installation and you will have to start over.
{{< /notice >}}

#### Step 2: Set the Locale and Timezone

{{< flex src="./ct-locales.png" alt="Locale" class="leftNoHeader" >}}

Setting the `locale` and `timezone` is different then it is on [Arch Linux](https://archlinux.org/) which is done by editing the `/etc/locale.gen` and `/etc/timezone` files. On **Ubuntu** based distributions it is done by running the `dpkg-reconfigure` command.

```bash
dpkg-reconfigure locales
```

This will bring up a dialog box where you can select the language and locale that you require. Sense I'm in the U.S. I selected `en_US.UTF-8`. This will bring up another dialog box where you can select the default locale. I selected `en_US.UTF-8` again. In most cases you will want to avoid anything that has to do with `ISO` unless you know that you require it.

{{< /flex >}}

{{< flex src="./ct-timezone.png" alt="Timezone" class="rightNoHeader" >}}

To setup the timezone is much the same way as the locale. All you need select the Continent and then the City.

If you are in the U.S. and that as an option then select it and then select the City that is closest to you. If you are not in the U.S. then select the Continent and then the City that is closest to you.

```bash
dpkg-reconfigure tzdata
```

I'm am in the U.S. so I selected `America` and then `Boise` because that is the closest city to me. You may see a separate option for the state of Arizona. This is because Arizona does not observe Daylight Savings Time.

{{< /flex >}}

By doing this first you will avoid any problems that may arise when installing and updating packages.

#### Step 3: Update the System

You may be able to get away with not updating the system, but I would recommend doing so to avoid breaking any required packages that may be installed.

```bash
apt update && apt upgrade -y
```

#### Step 4: Installing GRUB and the Kernel

The next step is to install the GRUB bootloader and the kernel. The kernel is required to boot the system and the GRUB bootloader is required to boot the system.

```bash
apt install -y linux-generic-hwe-24.04 \
  linux-headers-generic-hwe-24.04 \
  linux-generic linux-headers-generic grub-efi-amd64 shim*
```

You we see a bunch of packages that are going to be installed, depending on the system this may take a while so get a snack or cup of coffee. For me it took about 5 minutes to install all the packages.

```bash
grub-install /dev/<sda|nvme0n1>
```

Regenerate the initramfs and update the GRUB configuration. Because we are using UEFI we need to update the GRUB configuration file in the EFI System Partition.

```bash
update-initramfs -c -k all
grub-mkconfig -o /boot/efi/EFI/ubuntu/grub.cfg
```

Edit the `/usr/sbin/update-grub` file to reflect the correct path to the GRUB configuration file.

```bash
sed -i 's|/boot/grub/grub.cfg|/boot/efi/EFI/ubuntu/grub.cfg|' /usr/sbin/update-grub
```

Check to see if git is installed `which git` if it is not installed install it with `apt install -y git`, then clone the [gen-fstab](https://github.com/MichaelSchaecher/gen-fstab) repository.

```bash
git clone https://github.com/MichaelSchaecher/gen-fstab.git
```

Change into the gen-fstab directory and open up the `gen-fstab` script and edit using either `nano` or `vim` and replace `$(btrfs su list /mnt | grep 'level 5' | awk '{print $9}')` with `$(btrfs su list / | grep '@' | awk '{print $9}')`. If you planning on using a ZRAM as a SWAP partition then replace then comment out the line that has `SWAP` in it as well. Not doing so well cause the system to hang on boot making you think that the system is broken.

Your `/etc/fstab` file should look like this:

```bash
# /etc/fstab: static file system information.
#
# <file system> <mount point>   <type>  <options>       <dump>  <pass>

# EFI boot partition
UUID=15B9-1CB4 /boot/efi vfat defaults 0 1

# Mount btrfs subvolumes
UUID=3da1f02b-c913-401d-8d8b-38ac885ac19d / btrfs ssd,noatime,space_cache=v2,compress=lzo,subvol=@ 0 0
UUID=3da1f02b-c913-401d-8d8b-38ac885ac19d /home btrfs ssd,noatime,space_cache=v2,compress=lzo,subvol=@home 0 0
UUID=3da1f02b-c913-401d-8d8b-38ac885ac19d /var/cache btrfs ssd,noatime,space_cache=v2,compress=lzo,subvol=@cache 0 0
UUID=3da1f02b-c913-401d-8d8b-38ac885ac19d /var/log btrfs ssd,noatime,space_cache=v2,compress=lzo,subvol=@log 0 0
UUID=3da1f02b-c913-401d-8d8b-38ac885ac19d /tmp btrfs ssd,noatime,space_cache=v2,compress=lzo,subvol=@tmp 0 0
UUID=3da1f02b-c913-401d-8d8b-38ac885ac19d /.snapshots btrfs ssd,noatime,space_cache=v2,compress=lzo,subvol=@snapshots 0 0

# Swap
#UUID= none swap defaults 0 0
```

Of course the UUID is going to be different then mine.

#### Step 5: Setting the Hostname

Edit the `/etc/hostname` file and set the hostname to what you want it to be. Since I lack imagination I set mine to 'dell-laptop'.

```bash
echo "dell-laptop" > /etc/hostname
```

To make the hostname change take effect in the shell prompt run `hostname -f /etc/hostname`.

#### Step 6: Creating the User

The use that needs to be created here most have administrative privileges to make changes to the system, this means that the user must be added to the `sudo` group. Just be sure to replace `<username>` with the username you want to use.

```bash
useradd -m -G sudo -s /bin/bash <username>
passwd <username>
```

```bash
groupadd -r allow-sudo
echo "%allow-sudo ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/allow-sudo
```

At this point if you wish you exit and reboot the system with `exit` and `reboot` or you can continue on below.

## Post Installation (Optional)

The following are optional steps, but help into make the system more usable as a daily driver and can be done at any time. If you still here then I am assuming you're still in the chroot environment.

### Step 1: Setting Up ZRAM and ZSWAP

If you have more then 32GB of RAM then you may want to setup ZRAM and ZSWAP to use as the SWAP partition. This is done by creating a systemd service file and enabling it. I like to do this by creating the file in `/usr/lib/systemd/system/` directory instead of the `/etc/systemd/system/` directory. This is because the `/usr/lib/systemd/system/` directory is where the default systemd service files are located and disabling the service with `systemctl disable` well not remove the service file only the symlink to it.

Create the file `/usr/lib/systemd/system/zram-swap.service` and add the following to it:

```bash
[Unit]
Description = Create compressed swap in RAM on boot up.
After = local-fs.target

[Service]
Type = oneshot
Environment = "COMPRESSOR=lz4"
Environment = "SWAP_SIZE=2G"
ExecStartPre = /sbin/modprobe zram
ExecStart = /usr/bin/bash -c "zramctl --size $SWAP_SIZE --algorithm $COMPRESSOR --find ; \
  mkswap /dev/zram0 ; \
  swapon /dev/zram0"
RemainAfterExit = yes

[Install]
WantedBy = multi-user.target
```

Now enable the service with `systemctl enable zram.service`. This will create a 2GB ZRAM device and use it as the SWAP partition. If you want to change the size of the ZRAM device then change the `SWAP_SIZE` variable to the size you want.

### Step 2: Enable Booting from BTRFS Snapshots

With the help of [grub-btrfs](https://github.com/Antynea/grub-btrfs) you can boot from BTRFS snapshots. This is done by installing the `grub-btrfs` package by cloning the repository. Cloning the forked well help you avoid having to edit the config file. Before you do something need to be installed: `apt install -y build-essential inotify-tools`.

```bash
git clone https://github.com/MichaelSchaecher/grub-btrfs.git
cd grub-btrfs
make install
```

Enable the `grub-btrfs` service with `systemctl enable grub-btrfsd.service`.

### Step 4: Create and Manage Snapshots

There are a few tools to help with, like _snapper_ and _timeshift_. Snapper takes some configuration to get it to work properly and even then it may not work as expected. Timeshift is a GUI application that is easy to use, but it is not compatible with non [Ubuntu](https://ubuntu.com/) way of either no subvolumes or just the `@` and `@home` subvolumes which make to app useless.

What I did was create a script that keeps no more then 10 snapshots and deletes the oldest one when the limit is reached. This is done by creating a script in the `/usr/local/bin/` directory called `btrfs-snapshot-manager` and adding the following to it:

```bash
#!/bin/env bash

source /etc/os-release

# Set the number of snapshots to keep
SNAPSHOTS="10"

SNAPSHOT="$NAME-$(hostname)-$(date +%Y-%m-%d-%H-%M-%S)"

SNAPSHOT_DIR="/.snapshots"

test "$(id -u)" -eq 0 || { echo "Must be root to run this script"; exit 1; }

btrfs subvolume snapshot / "${SNAPSHOT_DIR}/${SNAPSHOT}"

test "${?}" -eq 0 || { echo "Failed to create snapshot"; exit 1; }

echo "Total snapshots: $(ls -1 "${SNAPSHOT_DIR}" | wc -l)"

# Delete snapshots exceeding the total to keep
while [ "$(ls -1 "${SNAPSHOT_DIR}" | wc -l)" -gt "${SNAPSHOTS}" ]; do

    OLD_SNAPSHOTS=$(ls -1 "${SNAPSHOT_DIR}" | sort -r | tail -n 1)

    btrfs subvolume delete "${SNAPSHOT_DIR}/${OLD_SNAPSHOTS}"

    test "${?}" -eq 0 || { echo "Failed to delete: ${OLD_SNAPSHOTS}"; exit 1; }

done

echo "Total snapshots: $(ls -1 "${SNAPSHOT_DIR}" | wc -l)"

exit 0
```

Make the script executable with `chmod 755 /usr/local/bin/btrfs-snapshot-manager` and create a systemd timer and service file to run the script every day. The service should also create a snapshot before running the script.

```bash
[Unit]
Description = BTRFS Snapshot Manager

[Service]
Type = oneshot
ExecStart = /usr/local/bin/btrfs-snapshot-manager

[Install]
WantedBy = multi-user.target
```

Create the timer file `/etc/systemd/system/btrfs-snapshot-manager.timer` and add the following to it:

```bash
[Unit]
Description = Run BTRFS Snapshot Manager

[Timer]
OnCalendar = daily
WakeSystem = true
RandomizedDelaySec = 1h

[Install]
WantedBy = timers.target
```

Have the timer wake the system up if it is in sleep mode and enable the timer with `systemctl enable btrfs-snapshot-manager.timer`. This also has the added benefit cause other services to run that may have been missed otherwise.

## Exit and Reboot

exit the chroot environment and unmount the necessary directories and reboot the system.

```bash
exit
umount -R /mnt
reboot
```

You well be asked to remove the USB drive and press enter to reboot the system. After the system reboots you well be presented with the GRUB boot menu with the new installation of Kubuntu 24.04 press enter and login with the user you created. You well be presented with the KDE desktop environment.

**Welcome to your new installation of Kubuntu 24.04.**

If you have any questions or comments please leave them below and I well get back to you as soon as I can. Thank you for reading and I hope you have a great day.
