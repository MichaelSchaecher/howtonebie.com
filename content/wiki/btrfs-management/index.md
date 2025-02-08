---
title: Btrfs Management
date: 2025-01-05T09:58:27-07:00
draft: true
featuredImage: "https://github.com/MichaelSchaecher/MichaelSchaecher/wiki/BTRFS-Management"
externalLink: ""
toc: TableOfContents
---

## Setting Up Subvolume

BTRFS doesn't require subvolumes to function, but not having any is generally
not a good idea for for a COW (Copy On Write) filesystem.

- Filesystem
  - Debian/Ubuntu, ArchLinux and Fedora
    - @ @home @tmp @cache @log @snapshots
  - OpenSUSE
    - @ @home @efi @home @snapshots
      - See [OpenSUSE Grub Fix](#opensuse-grub-fix) for more detail about @efi
        subvolume.

### Table (Mount Points)

| Subvolume  | Distribution                                  | Mount to                      |
| ---------- | --------------------------------------------- | ----------------------------- |
| @          | Debian/Ubuntu, ArchLinux, Fedora and OpenSUSE | Root of the filesystem e.i. / |
| @home      | Debian/Ubuntu, ArchLinux, Fedora and OpenSUSE | /home                         |
| @tmp       | Debian/Ubuntu, ArchLinux, Fedora and OpenSUSE | /tmp                          |
| @cache     | Debian/Ubuntu, ArchLinux, Fedora              | /var/cache                    |
| @log       | Debian/Ubuntu, ArchLinux, Fedora              | /var/log                      |
| @snapshots | Debian/Ubuntu, ArchLinux, Fedora and OpenSUSE | /.snapshots                   |
| @efi       | OpenSUSE                                      | /boot/grub2                   |

### Creating Subvolumes

Create the subvolumes is simple, but it does require the filesystem to be
mounted with default options e.i. `mount -o defaults /dev/\<device> /mnt`.

The device the drive lettering and number. For SATA drives it's usually `sda` or `sdb` and for NVMe drives it's usually `nvme0n1`. For `sda` the partitions numbers, but with `nvme0n1` it's partitions are numbered with `p` e.i. `nvme0n1p1`.

To find which filesystems is the **BTRFS** partition. Use the `lsblk` command.

```bash
lsblk -o path,fstype | grep btrfs
```

The output will look something like this: `/dev/sda2 btrfs` or `/dev/nvme0n1p2 btrfs`.

To create the subvolumes use the `btrfs subvolume create` command.

```bash
for subvolume in @ @home @tmp @cache @log @snapshots; do
  btrfs subvolume create /mnt/$subvolume
done
```

For OpenSUSE the `@efi` subvolume is created with the following command.

```bash
for subvolume in @ @home @tmp @efi @snapshots; do
  btrfs subvolume create /mnt/$subvolume
done
```

#### OpenSUSE Grub Fix

OpenSUSE uses a different method to boot the system. The `@efi` subvolume is used to store the *EFI* files. The `@efi` subvolume is mounted to `/boot/grub2`. Most other distributions use the `/boot/efi/EFI/<distro>` directory to store the EFI files and **grub** configuration. Some distributions start with `/boot/efi` and call the directory grub.cfg in the `/boot/efi/EFI/<distro>` directory. This is what [Linux Mint](https://linuxmint.com) does.

This means that of [OpenSUSE](https://opensuse.org) the same method can be used. The `@efi` subvolume can be mounted to `/boot/efi/EFI/opensuse` and the `grub.cfg` file can be placed in the `/boot/efi/EFI/opensuse` directory.

First edit the `/boot/grub2/grub.cfg` file to tell **grub** to look for the `grub.cfg` file in the `/boot/efi/EFI/opensuse` directory.

```bash
sudo nano /boot/grub2/grub.cfg
```

Add the following lines to the top of the file.

```bash
search --set=root --file /boot/efi/EFI/opensuse/grub.cfg
configfile /boot/efi/EFI/opensuse/grub.cfg
```

## Working with Subvolumes

To mount the subvolumes use the `-o` flag followed by the required options.

```bash
mount -o ssd,noatime,space_cache=v2,compress=lzo,subvol=@ /dev/<device> /mnt
```

### Set 1: Create the Directories

Create the directories for the subvolumes.

```bash
for subvolume in <subvolume list> ; do
  test "${subvolume}" = "@cache" || test "${subvolume}" = "@log" && mkdir -p /mnt/var/${subvolume}
  test "${subvolume}" = "@snapshots" && mkdir -p /mnt/.snapshots || mkdir -p /mnt/${subvolume}
done
```

### Set 2: Mount the Subvolumes

Mount the subvolumes.

```bash
MOUNT_OPT="ssd,noatime,space_cache=v2,compress=lzo"

for mount in <directory list> ; do

  SUBVOL="$(echo ${mount} | sed 's/\//\@/g')"

  test "${mount}" = "/var/cache" || test "${mount}" = "/var/log" &&
    mount -o "${MOUNT_OPT}",subvol=@${SUBVOL} /dev/<device> /mnt${mount}
  test "${mount}" = "/.snapshots" &&
    mount -o "${MOUNT_OPT}",subvol=${SUBVOL} /dev/<device> /mnt${mount} ||
    mount -o "${MOUNT_OPT}",subvol=${SUBVOL} /dev/<device> /mnt${mount}

done
```

### Set 3: Mount the EFI Subvolume (OpenSUSE)

Mount the `@efi` subvolume.

```bash
mount -o ssd,noatime,space_cache=v2,compress=lzo,subvol=@efi /dev/<device> /mnt/boot/grub2
```

## Listing Subvolumes

Display the subvolumes with the `btrfs subvolume list` command. The output should confirm that the subvolumes have been created and that there are top-level 5. If any are not listed or there are more than 5 then you well need to recreate the subvolumes.

Example output:

```bash
ID 257 gen 5 top level 5 path @
ID 258 gen 5 top level 5 path @home
ID 259 gen 5 top level 5 path @tmp
ID 260 gen 5 top level 5 path @cache
ID 261 gen 5 top level 5 path @log
ID 262 gen 5 top level 5 path @snapshots
```
