# ingest.py - 将知识库文档切分并存入向量库

import os
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

DOCS_DIR = "docs"
CHROMA_DIR = "chroma_db"


def build_vector_store():
    """将 docs/ 下的所有文档切分并存入向量库"""
    print("正在加载文档...")

    loader = DirectoryLoader(
        DOCS_DIR,
        glob="**/*.*",
        loader_cls=TextLoader,
        loader_kwargs={"encoding": "utf-8"},
    )
    documents = loader.load()
    print(f"[OK] 已加载 {len(documents)} 个文档")

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=80,
        separators=["\n\n", "\n", "。", "！", "？", " ", ""],
    )
    chunks = text_splitter.split_documents(documents)
    print(f"[OK] 已切分为 {len(chunks)} 个文档块")

    print("正在加载中文向量模型（首次运行需要下载，之后会复用缓存）...")
    embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-small-zh")

    vector_store = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=CHROMA_DIR,
    )
    vector_store.persist()
    print(f"[OK] 向量库已保存至 {CHROMA_DIR}")
    return vector_store


if __name__ == "__main__":
    if not os.path.exists(DOCS_DIR):
        os.makedirs(DOCS_DIR)
        print(f"[!] 请先将知识库文档放入 {DOCS_DIR} 文件夹，然后重新运行此脚本")
    else:
        build_vector_store()
