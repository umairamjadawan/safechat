class CreateGroupKeys < ActiveRecord::Migration[7.1]
  def change
    create_table :group_keys, id: :uuid do |t|
      t.references :conversation, null: false, foreign_key: true, type: :uuid
      t.references :recipient, null: false, foreign_key: { to_table: :users }, type: :uuid
      t.text :encrypted_group_key, null: false
      t.text :nonce, null: false

      t.timestamps
    end

    add_index :group_keys, [ :conversation_id, :recipient_id ], unique: true
  end
end
