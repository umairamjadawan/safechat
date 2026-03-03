class ApplicationController < ActionController::API
  before_action :authenticate_user!

  private

  def current_user_id
    current_user&.id
  end
end
