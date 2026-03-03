class MessageSerializer < ActiveModel::Serializer
  attributes :id, :conversation_id, :sender_id, :encrypted_body, :nonce,
             :message_type, :created_at

  def sender_id
    object.sender_id
  end
end
