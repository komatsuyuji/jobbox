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
Ext.define('Jobbox.view.user.Index', {
  alias: 'widget.userIndex',
  extend: 'Ext.panel.Panel',
  title: I18n.t('views.title.users'),
  layout: 'border',
  bbar: [{
    xtype: 'pagingtoolbar',
    store: 'User',
    displayInfo: true
  }, '-', {
    text: I18n.t('views.button.clear_filter'),
    icon: location.pathname + '/images/icons/hourglass.png',
    action: 'clear_filter',
  }, '->', {
    text: I18n.t('views.button.add'),
    icon: location.pathname + '/images/icons/user_add.png',
    action: 'add_user'
  }, '-', {
    text: I18n.t('views.button.delete'),
    icon: location.pathname + '/images/icons/user_delete.png',
    action: 'delete_user'
  }, '-', {
    text: I18n.t('views.button.save'),
    icon: location.pathname + '/images/icons/disk.png',
    action: 'save_user'
  }, '-', {
    text: I18n.t('views.button.cancel'),
    icon: location.pathname + '/images/icons/cancel.png',
    action: 'cancel_user'
  }],

  items: [{
    xtype: 'userList',
    region: 'west',
    width: 650
  }, {
    xtype: 'userEdit',
    region: 'center',
  }],
  initComponent: function() {
    this.callParent();
  }
});
