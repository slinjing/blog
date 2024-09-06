# 配置网卡信息
在 Linux 系统中一切皆文件，因此配置网络服务的工作其实就是在编辑网卡配置文件，文件路径：`/etc/sysconfig/network-scripts/`目录下的`ifcfg-ens32`。

>示例：

```shell
TYPE="Ethernet"  # 设备类型
PROXY_METHOD="none"
BROWSER_ONLY="no"
BOOTPROTO="static"  # 分配模式 dhcp/static
DEFROUTE="yes"
IPV4_FAILURE_FATAL="no"
IPV6INIT="yes"
IPV6_AUTOCONF="yes"
IPV6_DEFROUTE="yes"
IPV6_FAILURE_FATAL="no"
IPV6_ADDR_GEN_MODE="stable-privacy"
NAME="ens32"  # 网卡名称
UUID="0718a9d8-0a5d-4213-aaac-724d87133b65"
DEVICE="ens32"
ONBOOT="yes"  # 网卡是否启动
IPADDR="11.0.1.70"  # IP 地址
NETMASK="255.255.255.0"  # 子网掩码
GATEWAY="11.0.1.1"  # 网关
DNS1="114.114.114.114"  # DNS 地址
```

配置完成后重启网卡生效`systemctl restart network`。