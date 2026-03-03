class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::Denylist

  devise :database_authenticatable, :registerable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: JwtDenylist

  has_one :identity_key, dependent: :destroy
  has_many :conversation_participants, dependent: :destroy
  has_many :conversations, through: :conversation_participants
  has_many :sent_messages, class_name: "Message", foreign_key: :sender_id, dependent: :destroy
  has_many :group_keys, foreign_key: :recipient_id, dependent: :destroy

  validates :display_name, presence: true
end
