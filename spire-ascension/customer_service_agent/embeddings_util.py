# embeddings_util.py - 轻量嵌入模型（适配 Render 免费实例内存限制）

from langchain_community.embeddings import FastEmbedEmbeddings

EMBEDDING_MODEL = "BAAI/bge-small-zh-v1.5"


def get_embeddings():
    """使用 ONNX 版 fastembed，内存占用远低于 sentence-transformers。"""
    return FastEmbedEmbeddings(model_name=EMBEDDING_MODEL)
