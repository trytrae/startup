
import os
from colorama import Fore
from camel.utils import print_text_animated 
from dotenv import load_dotenv
from camel.models import ModelFactory
from camel.types import ModelPlatformType, ModelType
from camel.configs import QwenConfig # ChatGPTConfig

from camel.societies import RolePlaying

from getpass import getpass


# 加载环境变量
load_dotenv()

os.environ["QWEN_API_KEY"] = os.getenv('QWEN_API_KEY')

chat_round=1
# set model
qwenModel = ModelFactory.create(
    model_platform = ModelPlatformType.QWEN,
    model_type = ModelType.QWEN_VL_MAX,
    model_config_dict = QwenConfig(temperature=0.2).as_dict(),
    ) # type: BaseModelBackend


def agents_society_roleplay(
    in_task_prompt = "", 
    in_assistant_role_name = "", 
    # in_assistant_agent_kwargs_sys_message = "",
    in_user_role_name = "", 
    # in_user_agent_kwargs_sys_message = "",
    in_model = None, 
    chat_turn_limit = 9
) -> dict:  # 修改返回类型为dict
    # 初始化对话记录
    conversation = {
        "assistant_role": in_assistant_role_name,
        "user_role": in_user_role_name,
        "task_prompt": in_task_prompt,
        "turns": []
    }
    
    role_play_session = RolePlaying(
        assistant_role_name = in_assistant_role_name,
        assistant_agent_kwargs = dict(
            model = in_model, 
            # system_message = in_assistant_agent_kwargs_sys_message,
        ),
        user_role_name = in_user_role_name,
        user_agent_kwargs = dict(
            model = in_model,
            # system_message = in_user_agent_kwargs_sys_message,
        ),
        task_prompt = in_task_prompt,
        with_task_specify = True,
        task_specify_agent_kwargs = dict(model = in_model),
        output_language = "zh",
    )
    # Initial default model (`GPT_4O_MINI`)

    # Output initial message with different colors.
    print(Fore.GREEN  + f"AI Assistant sys message: \n{role_play_session.assistant_sys_msg}\n")
    print(Fore.BLUE   + f"AI User sys message: \n{role_play_session.user_sys_msg}\n")
    print(Fore.YELLOW + f"Original task prompt: \n{in_task_prompt}\n")
    print(Fore.CYAN   + f"Specified task prompt: \n{role_play_session.specified_task_prompt}\n")
    print(Fore.RED    + f"Final task prompt: \n{role_play_session.task_prompt}\n")

    n = 0
    input_msg = role_play_session.init_chat()

    # Output response step by step with different colors.
    # Keep output until detect the terminate content or reach the loop limit.
    while n < chat_turn_limit:
        n += 1
        assistant_response, user_response = role_play_session.step(input_msg)

        # 记录每轮对话
        turn = {
            "turn": n,
            "user": user_response.msg.content,
            "assistant": assistant_response.msg.content
        }
        conversation["turns"].append(turn)

        if assistant_response.terminated or user_response.terminated:
            break
        if "CAMEL_TASK_DONE" in user_response.msg.content:
            break

        input_msg = assistant_response.msg

    return conversation  # 返回对话记录





# *************************************************************
def get_user_profiles():
    return [
        {
            "职业": "数字营销经理", 
            "城市": "上海", 
            "生活方式": "咖啡品鉴和马术", 
            "孩子年龄": "8岁", 
            "童装花费": "8000元",
            "历史购买": ["宣纸速干T恤", "软软壳户外款外套", "撸猫棉打底衫"]
        },
        {
            "职业": "瑜伽教练", 
            "城市": "深圳", 
            "生活方式": "健身和户外运动", 
            "孩子年龄": "5岁", 
            "童装花费": "12000元",
            "历史购买": ["软软壳户外款外套", "运动速干T恤"]
        },
        {
            "职业": "中学老师", 
            "城市": "成都", 
            "生活方式": "读书和烘焙", 
            "孩子年龄": "10岁", "童装花费": "5000元",
            "历史购买": ["撸猫棉打底衫", "纯棉家居服"]
        },
        {
                    "历史购买": [
          "幼岚牛角包短款羽绒服：轻盈保暖，适合冬季出行，设计贴心，孩子穿脱方便。",
          "空气绒外套：双面摇粒，永久不起静电，柔软温暖；可以外穿，也可以与聪明外壳冲锋衣叠穿。",
          "桉树牛仔裤：面料提取自桉树纤维，比普通牛仔裤更柔软透气，春夏穿着不闷热。"
        ],
        "城市": "成都",
        "孩子年龄": "5岁",
        "生活方式": "户外徒步、写生",
        "童装花费": "4500元",
        "职业": "插画师"
        }
    ]

def create_user_info(profile):
    history_purchases = "\n ".join([f"{i+1}. {item}" for i, item in enumerate(profile["历史购买"])])
    return f"""你是一位在{profile["城市"]}做{profile["职业"]}工作, 日常喜欢{profile["生活方式"]}, 
            有一个{profile["孩子年龄"]}的孩子, 每年在童装上的花费是{profile["童装花费"]}。""" # 你购买过的童装包括: {history_purchases}



def get_product_description():
    return """
            1. 舒适性: 
            a). 高弹腰头，长久坐也不勒腰
            b). 面料为95.6%棉 4.4%氨纶柔软有弹力，裤型微宽松，盘腿而坐也舒适
            2.得体性：
            a). 颜色为中深色经典牛仔蓝，采用石磨酵素水洗工艺，色彩更加均匀，手感更柔软
            b). 水洗不易缩水变形，膝盖不易鼓包
            c). 微宽松直筒版型，上班和日常都适配
    """

def conduct_product_feedback(user_profiles, img_url, product_description,product_name):
    """
    Conduct product feedback interviews with multiple user profiles
    
    Args:
        user_profiles (list): List of user profile dictionaries
        img_url (str): URL of the product image
        product_description (str): Description of the product features
    
    Returns:
        dict: Dictionary containing all conversation results
    """
    all_conversations = { 
        "product_name": product_name,
        "conversations": []
    }

    for consumer_profile_i in user_profiles:
        print(f"\n开始与{consumer_profile_i['城市']}的{consumer_profile_i['职业']}对话...\n")
        consumer_info_i = create_user_info(consumer_profile_i)

        in_model = qwenModel
        in_assistant_agent_kwargs_sys_message = \
            consumer_info_i + """
            你性格开朗真诚,喜欢分享生活. 正在接受一份用户调研, 过程中聊天自然随和, 
            你可以看到产品图片, 请结合图片特点来分享你的真实想法. """ ,
        in_assistant_role_name = f"{consumer_profile_i['职业']}, {in_assistant_agent_kwargs_sys_message}", 

        in_user_agent_kwargs_sys_message = """
            你是一位品牌产品企划, 准备开拓新市场的产品, 正在收集用户对新产品线的真实反馈. 
            你的目标是倾听和理解用户的想法, 而不是推销产品. 在对话中要保持开放中和立的态度, 鼓励用户表达真实的想法和建议. 
            要特别关注用户提到的不足之处和改进建议, 这些对产品优化很重要. 记住要结合用户的生活场景来理解他们的需求和顾虑.
            你可以看到产品图片, 在讨论时可以具体指出图片中的细节."""
        user_sim = "来自某品牌产品企业规划部门的产品调研负责人"
        in_user_role_name = f"{user_sim},  {in_user_agent_kwargs_sys_message}",

        in_task_prompt = f"""
            现在有一位{user_sim}和一位{consumer_profile_i['职业']}用户, 两者需要进行亲切对话, 从而帮助{user_sim}调研用户对新产品的想法. 
            新产品的设计为{img_url}
            它具有以下属性
            {product_description}
            具体需要了解以下几点:
            1. 用户对这款产品的真实想法;
            2. 用户是否愿意购买, 以及可以接受的价格范围; 
            3. 用户对这款产品有什么改进建议.
            注意: 请让两位像真实的朋友一样对话. 
            """

        res = agents_society_roleplay(
            in_task_prompt = in_task_prompt, 
            in_assistant_role_name = in_assistant_role_name, 
            in_user_role_name = in_user_role_name, 
            in_model = in_model, 
            chat_turn_limit = chat_round
        )

        conversation_entry = {
            "user_profile": consumer_profile_i,
            "conversation_details": res
        }
        all_conversations["conversations"].append(conversation_entry)

    return all_conversations


if __name__ == "__main__":
    img_url = "https://ibb.co/W40xb8dt"
    user_profiles = get_user_profiles()
    product_description = get_product_description()
    
    all_conversations = conduct_product_feedback(
        user_profiles=user_profiles,
        img_url=img_url,
        product_description=product_description,
        product_name="小棉棉家居服"
    )

    # Save results to file
    import json
    with open('conversations_results.json', 'w', encoding='utf-8') as f:
        json.dump(all_conversations, f, ensure_ascii=False, indent=4)

