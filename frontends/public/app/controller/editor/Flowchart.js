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

Ext.define('Jobbox.controller.editor.Flowchart', {
  extend: 'Ext.app.Controller',

  refs: [{
    ref: 'editorFlowchart',
    selector: 'editorFlowchart'
  }, {
    ref: 'editorJobunittab',
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
      'editorFlowchart': {
        afterrender: this.onAfterRender,
        mousedown: this.onMousedown,
        mouseup: this.onMouseup,
        mousemove: this.onMousemove,
        dblclick: this.onDblclick,
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
  onAfterRender: function(flowchart) {
    var me = this;

    Ext.getDoc().on({
      keydown: me.onKeyDown,
      scope: flowchart
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
  onKeyDown: function(e, t) {
    var me = this;

    if (t.tagName != 'BODY')
      return;

    if (jobbox_surface_state == JOBBOX_STATE_NONE)
      return;

    var ctrl = Jobbox.app.getController('editor.Flowchart');
    switch (e.getKey()) {
      case e.DELETE:
        {
          ctrl.onDeleteJobunit();
          break;
        }
      case e.LEFT:
      case e.RIGHT:
      case e.UP:
      case e.DOWN:
        {
          ctrl.onArrowKey(e);
          break;
        }
      default:
        {
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
  onReset: function() {
    var me = this;

    var flowchart = me.getEditorFlowchart();
    var surface = flowchart.surface;
    if (!surface)
      return;
    surface.removeAll();

    // reset param
    jobbox_surface_state = JOBBOX_STATE_NONE;
    jobbox_surface_mouseDown = false;
    jobbox_surface_x1 = 0;
    jobbox_surface_y1 = 0;
    jobbox_surface_x2 = 0;
    jobbox_surface_y2 = 0;
    jobbox_surface_choiceX = 0;
    jobbox_surface_choiceY = 0;
    jobbox_surface_startpointX = 0;
    jobbox_surface_startpointY = 0;
    jobbox_surface_endpointX = 0;
    jobbox_surface_endpointY = 0;
    jobbox_surface_jobunits = [];
    jobbox_surface_conns = [];
    jobbox_surface_inconns = [];
    jobbox_surface_outconns = [];

    // choice
    surface.add(new Jobbox.draw.Choice()).hide(true);

    // startpoint
    var sprite;
    sprite = surface.add(new Jobbox.draw.StartPoint());
    sprite.on({
      'mousedown': me.onMousedownStartpoint,
    });
    sprite.hide(true);

    // endpoint
    sprite = surface.add(new Jobbox.draw.EndPoint());
    sprite.on({
      'mousedown': me.onMousedownEndpoint
    });
    sprite.hide(true);
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
  onDrawFlowchart: function(record) {
    var me = this;
    me.onReset();

    // draw job
    record['jobbox.model.jobunitsStore'].each(function(job) {
      me.onDrawJob(job);
    });

    // draw connector
    record['jobbox.model.connectorsStore'].each(function(conn) {
      me.onDrawConnector(conn);
    });

    var ctrl = Jobbox.app.getController('common.Jobnet');
    ctrl.onLoadRecord(record);
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
  onArrowKey: function(e) {
    var me = this;
    if (jobbox_surface_state != JOBBOX_STATE_JOB)
      return;

    var flowchart = me.getEditorFlowchart();
    var surface = flowchart.surface;

    var ax = 0,
      ay = 0;
    if (e.getKey() == e.LEFT) ax = -1;
    if (e.getKey() == e.RIGHT) ax = 1;
    if (e.getKey() == e.UP) ay = -1;
    if (e.getKey() == e.DOWN) ay = 1;

    var x = jobbox_surface_x1 + ax;
    var y = jobbox_surface_y1 + ay;

    // move jobunits
    jobbox_surface_jobunits.forEach(function(jobunit) {
      var img = jobunit.getAt(0);
      var record = img.record;
      if (!record)
        return;

      me.onMoveSprite(jobunit, record.data.x, record.data.y, x, y);
      record.set('x', record.data.x + ax);
      record.set('y', record.data.y + ay);
    });

    // move connectors
    jobbox_surface_conns.forEach(function(conn) {
      me.onRedrawConnector(conn, x, y, JOBBOX_CONN_WHOLE);
    });
    jobbox_surface_inconns.forEach(function(conn) {
      me.onRedrawConnector(conn, x, y, JOBBOX_CONN_IN);
    });
    jobbox_surface_outconns.forEach(function(conn) {
      me.onRedrawConnector(conn, x, y, JOBBOX_CONN_OUT);
    });

    // move choice
    if (jobbox_surface_jobunits.length > 0) {
      var choice = surface.getGroup('flowchart_choice');
      me.onMoveSprite(choice, jobbox_surface_choiceX, jobbox_surface_choiceY, x, y);
      jobbox_surface_choiceX += ax;
      jobbox_surface_choiceY += ay;
    }

    jobbox_surface_x1 = x;
    jobbox_surface_y1 = y;
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
  onMousedown: function(e) {
    var me = this;

    if (!jobbox_selected_rootjobnet)
      return;

    var tab = me.getEditorJobunittab();
    tab.setActiveTab('comm_jobnet');

    var flowchart = me.getEditorFlowchart();
    var surface = flowchart.surface;

    surface.getGroup('flowchart_startpoint').hide(true);
    surface.getGroup('flowchart_endpoint').hide(true);
    surface.getGroup('flowchart_inpoint').hide(true);
    surface.getGroup('flowchart_outpoint').hide(true);
    surface.getGroup('flowchart_branchpoint').hide(true);

    jobbox_surface_mouseDown = true;
    jobbox_surface_x1 = e.getX() - flowchart.getX();
    jobbox_surface_y1 = e.getY() - flowchart.getY();
    jobbox_surface_x2 = 0;
    jobbox_surface_y2 = 0;

    var choice = surface.getGroup('flowchart_choice');
    if (jobbox_surface_state == JOBBOX_STATE_JOB) {
      var bbox = choice.getBBox();
      if (jobbox_surface_x1 >= bbox.x && jobbox_surface_x1 <= (bbox.x + bbox.width) && jobbox_surface_y1 >= bbox.y && jobbox_surface_y1 <= (bbox.y + bbox.height)) {
        jobbox_surface_choiceX = bbox.x;
        jobbox_surface_choiceY = bbox.y;
        return;
      }
    }

    if (jobbox_surface_state == JOBBOX_STATE_NONE) {
      choice.setAttributes({
        width: 1,
        height: 1,
        x: jobbox_surface_x1,
        y: jobbox_surface_y1
      });
      choice.show(true);
      return;
    }

    choice.hide(true);
    jobbox_surface_state = JOBBOX_STATE_NONE;
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
  onMousemove: function(e) {
    var me = this;
    var flowchart = me.getEditorFlowchart();
    var surface = flowchart.surface;

    if (!jobbox_surface_mouseDown)
      return;

    var x = e.getX() - flowchart.getX();
    var y = e.getY() - flowchart.getY();

    // show choice
    if (jobbox_surface_state == JOBBOX_STATE_NONE) {
      var choice = surface.getGroup('flowchart_choice');
      var cx = jobbox_surface_x1;
      var cy = jobbox_surface_y1;
      var width = x - jobbox_surface_x1;
      var height = y - jobbox_surface_y1;

      if (x < jobbox_surface_x1) {
        cx = x;
        width = jobbox_surface_x1 - x;
      }
      if (y < jobbox_surface_y1) {
        cy = y;
        height = jobbox_surface_y1 - y;
      }

      choice.setAttributes({
        width: width,
        height: height,
        x: cx,
        y: cy
      });
      choice.show(true);
      return;
    }

    // check editing
    if (!jobbox_selected_rootjobnet)
      return;
    if (jobbox_login_user.data.id != jobbox_selected_rootjobnet.data.user_id)
      return;

    switch (jobbox_surface_state) {
      case JOBBOX_STATE_STARTPOINT:
        {
          var sprite = surface.getGroup('flowchart_startpoint');
          var record = sprite.getAt(0).attr.record;
          var points = surface.getGroup('flowchart_outpoint');
          if (record.data.kind == CONNECTOR_KIND_BRANCH) {
            points = surface.getGroup('flowchart_branchpoint');
          }
          points.show(true);

          var spriteX = sprite.getBBox().x;
          var spriteY = sprite.getBBox().y;
          sprite.setAttributes({
            fill: 'yellow'
          }, true);

          points.getRange().every(function(point) {
            var px = point.getBBox().x;
            var py = point.getBBox().y;
            if (spriteX >= px - 8 && spriteX <= px + 16 && spriteY >= py - 8 && spriteY <= py + 16) {
              sprite.setAttributes({
                fill: 'orange'
              }, true);
              return false;
            };
            return true;
          });

          jobbox_surface_outconns.forEach(function(conn) {
            me.onRedrawConnector(conn, x, y, JOBBOX_CONN_OUT);
          });
          me.onMoveSprite(sprite, jobbox_surface_startpointX, jobbox_surface_startpointY, x, y);
          break;
        }
      case JOBBOX_STATE_ENDPOINT:
      case JOBBOX_STATE_NEWCONN:
        {
          var sprite = surface.getGroup('flowchart_endpoint');
          var record = sprite.getAt(0).attr.record;
          var points = surface.getGroup('flowchart_inpoint');
          points.show(true);

          var spriteX = sprite.getBBox().x;
          var spriteY = sprite.getBBox().y;
          sprite.setAttributes({
            fill: 'yellow'
          }, true);

          points.getRange().every(function(point) {
            var px = point.getBBox().x;
            var py = point.getBBox().y;
            if (spriteX >= px - 8 && spriteX <= px + 16 && spriteY >= py - 8 && spriteY <= py + 16) {
              sprite.setAttributes({
                fill: 'orange'
              }, true);
              return false;
            };
            return true;
          });

          jobbox_surface_inconns.forEach(function(conn) {
            me.onRedrawConnector(conn, x, y, JOBBOX_CONN_IN);
          });
          me.onMoveSprite(sprite, jobbox_surface_endpointX, jobbox_surface_endpointY, x, y);
          break;
        }
      case JOBBOX_STATE_CONNECTOR:
        {
          break;
        }
      case JOBBOX_STATE_JOB:
        {
          // move jobunits
          jobbox_surface_jobunits.forEach(function(jobunit) {
            var record = jobunit.getAt(0).record;
            me.onMoveSprite(jobunit, record.data.x, record.data.y, x, y);
          });

          // move connectors
          jobbox_surface_conns.forEach(function(conn) {
            me.onRedrawConnector(conn, x, y, JOBBOX_CONN_WHOLE);
          });
          jobbox_surface_inconns.forEach(function(conn) {
            me.onRedrawConnector(conn, x, y, JOBBOX_CONN_IN);
          });
          jobbox_surface_outconns.forEach(function(conn) {
            me.onRedrawConnector(conn, x, y, JOBBOX_CONN_OUT);
          });

          // move choice
          if (jobbox_surface_jobunits.length > 0) {
            var choice = surface.getGroup('flowchart_choice');
            me.onMoveSprite(choice, jobbox_surface_choiceX, jobbox_surface_choiceY, x, y);
          }
          break;
        }
      default:
        {
          break;
        }
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
  onMouseup: function(e) {
    var me = this;


    var flowchart = me.getEditorFlowchart();
    var surface = flowchart.surface;

    jobbox_surface_x2 = e.getX() - flowchart.getX();
    jobbox_surface_y2 = e.getY() - flowchart.getY();
    jobbox_surface_mouseDown = false;

    if (jobbox_surface_state == JOBBOX_STATE_NONE) {
      me.onSelectJob();
      return;
    }

    if (!jobbox_selected_rootjobnet)
      return;
    if (jobbox_login_user.data.id != jobbox_selected_rootjobnet.data.user_id)
      return;

    switch (jobbox_surface_state) {
      case JOBBOX_STATE_STARTPOINT:
        {
          var sprite = surface.getGroup('flowchart_startpoint');
          var record = sprite.getAt(0).attr.record;
          var points = surface.getGroup('flowchart_outpoint');

          if (record.data.kind == CONNECTOR_KIND_BRANCH) {
            points = surface.getGroup('flowchart_branchpoint');
          }
          points.hide(true);

          var sp_x = sprite.getBBox().x;
          var sp_y = sprite.getBBox().y;
          sprite.setAttributes({
            fill: 'yellow'
          }, true);

          points.getRange().every(function(point) {
            var px = point.getBBox().x;
            var py = point.getBBox().y;
            if (sp_x >= px - 8 && sp_x <= px + 16 && sp_y >= py - 8 && sp_y <= py + 16) {
              if (point.record.data.id == record.data['next_jobid']) {
                // can not connect same job
                return false;
              };
              record.set('prev_jobid', point.record.data.id);
              return false;
            };
            return true;
          });

          jobbox_surface_outconns.forEach(function(conn) {
            me.onUpdateConnector(conn);
          });

          break;
        }
      case JOBBOX_STATE_ENDPOINT:
      case JOBBOX_STATE_NEWCONN:
        {
          var sprite = surface.getGroup('flowchart_endpoint');
          var record = sprite.getAt(0).attr.record;
          surface.getGroup('flowchart_branchpoint').hide(true);
          var points = surface.getGroup('flowchart_inpoint');
          points.hide(true);
          var sp_x = sprite.getBBox().x;
          var sp_y = sprite.getBBox().y;
          sprite.setAttributes({
            fill: 'yellow'
          }, true);

          points.getRange().every(function(point) {
            var px = point.getBBox().x;
            var py = point.getBBox().y;
            if (sp_x >= px - 8 && sp_x <= px + 16 && sp_y >= py - 8 && sp_y <= py + 16) {
              if (point.record.data.id == record.data['prev_jobid']) {
                // can not connect same job
                return false;
              };
              record.set('next_jobid', point.record.data.id);
              return false;
            };
            return true;
          });
          if (jobbox_surface_state == JOBBOX_STATE_NEWCONN) {
            jobbox_surface_inconns.forEach(function(conn) {
              conn.destroy();
            });
            jobbox_surface_inconns = [];
            surface.getGroup('flowchart_startpoint').hide(true);
            surface.getGroup('flowchart_endpoint').hide(true);
            record.setId(null);
            record.data.jobunit_id = jobbox_selected_parent.data.id;
            if (!(record.data.prev_jobid == 0 || record.data.next_jobid == 0)) {
              record.save({
                success: function(rec, operation) {
                  var res = JSON.parse(operation.response.responseText);
                  if (res.success && res.id) rec.setId(res.id);
                  var c = me.onDrawConnector(rec).getAt(0);
                  surface.getGroup('flowchart_choice').hide(true);
                  c.fireEvent('click', c);
                  jobbox_selected_parent['jobbox.model.connectorsStore'].add(rec);
                }
              });
            };
          } else {
            jobbox_surface_inconns.forEach(function(conn) {
              me.onUpdateConnector(conn);
            });
          }
          break;
        }
      case JOBBOX_STATE_JOB:
        {
          jobbox_surface_jobunits.forEach(function(jobunit) {
            var img = jobunit.getAt(0);
            if (img.record) {
              img.record.set('x', img.getBBox().x);
              img.record.set('y', img.getBBox().y);
            }
          });
          break;
        }
      default:
        {
          break;
        }
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
  onDblclick: function(e) {
    var me = this;

    if (jobbox_surface_state != JOBBOX_STATE_JOB)
      return;

    var jobunit = jobbox_surface_jobunits[0];
    if (!jobunit)
      return;

    var record = jobunit.getAt(0).record;
    if (!record)
      return;
    if (record.data.kind != JOBUNIT_KIND_JOBNET)
      return;

    me.onReset();
    var ctrl = Jobbox.app.getController('editor.Tree');
    ctrl.onLoadJobunit(record.data.id);
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
  onCopyJobunit: function() {
    var me = this;

    jobbox_selected_jobunits = [];
    jobbox_selected_conns = [];
    if (jobbox_surface_state != JOBBOX_STATE_JOB)
      return;

    // jobunis
    jobbox_surface_jobunits.forEach(function(jobunit) {
      var record = jobunit.getAt(0).record;
      if (!record)
        return;
      if (record.data.kind == JOBUNIT_KIND_STARTJOB || record.data.kind == JOBUNIT_KIND_ENDJOB)
        return;
      var rec = new Jobbox.model.Jobunit(record.data);
      jobbox_selected_jobunits.push(rec);
    });

    // connectors
    jobbox_surface_conns.forEach(function(conn) {
      var record = conn.getAt(0).record;
      if (!record)
        return;
      jobbox_selected_conns.push(new Jobbox.model.Connector(record.data));
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
  onPasteJobunit: function(button, e) {
    var me = this;

    // check editing
    if (!jobbox_selected_parent)
      return;
    if (jobbox_selected_parent.data.kind < JOBUNIT_KIND_ROOTJOBNET)
      return;

    if (jobbox_selected_jobunits.length == 0)
      return;

    var cnt = 0;
    jobbox_selected_jobunits.forEach(function(record) {
      if (record.data.kind < JOBUNIT_KIND_ROOTJOBNET) {
        cnt++;
        return;
      }

      var child = new Jobbox.model.JobunitChild(record.data);
      child.set('parent_id', jobbox_selected_parent.data.id);
      if (record.data.kind < JOBUNIT_KIND_JOBNET)
        child.set('kind', JOBUNIT_KIND_JOBNET);

      if (record.data.parent_id == jobbox_selected_parent.data.id) {
        child.set('x', record.data.x + 40);
        child.set('y', record.data.y + 40);
      }
      var name = JobboxMakeName(jobbox_selected_parent['jobbox.model.jobunitsStore'], record.data.name, 'copy');
      child.set('name', name);

      jobbox_mask.show();
      child.save({
        callback: function(record, operation, success) {
          cnt++;
          if (success) {
            var data = Ext.JSON.decode(operation.response.responseText);
            jobbox_selected_conns.forEach(function(conn) {
              conn.setId(null);
              conn.set('jobunit_id', jobbox_selected_parent.data.id);
              if (conn.data.prev_jobid == record.data.id) {
                conn.set('prev_jobid', data.id);
              }
              if (conn.data.next_jobid == record.data.id) {
                conn.set('next_jobid', data.id);
              }
            });
          }
          if (cnt < jobbox_selected_jobunits.length)
            return;

          var ctrl = Jobbox.app.getController('editor.Tree');
          if (jobbox_selected_conns.length == 0) {
            ctrl.onLoadJobunit(jobbox_selected_parent.data.id);
            return;
          }
          var store = jobbox_selected_parent['jobbox.model.connectorsStore'];

          jobbox_selected_conns.forEach(function(conn) {
            store.add(conn);
          });
          store.sync({
            callback: function() {
              ctrl.onLoadJobunit(jobbox_selected_parent.data.id);
            },
          });
        }
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
  onDeleteJobunit: function() {
    var me = this;

    // check editing
    if (!jobbox_selected_rootjobnet)
      return;
    if (jobbox_login_user.data.id != jobbox_selected_rootjobnet.data.user_id)
      return;

    // check surface state
    if (!(jobbox_surface_state == JOBBOX_STATE_JOB || jobbox_surface_state == JOBBOX_STATE_CONNECTOR))
      return;

    // check jobnet
    if (!jobbox_selected_parent)
      return;
    var store_jobunit = jobbox_selected_parent['jobbox.model.jobunitsStore'];
    var store_conn = jobbox_selected_parent['jobbox.model.connectorsStore'];

    // delete jobunits
    jobbox_surface_jobunits.forEach(function(jobunit) {
      var record = jobunit.getAt(0).record;
      if (record.data.kind == JOBUNIT_KIND_STARTJOB || record.data.kind == JOBUNIT_KIND_ENDJOB)
        return;
      store_jobunit.remove(record);
    });

    // delete connectors
    jobbox_surface_conns.forEach(function(conn) {
      var record = conn.getAt(0).record;
      store_conn.remove(record);
    });
    jobbox_surface_inconns.forEach(function(conn) {
      var record = conn.getAt(0).record;
      store_conn.remove(record);
    });
    jobbox_surface_outconns.forEach(function(conn) {
      var record = conn.getAt(0).record;
      store_conn.remove(record);
    });

    // redraw flowchart
    me.onDrawFlowchart(jobbox_selected_parent);
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
  onDrawJob: function(record) {
    var me = this;
    var flowchart = me.getEditorFlowchart();
    var surface = flowchart.surface;
    surface.add(new Jobbox.draw.Job(record));

    var group = surface.getGroup('spritegroup_' + record.data.id);
    group.on({
      'mousedown': me.onMousedownJob,
    });
    group.show(true);

    var point = surface.getGroup('spriteinpoint_' + record.data.id);
    point.hide(true);

    point = surface.getGroup('spriteoutpoint_' + record.data.id);
    point.hide(true);
    point.on({
      'mousedown': me.onMousedownOutpoint,
    });
    point = surface.getGroup('spritebranchpoint_' + record.data.id);
    point.hide(true);
    point.on({
      'mousedown': me.onMousedownOutpoint,
    });

    return group;
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
  onMousedownJob: function(sprite, t) {
    var me = this;
    var surface = sprite.surface;
    var record = sprite.record;

    var spritegroup = surface.getGroup('spritegroup_' + record.data.id);
    if (!spritegroup)
      return;

    // select jobunit
    var ctrl = Jobbox.app.getController('editor.Flowchart');
    jobbox_surface_jobunits = [];
    jobbox_surface_jobunits.push(spritegroup);
    spritegroup.show(true);

    // select related connectors
    ctrl.onSelectConnector();

    //　show choice sprite
    ctrl.onShowChoice();

    // load jobunit record data
    ctrl = Jobbox.app.getController('editor.JobunitTab');
    ctrl.onLoadJobunit(record);
    jobbox_surface_state = JOBBOX_STATE_JOB;
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
  onSelectJob: function() {
    var me = this;
    var flowchart = me.getEditorFlowchart();
    var surface = flowchart.surface;
    var choice = surface.getGroup('flowchart_choice');

    choice.hide(true);
    if (!jobbox_selected_parent)
      return;

    var x1 = jobbox_surface_x1;
    var y1 = jobbox_surface_y1;
    var x2 = jobbox_surface_x2;
    var y2 = jobbox_surface_y2;

    if (jobbox_surface_x1 > jobbox_surface_x2) {
      x1 = jobbox_surface_x2;
      x2 = jobbox_surface_x1;
    }
    if (jobbox_surface_y1 > jobbox_surface_y2) {
      y1 = jobbox_surface_y2;
      y2 = jobbox_surface_y1;
    }

    // choice is too small
    if ((x2 - x1) < JOBBOX_DRAW_WIDTH * 2 || (y2 - y1) < JOBBOX_DRAW_WIDTH * 2)
      return;

    // reset list
    jobbox_surface_jobunits = [];
    jobbox_surface_conns = [];
    jobbox_surface_inconns = [];
    jobbox_surface_outconns = [];

    // search jobunit
    jobbox_selected_parent['jobbox.model.jobunitsStore'].each(function(jobunit) {
      if (jobunit.data.x > x1 && jobunit.data.x < x2 && jobunit.data.y > y1 && jobunit.data.y < y2) {
        var spritegroup = surface.getGroup('spritegroup_' + jobunit.data.id);
        jobbox_surface_jobunits.push(spritegroup);
        spritegroup.show(true);
      }
    });
    if (jobbox_surface_jobunits.length == 0)
      return;

    // select related connectors
    var ctrl = Jobbox.app.getController('editor.Flowchart');
    ctrl.onSelectConnector();

    //　show choice sprite
    ctrl.onShowChoice();
    jobbox_surface_state = JOBBOX_STATE_JOB;
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
  onRedrawJob: function(record) {
    var me = this;

    // check editing
    if (!jobbox_selected_rootjobnet)
      return;
    if (jobbox_login_user.data.id != jobbox_selected_rootjobnet.data.user_id)
      return;

    if (!record)
      return;

    var me = this;
    var flowchart = me.getEditorFlowchart();
    var surface = flowchart.surface;
    var text = surface.getGroup('spritetext_' + record.data.id);
    if (text) {
      text.setAttributes({
        text: record.data.name,
        translate: {
          x: JOBBOX_DRAW_WIDTH - record.data.name.length * 3,
          y: 2 * JOBBOX_DRAW_WIDTH + 5
        },
      }, true);
    };

    var hold = surface.getGroup('spritehold_' + record.data.id);
    if (hold) {
      hold.setAttributes({
        opacity: (record.data.hold) ? 1 : 0,
      }, true);
    };

    var skip = surface.getGroup('spriteskip_' + record.data.id);
    if (skip) {
      skip.setAttributes({
        opacity: (record.data.skip) ? 1 : 0,
      }, true);
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
  onCreateJob: function(record) {
    var me = this;
    var flowchart = me.getEditorFlowchart();
    var surface = flowchart.surface;
    var store = jobbox_selected_parent['jobbox.model.jobunitsStore'];
    if (!store)
      return;

    record.save({
      success: function(rec, operation) {
        var res = JSON.parse(operation.response.responseText);
        rec.setId(res.id);
        var job = me.onDrawJob(rec).getAt(0);
        store.add(rec);
        job.fireEvent('mousedown', job);
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
  onDrawConnector: function(record) {
    var me = this;
    var flowchart = me.getEditorFlowchart();
    var surface = flowchart.surface;
    var store = jobbox_selected_parent['jobbox.model.jobunitsStore'];
    var prev_job = store.getById(record.data.prev_jobid)
    var next_job = store.getById(record.data.next_jobid);

    var connector = new Jobbox.draw.Connector(record, prev_job, next_job);
    surface.add(connector);
    var sprites = surface.getGroup('spriteconn_' + record.data.id);
    sprites.on({
      'click': me.onClickConnector
    });
    sprites.show(true);
    return sprites;
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
  onClickConnector: function(conn, t) {
    var me = this;

    // check editing
    if (!jobbox_selected_rootjobnet)
      return;
    if (jobbox_login_user.data.id != jobbox_selected_rootjobnet.data.user_id)
      return;

    // reset list
    jobbox_surface_jobunits = [];
    jobbox_surface_conns = [];
    jobbox_surface_inconns = [];
    jobbox_surface_outconns = [];

    var surface = conn.surface;
    var record = conn.record;
    var prev_job = conn.prev_job;
    var next_job = conn.next_job;

    // select connector
    var spriteconn = surface.getGroup('spriteconn_' + record.data.id);
    jobbox_surface_inconns.push(spriteconn);
    jobbox_surface_outconns.push(spriteconn);

    // calc startpoint and endpoint pos
    var x1, y1, x2, y2;
    if (record.data.kind == CONNECTOR_KIND_NORMAL) {
      x1 = prev_job.data.x + JOBBOX_DRAW_WIDTH * 2;
      y1 = prev_job.data.y + JOBBOX_DRAW_WIDTH;
    } else
    if (record.data.kind == CONNECTOR_KIND_BRANCH) {
      x1 = prev_job.data.x + JOBBOX_DRAW_WIDTH;
      y1 = prev_job.data.y + JOBBOX_DRAW_WIDTH * 2;
    }
    x2 = next_job.data.x;
    y2 = next_job.data.y + JOBBOX_DRAW_WIDTH;
    var ctrl = Jobbox.app.getController('editor.Flowchart');
    ctrl.onShowConnpoint(record, x1, y1, x2, y2);

    jobbox_surface_state = JOBBOX_STATE_CONNECTOR;
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
  onSelectConnector: function() {
    var me = this;
    var flowchart = me.getEditorFlowchart();
    var surface = flowchart.surface;

    if (!jobbox_selected_parent)
      return;

    // reset list
    jobbox_surface_conns = [];
    jobbox_surface_inconns = [];
    jobbox_surface_outconns = [];

    // list jobunit id 
    var jobunit_ids = [];
    jobbox_surface_jobunits.forEach(function(jobunit) {
      var record = jobunit.getAt(0).record;
      if (!record)
        return;
      jobunit_ids.push(record.data.id);
    });
    if (jobunit_ids.length == 0)
      return;

    // search connector
    var store = jobbox_selected_parent['jobbox.model.connectorsStore'];
    store.each(function(conn) {
      var idx_prev = jobunit_ids.indexOf(conn.data.prev_jobid);
      var idx_next = jobunit_ids.indexOf(conn.data.next_jobid);
      if (idx_prev < 0 && idx_next < 0)
        return;

      var spriteconn = surface.getGroup('spriteconn_' + conn.data.id);
      if (idx_prev >= 0 && idx_next >= 0) {
        jobbox_surface_conns.push(spriteconn);
      } else
      if (idx_prev >= 0) {
        jobbox_surface_outconns.push(spriteconn);
      } else
      if (idx_next >= 0) {
        jobbox_surface_inconns.push(spriteconn);
      };
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
  onRedrawConnector: function(conn, x, y, flag) {
    var me = this;

    // check editing
    if (!jobbox_selected_rootjobnet)
      return;
    if (jobbox_login_user.data.id != jobbox_selected_rootjobnet.data.user_id)
      return;

    if (!conn)
      return;
    var arrow = conn.getAt(0);
    var text = conn.getAt(1);
    var prev_job = arrow.prev_job;
    var next_job = arrow.next_job;
    var record = arrow.record;
    var path = arrow.path;

    var x1, y1, x2, y2;
    if (record.data.kind == CONNECTOR_KIND_NORMAL) {
      x1 = prev_job.data.x + JOBBOX_DRAW_WIDTH * 2;
      y1 = prev_job.data.y + JOBBOX_DRAW_WIDTH;
    } else
    if (record.data.kind == CONNECTOR_KIND_BRANCH) {
      x1 = prev_job.data.x + JOBBOX_DRAW_WIDTH;
      y1 = prev_job.data.y + JOBBOX_DRAW_WIDTH * 2;
    }
    if (next_job) {
      x2 = next_job.data.x;
      y2 = next_job.data.y + JOBBOX_DRAW_WIDTH;
    } else {
      x2 = x1;
      y2 = y1;
    }

    if (flag == JOBBOX_CONN_WHOLE) {
      x1 += x - jobbox_surface_x1;
      y1 += y - jobbox_surface_y1;
      x2 += x - jobbox_surface_x1;
      y2 += y - jobbox_surface_y1;
    } else
    if (flag == JOBBOX_CONN_IN) {
      x2 += x - jobbox_surface_x1;
      y2 += y - jobbox_surface_y1;
    } else
    if (flag == JOBBOX_CONN_OUT) {
      x1 += x - jobbox_surface_x1;
      y1 += y - jobbox_surface_y1;
    }

    path = JobboxDrawArrow(x1, y1, x2, y2, record.data.kind);
    arrow.setAttributes({
      path: path,
    }, true);
    text.setAttributes({
      x: (x1 + x2) / 2 - 10,
      y: (y1 + y2) / 2 + 10,
    }, true);
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
  onUpdateConnector: function(conn) {
    var me = this;

    // check editing
    if (!jobbox_selected_rootjobnet)
      return;
    if (jobbox_login_user.data.id != jobbox_selected_rootjobnet.data.user_id)
      return;

    // check param
    if (!conn)
      return;
    var arrow = conn.getAt(0);
    var text = conn.getAt(1);
    var record = arrow.record;

    if (!jobbox_selected_parent)
      return;
    var store = jobbox_selected_parent['jobbox.model.jobunitsStore'];

    var prev_job = store.getById(record.data.prev_jobid)
    var next_job = store.getById(record.data.next_jobid);

    arrow.prev_job = prev_job;
    arrow.next_job = next_job;
    text.prev_job = prev_job;
    text.next_job = next_job;

    var x1, y1, x2, y2;
    if (record.data.kind == CONNECTOR_KIND_NORMAL) {
      x1 = prev_job.data.x + JOBBOX_DRAW_WIDTH * 2;
      y1 = prev_job.data.y + JOBBOX_DRAW_WIDTH;
    } else
    if (record.data.kind == CONNECTOR_KIND_BRANCH) {
      x1 = prev_job.data.x + JOBBOX_DRAW_WIDTH;
      y1 = prev_job.data.y + JOBBOX_DRAW_WIDTH * 2;
    }
    x2 = next_job.data.x;
    y2 = next_job.data.y + JOBBOX_DRAW_WIDTH;

    arrow.setAttributes({
      path: JobboxDrawArrow(x1, y1, x2, y2, record.data.kind),
    }, true);
    text.setAttributes({
      x: (x1 + x2) / 2 - 10,
      y: (y1 + y2) / 2 + 10,
    }, true);

    me.onShowConnpoint(record, x1, y1, x2, y2);
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
  onShowChoice: function() {
    var me = this;

    if (jobbox_surface_jobunits.length == 0)
      return;

    var minX = 1000000;
    var minY = 1000000;
    var maxX = 0;
    var maxY = 0
    jobbox_surface_jobunits.forEach(function(jobunit) {
      var bbox = jobunit.getBBox();
      if (bbox.x < minX)
        minX = bbox.x;
      if ((bbox.x + bbox.width) > maxX)
        maxX = bbox.x + bbox.width;
      if (bbox.y < minY)
        minY = bbox.y;
      if ((bbox.y + bbox.height) > maxY)
        maxY = bbox.y + bbox.height;
    });

    jobbox_surface_choiceX = minX - 1;
    jobbox_surface_choiceY = minY - 1;

    var flowchart = me.getEditorFlowchart();
    var surface = flowchart.surface;
    var choice = surface.getGroup('flowchart_choice');
    choice.setAttributes({
      width: maxX - minX + 2,
      height: maxY - minY + 2,
      x: jobbox_surface_choiceX,
      y: jobbox_surface_choiceY
    });
    choice.show(true);
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
  onMoveSprite: function(sprite, x1, y1, x2, y2) {
    var me = this;

    // check editing
    if (!jobbox_selected_rootjobnet)
      return;
    if (jobbox_login_user.data.id != jobbox_selected_rootjobnet.data.user_id)
      return;

    sprite.setAttributes({
      x: x1 + (x2 - jobbox_surface_x1),
      y: y1 + (y2 - jobbox_surface_y1),
    });
    sprite.show(true);
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
  onShowConnpoint: function(record, x1, y1, x2, y2) {
    var me = this;
    var flowchart = me.getEditorFlowchart();
    var surface = flowchart.surface;

    // reset connpoit pos
    jobbox_surface_startpointX = x1;
    jobbox_surface_startpointY = y1;
    jobbox_surface_endpointX = x2;
    jobbox_surface_endpointY = y2;

    // show start_point
    var start_point = surface.getGroup('flowchart_startpoint');
    start_point.setAttributes({
      record: record,
      x: x1,
      y: y1
    });
    start_point.show(true);

    // show end_point
    var end_point = surface.getGroup('flowchart_endpoint');
    end_point.setAttributes({
      record: record,
      x: x2,
      y: y2
    });
    end_point.show(true);
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
  onMousedownStartpoint: function(point, t) {
    var me = this;
    point.show(true);
    var surface = point.surface;
    surface.getGroup('flowchart_endpoint').show(true);
    jobbox_surface_state = JOBBOX_STATE_STARTPOINT;
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
  onMousedownEndpoint: function(point, t) {
    var me = this;
    point.show(true);
    var surface = point.surface;
    surface.getGroup('flowchart_startpoint').show(true);
    jobbox_surface_state = JOBBOX_STATE_ENDPOINT;
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
  onMousedownOutpoint: function(point, t) {
    var me = this;

    // check editing
    if (!jobbox_selected_rootjobnet)
      return;
    if (jobbox_login_user.data.id != jobbox_selected_rootjobnet.data.user_id)
      return;

    if (!jobbox_selected_parent)
      return;

    // reset list
    jobbox_surface_jobunits = [];
    jobbox_surface_conns = [];
    jobbox_surface_inconns = [];
    jobbox_surface_outconns = [];

    // set param
    var surface = point.surface;
    var x = jobbox_surface_x1;
    var y = jobbox_surface_y1;
    var prev_job = point.record;
    var id = 0;

    // create new connector record
    var store = jobbox_selected_parent['jobbox.model.connectorsStore'];
    while (true) {
      id = 1 + Math.floor(Math.random() * 10000);
      if (!store.getById(id)) break;
    };
    var record = new Jobbox.model.Connector({
      id: id,
      jobunit_id: jobbox_selected_parent.data.id,
      kind: point.kind,
      prev_jobid: prev_job.data.id,
      next_jobid: 0,
    });

    // draw new connector
    var ctrl = Jobbox.app.getController('editor.Flowchart');
    var group = ctrl.onDrawConnector(record);
    jobbox_surface_inconns.push(group);
    ctrl.onShowConnpoint(record, x, y, x, y);

    jobbox_surface_state = JOBBOX_STATE_NEWCONN;
  },
});
