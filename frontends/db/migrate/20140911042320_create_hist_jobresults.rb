#################################################################################
#
# Jobbox WebAPI
# Copyright (C) 2014-2015 Komatsu Yuji(Zheng Chuyu)
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
#################################################################################

class CreateHistJobresults < ActiveRecord::Migration
  def change
    create_table :hist_jobresults do |t|
      t.integer :hist_jobunit_id, :null => false, :default => 0, :limit => 8
      t.integer :exitcode, :null => false, :default => -1
      t.string :exitsignal, :null => false, :default => ''
      t.text :stdout
      t.text :stderr
      t.timestamps :null => false
      
      t.index :hist_jobunit_id
    end
  end
end
