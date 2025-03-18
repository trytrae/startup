from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
from supabase import create_client, Client
 

# 加载环境变量
load_dotenv()

# 初始化 Supabase 客户端
supabase: Client = create_client(
    os.getenv('NEXT_PUBLIC_SUPABASE_URL'),
    os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
)

# 设置 OpenAI API key
openai.api_key = os.getenv('OPENAI_API_KEY')

app = Flask(__name__)
# 允许所有域名访问
CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        # 查询 public.tasks 表的所有数据
        response = supabase.table('tasks').select("*").execute()
        
        return jsonify({
            "status": "healthy", 
            "message": "Flask backend is running",
            "tasks": response.data  # 返回查询结果
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/api/ai/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        messages = data.get('messages', [])
        
        # 调用 OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=messages
        )
        
        # 构造响应
        ai_response = {
            "role": "assistant",
            "content": response.choices[0].message.content
        }
        
        # 可选：在 Supabase 中记录对话
        supabase.table('chat_history').insert({
            'messages': messages,
            'response': ai_response
        }).execute()
        
        return jsonify(ai_response)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)