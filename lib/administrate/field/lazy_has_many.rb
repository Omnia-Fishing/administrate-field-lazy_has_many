require 'administrate/field/has_many'
require 'administrate/field/lazy_has_many/version'
require 'rails/engine'
require 'administrate/engine'

module Administrate
  module Field
    class LazyHasMany < Administrate::Field::HasMany
      include LazyHasManyVersion

      class Engine < ::Rails::Engine
        Administrate::Engine.add_javascript 'administrate-field-lazy_has_many/application'
        Administrate::Engine.add_stylesheet 'administrate-field-lazy_has_many/application'

        isolate_namespace Administrate
      end
    end
  end
end
