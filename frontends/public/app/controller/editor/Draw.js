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

Ext.define('Jobbox.controller.editor.Draw', {
  extend: 'Ext.app.Controller',
  refs: [{
    ref: 'editorFlowchart',
    selector: 'editorFlowchart'
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
      'editorDraw': {
        afterrender: this.onAfterRender,
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
  onAfterRender: function(container) {
    var me = this;

    container.addManagedListener(container.getEl(), 'mousemove', me.onMouseMove, me, container);
    container.addManagedListener(container.getEl(), 'mouseup', me.onMouseUp, me, container);
    container.addManagedListener(container.getEl(), 'mouseleave', me.onMouseLeave, me, container);
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
  onMouseMove: function(e, t, container) {
    var image = container.child('#jobunit_image');
    if (!image.isVisible())
      return;

    var pos_x = e.getPageX() - container.getX() - JOBBOX_DRAW_WIDTH;
    var pos_y = e.getPageY() - container.getY() - JOBBOX_DRAW_WIDTH;
    image.setPosition(pos_x, pos_y);
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
  onMouseUp: function(e, t, container) {
    var me = this;
    var image = container.child('#jobunit_image');
    if (!image.isVisible())
      return;
    image.setVisible(false);

    if (!jobbox_selected_parent)
      return;
    if (!(jobbox_selected_parent.data.kind >= JOBUNIT_KIND_ROOTJOBNET && jobbox_selected_parent.data.kind < JOBUNIT_KIND_STARTJOB))
      return;

    var flowchart = me.getEditorFlowchart();
    var pos_x = e.getPageX() - flowchart.getX() - JOBBOX_DRAW_WIDTH;
    var pos_y = e.getPageY() - flowchart.getY() - JOBBOX_DRAW_WIDTH;
    if (pos_x < 0 || pos_y < 0)
      return;
    if (pos_x > flowchart.width - 2 * JOBBOX_DRAW_WIDTH)
      return;
    if (pos_y > flowchart.height - 2 * JOBBOX_DRAW_WIDTH)
      return;

    var store = jobbox_selected_parent['jobbox.model.jobunitsStore'];
    var jobname = 'jobnet';
    if (image.jobunitkind >= JOBUNIT_KIND_STARTJOB) {
      jobname = 'job';
    }
    var name = JobboxMakeName(store, jobname, '');
    var jobunit = new Jobbox.model.Jobunit({
      name: name,
      parent_id: jobbox_selected_parent.data.id,
      kind: image.jobunitkind,
      x: pos_x,
      y: pos_y
    });

    jobunit.save({
      success: function(rec, operation) {
        var ctrl = Jobbox.app.getController('editor.Tree');
        ctrl.onLoadJobunit(jobbox_selected_parent.data.id);
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
  onMouseLeave: function(e, t, container) {
    var image = container.child('#jobunit_image');
    image.setVisible(false);
  },
});
