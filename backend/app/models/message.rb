class Message < ApplicationRecord
  include Paginatable

  belongs_to :conversation
  belongs_to :sender, class_name: "User"

  validates :encrypted_body, presence: true
  validates :nonce, presence: true
  validates :message_type, inclusion: { in: %w[direct group_key text] }

  after_create_commit :broadcast_to_conversation

  private

  def broadcast_to_conversation
    ChatChannel.broadcast_to(
      conversation,
      MessageSerializer.new(self).as_json
    )

    conversation.participants.where.not(id: sender_id).find_each do |user|
      NotificationChannel.broadcast_to(
        user,
        type: "new_message",
        conversation_id: conversation_id,
        message: MessageSerializer.new(self).as_json
      )
    end
  end
end
