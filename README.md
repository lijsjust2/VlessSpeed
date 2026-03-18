# 订阅优选工具

一个基于 Cloudflare Workers 的简化版订阅优选工具，专门用于加速 VLESS Reality 订阅链接。

## 功能特性

- 🚀 **订阅链接解析**：自动解析 VLESS Reality 格式的订阅链接
- 📝 **自定义优选地址**：支持输入多个优选地址（每行一个）
- 💾 **配置管理**：通过可视化后台管理原订阅和优选地址
- 🔗 **一键生成**：自动生成优选后的订阅链接
- 🎨 **简洁界面**：参考 edgetunnel 的设计风格，界面简洁美观

## 快速开始

### 1. 准备工作

- 一个 Cloudflare 账号
- 一个域名（已接入 Cloudflare）
- 你的 VLESS Reality 订阅链接

### 2. 部署步骤

#### 方法一：通过 Cloudflare Workers + GitHub 部署（推荐）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** > **创建应用程序**
3. 选择 **连接到 Git**
4. 授权 Cloudflare 访问你的 GitHub 账号
5. 选择仓库 `VlessSpeed`
6. 点击 **开始设置**
7. 在 **构建和部署**设置中：
   - 构建命令：留空（无需构建）
   - 输出目录：留空
8. 点击 **保存并部署**

#### 方法二：通过 Cloudflare Workers 手动部署

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** > **创建应用程序**
3. 选择 **创建 Worker**
4. 将 [`worker.js`](file:///d:\edgetunnel\sub-optimizer\worker.js) 的内容粘贴到 Worker 编辑器中
5. 点击 **部署**

#### 方法三：通过 Wrangler CLI 部署

1. 安装 Wrangler CLI：
   ```bash
   npm install -g wrangler
   ```

2. 登录 Cloudflare：
   ```bash
   wrangler login
   ```

3. 创建 KV 命名空间：
   ```bash
   wrangler kv:namespace create "KV"
   ```

4. 将返回的 ID 填入 [`wrangler.toml`](file:///d:\edgetunnel\sub-optimizer\wrangler.toml) 文件中

5. 部署：
   ```bash
   wrangler deploy
   ```

### 3. 配置环境变量

在 Worker 设置中添加以下环境变量：

| 变量名 | 必填 | 说明 | 示例 |
|--------|------|------|------|
| `ADMIN` | ✅ | 后台管理密码 | `your_password` |
| `KEY` | ❌ | 加密密钥（可选） | `your_secret_key` |

### 4. 绑定 KV 命名空间

在 Worker 设置中绑定 KV 命名空间：

1. 进入 Worker 设置 > **绑定**
2. 点击 **添加绑定** > **KV 命名空间**
3. 变量名称填写：`KV`
4. 选择你创建的 KV 命名空间
5. 点击 **添加绑定**

### 5. 绑定自定义域名

1. 在 Worker 的 **触发器** 选项卡中
2. 点击 **添加自定义域**
3. 输入你的域名（如：`sub.yourdomain.com`）
4. 等待证书生效

## 使用方法

### 1. 访问管理后台

访问：`https://your-domain.com/admin`

输入你设置的管理员密码登录。

### 2. 配置订阅

在管理后台：

1. **原订阅链接**：输入你的 VLESS Reality 订阅链接
   ```
   vless://your-uuid@your-server.com:443?encryption=none&flow=xtls-rprx-vision&security=reality&sni=your-sni.com&fp=chrome&pbk=your-pbk&sid=your-sid&spx=%2F&type=tcp&headerType=none#your-remark
   ```

2. **优选地址列表**：输入优选地址（每行一个，支持带自定义节点名）
   ```
   1.1.1.1:443#节点1
   2.2.2.2:443#节点2
   example.com#节点3
   ```
   
   **格式说明**：
   - `地址#节点名`：使用自定义节点名
   - `地址`：不指定节点名时，自动使用 `原订阅备注_地址` 作为节点名

3. 点击 **保存配置**

### 3. 获取优选订阅

保存配置后，访问以下链接获取优选后的订阅：

```
https://your-domain.com/sub
```

该链接会自动生成多个优选节点，每个节点对应一个优选地址。

## 技术原理

### 订阅链接解析

工具会解析你的原订阅链接，提取以下信息：
- UUID
- 端口
- 加密方式
- 流控（flow）
- 安全协议（security）
- SNI
- 指纹（fp）
- 公钥（pbk）
- 短 ID（sid）
- 传输类型

### 优选订阅生成

对于每个优选地址，工具会：
1. 保留原订阅的所有参数
2. 替换地址为优选地址
3. 生成新的订阅链接
4. 将所有订阅链接打包成 base64 编码的订阅格式

## 文件结构

```
sub-optimizer/
├── worker.js          # Worker 主程序
├── package.json        # 项目配置文件
├── wrangler.toml       # Wrangler 配置文件
├── admin.html          # 管理后台页面（备用）
└── README.md           # 项目说明文档
```

## API 接口

### GET /admin
管理后台页面（需要登录）

### POST /admin/config.json
保存配置（需要登录）

**请求体：**
```json
{
  "原订阅链接": "vless://...",
  "优选地址": ["1.1.1.1", "2.2.2.2"]
}
```

### GET /sub
获取优选后的订阅链接

**响应：** base64 编码的订阅内容

## 注意事项

1. **安全性**：请设置强密码保护管理后台
2. **优选地址**：优选地址需要是可访问的 IP 或域名
3. **订阅格式**：目前仅支持 VLESS Reality 格式
4. **流量限制**：Cloudflare Workers 有免费流量限制，请注意使用量

## 常见问题

### Q: 为什么访问 /sub 返回错误？
A: 请确保你已经在后台配置了原订阅链接和优选地址列表。

### Q: 如何修改管理密码？
A: 在 Worker 环境变量中修改 `ADMIN` 变量的值。

### Q: 支持其他协议吗？
A: 目前仅支持 VLESS Reality 协议，未来可能添加其他协议支持。

### Q: 优选地址从哪里获取？
A: 你可以使用 Cloudflare 优选 IP 工具或其他优选服务获取优选地址。

## 许可证

MIT License

## 免责声明

本工具仅供学习和个人使用，请遵守当地法律法规。作者不对使用本工具产生的任何后果负责。
