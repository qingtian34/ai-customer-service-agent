# query.py - 电商售后客服问答系统

import os
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from openai import OpenAI

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

CHROMA_DIR = "chroma_db"
DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY", "")
DEEPSEEK_BASE_URL = os.environ.get("DEEPSEEK_BASE_URL", "https://api.deepseek.com")
DEEPSEEK_MODEL = os.environ.get("DEEPSEEK_MODEL", "deepseek-chat")


def get_runtime_config():
    """Read environment variables at runtime to avoid stale import-time values."""
    return {
        "api_key": os.environ.get("DEEPSEEK_API_KEY", DEEPSEEK_API_KEY),
        "base_url": os.environ.get("DEEPSEEK_BASE_URL", DEEPSEEK_BASE_URL),
        "model": os.environ.get("DEEPSEEK_MODEL", DEEPSEEK_MODEL),
    }


def load_vector_store():
    embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-small-zh")
    return Chroma(persist_directory=CHROMA_DIR, embedding_function=embeddings)


def search_relevant_chunks(vector_store, question, k=3):
    return vector_store.similarity_search(question, k=k)


def build_context(chunks):
    context = ""
    for i, chunk in enumerate(chunks, 1):
        context += f"\n【参考来源 {i}】\n{chunk.page_content}\n"
    return context


def ask_question(question, context, history=None):
    cfg = get_runtime_config()
    client = OpenAI(api_key=cfg["api_key"], base_url=cfg["base_url"])

    prompt = f"""你是一名专业的电商售后客服。请基于以下参考资料回答用户的问题。

参考资料：
{context}

用户问题：{question}

回答要求：
1. 严格基于参考资料，不编造信息
2. 回答要亲切、有耐心，开头可以表达同理心（如"很抱歉给您带来不便"）
3. 如果参考资料中没有相关信息，请回答："非常抱歉，您的问题超出了我的知识范围。请转人工客服处理，我们会尽快为您解决。"
4. 给出清晰的步骤（如第一步、第二步）帮助用户操作

请回答："""

    messages = [
        {"role": "system", "content": "你是一个电商售后客服助手，基于知识库回答问题。"},
    ]
    if history:
        messages.extend(history)
    messages.append({"role": "user", "content": prompt})

    try:
        response = client.chat.completions.create(
            model=cfg["model"],
            messages=messages,
            temperature=0.3,
            stream=False,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"系统繁忙，请稍后再试。错误信息：{str(e)}"


def main():
    print("=" * 60)
    print("电商售后客服助手 - 基于 DeepSeek + 本地知识库")
    print("您可以咨询退换货、物流、产品使用等问题，输入 'exit' 退出")
    print("=" * 60)

    cfg = get_runtime_config()
    if not cfg["api_key"]:
        print("请先设置 DEEPSEEK_API_KEY 环境变量")
        print("PowerShell: $env:DEEPSEEK_API_KEY = \"你的API-Key\"")
        return

    try:
        vector_store = load_vector_store()
    except Exception:
        print("向量库加载失败，请先运行 python ingest.py")
        return

    while True:
        question = input("\n用户：").strip()
        if question.lower() in ["exit", "退出"]:
            print("客服：感谢您的咨询，祝您生活愉快！")
            break
        if not question:
            continue

        print("客服：正在查询...")
        chunks = search_relevant_chunks(vector_store, question)
        context = build_context(chunks)
        answer = ask_question(question, context)
        print(f"客服：{answer}")


if __name__ == "__main__":
    main()
