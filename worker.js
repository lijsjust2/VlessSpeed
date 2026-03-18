const Pages静态页面 = 'https://edt-pages.github.io';

const 管理页面HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>订阅优选工具</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }
        .container { max-width: 900px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1); padding: 30px; }
        h1 { color: #333; margin-bottom: 10px; font-size: 28px; }
        .subtitle { color: #666; margin-bottom: 30px; font-size: 14px; }
        .form-group { margin-bottom: 25px; }
        label { display: block; margin-bottom: 8px; color: #333; font-weight: 500; font-size: 14px; }
        input[type="text"], textarea { width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px; font-family: 'Courier New', monospace; transition: border-color 0.3s; }
        input[type="text"]:focus, textarea:focus { outline: none; border-color: #667eea; }
        textarea { min-height: 200px; resize: vertical; }
        .button-group { display: flex; gap: 10px; margin-top: 20px; }
        button { padding: 12px 24px; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.3s; }
        .btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4); }
        .btn-secondary { background: #f5f5f5; color: #333; }
        .btn-secondary:hover { background: #e0e0e0; }
        .success-message { background: #d4edda; color: #155724; padding: 12px; border-radius: 8px; margin-top: 20px; display: none; }
        .error-message { background: #f8d7da; color: #721c24; padding: 12px; border-radius: 8px; margin-top: 20px; display: none; }
        .info-box { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin-bottom: 20px; border-radius: 4px; }
        .info-box h3 { color: #1976d2; margin-bottom: 8px; font-size: 16px; }
        .info-box p { color: #424242; font-size: 14px; line-height: 1.6; }
        .copy-button { background: #4caf50; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; margin-top: 10px; }
        .copy-button:hover { background: #45a049; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 订阅优选工具</h1>
        <p class="subtitle">通过 IP 优选加速你的 VLESS Reality 订阅</p>
        
        <div class="info-box">
            <h3>📖 使用说明</h3>
            <p>1. 输入你的原订阅链接（VLESS Reality 格式）<br>
               2. 输入优选地址列表（每行一个，支持带节点名）<br>
               3. 点击保存配置<br>
               4. 访问 <strong>/sub</strong> 获取优选后的订阅链接</p>
        </div>
        
        <div class="form-group">
            <label for="originalSubscription">原订阅链接</label>
            <input type="text" id="originalSubscription" placeholder="vless://uuid@address:port?params#remark">
        </div>
        
        <div class="form-group">
            <label for="optimizedAddresses">优选地址列表（每行一个，格式：地址#节点名）</label>
            <textarea id="optimizedAddresses" placeholder="1.1.1.1:443#节点1&#10;2.2.2.2:443#节点2&#10;example.com#节点3"></textarea>
        </div>
        
        <div class="button-group">
            <button class="btn-primary" onclick="saveConfig()">💾 保存配置</button>
            <button class="btn-secondary" onclick="loadConfig()">📥 加载配置</button>
        </div>
        
        <div id="successMessage" class="success-message"></div>
        <div id="errorMessage" class="error-message"></div>
        
        <div class="info-box" style="margin-top: 30px;">
            <h3>🔗 获取优选订阅</h3>
            <p>保存配置后，访问以下链接获取优选后的订阅：</p>
            <p style="margin-top: 10px; font-family: 'Courier New', monospace; background: #f5f5f5; padding: 10px; border-radius: 4px;">
                <span id="subscriptionUrl">https://your-domain.com/sub</span>
            </p>
            <button class="copy-button" onclick="copySubscriptionUrl()">📋 复制订阅链接</button>
        </div>
    </div>
    
    <script>
        async function saveConfig() {
            const originalSubscription = document.getElementById('originalSubscription').value.trim();
            const optimizedAddresses = document.getElementById('optimizedAddresses').value.trim();
            
            if (!originalSubscription) {
                showError('请输入原订阅链接');
                return;
            }
            
            if (!optimizedAddresses) {
                showError('请输入优选地址列表');
                return;
            }
            
            const addresses = optimizedAddresses.split('\\n').filter(addr => addr.trim());
            
            try {
                const response = await fetch('/admin/config.json', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 原订阅链接: originalSubscription, 优选地址: addresses })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showSuccess('配置保存成功！');
                    updateSubscriptionUrl();
                } else {
                    showError('保存失败：' + (result.error || '未知错误'));
                }
            } catch (error) {
                showError('保存失败：' + error.message);
            }
        }
        
        async function loadConfig() {
            try {
                const response = await fetch('/admin/config.json');
                const config = await response.json();
                
                document.getElementById('originalSubscription').value = config.原订阅链接 || '';
                document.getElementById('optimizedAddresses').value = (config.优选地址 || []).join('\\n');
                
                showSuccess('配置加载成功！');
                updateSubscriptionUrl();
            } catch (error) {
                showError('加载配置失败：' + error.message);
            }
        }
        
        function showSuccess(message) {
            const successDiv = document.getElementById('successMessage');
            const errorDiv = document.getElementById('errorMessage');
            successDiv.textContent = message;
            successDiv.style.display = 'block';
            errorDiv.style.display = 'none';
            setTimeout(() => { successDiv.style.display = 'none'; }, 3000);
        }
        
        function showError(message) {
            const errorDiv = document.getElementById('errorMessage');
            const successDiv = document.getElementById('successMessage');
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            successDiv.style.display = 'none';
            setTimeout(() => { errorDiv.style.display = 'none'; }, 5000);
        }
        
        function updateSubscriptionUrl() {
            const url = window.location.origin + '/sub';
            document.getElementById('subscriptionUrl').textContent = url;
        }
        
        function copySubscriptionUrl() {
            const url = document.getElementById('subscriptionUrl').textContent;
            navigator.clipboard.writeText(url).then(() => {
                showSuccess('订阅链接已复制到剪贴板！');
            }).catch(err => {
                showError('复制失败：' + err.message);
            });
        }
        
        window.onload = function() {
            updateSubscriptionUrl();
            loadConfig();
        };
    <\/script>
</body>
</html>`;

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const UA = request.headers.get('User-Agent') || 'null';
        const 管理员密码 = env.ADMIN || 'admin123';
        const 加密秘钥 = env.KEY || 'default_key';

        if (url.protocol === 'http:') {
            return Response.redirect(url.href.replace(`http://${url.hostname}`, `https://${url.hostname}`), 301);
        }

        const 访问路径 = url.pathname.slice(1).toLowerCase();
        const 区分大小写访问路径 = url.pathname.slice(1);

        if (访问路径 === 'login') {
            const cookies = request.headers.get('Cookie') || '';
            const authCookie = cookies.split(';').find(c => c.trim().startsWith('auth='))?.split('=')[1];
            
            if (authCookie === await MD5MD5(UA + 加密秘钥 + 管理员密码)) {
                return new Response('重定向中...', { status: 302, headers: { 'Location': '/admin' } });
            }
            
            if (request.method === 'POST') {
                const formData = await request.text();
                const params = new URLSearchParams(formData);
                const 输入密码 = params.get('password');
                if (输入密码 === 管理员密码) {
                    const 响应 = new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json;charset=utf-8' } });
                    响应.headers.set('Set-Cookie', `auth=${await MD5MD5(UA + 加密秘钥 + 管理员密码)}; Path=/; Max-Age=86400; HttpOnly`);
                    return 响应;
                }
            }
            return fetch(Pages静态页面 + '/login');
        }

        if (访问路径 === 'admin' || 访问路径.startsWith('admin/')) {
            const cookies = request.headers.get('Cookie') || '';
            const authCookie = cookies.split(';').find(c => c.trim().startsWith('auth='))?.split('=')[1];
            
            if (!authCookie || authCookie !== await MD5MD5(UA + 加密秘钥 + 管理员密码)) {
                return new Response('重定向中...', { status: 302, headers: { 'Location': '/login' } });
            }

            if (访问路径 === 'admin/config.json' && request.method === 'POST') {
                try {
                    if (!env.KV || typeof env.KV.put !== 'function') {
                        return new Response(JSON.stringify({ error: 'KV 命名空间未绑定，请在 Cloudflare Dashboard 中绑定 KV 命名空间' }), { status: 500, headers: { 'Content-Type': 'application/json;charset=utf-8' } });
                    }
                    const newConfig = await request.json();
                    await env.KV.put('config.json', JSON.stringify(newConfig, null, 2));
                    return new Response(JSON.stringify({ success: true, message: '配置已保存' }), { status: 200, headers: { 'Content-Type': 'application/json;charset=utf-8' } });
                } catch (error) {
                    return new Response(JSON.stringify({ error: '保存配置失败: ' + error.message }), { status: 500, headers: { 'Content-Type': 'application/json;charset=utf-8' } });
                }
            }

            if (访问路径 === 'admin/config.json') {
                const config = await 读取配置(env);
                return new Response(JSON.stringify(config, null, 2), { status: 200, headers: { 'Content-Type': 'application/json' } });
            }

            return new Response(管理页面HTML, { 
                status: 200, 
                headers: { 'Content-Type': 'text/html;charset=utf-8' } 
            });
        }

        if (访问路径 === 'logout') {
            const 响应 = new Response('重定向中...', { status: 302, headers: { 'Location': '/login' } });
            响应.headers.set('Set-Cookie', 'auth=; Path=/; Max-Age=0; HttpOnly');
            return 响应;
        }

        if (访问路径 === 'sub') {
            const config = await 读取配置(env);
            const 优选地址列表 = config.优选地址 || [];
            const 原订阅链接 = config.原订阅链接 || '';
            
            if (!原订阅链接 || 优选地址列表.length === 0) {
                return new Response('请先在后台配置原订阅链接和优选地址', { status: 400 });
            }

            const 新订阅链接 = 生成优选订阅(原订阅链接, 优选地址列表);
            return new Response(新订阅链接, { 
                status: 200, 
                headers: { 
                    'Content-Type': 'text/plain;charset=utf-8',
                    'Content-Disposition': 'attachment; filename="optimized_subscription.txt"'
                } 
            });
        }

        return new Response('欢迎来到订阅优选工具', { status: 200 });
    }
};

async function MD5MD5(string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(string);
    const hashBuffer = await crypto.subtle.digest('MD5', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

async function 读取配置(env) {
    try {
        if (!env.KV || typeof env.KV.get !== 'function') {
            return {
                原订阅链接: '',
                优选地址: []
            };
        }
        const configStr = await env.KV.get('config.json');
        if (configStr) {
            return JSON.parse(configStr);
        }
        return {
            原订阅链接: '',
            优选地址: []
        };
    } catch (error) {
        return {
            原订阅链接: '',
            优选地址: []
        };
    }
}

function 解析VLESS订阅(订阅链接) {
    try {
        const url = new URL(订阅链接);
        const params = new URLSearchParams(url.search);
        
        return {
            uuid: url.username,
            address: url.hostname,
            port: url.port || '443',
            params: {
                encryption: params.get('encryption') || 'none',
                flow: params.get('flow') || '',
                security: params.get('security') || 'reality',
                sni: params.get('sni') || '',
                fp: params.get('fp') || 'chrome',
                pbk: params.get('pbk') || '',
                sid: params.get('sid') || '',
                spx: params.get('spx') || '',
                type: params.get('type') || 'tcp',
                headerType: params.get('headerType') || 'none'
            },
            remark: url.hash ? url.hash.slice(1) : 'optimized'
        };
    } catch (error) {
        console.error('解析订阅链接失败:', error);
        return null;
    }
}

function 生成优选订阅(原订阅链接, 优选地址列表) {
    const 订阅配置 = 解析VLESS订阅(原订阅链接);
    if (!订阅配置) {
        return '解析订阅链接失败';
    }

    const 新订阅列表 = [];
    
    优选地址列表.forEach(地址行 => {
        let 地址 = 地址行.trim();
        let 节点名 = '';
        
        if (地址.includes('#')) {
            const parts = 地址.split('#');
            地址 = parts[0].trim();
            节点名 = parts.slice(1).join('#').trim();
        }
        
        if (!节点名) {
            节点名 = `${订阅配置.remark}_${地址}`;
        }
        
        const 新订阅 = `vless://${订阅配置.uuid}@${地址}:${订阅配置.port}?encryption=${订阅配置.params.encryption}&flow=${订阅配置.params.flow}&security=${订阅配置.params.security}&sni=${订阅配置.params.sni}&fp=${订阅配置.params.fp}&pbk=${订阅配置.params.pbk}&sid=${订阅配置.params.sid}&spx=${订阅配置.params.spx}&type=${订阅配置.params.type}&headerType=${订阅配置.params.headerType}#${encodeURIComponent(节点名)}`;
        新订阅列表.push(新订阅);
    });

    return btoa(新订阅列表.join('\n'));
}
