---
title: Using Proxmox LXC to Setup Wireguard
# Set date to Mountain Standard Time. Example: 2023-12-17T20:01:00-07:00
date: 2024-11-29T21:32:33-07:00
lastmod: 2024-11-29T21:32:33-07:00
description: ""
slug: using-proxmox-LXC-to-setup-wireguard
authors:
  - Michael Schaecher
tags:
  - vpn
categories:
  - networking
  - proxmox
  - security
externalLink: ""
series:
draft: false
weight: 20
featuredImage: "./posts/using-proxmox-lxc-to-setup-wireguard/wireguard-logo.svg"
---

## Introduction

Being secured on the web is a most; especially when you are on a public network. That is why a VPN is so useful: but there is a problem only 3 companies own most of the VPN's. You may think that you don't need a VPN or that the only reason to use one is to do something illegal. To the latter, that not so easy as most VPN's keep logs and filter out illegal activities like torrents and exploitive websites. The VPN's that don't tend to be the ones that lead to data like bank accounts and personal information being stolen: plus you are just either a terrible person or a fool thinking that you can get something for like that for free without a catch.

Even at one point when VPN's started to pop up, I was looking for the lowest price and the best deal, but I quickly grow skeptical of the offers and the companies.

Still not wanting to pay for a VPN I started to look into setting up my own VPN, so I came across [OpenVPN](https://openvpn.net/). It worked but it was a challenge to set up. Now it is easier to set thanks to [PiVPN](https://www.pivpn.io/) and that is what we well be using to set up [Wireguard](https://www.wireguard.com/).

In this guide I'm assuming you have a Proxmox server set up and running. If you don't have one set up yet, you can follow guide [here](https://pve.proxmox.com/wiki/Installation).

### What is Wireguard?

WireGuard is a modern VPN that is designed to be easy to use while providing strong security. It is a VPN that is built into the Linux kernel and is easy to set up and use. It is also designed to be faster than other VPN's like **OpenVPN** and **IPsec**.

### Who is Wireguard for?

In basic terms, **WireGuard** is for anyone already using a VPN and are looking for a way of setting up their own VPN. this does not mean that it is for everyone, but if you are interested in setting one up, then this is for you.

[back to top](#)

## Getting Started

If you are using Proxmox, you may already know about LXC containers, but if you don't here is a brief overview. LXC is a lightweight virtualization technology that is built into the Linux kernel. It is similar to Docker but is more like a VM. It is a great way to run multiple Linux distributions on a single host.

<!-- Compare the difference between VM's, Dockers LXC -->

| Container | DHCP support                      | init system | boot process | kernel |
|-----------|-----------------------------------|-------------|--------------|--------|
| VM        | yes                               | any         | BIOS/UEFI    | own    |
| Docker    | maybe (requires additional setup) | none        | container    | host   |
| LXC       | yes                               | any         | container    | host   |

Because of this, we can use LXC to set up WireGuard or most type of services that we want to run on our **Proxmox** server making for a great way to reuse an old computer.

### Downloading the CT Template

{{< flex src="./ct-templates.png" alt="CT Templates" class="rightNoHeader" >}}

In order to do this we need to download a CT template, for this I chose [Debian 12](https://www.debian.org/) as the working base for the container. It is my preferred Linux distribution because of the stability and relitive small footprint.

To download the CT template, we need to go to the Proxmox web interface and click on the **local** (proxmox), then click ont LC templates. Once there, we need to click on the Templates button to view the available templates. You well see an available template that is already setup with **WireGuard**, however this one still requires basic manual setup that we can avoid.

For this I already have the latest Debian 12 template downloaded.

{{< /flex >}}

### Creating the LXC Container

Sense I already have a **WireGuard** LXC CT running, for this tutorial I'll set up a container labeled **testing** to make things easier for me.

{{< flex src="./create-ct.png" alt="Create LXC" class="leftNoHeader" >}}

To create the LXC container, we need to click on the **Create CT** button. This will open a new window where we can start setting up the container.

* **Node**:     The default will be the Proxmox server that you are on.
* **CT ID**:    This is the ID of the container: let Proxmox set this for you.
* **Hostname**: This is the name of the container.
* **Unprivileged**: This needs be disabled.
* **Password**: This is the password for the root user, you well need to verify it in the next field.
* **SSH public key**: This is optional, but I recommend adding one.

For the ssh key, you can generate one by running the following command on your local machine and give it a name for what it is going to be used for. In this case, I'm going to use it for the **WireGuard** container.

```bash
ssh-keygen -t rsa -P "" -f ~/.ssh/wireguard
```

{{< /flex >}}

Click on the **_next_** button to continue. Leave the **Storage** unchanged and set the **_Template_** to the **Debian 12** template that you downloaded earlier. On the next page the only thing that need to be changed is the **_Mount Option_** select _noatime_ to simulate a SSD.

Click **_next_** to continue.

The RAM and SWAP can be left as is, but I like to give myself a headroom by setting both to 1GB (1024MB).

{{< flex src="./ct-network.png" alt="Network" class="rightNoHeader" >}}

On the **Network** page, we need to set the _IP_ address for the container. This can be done by clicking on the **Add** button and filling in the information. In most cases the _Name_ and _Bridge_ fields can be left as is.

As you can see that I selected the **_Static_** option and filled in the _PIv4/CIDR_ and _Gateway (IPv4)_ fields.

* **_PIv4/CIDR_**: Set address to outside of the DHCP range of the router. For me this is **20.18.20.30/24**.
* **_Gateway (IPv4)_**: This is the IP address of the router.

> The `/24` at the end of the IP address is the subnet mask. This is the number of bits that are used to define the network portion of the address. In this case, the first 24 bits are used to define the network portion of the address.

On the next page is the **DNS** we can leave this as is, and move on to confirm the containers configuration.

{{< /flex >}}

The **Summary** page is next, if everything looks good check the **_Start after created_** box and click on the **_Finish_** button. The **WireGuard** we just created well start up and you can access it by clicking on the **_Console_** button. In this case we are going to use **SSH** to access the container.

```bash
ssh -i ~/.ssh/<the-name-you-gave-the-key> root@<the-ip-address-you-set>
```

## Preparing the Container

Before we do anything else, we need to update the system, set the locale and time zone.

```bash
apt update && apt upgrade -y
```

{{< flex src="./ct-locales.png" alt="Locale" class="leftNoHeader" >}}

```bash
dpkg-reconfigure locales
```

A dialog box well appear, scoll down to language you want to use and press the space bar to select it and press enter. In my case I selected `en_US.UTF-8 UTF-8`. An other dialog box well appear, select the default locale for the system. In my case I selected `en_US.UTF-8` and press enter. If you select none, you may get a warning for applications updates.

{{< notice info >}}Unless you really need to don't select lanaguages maps labeled with an ISO code.{{< /notice >}}

{{< /flex >}}

{{< flex src="./ct-timezone.png" alt="Time Zone" class="rightNoHeader" >}}

```bash
dpkg-reconfigure tzdata
```

A dialog box with a list of `countries/continents`. Select the one that applies to you and press enter. If you are in the United States then select the `US` option if one is available. The next dialog box well have a list of of time zones. However, if you select the `countries/continents` you need to select the closest city to you that is in the same time zone. For me I selected `Boise`.

{{< notice info >}}If you use the `US` option and live in Arizona, you well need to select that instead of Mountain Time.{{< /notice >}}

{{< /flex >}}

The last thing we need to do is install **curl** with `apt install -y curl`.

## Installing WireGuard

There is an easy way to install and that is by using [pivpn](https://www.pivpn.io/). This is a script that is used to set up a VPN server on a Raspberry Pi, but it can be used on any Debian based system. That is what we are going to use to set up **WireGuard**.

```bash
curl -L https://install.pivpn.io | bash
```

A script well run and install the necessary packages for either **OpenVPN** or **WireGuard** at the start when it is finished a dialog box well appear press enter to continue. A message well appear letting you that a static ip is required press enter then select `yes`.

{{< flex src="./ct-staticip.png" alt="Static IP" class="leftNoHeader" >}}

Because we are installing **WireGuard** on a x86_64 system the script well not setup the static ip for us. This is okay because we already set the static ip when we created the container. So press the enter key.

{{< /flex >}}

{{< flex src="./ct-user.png" alt="Local User" class="rightNoHeader" >}}

Now it is time to set up the local user. This is the user that that is going to be used for storing **OpenVPN** configuration. This is required for the installation via [pivpn](https://www.pivpn.io/).

Since we are setting up **WireGuard** setting the user to `wireguard` seems like a good choice. Press enter to set the password for the user and select 'OK' and press enter. Do the same on the following page which is a radio check box for the user we created.

{{< /flex >}}

The next dialog page asks which 'VPN' server do we want; select **WireGuard** which should be the default option. Press enter to begin the installation of **WireGuard**. Once the installation is complete, a dialog box well appear asking to verify that we want to use the default port of **51820**. Say yes by pressing enter if you want, or choose an other one just make sure that it is not being used by another service.

You well be asked to verify that you want to use the port, select yes and press enter.

{{< flex src="./ct-dns.png" alt="DNS" class="leftNoHeader" >}}

On the next page you well be asked to select a DNS provider. For me I am going to use [pihole](https://pi-hole.net/) container that I have running on my Proxmox server. If you don't have a private DNS server you can use the default option anyone from the list. I do however recommend setting up a private DNS server for security and privacy reasons.

The next best choice for speed and privacy is **Cloudflare**. for filtered content you can use **OpenDNS** or **Quad9**. Althought both are slower then using your own private DNS server.

In the future I well write a guide on how to set up a private DNS server using [pihole](https://pi-hole.net/) and [unbound](https://nlnetlabs.nl/projects/unbound/about/). When that is done I well link it here.

If you do have a private DNS server and selected the **custom** option, you well be asked to enter the IP address of the server. Press enter to continue and on the following page you well be asked to verify the IP address. Press enter to continue.

{{< /flex >}}

{{< flex src="./ct-publicip.png" alt="Static IP" class="rightNoHeader" >}}

It is recommended to set up a public dns entry for the server to work properly. this can be easy done by using a service like [DuckDNS](https://www.duckdns.org/). [Cloudflare](https://www.cloudflare.com/) is another option, but is there more steps to get it working.

For this tutorial we are going to use **DuckDNS** and use a systemctl service to update the IP address. Using cron is another option, and there are instructions on the **DuckDNS** website on how to set that up. I prefer the systemctl service over **cron** because if a cron is missed do system restarts, power outage or other issues; a crons job well wait time the time set to run the task. While the systemctl service well run as soon as the system is back up.

The systemd service well be covered in [Using SystemD Service with DuckDNS](#using-systemd-service-with-duckdns).

{{< /flex >}}

{{< flex src="./ct-ddns.png" alt="DuckDNS" class="leftNoHeader" >}}

Since I already have setup a **DuckDNS** account and have a subdomain that is what I am going to use. If you don't have an account you can create one [here](https://www.duckdns.org/). If you have a [Github](https://github.com) profile use that it sign in. Using [Google](https://www.google.com) or [Reddit](https://www.reddit.com) well introduce privacy concerns.

Once you have an account, you can create a subdomain and get the token. This token well be used to update the IP address of the subdomain.

{{< /flex >}}


### Unattended Upgrades

{{< flex src="./ct-upgrades.png" alt="Unattended Upgrades" class="rightNoHeader" >}}

When you get to the **Unattended Upgrades** page, you well be asked if you want to enable unattended upgrades. This is a good idea to enable because it well keep the system up to date with the latest security patches. Select yes and press enter.

When the installation is complete I would recommend editing the `/etc/apt/apt.conf.d/50unattended-upgrades` file and uncomment out `"origin=Debian,codename=${distro_codename}-updates";` by removing the '//'. This well make so that the system well receive basic updates as well as security updates.

{{< /flex >}}

## Using SystemD Service with DuckDNS

Now it is time to set up the **DuckDNS** service so that the IP address is updated when it changes. Some routers have a built in service that can do this for you, but if you don't have that option then this is a good way to do it.

Create the duckdns.timer file in `/usr/lib/systemd/system/`.
```systemd
[Unit]
Description = DuckDNS IP Updater
After = network-online.target
before = wg

[Timer]
# Every 5 minutes
OnCalendar = *:0/5
Persistent = true
RandomizedDelaySec = 1m


[Install]
WantedBy = timers.target
```

Create the duckdns.service file in `/usr/lib/systemd/system/`.
```systemd
[Unit]
Description = DuckDNS IP Updater

[Service]
Type = oneshot
Environment = "DOMAIN=yourdomain.duckdns.org/update?domains=<your-sub-domain>"
Environment = "TOKEN=<your-duckdns-token>"
ExecStart = /bin/bash -c 'https://$DOMAIN&token=$TOKEN&ip=" | curl -k -o /var/log/duck.log -K -'

[Install]
WantedBy = multi-user.target
```

Don't forget to replace `<yourdomain.duckdns.org>` with your domain and `<your-duckdns-token>` with your token.

Now we need to do one more thing before the service can be enabled and that is create the log filewith `touch /var/log/duck.log`. Once that is done and we're sure that the service scripts are correct we can enable the service with `systemctl enable --now duckdns.timer`.

## Conclusion

In this guide we set up a **WireGuard** server on a **Proxmox** server using **LXC** containers. We also set up a **DuckDNS** service to update the IP address of the server. This is a great way to set up a VPN server that is secure and private and gives you access to your home network from anywhere in the world.

I hope that this guide was helpful and that you were able to set up your own **WireGuard** server. If you have any questions or comments, please leave them below.

[back to top](#)

