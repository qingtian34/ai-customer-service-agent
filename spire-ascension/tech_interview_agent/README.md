# 技术面试模拟官（DeepSeek + RAG）

选题：**技术面试模拟（八股文）** — 覆盖 Java、Python、操作系统、计算机网络、算法、数据库。

## 快速开始

```powershell
cd tech_interview_agent
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt

$env:DEEPSEEK_API_KEY = "你的密钥"

python ingest.py
python query.py

# 网页版（可分享给他人）
streamlit run app.py --server.address 0.0.0.0 --server.port 8502
# 浏览器打开 http://localhost:8502
```

## 知识库

| 文件 | 题量 |
|------|------|
| docs/Java面试题.txt | 15 题 |
| docs/Python面试题.txt | 20 题 |
| docs/操作系统面试题.txt | 20 题 |
| docs/计算机网络面试题.txt | 22 题 |
| docs/算法面试题.txt | 22 题 |
| docs/数据库面试题.txt | 22 题 |

## 测试问题示例

- 什么是 Java 内存模型？
- TCP 三次握手的过程？
- 动态规划和贪心算法的区别是什么？

## 其他搭建方式

零代码方案见上级目录 `AI面试官系统智能体实训方案.md`（智谱清言 / 腾讯元器）。
