# MEAN-Blog

[![Codacy Badge](https://api.codacy.com/project/badge/grade/0b0351f0961f4cf89e5a902c0fa8dd47)](https://www.codacy.com/app/franklioxygen/MEAN-blog)  [![Build Status](https://travis-ci.org/franklioxygen/MEAN-blog.svg?branch=master)](https://travis-ci.org/franklioxygen/MEAN-blog)    [![Dependency Status](https://david-dm.org/franklioxygen/MEAN-blog.svg)](https://david-dm.org/franklioxygen/MEAN-blog)


nodejs
+
mongoose
+
express
+
jade
+
less
+
bootstrap
+
angularjs

###Demo###
[Click here](http://franklioxygen-mean-blog.herokuapp.com/)

###1. Platform Configuration###
###平台配置###

System:

Fefora 23

RAM:512MB

CPU: 1 Core


npm: 3.6.0

NodeJS: 5.3.0

Mongodb: 3.0.7

Express: 4.13.1

Bootstrap: 3.3.6

AngularJS: 1.5


install npm:

安装npm（node包管理器）

```
sudo dnf install npm
```
Ref:

https://docs.npmjs.com/getting-started/installing-node


install express:

安装 express：

```
npm install express --save
sudo npm install express-generator -g
```
install dependencies:

安装依赖包：
```
npm install
```
test server:

测试服务器：
```
npm start
```
now you should be able to see 

http://localhost:3000

running a hello world.

use `ctrl+c` shutdown it.

but this simple command wouldn't restart the server while you coding.

i suggest use `node-dev` run the server.

现在应该可以看到服务器在http://localhost:3000

运行了一个hello world程序，可以用ctrl+c结束。

但是我建议使用node-dev来运行服务器，在修改文件时可以自动重启服务器。


```
sudo npm install -g node-dev
```
then you can use the command below to run the server,

at the same time you can see http status feedback on screen.

这时你可以使用下面命令运行服务器了。

```
node-dev ./bin/www
```
previous process is how to build your development platform

以上内容是如何建立开发环境

###2. Run Code##
###运行源码###

forget the "project" above.

以下内容与上步project并没有关联


run `npm install` in 'blog' root folder where you download the code, if you got crasy errors, please update your nodejs with this:

在blog代码根目录使用`npm install`命令，如果得到很多错误，请先使用下列命令更新nodejs版本： 
```
sudo npm update –g
sudo npm install -g n
n 5.3
```

then 

然后

```
npm install
```
Download Mongodb at:

在此下载Mongodb：

https://www.mongodb.org/downloads#production

create mongodb's data directory:

创建mongodb的数据路径:

```
sudo mkdir /data
sudo mkdir /data/db
```
then come to unziped mongodb's folder, run:

然后去mongodb的文件夹中执行

```
sudo ./bin/mongod
```
final step, go to the blog code's folder, run:

最后一步，去blog代码的根目录执行：

```
node-dev ./bin/www
```
