module Api
  module V1
    class ConversationsController < ApplicationController
      def index
        conversations = current_user.conversations
                                    .includes(:participants, :conversation_participants)
                                    .order(updated_at: :desc)

        render json: {
          conversations: conversations.map { |c| ConversationSerializer.new(c, scope: current_user).as_json }
        }
      end

      def show
        conversation = current_user.conversations.find(params[:id])
        render json: {
          conversation: ConversationSerializer.new(conversation, scope: current_user).as_json
        }
      end

      def create
        conversation = nil

        ActiveRecord::Base.transaction do
          # For direct chats, check if conversation already exists
          if !params[:is_group] && params[:participant_ids]&.length == 1
            other_id = params[:participant_ids].first
            existing = find_existing_direct_conversation(other_id)
            if existing
              render json: { conversation: ConversationSerializer.new(existing, scope: current_user).as_json }
              return
            end
          end

          conversation = Conversation.create!(
            title: params[:title],
            is_group: params[:is_group] || false
          )

          # Add creator as admin
          conversation.conversation_participants.create!(
            user: current_user,
            role: "admin"
          )

          # Add other participants
          if params[:participant_ids].present?
            params[:participant_ids].each do |user_id|
              conversation.conversation_participants.create!(
                user_id: user_id,
                role: "member"
              )
            end
          end
        end

        conversation.reload

        # Notify participants
        conversation.participants.where.not(id: current_user.id).find_each do |user|
          NotificationChannel.broadcast_to(
            user,
            type: "new_conversation",
            conversation: ConversationSerializer.new(conversation, scope: user).as_json
          )
        end

        render json: {
          conversation: ConversationSerializer.new(conversation, scope: current_user).as_json
        }, status: :created
      end

      private

      def find_existing_direct_conversation(other_user_id)
        current_user.conversations
                    .where(is_group: false)
                    .joins(:conversation_participants)
                    .where(conversation_participants: { user_id: other_user_id })
                    .first
      end
    end
  end
end
