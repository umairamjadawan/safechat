class IdentityKey < ApplicationRecord
  belongs_to :user

  validates :public_key, presence: true
  validates :user_id, uniqueness: true
end
