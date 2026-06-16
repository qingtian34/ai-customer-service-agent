# query.py - 技术面试问答主程序

import os
from langchain_community.vectorstores import Chroma
from openai import OpenAI

from embeddings_util import get_embeddings

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
    return {
        "api_key": os.environ.get("DEEPSEEK_API_KEY", DEEPSEEK_API_KEY),
        "base_url": os.environ.get("DEEPSEEK_BASE_URL", DEEPSEEK_BASE_URL),
        "model": os.environ.get("DEEPSEEK_MODEL", DEEPSEEK_MODEL),
    }


def load_vector_store():
    print("正在加载向量库...")
    embeddings = get_embeddings()
    vector_store = Chroma(
        persist_directory=CHROMA_DIR,
        embedding_function=embeddings,
    )
    print("[OK] 向量库加载成功")
    return vector_store


def search_relevant_chunks(vector_store, question, k=3):
    return vector_store.similarity_search(question, k=k)


def build_context(chunks):
    context = ""
    for i, chunk in enumerate(chunks, 1):
        context += f"\n【参考来源 {i}】\n{chunk.page_content}\n"
    return context


def ask_question(question, context):
    cfg = get_runtime_config()
    client = OpenAI(api_key=cfg["api_key"], base_url=cfg["base_url"])

    prompt = f"""你是一名资深的技术面试官，请基于以下参考资料回答用户的问题。

参考资料：
{context}

用户问题：{question}

回答要求：
1. 必须严格基于参考资料中的信息回答问题，不要编造知识库以外的内容
2. 如果参考资料中没有相关信息，请明确告知用户
3. 知识点解析应当清晰易懂，适合大三学生理解
4. 请用结构化的方式呈现答案（如分点说明）
5. 每次回答后可以追问"是否还需要了解其他面试问题？"

请回答："""

    try:
        response = client.chat.completions.create(
            model=cfg["model"],
            messages=[
                {
                    "role": "system",
                    "content": "你是一个基于知识库回答技术面试问题的人工智能助手。",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            stream=False,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"调用API时出错：{str(e)}"


def main():
    print("=" * 60)
    print("技术面试模拟官 - 基于 DeepSeek + 本地知识库")
    print("提示：输入 'exit' 退出程序")
    print("=" * 60)

    cfg = get_runtime_config()
    if not cfg["api_key"]:
        print("[!] 错误：请先设置 DEEPSEEK_API_KEY 环境变量")
        print("PowerShell: $env:DEEPSEEK_API_KEY = \"你的key\"")
        return

    try:
        vector_store = load_vector_store()
    except Exception as e:
        print(f"[X] 向量库加载失败：{e}")
        print("请确认已运行 python ingest.py 建立向量库")
        return

    while True:
        question = input("\n请输入您的面试问题：").strip()
        if question.lower() in ["exit", "quit", "退出"]:
            print("再见！祝面试顺利！")
            break
        if not question:
            continue

        print("\n[检索] 正在检索知识库...")
        chunks = search_relevant_chunks(vector_store, question)

        print("[生成] 正在生成答案...")
        context = build_context(chunks)
        answer = ask_question(question, context)

        print("\n" + "=" * 60)
        print(f"\n问题：{question}")
        print(f"\n回答：\n{answer}")
        print("=" * 60)


if __name__ == "__main__":
    main()
