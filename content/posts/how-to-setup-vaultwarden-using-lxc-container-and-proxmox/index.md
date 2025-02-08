---
title: How to Setup Vaultwarden Using LXC Container and Proxmox
# Set date to Mountain Standard Time. Example: 2023-12-17T20:01:00-07:00
date: 2025-02-08T15:08:45-07:00
lastmod: 2025-02-08T15:08:45-07:00
description: ""
slug: how-to-setup-vaultwarden-using-lxc-container-and-proxmox
authors:
  - Michael Schaecher
tags:
  - Proxmox
  - Self-Hosted
categories:
  - Network Security
externalLink: ""
series:
draft: false
weight: 20
featuredImage: "./posts/how-to-setup-vaultwarden-using-lxc-container-and-proxmox/vaultwarden-icon.png"
---

## Introduction

When people think of password managers, they often think of services like [LastPass](https://www.lastpass.com/), [1Password](https://1password.com/). These services can be useful, however do to hacks and data breaches may not be the best option for storing your passwords. This is where self-hosted password managers come in. One of the most popular self-hosted password managers is [Bitwarden](https://bitwarden.com/). Bitwarden is an open-source password manager that can be self-hosted, but it does require a bit more resources then maybe available on a older computer being used as a home server. This is where [Vaultwarden](https://github.com/dani-garcia/vaultwarden) is the better option.

Vaultwarden is a lightweight implementation of the Bitwarden API in Rust. It is compatible with all Bitwarden clients, including the browser extension and mobile apps.

## Prerequisites

Like with [Bitwarden](https://bitwarden.com/), [Vaultwarden](https://github.com/dani-garcia/vaultwarden) requires a SSL certificate to be installed on the server even for local use. This is because the Bitwarden clients require a secure connection to the server. The easiest way to accomplish this is with [nginx-proxy-manager](https://nginxproxymanager.com/) with a wildcard SSL certificate from [Let's Encrypt](https://letsencrypt.org/). You well also need a domain name with a DNS A record or CNAME pointing to the server.

However, this is outside the scope of this guide. If you need help setting up a proxy manager please see the [official documentation](https://nginxproxymanager.com/guide/).

Another option is using **Zero Trust** by [Cloudflare](https://www.cloudflare.com/).

## Create the LXC Container

Like with all LXC Containers I recommend using the latest version of [Debian](https://www.debian.org/) that is available. This is because Debian is a stable operating system and is well supported by Proxmox. To create the container, follow the steps below:

1. Open the Proxmox web interface and navigate to the node you want to create the container on.
2. Click the `Create CT` button.
3. Fill in the required information:

### LXC Container Settings

{{< notice note >}}

**General**

- **Node**: The node you want to create the container on.
- **VM ID**: Use the default assigned ID.
- **Hostname**: The hostname you want to assign to the container.
- **Password**: The password you want to assign to the container.
- **SSH public key**: If you want to use a SSH key to login to the container.
- **Unprivileged container**: This should be unchecked.
- **Nesting**: This well have to be checked after the container is created.

**OS**

- **Storage**: Select the storage you want to use (I recommend using one for all your containers).
- **Template**: `latest` version of Debian. This should already downloaded.

**Disk**

- **Storage**: The storage you want to assign to the container.
- **Disk size (GB)**: The default of 8GB is more then enough.
- **Mount options**: Noatime for better performance.
- **ACLs**: Set to default.

**CPU**

- **Core**: Stay with the default; unless clock speed is lower then 1.5GHz.
- **CPU limit**: Leave alone.
- **CPU units**: Leave alone.

**Memory**

- **Memory (MB)/Swap (MB)**: Set to 1GB/1GB (1024MB/1024MB) respectively.

**Network**

- **IPv4**: static
- **IPv4/CIDR**: Use address that is outside of the DHCP range, e.i.`192.168.1.<10-200-/24`.
- **Gateway**: The gateway of the network, e.i. `192.168.1.1`.
- **DNS Domain/Server**: Leave alone.

**DNS**

- **DNS Domain/Server**: Leave alone.

{{< /notice >}}

Confirm the settings and click **Finish**.

Now we need make the container a nested one, because when we uncheck the `Unprivileged container` option, Proxmox unchecked the `Nesting` option. To do this, click on the container and then click on the `Options` tab. In the `Features` section, check the `Nesting` option and click `Save`.

## Update the Container

Open up a terminal and SSH into the container `ssh -i .ssh/id_rsa root@<ip address-`. Once logged in, run the following commands:

```bash
apt update && apt upgrade -y
```

### Install Required Packages

To run Vaultwarden you will need to install the following packages: '*podman*, *curl*, *mariadb-server*, *unattended-upgrades* and *argon2*'. `apt install curl Podman mariadb-server argon2 unattended-upgrades argon2`.

You maybe asking yourself why we are installing [Podman](https://Podman.io/) and not [docker](https://www.docker.com/). This is because *Podman* is more compatible with LXC Containers then *docker*. This is do to **Podman** not using a builtin init system therefore the init system that the LXC Container uses is used to start the container, something that well be covered later in this guide.

You can use *Docker* if you want, but you will need to manually start the container if the server is restarted or if the container needs to restart. You may also need to use more resources to deal with the overhead of the init system that **Docker** uses.

## Setting Up MariaDB

To use Vaultwarden more effectively, we need to create a database and that is why we installed `mariadb-server`. To do this, run the following command: `mysql_secure_installation`. This will prompt you to set a root password and other security settings.

| Prompt | Answer |
|--------|--------|
| Enter current password for root (enter for none): | Enter the password that used when you setup the LXC |
| Remove anonymous users? | Y |
| Disallow root login remotely? | Y |
| Remove test database and access to it? | Y |
| Use unix_socket authentication plugin? | N |
| Change the root password? | N |
| Reload privilege tables now? | Y |

Now we need to create a database and user for Vaultwarden. To do this, run the following commands: `mariadb`

```sql
CREATE DATABASE vaultwarden;
CREATE USER 'vaultwarden'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON vaultwarden TO 'vaultwarden'@'localhost';
```

You well need to replace **password** with one that is a bit more secure. Now exit the MariaDB shell by running `quit`.

## Setup Vaultwarden

Vaultwarden must be ran as local container, through it may be possible to run as a none containerized service by copying the required files to the host system. However, that is a complex process and may not work as expected. Please do not try doing that unless you know what you are doing and even why you are doing it.

To start the container, run the following command:

```shell
Podman run -d \
  --name vaultwarden \
  --network host \
  -v /vlt/:/data/:Z \
  -e ROCKET_PORT=80 \
  -e DATABASE_URL='mysql://vaultwarden:password@127.0.0.1:3306/vaultwarden' \
  -e ADMIN_TOKEN="$(echo -n 'admin_password' | argon2 "$(openssl rand -base64 32)" -e -id -k 65540 -t 3 -p 4)" \
  docker://vaultwarden/server:latest
```

The `password` in the `DATABASE_URL` is the password that you set when you created the database. The `admin_password` is the password that you want to use to login to the admin panel. If either one is not set correctly, the container will not start or run correctly.

To make sure that the container starts when the server is restarted, we need to create a systemd service file. To do this, run the following command:

```shell
podman generate systemd --name vaultwarden > /usr/lib/systemd/system/vaultwarden.service
systemctl enable vaultwarden
```

Now the container is running we can now access the admin panel by going to `https://your-vaultwarden.com` to set the <ins>Domain name</ins> and <ins>X-Forward</ins> headers.

You well need to login with the `admin_password` that you set when you started the container.

On the <ins>Settings</ins> tab click on the *General settings* and set the 'Domain URL' to the domain you are using. Then click on *Advanced settings* and change the 'Client IP header' to `X-Forwarded-For`.

### Configure SMTP Email (Optional)

{{< flex src="AdminEmail.png" alt="Admin Email" class="rightNoHeader" >}}

One of the best feature of most of [Vaultwarden](https://github.com/dani-garcia/vaultwarden) is the ability to send email notifications. This is useful for when a user is added or removed from the system. To set this up, go to the *Email* tab and fill in the required information.

Login to your email provider and create a new app password. This is because most email providers do not allow you to use your normal password for security reasons. For **Gmail** login into your [Google](https://myaccount.google.com/) account and go to the *Security* tab. In the search bar type in *App passwords*. Now enter then enter an app name and click *Create* and copy the password that is generated.

Fill in the required information:

- **SMTP Server**: smtp.gmail.com
- **SMTP Port**: 587
- **From Address**: Your email address
- **From Name**: Do not use your name, instead use the name of the service, e.i. Vaultwarden
- **Username**: Your email address
- **Password**: The app password that you generated

{{< /flex >}}

Click *Save* and then click *Send Test Email*. If you get a email then the email settings are correct.

### Create a User

To create a user, look for the *<ins>Create account</ins>* link on the login page. Fill in the required information and click *Create account*. You well need to login to the email account that you used to create the user and click on the link that was sent to you.

{{< flex src="VaultAccount.png" alt="Vault Account" class="leftNoHeader" >}}

Once you have clicked on the link, you can now login to the account. You can now add passwords, secure notes, and other information that you want to keep secure.

* **Email Address**: The email address that you used to create the account.
* **Name**: Use you full name here.
* **Master Password**: Use a password that is secure and that you can remember, but it needs to be strong. Do not use a password that you use for other services because if it is compromised, then all your passwords are compromised.

Leave the **Password hint** blank, because if someone gets access to your account, they can use the hint to guess the password.

{{< /flex >}}

No you have a secure password manager that you can use to store all your passwords and other information that you want to keep secure. From here you can add the browser extension to your browser and the mobile app to your phone. For password stored in other password managers, you can import them into Vaultwarden by going to the *Settings* tab and clicking on the *Import/Export* tab. For Web Browser passwords follow the steps for the browser that you are using, disable the password manager and then import the passwords into Vaultwarden.

For the mobile app and browser extension, you well need to select the option to use a self-hosted server and enter the domain name that you are using. If you get redirected to the login option, then the domain name is correct. Enter the email address and master password to log into your account.

## Conclusion

In the guide we have setup a self-hosted password manager using Vaultwarden. We have also setup a database and email notifications. We have also created a user account that you can use to store all your new and imported passwords. If you have any questions or need help, please leave a comment below.
