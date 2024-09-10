# Shell 脚本
Shell 脚本就是将 Linux 命令以及正则表达式、管道符、数据流重定向、条件判断等语法规则组合到一起，形成一次性执行脚本中诸多命令的文件。Shell 脚本文件的名称可以任意，建议将.sh 后缀结尾表示是一个脚本文件。

## 环境变量
变量是计算机系统用于保存可变值的数据类型，Linux系统中的环境变量是用来定义系统运行环境的一些参数。
```md
      参数          说明
      HOME      |  用户的主目录（即家目录） 
      SHELL     |  用户在使用的 Shell 解释器名称  
     HISTSIZE   |  输出的历史命令记录条数  
   HISTFILESIZE |  保存的历史命令记录条数  
      MAIL      |  邮件保存路径  
      LANG      |  系统语言、语系名称
      RANDOM    |  生成一个随机数字
      PS1       |  Bash 解释器的提示符
      PATH      |  定义解释器搜索用户执行命令的路径   
      EDITOR    |  用户默认的文本编辑器  
```

## 数组
Shell 数组用括号来表示，元素用空格符号分割开，初始化时不需要定义数组大小。
>定义数组
```shell
#!/bin/bash

my_array=(A B "C" D)
```

>读取数组
```shell
#!/bin/bash

my_array=(A B "C" D)

echo "第一个元素为: ${my_array[0]}"
echo "第二个元素为: ${my_array[1]}"
echo "第三个元素为: ${my_array[2]}"
echo "第四个元素为: ${my_array[3]}"
```

## 传递参数
Shell 脚本语言内设了用于接收参数的变量，变量之间可以使用空格间隔。例如`$0` 对应的是当前 Shell 脚本程序的名称，`$#`对应的是总共有几个参数。
```md
  参数    说明
  $#  |  传递到脚本的参数总个数 
  $*  |  所有向脚本传递的参数  
  $$  |  脚本运行的当前进程ID号  
  $!  |  后台运行的最后一个进程的ID号  
  $-  |  显示Shell使用的当前选项，与set命令功能相同  
  $?  |  显示最后命令的退出状态。0表示没有错误，其他任何值表明有错误
```

>示例：
```shell
$ vim test.sh
#!/bin/bash
echo "当前脚本名称为$0"
echo "总共有$#个参数，分别是$*。"
echo "第 1 个参数为$1，第 5 个为$5。"

$ sh test.sh 1 2 3 4 5 
当前脚本名称为test.sh
总共有5个参数，分别是1 2 3 4 5。
第 1 个参数为1，第 5 个为5。
```

## 运算符
Shell 脚本中的条件测试语法可以判断表达式是否成立，若条件成立则返回数字 0，否则便返回其他随机数值。格式`[ 条件表达式 ]`，条件表达式两边均应有一个空格。

>算术运算
```md
  参数    说明                          
  ==  |  等于，相同返回true          
  !=  |  不等于，不相同返回true      
```

>逻辑运算
```md
 参数    说明                          
  &&  |  AND         
  ||  |  OR      
```

>关系运算
```md
  参数    说明                          
  -eq |  是否等于        
  -ne |  是否不等于
  -gt |  是否大于
  -lt |  是否小于
  -le |  是否等于或小于
  -ge |  是否大于或等于     
```

>布尔运算
```md
  参数    说明                          
   ! |  非运算，表达式为 true 则返回 false，否则返回 true        
  -o |  或运算，有一个表达式为 true 则返回 true
  -a |  与运算，两个表达式都为 true 才返回 true   
```

>字符串运算
```md
  参数    说明                          
   = |  检测两个字符串是否相等，相等返回 true       
  != |  检测两个字符串是否不相等，不相等返回 true
  -z |  检测字符串长度是否为0，为0返回 true   
  -n |  检测字符串长度是否不为 0，不为 0 返回 true
   $ |  检测字符串是否不为空，不为空返回 true     
```

>文件测试运算
```md
  参数    说明                          
  -b | 检测文件是否是块设备文件，如果是，则返回 true   
  -c | 检测文件是否是字符设备文件，如果是，则返回 true          
  -d | 测试文件是否为目录类型
  -e | 测试文件是否存在 
  -f | 判断是否为一般文件 
  -g | 检测文件是否设置了 SGID 位，如果是，则返回 true
  -r | 测试当前用户是否有权限读取 
  -w | 测试当前用户是否有权限写入
  -x | 测试当前用户是否有权限执行    
```

>自增和自减操作

`let`
```shell
#!/bin/bash
num=5
# 自增
let num++
# 自减
let num--
```

`$(( ))`
```shell
#!/bin/bash
num=5
# 自增
num=$((num + 1))
# 自减
num=$((num - 1))
```

## 流程控制
### if 
if 条件测试语句可以让脚本根据实际情况自动执行相应的命令，if 语句分为if、if else、if else-if else。
>if 
```shell
#!/bin/bash
# 判断 /root/test 文件是否存在,若存在就结束反之创建目录
DIR="/root/test"
if [ ! -e $DIR ] ; then
    mkdir -p $DIR
fi
```

>if else
```shell
#!/bin/bash
ping -c 3 -i 0.2 -W 3 $1 &> /dev/null
if [ $? -eq 0 ] ; then
    echo "主机 $1 在线."
    else echo "主机 $1 不在线."
fi
```

>if else-if else
```shell
#!/bin/bash
read -p "输入您的分数（0-100）：" GRADE
if [ $GRADE -gt 100 ] ; then
    echo "$GRADE 您输入的成绩超过100了！"
elif [ $GRADE -ge 85 ] && [ $GRADE -le 100 ] ; then
    echo "$GRADE 优秀"
elif [ $GRADE -ge 70 ] && [ $GRADE -le 84 ] ; then
    echo "$GRADE 良好"
elif [ $GRADE -ge 60 ] ; then
    echo "$GRADE 及格"
else
    echo "$GRADE 不及格"
fi
```


### for 
for 循环语句允许脚本一次性读取多个信息，然后逐一对信息进行操作处理。

```shell
for loop in 1 2 3 4 5
do
    echo "The value is: $loop"
done
```

### while
while 条件循环语句是一种让脚本根据某些条件来重复执行命令的语句，它的循环结构往往在执行前并不确定最终执行的次数。
```shell
#!/bin/bash
int=1
while (( $int<=5 ))
do
    echo $int
    let "int++"
done
```

### case
case 语句是在多个范围内匹配数据，若匹配成功则执行相关命令；如果数据不在所列出的范围内，则会去执行星号`*)`中所定义的默认命令。
```shell
#!/bin/sh

site=$1

case "$site" in
   "-d") echo "正在下载"
   ;;
   "-i") echo "正在安装"
   ;;
   "-v") echo "版本信息"
   ;;
   *) echo "请输入参数 -d：下载；-i：安装；-v：查看版本"
esac
```

### break
break 命令允许跳出所有循环，终止执行后面的所有循环。
```shell
#!/bin/bash
while :
do
    echo -n "输入 1 到 5 之间的数字:"
    read aNum
    case $aNum in
        1|2|3|4|5) echo "你输入的数字为 $aNum!"
        ;;
        *) echo "你输入的数字不是 1 到 5 之间的! 游戏结束"
            break
        ;;
    esac
done
```

### continue
continue 命令与 break 命令类似，只有一点差别，它不会跳出所有循环，仅仅跳出当前循环。
```shell
#!/bin/bash
while :
do
    echo -n "输入 1 到 5 之间的数字: "
    read aNum
    case $aNum in
        1|2|3|4|5) echo "你输入的数字为 $aNum!"
        ;;
        *) echo "你输入的数字不是 1 到 5 之间的!"
            continue
            echo "游戏结束"
        ;;
    esac
done
```

## test
test 命令用于检查某个条件是否成立，它可以进行数值、字符和文件三个方面的测试。
>数值测试
```shell
num1=100
num2=100
if test $[num1] -eq $[num2]
then
    echo '两个数相等！'
else
    echo '两个数不相等！'
fi
```

>字符串测试
```shell
num1="ru1noob"
num2="runoob"
if test $num1 = $num2
then
    echo '两个字符串相等!'
else
    echo '两个字符串不相等!'
fi
```

>文件测试
```shell
cd /bin
if test -e ./notFile -o -e ./bash
then
    echo '至少有一个文件存在!'
else
    echo '两个文件都不存在'
fi
```

## 函数
用户可以定义函数，然后在 shell 脚本中调用。

### 函数定义
> 使用`function fun()` 定义，也可以直接`fun()`定义；
<br>参数返回，可以显示加`return`返回，如果不加，将以最后一条命令运行结果，作为返回值。 return 只能返回0到255之间的整数。

```shell
#!/bin/bash

demoFun(){
    echo "第一个函数!"
}
echo "-----函数执行-----"
demoFun
echo "-----函数执行完毕-----"
```

### 函数参数
调用函数时可以向其传递参数。在函数体内部，通过`$n`的形式来获取参数的值，`$1`表示第一个参数，`$2`表示第二个参数。当n>=10时，需要使用`${n}`来获取参数。
```shell
#!/bin/bash

funWithParam(){
    echo "第一个参数为 $1 !"
    echo "第二个参数为 $2 !"
    echo "参数总数有 $# 个!"
    echo "输出所有参数 $* !"
}

funWithParam 1 2 3 4 5 
```

## 文件包含
Shell 可以包含外部脚本文件，这样可以很方便的封装一些公用的代码作为一个独立的文件。
>test1.sh
```shell
#!/bin/bash

url="http://www.google.com"
```
>test2.sh
```shell
#!/bin/bash

# 使用 . 号来引用test1.sh 文件
. ./test1.sh

# 或者使用以下包含文件代码
# source ./test1.sh

echo "google 官网地址：$url"
```