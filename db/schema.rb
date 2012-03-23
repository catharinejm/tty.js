# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20120301225009) do

  create_table "active_admin_comments", :force => true do |t|
    t.integer  "resource_id",   :null => false
    t.string   "resource_type", :null => false
    t.integer  "author_id"
    t.string   "author_type"
    t.text     "body"
    t.datetime "created_at",    :null => false
    t.datetime "updated_at",    :null => false
    t.string   "namespace"
  end

  add_index "active_admin_comments", ["author_type", "author_id"], :name => "index_active_admin_comments_on_author_type_and_author_id"
  add_index "active_admin_comments", ["namespace"], :name => "index_active_admin_comments_on_namespace"
  add_index "active_admin_comments", ["resource_type", "resource_id"], :name => "index_admin_notes_on_resource_type_and_resource_id"

  create_table "books", :force => true do |t|
    t.string   "title"
    t.string   "short_description"
    t.string   "purchase_url"
    t.string   "cover_image_uid"
    t.string   "cover_image_name"
    t.datetime "created_at",        :null => false
    t.datetime "updated_at",        :null => false
  end

  create_table "books_users", :id => false, :force => true do |t|
    t.integer "user_id"
    t.integer "book_id"
  end

  create_table "case_studies", :force => true do |t|
    t.integer  "client_id"
    t.string   "short_description"
    t.text     "content"
    t.datetime "created_at",        :null => false
    t.datetime "updated_at",        :null => false
    t.string   "summary"
  end

  create_table "clients", :force => true do |t|
    t.string   "name"
    t.datetime "created_at",              :null => false
    t.datetime "updated_at",              :null => false
    t.text     "testimonial"
    t.string   "testimonial_attribution"
    t.string   "slug"
  end

  add_index "clients", ["slug"], :name => "index_clients_on_slug", :unique => true

  create_table "gallery_images", :force => true do |t|
    t.integer  "user_id"
    t.string   "image_uid"
    t.string   "image_name"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "jobs", :force => true do |t|
    t.string   "title"
    t.string   "location"
    t.text     "description"
    t.string   "category"
    t.datetime "hidden_at"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
    t.string   "slug"
  end

  add_index "jobs", ["slug"], :name => "index_jobs_on_slug", :unique => true

  create_table "messages", :force => true do |t|
    t.string   "sender_name"
    t.string   "sender_email"
    t.string   "subject"
    t.text     "body"
    t.datetime "created_at",   :null => false
    t.datetime "updated_at",   :null => false
  end

  create_table "posts", :force => true do |t|
    t.string   "title"
    t.text     "content"
    t.integer  "author_id"
    t.string   "slug"
    t.boolean  "published"
    t.datetime "published_at"
    t.datetime "created_at",                                         :null => false
    t.datetime "updated_at",                                         :null => false
    t.text     "extended_content"
    t.date     "published_on"
    t.boolean  "imported",                        :default => false
    t.string   "summary",          :limit => 160
  end

  add_index "posts", ["slug", "published_on"], :name => "index_posts_on_slug_and_published_on", :unique => true

  create_table "roles", :force => true do |t|
    t.string   "name"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
    t.string   "slug"
  end

  add_index "roles", ["slug"], :name => "index_roles_on_slug", :unique => true

  create_table "roles_users", :force => true do |t|
    t.integer  "role_id"
    t.integer  "user_id"
    t.datetime "created_at"
  end

  create_table "taggings", :force => true do |t|
    t.integer  "tag_id"
    t.integer  "taggable_id"
    t.string   "taggable_type"
    t.integer  "tagger_id"
    t.string   "tagger_type"
    t.string   "context"
    t.datetime "created_at"
  end

  add_index "taggings", ["tag_id"], :name => "index_taggings_on_tag_id"
  add_index "taggings", ["taggable_id", "taggable_type", "context"], :name => "index_taggings_on_taggable_id_and_taggable_type_and_context"

  create_table "tags", :force => true do |t|
    t.string "name"
    t.string "slug"
  end

  add_index "tags", ["slug"], :name => "index_tags_on_slug", :unique => true

  create_table "users", :force => true do |t|
    t.string   "email",                                 :default => "",    :null => false
    t.string   "encrypted_password",     :limit => 128, :default => "",    :null => false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",                         :default => 0
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.datetime "created_at",                                               :null => false
    t.datetime "updated_at",                                               :null => false
    t.string   "name"
    t.string   "slug"
    t.boolean  "team_member",                           :default => false
    t.string   "github_url"
    t.string   "twitter_url"
    t.string   "blog_url"
    t.string   "avatar_uid"
    t.string   "avatar_name"
    t.text     "profile_text"
    t.string   "official_role"
    t.boolean  "active",                                :default => true,  :null => false
    t.string   "linkedin_url"
  end

  add_index "users", ["email"], :name => "index_admin_users_on_email", :unique => true
  add_index "users", ["reset_password_token"], :name => "index_admin_users_on_reset_password_token", :unique => true

end
