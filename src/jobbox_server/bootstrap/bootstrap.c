/////////////////////////////////////////////////////////////////////////////////
//
// Jobbox
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

#include "common.h"
#include "jbxlog.h"
#include "jbxdb.h"
#include "models.h"
#include "bootstrap.h"

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
void bootstrap_mainloop(void)
{
    pid_t ppid;

    jbxlog_info("bootstrap start");

    if (jbxdb_connect() != 0) {
        jbxlog_crit("In %s() can not connect database", __func__);
        return;
    }

    while (1) {
        ppid = getppid();
        if (ppid <= 1) {
            jbxlog_debug("In %s() ppid: %d", __func__, ppid);
            break;
        }
        bootstrap_exec();
        sleep(1);
    }

    jbxdb_disconnect();
}

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
int bootstrap_exec(void)
{
    jbxlog_trace("In %s()", __func__);

    // skip topjobnet
    if (bootstrap_skip() != 0)
        return -1;

    // force start topjobnet
    if (bootstrap_forcestart() != 0)
        return -1;

    // immediate run
    if (bootstrap_immediate() != 0)
        return -1;

    // schedule run
    if (bootstrap_topjobnets() != 0)
        return -1;

    // boostrap topjobnet
    if (bootstrap_ready() != 0)
        return -1;

    return 0;
}

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
int bootstrap_skip(void)
{
    int rc;
    char *ts;

    jbxlog_trace("In %s()", __func__);

    jbxdb_begin();
    ts = jbx_time();
    rc = jbxdb_execute
        ("UPDATE proc_topjobnets SET status = %d, start_time = '%s', end_time = '%s', updated_at = '%s' WHERE status = %d AND hold = false AND skip = true",
         JOBUNIT_STATUS_END, ts, ts, ts, JOBUNIT_STATUS_READY);
    jbxdb_commit();

    return rc;
}

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
int bootstrap_forcestart(void)
{
    int rc;

    jbxlog_trace("In %s()", __func__);

    jbxdb_begin();
    rc = jbxdb_execute
        ("UPDATE proc_topjobnets SET status = %d, force_start = false, start_time = NULL, end_time = NULL, updated_at = '%s' WHERE status = %d AND force_start = true",
         JOBUNIT_STATUS_READY, jbx_time(), JOBUNIT_STATUS_STANDBY);
    jbxdb_commit();

    return rc;
}

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
int bootstrap_immediate(void)
{
    int rc;

    jbxlog_trace("In %s()", __func__);

    jbxdb_begin();
    rc = jbxdb_execute
        ("UPDATE proc_topjobnets SET status = %d, start_time = NULL, end_time = NULL, updated_at = '%s' WHERE status = %d AND mode = %d",
         JOBUNIT_STATUS_READY, jbx_time(), JOBUNIT_STATUS_STANDBY,
         TOPJOBNET_MODE_IMMEDIATE);
    jbxdb_commit();

    return rc;
}

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
int bootstrap_topjobnets(void)
{
    int rc_bootstrap;
    apr_uint64_t id;
    jobunit_t *obj = NULL;
    dbi_result result = NULL;

    jbxlog_trace("In %s()", __func__);

    result =
        jbxdb_select
        ("SELECT id FROM proc_topjobnets WHERE status = %d AND mode in (%d, %d)",
         JOBUNIT_STATUS_STANDBY, TOPJOBNET_MODE_SCHEDULE,
         TOPJOBNET_MODE_SPECIFIED);
    if (result == NULL) {
        return -1;
    }

    obj = jobunit_new();
    while (dbi_result_next_row(result)) {
        jbxdb_begin();
        id = dbi_result_get_ulonglong(result, "id");
        if (proc_topjobnet_select(obj, id) != 0) {
            jbxdb_rollback();
            continue;
        }
        if (bootstrap_topjobnet(obj) < 0) {
            jbxdb_rollback();
            continue;
        }
        jbxdb_commit();
    }

    jobunit_destroy(obj);
    dbi_result_free(result);
    return 0;
}

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
int bootstrap_topjobnet(jobunit_t * obj)
{
    time_t now;
    int delay_limit;

    if (obj == NULL)
        return -1;
    jbxlog_trace("In %s() proc_topjobnet id: %llu, status: %d, mode: %d",
                 __func__, obj->id, obj->status, obj->mode);

    if (obj->status != JOBUNIT_STATUS_STANDBY)
        return -1;

    // init
    now = time(NULL);

    // not on schedule
    if (now < obj->schedule_time)
        return 0;

    // out schedule
    delay_limit = 60 * obj->delay_limit;
    if (delay_limit > 0 && (now >= obj->schedule_time + delay_limit))
        return bootstrap_set_outschedule(obj);

    // carry over
    if (obj->mode == TOPJOBNET_MODE_SCHEDULE) {
        switch (obj->run_type) {
        case ROOTJOBNET_RUNTYPE_EXCLUSIVE:
            if (bootstrap_running_num(obj->jobunit_id) > 0)
                return bootstrap_set_carryover(obj);
            break;
        case ROOTJOBNET_RUNTYPE_FULLEXCLUSIVE:
            if (bootstrap_running_error_num(obj->jobunit_id) > 0)
                return bootstrap_set_carryover(obj);
            break;
        case ROOTJOBNET_RUNTYPE_PARALLEL:
            break;
        default:
            jbxlog_error("In %s() unknown run_type: %d", __func__,
                         obj->run_type);
            return -1;
            break;
        }
    }
    // on schedule
    return bootstrap_set_ready(obj->id);
}

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
int bootstrap_running_num(const apr_uint64_t jobunit_id)
{
    int num;
    dbi_result result = NULL;

    jbxlog_debug("In %s() jobunit_id: %llu", __func__, jobunit_id);
    result =
        jbxdb_select
        ("SELECT id FROM proc_topjobnets WHERE status = %d AND jobunit_id = %llu AND mode = %d",
         JOBUNIT_STATUS_RUNNING, jobunit_id, TOPJOBNET_MODE_SCHEDULE);
    if (result == NULL)
        return -1;
    num = (int) dbi_result_get_numrows(result);

    dbi_result_free(result);
    return num;
}

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
int bootstrap_running_error_num(const apr_uint64_t jobunit_id)
{
    int num;
    dbi_result result = NULL;

    jbxlog_debug("In %s() jobunit_id: %llu", __func__, jobunit_id);
    result =
        jbxdb_select
        ("SELECT id FROM proc_topjobnets WHERE status in (%d, %d) AND jobunit_id = %llu AND mode = %d",
         JOBUNIT_STATUS_RUNNING, JOBUNIT_STATUS_ERROR, jobunit_id,
         TOPJOBNET_MODE_SCHEDULE);
    if (result == NULL)
        return -1;
    num = (int) dbi_result_get_numrows(result);

    dbi_result_free(result);
    return num;
}

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
int bootstrap_set_ready(const apr_uint64_t proc_rootjobnet_id)
{
    int rc;

    jbxlog_trace("In %s() proc_rootjobnet_id: %llu", __func__,
                 proc_rootjobnet_id);

    rc = jbxdb_execute
        ("UPDATE proc_topjobnets SET status = %d, start_time = NULL, end_time = NULL, updated_at = '%s' WHERE id = %llu",
         JOBUNIT_STATUS_READY, jbx_time(), proc_rootjobnet_id);

    return rc;
}

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
int bootstrap_set_outschedule(jobunit_t * obj)
{
    int rc;
    char *ts;

    if (obj == NULL)
        return -1;
    jbxlog_warn("In %s() out schedule. proc_topjobnet_id: %llu", __func__,
                obj->id);

    ts = jbx_time();
    rc = jbxdb_execute
        ("UPDATE proc_topjobnets SET status = %d, start_time = '%s', end_time = '%s', updated_at = '%s' WHERE id = %llu",
         JOBUNIT_STATUS_OUTSCHEDULE, ts, ts, ts, obj->id);

    if (rc == 0) {
        obj->status = JOBUNIT_STATUS_OUTSCHEDULE;
        jbxjoblog_jobunit(obj);
    }

    return rc;
}

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
int bootstrap_set_carryover(jobunit_t * obj)
{
    int rc;
    char *ts;

    if (obj == NULL)
        return -1;
    jbxlog_warn("In %s() carry over. proc_topjobnet_id: %llu", __func__,
                obj->id);

    ts = jbx_time();
    rc = jbxdb_execute
        ("UPDATE proc_topjobnets SET status = %d, start_time = '%s', end_time = '%s', updated_at = '%s' WHERE id = %llu",
         JOBUNIT_STATUS_CARRYOVER, ts, ts, ts, obj->id);

    if (rc == 0) {
        obj->status = JOBUNIT_STATUS_CARRYOVER;
        jbxjoblog_jobunit(obj);
    }

    return rc;
}

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
int bootstrap_ready(void)
{
    int rc_db;
    apr_uint64_t id;
    jobunit_t *topjobnet;
    dbi_result result = NULL;
    char *ts;

    jbxlog_trace("In %s()", __func__);
    result =
        jbxdb_select
        ("SELECT id FROM proc_topjobnets WHERE status = %d AND proc_jobunit_id > 0 AND hold = false AND skip = false",
         JOBUNIT_STATUS_READY);
    if (result == NULL)
        return -1;

    topjobnet = jobunit_new();
    while (dbi_result_next_row(result)) {
        id = dbi_result_get_ulonglong(result, "id");

        jbxdb_begin();
        if (proc_topjobnet_select(topjobnet, id) != 0) {
            jbxdb_rollback();
            continue;
        }

        if (!
            (topjobnet->status == JOBUNIT_STATUS_READY
             && topjobnet->hold == 0 && topjobnet->skip == 0)) {
            jbxdb_rollback();
            continue;
        }

        ts = jbx_time();
        // set topjobnet status
        rc_db =
            jbxdb_execute
            ("UPDATE proc_topjobnets SET status = %d, start_time = '%s', end_time = NULL, updated_at = '%s' WHERE id = %llu",
             JOBUNIT_STATUS_RUNNING, ts, ts, id);
        if (rc_db != 0) {
            jbxdb_rollback();
            continue;
        }
        // set rootjobnet status
        rc_db =
            jbxdb_execute
            ("UPDATE proc_jobunits SET status = %d, start_time = NULL, end_time = NULL, updated_at = '%s' WHERE id = %llu",
             JOBUNIT_STATUS_READY, ts, topjobnet->proc_jobunit_id);
        if (rc_db != 0) {
            jbxdb_rollback();
            continue;
        }
        jbxdb_commit();
    }

  finish:
    dbi_result_free(result);
    jobunit_destroy(topjobnet);
    return 0;
}
