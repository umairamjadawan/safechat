class CreateMessages < ActiveRecord::Migration[7.1]
  def change
    create_table :messages, id: :uuid do |t|
      t.references :conversation, null: false, foreign_key: true, type: :uuid
      t.references :sender, null: false, foreign_key: { to_table: :users }, type: :uuid
      t.text :encrypted_body, null: false
      t.text :nonce, null: false
      t.string :message_type, null: false, default: "text"

      t.timestamps
    end

    add_index :messages, [ :conversation_id, :created_at ]
  end
end
