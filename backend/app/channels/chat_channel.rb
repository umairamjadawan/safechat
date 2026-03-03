class ChatChannel < ApplicationCable::Channel
  def subscribed
    conversation = Conversation.find(params[:conversation_id])

    if conversation.participants.include?(current_user)
      stream_for conversation
    else
      reject
    end
  end

  def unsubscribed
    stop_all_streams
  end
end
