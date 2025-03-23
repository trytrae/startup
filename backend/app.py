from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
from supabase import create_client, Client
from jeans_feedback_test import generate_feedback_summary_test  # 修改导入
 

# 加载环境变量
load_dotenv()

# 初始化 Supabase 客户端
supabase: Client = create_client(
    os.getenv('NEXT_PUBLIC_SUPABASE_URL'),
    os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
)



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

@app.route('/api/jeans-feedback', methods=['GET', 'POST'])
def get_jeans_feedback():
    if request.method == 'POST':
        try:
            data = request.json
            task_id = data.get('id')
            user_portraits = data.get('user_portraits')
            product_portraits = data.get('product_portraits')
            
            # 示例用户画像数据
            USER_PROFILES = [
                {
                    "职业": "数字营销经理", "城市": "上海", "生活方式": "咖啡品鉴和马术", 
                    "孩子年龄": "8岁", "童装花费": "8000元",
                    "历史购买": ["宣纸速干T恤", "软软壳户外款外套", "撸猫棉打底衫"]
                }
            ]
            
            feedback_results = generate_feedback_summary_test(
                user_profiles=USER_PROFILES,
                system_message_template="模拟系统消息模板",
                task_prompt="模拟任务提示"
            )
            return jsonify(feedback_results)
            
        except Exception as e:
            return jsonify({
                "status": "error",
                "message": str(e)
            }), 500
    
    # GET 请求的原有逻辑
    try:
        # 示例用户画像数据
        USER_PROFILES = [
            {
                "职业": "数字营销经理", "城市": "上海", "生活方式": "咖啡品鉴和马术", 
                "孩子年龄": "8岁", "童装花费": "8000元",
                "历史购买": ["宣纸速干T恤", "软软壳户外款外套", "撸猫棉打底衫"]
            }
        ]
        
        feedback_results = generate_feedback_summary_test(
            user_profiles=USER_PROFILES,
            system_message_template="模拟系统消息模板",
            task_prompt="模拟任务提示"
        )
        return jsonify(feedback_results)
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)