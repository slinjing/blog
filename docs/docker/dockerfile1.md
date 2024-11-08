# Dockerfile 常用指令


## COPY

**COPY** 指令将从构建上下文目录中 **源路径** 的 **文件** 或 **目录** 复制到新的一层的镜像内的 **目标路径** 位置。

**格式**：

`COPY [--chown=<user>:<group>] <源路径>... <目标路径>`   
`COPY [--chown=<user>:<group>] ["<源路径1>",... "<目标路径>"]`


```Dockerfile
COPY package.json /usr/src/app/
```

源路径可以是多个，也可以是 **通配符**。

```Dockerfile
COPY hom* /mydir/
COPY hom?.txt /mydir/
```

**目标路径** 可以是容器内的绝对路径，也可以是相对于工作目录的相对路径（工作目录可以用 `WORKDIR` 指令来指定）。目标路径不需要事先创建，如果目录不存在会在复制文件前先行创建缺失目录。

> [!TIP] 注意：
> 使用 COPY 指令，源文件的各种元数据都会保留。比如**读、写、执行**权限、文件变更时间等。这个特性对于镜像定制很有用。特别是构建相关文件都在使用 Git 进行管理的时候。

在使用该指令的时候还可以加上 `--chown=<user>:<group>` 选项来改变文件的所属用户及所属组。


```Dockerfile
COPY --chown=55:mygroup files* /mydir/
COPY --chown=bin files* /mydir/
COPY --chown=1 files* /mydir/
COPY --chown=10:11 files* /mydir/
```
如果源路径为文件夹，复制的时候不是直接复制该文件夹，而是将文件夹中的内容复制到目标路径。

## ADD 
**ADD** 指令和 **COPY** 的格式和性质基本一致，但是在 **COPY** 基础上增加了一些功能。如果源路径为一个 `tar` 压缩文件的话，**ADD** 指令将会自动解压缩这个压缩文件到目标路径。

```Dockerfile
FROM scratch
ADD ubuntu-xenial-core-cloudimg-amd64-root.tar.gz /
```

> [!TIP] 注意：
> 在 COPY 和 ADD 指令中选择的时候，建议所有的文件复制均使用 COPY 指令，仅在需要自动解压缩的场合使用 ADD。

在使用该指令的时候还可以加上 `--chown=<user>:<group>` 选项来改变文件的所属用户及所属组。


```Dockerfile
ADD --chown=55:mygroup files* /mydir/
ADD --chown=bin files* /mydir/
ADD --chown=1 files* /mydir/
ADD --chown=10:11 files* /mydir/
```

## CMD

**CMD** 指令用于指定默认的容器主进程的启动命令的，在运行时可以指定新的命令来替代镜像设置中的这个默认命令。**CMD** 指令有两种格式：
- shell 格式：`CMD <命令>`
- exec 格式：`CMD ["可执行文件", "参数1", "参数2"...]`
- 参数列表格式：`CMD ["参数1", "参数2"...]`。在指定了 `ENTRYPOINT` 指令后，用 `CMD` 指定具体的参数。