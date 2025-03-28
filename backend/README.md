# Backend Service

## 项目简介

这是一个基于Flask的后端服务，主要提供用户需求研究和产品反馈分析的API接口。服务使用Supabase作为数据库，并集成了大语言模型用于对话生成和数据分析。

## Project Introduction

This is a Flask-based backend service that provides APIs for user requirement research and product feedback analysis. The service uses Supabase as database and integrates large language models for conversation generation and data analysis.

## 技术栈 | Tech Stack

- Python 3.x
- Flask
- Supabase
- Camel AI
- DeepSeek Chat

## 功能特点 | Features

- 用户需求研究API
- 产品反馈分析API
- 大语言模型集成
- Supabase数据库支持

## 安装说明 | Installation

1. 安装依赖 | Install dependencies
```bash
pip install -r requirements.txt
```

2. 配置环境变量 | Configure environment variables
复制.env.example文件为.env并填写相应配置
```bash
cp .env.example .env
```

## API文档 | API Documentation

- `/api/user-research`: 用户需求研究接口
- `/api/product-feedback`: 产品反馈分析接口

## 部署指南 | Deployment

1. 生产环境部署:
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

2. Docker部署:
```bash
docker build -t backend .
docker run -p 5000:5000 backend
```

## 贡献指南 | Contributing

1. Fork项目
2. 创建分支 (`git checkout -b feature/your-feature`)
3. 提交更改 (`git commit -am 'Add some feature'`)
4. 推送分支 (`git push origin feature/your-feature`)
5. 创建Pull Request