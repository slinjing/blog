# Flask
![](/falsk/falsk.png)
Flask 是一个轻量级的可定制框架，使用 Python 语言编写，较其他同类型框架更为灵活、轻便、安全且容易上手。

## 基本模式
Flask 的基本模式为在程序里将一个视图函数分配给一个URL，每当用户访问这个 URL 时，系统就会执行给该 URL 分配好的视图函数，获取函数的返回值并将其显示到浏览器上，其工作过程见图。
![](/falsk/mode.png)

## Flask 特点
- 轻量级：Flask 没有强制使用数据库，表单验证等，这使得它比较轻量级。

- 易扩展：Flask 提供了扩展的方式来增加其功能，例如SQLAlchemy等。

- 快速部署：Flask 可以部署在多种环境中，例如 Apache, Nginx, lighttpd 等。

- 可交互性 shell：Flask 提供了一个可交互的 shell，可以在不启动 web 服务器的情况下进行 Python 代码的测试。

- 单元测试：Flask 提供了一种方式来测试你的应用。

- RESTful 请求：Flask 支持 RESTful 请求。

- 国际化：Flask 支持国际化。

- 教育性：Flask 是为了教育而创建的，它让开发者可以更好的理解 Web 开发的基础知识。

- 安全性：Flask 提供了一种方式来保护 web 应用不受各种网络攻击。

- 社区支持：Flask 有一个活跃的社区，可以帮助开发者解决问题。


## 快速开始

首先，安装 Flask：
```shell
$ pip install Flask
```

创建一个Python文件（例如app.py）并输入以下代码：
```python
from flask import Flask
 
app = Flask(__name__)
 
@app.route('/')
def hello_world():
    return 'Hello, World!'
 
if __name__ == '__main__':
    app.run()
```

运行这个Python文件：
```shell
$ python app.py
```

服务器将启动，默认情况下在 127.0.0.1 地址的 5000 端口上。打开浏览器并访问`http://127.0.0.1:5000`，将看到 “Hello, World!” 的消息。