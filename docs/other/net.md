# 交换机 NTP 时钟同步
交换机默认情况下不侦听 NTP 服务器，当需要完成网络设备 NTP 时钟同步时，需要手工配置 NTP 服务。
- 开启 NTP 服务
```shell
undo ntp-service disable 
```
- 指定发送 NTP 报文的源接口
```shell
ntp-service source-interface Vlanif 110
```
- 检查配置结果
```shell
display ntp status
```
时钟状态显示为 synchronized 表示设备已完成时钟同步。
