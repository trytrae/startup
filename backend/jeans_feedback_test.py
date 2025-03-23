def conduct_feedback_test(user_profiles, system_message_template, task_prompt, model="qwen-vl-max", chat_turn_limit=50, image_path=None):
    """
    模拟产品反馈对话，返回固定的测试数据
    """
    all_feedback_results = []
    
    for profile in user_profiles:
        # 模拟对话记录
        mock_conversation = [
            {
                "user": f"作为一个{profile.get('城市', '未知城市')}的妈妈，我觉得这款牛仔裤的设计很不错。特别是高弹腰头的设计很实用，因为孩子经常需要久坐。",
                "assistant": "感谢您的反馈！您提到了高弹腰头的设计，能具体说说在实际使用场景中，这个设计对您来说有什么特别的吸引力吗？"
            },
            {
                "user": "价格的话，考虑到面料和工艺，300-400元是我能接受的范围。不过建议可以增加一些防污或者耐磨的处理。",
                "assistant": "明白了，这个价格区间和建议对我们很有帮助。关于防污和耐磨性的建议很专业，这确实是童装中很重要的实用性考虑。"
            }
        ]
        
        all_feedback_results.append({
            "profile": profile,
            "conversation": mock_conversation
        })
    
    return all_feedback_results

def generate_feedback_summary_test(user_profiles=None, system_message_template=None, task_prompt=None):
    """
    获取产品反馈总结（测试版本）
    Args:
        user_profiles: 用户画像数据列表
        system_message_template: 用户系统消息模板字符串
        task_prompt: 任务提示模板
    """
    feedback_results = conduct_feedback_test(
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
        }
    ]
    
    # 示例消息模板 (实际测试中不会使用)
    SYSTEM_MESSAGE_TEMPLATE = "模拟系统消息模板"
    
    # 示例任务提示 (实际测试中不会使用)
    TASK_PROMPT = "模拟任务提示"
    
    results = generate_feedback_summary_test(
        user_profiles=USER_PROFILES,
        system_message_template=SYSTEM_MESSAGE_TEMPLATE,
        task_prompt=TASK_PROMPT
    )
    
    for summary in results["data"]:
        print(f"\n{summary['city']}的{summary['occupation']}妈妈的反馈摘要:")
        print("-" * 50)
        for conv in summary["conversation"]:
            print(f"用户: {conv['user']}")
            print(f"助手: {conv['assistant']}\n")