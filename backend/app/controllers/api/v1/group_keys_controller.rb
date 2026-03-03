module Api
  module V1
    class GroupKeysController < ApplicationController
      before_action :set_conversation

      def index
        group_key = @conversation.group_keys.find_by(recipient: current_user)

        if group_key
          render json: {
            group_key: {
              id: group_key.id,
              encrypted_group_key: group_key.encrypted_group_key,
              nonce: group_key.nonce,
              conversation_id: group_key.conversation_id
            }
          }
        else
          render json: { error: "No group key found" }, status: :not_found
        end
      end

      def create
        keys_params = params.require(:group_keys)

        created_keys = []
        ActiveRecord::Base.transaction do
          keys_params.each do |key_data|
            group_key = @conversation.group_keys.find_or_initialize_by(
              recipient_id: key_data[:recipient_id]
            )
            group_key.encrypted_group_key = key_data[:encrypted_group_key]
            group_key.nonce = key_data[:nonce]
            group_key.save!
            created_keys << group_key
          end
        end

        render json: {
          group_keys: created_keys.map { |gk|
            {
              id: gk.id,
              recipient_id: gk.recipient_id,
              encrypted_group_key: gk.encrypted_group_key,
              nonce: gk.nonce
            }
          }
        }, status: :created
      end

      private

      def set_conversation
        @conversation = current_user.conversations.find(params[:conversation_id])
      end
    end
  end
end
