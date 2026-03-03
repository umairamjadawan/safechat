module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    private

    def find_verified_user
      token = request.params[:token]
      return reject_unauthorized_connection unless token

      secret = ENV.fetch("DEVISE_JWT_SECRET_KEY") { Rails.application.secret_key_base }
      decoded = JWT.decode(token, secret, true, algorithm: "HS256")
      user_id = decoded.first["sub"]
      user = User.find_by(id: user_id)

      user || reject_unauthorized_connection
    rescue JWT::DecodeError
      reject_unauthorized_connection
    end
  end
end
