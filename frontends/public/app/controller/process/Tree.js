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

Ext.define('Jobbox.controller.process.Tree', {
  extend: 'Ext.app.Controller',
  refs: [{
    ref: 'processTree',
    selector: 'processTree'
  }],

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
  init: function() {
    this.control({
      'processTree': {
        afterrender: this.onAfterrender,
        itemclick: this.onItemclick,
      },
      'processTree menuitem[action=set_interval]': {
        click: this.onSetInterval
      },
    });
  },

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
  onAfterrender: function(tree, e) {
    var me = this;
    var store = tree.getStore();
    var ctrl = Jobbox.app.getController('process.List');

    var query = window.location.search.substring(1);
    var param = Ext.Object.fromQueryString(query);
    if (!param.proc_jobunit_id)
      return;

    me.onSetIconCls();

    jobbox_topjobnet_id = 0;
    Jobbox.model.ProcJobunit.load(param.proc_jobunit_id, {
      failure: function(record) {
        jobbox_topjobnet_id = 0;
      },
      success: function(record) {
        jobbox_topjobnet_id = param.proc_jobunit_id;
        store.setRootNode(record.getData());
        tree.expandPath(tree.getRootNode().getPath());
      }
    });

    var interval = setInterval(function() {
      if (jobbox_interval_count >= jobbox_process_interval)
        jobbox_interval_count = 0;
      if (jobbox_interval_count == 0) {
        ctrl.onLoadJobnet(jobbox_topjobnet_id);
      }
      jobbox_interval_count++;
    }, 1000);
  },

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
  onItemclick: function(view, record, item, index, e) {
    if (!record) return;

    jobbox_topjobnet_id = record.data.id;
    jobbox_interval_count = 0;
    var ctrl = Jobbox.app.getController('process.Flowchart');
    ctrl.onReset();
  },

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
  onSetInterval: function(item, e) {
    var me = this;
    jobbox_process_interval = item.interval;
    me.onSetIconCls();
  },

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
  onSetIconCls: function() {
    var me = this;
    var tree = me.getProcessTree();
    var menuitems = tree.query('menuitem');

    menuitems.forEach(function(item) {
      if (item.interval) {
        if (jobbox_process_interval == item.interval) {
          item.setIconCls('');
        } else {
          item.setIconCls('x-hide-display');
        }
      }
    });
  },

});
