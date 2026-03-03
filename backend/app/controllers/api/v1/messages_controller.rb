module Api
  module V1
    class MessagesController < ApplicationController
      before_action :set_conversation

      def index
        page_num = [ params.fetch(:page, 1).to_i, 1 ].max
        per_page = 50

        messages = @conversation.messages
                                .includes(:sender)
                                .order(created_at: :desc)
                                .limit(per_page + 1)
                                .offset((page_num - 1) * per_page)

        has_more = messages.length > per_page
        messages = messages.first(per_page)

        render json: {
          messages: messages.map { |m| MessageSerializer.new(m).as_json },
          meta: { page: page_num, has_more: has_more }
        }
      end

      def create
        message = @conversation.messages.build(message_params)
        message.sender = current_user

        if message.save
          render json: { message: MessageSerializer.new(message).as_json }, status: :created
        else
          render json: { errors: message.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def set_conversation
        @conversation = current_user.conversations.find(params[:conversation_id])
      end

      def message_params
        params.require(:message).permit(:encrypted_body, :nonce, :message_type)
      end
    end
  end
end
