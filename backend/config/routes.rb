Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  devise_for :users, path: "api/v1/auth",
    path_names: { sign_in: "login", sign_out: "logout", registration: "register" },
    controllers: {
      sessions: "api/v1/sessions",
      registrations: "api/v1/registrations"
    },
    defaults: { format: :json }

  namespace :api do
    namespace :v1 do
      get "users/search", to: "users#search"
      get "users/:id/keys", to: "users#keys"
      put "users/keys", to: "users#update_keys"

      resources :conversations, only: [ :index, :show, :create ] do
        resources :messages, only: [ :index, :create ]
        resources :group_keys, only: [ :index, :create ]
      end
    end
  end

  mount ActionCable.server => "/cable"
end
