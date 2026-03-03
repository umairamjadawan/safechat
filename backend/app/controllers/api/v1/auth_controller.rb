module Api
  module V1
    class AuthController < ApplicationController
      skip_before_action :authenticate_user!, only: [ :register, :login ]

      def register
        user = User.new(register_params)

        if user.save
          public_key = params.dig(:user, :public_key)
          if public_key.present?
            user.create_identity_key!(public_key: public_key)
          end

          token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first
          render json: {
            user: UserSerializer.new(user).as_json,
            token: token
          }, status: :created
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def login
        user = User.find_by(email: params.dig(:user, :email))

        if user&.valid_password?(params.dig(:user, :password))
          token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first
          render json: {
            user: UserSerializer.new(user).as_json,
            token: token
          }, status: :ok
        else
          render json: { error: "Invalid email or password" }, status: :unauthorized
        end
      end

      def logout
        # JWT is revoked via devise-jwt revocation strategy
        render json: { message: "Logged out successfully" }, status: :ok
      end

      private

      def register_params
        params.require(:user).permit(:email, :password, :password_confirmation, :display_name)
      end
    end
  end
end
