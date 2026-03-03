class ConversationSerializer < ActiveModel::Serializer
  attributes :id, :title, :is_group, :created_at, :updated_at, :last_message, :display_title

  has_many :participants, serializer: ParticipantSerializer

  def last_message
    msg = object.last_message
    return nil unless msg
    MessageSerializer.new(msg).as_json
  end

  def display_title
    if object.is_group?
      object.title
    else
      other = object.participants.where.not(id: scope&.id).first
      other&.display_name || object.title
    end
  end
end
