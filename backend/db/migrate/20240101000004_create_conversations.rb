class CreateConversations < ActiveRecord::Migration[7.1]
  def change
    create_table :conversations, id: :uuid do |t|
      t.string :title
      t.boolean :is_group, default: false, null: false

      t.timestamps
    end
  end
end
