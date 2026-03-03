class ConversationParticipant < ApplicationRecord
  belongs_to :conversation
  belongs_to :user

  validates :role, inclusion: { in: %w[member admin] }
  validates :user_id, uniqueness: { scope: :conversation_id }
end
