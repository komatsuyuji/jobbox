/////////////////////////////////////////////////////////////////////////////////
//
// Jobbox WebGUI
// Copyright (C) 2014-2015 Komatsu Yuji(Zheng Chuyu)
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
//
/////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////
//
// Function:
//
// Purpose:
//
// Parameters:
//
// Return value:
//
// Author: Komatsu Yuji(Zheng Chuyu)
//
/////////////////////////////////////////////////////////////////////////////////
Ext.define('Jobbox.model.Execlog', {
  extend: 'Ext.data.Model',
  fields: [{
    name: 'id',
    type: 'auto'
  }, {
    name: 'proc_jobunit_id',
    type: 'auto'
  }, {
    name: 'kind',
    type: 'int',
    defaultValue: 0
  }, {
    name: 'code',
    type: 'int',
    defaultValue: 0
  }, {
    name: 'message',
    type: 'string',
    defaultValue: ''
  }, {
    name: 'created_at',
    type: 'date'
  }, {
    name: 'updated_at',
    type: 'date'
  }]
});
