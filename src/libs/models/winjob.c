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
#include "charset.h"
#include "jbxlog.h"
#include "jbxdb.h"
#include "models.h"
#include "jbxwsman.h"

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
winjob_t *winjob_new(void)
{
    winjob_t *obj;

    jbxlog_trace("In %s()", __func__);
    obj = (winjob_t *) malloc(sizeof(winjob_t));
    obj->host = NULL;
    obj->user = NULL;
    obj->password = NULL;
    obj->scheme = NULL;
    obj->path = NULL;
    obj->auth = NULL;
    obj->command = NULL;
    winjob_init(obj);

    return obj;
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
void winjob_destroy(winjob_t * obj)
{
    jbxlog_trace("In %s()", __func__);
    if (obj == NULL)
        return;

    winjob_init(obj);
    jbx_free(obj);

    obj = NULL;
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
int winjob_init(winjob_t * obj)
{
    jbxlog_trace("In %s()", __func__);
    if (obj == NULL)
        return -1;

    jbx_free(obj->host);
    jbx_free(obj->user);
    jbx_free(obj->password);
    jbx_free(obj->scheme);
    jbx_free(obj->path);
    jbx_free(obj->auth);
    jbx_free(obj->command);

    obj->id = 0;
    obj->jobunit_id = 0;
    obj->proc_jobunit_id = 0;
    obj->hist_jobunit_id = 0;
    obj->host = NULL;
    obj->user = NULL;
    obj->password = NULL;
    obj->scheme = NULL;
    obj->port = 0;
    obj->path = NULL;
    obj->auth = NULL;
    obj->codepage = 0;
    obj->command = NULL;

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
int winjob_load(winjob_t * obj, dbi_result res)
{
    jbxlog_trace("In %s()", __func__);
    if (obj == NULL || res == NULL)
        return -1;

    winjob_init(obj);

    obj->id = dbi_result_get_ulonglong(res, "id");
    obj->jobunit_id = dbi_result_get_ulonglong(res, "jobunit_id");
    obj->proc_jobunit_id =
        dbi_result_get_ulonglong(res, "proc_jobunit_id");
    obj->hist_jobunit_id =
        dbi_result_get_ulonglong(res, "hist_jobunit_id");

    obj->host = jbxdb_get_string(res, "host");
    obj->user = jbxdb_get_string(res, "user");
    obj->password = jbxdb_get_string(res, "password");
    obj->scheme = jbxdb_get_string(res, "scheme");
    obj->port = dbi_result_get_int(res, "port");
    obj->path = jbxdb_get_string(res, "path");
    obj->auth = jbxdb_get_string(res, "auth");
    obj->codepage = dbi_result_get_int(res, "codepage");
    obj->command = jbxdb_get_string(res, "command");

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
int winjob_load_one(winjob_t * obj, dbi_result res)
{
    apr_uint64_t num;

    jbxlog_trace("In %s()", __func__);
    if (obj == NULL || res == NULL)
        return -1;

    num = dbi_result_get_numrows(res);
    if (num != 1) {
        jbxlog_warn("In %s() can not find winjob. numrows: %llu",
                    __func__, num);
        return 1;
    }

    while (dbi_result_next_row(res)) {
        winjob_load(obj, res);
        break;
    }

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
int winjob_select(winjob_t * obj, const apr_uint64_t jobunit_id)
{
    int rc;
    dbi_result result = NULL;

    jbxlog_debug("In %s() jobunit_id: %llu", __func__, jobunit_id);

    result =
        jbxdb_select("SELECT * FROM winjobs WHERE jobunit_id = %llu",
                     jobunit_id);
    if (result == NULL)
        return -1;

    rc = winjob_load_one(obj, result);

    dbi_result_free(result);
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
int proc_winjob_select(winjob_t * obj, const apr_uint64_t proc_jobunit_id)
{
    int rc;
    dbi_result result = NULL;

    jbxlog_debug("In %s() proc_jobunit_id: %llu", __func__,
                 proc_jobunit_id);

    result =
        jbxdb_select
        ("SELECT * FROM proc_winjobs WHERE proc_jobunit_id = %llu",
         proc_jobunit_id);
    if (result == NULL)
        return -1;

    rc = winjob_load_one(obj, result);

    dbi_result_free(result);
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
int hist_winjob_select(winjob_t * obj, const apr_uint64_t hist_jobunit_id)
{
    int rc;
    dbi_result result = NULL;

    jbxlog_debug("In %s() hist_jobunit_id: %llu", __func__,
                 hist_jobunit_id);

    result =
        jbxdb_select
        ("SELECT * FROM hist_winjobs WHERE hist_jobunit_id = %llu",
         hist_jobunit_id);
    if (result == NULL)
        return -1;

    rc = winjob_load_one(obj, result);

    dbi_result_free(result);
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
apr_uint64_t proc_winjob_insert(winjob_t * obj)
{
    apr_uint64_t id;
    char *esc_host = NULL;
    char *esc_user = NULL;
    char *esc_password = NULL;
    char *esc_scheme = NULL;
    char *esc_path = NULL;
    char *esc_auth = NULL;
    char *esc_command = NULL;

    jbxlog_trace("In %s()", __func__);
    if (obj == NULL)
        return 0;

    // escape strinq
    esc_host = jbxdb_escape_string(obj->host);
    esc_user = jbxdb_escape_string(obj->user);
    esc_password = jbxdb_escape_string(obj->password);
    esc_scheme = jbxdb_escape_string(obj->scheme);
    esc_path = jbxdb_escape_string(obj->path);
    esc_auth = jbxdb_escape_string(obj->auth);
    esc_command = jbxdb_escape_string(obj->command);

    id = jbxdb_insert
        ("INSERT INTO proc_winjobs(proc_jobunit_id, host, user, password, scheme, port, path, auth, codepage, command) \
VALUES(%llu, '%s', '%s', '%s', '%s', %d, '%s', '%s', %d, '%s')",
         obj->proc_jobunit_id, esc_host, esc_user, esc_password, esc_scheme, obj->port, esc_path, esc_auth, obj->codepage, esc_command);
    obj->id = id;

    jbx_free(esc_host);
    jbx_free(esc_user);
    jbx_free(esc_password);
    jbx_free(esc_scheme);
    jbx_free(esc_path);
    jbx_free(esc_auth);
    jbx_free(esc_command);

    return id;
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
apr_uint64_t hist_winjob_insert(winjob_t * obj)
{
    apr_uint64_t id;
    char *esc_host = NULL;
    char *esc_user = NULL;
    char *esc_password = NULL;
    char *esc_scheme = NULL;
    char *esc_path = NULL;
    char *esc_auth = NULL;
    char *esc_command = NULL;

    jbxlog_trace("In %s()", __func__);
    if (obj == NULL)
        return 0;

    // escape strinq
    esc_host = jbxdb_escape_string(obj->host);
    esc_user = jbxdb_escape_string(obj->user);
    esc_password = jbxdb_escape_string(obj->password);
    esc_scheme = jbxdb_escape_string(obj->scheme);
    esc_path = jbxdb_escape_string(obj->path);
    esc_auth = jbxdb_escape_string(obj->auth);
    esc_command = jbxdb_escape_string(obj->command);

    id = jbxdb_insert
        ("INSERT INTO hist_winjobs(hist_jobunit_id, host, user, password, scheme, port, path, auth, codepage, command) \
VALUES(%llu, '%s', '%s', '%s', '%s', %d, '%s', '%s', %d, '%s')",
         obj->hist_jobunit_id, esc_host, esc_user, esc_password, esc_scheme, obj->port, esc_path, esc_auth, obj->codepage, esc_command);
    obj->id = id;

    jbx_free(esc_host);
    jbx_free(esc_user);
    jbx_free(esc_password);
    jbx_free(esc_scheme);
    jbx_free(esc_path);
    jbx_free(esc_auth);
    jbx_free(esc_command);

    return id;
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
int winjob_put_process(const apr_uint64_t jobunit_id,
                       const apr_uint64_t proc_jobunit_id)
{
    int rc;
    winjob_t *obj = NULL;

    jbxlog_debug("In %s() jobunit_id: %llu, proc_jobunit_id: %llu",
                 __func__, jobunit_id, proc_jobunit_id);
    rc = -1;
    obj = winjob_new();

    if (winjob_select(obj, jobunit_id) != 0)
        goto error;

    obj->proc_jobunit_id = proc_jobunit_id;
    if (proc_winjob_insert(obj) == 0)
        goto error;

    rc = 0;
  error:
    winjob_destroy(obj);
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
int winjob_put_history(const apr_uint64_t proc_jobunit_id,
                       const apr_uint64_t hist_jobunit_id)
{
    int rc;
    winjob_t *obj = NULL;

    jbxlog_debug("In %s() proc_jobunit_id: %llu, hist_jobunit_id: %llu",
                 __func__, proc_jobunit_id, hist_jobunit_id);
    rc = -1;
    obj = winjob_new();

    if (proc_winjob_select(obj, proc_jobunit_id) != 0)
        goto error;

    obj->hist_jobunit_id = hist_jobunit_id;
    if (hist_winjob_insert(obj) == 0)
        goto error;

    rc = 0;
  error:
    winjob_destroy(obj);
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
int proc_winjob_delete(const apr_uint64_t proc_jobunit_id)
{
    jbxlog_trace("In %s()", __func__);

    return
        jbxdb_execute
        ("DELETE FROM proc_winjobs WHERE proc_jobunit_id = %llu",
         proc_jobunit_id);
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
int hist_winjob_delete(const apr_uint64_t hist_jobunit_id)
{
    jbxlog_trace("In %s()", __func__);

    return
        jbxdb_execute
        ("DELETE FROM hist_winjobs WHERE hist_jobunit_id = %llu",
         hist_jobunit_id);
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
int winjob_execute(jobunit_t * proc_jobunit)
{
    int rc, rc_win;
    winjob_t *obj = NULL;
    jobresult_t *obj_jobres = NULL;
    jbxwsman_t *obj_wsman = NULL;
    char *var_host;

    if (proc_jobunit == NULL)
        return -1;

    jbxlog_trace("In %s() proc_jobunit_id: %llu, parent_id: %llu",
                 __func__, proc_jobunit->id, proc_jobunit);
    // init
    rc = -1;
    obj = winjob_new();
    obj_jobres = jobresult_new();
    obj_wsman = jbxwsman_new();
    var_host = NULL;

    // load winjob data
    if (proc_winjob_select(obj, proc_jobunit->id) != 0)
        goto error;
    jbxlog_debug("In %s() host: %s, user: %s, command: %s, codepage: %d",
                 __func__, obj->host, obj->user, obj->command,
                 obj->codepage);

    // replace variable
    var_host = variable_replace(proc_jobunit->parent_id, obj->host);
    jbxlog_debug("In %s() replace variable. host: %s", __func__, var_host);

    // create wsman
    if (jbxwsman_set
        (obj_wsman, obj->user, obj->password, obj->scheme, var_host,
         obj->port, obj->path, obj->auth) != 0) {
        execlog_error(proc_jobunit->id, "Failed to create '%s://%s:%d/%s'",
                      obj->scheme, var_host, obj->port, obj->path);
        goto error;
    }
    // wsman exec command
    jbxdb_disconnect();
    rc_win =
        jbxwsman_exec(obj_wsman, obj_jobres, obj->command, obj->codepage);
    jbxdb_connect();
    if (rc_win != 0) {
        execlog_error(proc_jobunit->id, "The command is failed. '%s'",
                      obj_wsman->errmsg);
        goto error;
    }
    // insert job result
    obj_jobres->proc_jobunit_id = proc_jobunit->id;
    if (proc_jobresult_insert(obj_jobres) == 0)
        goto error;

    // check conditions
    rc = jobresult_execute(obj_jobres);

  error:
    jbx_free(var_host);
    jbxwsman_destroy(obj_wsman);
    jobresult_destroy(obj_jobres);
    winjob_destroy(obj);
    return rc;
}
