class Conversation < ApplicationRecord
  has_many :conversation_participants, dependent: :destroy
  has_many :participants, through: :conversation_participants, source: :user
  has_many :messages, dependent: :destroy
  has_many :group_keys, dependent: :destroy

  def last_message
    messages.order(created_at: :desc).first
  end
end
