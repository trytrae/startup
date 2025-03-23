from camel.societies import RolePlaying
from colorama import Fore

def conduct_feedback(user_profiles, system_message_template, task_prompt, model="qwen-vl-max", chat_turn_limit=50, image_path=None):
    all_feedback_results = []
    
    for profile in user_profiles:
        print(f"\n开始与{profile.get('城市', '未知城市')}的{profile.get('职业', '未知职业')}妈妈对话...")
        
        # 使用模板和profile生成system message
        try:
            user_system_message = system_message_template.format(**profile)
        except KeyError as e:
            print(f"错误：用户画像缺少必要信息: {e}")
            continue
            
        history_purchases = "\n            ".join([
            f"{i+1}. {item}" for i, item in enumerate(profile.get("历史购买", []))
        ])
        user_system_message = user_system_message.replace("{history_purchases}", history_purchases)
    
        role_play_session = RolePlaying(
            assistant_role_name="品牌产品企划",
            assistant_agent_kwargs=dict(
                model=model,
                system_message="""你是一位品牌产品企划,正在收集用户对新产品线的真实反馈。
                这是品牌开拓新市场的产品。
                你的目标是倾听和理解用户的想法,而不是推销产品。
                在对话中要保持开放和中立的态度,鼓励用户表达真实的想法和建议。
                要特别关注用户提到的不足之处和改进建议,这些对产品优化很重要。
                记住要结合用户的生活场景来理解他们的需求和顾虑。
                你可以看到产品图片,在讨论时可以具体指出图片中的细节。"""
            ),
            user_role_name=f"{profile['职业']}妈妈",
            user_agent_kwargs=dict(
                model=model,
                system_message=user_system_message + """
                你可以看到产品图片,请结合图片特点来分享你的真实想法。"""
            ),
            task_prompt=task_prompt,
            with_task_specify=True,
            task_specify_agent_kwargs=dict(model=model),
        )

    print(f"\n开始产品反馈收集对话...\n")
    
    n = 0
    input_msg = role_play_session.init_chat()
    conversation_log = []

    while n < chat_turn_limit:
        n += 1
        assistant_response, user_response = role_play_session.step(input_msg)

        if assistant_response.terminated or user_response.terminated:
            break

        conversation_log.append({
            "user": user_response.msg.content,
            "assistant": assistant_response.msg.content
        })

        print(Fore.BLUE + f"消费者:\n\n{user_response.msg.content}\n")
        print(Fore.GREEN + f"产品企划:\n\n{assistant_response.msg.content}\n")

        if "CAMEL_TASK_DONE" in user_response.msg.content:
            break

        input_msg = assistant_response.msg
    
    all_feedback_results.append({
        "profile": profile,
        "conversation": conversation_log
    })
    
    return all_feedback_results

def generate_feedback_summary(user_profiles=None, system_message_template=None, task_prompt=None):
    """
    获取产品反馈总结
    Args:
        user_profiles: 用户画像数据列表
        system_message_template: 用户系统消息模板字符串
        task_prompt: 任务提示模板
    """
    feedback_results = conduct_feedback(
        user_profiles=user_profiles,
        system_message_template=system_message_template,
        task_prompt=task_prompt
    )
    
    summaries = []
    for result in feedback_results:
        profile = result["profile"]
        summary = {
            "city": profile["城市"],
            "occupation": profile["职业"], 
            "profile": profile,
            "conversation": result["conversation"]
        }
        summaries.append(summary)
    
    return {
        "status": "success",
        "data": summaries
    }

if __name__ == "__main__":
    # 示例用户画像数据
    USER_PROFILES = [
        {
            "职业": "数字营销经理", "城市": "上海", "生活方式": "咖啡品鉴和马术", 
            "孩子年龄": "8岁", "童装花费": "8000元",
            "历史购买": ["宣纸速干T恤", "软软壳户外款外套", "撸猫棉打底衫"]
        },
        {
            "职业": "瑜伽教练", "城市": "深圳", "生活方式": "健身和户外运动", 
            "孩子年龄": "5岁", "童装花费": "12000元",
            "历史购买": ["软软壳户外款外套", "运动速干T恤"]
        },
        {
            "职业": "金融分析师", "城市": "北京", "生活方式": "瑜伽和看展", 
            "孩子年龄": "6岁", "童装花费": "15000元",
            "历史购买": ["撸猫棉打底衫", "宣纸速干T恤"]
        },
    ]
    
    # 示例消息模板
    SYSTEM_MESSAGE_TEMPLATE = """你是一位在{城市}工作的{职业},日常喜欢{生活方式},有一个{孩子年龄}的孩子,
            每年在童装上的花费是{童装花费}。你购买过的童装包括:
            {history_purchases}
            你性格开朗真诚,喜欢分享生活中的点点滴滴。在对话中要像跟朋友聊天一样自然,
            可以结合自己的兴趣爱好和生活经历来分享对产品的真实想法。"""
    
    # 示例任务提示
    TASK_PROMPT = """作为一个童装品牌的产品企划,需要真诚地了解用户对新产品的想法:
    这是一条直筒牛仔裤的设计方案：
    <image>d:\Ai\与人对话\roleplay\jeans_image.jpg</image>
    
    舒适性：
    1. 高弹腰头，长久坐也不勒腰
    2. 面料为95.6%棉 4.4%氨纶柔软有弹力，裤型微宽松，盘腿而坐也舒适
    得体性：
    1. 颜色为中深色经典牛仔蓝，采用石磨酵素水洗工艺，色彩更加均匀，手感更柔软
    2. 水洗不易缩水变形，膝盖不易鼓包
    3. 微宽松直筒版型，上班和日常都适配
    
    希望了解：
    1. 您对这款产品的真实想法
    2. 是否愿意购买，可以接受的价格范围
    3. 有什么改进建议"""
    
    results = generate_feedback_summary(
        user_profiles=USER_PROFILES,
        system_message_template=SYSTEM_MESSAGE_TEMPLATE,
        task_prompt=TASK_PROMPT
    )
    
    for summary in results["data"]:
        print(f"\n{summary['city']}的{summary['occupation']}妈妈的反馈摘要:")
        print("-" * 50)