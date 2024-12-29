---
title: Running Vaultwarden a in LXC Container
# Set date to Mountain Standard Time. Example: 2023-12-17T20:01:00-07:00
date: 2024-11-25T04:50:27-07:00
lastmod: 2024-11-25T04:50:27-07:00
description: ""
slug: running-vaultwarden-a-in-LXC-container
authors:
  - Michael Schaecher
tags:
  - new
categories:
  - new
externalLink: ""
series:
draft: false
weight: 20
featuredImage: "https://s3.amazonaws.com/wp-uploads.stopzilla.com/2016/08/02232359/password-security1.jpg"
---

## Introduction

In the world of the data breaches, password/passkey management is a critical aspect of being secured online. This is where password managers come into play. While there are many password managers available: There is one problem that I have with most of them and that is not able to self-host. This is where [Bitwarden](https://bitwarden.com/) enters the scene.

Bitwarden is an open-source password manager that can be self-hosted.

In this post, I will show you how to run [Vaultwarden](https://github.com/dani-garcia/vaultwarden) formerly known as Bitwarden_rs in an LXC container using [Proxmox](https://www.proxmox.com/). Once you have Vaultwarden up and running, you well be asking yourself why you didn't do this sooner, cause that is what I did.

In this post, I am assuming that you have a Proxmox server that you have setup running either LXC Containers or KVM Virtual Machines. If you don't have a Proxmox server, you can follow this [guide](https://pve.proxmox.com/pve-docs/chapter-pve-installation.html) to get one setup.

## Container Template

In **Proxmox**, LXC containers are created from templates. The template that I will be using is the **Debian 12 (Bookworm)** template. This template is based on the Debian 12 (Bookworm) distribution. You well need to

``` bash
'lxc.cgroup2.devices.allow: c 10:200 rwm
lxc.mount.entry: /dev/net dev/net none bind,create=dir
' > /etc/pve/lxc/100.conf
```
