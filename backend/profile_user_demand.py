# /* 
# base fusion_v3 version
# */
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
    model_type = ModelType.QWEN_TURBO,
    model_config_dict = QwenConfig(temperature=0.2).as_dict(),
    ) # type: BaseModelBackend


def agents_society_roleplay(
    in_task_prompt = "", 
    in_assistant_role_name = "", 
    in_user_role_name = "", 
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

        print_text_animated(Fore.BLUE + f"AI User:\n\n{user_response.msg.content}\n")
        print_text_animated(Fore.GREEN + f"AI Assistant:\n\n{assistant_response.msg.content}\n")

        input_msg = assistant_response.msg

    return conversation

def conduct_user_demand_research(user_profiles):
    """
    进行用户需求调研
    
    Args:
        user_profiles (list): 用户档案列表
    
    Returns:
        dict: 包含所有对话结果的字典
    """
    all_conversations = {
        "research_topic": "成年女性牛仔裤需求调研",
        "conversations": []
    }

    for consumer_profile_i in user_profiles:
        print(f"\n开始与{consumer_profile_i['城市']}的{consumer_profile_i['职业']}妈妈对话...\n")
        consumer_info_i = create_user_info(consumer_profile_i)

        in_model = qwenModel
        in_assistant_agent_kwargs_sys_message = \
            consumer_info_i + """
            你性格开朗真诚,喜欢分享生活。正在接受一份用户调研, 过程中需要像跟朋友聊天一样自然, 
            可以结合自己的兴趣爱好和生活经历来分享穿搭心得, 通过闲聊的方式表达真实想法。""" ,
        in_assistant_role_name = f"{consumer_profile_i['职业']}妈妈, {in_assistant_agent_kwargs_sys_message}", 

        in_user_agent_kwargs_sys_message = """
            你是一位童装品牌的产品企划,性格温和友善,善于通过轻松自然的对话方式了解消费者需求。
            现在你想为针对妈妈们开发一些简约舒适的服装, 将和目标用户开展一次用户调研对话。
            过程中多分享一些个人经历和见解,让对话更有温度。要记住每位妈妈的背景特点,适时引用她们的兴趣爱好和生活方式来拉近距离。
            同时要巧妙地将对话引导到调研目标上,但不要显得过于刻意。""",
        user_sim = "来自某童装品牌产品企业规划部门的产品调研负责人"
        in_user_role_name = f"{user_sim},  {in_user_agent_kwargs_sys_message}",

        # import pdb;pdb.set_trace()
        in_task_prompt = f"""现在有一位{user_sim}和一位{consumer_profile_i['职业']}妈妈用户, 两者需要进行亲切对话, 从而帮助{user_sim}调研用户对成年女性牛仔裤的真实需求. 具体需要了解以下几点:
            1. 妈妈本人日常中哪些场景会穿着牛仔裤; 
            2. 妈妈本人在这些场景下经常穿着的牛仔裤是怎样的; 
            3. 妈妈本人期待的牛仔裤需要满足哪些特点; 
            4. 妈妈本人日常穿着牛仔裤时遇到的问题有哪些; 
            5. 妈妈本人经常穿着的牛仔裤品牌是哪些. 
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
    user_profiles = get_user_profiles()
    
    all_conversations = conduct_user_demand_research(
        user_profiles=user_profiles
    )

    # 保存结果到文件
    import json
    with open('user_demand_results.json', 'w', encoding='utf-8') as f:
        json.dump(all_conversations, f, ensure_ascii=False, indent=4)





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
    ]

def create_user_info(profile):
    history_purchases = "\n ".join([f"{i+1}. {item}" for i, item in enumerate(profile["历史购买"])])
    return f"""你是一位妈妈, 在{profile["城市"]}做{profile["职业"]}工作, 日常喜欢{profile["生活方式"]}, 
            有一个{profile["孩子年龄"]}的孩子, 每年在童装上的花费是{profile["童装花费"]}。你购买过的童装包括: {history_purchases}"""


