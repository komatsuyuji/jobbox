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

Ext.define('Jobbox.controller.editor.JobunitTab', {
  extend: 'Ext.app.Controller',
  refs: [{
    ref: 'editorJobunitTab',
    selector: 'editorJobunitTab'
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
      'commonJobnet button[action=manualrun_jobnet]': {
        click: this.onManualrunJobnet
      },
      'editorJobunitTab button[action=copy_jobunit]': {
        click: this.onCopyJobunit
      },
      'editorJobunitTab button[action=paste_jobunit]': {
        click: this.onPasteJobunit
      },
      'editorJobunitTab button[action=delete_jobunit]': {
        click: this.onDeleteJobunit
      },
      'editorJobunitTab button[action=save_jobunit]': {
        click: this.onSaveJobunit
      },
      'editorJobunitTab button[action=cancel_jobunit]': {
        click: this.onCancelJobunit
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
  onManualrunJobnet: function(button, e) {
    var me = this;
    var tab = me.getEditorJobunitTab();
    var panel = tab.child('#comm_jobnet');

    var form = panel.child('#comm_jobunit');
    var jobnet = form.getRecord();
    if (!jobnet)
      return;

    var mode = TOPJOBNET_MODE_SPECIFIED;
    var schedule_time = null;
    var bbar = panel.getDockedItems('toolbar[dock="bottom"]');
    var dd = panel.query('#df_manualrun')[0].getValue();
    var tt = panel.query('#tf_manualrun')[0].getValue();
    var msg;

    if (dd && tt) {
      schedule_time = new Date(dd.getFullYear(), dd.getMonth(), dd.getDate(), tt.getHours(), tt.getMinutes(), 0);
    } else
    if (tt) {
      var today = new Date();
      schedule_time = new Date(today.getFullYear(), today.getMonth(), today.getDate(), tt.getHours(), tt.getMinutes(), 0);
    } else
    if (dd) {
      schedule_time = new Date(dd.getFullYear(), dd.getMonth(), dd.getDate(), 0, 0, 0);
    } else {
      mode = TOPJOBNET_MODE_IMMEDIATE;
    };
    if (mode == TOPJOBNET_MODE_IMMEDIATE) {
      msg = I18n.t('views.msg.immediate_run', {
        name: jobnet.data.name
      });
    } else {
      msg = I18n.t('views.msg.specified_run', {
        name: jobnet.data.name,
        time: Ext.Date.format(schedule_time, 'Y-m-d H:i')
      })
    };

    var record = new Jobbox.model.ProcTopjobnet();
    record.set('name', jobnet.data.name);
    record.set('description', jobnet.data.description);
    record.set('kind', jobnet.data.kind);
    record.set('hold', jobnet.data.hold);
    record.set('skip', jobnet.data.skip);
    record.set('jobunit_id', jobnet.data.id);
    record.set('mode', mode);
    record.set('schedule_time', schedule_time);

    form = panel.child('#comm_rootjobnet');
    var rootjobnet = form.getRecord();
    if (rootjobnet) {
      record.set('run_type', rootjobnet.data.run_type);
      record.set('delay_limit', rootjobnet.data.delay_limit);
    } else {
      record.set('run_type', true);
      record.set('delay_limit', 0);
    }

    Ext.Msg.show({
      title: I18n.t('views.title.manual_run'),
      msg: msg,
      buttons: Ext.Msg.YESNO,
      icon: Ext.Msg.QUESTION,
      fn: function(btn) {
        if (btn == "yes") {
          record.save();
        }
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
  onCopyJobunit: function(button, e) {
    var ctrl = Jobbox.app.getController('editor.Flowchart');
    ctrl.onCopyJobunit();
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
  onPasteJobunit: function(button, e) {
    var ctrl = Jobbox.app.getController('editor.Flowchart');
    ctrl.onPasteJobunit();
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
  onDeleteJobunit: function(button, e) {
    var ctrl = Jobbox.app.getController('editor.Flowchart');
    ctrl.onDeleteJobunit();
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
  onLoadJobunit: function(record) {
    if (!record) return;
    var me = this;
    var tab = me.getEditorJobunitTab();
    var ctrl = null;

    switch (record.data.kind) {
      case JOBUNIT_KIND_ROOTJOBNET:
        {
          tab.setActiveTab('comm_jobnet');
          break;
        }
      case JOBUNIT_KIND_JOBNET:
        {
          ctrl = Jobbox.app.getController('common.Subjobnet');
          tab.setActiveTab('comm_subjobnet');
          break;
        }
      case JOBUNIT_KIND_STARTJOB:
      case JOBUNIT_KIND_ENDJOB:
        {
          ctrl = Jobbox.app.getController('common.Startjob');
          tab.setActiveTab('comm_startjob');
          break;
        }
      case JOBUNIT_KIND_MERGEJOB:
        {
          ctrl = Jobbox.app.getController('common.Mergejob');
          tab.setActiveTab('comm_mergejob');
          break;
        }
      case JOBUNIT_KIND_SLEEPJOB:
        {
          ctrl = Jobbox.app.getController('common.Sleepjob');
          tab.setActiveTab('comm_sleepjob');
          break;
        }
      case JOBUNIT_KIND_CLOCKJOB:
        {
          ctrl = Jobbox.app.getController('common.Clockjob');
          tab.setActiveTab('comm_clockjob');
          break;
        }
      case JOBUNIT_KIND_DATEJOB:
        {
          ctrl = Jobbox.app.getController('common.Datejob');
          tab.setActiveTab('comm_datejob');
          break;
        }
      case JOBUNIT_KIND_VARJOB:
        {
          ctrl = Jobbox.app.getController('common.Varjob');
          tab.setActiveTab('comm_varjob');
          break;
        }
      case JOBUNIT_KIND_SSHJOB:
        {
          ctrl = Jobbox.app.getController('common.Sshjob');
          tab.setActiveTab('comm_sshjob');
          break;
        }
      case JOBUNIT_KIND_WINJOB:
        {
          ctrl = Jobbox.app.getController('common.Winjob');
          tab.setActiveTab('comm_winjob');
          break;
        }
      default:
        {
          tab.setActiveTab('comm_jobnet');
        }
    }

    if (ctrl) {
      ctrl.onLoadRecord(record);
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
  onSaveJobunit: function(button, e) {
    var me = this;
    var tab = me.getEditorJobunitTab();
    var itemid = tab.getActiveTab().getItemId();
    var ctrl_jobnet = Jobbox.app.getController('common.Jobnet');
    var ctrl = null;

    switch (itemid) {
      case 'comm_jobnet':
        {
          ctrl_jobnet.onSaveRecord();
          return;
          break;
        }
      case 'comm_subjobnet':
        {
          ctrl = Jobbox.app.getController('common.Subjobnet');
          break;
        }
      case 'comm_startjob':
        {
          ctrl = Jobbox.app.getController('common.Startjob');
          break;
        }
      case 'comm_mergejob':
        {
          ctrl = Jobbox.app.getController('common.Mergejob');
          break;
        }
      case 'comm_sleepjob':
        {
          ctrl = Jobbox.app.getController('common.Sleepjob');
          break;
        }
      case 'comm_clockjob':
        {
          ctrl = Jobbox.app.getController('common.Clockjob');
          break;
        }
      case 'comm_datejob':
        {
          ctrl = Jobbox.app.getController('common.Datejob');
          break;
        }
      case 'comm_varjob':
        {
          ctrl = Jobbox.app.getController('common.Varjob');
          break;
        }
      case 'comm_sshjob':
        {
          ctrl = Jobbox.app.getController('common.Sshjob');
          break;
        }
      case 'comm_winjob':
        {
          ctrl = Jobbox.app.getController('common.Winjob');
          break;
        }
      default:
        {}
    }

    var record = null;
    if (ctrl) {
      record = ctrl.onSaveRecord();
    }

    if (record) {
      var ctrl_flowchart = Jobbox.app.getController('editor.Flowchart');
      ctrl_flowchart.onRedrawJob(record);
      ctrl_jobnet.onSaveRecord();
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
  onCancelJobunit: function(button, e) {
    var me = this;
    var tab = me.getEditorJobunitTab();
    var itemid = tab.getActiveTab().getItemId();
    var ctrl = null;

    switch (itemid) {
      case 'comm_jobnet':
        {
          ctrl = Jobbox.app.getController('common.Jobnet');
          break;
        }
      case 'comm_subjobnet':
        {
          ctrl = Jobbox.app.getController('common.Subjobnet');
          break;
        }
      case 'comm_startjob':
        {
          ctrl = Jobbox.app.getController('common.Startjob');
          break;
        }
      case 'comm_mergejob':
        {
          ctrl = Jobbox.app.getController('common.Mergejob');
          break;
        }
      case 'comm_sleepjob':
        {
          ctrl = Jobbox.app.getController('common.Sleepjob');
          break;
        }
      case 'comm_clockjob':
        {
          ctrl = Jobbox.app.getController('common.Clockjob');
          break;
        }
      case 'comm_datejob':
        {
          ctrl = Jobbox.app.getController('common.Datejob');
          break;
        }
      case 'comm_varjob':
        {
          ctrl = Jobbox.app.getController('common.Varjob');
          break;
        }
      case 'comm_sshjob':
        {
          ctrl = Jobbox.app.getController('common.Sshjob');
          break;
        }
      case 'comm_winjob':
        {
          ctrl = Jobbox.app.getController('common.Winjob');
          break;
        }
      default:
        {}
    }

    if (ctrl) {
      ctrl.onCancelRecord();
    }
  },

});
