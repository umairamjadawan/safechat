class DeviseCreateUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :users, id: :uuid do |t|
      t.string :email, null: false, default: ""
      t.string :encrypted_password, null: false, default: ""
      t.string :display_name, null: false, default: ""

      t.timestamps null: false
    end

    add_index :users, :email, unique: true
  end
end
