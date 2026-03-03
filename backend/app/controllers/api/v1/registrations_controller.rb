module Api
  module V1
    class RegistrationsController < Devise::RegistrationsController
      respond_to :json

      def create
        build_resource(sign_up_params)

        resource.save
        if resource.persisted?
          public_key = params.dig(:user, :public_key)
          if public_key.present?
            resource.create_identity_key!(public_key: public_key)
          end

          token = Warden::JWTAuth::UserEncoder.new.call(resource, :user, nil).first
          render json: {
            user: UserSerializer.new(resource).as_json,
            token: token
          }, status: :created
        else
          render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def sign_up_params
        params.require(:user).permit(:email, :password, :password_confirmation, :display_name)
      end
    end
  end
end
