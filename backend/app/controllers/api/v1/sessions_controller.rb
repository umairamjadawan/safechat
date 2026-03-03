module Api
  module V1
    class SessionsController < Devise::SessionsController
      respond_to :json

      private

      def respond_with(resource, _opts = {})
        render json: {
          user: UserSerializer.new(resource).as_json,
          token: request.env["warden-jwt_auth.token"]
        }, status: :ok
      end

      def respond_to_on_destroy
        head :ok
      end
    end
  end
end
