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

Ext.define('Jobbox.controller.common.Jobnet', {
  extend: 'Ext.app.Controller',
  refs: [{
    ref: 'editorTree',
    selector: 'editorTree'
  }, {
    ref: 'editorDetail',
    selector: 'editorDetail'
  }, {
    ref: 'editorJobunitTab',
    selector: 'editorJobunitTab'
  }, {
    ref: 'processJobunitTab',
    selector: 'processJobunitTab'
  }, {
    ref: 'historyJobunitTab',
    selector: 'historyJobunitTab'
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
  init: function() {},

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
  onSaveRecord: function() {
    var me = this;
    var tab = me.getEditorJobunitTab();
    var panel = tab.child('#comm_jobnet');
    var form_jobunit = panel.child('#comm_jobunit');
    var form_rootjobnet = panel.child('#comm_rootjobnet');
    form_jobunit.updateRecord();


    var record = form_jobunit.getRecord();
    var rec_rootjobnet = record['Jobbox.model.RootjobnetHasOneInstance'];
    var store_jobunits = record['jobbox.model.jobunitsStore'];
    var store_connectors = record['jobbox.model.connectorsStore'];
    var store_schedules = record['jobbox.model.schedulesStore'];
    jobbox_mask.show();

    // rootjobnet
    if (rec_rootjobnet) {
      form_rootjobnet.updateRecord();
      rec_rootjobnet.set('user_id', jobbox_login_user.data.id);
      rec_rootjobnet['isSyncing'] = false;
    }

    // children
    if (store_jobunits) {
      if (store_jobunits.getModifiedRecords().length == 0 && store_jobunits.getRemovedRecords().length == 0) {
        store_jobunits['isSyncing'] = false;
      } else {
        store_jobunits['isSyncing'] = true;
      }
    };

    //connectors
    if (store_connectors) {
      if (store_connectors.getModifiedRecords().length == 0 && store_connectors.getRemovedRecords().length == 0) {
        store_connectors['isSyncing'] = false;
      } else {
        store_connectors['isSyncing'] = true;
      }
    };

    // schedules
    if (store_schedules) {
      if (store_schedules.getModifiedRecords().length == 0 && store_schedules.getRemovedRecords().length == 0) {
        store_schedules['isSyncing'] = false;
      } else {
        store_schedules['isSyncing'] = true;
      }
    };

    // syncing
    record['isSyncing'] = true;
    if (rec_rootjobnet) {
      rec_rootjobnet.save({
        callback: function() {
          rec_rootjobnet['isSyncing'] = false;
          me.onReloadReacord(record);
        }
      });
    };
    if (store_jobunits) {
      store_jobunits.sync({
        callback: function() {
          store_jobunits['isSyncing'] = false;
          me.onReloadReacord(record);
        }
      });
    };
    if (store_connectors) {
      store_connectors.sync({
        callback: function() {
          store_connectors['isSyncing'] = false;
          me.onReloadReacord(record);
        }
      });
    };
    if (store_schedules) {
      store_schedules.sync({
        callback: function() {
          store_schedules['isSyncing'] = false;
          me.onReloadReacord(record);
        }
      });
    };

    record.save({
      callback: function() {
        record['isSyncing'] = false;
        me.onReloadReacord(record);
      }
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
  onReloadReacord: function(record) {
    var me = this;
    var is_syncing = false;
    var rec_rootjobnet = record['Jobbox.model.RootjobnetHasOneInstance'];
    var store_jobunits = record['jobbox.model.jobunitsStore'];
    var store_connectors = record['jobbox.model.connectorsStore'];
    var store_schedules = record['jobbox.model.schedulesStore'];

    if (rec_rootjobnet && rec_rootjobnet['isSyncing']) {
      is_syncing = rec_rootjobnet['isSyncing'];
    };
    if (store_jobunits && store_jobunits['isSyncing']) {
      is_syncing = store_jobunits['isSyncing'];
    };
    if (store_connectors && store_connectors['isSyncing']) {
      is_syncing = store_connectors['isSyncing'];
    };
    if (store_schedules && store_schedules['isSyncing']) {
      is_syncing = store_schedules['isSyncing'];
    };
    if (record['isSyncing']) {
      is_syncing = record['isSyncing'];
    };

    if (!is_syncing) {
      var ctrl = Jobbox.app.getController('editor.Tree');
      ctrl.onLoadJobunit(record.data.id);
    };
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
  onCancelRecord: function() {
    var me = this;
    if (!jobbox_selected_parent)
      return;

    var ctrl = Jobbox.app.getController('editor.Tree');
    ctrl.onLoadJobunit(jobbox_selected_parent.data.id);
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
  onLoadRecord: function(record) {
    if (!record)
      return;

    var me = this;
    var tab = me.getEditorJobunitTab();
    var panel = tab.child('#comm_jobnet');
    var form_jobunit = panel.child('#comm_jobunit');
    var form_rootjobnet = panel.child('#comm_rootjobnet');
    var grid_schedule = panel.child('#comm_schedule');

    JobboxSetForm(form_jobunit, record);
    var rec_rootjobnet = record['Jobbox.model.RootjobnetHasOneInstance'];
    var store_schedule = record['jobbox.model.schedulesStore'];

    if (rec_rootjobnet) {
      rec_rootjobnet.getProxy().url = location.pathname + '/jobunits/' + record.data.id + '/rootjobnets';
    }
    JobboxSetForm(form_rootjobnet, rec_rootjobnet);

    if (store_schedule) {
      store_schedule.getProxy().url = location.pathname + '/jobunits/' + record.data.id + '/schedules';
      grid_schedule.reconfigure(store_schedule);
    }

    switch (record.data.kind) {
      case JOBUNIT_KIND_ROOTJOBNET:
        {
          form_rootjobnet.setVisible(true);
          grid_schedule.setVisible(true);
          break;
        }
      case JOBUNIT_KIND_JOBNET:
        {
          form_rootjobnet.setVisible(false);
          grid_schedule.setVisible(false);
          break;
        }
    }
    tab.setActiveTab('comm_jobnet');
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
  onLoadProcRecord: function(record) {
    if (!record)
      return;

    var me = this;
    var tab = me.getProcessJobunitTab();
    var panel = tab.child('#comm_jobnet');
    var form_jobunit = panel.child('#comm_jobunit');
    var form_rootjobnet = panel.child('#comm_rootjobnet');
    var grid_schedule = panel.child('#comm_schedule');

    JobboxSetForm(form_jobunit, record);
    if (record['Jobbox.model.RootjobnetHasOneInstance']) {
      JobboxSetForm(form_rootjobnet, record['Jobbox.model.RootjobnetHasOneInstance']);
    }
    if (record['jobbox.model.schedulesStore']) {
      grid_schedule.reconfigure(record['jobbox.model.schedulesStore']);
    }

    switch (record.data.kind) {
      case JOBUNIT_KIND_ROOTJOBNET:
        {
          form_rootjobnet.setVisible(true);
          grid_schedule.setVisible(true);
          break;
        }
      case JOBUNIT_KIND_JOBNET:
        {
          form_rootjobnet.setVisible(false);
          grid_schedule.setVisible(false);
          break;
        }
    }
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
  onLoadHistRecord: function(record) {
    if (!record)
      return;

    var me = this;
    var tab = me.getHistoryJobunitTab();
    var panel = tab.child('#comm_jobnet');
    var form_jobunit = panel.child('#comm_jobunit');
    var form_rootjobnet = panel.child('#comm_rootjobnet');
    var grid_schedule = panel.child('#comm_schedule');

    JobboxSetForm(form_jobunit, record);
    if (record['Jobbox.model.RootjobnetHasOneInstance']) {
      JobboxSetForm(form_rootjobnet, record['Jobbox.model.RootjobnetHasOneInstance']);
    }
    if (record['jobbox.model.schedulesStore']) {
      grid_schedule.reconfigure(record['jobbox.model.schedulesStore']);
    }

    switch (record.data.kind) {
      case JOBUNIT_KIND_ROOTJOBNET:
        {
          form_rootjobnet.setVisible(true);
          grid_schedule.setVisible(true);
          break;
        }
      case JOBUNIT_KIND_JOBNET:
        {
          form_rootjobnet.setVisible(false);
          grid_schedule.setVisible(false);
          break;
        }
    }
  },

});
