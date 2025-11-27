export async function sendMessageNotification({
  matchId,
  userName,
  userAvatar,
  otherUserId,
  expo_tokens,
  messageText,
  messageType,
}: {
  matchId: string;
  userName: string;
  userAvatar?: string;
  otherUserId: string;
  expo_tokens: string[];
  messageText?: string;
  messageType?: 'text' | 'image' | 'gif' | 'audio';
}) {
  if (!expo_tokens?.length) {
    console.warn(`⚠️ No Expo tokens provided for user ${otherUserId}`);
    return;
  }

  // Derive a user-friendly body preview
  const bodyPreview = (() => {
    if (messageType === 'image') return `${userName} sent a photo`;
    if (messageType === 'gif') return `${userName} sent a GIF`;
    if (messageType === 'audio') return `${userName} sent a voice note`;
    const text = (messageText || '').trim();
    if (!text) return `${userName} sent a message`;
    return text.length > 140 ? `${text.slice(0, 137)}...` : text;
  })();

  const messages = expo_tokens.map((token) => ({
    to: token,
    sound: 'default',
    title: `${userName}`,
    body: bodyPreview,
    data: {
      type: 'message',
      matchId,
      userName,
      userAvatar: userAvatar || '',
      otherUserId,
      userId: otherUserId, // Alias for consistency
      messageText: messageText || '',
      messageType: messageType || 'text',
      route: '/(home)/(tabs)/(chats)/chatRoom',
    },
  }));

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Failed to send notification:', result);
      throw new Error(result?.errors?.[0]?.message || 'Expo push error');
    }

    console.log('✅ Notification sent successfully:', result?.data || result);
    return result;
  } catch (error) {
    console.error('🚨 Error sending notification:', error);
    throw error;
  }
}
