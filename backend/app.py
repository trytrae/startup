from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
import json  # Add this import
from supabase import create_client, Client
from openai import OpenAI
# from product_jeans_feedback_test import generate_feedback_summary_test  # 修改导入
from product_jeans_feedback import conduct_product_feedback  # 修改导入
from profile_user_demand import conduct_user_demand_research
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
    print("feedback")
    if request.method == 'POST':
        try:
            data = request.json
            task_id = data.get('task_id') 
            
            # 从各个表格获取数据
            task_data = supabase.table('tasks').select("*").eq('task_id', task_id).execute()
 
            # 确保 task_data 有数据
            if not task_data.data:
                return jsonify({
                    "status": "error",
                    "message": "无法找到指定的任务"
                }), 404
                
            # 从 task_data 中获取 group_id 和 product_id
            group_id = task_data.data[0]['group_id']
            product_id = task_data.data[0]['product_id']
            
            # 获取用户和产品数据
            users_data = supabase.table('users').select("*").eq('group_id', group_id).execute()
            product_data = supabase.table('products').select("*").eq('product_id', product_id).execute()
            

 
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
            
 
            # 构建任务提示
            product = product_data.data[0]  # 获取第一个产品数据
            print("Starting product feedback generation...")
            print(product)
            try:
                feedback_results = conduct_product_feedback(
                    user_profiles=USER_PROFILES,
                    img_url=product['image'],
                    product_description=product['description'],
                    product_name=product['name']
                )
                print("Feedback results:", feedback_results)
            except Exception as e:
                print(f"Error in conduct_product_feedback: {str(e)}")
                raise
            
            try:
                # 将结果保存到 conversations 表
                conversation_data = {
                    'status': 'success' if feedback_results else 'fail',
                    'conversation': feedback_results,
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
     
 

@app.route('/api/user_demand', methods=['GET', 'POST'])
def get_user_demand():
    print("demand")
    if request.method == 'POST':
        try:
            data = request.json
            task_id = data.get('task_id') 
            
            # 从各个表格获取数据
            task_data = supabase.table('tasks').select("*").eq('task_id', task_id).execute()
 
            # 确保 task_data 有数据
            # 检查是否成功获取所有数据
            if not (task_data.data ):
                return jsonify({
                    "status": "error",
                    "message": "无法找到指定的数据"
                }), 404
            # 从 task_data 中获取 group_id
            group_id = task_data.data[0]['group_id']
 
            users_data = supabase.table('users').select("*").eq('group_id', group_id).execute()
            print(users_data)
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
            
            print("Starting user demand research...")
            try:
                research_results = conduct_user_demand_research(
                    user_profiles=USER_PROFILES
                )
                print("Research results:", research_results)
            except Exception as e:
                print(f"Error in conduct_user_demand_research: {str(e)}")
                raise
            
            try:
                # 将结果保存到 conversations 表
                conversation_data = {
                    'status': 'success' if research_results else 'fail',
                    'conversation': research_results,
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
            
            return jsonify(research_results)
            
        except Exception as e:
            return jsonify({
                "status": "error",
                "message": str(e)
            }), 500

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

@app.route('/api/feedback_summary', methods=['GET'])
def get_feedback_summary():
    try:
        task_id = request.args.get('task_id')
        if not task_id:
            return jsonify({
                "status": "error",
                "message": "缺少 task_id 参数"
            }), 400

        response = supabase.table('conversations') \
            .select("*") \
            .eq('task_id', task_id) \
            .order('created_at', desc=True) \
            .limit(1) \
            .execute()
        
        if response.data and response.data[0].get('summary'):
            return jsonify({
                "status": "success",
                "summary": response.data[0]['summary']
            })
        
        if response.data:
            conversation = response.data[0].get('conversation', {})
 
            try:
                summary = generate_feedback_summary(conversation)
                print(summary)
            except Exception as e:
                print(f"Error generating summary: {str(e)}")
                summary = {
                    "关键反馈": ["生成摘要时发生错误"],
                    "改进建议": ["请稍后重试"],
                    "市场潜力": "暂无数据"
                }
            try:
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

@app.route('/api/demand_summary', methods=['GET'])
def get_demand_summary():
    try:
        task_id = request.args.get('task_id')
        if not task_id:
            return jsonify({
                "status": "error",
                "message": "缺少 task_id 参数"
            }), 400

        response = supabase.table('conversations') \
            .select("*") \
            .eq('task_id', task_id) \
            .order('created_at', desc=True) \
            .limit(1) \
            .execute()
        
        if response.data and response.data[0].get('summary'):
            return jsonify({
                "status": "success",
                "summary": response.data[0]['summary']
            })
        
        if response.data:
            conversation = response.data[0].get('conversation', {})
            print(conversation)
            try:
                summary = generate_demand_summary(conversation)
                print(summary)
            except Exception as e:
                print(f"Error generating summary: {str(e)}")
                summary = {
                    "关键反馈": ["生成摘要时发生错误"],
                    "核心场景与需求": ["请稍后重试"],
                    "新产品设计建议": "暂无数据"
                }
            try:
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

def generate_feedback_summary(conversation):
    """
    从对话内容生成产品反馈总结
    Args:
        conversation: 对话内容字典
    Returns:
        dict: 包含关键反馈、改进建议和市场潜力的总结
    """
    try:
        if not conversation:
            return {
                "关键反馈": ["无有效对话内容"],
                "改进建议": ["请确保有有效的对话数据"],
                "市场潜力": "由于缺少对话数据，无法评估市场潜力"
            }
            
        conversation_text = str(conversation)
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

        绝对不要添加任何markdown的标记，比如"```json"，"```"等，只输出JSON格式的内容。
        """

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
            frequency_penalty=0.5,
        )

        summary_text = response.choices[0].message.content
        print(summary_text)
        try:
            summary = json.loads(summary_text)
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON response: {str(e)}")
            raise

        return summary

    except Exception as e:
        print(f"Error generating summary: {str(e)}")
        return {}

def generate_demand_summary(conversation):
    """
    从对话内容生成用户需求总结
    Args:
        conversation: 对话内容字典
    Returns:
        dict: 包含关键反馈、核心场景与需求和新产品设计建议的总结
    """
    try:
        if not conversation:
            return {
                "关键反馈": ["无有效对话内容"],
                "核心场景与需求": ["请确保有有效的对话数据"],
                "新产品设计建议": "由于缺少对话数据，无法提供建议"
            }
            
        conversation_text = str(conversation)
        prompt = f"""请分析以下用户需求调研对话，并提供JSON格式的结构化总结：

        对话内容：
        {conversation_text}

        请以JSON格式输出分析结果，包含以下字段：
        - 关键反馈：数组，包含3-5条用户关键反馈要点
        - 核心场景与需求：数组，包含2-4条核心使用场景和用户需求
        - 新产品设计建议：字符串，基于用户需求提供具体的产品设计建议

        输出格式示例：
        {{
            "关键反馈": ["反馈1", "反馈2", "反馈3"],
            "核心场景与需求": ["场景1", "场景2"],
            "新产品设计建议": "产品设计建议内容..."
        }}

        绝对不要添加任何markdown的标记，比如"```json"，"```"等，只输出JSON格式的内容。
        """

        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional and perceptive consumer product planning and research expert, capable of accurately analyzing research interview content and organizing it in a comprehensive and logical manner using plain and concise language to extract key information. Please ensure your response is in valid JSON format."
                },
                {"role": "user", "content": prompt}
            ],
            max_tokens=512,
            temperature=0.9,
            top_p=0.7,
            frequency_penalty=0.5,
        )

        summary_text = response.choices[0].message.content
        print(summary_text)
        try:
            summary = json.loads(summary_text)
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON response: {str(e)}")
            raise

        return summary

    except Exception as e:
        print(f"Error generating summary: {str(e)}")
        return {}

if __name__ == '__main__':
    app.run(debug=True, port=5000)