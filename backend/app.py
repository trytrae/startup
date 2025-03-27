from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
from supabase import create_client, Client
from openai import OpenAI
from product_jeans_feedback_test import generate_feedback_summary_test  # 修改导入
 

# 加载环境变量
load_dotenv()

# 初始化 Supabase 客户端
supabase: Client = create_client(
    os.getenv('NEXT_PUBLIC_SUPABASE_URL'),
    os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
)

# 初始化 DeepSeek 客户端
client = OpenAI(
    api_key=os.getenv('DEEPSEEK_API_KEY'),
    base_url="https://api.deepseek.com"
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
            task_id = data.get('task_id')
            group_id = data.get('group_id')
            product_id = data.get('product_id')
            
            # 从各个表格获取数据
            task_data = supabase.table('tasks').select("*").eq('task_id', task_id).execute()
            users_data = supabase.table('users').select("*").eq('group_id', group_id).execute()
            product_data = supabase.table('products').select("*").eq('product_id', product_id).execute()
 
            # 检查是否成功获取所有数据
            if not (task_data.data and users_data.data and product_data.data):
                return jsonify({
                    "status": "error",
                    "message": "无法找到指定的数据"
                }), 404
            

            # USER_PROFILES = [

            # {

            # "职业": "数字营销经理", "城市": "上海", "生活方式": "咖啡品鉴和马术",

            # "孩子年龄": "8岁", "童装花费": "8000元",

            # "历史购买": ["宣纸速干T恤", "软软壳户外款外套", "撸猫棉打底衫"]

            # }

            # ]

            # 转换用户数据格式
            USER_PROFILES = []
            for user in users_data.data:
                profile = {
                    "职业": user['occupation'],
                    "城市": user['city'],
                    "生活方式": user['lifestyle'],
                    "孩子年龄": f"{user['child_age']}岁",
                    "童装花费": f"{user['annual_clothing_spend']}元",
                    "历史购买": [
                        user['purchase_history1'],
                        user['purchase_history2'],
                        user['purchase_history3']
                    ]
                }
                USER_PROFILES.append(profile)
            


        #    # 示例任务提示
        #     TASK_PROMPT = """作为一个童装品牌的产品企划,需要真诚地了解用户对新产品的想法:
        #     这是一条直筒牛仔裤的设计方案：
        #     <image>d:\Ai\与人对话\roleplay\jeans_image.jpg</image>
            
        #     舒适性：
        #     1. 高弹腰头，长久坐也不勒腰
        #     2. 面料为95.6%棉 4.4%氨纶柔软有弹力，裤型微宽松，盘腿而坐也舒适
        #     得体性：
        #     1. 颜色为中深色经典牛仔蓝，采用石磨酵素水洗工艺，色彩更加均匀，手感更柔软
        #     2. 水洗不易缩水变形，膝盖不易鼓包
        #     3. 微宽松直筒版型，上班和日常都适配
            
        #     希望了解：
        #     1. 您对这款产品的真实想法
        #     2. 是否愿意购买，可以接受的价格范围
        #     3. 有什么改进建议"""


            # 构建任务提示
            product = product_data.data[0]  # 获取第一个产品数据
            TASK_PROMPT = f"""作为一个童装品牌的产品企划,需要真诚地了解用户对新产品的想法:
            这是一个产品的设计方案：
            {product['name']}
            <image>{product['image']}</image>
            
            产品描述：
            {product['description']}
            
            希望了解：
            1. 您对这款产品的真实想法
            2. 是否愿意购买，可以接受的价格范围
            3. 有什么改进建议"""


            # 示例消息模板
            SYSTEM_MESSAGE_TEMPLATE = """你是一位在{城市}工作的{职业},日常喜欢{生活方式},有一个{孩子年龄}的孩子,
                    每年在童装上的花费是{童装花费}。你购买过的童装包括:
                    {history_purchases}
                    你性格开朗真诚,喜欢分享生活中的点点滴滴。在对话中要像跟朋友聊天一样自然,
                    可以结合自己的兴趣爱好和生活经历来分享对产品的真实想法。"""
            



            feedback_results = generate_feedback_summary_test(
                user_profiles=USER_PROFILES,
                system_message_template=SYSTEM_MESSAGE_TEMPLATE,
                task_prompt=TASK_PROMPT
            )
            print(feedback_results)
            
            try:
                # 将结果保存到 conversations 表
                conversation_data = {
                    'status': feedback_results.get('status', 'fail'),
                    'conversation': feedback_results.get('data', {}),
                    'task_id': task_id
                }
                
                # 插入数据到 conversations 表
                conversation_result = supabase.table('conversations').insert(conversation_data).execute()
                
                # 如果 conversations 表写入成功，更新 tasks 表状态为 success
                if conversation_result.data:
                    supabase.table('tasks').update({'status': 'success'}).eq('task_id', task_id).execute()
                else:
                    # 如果写入失败，更新 tasks 表状态为 fail
                    supabase.table('tasks').update({'status': 'fail'}).eq('task_id', task_id).execute()
                
            except Exception as e:
                # 如果发生异常，更新 tasks 表状态为 fail
                supabase.table('tasks').update({'status': 'fail'}).eq('task_id', task_id).execute()
                print(f"Error saving conversation: {str(e)}")
            
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


# @app.route('/api/user_demand', methods=['GET', 'POST'])
# def get_user_demand():
#     if request.method == 'POST':
#         try:
#             data = request.json
#             task_id = data.get('task_id')
#             group_id = data.get('group_id')
#     return null

@app.route('/api/user_demand', methods=['GET', 'POST'])
def get_user_demand():
    pass

@app.route('/api/conversation', methods=['GET'])
def get_conversation():
    try:
        task_id = request.args.get('task_id')
        if not task_id:
            return jsonify({
                "status": "error",
                "message": "缺少 task_id 参数"
            }), 400

        # 获取任务信息和对话记录
        task = supabase.table('tasks').select("name").eq('task_id', task_id).single().execute()
        conversation = supabase.table('conversations') \
            .select("*") \
            .eq('task_id', task_id) \
            .order('created_at', desc=True) \
            .limit(1) \
            .execute() 
        if conversation.data:
            return jsonify({
                "status": "success",
                "task_name": task.data.get('name', 'Untitled Task'),
                "conversation": conversation.data[0]['conversation'],
                "created_at": conversation.data[0]['created_at']
            })
        else:
            return jsonify({
                "status": "error",
                "message": "未找到相关会话记录"
            }), 404

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/api/summary', methods=['GET'])
def get_summary():
    try:
        # 从请求参数中获取 task_id
        task_id = request.args.get('task_id')
        if not task_id:
            return jsonify({
                "status": "error",
                "message": "缺少 task_id 参数"
            }), 400

        # 查询指定 task_id 的最新会话记录
        response = supabase.table('conversations') \
            .select("*") \
            .eq('task_id', task_id) \
            .order('created_at', desc=True) \
            .limit(1) \
            .execute()

        # 检查是否有数据返回
        if response.data and response.data[0].get('summary'):
            return jsonify({
                "status": "success",
                "summary": response.data[0]['summary']
            })
        
        # 如果没有 summary，生成新的总结
        if response.data:
            conversation = response.data[0].get('conversation', {})
            summary = generate_summary_from_conversation(conversation)
            
            try:
                # 更新最新会话记录的 summary 字段
                supabase.table('conversations') \
                    .update({'summary': summary}) \
                    .eq('conversation_id', response.data[0]['conversation_id']) \
                    .execute()
            except Exception as e:
                print(f"Error updating summary: {str(e)}")
            
            return jsonify({
                "status": "success",
                "summary": summary
            })
        
        return jsonify({
            "status": "error",
            "message": "未找到相关会话记录"
        }), 404

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


def generate_summary_from_conversation(conversation):
    """
    从对话内容生成总结
    Args:
        conversation: 对话内容字典
    Returns:
        dict: 包含关键反馈、改进建议和市场潜力的总结
    """
    try:
        # 将对话内容转换为字符串
        conversation_text = str(conversation)
        
        # 构建提示词
        prompt = f"""请分析以下用户反馈对话，并提供JSON格式的结构化总结：

对话内容：
{conversation_text}

请以JSON格式输出分析结果，包含以下字段：
- 关键反馈：数组，包含3-5条关键反馈要点
- 改进建议：数组，包含2-4条具体的改进建议
- 市场潜力：字符串，评估产品的市场潜力并给出建议

输出格式示例：
{{
    "关键反馈": ["反馈1", "反馈2", "反馈3"],
    "改进建议": ["建议1", "建议2"],
    "市场潜力": "市场潜力分析..."
}}
"""

        # 调用 DeepSeek API
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional and perceptive consumer product planning and research expert. Please ensure your response is in valid JSON format."
                },
                {"role": "user", "content": prompt}
            ],
            max_tokens=512,
            temperature=0.9,
            top_p=0.7,
            frequency_penalty=0.5
        )

        # 解析 API 响应
        summary_text = response.choices[0].message.content
        
        # 直接解析JSON响应
        import json
        try:
            summary = json.loads(summary_text)
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON response: {str(e)}")
            raise

        return summary

    except Exception as e:
        print(f"Error generating summary: {str(e)}")
        # 如果出错，返回默认的 mock 数据
        return {
            }

if __name__ == '__main__':
    app.run(debug=True, port=5000)