class IdentityKeySerializer < ActiveModel::Serializer
  attributes :id, :public_key, :created_at
end
