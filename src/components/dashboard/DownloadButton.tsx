'use client'

import { Button } from "@/components/ui/button"

async function downloadConversation(taskId: string) {
  try {
    // Update the API endpoint to point to the Flask backend
    const response = await fetch(`http://localhost:5000/api/conversation?task_id=${taskId}`);
    const data = await response.json();
    
    if (data.status === 'success') {
      const content = JSON.stringify(data.conversation, null, 2);
      const blob = new Blob([content], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `conversation_${data.task_name}_${new Date(data.created_at).toISOString().split('T')[0]}.json`;
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      console.error('Download failed:', data.message);
      alert('Download failed: ' + data.message);
    }
  } catch (error) {
    console.error('Download error:', error);
    alert('Download error, please try again');
  }
}

export function DownloadButton({ taskId }: { taskId: string }) {
  return (
    <Button onClick={() => downloadConversation(taskId)}>
      Download whole conversation
    </Button>
  )
}