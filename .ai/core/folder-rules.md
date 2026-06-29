# 目录规范

apps：

业务应用。

packages：

公共能力。

server：

BFF。

docs：

文档。

禁止跨层依赖。

例如：

apps

不能直接访问：

server/db

所有依赖必须通过：

packages

进行抽象。

新增目录必须：

同步更新：

README

目录树

Architecture 文档。
