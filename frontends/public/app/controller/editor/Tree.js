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


Ext.define('Jobbox.controller.editor.Tree', {
  extend: 'Ext.app.Controller',

  refs: [{
    ref: 'editorTree',
    selector: 'editorTree'
  }, {
    ref: 'editorTreeMenu',
    selector: 'editorTreeMenu'
  }, {
    ref: 'editorTab',
    selector: 'editorTab'
  }, {
    ref: 'editorList',
    selector: 'editorList'
  }, {
    ref: 'editorShow',
    selector: 'editorShow'
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
      'editorTree': {
        afterrender: this.onAfterrender,
        itemclick: this.onItemclick,
        itemcontextmenu: this.onItemcontextmenu
      },
      'editorTree treeview': {
        beforedrop: this.onBeforedrop,
        drop: this.onDrop
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
  onAfterrender: function(tree) {
    var me = this;
    Ext.create('Jobbox.view.editor.TreeMenu');
    Ext.create('Jobbox.view.editor.JobunitFile');

    var store = tree.getStore();
    store.setRootNode({
      id: 0,
      name: '/',
      kind: 0,
      parent_id: 0,
    });
    me.onLoadJobunit(0);
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
    var me = this;
    me.onLoadJobunit(record.data.id);
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
  onItemcontextmenu: function(tree, record, item, index, e, eOpts) {
    var me = this;
    var menu = me.getEditorTreeMenu();
    menu.showAt(e.getXY());
    e.stopEvent();
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
  onBeforedrop: function(node, data, overModel, dropPosition, dropHandlers, eOpts) {
    var proc = false;

    dropHandlers.wait = true;
    data.records.every(function(record) {
      proc = false;
      if (overModel.data.id == 0 && record.data.kind >= JOBUNIT_KIND_ROOTJOBNET) {
        Ext.Msg.alert(I18n.t('views.msg.error'), I18n.t('views.msg.create_rootjobnet'));
        return false;
      }
      if (overModel.data.kind >= JOBUNIT_KIND_ROOTJOBNET && record.data.kind < JOBUNIT_KIND_ROOTJOBNET) {
        return false;
      }
      proc = true;
    });

    if (proc) {
      dropHandlers.processDrop();
    } else {
      dropHandlers.cancelDrop();
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
  onDrop: function(node, data, overModel, dropPosition, eOpts) {
    var me = this;

    data.records.forEach(function(record) {
      var child = null;
      if (data.copy) {
        child = new Jobbox.model.JobunitChild(record.data);
      } else {
        child = record;
      }

      child.set('parent_id', overModel.data.id);
      if (child.data.kind >= JOBUNIT_KIND_ROOTJOBNET) {
        if (overModel.data.kind < JOBUNIT_KIND_ROOTJOBNET) {
          child.set('kind', JOBUNIT_KIND_ROOTJOBNET);
          child.set('x', 0);
          child.set('y', 0);
        } else {
          child.set('kind', JOBUNIT_KIND_JOBNET);
        }
      }

      child.save({
        failure: function(rec, response) {
          Ext.Msg.alert(I18n.t('views.msg.error'), I18n.t('views.msg.move_jobunit_failed') + " '" + child.data.name + "'");
          me.onLoadJobunit(0);
        },
      });
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
  onLoadJobunit: function(id) {
    var me = this;

    // check editing
    if (jobbox_selected_rootjobnet) {
      var rootjobnet_id = me.onGetRootjobnet(id);
      if (rootjobnet_id != jobbox_selected_rootjobnet.data.jobunit_id && jobbox_selected_rootjobnet.data.user_id == jobbox_login_user.data.id) {
        Ext.Msg.alert(I18n.t('views.msg.error'), I18n.t('views.msg.unlock_rootjobnet'));
        me.onLoadJobunit(jobbox_selected_parent.data.id);
        return;
      }
    }

    // expand tree
    var tree = me.getEditorTree();
    var store = tree.getStore();
    var node = store.getNodeById(id);
    store.load({
      url: location.pathname + '/jobunits',
      node: node,
      callback: function(records, operation, success) {
        tree.selectPath(node.getPath());
        tree.expandPath(node.getPath());
      }
    });

    //set tab title
    var tab = me.getEditorTab();
    var title = '/';
    if (id > 0) title = node.getPath('name').slice(2);
    tab.setTitle(title);

    // reset parent & rootjobnet
    jobbox_mask.show();
    jobbox_selected_parent = null;
    me.onSetRootjobnet(id);

    Jobbox.model.Jobunit.load(id, {
      callback: function() {
        jobbox_mask.hide();
      },
      success: function(record) {
        jobbox_selected_parent = record;

        // set jobunit information
        var form = me.getEditorShow();
        form.loadRecord(jobbox_selected_parent);

        // set children
        if (jobbox_selected_parent['jobbox.model.jobunitsStore']) {
          jobbox_selected_parent['jobbox.model.jobunitsStore'].sort([{
            property: 'kind',
            direction: 'ASC'
          }, {
            property: 'name',
            direction: 'ASC'
          }]);
          var grid = me.getEditorList();
          grid.reconfigure(jobbox_selected_parent['jobbox.model.jobunitsStore']);
        }

        // set connectors
        if (jobbox_selected_parent['jobbox.model.connectorsStore']) {
          jobbox_selected_parent['jobbox.model.connectorsStore'].getProxy().url = location.pathname + '/jobunits/' + jobbox_selected_parent.data.id + '/connectors';
        }

        // set tab icon and active_tab
        var ctrl = Jobbox.app.getController('editor.Flowchart');
        switch (jobbox_selected_parent.data.kind) {
          case JOBUNIT_KIND_JOBGROUP:
            {
              tab.setIcon(location.pathname + '/ext/resources/themes/images/default/tree/folder-open.gif');
              tab.setActiveTab('editor_list');
              break;
            }
          case JOBUNIT_KIND_ROOTJOBNET:
          case JOBUNIT_KIND_JOBNET:
            {
              tab.setIcon(location.pathname + '/images/icons/chart_organisation.png');
              tab.setActiveTab('editor_detail');
              ctrl.onDrawFlowchart(jobbox_selected_parent);
              break;
            }
          default:
            {
              tab.setIcon(location.pathname + '/images/icons/server.png');
              tab.setActiveTab('editor_list');
            }
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
  onGetRootjobnet: function(id) {
    var me = this;
    var tree = me.getEditorTree();
    var store = tree.getStore();
    var node = store.getNodeById(id);
    if (!node)
      return 0;

    while (true) {
      if (node.data.kind <= JOBUNIT_KIND_ROOTJOBNET || node.data.id == 0)
        break;
      node = node.parentNode;
    }
    if (node.data.kind != JOBUNIT_KIND_ROOTJOBNET)
      return 0;

    return node.data.id;
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
  onSetRootjobnet: function(id) {
    var me = this;
    var tree = me.getEditorTree();
    var store = tree.getStore();
    var node = store.getNodeById(id);

    jobbox_selected_rootjobnet = null;
    if (!node)
      return;

    while (true) {
      if (node.data.kind <= JOBUNIT_KIND_ROOTJOBNET || node.data.id == 0)
        break;
      node = node.parentNode;
    }
    if (node.data.kind != JOBUNIT_KIND_ROOTJOBNET)
      return;

    Jobbox.model.Jobunit.load(node.data.id, {
      success: function(record) {
        jobbox_selected_rootjobnet = record['Jobbox.model.RootjobnetHasOneInstance'];
        jobbox_selected_rootjobnet.getProxy().url = location.pathname + '/jobunits/' + record.data.id + '/rootjobnets';

        var ctrl = Jobbox.app.getController('editor.Detail');
        ctrl.onSetCheckbox();
      }
    });
  },
});
