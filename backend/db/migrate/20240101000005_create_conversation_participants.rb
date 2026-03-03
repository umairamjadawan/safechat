class CreateConversationParticipants < ActiveRecord::Migration[7.1]
  def change
    create_table :conversation_participants, id: :uuid do |t|
      t.references :conversation, null: false, foreign_key: true, type: :uuid
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.string :role, null: false, default: "member"
      t.datetime :joined_at, null: false, default: -> { "CURRENT_TIMESTAMP" }

      t.timestamps
    end

    add_index :conversation_participants, [ :conversation_id, :user_id ], unique: true
  end
end
