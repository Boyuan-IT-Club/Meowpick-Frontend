export const CONTACT_INFO = {
  email: {
    address: 'feedback@example.com',
    subject: '【选课猫反馈】',
    body: '请详细描述您的问题，建议附上截图和联系方式。\n\n---\n来自选课猫用户反馈'
  },
  qqGroup: {
    number: '123456789',
    joinLink: 'https://qm.qq.com/q/placeholder'
  }
};

export function buildMailtoLink(): string {
  const { address, subject, body } = CONTACT_INFO.email;
  return `mailto:${address}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export async function copyToClipboard(text: string, successMsg = '已复制'): Promise<void> {
  uni.setClipboardData({
    data: text,
    success: () => uni.showToast({ title: successMsg, icon: 'success' })
  });
}