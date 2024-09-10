# Ansible
Ansible 是一种集成 IT 系统的配置管理、应用部署、执行特定任务的开源平台。Ansible 基于 Python 语言实现，由 Paramiko 和 PyYAML 两个关键模块构建。

地址：https://www.ansible.com/

>特点
- 部署简单，只需要在主控端部署 Ansible 环境，被控端无需作任何操作；
- 默认使用 SSH 协议对设备进行管理；
- 主从集中化管理；
- 配置简单、功能强大、扩展性强；
- 支持 API 及自定义模块、可以通过 Python 轻松扩展；
- 通过 Playbooks 来定制强大的配置、状态管理；
- 对云计算平台、大数据都有很好的支持。

>安装
```shell
yum -y install ansible 
```

> 主机与组

Ansible 在`/etc/ansible/hosts`文件中定义主机与组，主机可以用域名、IP、别名进行标识，组名使用`[]`。
```yaml
mail.example.com
192.168.1.21:2135
[webservers]
bar.example.com
192.168.1.22
[dbservers]
three.example.com
192.168.1.23
jumper ansible_ssh_port=22 ansible_ssh_host=192.168.1.50
```
保留变量：
```md
ansible_ssh_host  # 连接目标主机的地址
ansible_ssh_port  # 连接目标主机SSH端口，端口22无需指定
ansible_ssh_user  # 连接目标主机默认用户
ansible_ssh_pass  # 连接目标主机默认用户密码
ansible_connection  # 目标主机连接类型，可以是local、ssh或paramiko
ansible_ssh_private_key_file  # 连接目标主机的ssh私钥
ansible_*_interpreter  # 指定采用非Python的其他脚本语言，如Ruby、Perl或其他类似ansible_python_interpreter解释器
```

## 变量
>主机变量

主机可以指定变量，供 Playbooks 配置使用，比如定义主机的 http 端口分别为80和8080。
```yaml
[atlanta]
192.168.1.22 http_port=80 
192.168.1.23 http_port=8080 
```

>组变量

组变量作用于所有组成员，通过定义一个新块，块名以`组名:vars`的格式。
```yaml
[atlanta]
192.168.1.22 
192.168.1.23
[atlanta:vars]  
ntp_server=ntp1.aliyun.com
proxy=proxy.gt.com
```
Ansible 支持组嵌套组，通过定义一个新块，块名以`组名:children`的格式：
```shell
[atlanta]
192.168.1.22 
192.168.1.23
[raleigh]
192.168.1.24 
192.168.1.25
[southeast:children]
atlanta
raleigh
[southeast:vars]
some_server=foo.southeast.example.com
halon_system_timeout=30
self_destruct_countdown=60
escape_pods=2
```
Ansible 支持将`/etc/ansible/hosts`定义的主机名与组变量单独剥离出来存放到指定的文件中，以`/etc/ansible/group_vars/+组名`和`/etc/ansible/host_vars/+主机名`的方式存放。

>注册变量

变量的另一个用途是将一条命令的运行结果保存到变量中，供 playbook 使用。
```yaml
- hosts: web_
  tasks:
    - shell: /usr/bin/foo
      register: foo_result
      ignore_errors: rue
    - shell: /usr/bin/bar
      when: foo_result.rc == 5
```
示例注册了一个`foo_result`变量，变量值为`shell: /usr/bin/foo`的运行结果，`ignore_errors：True`为忽略错误。变量注册完成后，就可以在后面 playbook 中使用了，当条件语句`when：foo_result.rc==5`成立时，`shell：/usr/bin/bar`命令才会运行，其中`foo_result.rc`为返回`/usr/bin/foo`的返回码。


## 常用模块
Ansible 提供了非常丰富的模块，包括云计算、命令行、数据库、文件管理、
资产管理等，涉及日常运维工作的方方面面。

>远程命令
包括 shell、command、script，都可以实现远程 shell 命令运行。
>shell 功能是执行远程主机的 shell 脚本文件；
<br>command：默认模块，可以运行远程权限范围所有的shell命令；
<br>script：功能是在远程主机执行主控端存储的shell脚本文件，相当于scp+shell组合。
```shell
ansible web -m command -a "free -m"
ansible web -m script -a "/home/test.sh 12 34"
ansible web -m shell -a "/home/test.sh"
```

### copy
实现主控端向目标主机拷贝文件，类似于 scp 的功能。
```shell
ansible web -m copy -a "src=/home/test.sh dest=/tmp/ owner=root group=root mode=0755"
```

### stat
获取远程文件状态信息，包括 atime、ctime、mtime、md5、uid、gid 等信息。
```shell
ansible web -m stat -a "path=/etc/sysctl.conf"
```

## playbook
playbook 是一个非常简单的配置管理和多主机部署系统，不同于任何已经存在的模式，可作为一个适合部署复杂应用程序的基础。

### 主机与用户
playbook 执行时，可以为主机或组定义变量。
```yaml
- hosts: web
  vars:
    worker_processes: 4
    num_cpus: 4
    max_open_file: 65506
    root: /data
  remote_user: root  # 指定远程操作的用户
```

### 任务列表
任务列表（tasks list），playbook 按配置文件自上而下的顺序执行，定义的主机都将执行相同的任务，但执行的返回结果不一定保持一致。建议每个任务都定义一个 name 标签，好处是增强可读性。
```yaml
tasks: 
  - name: 检测 Nginx 服务是否运行
    service: name=nginx state=running
```
在定义任务时也可以引用变量：
```yaml
tasks: 
  - name: create a virtual host file for {{ vhost }}
    template: src=somefile.j2 dest=/etc/httpd/conf.d/{{ vhost }}
```

### Handlers
当目标主机配置文件发生变化后，通知处理程序（Handlers）来触发后续的动作，比如重启 nginx 服务。Handlers 中定义的处理程序在没有通知触发时是不会执行的，触发后也只会运行一次。触发是通过 Handlers 定义的 name 标签来识别。
```yaml
notify:
  - restart nginx
handlers:
  - name: restart nginx
    service: name=nginx state=restarted
```
notify 中的`restart nginx`与 handlers 中的`name：restart nginx`保持一致。

### 执行 playbook
执行 playbook，可以通过 ansible-playbook 命令实现，如启用10个并行进程数执行 playbook。
```shell
ansible-playbook /home/test/ansible/playbooks/nginx.yml -f 10
```

### 文件复用
当多个 playbook 涉及复用的任务列表时，可以将复用的内容剥离出，写到独立的文件当中，最后在需要的地方 include 进来即可。
```yaml
# task/foo.yml
---
- name: placeholder foo
  command: /bin/foo
- name: placeholder bar
  command: /bin/bar
```
>include
```yaml
tasks:
- include: tasks/foo.yml
```
将变量传递到包含文件当中:
```yaml
tasks:
- include: wordpress.yml user=timmy
- include: wordpress.yml user=alice
- include: wordpress.yml user=bob
```
字典、列表的传递参数：
```yaml
tasks：
- { include: wordpress.yml， user: timmy， ssh_keys: [ 'keys/one.txt'，'keys/two.txt' ] }
```
变量引用:
```yaml
tasks: 
  - name: echo {{ user }}
    command: echo {{ user }}
```

### 角色
角色是 Ansible 定制好的一种标准规范，以不同级别目录层次及文件对角色、变量、任务、处理程序等进行拆分，为后续功能扩展、可维护性打下基础。

>角色目录结构:
```shell
$ tree nginx/
nginx/
├── defaults
│   └── main.yml
├── files
├── handlers
│   └── main.yml
├── meta
│   └── main.yml
├── README.md
├── tasks
│   └── main.yml
├── templates
├── tests
│   ├── inventory
│   └── test.yml
└── vars
    └── main.yml
```
>playbook 引用：
```yaml
# site.yml
---
- hosts: web
  roles:
    - nginx
```

可以引用更多定义好的角色，通常情况下一个角色对应着一个特定功能服务。

>playbook 目录结构：
```shell
$ tree web/
web/
├── grou_vars
│   ├── all
│   └── web
├── hosts
├── roles
│   └── nginx
│       ├── defaults
│       │   └── main.yml
│       ├── files
│       ├── handlers
│       │   └── main.yml
│       ├── meta
│       │   └── main.yml
│       ├── README.md
│       ├── tasks
│       │   └── main.yml
│       ├── templates
│       ├── tests
│       │   ├── inventory
│       │   └── test.yml
│       └── vars
│           └── main.yml
└── site.yml
```
<!-- 定义主机组变量
>web/grou_vars/all
```yaml
---
ntpserver: ntp1.aliyun.com
```
>web/grou_vars/web
```yaml
---
worker_processes: 4
num_cpus: 4
max_open_file: 65536
root: /data
```
全局配置
>site.yml
```yaml
---
- name: install nginx
  hosts: all
  roles: 
    - wnginx
``` -->


## Facts
Facts 可以获取远程主机的系统信息，包括主机名、IP地址、操作系统、分区信
息、硬件信息等，可以配合 playbook 实现更加个性化、灵活的功能需求。运行`ansible hostname -m setup`可获取Facts信息。
```shell
$ ansible 192.168.32.158 -m setup
192.168.32.158 | SUCCESS => {
    "ansible_facts": {
        "ansible_all_ipv4_addresses": [
            "172.17.0.1",
            "192.168.32.158",
            "172.19.0.1"
        ],
        "ansible_all_ipv6_addresses": [],
        "ansible_apparmor": {
            "status": "disabled"
        },
        ......省略更多内容
```
>模板文件中引用：
```yaml
{{ ansible_devices.sda.model }}
{{ ansible_hostname }}
```

当通过 Facts 获取的目标主机信息，不能满足功能需求时，可以通过编写自定义的 Facts 模块来实现。只需在目标主机`/etc/ansible/facts.d`目录定义JSON、INI 或可执行文件的 JSON 输出，文件扩展名要求使用`.fact`。
>/etc/ansible/facts.d/preferences.fact
```yaml
[general]
max_memory_size=32
max_user_processes=3730
open_files=65535
```
>主控端查看
```shell
$ ansible 192.168.32.158 -m setup -a "filter=ansible_local" 
192.168.32.158 | SUCCESS => {
    "ansible_facts": {
        "ansible_local": {
            "preferences": {
                "general": {
                    "max_memory_size": "32",
                    "max_user_processes": "3730",
                    "open_files": "65535"
                }
            }
        },
        "discovered_interpreter_python": "/usr/bin/python"
    },
    "changed": false
}
```
>模板文件中引用：
```yaml
{{ ansible_local.preferences.general.open_files }}
```

## When
想跳过某些主机的执行步骤，比如符合特定版本的操作系统将不安装某个软件包，或者磁盘空间爆满了将进行清理的步骤，可以通过 When 子句实现。
```yaml
tasks：
  - name: "shutdown Debian flavored systems"
    command: /sbin/shutdown -t now
    when: ansible_os_family == "Debian"
```

`when: result|failed`当变量 result 执行结果为成功状态时，将执行`/bin/something_else`命令，其他同理，其中 success 为 Ansible 内部过滤器方法，返回 Ture 代表命令运行成功。
```yaml
tasks:
  - command: /bin/false
    register: result
    ignore_errors: True
  - command: /bin/something
    when: result|failed
  - command: /bin/something_else
    when: result|success
  - command: /bin/still/something_else
    when: result|skipped
```

## 循环
```yaml
- name: add several users
  user: name={{ item }} state=present groups=wheel
  with_items: 
    - testuser1
    - testuser2
```
>字典形式：
```yaml
- name: add several users
  user: name={{ item.name }} state=present groups={{ item.groups }}
  with_items:
    - { name： 'testuser1'， groups： 'wheel' }
    - { name： 'testuser2'， groups： 'root' }
```
>列表形式：
```yaml
----
# file：roles/foo/vars/main.yml
packages_base:
  - [ 'foo-package'， 'bar-package' ]
packages_apps:
  - [ ['one-package'， 'two-package' ]]
  - [ ['red-package']， ['blue-package']]
```
引用：
```yaml
- name: flattened loop demo
  yum: name={{ item }} state=installed
  with_flattened:
    - packages_base
    - packages_apps
```

## Jinja2
Jinja2 是 Python 下一个广泛应用的模板引擎，它的设计思想类似于 Django 的模板引擎，并扩展了其语法和一系列强大的功能，官网地址：http://jinja.pocoo.org/。

```yaml
---
- hosts: 192.168.32.158
  vars:
    filename: /etc/profile
  tasks:
  - name: "shell1"
    shell: echo {{ filename | basename }} >> /tmp/testshell
```
从`/etc/profile`中过滤出文件名`profile`，并输出重定向到`/tmp/testshell`文件中。