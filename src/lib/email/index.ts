import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
console.log('RESEND_API_KEY status:', RESEND_API_KEY ? 'Present' : 'Missing');

// 创建一个可选的 Resend 实例
let resend: Resend | null = null;

// 只有在有有效的 API 密钥时才初始化 Resend
if (RESEND_API_KEY && RESEND_API_KEY.startsWith('re_')) {
  try {
    resend = new Resend(RESEND_API_KEY);
    console.log('Resend client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Resend client:', error);
  }
} else {
  console.log('Resend email functionality is disabled (no valid API key)');
}

export type EmailPayload = {
  to: string;
  subject: string;
  react: JSX.Element;
};

export const sendEmail = async ({ to, subject, react }: EmailPayload) => {
  try {
    console.log('Attempting to send email to:', to);
    
    // 如果 Resend 客户端不可用，返回模拟成功响应
    if (!resend) {
      console.log('Email sending skipped (Resend disabled)');
      return { 
        success: true, 
        data: { 
          id: 'mock-email-id',
          from: 'noreply@example.com',
          to: [to],
          created: new Date().toISOString()
        } 
      };
    }
    
    // 正常发送邮件
    const data = await resend.emails.send({
      from: 'Best SAAS Kit <onboarding@resend.dev>',
      to,
      subject,
      react,
    });
    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};