class CreateIdentityKeys < ActiveRecord::Migration[7.1]
  def change
    create_table :identity_keys, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid, index: { unique: true }
      t.text :public_key, null: false

      t.timestamps
    end
  end
end
