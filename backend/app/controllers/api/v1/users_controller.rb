module Api
  module V1
    class UsersController < ApplicationController
      def search
        query = params[:q].to_s.strip
        if query.length < 2
          render json: { users: [] }
          return
        end

        users = User.where.not(id: current_user.id)
                    .where("email ILIKE :q OR display_name ILIKE :q", q: "%#{query}%")
                    .limit(20)

        render json: { users: users.map { |u| UserSerializer.new(u).as_json } }
      end

      def keys
        user = User.find(params[:id])
        identity_key = user.identity_key

        if identity_key
          render json: { public_key: identity_key.public_key }
        else
          render json: { error: "No public key found" }, status: :not_found
        end
      end

      def update_keys
        public_key = params[:public_key]
        if public_key.blank?
          render json: { error: "public_key is required" }, status: :unprocessable_entity
          return
        end

        identity_key = current_user.identity_key
        if identity_key
          identity_key.update!(public_key: public_key)
        else
          current_user.create_identity_key!(public_key: public_key)
        end

        render json: { public_key: current_user.identity_key.public_key }
      end
    end
  end
end
