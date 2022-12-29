# shokaX-CLI
安装shokaX最简单的方式,只需要一行代码

## 快速上手
```bash
npm i shokax-cli --location=global
SXC install shokaX
```
一行代码就能完成shokaX的安装,并且shokaX-cli会处理好依赖项问题 \
不需要像之前一样手动安装多个包

## 高级配置
```bash
SXC install <theme> 
	-r=<gitee/github/npm> # 使用npm(默认)或gitee(github)安装shokaX
	-pm=<npm/yarn/pnpm> # 指定使用的包管理器(不指定会自动检测)
	--mode=<standalone/theme> #建立独立环境(standalone)或仅安装主题
```
