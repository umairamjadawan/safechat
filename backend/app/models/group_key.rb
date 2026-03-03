class GroupKey < ApplicationRecord
  belongs_to :conversation
  belongs_to :recipient, class_name: "User"

  validates :encrypted_group_key, presence: true
  validates :nonce, presence: true
  validates :recipient_id, uniqueness: { scope: :conversation_id }
end
