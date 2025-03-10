### 一、Linux 基础
1. **系统特点**
- 一切皆文件（设备/进程都以文件形式存在）
- 目录结构：`/`为根目录，`/home`用户目录，`/etc`配置文件，`/bin`基础命令

1. **常用命令**
```bash
ls -l          # 查看文件详细信息
cd ~/project   # 进入用户目录下的project文件夹
pwd            # 显示当前路径
cp a.txt b.txt # 复制文件
rm -r dir      # 递归删除目录
chmod 755 script.sh  # 修改文件权限
```

1. **文本操作三剑客**
```bash
grep "error" log.txt        # 搜索包含error的行
awk '{print $1}' data.txt  # 提取第一列数据
sed 's/foo/bar/g' file.txt # 全局替换文本
```

---

### 二、Shell 生存工具
1. **进程管理**
```bash
top               # 动态监视进程（按q退出）
ps aux | grep python  # 查看所有python进程
kill -9 1234      # 强制结束PID为1234的进程
```

2. **网络工具**
```bash
ping google.com
netstat -tuln     # 查看监听中的端口
curl -O http://example.com/file.zip  # 下载文件
```

3. **效率工具**
```bash
vim file.txt       # 文本编辑器（按i进入编辑，ESC后:wq保存退出）
tar -xzvf archive.tar.gz  # 解压压缩包
find / -name "*.log" 2>/dev/null  # 全盘搜索日志文件
```

---

### 三、Git 三件套实战
1. **基础工作流**
```bash
git init                      # 初始化仓库
git add .                     # 添加所有修改到暂存区
git commit -m "fix: 修复登录bug"  # 提交变更（推荐使用语义化commit）
git push origin main          # 推送到远程main分支
```

2. **实用技巧**
```bash
git status                    # 查看当前状态
git log --oneline             # 查看简洁版提交历史
git remote add origin git@github.com:user/repo.git  # 关联远程仓库
```

---

### 四、tmux 后台训练神器
1. **会话管理**
```bash
tmux new -s train_session  # 创建名为train_session的新会话
Ctrl+b d                   # 分离当前会话（后台保持运行）
tmux ls                    # 查看所有会话
tmux attach -t train_session  # 重新连接会话
```

2. **窗口操作**
```bash
Ctrl+b c       # 新建窗口
Ctrl+b 数字键   # 切换窗口
Ctrl+b "       # 水平分割窗格
Ctrl+b %       # 垂直分割窗格
```

---

### 五、SSH 远程连接
1. **基础连接**
```bash
ssh username@192.168.1.100 -p 22  # 标准连接方式
scp file.txt user@host:/remote/path  # 传输文件到远程
```

2. **密钥认证（免密登录）**
```bash
ssh-keygen -t rsa                 # 生成密钥对（默认存~/.ssh/）
ssh-copy-id -i ~/.ssh/id_rsa.pub user@host  # 上传公钥到服务器
```

3. **保持连接**
```bash
# ~/.ssh/config 配置示例
Host myserver
    HostName 192.168.1.100
    User user
    Port 22
    ServerAliveInterval 60  # 每60秒发送心跳包
```

---

### 六、组合使用示例场景
```bash
# 通过SSH连接服务器 -> 启动tmux -> 运行训练脚本
ssh ml-server
tmux new -s training
python train.py --batch-size 64
# 按Ctrl+b d断开 -> 关闭本地终端，训练持续进行

# 次日重新连接查看进度
ssh ml-server
tmux attach -t training
```

---

遇到了未知的问题先`man`一下指令