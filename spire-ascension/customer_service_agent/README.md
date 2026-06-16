# 电商售后客服智能体（DeepSeek + RAG）

选题：**电商售后客服（服装类）** — 覆盖退换货、物流、产品保养、优惠券与投诉处理。

## 快速开始

```powershell
cd customer_service_agent
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt

# 配置 API Key（复制 .env.example 为 .env 或设置环境变量）
$env:DEEPSEEK_API_KEY = "你的密钥"

# 建立向量库
python ingest.py

# 方式一：命令行问答
python query.py

# 方式二：网页版（可分享给他人）
streamlit run app.py --server.address 0.0.0.0 --server.port 8501
# 浏览器打开 http://localhost:8501
# 同一 WiFi 下他人访问 http://你的电脑IP:8501
```

## 知识库

| 文件 | 内容 |
|------|------|
| docs/退换货政策.txt | 退换货、退款、运费 |
| docs/物流查询.txt | 发货、查件、丢件 |
| docs/产品使用故障.txt | 洗涤、保养、质量问题 |
| docs/优惠券积分.txt | 优惠券、会员、积分 |
| docs/投诉建议.txt | 投诉渠道、人工客服 |

## 测试问题示例

- 我收到的衣服小了，能换大一码吗？
- 快递好几天没更新了怎么办？
- 羊毛衫起球正常吗？

## 其他搭建方式

零代码方案见上级目录 `AI客服系统智能体实训方案.md`（智谱清言 / 腾讯元器）。
