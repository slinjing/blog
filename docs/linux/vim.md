# Vim 文本编辑器
Vim 是从 vi 发展出来的一个文本编辑器。代码补全、编译及错误跳转等方便编程的功能特别丰富，在程序员中被广泛使用，和 Emacs 并列成为类 Unix 系统用户最喜欢的文本编辑器。

## 工作模式
Vim 有命令、末行和编辑三种模式，每种模式分别又支持多种不同的命令快捷键，这大大提高了工作效率。
![img](/vim-1.png)
运行 Vim 编辑器时，默认进入命令模式，此时需要先切换到输入模式后再进行文档编写工作，而每次在编写完文档后需要先返回命令模式，然后再进入末行模式，执行文档的保存或退出操作。在 Vim 中，无法直接从输入模式切换到末行模式。

## Vim 命令
### 命令模式
```md
  参数    说明
   i  |  在当前字符前插入文本 
   I  | 在行首插入文本 
   a  | 在当前字符后添加文本 
   A  | 在行末添加文本 
   o  | 在当前行后面插入一空行 
   O  | 在当前行前面插入一空行 
  dd  | 删除光标所在整行 
  5dd | 删除从光标处开始的5行
  yy  | 复制光标所在整行 
  5yy | 复制从光标处开始的5行 
   n  | 显示搜索命令定位到的下一个字符串 
   N  | 显示搜索命令定位到的上一个字符串 
   u  | 撤销上一步的操作 
   p  | 将之前删除或复制过的数据粘贴到光标后面 
```

### 末行模式
```md
  参数              说明
  :w            |   保存 
  :q            |   退出 
  :q!           |   强制退出 
  :wq!          |   强制保存退出 
  :set nu       |   显示行号 
  :set nonu     |   不显示行号 
  :命令          |   执行该命令 
  :整数         |    跳转到该行 
  \:s/one/two   |    将当前光标所在行的第一个 one 替换成 two 
  \:s/one/two/g |    将当前光标所在行的所有 one 替换成 two 
  :%s/one/two/g |    将全文中的所有 one 替换成 two 
  ?字符串        |    在文本中从下至上搜索该字符串 
  /字符串        |    在文本中从上至下搜索该字符串 
```

## Vim 键盘图
![img](/vim-2.png)