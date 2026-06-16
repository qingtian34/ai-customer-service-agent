# app.py - 电商售后客服网页版（可分享给他人使用）

import streamlit as st
from query import (
    DEEPSEEK_API_KEY,
    ask_question,
    build_context,
    load_vector_store,
    search_relevant_chunks,
)

st.set_page_config(page_title="电商售后客服", page_icon="🛍️", layout="centered")

st.title("电商售后客服助手")
st.caption("DeepSeek + 本地知识库 | 退换货 · 物流 · 尺码 · 优惠券")

if "cs_messages" not in st.session_state:
    st.session_state.cs_messages = []

if not DEEPSEEK_API_KEY:
    st.error("未配置 DEEPSEEK_API_KEY，请在 .env 文件中填写 API Key。")
    st.stop()

@st.cache_resource
def get_vector_store():
    return load_vector_store()

try:
    vector_store = get_vector_store()
except Exception:
    st.error("向量库加载失败，请先运行：python ingest.py")
    st.stop()

for msg in st.session_state.cs_messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

quick_questions = [
    "衣服小了能换大一码吗？",
    "快递好几天没更新了怎么办？",
    "优惠券可以和满减叠加吗？",
]

st.markdown("**快捷提问：**")
cols = st.columns(3)
for i, q in enumerate(quick_questions):
    if cols[i].button(q, key=f"quick_{i}"):
        st.session_state.pending_question = q

question = st.chat_input("请输入您的问题...")
if "pending_question" in st.session_state:
    question = st.session_state.pop("pending_question")

if question:
    st.session_state.cs_messages.append({"role": "user", "content": question})
    with st.chat_message("user"):
        st.markdown(question)

    with st.chat_message("assistant"):
        with st.spinner("正在查询知识库..."):
            chunks = search_relevant_chunks(vector_store, question)
            context = build_context(chunks)
            answer = ask_question(question, context)
        st.markdown(answer)

    st.session_state.cs_messages.append({"role": "assistant", "content": answer})

with st.sidebar:
    st.header("使用说明")
    st.markdown(
        """
        - 回答基于本地 FAQ 知识库
        - 同一 WiFi 下他人可访问你的电脑 IP
        - 公网分享需部署到云服务器
        """
    )
    if st.button("清空对话"):
        st.session_state.cs_messages = []
        st.rerun()
