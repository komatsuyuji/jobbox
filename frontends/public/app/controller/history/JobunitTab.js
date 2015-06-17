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

Ext.define('Jobbox.controller.history.JobunitTab', {
  extend: 'Ext.app.Controller',
  refs: [{
    ref: 'historySidebar',
    selector: 'historySidebar'
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
  onLoadJobunit: function(record) {
    if (!record)
      return;
    var me = this;
    Jobbox.model.HistJobunit.load(record.data.id, {
      success: function(rec) {
        me.onLoadJobunitDetail(rec);
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
  onLoadJobunitDetail: function(record) {
    if (!record) return;

    var me = this;
    var tab = me.getHistoryJobunitTab();
    var ctrl = null;
    var ctrl_jobresult = Jobbox.app.getController('common.Jobresult');
    var ctrl_variable = Jobbox.app.getController('common.Variable');

    ctrl_jobresult.onLoadHistRecord(record);
    ctrl_variable.onLoadHistRecord(record);

    switch (record.data.kind) {
      case JOBUNIT_KIND_ROOTJOBNET:
        {
          ctrl = Jobbox.app.getController('common.Jobnet');
          tab.setActiveTab('comm_jobnet');
          break;
        }
      case JOBUNIT_KIND_JOBNET:
        {
          ctrl = Jobbox.app.getController('common.Jobnet');
          tab.setActiveTab('comm_jobnet');
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
      ctrl.onLoadHistRecord(record);
    }
  },

});
