class UserSerializer < ActiveModel::Serializer
  attributes :id, :email, :display_name, :created_at
  has_one :identity_key, serializer: IdentityKeySerializer
end
